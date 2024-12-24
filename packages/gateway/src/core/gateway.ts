import { BitFieldManager } from "@nyxjs/core";
import type { Rest, SessionStartLimitEntity } from "@nyxjs/rest";
import { EventEmitter } from "eventemitter3";
import WebSocket from "ws";
import { GatewayCloseCodes, GatewayOpcodes } from "../enums/index.js";
import type {
  HelloEntity,
  ReadyEntity,
  RequestGuildMembersEntity,
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
  type GatewayEventsMap,
  type GatewayOptions,
  type GatewayReceiveEventsMap,
  type PayloadEntity,
  type ShardOptions,
} from "../types/index.js";

const BACKOFF_SCHEDULE = [1000, 5000, 10000];

export class GatewayManager extends EventEmitter<GatewayEventsMap> {
  readonly #rest: Rest;
  readonly #token: string;
  readonly #version: number;
  readonly #encoding: EncodingType;
  readonly #compress: CompressionType | null;
  readonly #intents: number;
  readonly #largeThreshold: number;
  readonly #shardInfo?: ShardOptions["shard"];
  readonly #presence?: UpdatePresenceEntity;

  #ws: WebSocket | null = null;
  #sequence = -1;
  #sessionId: string | null = null;
  #resumeUrl: string | null = null;
  // @ts-expect-error
  #heartbeatInterval: number | null = null;
  #heartbeatTimer: NodeJS.Timeout | null = null;
  #lastHeartbeatAck = false;
  #resuming = false;
  #connecting = false;
  // @ts-expect-error
  #initialReconnect = true;
  #reconnectAttempts = 0;
  #closeSequence = -1;
  #sessionStartLimit: SessionStartLimitEntity | null = null;
  #currentShardId: number | null = null;

  #shardManager: ShardManager;
  #sessionManager: SessionManager;
  #rateLimitManager: RateLimitManager;
  #compressionManager: CompressionManager;
  #encodingManager: EncodingManager;

  constructor(rest: Rest, options: GatewayOptions) {
    super();

    this.#rest = rest;
    this.#token = options.token;
    this.#version = options.version;
    this.#encoding = options.encoding ?? EncodingType.Json;
    this.#compress = options.compress ?? null;
    this.#intents = Number(BitFieldManager.combine(options.intents).valueOf());
    this.#largeThreshold = options.largeThreshold ?? 50;
    this.#shardInfo = options.shard;
    this.#presence = options.presence;

    this.#shardManager = new ShardManager(options);
    this.#sessionManager = new SessionManager();
    this.#rateLimitManager = new RateLimitManager(options);
    this.#compressionManager = new CompressionManager(this.#compress);
    this.#encodingManager = new EncodingManager(this.#encoding);
  }

  get readyState(): number {
    return this.#ws ? this.#ws.readyState : WebSocket.CLOSED;
  }

  get sequence(): number {
    return this.#sequence;
  }

  get sessionId(): string | null {
    return this.#sessionId;
  }

  get shardInfo(): ShardOptions["shard"] | undefined {
    return this.#shardInfo;
  }

  debug(message: string): void {
    this.emit("debug", `[Gateway] ${message}`);
  }

  warn(message: string): void {
    this.emit("warn", `[Gateway] ${message}`);
  }

  error(message: string, error?: Error): void {
    const errorMessage = error ? `${message}: ${error.message}` : message;
    this.emit("error", `[Gateway] ${errorMessage}`);
    if (error?.stack) {
      this.debug(`Error Stack: ${error.stack}`);
    }
  }

