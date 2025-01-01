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
  RateLimitManager,
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

interface ConnectionState {
  reconnectAttempts: number;
  isReconnecting: boolean;
  sequence: number;
  sessionId: string | null;
  resumeUrl: string | null;
  heartbeatInterval: NodeJS.Timeout | null;
  heartbeatsMissed: number;
  lastHeartbeatAck: boolean;
  lastPing: number | null;
  lastHeartbeatSent: number | null;
  activeShard: number | null;
}

export class Gateway extends EventEmitter<GatewayEvents> {
  static readonly DEFAULT_LARGE_THRESHOLD = 50;
  static readonly BACKOFF_SCHEDULE = [1000, 5000, 10000];
  static readonly ZOMBIED_CONNECTION_THRESHOLD = 2;

  readonly #rest: Rest;
  readonly #token: string;
  readonly #version: ApiVersion = ApiVersion.v10;
  readonly #encoding: EncodingType;
  readonly #compress: CompressionType;
  readonly #intents: BitFieldManager<number>;
  readonly #largeThreshold: number;
  #isSharding: boolean;
  readonly #presence?: UpdatePresenceEntity;

  #ws: WebSocket | null = null;
  #state: ConnectionState = {
    reconnectAttempts: 0,
    isReconnecting: false,
    sequence: -1,
    sessionId: null,
    resumeUrl: null,
    heartbeatInterval: null,
    heartbeatsMissed: 0,
    lastHeartbeatAck: true,
    lastPing: null,
    lastHeartbeatSent: null,
    activeShard: null,
  };

  readonly #shardManager: ShardManager;
  readonly #rateLimitManager: RateLimitManager;
  readonly #compressionManager: CompressionManager;
  readonly #encodingManager: EncodingManager;

  constructor(rest: Rest, options: GatewayOptions) {
    super();

    if (!options.intents) {
      throw new Error("You must specify intents when identifying");
    }

    this.#rest = rest;
    this.#token = options.token;
    this.#version = options.version ?? ApiVersion.v10;
    this.#encoding = options.encoding ?? "etf";
    this.#compress = options.compress ?? "zstd-stream";
    this.#intents = BitFieldManager.combine(options.intents);
    this.#largeThreshold =
      options.largeThreshold ?? Gateway.DEFAULT_LARGE_THRESHOLD;
    this.#presence = options.presence;
    this.#isSharding = options.shard ?? false;

    this.#rateLimitManager = new RateLimitManager(options);
    this.#shardManager = new ShardManager(this.#rateLimitManager);
    this.#compressionManager = new CompressionManager(this.#compress);
    this.#encodingManager = new EncodingManager(this.#encoding);
  }

  get ping(): number {
    return this.#state.lastPing ?? -1;
  }

  get sessionId(): string | null {
    return this.#state.sessionId;
  }

  get sequence(): number {
    return this.#state.sequence;
  }

  get readyState(): 0 | 1 | 2 | 3 {
    return this.#ws?.readyState ?? WebSocket.CLOSED;
  }

  async connect(): Promise<void> {
    try {
      this.emit("connecting", this.#state.reconnectAttempts);

      const [gatewayInfo, guilds] = await Promise.all([
        this.#rest.gateway.getGatewayBot(),
        this.#rest.users.getCurrentUserGuilds(),
      ]);

      if (
        this.#isSharding &&
        this.#shardManager.isBotShardingRequired(guilds.length)
      ) {
        this.emit("debug", `Initializing sharding for ${guilds.length} guilds`);

        await this.#shardManager.spawnShards(
          gatewayInfo.shards,
          gatewayInfo.session_start_limit.max_concurrency,
        );
      } else {
        this.#isSharding = false;
        const warningMessage =
          `Sharding not necessary: Total guilds (${guilds.length}) do not exceed sharding threshold. ` +
          `Sharding is typically recommended when a bot is in ${ShardManager.MAX_GUILDS_PER_SHARD} or more guilds.`;

        this.emit("warn", warningMessage);
      }

      this.#initializeWebSocket(gatewayInfo.url);
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
    this.#sendPayload(GatewayOpcodes.presenceUpdate, presence);
  }

  updateVoiceState(options: UpdateVoiceStateEntity): void {
    this.emit("debug", `Updating voice state for guild ${options.guild_id}`);
    this.#sendPayload(GatewayOpcodes.voiceStateUpdate, options);
  }

  requestGuildMembers(options: RequestGuildMembersEntity): void {
    this.emit(
      "debug",
      `Requesting guild members for guild ${options.guild_id}`,
    );
    this.#sendPayload(GatewayOpcodes.requestGuildMembers, options);
  }

  destroy(code: GatewayCloseCodes = 4000): void {
    this.emit("debug", `Destroying connection with code ${code}`);
    this.#cleanup();

    if (this.#ws) {
      this.#ws.close(code);
      this.#ws = null;
    }
  }

  isHealthy(): boolean {
    return (
      this.readyState === WebSocket.OPEN &&
      this.#state.heartbeatsMissed < Gateway.ZOMBIED_CONNECTION_THRESHOLD &&
      this.ping < 30000
    );
  }

  #initializeWebSocket(url: string): void {
    const wsUrl = this.#buildGatewayUrl(url);
    this.#ws = new WebSocket(wsUrl);

    this.#ws.on("open", () =>
      this.emit("debug", `WebSocket connection established to ${wsUrl}`),
    );
    this.#ws.on("error", (error) => this.emit("error", error));
    this.#ws.on("message", (data: Buffer) => this.#handleMessage(data));
    this.#ws.on("close", async (code: GatewayCloseCodes) => {
      this.emit("close", code);
      await this.#handleClose(code);
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
      this.#state.sequence = payload.s;
    }

    switch (payload.op) {
      case GatewayOpcodes.dispatch:
        return this.#handleDispatch(payload);

      case GatewayOpcodes.hello:
        return this.#handleHello(payload.d as HelloEntity);

      case GatewayOpcodes.heartbeat:
        return this.#sendHeartbeat();

      case GatewayOpcodes.heartbeatAck:
        return this.#handleHeartbeatAck();

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
      this.#state.resumeUrl = readyData.resume_gateway_url;
      this.#handleReady(readyData);
    }

    this.emit(
      "dispatch",
      payload.t as keyof GatewayReceiveEvents,
      payload.d as never,
    );
  }

  async #handleHello(hello: HelloEntity): Promise<void> {
    if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) {
      throw new Error("No active WebSocket connection");
    }

    this.#setupHeartbeat(hello.heartbeat_interval);

    if (this.#state.sessionId && this.#state.sequence > -1) {
      this.#sendResume();
    } else if (this.#isSharding) {
      const nextShard = this.#shardManager.getNextShardToSpawn();
      if (nextShard !== null) {
        await this.#identify(nextShard);
        this.#shardManager.updateShardStatus(nextShard, "connecting");
      }
    } else {
      await this.#identify();
    }
  }

  #setupHeartbeat(interval: number): void {
    this.#clearHeartbeat();

    const jitter = Math.random();
    const jitterDelay = Math.floor(interval * jitter);

    this.emit(
      "debug",
      `Setting up heartbeat (interval: ${interval}ms, jitter: ${jitter}, delay: ${jitterDelay}ms)`,
    );

    setTimeout(() => {
      this.#sendHeartbeat();
      this.#state.heartbeatInterval = setInterval(() => {
        this.#sendHeartbeat();
      }, interval);
    }, jitterDelay);
  }

  #handleReady(data: ReadyEntity): void {
    this.#state.sessionId = data.session_id;
    this.#state.resumeUrl = data.resume_gateway_url;

    this.emit("sessionStart", data.session_id);

    if (this.#isSharding) {
      const shardId = this.#shardManager.getNextShardToSpawn();
      if (shardId !== null) {
        this.emit("shardReady", shardId);
        this.#shardManager.updateShardStatus(shardId, "ready");

        for (const guild of data.guilds) {
          this.#shardManager.addGuildToShard(guild.id);
        }
      }
    }

    this.#state.reconnectAttempts = 0;
    this.#state.isReconnecting = false;

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

  #sendHeartbeat(): void {
    if (!this.#state.lastHeartbeatAck) {
      this.#state.heartbeatsMissed++;
      this.emit("heartbeatTimeout", this.#state.heartbeatsMissed);

      if (
        this.#state.heartbeatsMissed >= Gateway.ZOMBIED_CONNECTION_THRESHOLD
      ) {
        this.emit("debug", "Connection appears to be zombied, reconnecting");
        this.destroy();
        return;
      }
    }

    this.#state.lastHeartbeatAck = false;
    this.#state.lastHeartbeatSent = Date.now();
    this.emit("heartbeat", this.#state.sequence);

    this.#sendPayload(GatewayOpcodes.heartbeat, this.#state.sequence);
  }

  #handleHeartbeatAck(): void {
    const now = Date.now();
    if (this.#state.lastHeartbeatSent) {
      this.#state.lastPing = now - this.#state.lastHeartbeatSent;
      this.emit("heartbeatAck", this.#state.lastPing);
    }

    this.#state.lastHeartbeatAck = true;
    this.#state.heartbeatsMissed = 0;
  }

  async #identify(currentShard: number | null = null): Promise<void> {
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

    if (this.#isSharding && currentShard) {
      this.#state.activeShard = currentShard;
      payload.shard = [currentShard, this.#shardManager.totalShards];
      await this.#rateLimitManager.acquireIdentify(currentShard);
    }

    if (this.#presence) {
      payload.presence = this.#presence;
    }

    this.#sendPayload(GatewayOpcodes.identify, payload);
  }

  #sendResume(): void {
    if (!this.#state.sessionId) {
      throw new Error("No session ID available for resume");
    }

    const payload: ResumeEntity = {
      token: this.#token,
      session_id: this.#state.sessionId,
      seq: this.#state.sequence,
    };

    this.#sendPayload(GatewayOpcodes.resume, payload);
  }

  async #handleClose(code: number): Promise<void> {
    this.#clearHeartbeat();

    if (this.#state.sessionId) {
      this.emit("sessionEnd", this.#state.sessionId, code);
    }

    const activeShard = this.#state.activeShard;
    if (this.#isSharding && activeShard) {
      this.emit("shardDisconnect", activeShard, code);
    }

    if (this.#shouldResume(code)) {
      await this.#handleResume();
    } else {
      await this.#handleReconnect();
    }
  }

  async #handleResume(): Promise<void> {
    if (!this.#state.resumeUrl) {
      this.emit("warn", "No resume URL available, falling back to reconnect");
      await this.#handleReconnect();
      return;
    }

    const activeShard = this.#state.activeShard;
    if (this.#isSharding && activeShard) {
      this.emit("shardResume", activeShard);
    }

    try {
      await this.#waitForBackoff();
      this.#initializeWebSocket(this.#state.resumeUrl);
      this.#sendResume();
    } catch (error) {
      this.emit("error", this.#wrapError("Failed to resume", error));
      await this.#handleReconnect();
    }
  }

  async #handleReconnect(): Promise<void> {
    if (this.#state.isReconnecting) {
      return;
    }

    this.#state.isReconnecting = true;
    const activeShard = this.#state.activeShard;

    if (this.#isSharding && activeShard) {
      this.emit("shardReconnecting", activeShard);
      this.#shardManager.updateShardStatus(activeShard, "idle");
    }

    this.emit("reconnecting", this.#state.reconnectAttempts);

    try {
      this.#cleanup();
      await this.#waitForBackoff();
      await this.connect();
    } catch (error) {
      this.emit("error", this.#wrapError("Failed to reconnect", error));
    } finally {
      this.#state.isReconnecting = false;
    }
  }

  async #handleInvalidSession(resumable: boolean): Promise<void> {
    this.emit("sessionInvalid", resumable);

    if (resumable) {
      await this.#handleResume();
    } else {
      this.#state.sessionId = null;
      this.#state.sequence = -1;
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

  #sendPayload<T extends keyof GatewaySendEvents>(
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
        s: this.#state.sequence,
        t: null,
      };

      this.#ws.send(this.#encodingManager.encode(payload));
      this.emit("debug", `Sent payload with op ${payload.op}`);
    } catch (error) {
      throw this.#wrapError("Failed to send payload", error);
    }
  }

  #cleanup(): void {
    try {
      this.emit("debug", "Cleaning up connection resources");

      this.#clearHeartbeat();

      if (this.#ws) {
        this.#ws.removeAllListeners();
        this.#ws = null;
      }

      this.#state.lastHeartbeatAck = true;
      this.#state.heartbeatsMissed = 0;

      this.#compressionManager.destroy();
      this.#rateLimitManager.destroy();
    } catch (error) {
      throw this.#wrapError("Failed to cleanup resources", error);
    }
  }

  #clearHeartbeat(): void {
    if (this.#state.heartbeatInterval) {
      clearInterval(this.#state.heartbeatInterval);
      this.#state.heartbeatInterval = null;
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
      Gateway.BACKOFF_SCHEDULE[this.#state.reconnectAttempts] ??
      Gateway.BACKOFF_SCHEDULE.at(-1);

    if (!backoffTime) {
      throw new Error("Backoff time not found");
    }

    this.#state.reconnectAttempts = Math.min(
      this.#state.reconnectAttempts + 1,
      Gateway.BACKOFF_SCHEDULE.length - 1,
    );

    this.emit(
      "debug",
      `Backoff delay: ${backoffTime}ms (attempt: ${this.#state.reconnectAttempts})`,
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
}
