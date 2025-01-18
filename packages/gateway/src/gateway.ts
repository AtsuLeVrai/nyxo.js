import { setTimeout } from "node:timers/promises";
import { BitFieldManager } from "@nyxjs/core";
import type { Rest } from "@nyxjs/rest";
import { EventEmitter } from "eventemitter3";
import WebSocket from "ws";
import type { z } from "zod";
import { fromError } from "zod-validation-error";
import {
  type HelloEntity,
  IdentifyEntity,
  type ReadyEntity,
  type RequestGuildMembersEntity,
  type ResumeEntity,
  type UpdatePresenceEntity,
  type UpdateVoiceStateEntity,
} from "./events/index.js";
import { GatewayOptions } from "./options/index.js";
import {
  CompressionService,
  EncodingService,
  HeartbeatService,
  ShardService,
} from "./services/index.js";
import {
  type GatewayCloseCodes,
  type GatewayEvents,
  GatewayOpcodes,
  type GatewayReceiveEvents,
  type GatewaySendEvents,
  type PayloadEntity,
} from "./types/index.js";

const BACKOFF_SCHEDULE = [1000, 5000, 10000];
const ZOMBIED_CONNECTION_THRESHOLD = 2;

export class Gateway extends EventEmitter<GatewayEvents> {
  #reconnectAttempts = 0;
  #sessionId: string | null = null;
  #resumeUrl: string | null = null;
  #ws: WebSocket | null = null;
  #connectStartTime = 0;

  readonly #rest: Rest;
  readonly #options: z.output<typeof GatewayOptions>;
  readonly #compression: CompressionService;
  readonly #encoding: EncodingService;
  readonly #heartbeat: HeartbeatService;
  readonly #shard: ShardService;

  constructor(rest: Rest, options: z.input<typeof GatewayOptions>) {
    super();
    this.#rest = rest;

    try {
      this.#options = GatewayOptions.parse(options);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.#compression = new CompressionService(this.#options);
    this.#encoding = new EncodingService(this.#options);
    this.#heartbeat = new HeartbeatService(this, this.#options);
    this.#shard = new ShardService(this.#options);

    this.#setupEventForwarding(
      this.#heartbeat,
      this.#compression,
      this.#encoding,
      this.#shard,
    );
  }

  get ping(): number {
    return this.#heartbeat.latency;
  }

  get sessionId(): string | null {
    return this.#sessionId;
  }

  get resumeUrl(): string | null {
    return this.#resumeUrl;
  }

  get sequence(): number {
    return this.#heartbeat.sequence;
  }

  get reconnectAttempts(): number {
    return this.#reconnectAttempts;
  }

  get readyState(): number {
    return this.#ws?.readyState ?? WebSocket.CLOSED;
  }

  get webSocket(): WebSocket | null {
    return this.#ws;
  }

  isReconnecting(): boolean {
    return this.#heartbeat.isReconnecting();
  }

  async connect(): Promise<void> {
    try {
      this.#connectStartTime = Date.now();
      this.emit("connecting", this.#reconnectAttempts);

      const [gatewayInfo, guilds] = await Promise.all([
        this.#rest.gateway.getGatewayBot(),
        this.#rest.users.getCurrentUserGuilds(),
      ]);

      await this.#shard.spawn(
        guilds.length,
        gatewayInfo.session_start_limit.max_concurrency,
        gatewayInfo.shards,
      );

      await this.#initializeWebSocket(gatewayInfo.url);
    } catch (error) {
      throw new Error("Failed to connect to the gateway", {
        cause: error,
      });
    }
  }

  updatePresence(presence: UpdatePresenceEntity): void {
    this.emit("debug", `Updating presence: ${JSON.stringify(presence)}`);
    this.send(GatewayOpcodes.PresenceUpdate, presence);
  }

  updateVoiceState(options: UpdateVoiceStateEntity): void {
    this.emit("debug", `Updating voice state for guild ${options.guild_id}`);
    this.send(GatewayOpcodes.VoiceStateUpdate, options);
  }

  requestGuildMembers(options: RequestGuildMembersEntity): void {
    this.emit(
      "debug",
      `Requesting guild members for guild ${options.guild_id}`,
    );
    this.send(GatewayOpcodes.RequestGuildMembers, options);
  }

  send<T extends keyof GatewaySendEvents>(
    opcode: T,
    data: GatewaySendEvents[T],
  ): void {
    if (!this.#ws || this.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket connection is not open");
    }

    const payload: PayloadEntity = {
      op: opcode,
      d: data,
      s: this.sequence,
      t: null,
    };

    this.#ws.send(this.#encoding.encode(payload));
    this.emit("debug", `Sent payload with op ${opcode}`);
  }

