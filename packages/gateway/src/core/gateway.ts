import type { GatewayBotResponseEntity, Rest } from "@nyxjs/rest";
import { EventEmitter } from "eventemitter3";
import WebSocket from "ws";
import type { z } from "zod";
import { fromError } from "zod-validation-error";
import type {
  RequestGuildMembersEntity,
  RequestSoundboardSoundsEntity,
  UpdatePresenceEntity,
  UpdateVoiceStateEntity,
} from "../events/index.js";
import { OperationHandler } from "../handlers/index.js";
import { HeartbeatManager, ShardManager } from "../managers/index.js";
import { GatewayOptions } from "../options/index.js";
import {
  CompressionService,
  ConnectionState,
  EncodingService,
  HealthService,
  type HealthStatus,
} from "../services/index.js";
import {
  type GatewayEventHandlers,
  GatewayOpcodes,
  type GatewaySendEvents,
  type PayloadEntity,
} from "../types/index.js";

export class Gateway extends EventEmitter<GatewayEventHandlers> {
  readonly heartbeat: HeartbeatManager;
  readonly shard: ShardManager;
  readonly compression: CompressionService;
  readonly encoding: EncodingService;
  readonly health: HealthService;
  readonly #operationHandler: OperationHandler;

  #sessionId: string | null = null;
  #resumeUrl: string | null = null;
  #sequence = 0;

  #ws: WebSocket | null = null;
  #connectStartTime = 0;
  #healthCheckInterval: NodeJS.Timeout | null = null;

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
    this.health = new HealthService(this.#options.health);

    this.#operationHandler = new OperationHandler(this);

    this.#startHealthCheck();
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

      await this.initializeWebSocket(gatewayInfo.url);
    } catch (error) {
      throw new Error("Failed to connect to gateway", { cause: error });
    }
  }

  updatePresence(presence: z.input<typeof UpdatePresenceEntity>): void {
    if (!this.isConnectionValid()) {
      throw new Error("WebSocket connection is not open");
    }

    this.emit("debug", `Updating presence: ${JSON.stringify(presence)}`);
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

  async initializeWebSocket(url: string): Promise<void> {
    try {
      const wsUrl = this.#buildGatewayUrl(url);
      const ws = new WebSocket(wsUrl);
      this.#ws = ws;

      ws.on("message", this.#handleMessage.bind(this));
      ws.on("close", this.#operationHandler.handleClose.bind(this));

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
      this.#stopHealthCheck();

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

  checkHealth(): HealthStatus {
    return this.health.checkHealth(
      this.#ws,
      this.heartbeat.missedHeartbeats,
      this.heartbeat.latency,
    );
  }

  #handleMessage(data: Buffer): void {
    let processedData = data;

    if (this.compression.isInitialized()) {
      processedData = this.compression.decompress(data);
    }

    const payload = this.encoding.decode(processedData);
    this.#operationHandler.handlePayload(payload);
  }

  #buildGatewayUrl(baseUrl: string): string {
    const params = new URLSearchParams({
      v: String(this.#options.version),
      encoding: this.encoding.type,
    });

    if (this.compression.type) {
      params.append("compress", this.compression.type);
    }

    return `${baseUrl}?${params.toString()}`;
  }

  #startHealthCheck(): void {
    this.#stopHealthCheck();

    this.#healthCheckInterval = setInterval(async () => {
      const healthStatus = this.health.checkHealth(
        this.#ws,
        this.heartbeat.missedHeartbeats,
        this.heartbeat.latency,
      );

      this.emit("healthStatus", healthStatus);

      if (this.health.shouldTakeAction(healthStatus)) {
        await this.#handleUnhealthyConnection(healthStatus);
      }
    }, this.#options.health.healthCheckInterval);
  }

  #stopHealthCheck(): void {
    if (this.#healthCheckInterval) {
      clearInterval(this.#healthCheckInterval);
      this.#healthCheckInterval = null;
    }
  }

  async #handleUnhealthyConnection(status: HealthStatus): Promise<void> {
    this.emit(
      "debug",
      `Taking action for unhealthy connection: ${status.state}`,
    );

    if (status.state === ConnectionState.Disconnected) {
      await this.#operationHandler.handleReconnect();
      return;
    }

    if (status.state === ConnectionState.Unhealthy) {
      if (
        status.details.missedHeartbeats >=
        this.#options.health.zombieConnectionThreshold
      ) {
        this.heartbeat.destroy();
        if (this.#ws) {
          this.#ws.close(4000);
        }
      }

      await this.#operationHandler.handleReconnect();
    }
  }
}
