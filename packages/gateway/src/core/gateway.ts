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
} from "../events/index.js";
import { HeartbeatManager, ShardManager } from "../managers/index.js";
import { GatewayOptions } from "../options/index.js";
import { CompressionService, EncodingService } from "../services/index.js";
import {
  type GatewayCloseCodes,
  type GatewayEvents,
  GatewayOpcodes,
  type GatewayReceiveEvents,
  type GatewaySendEvents,
  type PayloadEntity,
} from "../types/index.js";

const BACKOFF_SCHEDULE = [1000, 5000, 10000];
const ZOMBIED_CONNECTION_THRESHOLD = 2;
const NON_RESUMABLE_CODES: GatewayCloseCodes[] = [
  4004, 4010, 4011, 4012, 4013, 4014,
];

export const GATEWAY_FORWARDED_EVENTS: Array<keyof GatewayEvents> = [
  "connectionUpdate",
  "sessionUpdate",
  "heartbeatUpdate",
  "dispatch",
  "debug",
  "error",
];

export class Gateway extends EventEmitter<GatewayEvents> {
  readonly compression: CompressionService;
  readonly encoding: EncodingService;
  readonly heartbeat: HeartbeatManager;
  readonly shard: ShardManager;

  #reconnectAttempts = 0;
  #sessionId: string | null = null;
  #resumeUrl: string | null = null;
  #ws: WebSocket | null = null;
  #connectStartTime = 0;

  readonly #rest: Rest;
  readonly #options: z.output<typeof GatewayOptions>;
  readonly #eventCleanup: () => void;