  destroy(code: GatewayCloseCodes = 4000): void {
    this.emit("debug", `Destroying connection with code ${code}`);

    try {
      const ws = this.#ws;
      if (ws) {
        ws.removeAllListeners();
        ws.close(code);
        this.#ws = null;
      }

      this.#sessionId = null;
      this.#resumeUrl = null;
      this.#reconnectAttempts = 0;

      this.#compression.destroy();
      this.#heartbeat.destroy();
    } catch (error) {
      throw new Error("Failed to destroy the gateway connection", {
        cause: error,
      });
    }
  }

  isHealthy(): boolean {
    return (
      this.readyState === WebSocket.OPEN &&
      this.#heartbeat.missedHeartbeats < ZOMBIED_CONNECTION_THRESHOLD &&
      this.ping < 30000
    );
  }

  async #initializeWebSocket(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.#buildGatewayUrl(url);
        const ws = new WebSocket(wsUrl);
        this.#ws = ws;

        ws.once("open", () => {
          this.emit("debug", `Connection established to ${wsUrl}`);
          resolve();
        });

        ws.on("error", (error) => {
          reject(error);
        });

        ws.on("message", (data: Buffer) => {
          this.#handleMessage(data);
        });

        ws.on("close", async (code: number) => {
          this.emit("close", code);
          await this.#handleClose(code);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  #handleMessage(data: Buffer): void {
    let processedData = data;

    if (this.#compression.isInitialized()) {
      processedData = this.#compression.decompress(data);
    }

    const payload = this.#encoding.decode(processedData);
    this.#handlePayload(payload);
  }

  #handlePayload(payload: PayloadEntity): void {
    if (payload.s !== null) {
      this.#heartbeat.updateSequence(payload.s);
    }

    switch (payload.op) {
      case GatewayOpcodes.Dispatch:
        this.#handleDispatch(payload);
        break;

      case GatewayOpcodes.Hello:
        this.#handleHello(payload.d as HelloEntity);
        break;

      case GatewayOpcodes.Heartbeat:
        this.#heartbeat.sendHeartbeat();
        break;

      case GatewayOpcodes.HeartbeatAck:
        this.#heartbeat.ackHeartbeat();
        break;

      case GatewayOpcodes.InvalidSession:
        this.#handleInvalidSession(Boolean(payload.d)).catch((error) =>
          this.emit("error", error),
        );
        break;

      case GatewayOpcodes.Reconnect:
        this.#handleReconnect().catch((error) => this.emit("error", error));
        break;

      default:
        this.emit("debug", `Unhandled payload op: ${payload.op}`);
    }
  }

  #handleDispatch(payload: PayloadEntity): void {
    if (!payload.t) {
      return;
    }

    if (payload.t === "READY") {
      this.#handleReady(payload.d as ReadyEntity);
    }

    this.emit(
      "dispatch",
      payload.t as keyof GatewayReceiveEvents,
      payload.d as never,
    );
  }

  #canResume(): boolean {
    return Boolean(this.sessionId && this.sequence > 0);
  }

  #handleHello(hello: HelloEntity): void {
    this.#heartbeat.start(hello.heartbeat_interval);

    if (this.#canResume()) {
      this.#sendResume();
    } else {
      this.#identify();
    }
  }

  #handleReady(data: ReadyEntity): void {
    this.#sessionId = data.session_id;
    this.#resumeUrl = data.resume_gateway_url;
    this.#reconnectAttempts = 0;

    const readyTime = Date.now() - this.#connectStartTime;
    this.emit("sessionStart", data.session_id, readyTime, data);

    const details = [
      `🤖 ${data.user.username} (${data.application.id})`,
      `📡 Session ${data.session_id}`,
      `🌐 v${data.v} | ${data.guilds.length} guilds`,
      `⏱ Ready in ${readyTime}ms`,
      data.shard ? `✨ Shard [${data.shard}]` : "",
    ]
      .filter(Boolean)
      .join("\n");

    this.emit("debug", `Ready:\n${details}`);
  }

  #identify(): void {
    const payload: IdentifyEntity = {
      token: this.#options.token,
      properties: {
        os: process.platform,
        browser: "nyx.js",
        device: "nyx.js",
      },
      compress: this.#compression.isInitialized(),
      large_threshold: this.#options.largeThreshold,
      intents: BitFieldManager.combine(this.#options.intents).toNumber(),
    };

    if (this.#shard.isEnabled()) {
      payload.shard = this.#shard.getNextShard();
    }

    if (this.#options.presence) {
      payload.presence = this.#options.presence;
    }

    this.send(GatewayOpcodes.Identify, IdentifyEntity.parse(payload));
  }

  #sendResume(): void {
    const sessionId = this.#sessionId;
    if (!sessionId) {
      throw new Error("No session ID available to resume");
    }

    const payload: ResumeEntity = {
      token: this.#options.token,
      session_id: sessionId,
      seq: this.sequence,
    };

    this.send(GatewayOpcodes.Resume, payload);
  }

  #shouldResume(closeCode: number): boolean {
    const nonResumableCodes: GatewayCloseCodes[] = [
      4004, 4010, 4011, 4012, 4013, 4014,
    ];

    const isClean = closeCode === 1000 || closeCode === 1001;
    return !(
      isClean || nonResumableCodes.includes(closeCode as GatewayCloseCodes)
    );
  }

  async #handleClose(code: number): Promise<void> {
    this.#heartbeat.destroy();

    if (this.#sessionId) {
      this.emit("sessionEnd", this.#sessionId, code);
    }

    if (this.#shouldResume(code)) {
      await this.#handleResume();
    } else {
      await this.#handleReconnect();
    }
  }

  async #handleResume(): Promise<void> {
    const resumeUrl = this.#resumeUrl;
    if (!resumeUrl) {
      this.emit("warn", "No resume URL available, falling back to reconnect");
      await this.#handleReconnect();
      return;
    }

    try {
      await this.#waitForBackoff();
      await this.#initializeWebSocket(resumeUrl);
      this.#sendResume();
    } catch (_error) {
      await this.#handleReconnect();
    }
  }

  async #handleReconnect(): Promise<void> {
    if (this.isReconnecting()) {
      return;
    }

    this.emit("reconnecting", this.#reconnectAttempts);

    this.destroy();

    if (!this.#options?.autoReconnect) {
      this.emit(
        "debug",
        "Auto reconnect disabled, stopping reconnection attempt",
      );
      return;
    }

    if (this.#reconnectAttempts >= this.#options.maxReconnectAttempts) {
      throw new Error(
        `Maximum reconnection attempts (${this.#reconnectAttempts}) reached`,
      );
    }

    await this.#waitForBackoff();
    await this.connect();
  }

  async #handleInvalidSession(resumable: boolean): Promise<void> {
    this.emit("sessionInvalid", resumable);

    if (resumable && this.#canResume()) {
      await this.#handleResume();
    } else {
      this.#sessionId = null;
      this.#resumeUrl = null;
      await this.#handleReconnect();
    }
  }

  async #waitForBackoff(): Promise<void> {
    const backoffTime =
      BACKOFF_SCHEDULE[this.#reconnectAttempts] ?? BACKOFF_SCHEDULE.at(-1);

    if (!backoffTime) {
      throw new Error("No backoff time available");
    }

    const newAttempts = ++this.#reconnectAttempts;
    this.emit(
      "debug",
      `Backoff delay: ${backoffTime}ms (attempt: ${newAttempts})`,
    );

    await setTimeout(backoffTime);
  }

  #buildGatewayUrl(baseUrl: string): string {
    const params = new URLSearchParams({
      v: String(this.#options.version),
      encoding: this.#encoding.encodingType,
    });

    if (this.#compression.compressionType) {
      params.append("compress", String(this.#compression.compressionType));
      this.#compression.initialize();
    }

    return `${baseUrl}?${params.toString()}`;
  }

  #setupEventForwarding(...emitters: EventEmitter<GatewayEvents>[]): void {
    const forwardedEvents: (keyof GatewayEvents)[] = [
      "shardSpawn",
      "shardReady",
      "shardDisconnect",
      "shardReconnect",
      "shardResume",
      "connecting",
      "reconnecting",
      "sessionStart",
      "sessionEnd",
      "sessionInvalid",
      "close",
      "heartbeatStart",
      "heartbeatStop",
      "heartbeatSuccess",
      "heartbeatMissed",
      "heartbeatReconnecting",
      "payloadSizeExceeded",
      "invalidEtfKey",
      "chunkSizeExceeded",
      "dispatch",
      "debug",
      "error",
      "warn",
    ];

    for (const emitter of emitters) {
      for (const event of forwardedEvents) {
        emitter.on(event, (...args) => {
          this.emit(event, ...args);
        });
      }
    }
  }
}
