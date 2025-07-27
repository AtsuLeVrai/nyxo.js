import {
  ApiVersion,
  BitField,
  sleep,
  type UnavailableGuildEntity,
} from "@nyxojs/core";
import type { Rest } from "@nyxojs/rest";
import { EventEmitter } from "eventemitter3";
import WebSocket from "ws";
import { z } from "zod";
import {
  HeartbeatManager,
  HeartbeatOptions,
  SessionManager,
  ShardManager,
  ShardOptions,
} from "../managers/index.js";
import {
  CompressionService,
  CompressionType,
  EncodingService,
  EncodingType,
} from "../services/index.js";
import {
  GatewayConnectionState,
  type GatewayEvents,
  GatewayIntentsBits,
  GatewayOpcodes,
  type GatewayReceiveEvents,
  type GatewaySendEvents,
  type GuildCreateEntity,
  type HelloEntity,
  type IdentifyEntity,
  type PayloadEntity,
  type ReadyEntity,
  type RequestGuildMembersEntity,
  type RequestSoundboardSoundsEntity,
  type UpdatePresenceEntity,
  type UpdateVoiceStateEntity,
} from "../types/index.js";

/**
 * Configuration options for the Discord Gateway client.
 * Controls WebSocket connection, authentication, and operational behavior.
 *
 * @public
 */
export const GatewayOptions = z.object({
  /**
   * Discord bot token for authentication.
   * Format should be "Bot YOUR_TOKEN_HERE" for bot accounts.
   */
  token: z.string(),

  /**
   * Gateway intents bitfield specifying which events to receive.
   * Can be an array of intent flags or a pre-calculated bitfield number.
   */
  intents: z.union([
    z
      .array(z.enum(GatewayIntentsBits))
      .transform((value) => Number(BitField.combine(value).valueOf())),
    z.number().int().min(0),
  ]),

  /**
   * Whether to wait for the READY event before considering connection complete.
   * When true, connect() waits for Discord authentication confirmation.
   *
   * @default true
   */
  waitForReady: z.boolean().default(true),

  /**
   * Discord API version to target.
   * Specifies which version of Discord's API to use.
   *
   * @default ApiVersion.V10
   */
  version: z.literal(ApiVersion.V10).default(ApiVersion.V10),

  /**
   * Member threshold for large guild optimization.
   * Guilds with more members are considered "large" and require member requests.
   *
   * @default 50
   */
  largeThreshold: z.number().int().min(50).max(250).default(50),

  /**
   * Payload encoding format for Gateway communication.
   * Controls how payloads are serialized for transmission.
   *
   * @default "json"
   */
  encodingType: EncodingType.default("json"),

  /**
   * Payload compression algorithm for bandwidth optimization.
   * Enables compression to reduce bandwidth usage.
   *
   * @default undefined
   */
  compressionType: CompressionType.optional(),

  /**
   * Exponential backoff schedule for reconnection attempts.
   * Defines wait times in milliseconds between reconnection attempts.
   *
   * @default [1000, 5000, 10000]
   */
  backoffSchedule: z
    .array(z.number().int().positive())
    .default([1000, 5000, 10000]),

  /**
   * WebSocket close codes that prevent session resumption.
   * These codes indicate terminal failures requiring fresh connections.
   *
   * @default [4004, 4010, 4011, 4012, 4013, 4014]
   */
  nonResumableCodes: z
    .array(z.number().int().positive())
    .default([4004, 4010, 4011, 4012, 4013, 4014]),

  /**
   * Initial presence status to set when connecting.
   * Defines bot's initial online status and activity.
   *
   * @default undefined
   */
  presence: z.custom<UpdatePresenceEntity>().optional(),

  /**
   * Heartbeat system configuration.
   * Controls heartbeat behavior for connection health monitoring.
   */
  heartbeat: HeartbeatOptions.prefault({}),

  /**
   * Sharding configuration for large bots.
   * Controls guild distribution across multiple shards.
   */
  shard: ShardOptions.prefault({}),
});

export type GatewayOptions = z.infer<typeof GatewayOptions>;

