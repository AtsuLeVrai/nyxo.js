import { ApiVersion, BitFieldManager } from "@nyxjs/core";
import type { GatewayBotResponseEntity, Rest } from "@nyxjs/rest";
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
  SessionManager,
  ShardManager,
} from "../managers/index.js";
import {
  type CompressionType,
  EncodingType,
  GatewayCloseCodes,
  type GatewayEventsMap,
  type GatewayIntentsBits,
  GatewayOpcodes,
  type GatewayOptions,
  type GatewayReceiveEventsMap,
  type PayloadEntity,
} from "../types/index.js";

interface ConnectionState {
  reconnectAttempts: number;
  isReconnecting: boolean;
  lastSequenceNumber: number;
  sessionId: string | null;
  wsUrl: string | null;
  resumeUrl: string | null;
  heartbeatInterval: NodeJS.Timeout | null;
  heartbeatsMissed: number;
  lastHeartbeatAck: boolean;
}

export class Gateway extends EventEmitter<GatewayEventsMap> {
  static readonly DEFAULT_LARGE_THRESHOLD = 50;
  static readonly BACKOFF_SCHEDULE = [1000, 5000, 10000];
  static readonly ZOMBIED_CONNECTION_THRESHOLD = 2;

  readonly #rest: Rest;
  readonly #token: string;
  readonly #version: ApiVersion.V10;
  readonly #encoding: EncodingType;
  readonly #compress: CompressionType | null;
  readonly #intents: BitFieldManager<GatewayIntentsBits>;
  readonly #largeThreshold: number;
  readonly #presence?: UpdatePresenceEntity;