  async connect(url?: string): Promise<void> {
    if (this.#connecting) {
      this.debug("Connection already in progress");
      return;
    }

    this.#connecting = true;
    this.debug(`Initiating gateway connection${url ? ` to ${url}` : ""}`);

    try {
      const gateway = url ?? (await this.#fetchGateway());
      const wsUrl = this.#buildGatewayUrl(gateway);
      this.debug(`Connecting to WebSocket URL: ${wsUrl}`);

      this.#ws = new WebSocket(wsUrl);
      this.#setupWebSocketHandlers();

      await this.#waitForConnection();
      this.debug("Successfully established WebSocket connection");
      this.#connecting = false;
      this.#reconnectAttempts = 0;
    } catch (error) {
      this.#connecting = false;
      this.error("Failed to establish connection", error as Error);
      throw error;
    }
  }

  updatePresence(presence: UpdatePresenceEntity): void {
    this.debug("Updating presence");
    const payload: PayloadEntity = {
      op: GatewayOpcodes.PresenceUpdate,
      d: presence,
      s: null,
      t: null,
    };

    this.#sendPayload(payload);
  }

  updateVoiceState(options: UpdateVoiceStateEntity): void {
    this.debug(`Updating voice state for guild ${options.guild_id}`);
    const payload: PayloadEntity = {
      op: GatewayOpcodes.VoiceStateUpdate,
      d: options,
      s: null,
      t: null,
    };

    this.#sendPayload(payload);
  }

  requestGuildMembers(options: RequestGuildMembersEntity): void {
    this.debug(`Requesting members for guild ${options.guild_id}`);
    const payload: PayloadEntity = {
      op: GatewayOpcodes.RequestGuildMembers,
      d: options,
      s: null,
      t: null,
    };

    this.#sendPayload(payload);
  }

  destroy(code: number = GatewayCloseCodes.UnknownError): void {
    this.debug(`Destroying gateway connection with code ${code}`);

    if (this.#ws) {
      this.#ws.close(code);
    }

    this.#cleanup();
    this.#resetSession();

    this.#sessionManager.destroy();
    this.#shardManager.reset();
    this.#compressionManager.destroy();

    this.debug("Gateway connection destroyed");
  }

  async #startShard(): Promise<void> {
    const nextShardId = this.#shardManager.getNextShardToSpawn();
    if (nextShardId === null) {
      return;
    }

    if (!this.#shardManager.canStartShard(nextShardId)) {
      this.debug(`Cannot start shard ${nextShardId} due to rate limiting`);
      return;
    }

    this.debug(`Starting shard ${nextShardId}`);
    this.#shardManager.updateShardStatus(nextShardId, "connecting");
    this.#currentShardId = nextShardId;

    try {
      await this.#identify(nextShardId);
      this.debug(`Shard ${nextShardId} identified successfully`);
    } catch (error) {
      this.error(`Failed to start shard ${nextShardId}`, error as Error);
      this.#shardManager.updateShardStatus(nextShardId, "disconnected");
      throw error;
    }
  }

  async #identify(shardId?: number): Promise<void> {
    if (!this.#ws) {
      this.warn("Attempted to identify without WebSocket connection");
      throw new Error("No WebSocket connection");
    }

    if (this.#resuming && this.#canResume()) {
      this.debug("Attempting to resume session");
      this.#resume();
      return;
    }

    await this.#rateLimitManager.acquireIdentify(shardId ?? 0);

    const totalShards = this.#shardManager.totalShards;
    const currentShard =
      shardId !== undefined ? [shardId, totalShards] : undefined;

    this.debug(
      `Sending identify payload${currentShard ? ` for shard ${currentShard[0]}/${currentShard[1]}` : ""}`,
    );

    const payload: PayloadEntity = {
      op: GatewayOpcodes.Identify,
      s: null,
      t: null,
      d: {
        token: this.#token,
        properties: {
          os: process.platform,
          browser: "nyx.js",
          device: "nyx.js",
        },
        compress: Boolean(this.#compress),
        large_threshold: this.#largeThreshold,
        shard: currentShard,
        presence: this.#presence,
        intents: this.#intents,
      },
    };

    this.#sendPayload(payload);
  }

  #resume(): void {
    if (!(this.#sessionId && this.#sequence)) {
      this.warn("Cannot resume without session id and sequence");
      throw new Error("Cannot resume without session id and sequence");
    }

    this.debug(
      `Resuming session ${this.#sessionId} from sequence ${this.#sequence}`,
    );
    const payload: PayloadEntity = {
      op: GatewayOpcodes.Resume,
      d: {
        token: this.#token,
        session_id: this.#sessionId,
        seq: this.#sequence,
      },
      s: null,
      t: null,
    };

    this.#sendPayload(payload);
  }

