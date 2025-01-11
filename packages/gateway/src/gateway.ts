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

export class Gateway extends EventEmitter<GatewayEvents> {
  static readonly BACKOFF_SCHEDULE = [1000, 5000, 10000];
  static readonly ZOMBIED_CONNECTION_THRESHOLD = 2;

  #sessionId: string | null = null;
  #resumeUrl: string | null = null;
  #reconnectAttempts = 0;
  #ws: WebSocket | null = null;

  readonly #rest: Rest;
  readonly #options: z.output<typeof GatewayOptions>;
  readonly #compressionService: CompressionService;
  readonly #encodingService: EncodingService;
  readonly #heartbeatService: HeartbeatService;
  readonly #shardService: ShardService;

  constructor(rest: Rest, options: z.input<typeof GatewayOptions>) {
    super();
    this.#rest = rest;

    try {
      this.#options = GatewayOptions.parse(options);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.#compressionService = new CompressionService(options.compression);
    this.#encodingService = new EncodingService(options.encoding);
    this.#heartbeatService = new HeartbeatService(this, options.heartbeat);
    this.#shardService = new ShardService(options.shard);

    this.#setupEventForwarding(
      this.#heartbeatService,
      this.#compressionService,
      this.#encodingService,
      this.#shardService,
    );
  }

  get ping(): number {
    return this.#heartbeatService.latency;
  }

  get sessionId(): string | null {
    return this.#sessionId;
  }

  get resumeUrl(): string | null {
    return this.#resumeUrl;
  }

  get sequence(): number {
    return this.#heartbeatService.sequence;
  }

  get reconnectAttempts(): number {
    return this.#reconnectAttempts;
  }

  get isReconnecting(): boolean {
    return this.#heartbeatService.isReconnecting;
  }

  get readyState(): number {
    return this.#ws?.readyState ?? WebSocket.CLOSED;
  }

  get webSocket(): WebSocket | null {
    return this.#ws;
  }

  async connect(): Promise<void> {
    try {
      this.emit("connecting", this.#reconnectAttempts);

      const [gatewayInfo, guilds] = await Promise.all([
        this.#rest.gateway.getGatewayBot(),
        this.#rest.users.getCurrentUserGuilds(),
      ]);

      if (this.#options.shard) {
        await this.#shardService.spawn(
          guilds.data.length,
          gatewayInfo.data.session_start_limit.max_concurrency,
          gatewayInfo.data.shards,
        );
      }

      await this.#initializeWebSocket(gatewayInfo.data.url);
      this.emit("connected");
    } catch (error) {
      throw new Error("Failed to connect to the gateway", {
        cause: error,
      });
    }
  }

  updatePresence(presence: UpdatePresenceEntity): void {
    this.emit(
      "debug",
      `[Gateway] Updating presence: ${JSON.stringify(presence)}`,
    );
    this.send(GatewayOpcodes.PresenceUpdate, presence);
  }

  updateVoiceState(options: UpdateVoiceStateEntity): void {
    this.emit(
      "debug",
      `[Gateway] Updating voice state for guild ${options.guild_id}`,
    );
    this.send(GatewayOpcodes.VoiceStateUpdate, options);
  }

  requestGuildMembers(options: RequestGuildMembersEntity): void {
    this.emit(
      "debug",
      `[Gateway] Requesting guild members for guild ${options.guild_id}`,
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

    this.#ws.send(this.#encodingService.encode(payload));
    this.emit("debug", `[Gateway] Sent payload with op ${opcode}`);
  }

  destroy(code: GatewayCloseCodes = 4000): void {
    this.emit("debug", `[Gateway] Destroying connection with code ${code}`);

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

      this.#compressionService.destroy();
      this.#heartbeatService.destroy();
    } catch (error) {
      throw new Error("Failed to destroy the gateway connection", {
        cause: error,
      });
    }
  }

  isHealthy(): boolean {
    return (
      this.readyState === WebSocket.OPEN &&
      this.#heartbeatService.missedHeartbeats <
        Gateway.ZOMBIED_CONNECTION_THRESHOLD &&
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
          this.emit("debug", `[Gateway] Connection established to ${wsUrl}`);
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

    if (this.#options.compression) {
      processedData = this.#compressionService.decompress(data);
    }

    const payload = this.#encodingService.decode(processedData);
    this.#handlePayload(payload);
  }

  #handlePayload(payload: PayloadEntity): void {
    if (payload.s !== null) {
      this.#heartbeatService.updateSequence(payload.s);
    }

    switch (payload.op) {
      case GatewayOpcodes.Dispatch:
        this.#handleDispatch(payload);
        break;

      case GatewayOpcodes.Hello:
        this.#handleHello(payload.d as HelloEntity);
        break;

      case GatewayOpcodes.Heartbeat:
        this.#heartbeatService.sendHeartbeat();
        break;

      case GatewayOpcodes.HeartbeatAck:
        this.#heartbeatService.ackHeartbeat();
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
        this.emit("debug", `[Gateway] Unhandled payload op: ${payload.op}`);
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
    this.#heartbeatService.start(hello.heartbeat_interval);

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

    this.emit("sessionStart", data.session_id, data);

    const details = [
      `🤖 ${data.user.username} (${data.application.id})`,
      `📡 Session ${data.session_id}`,
      `🌐 v${data.v} | ${data.guilds.length} guilds`,
      data.shard ? `✨ Shard [${data.shard}]` : "",
    ]
      .filter(Boolean)
      .join("\n");

    this.emit("debug", `[Gateway] Ready:\n${details}`);
  }

  #identify(): void {
    const payload: IdentifyEntity = {
      token: this.#options.token,
      properties: {
        os: process.platform,
        browser: "nyx.js",
        device: "nyx.js",
      },
      compress: Boolean(this.#options.compression?.type),
      large_threshold: this.#options.largeThreshold,
      intents: BitFieldManager.combine(this.#options.intents).toNumber(),
    };

    if (this.#options.shard) {
      payload.shard = this.#shardService.getNextShard();
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
    this.#heartbeatService.destroy();

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
    if (this.isReconnecting) {
      return;
    }

    this.emit("reconnecting", this.#reconnectAttempts);

    this.destroy();

    if (!this.#options.heartbeat?.autoReconnect) {
      this.emit(
        "debug",
        "[Gateway] Auto reconnect disabled, stopping reconnection attempt",
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
      Gateway.BACKOFF_SCHEDULE[this.#reconnectAttempts] ??
      Gateway.BACKOFF_SCHEDULE.at(-1);

    if (!backoffTime) {
      throw new Error("No backoff time available");
    }

    const newAttempts = ++this.#reconnectAttempts;
    this.emit(
      "debug",
      `[Gateway] Backoff delay: ${backoffTime}ms (attempt: ${newAttempts})`,
    );

    await setTimeout(backoffTime);
  }

  #buildGatewayUrl(baseUrl: string): string {
    const params = new URLSearchParams({
      v: String(this.#options.version),
      encoding: this.#encodingService.encodingType,
    });

    if (this.#compressionService.compressionType) {
      params.append(
        "compress",
        String(this.#compressionService.compressionType),
      );
      this.#compressionService.initialize();
    }

    return `${baseUrl}?${params.toString()}`;
  }

  #setupEventForwarding(...emitters: EventEmitter<GatewayEvents>[]): void {
    const forwardedEvents: (keyof GatewayEvents)[] = [
      "debug",
      "warn",
      "error",
      "close",
      "dispatch",
      "connecting",
      "connected",
      "reconnecting",
      "sessionStart",
      "sessionEnd",
      "sessionInvalid",
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