  constructor(rest: Rest, options: z.input<typeof GatewayOptions>) {
    super();
    this.#rest = rest;

    try {
      this.#options = GatewayOptions.parse(options);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.compression = new CompressionService(this.#options.compressionType);
    this.encoding = new EncodingService(this.#options.encodingType);
    this.heartbeat = new HeartbeatManager(this, this.#options);
    this.shard = new ShardManager(this.#options);

    this.#eventCleanup = this.#forward([this.heartbeat, this.shard], this);
  }

  get ping(): number {
    return this.heartbeat.latency;
  }

  get sessionId(): string | null {
    return this.#sessionId;
  }

  get resumeUrl(): string | null {
    return this.#resumeUrl;
  }

  get sequence(): number {
    return this.heartbeat.sequence;
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
    return this.heartbeat.isReconnecting();
  }

  getBackoffDelay(): number {
    const delay =
      BACKOFF_SCHEDULE[this.#reconnectAttempts] ??
      BACKOFF_SCHEDULE.at(-1) ??
      10000;
    this.emit(
      "debug",
      `Backoff delay: ${delay}ms (attempt: ${this.#reconnectAttempts})`,
    );
    return delay;
  }

  canRetry(): boolean {
    if (!this.#options.autoReconnect) {
      this.emit("debug", "Auto reconnect disabled");
      return false;
    }

    return true;
  }

  shouldResume(code: number): boolean {
    const isClean = code === 1000 || code === 1001;
    return !(
      isClean || NON_RESUMABLE_CODES.includes(code as GatewayCloseCodes)
    );
  }

  async connect(): Promise<void> {
    try {
      this.#connectStartTime = Date.now();
      this.emit("connectionUpdate", {
        type: "initial",
      });

      const [gatewayInfo, guilds] = await Promise.all([
        this.#rest.gateway.getGatewayBot(),
        this.#rest.users.getCurrentUserGuilds(),
      ]);

      await this.shard.spawn(
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

    this.#ws.send(this.encoding.encode(payload));
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

      this.#eventCleanup();
      this.compression.destroy();
      this.heartbeat.destroy();

      if (this.shard.isEnabled()) {
        this.shard.destroy();
      }
    } catch (error) {
      throw new Error("Failed to destroy the gateway connection", {
        cause: error,
      });
    }
  }

  isHealthy(): boolean {
    return (
      this.readyState === WebSocket.OPEN &&
      this.heartbeat.missedHeartbeats < ZOMBIED_CONNECTION_THRESHOLD &&
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

        ws.on("close", async (code) => {
          this.emit("connectionUpdate", {
            type: "closed",
            code,
          });
          await this.#handleClose(code);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  #handleMessage(data: Buffer): void {
    let processedData = data;

    if (this.compression.isInitialized()) {
      processedData = this.compression.decompress(data);
    }

    const payload = this.encoding.decode(processedData);
    if (payload.s !== null) {
      this.heartbeat.updateSequence(payload.s);
    }

    switch (payload.op) {
      case GatewayOpcodes.Dispatch:
        this.#handleDispatch(payload);
        break;

      case GatewayOpcodes.Hello:
        this.#handleHello(payload.d as HelloEntity);
        break;

      case GatewayOpcodes.Heartbeat:
        this.heartbeat.sendHeartbeat();
        break;

      case GatewayOpcodes.HeartbeatAck:
        this.heartbeat.ackHeartbeat();
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
    this.heartbeat.start(hello.heartbeat_interval);

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
    this.emit("sessionUpdate", {
      type: "start",
      sessionId: data.session_id,
      readyTime,
      data,
    });

    const details = [
      `🤖 ${data.user.username} (${data.application.id})`,
      `📡 Session ${data.session_id}`,
      `🌐 v${data.v} | ${data.guilds.length} guilds`,
      `⏱ Ready in ${readyTime}ms`,
      data.shard ? `✨ Shard [${data.shard}]` : "",
    ]
      .filter(Boolean)
      .join("\n");

    this.emit("debug", details);
  }

  #identify(): void {
    const payload: IdentifyEntity = {
      token: this.#options.token,
      properties: {
        os: process.platform,
        browser: "nyx.js",
        device: "nyx.js",
      },
      compress: this.compression.isInitialized(),
      large_threshold: this.#options.largeThreshold,
      intents: BitFieldManager.combine(this.#options.intents).toNumber(),
    };

    if (this.shard.isEnabled() && this.shard.totalShards > 0) {
      payload.shard = this.shard.getNextShard();
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

  async #handleClose(code: number): Promise<void> {
    this.heartbeat.destroy();

    if (this.#sessionId) {
      this.emit("sessionUpdate", {
        type: "end",
        sessionId: this.#sessionId,
        code,
      });
    }

    await this.#handleDisconnect(code);
  }

  async #handleDisconnect(code: number): Promise<void> {
    if (!this.canRetry()) {
      return;
    }

    this.#reconnectAttempts++;
    const delay = this.getBackoffDelay();
    await setTimeout(delay);

    if (this.shouldResume(code) && this.#canResume()) {
      await this.#handleResume();
    } else {
      this.destroy();
      await this.connect();
    }
  }

  async #handleResume(): Promise<void> {
    if (!this.#resumeUrl) {
      throw new Error("No resume URL available");
    }

    try {
      await this.#initializeWebSocket(this.#resumeUrl);
      this.#sendResume();
    } catch {
      await this.#handleDisconnect(4000);
    }
  }

  async #handleReconnect(): Promise<void> {
    if (this.isReconnecting()) {
      return;
    }

    this.emit("connectionUpdate", {
      type: "reconnect",
      attempt: this.#reconnectAttempts,
    });
    this.destroy();
    await this.#handleDisconnect(4000);
  }

  async #handleInvalidSession(resumable: boolean): Promise<void> {
    this.emit("sessionUpdate", {
      type: "invalid",
      resumable,
    });

    if (resumable && this.#canResume()) {
      await this.#handleResume();
    } else {
      this.#sessionId = null;
      this.#resumeUrl = null;
      await this.#handleReconnect();
    }
  }

  #buildGatewayUrl(baseUrl: string): string {
    const params = new URLSearchParams({
      v: String(this.#options.version),
      encoding: this.encoding.encodingType,
    });

    if (this.compression.compressionType) {
      params.append("compress", this.compression.compressionType);
      this.compression.initialize();
    }

    return `${baseUrl}?${params.toString()}`;
  }

  #forward<T extends EventEmitter<GatewayEvents>>(
    from: T | T[],
    to: EventEmitter<GatewayEvents>,
  ): () => void {
    const sources = Array.isArray(from) ? from : [from];
    const cleanups: Array<() => void> = [];

    for (const source of sources) {
      for (const event of GATEWAY_FORWARDED_EVENTS) {
        const handler = (...args: unknown[]): boolean =>
          to.emit(event, ...(args as never));
        source.on(event, handler);
        cleanups.push(() => source.off(event, handler));
      }
    }

    return (): void => {
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  }
}
