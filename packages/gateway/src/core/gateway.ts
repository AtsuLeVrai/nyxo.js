import { setTimeout } from "node:timers/promises";
import type { UnavailableGuildEntity } from "@nyxjs/core";
import type { GatewayBotResponseEntity, Rest } from "@nyxjs/rest";
import { EventEmitter } from "eventemitter3";
import WebSocket from "ws";
import type { z } from "zod";
import { fromError, fromZodError } from "zod-validation-error";
import {
  type GuildCreateEntity,
  type HelloEntity,
  IdentifyEntity,
  type ReadyEntity,
  type RequestGuildMembersEntity,
  type RequestSoundboardSoundsEntity,
  type UpdatePresenceEntity,
  type UpdateVoiceStateEntity,
} from "../events/index.js";
import { HeartbeatManager, ShardManager } from "../managers/index.js";
import { GatewayOptions } from "../options/index.js";
import { CompressionService, EncodingService } from "../services/index.js";
import {
  type GatewayEvents,
  GatewayOpcodes,
  type GatewayReceiveEvents,
  type GatewaySendEvents,
  type PayloadEntity,
} from "../types/index.js";

const NON_RESUMABLE_CODES: number[] = [
  4004, 4010, 4011, 4012, 4013, 4014,
] as const;

export class Gateway extends EventEmitter<GatewayEvents> {
  readonly heartbeat: HeartbeatManager;
  readonly shard: ShardManager;
  readonly compression: CompressionService;
  readonly encoding: EncodingService;

  #sessionId: string | null = null;
  #resumeUrl: string | null = null;
  #sequence = 0;
  #reconnectionAttempts = 0;

  #ws: WebSocket | null = null;
  #connectStartTime = 0;

  readonly #rest: Rest;
  readonly #options: GatewayOptions;

