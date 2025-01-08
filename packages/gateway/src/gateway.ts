import { setTimeout } from "node:timers/promises";
import { BitFieldManager } from "@nyxjs/core";
import type { Rest } from "@nyxjs/rest";
import { EventEmitter } from "eventemitter3";
import WebSocket from "ws";
import {
  GatewayCloseCodes,
  type GatewayEvents,
  GatewayOpcodes,
  GatewayOptions,
  type GatewayReceiveEvents,
  type GatewaySendEvents,
  GatewayStats,
  type HelloEntity,
  IdentifyEntity,
  PayloadEntity,
  type ReadyEntity,
  type RequestGuildMembersEntity,
  type ResumeEntity,
  type UpdatePresenceEntity,
  type UpdateVoiceStateEntity,
} from "./index.js";
import {
  CompressionService,
  EncodingService,
  HeartbeatService,
  ShardService,
} from "./services/index.js";

export class Gateway extends EventEmitter<GatewayEvents> {
  static readonly BACKOFF_SCHEDULE = [1000, 5000, 10000];
  static readonly ZOMBIED_CONNECTION_THRESHOLD = 2;

  readonly #rest: Rest;
  readonly #options: GatewayOptions;
  readonly #compressionService: CompressionService;
  readonly #encodingService: EncodingService;
  readonly #heartbeatService: HeartbeatService;
  readonly #shardService: ShardService;

  #ws: WebSocket | null = null;
  #sessionId: string | null = null;
  #resumeUrl: string | null = null;
  #reconnectAttempts = 0;
  #isReconnecting = false;
  #startTime = Date.now();
  #receivedPayloads = 0;
  #sentPayloads = 0;

