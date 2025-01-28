import type { Rest } from "@nyxjs/rest";
import { EventEmitter } from "eventemitter3";
import WebSocket from "ws";
import type { z } from "zod";
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
  EncodingService,
  HealthService,
  ReconnectionService,
  SessionService,
} from "../services/index.js";
import {
  ConnectionState,
  type GatewayCloseCodes,
  type GatewayDiagnostics,
  type GatewayEvents,
  GatewayOpcodes,
  type GatewaySendEvents,
  type HealthStatus,
  type PayloadEntity,
} from "../types/index.js";

export class Gateway extends EventEmitter<GatewayEvents> {
  readonly heartbeat: HeartbeatManager;
  readonly shard: ShardManager;
  readonly compression: CompressionService;
  readonly encoding: EncodingService;
  readonly health: HealthService;
  readonly session: SessionService;
  readonly reconnection: ReconnectionService;
  readonly #operationHandler: OperationHandler;

  #ws: WebSocket | null = null;
  #connectStartTime = 0;
  #healthCheckInterval: NodeJS.Timeout | null = null;

  readonly #rest: Rest;
  readonly #options: GatewayOptions;

  constructor(rest: Rest, options: z.input<typeof GatewayOptions>) {
    super();

    try {
      this.#rest = rest;
      this.#options = GatewayOptions.parse(options);

      this.heartbeat = new HeartbeatManager(this, this.#options.heartbeat);
      this.shard = new ShardManager(this, this.#options.shard);

      this.compression = new CompressionService(this.#options.compressionType);
      this.encoding = new EncodingService(this.#options.encodingType);
      this.session = new SessionService();
      this.reconnection = new ReconnectionService();
      this.health = new HealthService(this.#options.health);

      this.#operationHandler = new OperationHandler(this);

      this.#startHealthCheck();
    } catch (error) {
      throw new Error("Failed to initialize gateway", {
        cause: error,
      });
    }
  }

  get options(): Readonly<GatewayOptions> {
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

  async connect(): Promise<void> {
    try {
      this.#connectStartTime = Date.now();
      this.emit("connectionUpdate", { type: "initial" });

      const [gatewayInfo, guilds] = await Promise.all([
        this.#rest.gateway.getGatewayBot(),
        this.#rest.users.getCurrentUserGuilds(),
      ]);

      await this.shard.spawn(
        guilds.length,
        gatewayInfo.session_start_limit.max_concurrency,
        gatewayInfo.shards,
      );

      await this.initializeWebSocket(gatewayInfo.url);
    } catch (error) {
      throw new Error("Failed to connect to gateway", {
        cause: error,
      });
    }
  }

  updatePresence(presence: z.input<typeof UpdatePresenceEntity>): void {
    if (!this.#isConnectionValid()) {
      throw new Error("WebSocket connection is not open");
    }

    this.emit("debug", `Updating presence: ${JSON.stringify(presence)}`);
    this.send(GatewayOpcodes.PresenceUpdate, presence);
  }

  updateVoiceState(options: z.input<typeof UpdateVoiceStateEntity>): void {
    if (!this.#isConnectionValid()) {
      throw new Error("WebSocket connection is not open");
    }

    this.emit("debug", `Updating voice state for guild ${options.guild_id}`);
    this.send(GatewayOpcodes.VoiceStateUpdate, options);
  }

  requestGuildMembers(
    options: z.input<typeof RequestGuildMembersEntity>,
  ): void {
    if (!this.#isConnectionValid()) {
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
    if (!this.#isConnectionValid()) {
      throw new Error("WebSocket connection is not open");
    }

    this.emit("debug", "Requesting soundboard sounds");
    this.send(GatewayOpcodes.RequestSoundboardSounds, options);
  }

  async initializeWebSocket(url: string): Promise<void> {
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
          this.emit("error", error);
          reject(error);
        });

        ws.on("message", this.#handleMessage.bind(this));
        ws.on("close", this.#handleClose.bind(this));
      } catch (error) {
        reject(
          new Error("Failed to initialize WebSocket", {
            cause: error,
          }),
        );
      }
    });
  }

  send<T extends keyof GatewaySendEvents>(
    opcode: T,
    data: GatewaySendEvents[T],
  ): void {
    if (!this.#isConnectionValid()) {
      throw new Error("WebSocket connection is not open");
    }

    const payload: PayloadEntity = {
      op: opcode,
      d: data,
      s: this.session.sequence,
      t: null,
    };

    this.#ws?.send(this.encoding.encode(payload));
  }

  canRetry(): boolean {
    if (!this.#options.heartbeat.autoReconnect) {
      this.emit("debug", "Auto reconnect disabled");
      return false;
    }
    return true;
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

      this.session.reset();
      this.reconnection.reset();

      this.compression.destroy();
      this.heartbeat.destroy();

      if (this.shard.isEnabled()) {
        this.shard.destroy();
      }

      this.#stopHealthCheck();
    } catch (error) {
      throw new Error("Failed to destroy gateway connection", {
        cause: error,
      });
    }
  }

  isHealthy(): boolean {
    return this.health.isHealthy(
      this.#ws,
      this.heartbeat.missedHeartbeats,
      this.heartbeat.latency,
    );
  }

  getDiagnostics(): GatewayDiagnostics {
    return {
      connectionState: {
        readyState: this.readyState,
        isHealthy: this.isHealthy(),
        reconnectAttempts: this.reconnection.attempts,
        sessionId: this.session.sessionId,
      },
      heartbeat: {
        latency: this.heartbeat.latency,
        missedHeartbeats: this.heartbeat.missedHeartbeats,
        sequence: this.session.sequence,
        isRunning: this.heartbeat.isRunning(),
      },
      sharding: {
        isEnabled: this.shard.isEnabled(),
        totalShards: this.shard.totalShards,
        currentShardId: this.shard.getCurrentShardId(),
      },
      timing: {
        connectStartTime: this.#connectStartTime,
        uptime: Date.now() - this.#connectStartTime,
      },
    };
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

    if (payload.s !== null) {
      this.session.updateSequence(payload.s);
    }

    this.#operationHandler.handlePayload(payload);
  }

  async #handleClose(code: number): Promise<void> {
    await this.#operationHandler.handleClose(code);
  }

  #isConnectionValid(): boolean {
    return this.#ws?.readyState === WebSocket.OPEN;
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

  #startHealthCheck(): void {
    this.#stopHealthCheck();

    this.#healthCheckInterval = setInterval(async () => {
      const healthStatus = this.health.checkHealth(
        this.#ws,
        this.heartbeat.missedHeartbeats,
        this.heartbeat.latency,
      );

      this.emit("healthUpdate", healthStatus);
      this.emit("debug", this.health.getHealthDescription(healthStatus));

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