  #startHeartbeat(interval: number): void {
    this.debug(`Starting heartbeat with interval ${interval}ms`);
    this.#stopHeartbeat();

    const jitter = Math.random();
    const firstDelay = Math.floor(interval * jitter);
    this.debug(`First heartbeat in ${firstDelay}ms`);

    this.#heartbeatInterval = interval;
    this.#lastHeartbeatAck = true;

    this.#heartbeatTimer = setTimeout(() => {
      this.#sendHeartbeat();

      this.#heartbeatTimer = setInterval(() => {
        this.#sendHeartbeat();
      }, interval);

      this.debug("Heartbeat interval established");
    }, firstDelay);
  }

  #stopHeartbeat(): void {
    if (this.#heartbeatTimer) {
      this.debug("Stopping heartbeat");
      clearInterval(this.#heartbeatTimer);
      this.#heartbeatTimer = null;
    }
    this.#heartbeatInterval = null;
    this.#lastHeartbeatAck = false;
  }

  #sendHeartbeat(): void {
    if (!this.#lastHeartbeatAck) {
      this.warn(
        "No heartbeat acknowledgement received, connection may be zombied",
      );
      this.#handleZombiedConnection();
      return;
    }

    this.debug(`Sending heartbeat with sequence ${this.#sequence}`);
    const payload: PayloadEntity = {
      op: GatewayOpcodes.Heartbeat,
      d: this.#sequence,
      s: null,
      t: null,
    };

    this.#lastHeartbeatAck = false;
    this.#sendPayload(payload);
  }

  #handleZombiedConnection(): void {
    this.warn("Handling zombied connection");
    this.#closeSequence = this.#sequence;
    this.#ws?.close(GatewayCloseCodes.UnknownError);
  }

  async #handlePayload(payload: PayloadEntity): Promise<void> {
    if (payload.s !== null) {
      this.debug(`Updating sequence to ${payload.s}`);
      this.#sequence = payload.s;
    }

    switch (payload.op) {
      case GatewayOpcodes.Dispatch: {
        this.debug(`Received dispatch op with type ${payload.t}`);
        this.#handleDispatch(payload);
        break;
      }

      case GatewayOpcodes.Hello: {
        const { heartbeat_interval } = payload.d as HelloEntity;
        this.debug(
          `Received HELLO with heartbeat interval ${heartbeat_interval}ms`,
        );
        this.#startHeartbeat(heartbeat_interval);
        if (
          this.#shardManager.totalShards > 1 &&
          this.#currentShardId !== null
        ) {
          await this.#startShard();
        } else if (this.#shardManager.totalShards === 1) {
          await this.#identify();
        }
        break;
      }

      case GatewayOpcodes.HeartbeatAck: {
        this.debug("Received heartbeat acknowledgement");
        this.#lastHeartbeatAck = true;
        break;
      }

      case GatewayOpcodes.Heartbeat: {
        this.debug("Received heartbeat request");
        this.#sendHeartbeat();
        break;
      }

      case GatewayOpcodes.Reconnect: {
        this.debug("Received reconnect request");
        await this.#handleReconnect();
        break;
      }

      case GatewayOpcodes.InvalidSession: {
        this.debug(
          `Received invalid session (resumable: ${Boolean(payload.d)})`,
        );
        await this.#handleInvalidSession(Boolean(payload.d));
        break;
      }

      default:
        this.warn(`Received unknown opcode: ${payload.op}`);
        break;
    }
  }

  #handleDispatch(payload: PayloadEntity): void {
    if (!payload.t) {
      this.warn("Received dispatch without event type");
      return;
    }

    this.debug(`Handling dispatch event: ${payload.t}`);

    switch (payload.t) {
      case "READY": {
        const ready = payload.d as ReadyEntity;
        this.#sessionId = ready.session_id;
        this.#resumeUrl = ready.resume_gateway_url;
        this.debug(`Received READY with session ID: ${ready.session_id}`);

        if (ready.shard) {
          const [shardId] = ready.shard;
          this.#shardManager.updateShardStatus(shardId, "ready");
        }

        this.#initialReconnect = false;
        break;
      }

      case "RESUMED": {
        this.debug("Session resumed successfully");
        this.#resuming = false;
        break;
      }

      default:
        this.debug(`Emitting event: ${payload.t}`);
        break;
    }

    this.emit(
      "dispatch",
      payload.t as keyof GatewayReceiveEventsMap,
      payload.d as never,
    );
  }

  async #handleReconnect(): Promise<void> {
    this.debug("Handling reconnect request");
    this.#closeSequence = this.#sequence;
    await this.#reconnect(true);
  }

  async #handleInvalidSession(resumable: boolean): Promise<void> {
    this.debug(`Handling invalid session (resumable: ${resumable})`);

    if (resumable && this.#canResume()) {
      this.debug("Attempting to resume invalid session");
      await this.#reconnect(true);
      return;
    }

    this.debug("Session cannot be resumed, starting new session");
    this.#sequence = -1;
    this.#sessionId = null;
    this.#resumeUrl = null;

    await this.#waitForBackoff();
    await this.#reconnect(false);
  }

  async #reconnect(resume: boolean): Promise<void> {
    this.debug(`Initiating ${resume ? "resume" : "new"} connection`);
    this.#resuming = resume;

    if (this.#ws) {
      this.#ws.close();
      this.#cleanup();
    }

    const url = resume && this.#resumeUrl ? this.#resumeUrl : undefined;
    await this.connect(url);
  }

  async #waitForBackoff(): Promise<void> {
    const backoffTime =
      BACKOFF_SCHEDULE[this.#reconnectAttempts] ?? BACKOFF_SCHEDULE.at(-1);
    this.#reconnectAttempts = Math.min(
      this.#reconnectAttempts + 1,
      BACKOFF_SCHEDULE.length - 1,
    );

    this.debug(
      `Waiting ${backoffTime}ms before reconnecting (attempt ${this.#reconnectAttempts})`,
    );
    await new Promise((resolve) => setTimeout(resolve, backoffTime));
  }

  #setupWebSocketHandlers(): void {
    if (!this.#ws) {
      this.warn("Attempted to setup handlers without WebSocket connection");
      return;
    }

    this.#ws.on("message", async (data: Buffer) => {
      try {
        this.debug("Received WebSocket message");
        let decompressed: Buffer | string = data;

        if (this.#compress) {
          this.debug("Decompressing received data");
          decompressed = await this.#compressionManager.decompress(data);
        }

        const payload = this.#encodingManager.decode(decompressed);
        this.debug(`Decoded payload with op ${payload.op}`);
        await this.#handlePayload(payload);
      } catch (error) {
        this.error("Error processing WebSocket message", error as Error);
        this.emit(
          "error",
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    });

    this.#ws.on("close", async (code: number) => {
      this.debug(`WebSocket closed with code ${code}`);
      this.#cleanup();

      if (code === 1000 || code === 1001) {
        this.debug("Clean WebSocket closure");
        return;
      }

      const resumable = this.#isResumeableCloseCode(code);
      this.debug(`Connection close is ${resumable ? "" : "not "}resumable`);

      if (resumable && this.#canResume()) {
        this.debug("Attempting to resume after connection close");
        await this.#waitForBackoff();
        await this.#reconnect(true);
      } else {
        this.debug("Starting new session after connection close");
        this.#resetSession();
        await this.#waitForBackoff();
        await this.#reconnect(false);
      }
    });

    this.#ws.on("error", (error: Error) => {
      this.error("WebSocket error occurred", error);
      this.emit("error", error);
    });
  }

  async #fetchGateway(): Promise<string> {
    this.debug("Fetching gateway bot information");
    try {
      const data = await this.#rest.getRouter("gateway").getGatewayBot();
      this.#sessionStartLimit = data.session_start_limit;
      this.debug(
        `Session start limit: ${JSON.stringify(this.#sessionStartLimit)}`,
      );

      if (data.shards > 1) {
        if (this.#shardManager.totalShards === 1) {
          this.#shardManager.initialize(
            data.shards,
            data.session_start_limit.max_concurrency,
          );
        } else if (!this.#shardManager.validateShardCount(0, data.shards)) {
          throw new Error(
            `Invalid shard count. Required: ${data.shards}, Current: ${this.#shardManager.totalShards}`,
          );
        }
      }

      this.debug(`Gateway URL obtained: ${data.url}`);
      return data.url;
    } catch (error) {
      this.error("Failed to fetch gateway information", error as Error);
      throw error;
    }
  }

  #buildGatewayUrl(baseUrl: string): string {
    const params = new URLSearchParams({
      v: String(this.#version),
      encoding: this.#encoding,
    });

    if (this.#compress) {
      params.append("compress", this.#compress);
    }

    const url = `${baseUrl}?${params.toString()}`;
    this.debug(`Built gateway URL: ${url}`);
    return url;
  }

  #sendPayload(payload: PayloadEntity): void {
    if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) {
      const error = new Error("WebSocket is not connected");
      this.error("Failed to send payload", error);
      throw error;
    }

    try {
      this.debug(`Sending payload with op ${payload.op}`);
      const encoded = this.#encodingManager.encode(payload);
      this.#ws.send(encoded);
      this.debug("Payload sent successfully");
    } catch (error) {
      this.error("Failed to encode or send payload", error as Error);
      throw new Error(
        `Failed to send payload: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  #waitForConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.#ws) {
        this.error("No WebSocket instance available");
        return reject(new Error("No WebSocket instance"));
      }

      this.debug("Waiting for WebSocket connection to establish");

      const cleanup = (): void => {
        this.#ws?.removeListener("open", onOpen);
        this.#ws?.removeListener("error", onError);
        this.#ws?.removeListener("close", onClose);
      };

      const onOpen = (): void => {
        this.debug("WebSocket connection established");
        cleanup();
        resolve();
      };

      const onError = (error: Error): void => {
        this.error("WebSocket connection error", error);
        cleanup();
        reject(error);
      };

      const onClose = (): void => {
        const error = new Error(
          "WebSocket closed before connection established",
        );
        this.error("Premature WebSocket closure", error);
        cleanup();
        reject(error);
      };

      this.#ws.on("open", onOpen);
      this.#ws.on("error", onError);
      this.#ws.on("close", onClose);
    });
  }

  #cleanup(): void {
    this.debug("Cleaning up WebSocket resources");
    this.#stopHeartbeat();

    if (this.#ws) {
      this.#ws.removeAllListeners();
      this.#ws = null;
    }
  }

  #resetSession(): void {
    this.debug("Resetting session state");
    this.#sequence = -1;
    this.#sessionId = null;
    this.#resumeUrl = null;
    this.#resuming = false;
    this.#connecting = false;
    this.#closeSequence = -1;
  }

  #canResume(): boolean {
    const canResume = !!(
      this.#sessionId &&
      this.#sequence > 0 &&
      this.#resumeUrl &&
      this.#closeSequence === this.#sequence
    );
    this.debug(`Session ${canResume ? "can" : "cannot"} be resumed`);
    return canResume;
  }

  #isResumeableCloseCode(code: number): boolean {
    const nonResumableCodes = [
      GatewayCloseCodes.AuthenticationFailed,
      GatewayCloseCodes.InvalidShard,
      GatewayCloseCodes.ShardingRequired,
      GatewayCloseCodes.InvalidApiVersion,
      GatewayCloseCodes.InvalidIntents,
      GatewayCloseCodes.DisallowedIntents,
    ];

    const isResumeable = !nonResumableCodes.includes(code);
    this.debug(`Close code ${code} is ${isResumeable ? "" : "not "}resumeable`);
    return isResumeable;
  }
}
