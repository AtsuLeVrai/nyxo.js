import { ApiVersion, BitFieldManager } from "@nyxjs/core";
import type { Rest } from "@nyxjs/rest";
import { EventEmitter } from "eventemitter3";
import WebSocket from "ws";
import type {
  HelloEntity,
  IdentifyEntity,
  ReadyEntity,
  RequestGuildMembersEntity,
  ResumeEntity,
  UpdatePresenceEntity,
  UpdateVoiceStateEntity,
} from "../events/index.js";
import {
  CompressionManager,
  EncodingManager,
  HeartbeatManager,
  ShardManager,
} from "../managers/index.js";
import {
  type CompressionType,
  type EncodingType,
  GatewayCloseCodes,
  type GatewayEvents,
  GatewayOpcodes,
  type GatewayOptions,
  type GatewayReceiveEvents,
  type GatewaySendEvents,
  type PayloadEntity,
} from "../types/index.js";

export class Gateway extends EventEmitter<GatewayEvents> {
  static readonly BACKOFF_SCHEDULE = [1000, 5000, 10000];
  static readonly ZOMBIED_CONNECTION_THRESHOLD = 2;

  readonly #rest: Rest;
  readonly #token: string;
  readonly #version: ApiVersion = ApiVersion.v10;
  readonly #encoding: EncodingType;
  readonly #compress: CompressionType;
  readonly #intents: BitFieldManager<number>;
  readonly #largeThreshold: number;
  readonly #presence?: UpdatePresenceEntity;
  readonly #isSharding: boolean;

  #ws: WebSocket | null = null;
  #reconnectAttempts = 0;
  #isReconnecting = false;
  #sessionId: string | null = null;
  #resumeUrl: string | null = null;

  readonly #heartbeatManager: HeartbeatManager;
  readonly #shardManager: ShardManager;
  readonly #compressionManager: CompressionManager;
  readonly #encodingManager: EncodingManager;