  constructor(rest: Rest, options: z.input<typeof GatewayOptions>) {
    super();

    try {
      this.#options = GatewayOptions.parse(options);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.#rest = rest;

    this.heartbeat = new HeartbeatManager(this, this.#options.heartbeat);
    this.shard = new ShardManager(this, this.#options.shard);
    this.compression = new CompressionService(this.#options.compressionType);
    this.encoding = new EncodingService(this.#options.encodingType);
  }

  get options(): GatewayOptions {
    return this.#options;
  }

  get readyState(): number {
    return this.#ws?.readyState ?? WebSocket.CLOSED;
  }

  get connectStartTime(): number {
    return this.#connectStartTime;
  }

  get webSocket(): WebSocket | null {
    return this.#ws;
  }

  get sequence(): number {
    return this.#sequence;
  }

  get sessionId(): string | null {
    return this.#sessionId;
  }

  get resumeUrl(): string | null {
    return this.#resumeUrl;
  }

  setSession(sessionId: string, resumeUrl: string): void {
    this.#sessionId = sessionId;
    this.#resumeUrl = resumeUrl;
  }

  updateSequence(sequence: number): void {
    this.#sequence = sequence;
  }

  updatePresence(presence: z.input<typeof UpdatePresenceEntity>): void {
    if (!this.isConnectionValid()) {
      throw new Error("WebSocket connection is not open");
    }

    this.emit("debug", "Updating presence:", presence);
    this.send(GatewayOpcodes.PresenceUpdate, presence);
  }

  updateVoiceState(options: z.input<typeof UpdateVoiceStateEntity>): void {
    if (!this.isConnectionValid()) {
      throw new Error("WebSocket connection is not open");
    }

    this.emit("debug", `Updating voice state for guild ${options.guild_id}`);
    this.send(GatewayOpcodes.VoiceStateUpdate, options);
  }

  requestGuildMembers(
    options: z.input<typeof RequestGuildMembersEntity>,
  ): void {
    if (!this.isConnectionValid()) {
      throw new Error("WebSocket connection is not open");
    }

    this.emit(
      "debug",
      `Requesting guild members for guild ${options.guild_id}`,
    );
    this.send(GatewayOpcodes.RequestGuildMembers, options);
  }

  requestSoundboardSounds(
    options: z.input<typeof RequestSoundboardSoundsEntity>,
  ): void {
    if (!this.isConnectionValid()) {
      throw new Error("WebSocket connection is not open");
    }

    this.emit("debug", "Requesting soundboard sounds");
    this.send(GatewayOpcodes.RequestSoundboardSounds, options);
  }

  async connect(): Promise<void> {
    try {
      this.#connectStartTime = Date.now();

      const initializationPromises: [
        Promise<GatewayBotResponseEntity>,
        ...Promise<void>[],
      ] = [this.#rest.gateway.getGatewayBot()];

      if (this.encoding.type === "etf") {
        initializationPromises.push(this.encoding.initialize());
      }

      if (this.compression.type) {
        initializationPromises.push(this.compression.initialize());
      }

      const [gatewayInfo] = await Promise.all(initializationPromises);

      if (this.shard.isEnabled()) {
        const guilds = await this.#rest.users.getCurrentUserGuilds();
        await this.shard.spawn(
          guilds.length,
          gatewayInfo.session_start_limit.max_concurrency,
          gatewayInfo.shards,
        );
      }

      await new Promise<void>((resolve, reject) => {
        const onReady = (): void => {
          this.removeListener("error");
          resolve();
        };

        const onError = (error: Error | string): void => {
          this.removeListener("dispatch");
          reject(error);
        };

        this.once("dispatch", (event: keyof GatewayReceiveEvents) => {
          if (event === "READY") {
            onReady();
          }
        });

        this.once("error", onError);

        this.initializeWebSocket(gatewayInfo.url).catch(onError);
      });
    } catch (error) {
      throw new Error("Failed to connect to gateway", { cause: error });
    }
  }

  async initializeWebSocket(url: string): Promise<void> {
    try {
      const wsUrl = this.#buildGatewayUrl(url);
      const ws = new WebSocket(wsUrl);
      this.#ws = ws;

      ws.on("message", this.#handleMessage.bind(this));
      ws.on("close", this.#handleClose.bind(this));

      await new Promise<void>((resolve, reject) => {
        ws.once("open", () => {
          this.emit("debug", `Connection established to ${wsUrl}`);
          resolve();
        });
        ws.once("error", reject);
      });
    } catch (error) {
      throw new Error("Failed to initialize WebSocket", { cause: error });
    }
  }

  send<T extends keyof GatewaySendEvents>(
    opcode: T,
    data: GatewaySendEvents[T],
  ): void {
    if (!this.isConnectionValid()) {
      throw new Error("WebSocket connection is not open");
    }

    const payload: PayloadEntity = {
      op: opcode,
      d: data,
      s: this.sequence,
      t: null,
    };

    this.#ws?.send(this.encoding.encode(payload));
  }

  destroy(code = 1000): void {
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
      this.#sequence = 0;

      this.encoding.destroy();
      this.compression.destroy();
      this.heartbeat.destroy();
      if (this.shard.isEnabled()) {
        this.shard.destroy();
      }

      this.removeAllListeners();
    } catch (error) {
      throw new Error("Failed to destroy gateway connection", {
        cause: error,
      });
    }
  }

  isConnectionValid(): boolean {
    return this.#ws?.readyState === WebSocket.OPEN;
  }

  #handleMessage(data: Buffer): void {
    let processedData = data;

    if (this.compression.isInitialized()) {
      processedData = this.compression.decompress(data);
    }

    const payload = this.encoding.decode(processedData);
    this.#handlePayload(payload);
  }

  #handlePayload(payload: PayloadEntity): void {
    if (payload.s !== null) {
      this.updateSequence(payload.s);
    }

    switch (payload.op) {
      case GatewayOpcodes.Dispatch:
        this.#handleDispatch(payload);
        break;

      case GatewayOpcodes.Hello:
        this.#handleHello(payload.d as HelloEntity).catch((error) =>
          this.emit("error", error),
        );
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

  async #handleHello(hello: HelloEntity): Promise<void> {
    this.heartbeat.start(hello.heartbeat_interval);

    if (this.#canResume()) {
      this.#sendResume();
    } else {
      await this.#identify();
    }
  }

  #handleDispatch(payload: PayloadEntity): void {
    if (!payload.t) {
      return;
    }

    switch (payload.t) {
      case "READY": {
        const data = payload.d as ReadyEntity;
        this.#handleReady(data);
        break;
      }

      case "GUILD_CREATE": {
        if (this.shard.isEnabled()) {
          const data = payload.d as GuildCreateEntity;
          if ("id" in data && !("unavailable" in data)) {
            this.shard.addGuildToShard(data.id);
          }
        }
        break;
      }

      case "GUILD_DELETE": {
        if (this.shard.isEnabled()) {
          const data = payload.d as UnavailableGuildEntity;
          if ("id" in data) {
            this.shard.removeGuildFromShard(data.id);
          }
        }
        break;
      }

      default:
        break;
    }

    this.emit(
      "dispatch",
      payload.t as keyof GatewayReceiveEvents,
      payload.d as never,
    );
  }

  #handleReady(data: ReadyEntity): void {
    this.setSession(data.session_id, data.resume_gateway_url);

    if (this.shard.isEnabled()) {
      const shard = this.shard.getShardInfo(data.shard?.[0] ?? 0);
      if (shard) {
        this.shard.setShardStatus(shard.shardId, "ready");
        const guildIds = data.guilds.map((guild) => guild.id);
        this.shard.addGuildsToShard(shard.shardId, guildIds);
      }
    }

    const readyTime = Date.now() - this.connectStartTime;
    this.emit("sessionUpdate", {
      type: "state",
      sessionId: data.session_id,
      resumeUrl: data.resume_gateway_url,
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

  async #handleClose(code: number): Promise<void> {
    this.heartbeat.destroy();

    if (this.sessionId) {
      this.emit("sessionUpdate", {
        type: "close",
        sessionId: this.sessionId,
        code,
      });
    }

    await this.#handleDisconnect(code);
  }

  async #handleInvalidSession(resumable: boolean): Promise<void> {
    this.emit("sessionUpdate", {
      type: "invalid",
      resumable,
    });

    this.emit("debug", `Invalid session (resumable: ${resumable})`);

    if (resumable && this.#canResume()) {
      await this.#handleResume();
    } else {
      await this.#handleReconnect();
    }
  }

  #shouldResume(code: number): boolean {
    const isClean = code === 1000 || code === 1001;
    return !(isClean || NON_RESUMABLE_CODES.includes(code));
  }

  async #handleReconnect(): Promise<void> {
    if (this.heartbeat.isReconnecting()) {
      this.emit("debug", "Reconnection already in progress, skipping");
      return;
    }

    this.destroy();
    await this.#handleDisconnect(4000);
  }

  async #handleDisconnect(code: number): Promise<void> {
    if (!this.options.heartbeat.autoReconnect) {
      this.emit("debug", "Retry not allowed, stopping reconnection process");
      return;
    }

    this.#incrementReconnectionAttempts();

    const delay = this.#getReconnectionDelay();
    this.emit(
      "debug",
      `Waiting ${delay}ms before reconnecting (attempt ${this.#reconnectionAttempts})`,
    );
    await setTimeout(delay);

    try {
      if (this.#shouldResume(code) && this.#canResume()) {
        this.emit("debug", "Attempting to resume previous session");
        await this.#handleResume();
      } else {
        this.emit("debug", "Starting new connection");
        this.destroy();
        await this.connect();
      }
    } catch (error) {
      this.emit("error", new Error("Reconnection failed", { cause: error }));
      await this.#handleDisconnect(code);
    }
  }

  async #handleResume(): Promise<void> {
    if (!this.#resumeUrl) {
      throw new Error("No resume URL available for session resumption");
    }

    try {
      this.emit("debug", "Attempting to resume session");
      await this.initializeWebSocket(this.#resumeUrl);
      this.#sendResume();
    } catch {
      this.emit("debug", "Resume attempt failed, falling back to reconnect");

      await this.#handleDisconnect(4000);
    }
  }

  #canResume(): boolean {
    return Boolean(this.#sessionId && this.#sequence > 0);
  }

  #sendResume(): void {
    if (!this.#sessionId) {
      throw new Error("No session ID available to resume");
    }

    this.emit("debug", `Resuming session ${this.#sessionId}`);

    this.send(GatewayOpcodes.Resume, {
      token: this.options.token,
      session_id: this.#sessionId,
      seq: this.#sequence,
    });
  }