  constructor(rest: Rest, options: GatewayOptions) {
    super();
    this.#rest = rest;
    this.#options = GatewayOptions.parse(options);
    this.#compressionService = new CompressionService(
      this.#options.compression,
    );
    this.#encodingService = new EncodingService(this.#options.encoding);
    this.#heartbeatService = new HeartbeatService(
      this,
      this.#options.heartbeat,
    );
    this.#shardService = new ShardService(this.#options.shard);

    this.#initializeEventForwarding(
      this.#heartbeatService,
      this.#compressionService,
      this.#encodingService,
      this.#shardService,
    );
  }

  get ping(): number {
    return this.#heartbeatService.metrics.latency;
  }

  get sessionId(): string | null {
    return this.#sessionId;
  }

  get sequence(): number {
    return this.#heartbeatService.metrics.sequence;
  }

  get readyState(): 0 | 1 | 2 | 3 {
    return this.#ws?.readyState ?? WebSocket.CLOSED;
  }

  get currentStats(): GatewayStats {
    const stats: GatewayStats = {
      ping: this.ping,
      lastHeartbeat: this.#heartbeatService.metrics.lastAck,
      sessionId: this.#sessionId,
      sequence: this.sequence,
      reconnectAttempts: this.#reconnectAttempts,
      uptime: Date.now() - this.#startTime,
      readyState: this.readyState,
      receivedPayloads: this.#receivedPayloads,
      sentPayloads: this.#sentPayloads,
      missedHeartbeats: this.#heartbeatService.metrics.missedHeartbeats,
    };

    return GatewayStats.parse(stats);
  }

  async connect(): Promise<void> {
    this.emit("connecting", this.#reconnectAttempts);

    const [gatewayInfo, guilds] = await Promise.all([
      this.#rest.gateway.getGatewayBot(),
      this.#rest.users.getCurrentUserGuilds(),
    ]);

    if (this.#shardService.currentOptions) {
      await this.#shardService.spawn(
        guilds.data.length,
        gatewayInfo.data.session_start_limit.max_concurrency,
        gatewayInfo.data.shards,
      );
    }

    await this.#initializeWebSocket(gatewayInfo.data.url);
    this.emit("connected");
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
      throw new Error("No active WebSocket connection");
    }

    const payload: PayloadEntity = {
      op: opcode,
      d: data,
      s: this.sequence,
      t: null,
    };

    if (this.#options.validatePayloads) {
      PayloadEntity.parse(payload);
    }

    this.#ws.send(this.#encodingService.encode(payload));
    this.#sentPayloads++;
    this.emit("debug", `[Gateway] Sent payload with op ${opcode}`);
  }

  destroy(code: GatewayCloseCodes = 4000): void {
    this.emit("debug", `[Gateway] Destroying connection with code ${code}`);
    this.#cleanup();

    if (this.#ws) {
      this.#ws.close(code);
      this.#ws = null;
    }
  }

  isHealthy(): boolean {
    return (
      this.readyState === WebSocket.OPEN &&
      this.#heartbeatService.metrics.missedHeartbeats <
        Gateway.ZOMBIED_CONNECTION_THRESHOLD &&
      this.ping < 30000
    );
  }

  async #initializeWebSocket(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.#buildGatewayUrl(url);
        this.#ws = new WebSocket(wsUrl);

        this.#ws.once("open", () => {
          this.emit(
            "debug",
            `[Gateway] WebSocket connection established to ${wsUrl}`,
          );
          resolve();
        });

        this.#ws.once("error", (error) => {
          reject(error);
        });

        this.#ws.on("message", (data: Buffer) => {
          this.#handleMessage(data);
        });

        this.#ws.on("close", async (code: number) => {
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

    if (this.#options.validatePayloads) {
      PayloadEntity.parse(payload);
    }

    this.#receivedPayloads++;
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
        this.#handleInvalidSession(Boolean(payload.d)).catch((error) => {
          throw error;
        });
        break;

      case GatewayOpcodes.Reconnect:
        this.#handleReconnect().catch((error) => {
          throw error;
        });
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
    this.#isReconnecting = false;

    this.emit("sessionStart", data.session_id, data);

    const details = [
      `🤖 ${data.user.username} (${data.application.id})`,
      `📡 Session ${data.session_id}`,
      `🌐 v${data.v} | ${data.guilds.length} guilds`,
      data.shard ? `✨ Shard [${data.shard}]` : "",
    ]
      .filter(Boolean)
      .join("\n");

    this.emit("debug", `[Gateway] ${details}`);
  }

  #identify(): void {
    const payload: IdentifyEntity = {
      token: this.#options.token,
      properties: {
        os: process.platform,
        browser: "nyx.js",
        device: "nyx.js",
      },
      compress: Boolean(this.#options.compression?.compressionType),
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
    if (!this.#sessionId) {
      throw new Error("No session ID available for resume");
    }

    const payload: ResumeEntity = {
      token: this.#options.token,
      session_id: this.#sessionId,
      seq: this.sequence,
    };

    this.send(GatewayOpcodes.Resume, payload);
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
    if (!this.#resumeUrl) {
      this.emit("warn", "No resume URL available, falling back to reconnect");
      await this.#handleReconnect();
      return;
    }

    try {
      await this.#waitForBackoff();
      await this.#initializeWebSocket(this.#resumeUrl);
      this.#sendResume();
    } catch {
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

      if (!this.#options.autoReconnect) {
        this.emit(
          "debug",
          "[Gateway] Auto reconnect disabled, stopping reconnection attempt",
        );
        return;
      }

      if (this.#reconnectAttempts >= this.#options.maxReconnectAttempts) {
        throw new Error(
          `Maximum reconnection attempts (${this.#options.maxReconnectAttempts}) reached`,
        );
      }

      await this.#waitForBackoff();
      await this.connect();
    } finally {
      this.#isReconnecting = false;
    }
  }

  async #handleInvalidSession(resumable: boolean): Promise<void> {
    this.emit("sessionInvalid", resumable);

    if (resumable && this.#canResume()) {
      await this.#handleResume();
    } else {
      this.#sessionId = null;
      await this.#handleReconnect();
    }
  }

  #canResume(): boolean {
    return Boolean(this.#sessionId && this.sequence > 0);
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
      this.#options.maxReconnectAttempts,
    );

    this.emit(
      "debug",
      `[Gateway] Backoff delay: ${backoffTime}ms (attempt: ${this.#reconnectAttempts})`,
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

  #cleanup(): void {
    try {
      this.emit("debug", "[Gateway] Cleaning up connection resources");

      if (this.#ws) {
        this.#ws.removeAllListeners();
        this.#ws = null;
      }

      this.#compressionService.destroy();
      this.#heartbeatService.destroy();
    } catch (error) {
      throw this.#wrapError("Failed to cleanup resources", error);
    }
  }

  #wrapError(message: string, error: unknown): Error {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Error(`${message}: ${errorMessage}`);
  }

  #initializeEventForwarding(...emitter: EventEmitter<GatewayEvents>[]): void {
    const forwardedEvents: (keyof GatewayEvents)[] = [
      "debug",
      "warn",
      "close",
      "dispatch",
      "connecting",
      "connected",
      "reconnecting",
      "sessionStart",
      "sessionEnd",
      "sessionInvalid",
    ];

    for (const service of emitter) {
      for (const event of forwardedEvents) {
        service.on(event, (...args) => {
          this.emit(event, ...args);
        });
      }
    }
  }
}