/**
 * Primary Discord Gateway client for real-time communication.
 * Implements Discord's WebSocket protocol for receiving events and sending commands.
 *
 * @example
 * ```typescript
 * const gateway = new Gateway(rest, {
 *   token: "Bot YOUR_TOKEN",
 *   intents: ["GUILDS", "GUILD_MESSAGES"]
 * });
 *
 * await gateway.connect();
 * gateway.updatePresence({ status: "online" });
 * ```
 *
 * @public
 */
export class Gateway extends EventEmitter<GatewayEvents> {
  /**
   * Heartbeat manager for connection health monitoring.
   * Manages heartbeat protocol and latency calculation.
   *
   * @readonly
   * @public
   */
  readonly heartbeat: HeartbeatManager;

  /**
   * Session manager for connection state and resumption.
   * Handles session lifecycle and resumption capabilities.
   *
   * @readonly
   * @public
   */
  readonly session: SessionManager;

  /**
   * Shard manager for horizontal scaling.
   * Manages multiple shard connections for large bots.
   *
   * @readonly
   * @public
   */
  readonly shard: ShardManager;

  /**
   * Compression service for bandwidth optimization.
   * Handles payload compression and decompression.
   *
   * @readonly
   * @public
   */
  readonly compression: CompressionService;

  /**
   * Encoding service for payload serialization.
   * Manages encoding between raw bytes and structured objects.
   *
   * @readonly
   * @public
   */
  readonly encoding: EncodingService;

  /**
   * Current connection state.
   * Reflects Gateway's position in the connection lifecycle.
   *
   * @public
   */
  state: GatewayConnectionState = GatewayConnectionState.Idle;

  /**
   * Current WebSocket connection to Discord's Gateway.
   * Set to null when disconnected.
   *
   * @internal
   */
  #ws: WebSocket | null = null;

  /**
   * Reconnection attempt counter for backoff calculation.
   * Incremented on each attempt and reset on success.
   *
   * @internal
   */
  #reconnectCount = 0;

  /**
   * Discord REST API client for Gateway URL discovery.
   * Used to fetch gateway connection URLs and bot information.
   *
   * @readonly
   * @internal
   */
  readonly #rest: Rest;

  /**
   * Validated Gateway configuration options.
   * Contains all parsed and validated configuration settings.
   *
   * @readonly
   * @internal
   */
  readonly #options: GatewayOptions;