  constructor(rest: Rest, options: GatewayOptions) {
    super();
    this.#rest = rest;
    this.#token = options.token;
    this.#version = options.version ?? ApiVersion.v10;
    this.#encoding = options.encoding ?? "etf";
    this.#compress = options.compress ?? "zstd-stream";
    this.#intents = BitFieldManager.combine(options.intents);
    this.#largeThreshold = options.largeThreshold ?? 50;
    this.#presence = options.presence;
    this.#isSharding = Boolean(options.shard);

    this.#heartbeatManager = new HeartbeatManager(this);
    this.#shardManager = new ShardManager(options.shard);
    this.#compressionManager = new CompressionManager(this.#compress);
    this.#encodingManager = new EncodingManager(this.#encoding);

    this.#forwardEvents(
      this.#heartbeatManager,
      this.#compressionManager,
      this.#encodingManager,
      this.#shardManager,
    );
  }

  get ping(): number {
    return this.#heartbeatManager.latency;
  }

  get sessionId(): string | null {
    return this.#sessionId;
  }

  get sequence(): number | null {
    return this.#heartbeatManager.sequence;
  }

  get readyState(): 0 | 1 | 2 | 3 {
    return this.#ws?.readyState ?? WebSocket.CLOSED;
  }

  async connect(): Promise<void> {
    try {
      this.emit("connecting", this.#reconnectAttempts);

      const [gatewayInfo, guilds] = await Promise.all([
        this.#rest.gateway.getGatewayBot(),
        this.#rest.users.getCurrentUserGuilds(),
      ]);

      if (this.#isSharding) {
        await this.#shardManager.spawn(
          guilds.data.length,
          gatewayInfo.data.session_start_limit.max_concurrency,
          gatewayInfo.data.shards,
        );
      }

      await this.#initializeWebSocket(gatewayInfo.data.url);
      this.emit("connected");
    } catch (error) {
      this.emit(
        "error",
        this.#wrapError("Failed to establish connection", error),
      );
      throw error;
    }
  }

  updatePresence(presence: UpdatePresenceEntity): void {
    this.emit("debug", `Updating presence: ${JSON.stringify(presence)}`);
    this.send(GatewayOpcodes.presenceUpdate, presence);
  }

  updateVoiceState(options: UpdateVoiceStateEntity): void {
    this.emit("debug", `Updating voice state for guild ${options.guild_id}`);
    this.send(GatewayOpcodes.voiceStateUpdate, options);
  }

  requestGuildMembers(options: RequestGuildMembersEntity): void {
    this.emit(
      "debug",
      `Requesting guild members for guild ${options.guild_id}`,
    );
    this.send(GatewayOpcodes.requestGuildMembers, options);
  }

  destroy(code: GatewayCloseCodes = 4000): void {
    this.emit("debug", `Destroying connection with code ${code}`);
    this.#cleanup();

    if (this.#ws) {
      this.#ws.close(code);
      this.#ws = null;
    }

    this.removeAllListeners();
  }

  isHealthy(): boolean {
    return (
      this.readyState === WebSocket.OPEN &&
      this.#heartbeatManager.missedHeartbeats <
        Gateway.ZOMBIED_CONNECTION_THRESHOLD &&
      this.ping < 30000
    );
  }

  send<T extends keyof GatewaySendEvents>(
    opcode: T,
    data: GatewaySendEvents[T],
  ): void {
    if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) {
      throw new Error("No active WebSocket connection");
    }

    try {
      const payload: PayloadEntity = {
        op: opcode,
        d: data,
        s: this.#heartbeatManager.sequence,
        t: null,
      };

      this.#ws.send(this.#encodingManager.encode(payload));
      this.emit("debug", `Sent payload with op ${payload.op}`);
    } catch (error) {
      throw this.#wrapError("Failed to send payload", error);
    }
  }

  #initializeWebSocket(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.#buildGatewayUrl(url);
        this.#ws = new WebSocket(wsUrl);
        this.#ws.on("open", () => {
          this.emit("debug", `WebSocket connection established to ${wsUrl}`);
          resolve();
        });
        this.#ws.on("error", (error) => reject(error));
        this.#ws.on("message", (data: Buffer) => this.#handleMessage(data));
        this.#ws.on("close", async (code: GatewayCloseCodes) => {
          this.emit("close", code);
          await this.#handleClose(code);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  #handleMessage(data: Buffer): Promise<void> | void {
    try {
      let processedData = data;
      if (this.#compress) {
        processedData = this.#compressionManager.decompress(data);
      }

      const payload = this.#encodingManager.decode(processedData);
      return this.#handlePayload(payload);
    } catch (error) {
      this.emit("error", this.#wrapError("Failed to process message", error));
    }
  }

  #handlePayload(payload: PayloadEntity): Promise<void> | void {
    if (payload.s !== null) {
      this.#heartbeatManager.updateSequence(payload.s);
    }

    switch (payload.op) {
      case GatewayOpcodes.dispatch:
        return this.#handleDispatch(payload);

      case GatewayOpcodes.hello:
        return this.#handleHello(payload.d as HelloEntity);

      case GatewayOpcodes.heartbeat:
        return this.#heartbeatManager.sendHeartbeat();

      case GatewayOpcodes.heartbeatAck:
        return this.#heartbeatManager.ackHeartbeat();

      case GatewayOpcodes.invalidSession:
        return this.#handleInvalidSession(Boolean(payload.d));

      case GatewayOpcodes.reconnect:
        return this.#handleReconnect();

      default:
        this.emit("debug", `Unhandled payload op: ${payload.op}`);
    }
  }

  #handleDispatch(payload: PayloadEntity): void {
    if (!payload.t) {
      return;
    }

    if (payload.t === "READY") {
      const readyData = payload.d as ReadyEntity;
      this.#resumeUrl = readyData.resume_gateway_url;
      this.#handleReady(readyData);
    }

    this.emit(
      "dispatch",
      payload.t as keyof GatewayReceiveEvents,
      payload.d as never,
    );
  }

  #handleHello(hello: HelloEntity): void {
    if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) {
      throw new Error("No active WebSocket connection");
    }

    this.#heartbeatManager.startHeartbeat(hello.heartbeat_interval);

    if (this.#sessionId && this.#heartbeatManager.sequence > 0) {
      this.#sendResume();
    } else {
      this.#identify();
    }
  }

  #handleReady(data: ReadyEntity): void {
    this.#sessionId = data.session_id;
    this.#resumeUrl = data.resume_gateway_url;

    this.emit("sessionStart", data.session_id);

    this.#reconnectAttempts = 0;
    this.#isReconnecting = false;

    const debugMessage = [
      `🤖 ${data.user.username} (${data.application.id})`,
      `📡 Session ${data.session_id}`,
      `🌐 v${data.v} | ${data.guilds.length} guilds`,
      data.shard ? `✨ Shard [${data.shard}]` : "",
    ]
      .filter(Boolean)
      .join("\n");

    this.emit("debug", debugMessage);
  }

  #identify(): void {
    const payload: IdentifyEntity = {
      token: this.#token,
      compress: Boolean(this.#compress),
      large_threshold: this.#largeThreshold,
      intents: Number(this.#intents.valueOf()),
      properties: {
        os: process.platform,
        browser: "nyx.js",
        device: "nyx.js",
      },
    };

    if (this.#isSharding) {
      payload.shard = this.#shardManager.getNextShard();
    }

    if (this.#presence) {
      payload.presence = this.#presence;
    }

    this.send(GatewayOpcodes.identify, payload);
  }

  #sendResume(): void {
    if (!this.#sessionId) {
      throw new Error("No session ID available for resume");
    }

    const payload: ResumeEntity = {
      token: this.#token,
      session_id: this.#sessionId,
      seq: this.#heartbeatManager.sequence,
    };

    this.send(GatewayOpcodes.resume, payload);
  }

  async #handleClose(code: number): Promise<void> {
    this.#heartbeatManager.destroyHeartbeat();

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
    if (!this.#resumeUrl) {
      this.emit("warn", "No resume URL available, falling back to reconnect");
      await this.#handleReconnect();
      return;
    }

    try {
      await this.#waitForBackoff();
      await this.#initializeWebSocket(this.#resumeUrl);
      this.#sendResume();
    } catch (error) {
      this.emit("error", this.#wrapError("Failed to resume", error));
      await this.#handleReconnect();
    }
  }

  async #handleReconnect(): Promise<void> {
    if (this.#isReconnecting) {
      return;
    }

    this.#isReconnecting = true;
    this.emit("reconnecting", this.#reconnectAttempts);

    try {
      this.#cleanup();
      await this.#waitForBackoff();
      await this.connect();
    } catch (error) {
      this.emit("error", this.#wrapError("Failed to reconnect", error));
    } finally {
      this.#isReconnecting = false;
    }
  }

  async #handleInvalidSession(resumable: boolean): Promise<void> {
    this.emit("sessionInvalid", resumable);

    if (resumable) {
      await this.#handleResume();
    } else {
      this.#sessionId = null;
      await this.#handleReconnect();
    }
  }

  #buildGatewayUrl(baseUrl: string): string {
    const params = new URLSearchParams({
      v: String(this.#version),
      encoding: this.#encoding,
    });

    if (this.#compress) {
      params.append("compress", this.#compress);
      this.#compressionManager.initializeCompression();
    }

    return `${baseUrl}?${params.toString()}`;
  }

  #cleanup(): void {
    try {
      this.emit("debug", "Cleaning up connection resources");

      if (this.#ws) {
        this.#ws.removeAllListeners();
        this.#ws = null;
      }

      this.#compressionManager.destroy();
    } catch (error) {
      throw this.#wrapError("Failed to cleanup resources", error);
    }
  }

  #shouldResume(closeCode: number): boolean {
    const nonResumableCodes = [
      GatewayCloseCodes.authenticationFailed,
      GatewayCloseCodes.invalidShard,
      GatewayCloseCodes.shardingRequired,
      GatewayCloseCodes.invalidApiVersion,
      GatewayCloseCodes.invalidIntents,
      GatewayCloseCodes.disallowedIntents,
    ];

    const isClean = closeCode === 1000 || closeCode === 1001;
    return !(
      isClean ||
      nonResumableCodes.includes(
        closeCode as 4004 | 4010 | 4011 | 4012 | 4013 | 4014,
      )
    );
  }

  async #waitForBackoff(): Promise<void> {
    const backoffTime =
      Gateway.BACKOFF_SCHEDULE[this.#reconnectAttempts] ??
      Gateway.BACKOFF_SCHEDULE.at(-1);

    if (!backoffTime) {
      throw new Error("Backoff time not found");
    }

    this.#reconnectAttempts = Math.min(
      this.#reconnectAttempts + 1,
      Gateway.BACKOFF_SCHEDULE.length - 1,
    );

    this.emit(
      "debug",
      `Backoff delay: ${backoffTime}ms (attempt: ${this.#reconnectAttempts})`,
    );

    await this.#wait(backoffTime);
  }

  async #wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  #wrapError(message: string, error: unknown): Error {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Error(`${message}: ${errorMessage}`);
  }

  #forwardEvents(...emitters: EventEmitter<GatewayEvents>[]): void {
    const gatewayEvents: (keyof GatewayEvents)[] = [
      "debug",
      "warn",
      "error",
      "close",
      "dispatch",
      "connecting",
      "connected",
      "reconnecting",
      "heartbeat",
      "heartbeatAck",
      "heartbeatTimeout",
      "sessionStart",
      "sessionEnd",
      "sessionInvalid",
      "shardReady",
      "shardReconnecting",
      "shardResume",
      "shardDisconnect",
      "heartbeatInit",
      "heartbeatDestroy",
      "heartbeatSequence",
    ];

    for (const emitter of emitters) {
      for (const event of gatewayEvents) {
        emitter.on(event, (...args) => {
          return this.emit(event, ...args);
        });
      }
    }
  }
}