  #ws: WebSocket | null = null;
  #state: ConnectionState = {
    reconnectAttempts: 0,
    isReconnecting: false,
    lastSequenceNumber: -1,
    sessionId: null,
    wsUrl: null,
    resumeUrl: null,
    heartbeatInterval: null,
    heartbeatsMissed: 0,
    lastHeartbeatAck: true,
  };

  readonly #shardManager: ShardManager;
  readonly #sessionManager: SessionManager;
  readonly #rateLimitManager: RateLimitManager;
  readonly #compressionManager: CompressionManager;
  readonly #encodingManager: EncodingManager;

  constructor(rest: Rest, options: GatewayOptions) {
    super();

    this.#rest = rest;
    this.#token = options.token ?? rest.token.value;
    this.#version = options.version ?? ApiVersion.V10;
    this.#encoding = options.encoding ?? EncodingType.Json;
    this.#compress = options.compress ?? null;
    this.#intents = BitFieldManager.combine(options.intents);
    this.#largeThreshold =
      options.largeThreshold ?? Gateway.DEFAULT_LARGE_THRESHOLD;
    this.#presence = options.presence;

    this.#shardManager = new ShardManager(options);
    this.#sessionManager = new SessionManager();
    this.#rateLimitManager = new RateLimitManager(options);
    this.#compressionManager = new CompressionManager(this.#compress);
    this.#encodingManager = new EncodingManager(this.#encoding);
  }

  get sessionId(): string | null {
    return this.#state.sessionId;
  }

  get sequence(): number {
    return this.#state.lastSequenceNumber;
  }

  get readyState(): number {
    return this.#ws?.readyState ?? WebSocket.CLOSED;
  }

  async connect(): Promise<void> {
    try {
      const gatewayInfo = await this.#fetchGatewayBot();
      await this.#initializeConnection(gatewayInfo);
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
    this.#sendPayload({
      op: GatewayOpcodes.PresenceUpdate,
      d: presence,
      s: null,
      t: null,
    });
  }

  updateVoiceState(options: UpdateVoiceStateEntity): void {
    this.emit("debug", `Updating voice state for guild ${options.guild_id}`);
    this.#sendPayload({
      op: GatewayOpcodes.VoiceStateUpdate,
      d: options,
      s: null,
      t: null,
    });
  }

  requestGuildMembers(options: RequestGuildMembersEntity): void {
    this.emit(
      "debug",
      `Requesting guild members for guild ${options.guild_id}`,
    );
    this.#sendPayload({
      op: GatewayOpcodes.RequestGuildMembers,
      d: options,
      s: null,
      t: null,
    });
  }

  async destroy(code: number = GatewayCloseCodes.UnknownError): Promise<void> {
    this.emit("debug", `Destroying connection with code ${code}`);
    await this.#cleanup();

    if (this.#ws) {
      this.#ws.close(code);
      this.#ws = null;
    }
  }

  async #initializeConnection(
    gatewayInfo: GatewayBotResponseEntity,
  ): Promise<void> {
    this.#sessionManager.updateStartLimit(gatewayInfo.session_start_limit);

    if (this.#shardManager.isAutoMode) {
      this.#state.wsUrl = gatewayInfo.url;
      if (!this.#shardManager.isInitialized) {
        this.#shardManager.initialize(
          gatewayInfo.shards,
          gatewayInfo.session_start_limit.max_concurrency,
        );
      }
    }

    const wsUrl = await this.#buildGatewayUrl(
      this.#state.wsUrl ?? gatewayInfo.url,
    );

    this.#ws = new WebSocket(wsUrl);
    this.#state.sessionId = await this.#sessionManager.createSession(0);

    await this.#setupWebSocket();
  }

  async #setupWebSocket(): Promise<void> {
    if (!this.#ws) {
      throw new Error("No WebSocket instance available");
    }

    return new Promise((resolve, reject) => {
      if (!this.#ws) {
        return reject(new Error("WebSocket not initialized"));
      }

      this.#ws.on("open", () => {
        this.emit("debug", "WebSocket connection established");
        resolve();
      });

      this.#ws.on("message", async (data: Buffer) => {
        try {
          const payload = await this.#processIncomingData(data);
          await this.#handlePayload(payload);
        } catch (error) {
          this.emit(
            "error",
            this.#wrapError("Failed to process message", error),
          );
        }
      });

      this.#ws.on("close", async (code: number) => {
        this.emit("close", code, this.#getCloseCodeDescription(code));
        await this.#handleClose(code);
      });

      this.#ws.on("error", (error: Error) => {
        this.emit("error", error);
        reject(error);
      });
    });
  }

  async #handlePayload(payload: PayloadEntity): Promise<void> {
    if (payload.s !== null) {
      this.#state.lastSequenceNumber = payload.s;
    }

    switch (payload.op) {
      case GatewayOpcodes.Dispatch:
        this.#handleDispatch(payload);
        break;

      case GatewayOpcodes.Hello:
        await this.#handleHello(payload);
        break;

      case GatewayOpcodes.Heartbeat:
        await this.#sendHeartbeat();
        break;

      case GatewayOpcodes.HeartbeatAck:
        this.#handleHeartbeatAck();
        break;

      case GatewayOpcodes.InvalidSession:
        await this.#handleInvalidSession(payload.d as boolean);
        break;

      case GatewayOpcodes.Reconnect:
        await this.#handleReconnect();
        break;

      default:
        this.emit("debug", `Unhandled payload op: ${payload.op}`);
    }
  }

  async #handleHello(payload: PayloadEntity): Promise<void> {
    const { heartbeat_interval } = payload.d as HelloEntity;

    if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) {
      throw new Error("Connection not ready for HELLO");
    }

    try {
      await this.#setupHeartbeat(heartbeat_interval);

      if (
        this.#state.sessionId &&
        this.#sessionManager.canResumeSession(this.#state.sessionId)
      ) {
        this.#sendResume();
      } else {
        await this.#identify();
      }
    } catch (error) {
      this.emit("error", this.#wrapError("Failed to handle HELLO", error));
      await this.destroy();
      throw error;
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
      payload.t as keyof GatewayReceiveEventsMap,
      payload.d as never,
    );
  }

  #handleReady(data: ReadyEntity): void {
    this.#state.sessionId = data.session_id;
    this.#state.resumeUrl = data.resume_gateway_url;

    if (this.#shardManager.isAutoMode) {
      const shardId = this.#shardManager.getNextShardToSpawn();
      if (shardId !== null) {
        this.#shardManager.updateShardStatus(shardId, "ready");
      }
    }
  }

  async #setupHeartbeat(interval: number): Promise<void> {
    this.#clearHeartbeat();

    const jitter = Math.random();
    const initialDelay = Math.floor(interval * jitter);

    this.emit(
      "debug",
      `Setting up heartbeat (interval: ${interval}ms, calculated jitter: ${jitter}, initial jitter delay: ${initialDelay}ms)`,
    );

    // await this.#wait(initialDelay);
    await this.#sendHeartbeat();

    this.#state.heartbeatInterval = setInterval(() => {
      this.#sendHeartbeat().catch((error) => {
        this.emit("error", this.#wrapError("Failed to send heartbeat", error));
      });
    }, interval);
  }

  async #sendHeartbeat(): Promise<void> {
    if (!this.#state.lastHeartbeatAck) {
      this.#state.heartbeatsMissed++;

      if (
        this.#state.heartbeatsMissed >= Gateway.ZOMBIED_CONNECTION_THRESHOLD
      ) {
        this.emit("debug", "Connection appears to be zombied, reconnecting");
        await this.destroy();
        return;
      }
    }

    this.#state.lastHeartbeatAck = false;
    this.#sendPayload({
      op: GatewayOpcodes.Heartbeat,
      d: this.#state.lastSequenceNumber,
      s: null,
      t: null,
    });
  }

  #handleHeartbeatAck(): void {
    this.#state.lastHeartbeatAck = true;
    this.#state.heartbeatsMissed = 0;
  }

  async #identify(): Promise<void> {
    const payload: IdentifyEntity = {
      token: this.#token,
      properties: {
        os: process.platform,
        browser: "nyx.js",
        device: "nyx.js",
      },
      compress: Boolean(this.#compress),
      large_threshold: this.#largeThreshold,
      intents: Number(this.#intents.valueOf()),
    };

    if (this.#shardManager.isAutoMode) {
      const shardId = this.#shardManager.getNextShardToSpawn();
      if (shardId !== null) {
        payload.shard = [shardId, this.#shardManager.totalShards];
        await this.#rateLimitManager.acquireIdentify(shardId);
      }
    }

    if (this.#presence) {
      payload.presence = this.#presence;
    }

    this.#sendPayload({
      op: GatewayOpcodes.Identify,
      d: payload,
      s: null,
      t: null,
    });
  }

  #sendResume(): void {
    if (!this.#state.sessionId) {
      throw new Error("No session ID available for resume");
    }

    const payload: ResumeEntity = {
      token: this.#token,
      session_id: this.#state.sessionId,
      seq: this.#state.lastSequenceNumber,
    };

    this.#sendPayload({
      op: GatewayOpcodes.Resume,
      d: payload,
      s: null,
      t: null,
    });
  }

  async #handleClose(code: number): Promise<void> {
    this.#clearHeartbeat();

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

    try {
      await this.#waitForBackoff();

      const wsUrl = await this.#buildGatewayUrl(this.#state.resumeUrl);
      this.#ws = new WebSocket(wsUrl);

      await this.#setupWebSocket();
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
    try {
      await this.#cleanup();
      await this.#waitForBackoff();
      await this.connect();
    } catch (error) {
      this.emit("error", this.#wrapError("Failed to reconnect", error));
    } finally {
      this.#state.isReconnecting = false;
    }
  }

  async #handleInvalidSession(resumable: boolean): Promise<void> {
    if (
      resumable &&
      this.#state.sessionId &&
      this.#sessionManager.canResumeSession(this.#state.sessionId)
    ) {
      await this.#handleResume();
    } else {
      this.#invalidateSession();
      await this.#handleReconnect();
    }
  }

  async #fetchGatewayBot(): Promise<GatewayBotResponseEntity> {
    try {
      return await this.#rest.getRouter("gateway").getGatewayBot();
    } catch (error) {
      throw this.#wrapError("Failed to fetch gateway information", error);
    }
  }

  async #buildGatewayUrl(baseUrl: string): Promise<string> {
    const params = new URLSearchParams({
      v: String(this.#version),
      encoding: this.#encoding,
    });

    if (this.#compress) {
      params.append("compress", this.#compress);
      await this.#compressionManager.initializeCompression();
    }

    return `${baseUrl}?${params.toString()}`;
  }

  async #processIncomingData(data: Buffer): Promise<PayloadEntity> {
    let processedData = data;

    if (this.#compress) {
      processedData = await this.#compressionManager.decompress(data);
    }

    return this.#encodingManager.decode(processedData);
  }

  #sendPayload(payload: PayloadEntity): void {
    if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) {
      throw new Error("No active WebSocket connection");
    }

    try {
      const data = this.#encodingManager.encode(payload);
      this.#ws.send(data);
      this.emit("debug", `Sent payload with op ${payload.op}`);
    } catch (error) {
      throw this.#wrapError("Failed to send payload", error);
    }
  }

  async #cleanup(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
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
        this.#sessionManager.destroy();

        resolve();
      } catch (error) {
        reject(this.#wrapError("Failed to cleanup resources", error));
      }
    });
  }

  #clearHeartbeat(): void {
    if (this.#state.heartbeatInterval) {
      clearInterval(this.#state.heartbeatInterval);
      this.#state.heartbeatInterval = null;
    }
  }

  #invalidateSession(): void {
    if (this.#state.sessionId) {
      this.#sessionManager.deleteSession(this.#state.sessionId);
      this.#state.sessionId = null;
    }
    this.#state.lastSequenceNumber = -1;
  }

  #shouldResume(closeCode: number): boolean {
    const nonResumableCodes = [
      GatewayCloseCodes.AuthenticationFailed,
      GatewayCloseCodes.InvalidShard,
      GatewayCloseCodes.ShardingRequired,
      GatewayCloseCodes.InvalidApiVersion,
      GatewayCloseCodes.InvalidIntents,
      GatewayCloseCodes.DisallowedIntents,
    ];

    const isClean = closeCode === 1000 || closeCode === 1001;
    return !(isClean || nonResumableCodes.includes(closeCode));
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

  #getCloseCodeDescription(code: number): string {
    return GatewayCloseCodes[code] ?? "Unknown close code";
  }

  #wrapError(message: string, error: unknown): Error {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Error(`${message}: ${errorMessage}`);
  }
}