  /**
   * Creates a new Gateway client instance.
   * Initializes services and validates configuration without connecting.
   *
   * @param rest - Discord REST API client for Gateway operations
   * @param options - Gateway configuration controlling behavior and authentication
   *
   * @throws {Error} If configuration validation fails
   *
   * @example
   * ```typescript
   * const gateway = new Gateway(rest, {
   *   token: "Bot YOUR_TOKEN",
   *   intents: ["GUILDS", "GUILD_MESSAGES"],
   *   waitForReady: true
   * });
   * ```
   *
   * @public
   */
  constructor(rest: Rest, options: z.input<typeof GatewayOptions>) {
    super();

    try {
      this.#options = GatewayOptions.parse(options);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Gateway configuration validation failed: ${z.prettifyError(error)}`,
        );
      }
      throw error;
    }

    this.#rest = rest;
    this.heartbeat = new HeartbeatManager(this, this.#options.heartbeat);
    this.session = new SessionManager(this);
    this.shard = new ShardManager(this, this.#options.shard);
    this.compression = new CompressionService(this.#options.compressionType);
    this.encoding = new EncodingService(this.#options.encodingType);
  }

  /**
   * Current WebSocket state.
   * Returns WebSocket ready state constant for connection status.
   *
   * @returns WebSocket ready state (CONNECTING=0, OPEN=1, CLOSING=2, CLOSED=3)
   *
   * @public
   */
  get wsState(): number {
    return this.#ws?.readyState ?? WebSocket.CLOSED;
  }

  /**
   * Timestamp when connection last became ready.
   * Returns milliseconds since epoch when READY event was received.
   *
   * @returns Ready timestamp in milliseconds, or 0 if never connected
   *
   * @public
   */
  get readyAt(): number {
    return this.session.readyAt ?? 0;
  }

  /**
   * Connection uptime in milliseconds.
   * Calculates time since last successful connection.
   *
   * @returns Uptime in milliseconds, or 0 if not connected
   *
   * @public
   */
  get uptime(): number {
    return this.session.uptime;
  }

  /**
   * Connection latency in milliseconds.
   * Returns round-trip time for heartbeat acknowledgements.
   *
   * @returns Current latency in milliseconds
   *
   * @public
   */
  get latency(): number {
    return this.heartbeat.latency;
  }

  /**
   * Current event sequence number.
   * Returns sequence number of last received event.
   *
   * @returns Current sequence number
   *
   * @public
   */
  get sequence(): number {
    return this.session.sequence;
  }

  /**
   * Current session ID.
   * Returns unique session identifier assigned by Discord.
   *
   * @returns Session ID string, or null if not connected
   *
   * @public
   */
  get sessionId(): string | null {
    return this.session.id;
  }

  /**
   * Session resume URL.
   * Returns Discord-provided URL for resuming this session.
   *
   * @returns Resume URL string, or null if not available
   *
   * @public
   */
  get resumeUrl(): string | null {
    return this.session.resumeUrl;
  }

  /**
   * Checks if Gateway is ready for operations.
   * Returns true when authenticated and ready to send commands.
   *
   * @returns True if ready for operations
   *
   * @public
   */
  get isReady(): boolean {
    return this.state === GatewayConnectionState.Ready;
  }

  /**
   * Establishes connection to Discord's Gateway.
   * Performs complete connection sequence including authentication.
   *
   * @returns Promise resolving when connection is established and ready
   *
   * @throws {Error} If connection process fails
   *
   * @example
   * ```typescript
   * await gateway.connect();
   * console.log("Gateway connected and ready!");
   * ```
   *
   * @public
   */
  async connect(): Promise<void> {
    if (
      this.state !== GatewayConnectionState.Idle &&
      this.state !== GatewayConnectionState.Disconnected
    ) {
      return;
    }

    this.#setState(GatewayConnectionState.Connecting);

    if (this.#ws) {
      this.#closeWebSocket();
    }

    try {
      const [gatewayInfo, guilds] = await Promise.all([
        this.#rest.gateway.fetchBotGatewayInfo(),
        this.#rest.users.fetchCurrentGuilds(),
        this.encoding.initialize(),
        this.compression.initialize(),
      ]);

      if (this.shard.isEnabled(guilds.length)) {
        await this.shard.spawn(
          guilds.length,
          gatewayInfo.session_start_limit.max_concurrency,
          gatewayInfo.shards,
        );
      }

      await this.#connectToGateway(gatewayInfo.url);

      if (this.#options.waitForReady) {
        await this.#waitForReady();
      }

      this.#reconnectCount = 0;
    } catch (error) {
      this.#closeWebSocket();
      this.#setState(GatewayConnectionState.Failed);
      throw error;
    }
  }

  /**
   * Updates the bot's presence information.
   * Changes status, activity, and other presence data visible to users.
   *
   * @param presence - New presence configuration including status and activities
   *
   * @throws {Error} If Gateway is not ready for operations
   *
   * @example
   * ```typescript
   * gateway.updatePresence({
   *   status: "online",
   *   activities: [{
   *     name: "with Discord API",
   *     type: 0
   *   }]
   * });
   * ```
   *
   * @public
   */
  updatePresence(presence: UpdatePresenceEntity): void {
    this.#requireReady("update presence");
    this.send(GatewayOpcodes.PresenceUpdate, presence);
  }

  /**
   * Updates the bot's voice connection state.
   * Controls voice channel connections including joining and leaving.
   *
   * @param options - Voice state configuration including guild and channel IDs
   *
   * @throws {Error} If Gateway is not ready for operations
   *
   * @example
   * ```typescript
   * gateway.updateVoiceState({
   *   guild_id: "123456789",
   *   channel_id: "987654321",
   *   self_mute: false,
   *   self_deaf: false
   * });
   * ```
   *
   * @public
   */
  updateVoiceState(options: UpdateVoiceStateEntity): void {
    this.#requireReady("update voice state");
    this.send(GatewayOpcodes.VoiceStateUpdate, options);
  }

  /**
   * Requests member information for a guild.
   * Fetches member data for large guilds not provided in GUILD_CREATE.
   *
   * @param options - Request parameters including guild ID and query filters
   *
   * @throws {Error} If Gateway is not ready for operations
   *
   * @example
   * ```typescript
   * gateway.requestGuildMembers({
   *   guild_id: "123456789",
   *   limit: 100,
   *   presences: true
   * });
   * ```
   *
   * @public
   */
  requestGuildMembers(options: RequestGuildMembersEntity): void {
    this.#requireReady("request guild members");
    this.send(GatewayOpcodes.RequestGuildMembers, options);
  }

  /**
   * Requests available soundboard sounds for a guild.
   * Fetches soundboard sounds available in a specific guild.
   *
   * @param options - Request parameters specifying the target guild
   *
   * @throws {Error} If Gateway is not ready for operations
   *
   * @example
   * ```typescript
   * gateway.requestSoundboardSounds({
   *   guild_id: "123456789"
   * });
   * ```
   *
   * @public
   */
  requestSoundboardSounds(options: RequestSoundboardSoundsEntity): void {
    this.#requireReady("request soundboard sounds");
    this.send(GatewayOpcodes.RequestSoundboardSounds, options);
  }

  /**
   * Sends a raw payload to the Gateway.
   * Low-level method for sending opcodes and data directly to Discord.
   *
   * @param opcode - Gateway opcode specifying the operation type
   * @param data - Payload data specific to the opcode
   *
   * @throws {Error} If WebSocket connection is not open
   *
   * @example
   * ```typescript
   * gateway.send(GatewayOpcodes.Heartbeat, null);
   * ```
   *
   * @public
   */
  send<T extends keyof GatewaySendEvents>(
    opcode: T,
    data: GatewaySendEvents[T],
  ): void {
    if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) {
      throw new Error("Cannot send data: WebSocket connection not open");
    }

    const encoded = this.encoding.encode({
      op: opcode,
      d: data,
      s: null,
      t: null,
    });
    this.#ws.send(encoded);
  }

  /**
   * Gracefully disconnects from the Gateway.
   * Performs clean shutdown without triggering automatic reconnection.
   *
   * @param code - WebSocket close code
   * @param reason - Human-readable reason for disconnection
   *
   * @example
   * ```typescript
   * gateway.disconnect(1000, "Maintenance shutdown");
   * ```
   *
   * @public
   */
  disconnect(code = 1000, reason = "Normal closure"): void {
    if (this.state === GatewayConnectionState.Disconnected) {
      return;
    }

    this.#setState(GatewayConnectionState.Disconnecting);
    this.#closeWebSocket(code, reason);
    this.#setState(GatewayConnectionState.Disconnected);

    if (code === 1000 || code === 1001) {
      this.session.destroy();
    }
  }

  /**
   * Completely destroys the Gateway and releases all resources.
   * Performs comprehensive cleanup and makes instance unusable.
   *
   * @param code - WebSocket close code for connection termination
   *
   * @throws {Error} If destruction encounters errors during cleanup
   *
   * @example
   * ```typescript
   * gateway.destroy();
   * // Gateway instance is now unusable
   * ```
   *
   * @public
   */
  destroy(code = 1000): void {
    if (this.state === GatewayConnectionState.Disconnected) {
      return;
    }

    try {
      this.#closeWebSocket(code);
      this.#setState(GatewayConnectionState.Disconnected);

      this.session.destroy();
      this.encoding.destroy();
      this.compression.destroy();
      this.heartbeat.destroy();

      this.shard.destroy();

      this.removeAllListeners();
    } catch (error) {
      throw new Error("Failed to destroy Gateway connection", {
        cause: error,
      });
    }
  }

  /**
   * Establishes WebSocket connection to Discord's Gateway.
   * Creates connection, sets up event handlers, and waits for establishment.
   *
   * @param url - Base Gateway URL from Discord's bot gateway info endpoint
   *
   * @throws {Error} If WebSocket connection fails or times out
   *
   * @internal
   */
  async #connectToGateway(url: string): Promise<void> {
    try {
      const wsUrl = this.#buildGatewayUrl(url);
      const ws = new WebSocket(wsUrl);
      this.#ws = ws;

      ws.on("message", this.#handleMessage.bind(this));
      ws.on("close", this.#handleClose.bind(this));
      ws.on("error", (error) => this.emit("wsError", error));

      await new Promise<void>((resolve, reject) => {
        const connectionTimeout = setTimeout(() => {
          reject(new Error("WebSocket connection timed out"));
        }, 15000);

        ws.once("open", () => {
          clearTimeout(connectionTimeout);
          this.#setState(GatewayConnectionState.Connected);
          this.emit("wsOpen");
          resolve();
        });

        ws.once("error", (err) => {
          clearTimeout(connectionTimeout);
          reject(err);
        });
      });
    } catch (error) {
      this.#closeWebSocket();
      throw new Error("Failed to connect to Gateway", { cause: error });
    }
  }

  /**
   * Waits for READY or RESUMED event confirmation.
   * Waits for Discord authentication confirmation after connection.
   *
   * @returns Promise resolving when authentication is confirmed
   *
   * @throws {Error} If authentication times out or fails
   *
   * @internal
   */
  async #waitForReady(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const connectionTimeout = setTimeout(() => {
        cleanup();
        reject(new Error("Timed out waiting for READY/RESUMED event"));
      }, 30000);

      const cleanup = (): void => {
        clearTimeout(connectionTimeout);
        this.removeListener("dispatch", readyHandler);
        this.removeListener("wsError", errorHandler);
      };

      const readyHandler = (event: keyof GatewayReceiveEvents): void => {
        if (event === "READY" || event === "RESUMED") {
          cleanup();
          resolve();
        }
      };

      const errorHandler = (error: Error): void => {
        cleanup();
        reject(error);
      };

      this.once("dispatch", readyHandler);
      this.once("wsError", errorHandler);
    });
  }

  /**
   * Processes incoming WebSocket messages.
   * Handles decompression, decoding, and routing of Gateway messages.
   *
   * @param data - Raw message data received from WebSocket
   *
   * @internal
   */
  async #handleMessage(data: Buffer): Promise<void> {
    this.emit("wsMessage", data);

    let processedData = data;
    if (this.compression.isInitialized) {
      processedData = this.compression.decompress(data);
    }

    const payload = this.encoding.decode(processedData);

    if (payload.s !== null) {
      this.session.updateSequence(payload.s);
    }

    await this.#processPayload(payload);
  }

  /**
   * Routes payloads to appropriate handlers based on opcode.
   * Central routing mechanism for all Gateway protocol operations.
   *
   * @param payload - Decoded Gateway payload with opcode and data
   *
   * @internal
   */
  async #processPayload(payload: PayloadEntity): Promise<void> {
    switch (payload.op) {
      case GatewayOpcodes.Dispatch:
        this.#handleDispatchEvent(payload);
        break;

      case GatewayOpcodes.Hello:
        await this.#handleHello(payload.d as HelloEntity);
        break;

      case GatewayOpcodes.Heartbeat:
        this.heartbeat.sendHeartbeat();
        break;

      case GatewayOpcodes.HeartbeatAck:
        this.heartbeat.ackHeartbeat();
        break;

      case GatewayOpcodes.InvalidSession:
        await this.#handleInvalidSession(Boolean(payload.d));
        break;

      case GatewayOpcodes.Reconnect:
        await this.#handleReconnect();
        break;

      default:
        break;
    }
  }

  /**
   * Handles Hello opcode and starts authentication.
   * Processes Hello message and triggers appropriate authentication flow.
   *
   * @param hello - Hello payload containing heartbeat_interval
   *
   * @internal
   */
  async #handleHello(hello: HelloEntity): Promise<void> {
    this.heartbeat.start(hello.heartbeat_interval);

    if (this.session.canResume) {
      this.#setState(GatewayConnectionState.Resuming);
      this.#sendResume();
    } else {
      this.#setState(GatewayConnectionState.Identifying);
      await this.#sendIdentify();
    }

    this.#setState(GatewayConnectionState.Authenticating);
  }

  /**
   * Sends Identify payload for new session authentication.
   * Constructs and sends Identify payload for new sessions.
   *
   * @throws {Error} If shard information cannot be obtained when needed
   *
   * @internal
   */
  async #sendIdentify(): Promise<void> {
    const payload: IdentifyEntity = {
      token: this.#options.token,
      properties: {
        os: process.platform,
        browser: "nyxo.js",
        device: "nyxo.js",
      },
      compress: this.compression.isInitialized,
      large_threshold: this.#options.largeThreshold,
      intents: this.#options.intents,
    };

    if (this.shard.totalShards > 0) {
      payload.shard = await this.shard.getAvailableShard();
    }

    if (this.#options.presence) {
      payload.presence = this.#options.presence;
    }

    this.send(GatewayOpcodes.Identify, payload);
  }

  /**
   * Sends Resume payload for session resumption.
   * Constructs and sends Resume payload to continue existing session.
   *
   * @throws {Error} If no session ID is available for resumption
   *
   * @internal
   */
  #sendResume(): void {
    if (!this.session.id) {
      throw new Error("Cannot resume: no session ID available");
    }

    const resumeData = this.session.getResumeData(this.#options.token);
    this.send(GatewayOpcodes.Resume, resumeData);
  }

  /**
   * Handles InvalidSession opcode.
   * Processes session invalidation and implements recovery strategy.
   *
   * @param resumable - Whether Discord indicates session might be resumable
   *
   * @internal
   */
  async #handleInvalidSession(resumable: boolean): Promise<void> {
    this.session.invalidateSession(
      resumable,
      resumable ? "server_request" : "authentication_failed",
    );

    await sleep(1000 + Math.random() * 4000);

    if (resumable && this.session.canResume) {
      this.#setState(GatewayConnectionState.Resuming);
      this.#sendResume();
      this.#setState(GatewayConnectionState.Authenticating);
    } else {
      this.#closeWebSocket();
      await this.connect();
    }
  }

  /**
   * Handles Reconnect opcode from Discord.
   * Processes reconnection requests and attempts appropriate recovery.
   *
   * @internal
   */
  async #handleReconnect(): Promise<void> {
    const canResume = this.session.canResume;

    this.#closeWebSocket(4000);
    await sleep(500);

    if (canResume) {
      await this.#attemptResume();
    } else {
      await this.connect();
    }
  }

  /**
   * Handles WebSocket close events and manages reconnection.
   * Processes closure scenarios and implements reconnection logic.
   *
   * @param code - WebSocket close code indicating reason for closure
   * @param reason - Human-readable close reason from server
   *
   * @internal
   */
  async #handleClose(code: number, reason: string): Promise<void> {
    this.emit("wsClose", code, reason);

    this.heartbeat.destroy();

    if (
      code === 1000 ||
      code === 1001 ||
      this.#options.nonResumableCodes.includes(code)
    ) {
      this.session.destroy();
    }

    for (const shard of this.shard.shards) {
      if (shard.status !== "disconnected") {
        this.shard.setShardStatus(shard.shardId, "disconnected");
      }
    }

    if (
      code !== 1000 &&
      code !== 1001 &&
      this.#options.heartbeat.autoReconnect
    ) {
      this.#reconnectCount++;
      this.#setState(GatewayConnectionState.Reconnecting);

      const delay = this.#getReconnectionDelay();
      await sleep(delay);

      if (this.#shouldResume(code) && this.session.canResume) {
        await this.#attemptResume();
      } else {
        await this.connect();
      }
    } else {
      this.#setState(GatewayConnectionState.Disconnected);
    }
  }

  /**
   * Processes Gateway dispatch events.
   * Handles dispatch events and forwards to application code.
   *
   * @param payload - Dispatch payload containing event type and data
   *
   * @internal
   */
  #handleDispatchEvent(payload: PayloadEntity): void {
    if (!payload.t) {
      return;
    }

    switch (payload.t) {
      case "READY":
        this.#handleReadyEvent(payload.d as ReadyEntity);
        break;

      case "RESUMED":
        this.#handleResumedEvent();
        break;

      case "GUILD_CREATE":
        this.#handleGuildCreate(payload.d as GuildCreateEntity);
        break;

      case "GUILD_DELETE":
        this.#handleGuildDelete(payload.d as UnavailableGuildEntity);
        break;

      default:
        break;
    }

    this.emit(
      "dispatch",
      payload.t,
      payload.d as GatewayReceiveEvents[typeof payload.t],
    );
  }

  /**
   * Handles READY event and initializes session.
   * Processes READY event to establish session state.
   *
   * @param data - READY event payload containing session information
   *
   * @internal
   */
  #handleReadyEvent(data: ReadyEntity): void {
    this.session.initializeSession(
      data,
      this.encoding.type,
      this.compression.type,
    );

    this.#setState(GatewayConnectionState.Ready);

    if (this.shard.totalShards > 0) {
      const shardId = data.shard?.[0] ?? 0;
      this.shard.setShardStatus(shardId, "ready");

      const guildIds = data.guilds.map((guild) => guild.id);
      this.shard.addGuildsToShard(shardId, guildIds);
    }
  }

  /**
   * Handles RESUMED event.
   * Processes session resumption confirmation from Discord.
   *
   * @internal
   */
  #handleResumedEvent(): void {
    this.session.resumeSession();
    this.#setState(GatewayConnectionState.Ready);
  }

  /**
   * Handles GUILD_CREATE for shard management.
   * Updates shard guild mappings when guilds become available.
   *
   * @param data - Guild create event data
   *
   * @internal
   */
  #handleGuildCreate(data: GuildCreateEntity): void {
    if (
      this.shard.totalShards > 0 &&
      "id" in data &&
      !("unavailable" in data)
    ) {
      this.shard.addGuildToShard(data.id);
    }
  }

  /**
   * Handles GUILD_DELETE for shard management.
   * Updates shard guild mappings when guilds become unavailable.
   *
   * @param data - Guild delete event data
   *
   * @internal
   */
  #handleGuildDelete(data: UnavailableGuildEntity): void {
    if (this.shard.totalShards > 0 && "id" in data) {
      this.shard.removeGuildFromShard(data.id);
    }
  }

  /**
   * Attempts session resumption using stored resume URL.
   * Tries to resume existing session or falls back to fresh connection.
   *
   * @throws {Error} If session cannot be resumed due to missing data
   *
   * @internal
   */
  async #attemptResume(): Promise<void> {
    if (!this.session.canResume) {
      throw new Error("Cannot resume: invalid session state");
    }

    const resumeUrl = this.session.resumeUrl;
    if (!resumeUrl) {
      throw new Error("Cannot resume: missing resume URL");
    }

    try {
      this.#setState(GatewayConnectionState.Resuming);
      await this.#connectToGateway(resumeUrl);
    } catch (_error) {
      this.session.destroy();
      await this.connect();
    }
  }

  /**
   * Safely closes WebSocket connection.
   * Performs cleanup and graceful closure of WebSocket.
   *
   * @param code - WebSocket close code to send
   * @param reason - Optional close reason string
   *
   * @internal
   */
  #closeWebSocket(code?: number, reason?: string): void {
    const ws = this.#ws;
    if (!ws) {
      return;
    }

    ws.removeAllListeners();

    try {
      ws.close(code, reason);
    } catch (_error) {
      // Ignore close errors
    }

    this.#ws = null;
  }

  /**
   * Builds complete Gateway URL with query parameters.
   * Constructs WebSocket URL with required parameters.
   *
   * @param baseUrl - Base Gateway URL from Discord's API
   * @returns Complete WebSocket URL with query parameters
   *
   * @internal
   */
  #buildGatewayUrl(baseUrl: string): string {
    const params = new URLSearchParams({
      v: String(this.#options.version),
      encoding: this.encoding.type,
    });

    if (this.compression.type) {
      params.append("compress", this.compression.type);
    }

    return `${baseUrl}?${params}`;
  }

  /**
   * Determines if session should be resumed based on close code.
   * Evaluates close codes to determine resumption strategy.
   *
   * @param code - WebSocket close code received from Discord
   * @returns True if session resumption should be attempted
   *
   * @internal
   */
  #shouldResume(code: number): boolean {
    const isClean = code === 1000 || code === 1001;
    return !(isClean || this.#options.nonResumableCodes.includes(code));
  }

  /**
   * Calculates reconnection delay using exponential backoff.
   * Implements backoff strategy with jitter for reconnection attempts.
   *
   * @returns Delay in milliseconds before next reconnection attempt
   *
   * @internal
   */
  #getReconnectionDelay(): number {
    const schedule = this.#options.backoffSchedule;
    const index = Math.min(this.#reconnectCount - 1, schedule.length - 1);
    const baseDelay = schedule[index] ?? schedule.at(-1) ?? 1000;

    return Math.min(baseDelay * (0.8 + Math.random() * 0.4), 30000);
  }

  /**
   * Updates connection state with validation.
   * Safely transitions Gateway state while validating transitions.
   *
   * @param newState - Target connection state
   *
   * @throws {Error} If state transition is invalid
   *
   * @internal
   */
  #setState(newState: GatewayConnectionState): void {
    const oldState = this.state;
    if (!this.#isValidTransition(oldState, newState)) {
      throw new Error(`Invalid state transition: ${oldState} -> ${newState}`);
    }

    this.state = newState;
    this.emit("stateChange", oldState, newState);
  }

  /**
   * Validates connection state transitions.
   * Enforces Gateway state machine rules for logical progression.
   *
   * @param from - Current connection state
   * @param to - Target connection state
   * @returns True if transition is valid according to state machine
   *
   * @internal
   */
  #isValidTransition(
    from: GatewayConnectionState,
    to: GatewayConnectionState,
  ): boolean {
    const connectionTransitions: Record<
      GatewayConnectionState,
      GatewayConnectionState[]
    > = {
      [GatewayConnectionState.Idle]: [
        GatewayConnectionState.Connecting,
        GatewayConnectionState.Failed,
      ],
      [GatewayConnectionState.Connecting]: [
        GatewayConnectionState.Connected,
        GatewayConnectionState.Disconnected,
        GatewayConnectionState.Failed,
        GatewayConnectionState.Reconnecting,
      ],
      [GatewayConnectionState.Connected]: [
        GatewayConnectionState.Identifying,
        GatewayConnectionState.Resuming,
        GatewayConnectionState.Disconnected,
        GatewayConnectionState.Failed,
      ],
      [GatewayConnectionState.Identifying]: [
        GatewayConnectionState.Authenticating,
        GatewayConnectionState.Disconnected,
        GatewayConnectionState.Failed,
        GatewayConnectionState.Reconnecting,
      ],
      [GatewayConnectionState.Resuming]: [
        GatewayConnectionState.Authenticating,
        GatewayConnectionState.Ready,
        GatewayConnectionState.Disconnected,
        GatewayConnectionState.Failed,
        GatewayConnectionState.Reconnecting,
      ],
      [GatewayConnectionState.Authenticating]: [
        GatewayConnectionState.Ready,
        GatewayConnectionState.Disconnected,
        GatewayConnectionState.Failed,
        GatewayConnectionState.Reconnecting,
      ],
      [GatewayConnectionState.Ready]: [
        GatewayConnectionState.Disconnecting,
        GatewayConnectionState.Disconnected,
        GatewayConnectionState.Reconnecting,
        GatewayConnectionState.Failed,
      ],
      [GatewayConnectionState.Reconnecting]: [
        GatewayConnectionState.Connecting,
        GatewayConnectionState.Disconnected,
        GatewayConnectionState.Failed,
      ],
      [GatewayConnectionState.Disconnecting]: [
        GatewayConnectionState.Disconnected,
      ],
      [GatewayConnectionState.Disconnected]: [
        GatewayConnectionState.Connecting,
        GatewayConnectionState.Failed,
        GatewayConnectionState.Idle,
      ],
      [GatewayConnectionState.Failed]: [
        GatewayConnectionState.Idle,
        GatewayConnectionState.Connecting,
      ],
    };

    return connectionTransitions[from]?.includes(to) ?? false;
  }

  /**
   * Validates Gateway is ready for operations.
   * Checks ready state before allowing operations requiring authentication.
   *
   * @param operation - Description of operation being attempted
   *
   * @throws {Error} If Gateway is not ready with current state information
   *
   * @internal
   */
  #requireReady(operation: string): void {
    if (!this.isReady) {
      throw new Error(
        `Cannot ${operation}: Gateway not ready (current state: ${this.state})`,
      );
    }
  }
}