  async #identify(): Promise<void> {
    const payload: IdentifyEntity = {
      token: this.options.token,
      properties: {
        os: process.platform,
        browser: "nyx.js",
        device: "nyx.js",
      },
      compress: this.compression.isInitialized(),
      large_threshold: this.options.largeThreshold,
      intents: this.options.intents,
    };

    if (this.shard.isEnabled() && this.shard.totalShards > 0) {
      payload.shard = await this.shard.getAvailableShard();
      this.emit("debug", `Using shard ${payload.shard[0]}/${payload.shard[1]}`);
    }

    if (this.options.presence) {
      payload.presence = this.options.presence;
    }

    const result = IdentifyEntity.safeParse(payload);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    this.send(GatewayOpcodes.Identify, result.data);
  }

  #buildGatewayUrl(baseUrl: string): string {
    const params = new URLSearchParams({
      v: String(this.options.version),
      encoding: this.encoding.type,
    });

    if (this.compression.type) {
      params.append("compress", this.compression.type);
    }

    return `${baseUrl}?${params.toString()}`;
  }

  #incrementReconnectionAttempts(): void {
    this.#reconnectionAttempts++;
  }

  #getReconnectionDelay(): number {
    return (
      this.options.backoffSchedule[this.#reconnectionAttempts] ??
      this.options.backoffSchedule.at(-1) ??
      0
    );
  }
}
