import {
  ApiVersion,
  BitField,
  type UnavailableGuildEntity,
  sleep,
} from "@nyxjs/core";
import type { Rest } from "@nyxjs/rest";
import { EventEmitter } from "eventemitter3";
import WebSocket from "ws";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import {
  HeartbeatManager,
  HeartbeatOptions,
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
  type ResumeEntity,
  type UpdatePresenceEntity,
  type UpdateVoiceStateEntity,
} from "../types/index.js";

/**
 * Main configuration options for the Discord Gateway client
 *
 * These options control the behavior of the WebSocket connection to Discord's
 * Gateway API, including authentication, sharding, compression, and more.
 *
 * @example
 * ```ts
 * const options = {
 *   token: "your-bot-token",
 *   intents: [GatewayIntentsBits.Guilds, GatewayIntentsBits.GuildMessages],
 *   presence: {
 *     status: "online",
 *     activities: [{
 *       name: "with Discord",
 *       type: 0
 *     }]
 *   }
 * };
 *
 * const gateway = new Gateway(rest, options);
 * ```
 */
export const GatewayOptions = z.object({
  /**
   * Discord bot token for authentication
   *
   * This token is required for connecting to the Gateway.
   *
   * @see {@link https://discord.com/developers/docs/reference#authentication}
   */
  token: z.string(),

  /**
   * Gateway intents to request
   *
   * Intents determine which events the bot will receive from Discord.
   * Can be specified as an array of intent flags or a precalculated bit field.
   *
   * @example
   * ```ts
   * // Using intent flags
   * const intents = [
   *   GatewayIntentsBits.Guilds,
   *   GatewayIntentsBits.GuildMessages,
   *   GatewayIntentsBits.MessageContent
   * ];
   *
   * // Or using a precalculated bit field
   * const intents = 513; // Guilds + GuildMessages + MessageContent
   * ```
   *
   * @see {@link https://discord.com/developers/docs/topics/gateway#gateway-intents}
   */
  intents: z.union([
    z
      .array(z.nativeEnum(GatewayIntentsBits))
      .transform((value) => Number(BitField.combine(value).valueOf())),
    z.number().int().positive(),
  ]),

  /**
   * Discord API version to use
   *
   * @default ApiVersion.V10
   */
  version: z.literal(ApiVersion.V10).default(ApiVersion.V10),

  /**
   * Number of members in a guild before the members are no longer returned in the guild create event
   *
   * Used to limit the initial payload size for large guilds.
   *
   * @default 50
   * @see {@link https://discord.com/developers/docs/resources/guild#guild-object}
   */
  largeThreshold: z.number().int().min(50).max(250).default(50),

  /**
   * Payload encoding format to use
   *
   * @default "json"
   */
  encodingType: EncodingType.default("json"),

  /**
   * Payload compression format to use
   *
   * @default undefined
   */
  compressionType: CompressionType.optional(),

  /**
   * Backoff schedule for reconnection attempts in milliseconds
   *
   * These values determine the wait time between reconnection attempts
   * in case of connection failures.
   *
   * @default [1000, 5000, 10000]
   */
  backoffSchedule: z
    .array(z.number().int().positive())
    .default([1000, 5000, 10000]),

  /**
   * WebSocket close codes that cannot be resumed
   *
   * These close codes indicate conditions where a session cannot be resumed.
   * This includes authentication failures, invalid sharding configuration,
   * or invalid API parameters.
   *
   * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-close-event-codes}
   */
  nonResumableCodes: z
    .array(z.number().int().positive())
    .default([4004, 4010, 4011, 4012, 4013, 4014]),

  /**
   * Initial presence data to set upon connecting
   *
   * @default undefined
   * @see {@link https://discord.com/developers/docs/topics/gateway-events#update-presence}
   */
  presence: z.custom<UpdatePresenceEntity>().optional(),

  /**
   * Heartbeat configuration options
   *
   * @default {}
   */
  heartbeat: HeartbeatOptions.default({}),

  /**
   * Sharding configuration options
   *
   * @default {}
   */
  shard: ShardOptions.default({}),
});

export type GatewayOptions = z.infer<typeof GatewayOptions>;

/**
 * Connection state for the Gateway
 *
 * These states represent the different phases of the connection lifecycle.
 */
type ConnectionState =
  | "disconnected" // Not connected to Gateway
  | "connecting" // Establishing initial connection
  | "identifying" // Sending identify payload
  | "resuming" // Attempting to resume a session
  | "ready"; // Fully connected and authenticated

/**
 * Session information for Gateway connections
 *
 * Contains the data needed to maintain and potentially resume a session.
 */
interface SessionInfo {
  /** Session ID assigned by Discord */
  id: string | null;

  /** URL for resuming the session */
  resumeUrl: string | null;

  /** Last received sequence number */
  sequence: number;

  /** Timestamp when the session became ready */
  readyAt: number | null;
}

/**
 * Main Gateway client for Discord WebSocket communication
 *
 * This class handles:
 * - Establishing and maintaining the WebSocket connection to Discord
 * - Processing Gateway events and opcodes
 * - Managing session lifecycle (identify, resume, reconnect)
 * - Coordinating heartbeats and sharding
 *
 * @example
 * ```ts
 * const rest = new Rest({ token: "your-bot-token" });
 * const gateway = new Gateway(rest, {
 *   token: "your-bot-token",
 *   intents: [GatewayIntentsBits.Guilds, GatewayIntentsBits.GuildMessages]
 * });
 *
 * // Connect to Discord
 * gateway.connect()
 *   .then(() => console.log("Connected to Discord!"))
 *   .catch(error => console.error("Connection failed:", error));
 *
 * // Listen for events
 * gateway.on("dispatch", (eventName, eventData) => {
 *   console.log(`Received ${eventName} event:`, eventData);
 * });
 *
 * // Handle graceful shutdown
 * process.on("SIGINT", () => {
 *   gateway.destroy();
 *   process.exit(0);
 * });
 * ```
 */
export class Gateway extends EventEmitter<GatewayEvents> {
  /** Current WebSocket connection */
  #ws: WebSocket | null = null;

  /** Current connection state */
  #state: ConnectionState = "disconnected";

  /** Session information */
  #session: SessionInfo = {
    id: null,
    resumeUrl: null,
    sequence: 0,
    readyAt: null,
  };

  /** Number of reconnection attempts */
  #reconnectCount = 0;

  /** Discord REST API client */
  readonly #rest: Rest;

  /** Gateway heartbeat manager */
  readonly #heartbeat: HeartbeatManager;

  /** Shard manager for multi-shard bots */
  readonly #shard: ShardManager;

  /** Service for payload compression */
  readonly #compression: CompressionService;

  /** Service for payload encoding */
  readonly #encoding: EncodingService;

  /** Gateway configuration */
  readonly #options: GatewayOptions;

  /**
   * Creates a new Gateway client
   *
   * @param rest - Discord REST API client
   * @param options - Gateway configuration options
   * @throws {Error} If options validation fails
   *
   * @example
   * ```ts
   * const gateway = new Gateway(rest, {
   *   token: "your-bot-token",
   *   intents: [GatewayIntentsBits.Guilds, GatewayIntentsBits.GuildMessages]
   * });
   * ```
   */
  constructor(rest: Rest, options: z.input<typeof GatewayOptions>) {
    super();

    try {
      this.#options = GatewayOptions.parse(options);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.#rest = rest;
    this.#heartbeat = new HeartbeatManager(this, this.#options.heartbeat);
    this.#shard = new ShardManager(this, this.#options.shard);
    this.#compression = new CompressionService(this.#options.compressionType);
    this.#encoding = new EncodingService(this.#options.encodingType);
  }

  /**
   * Gets the bot token
   */
  get token(): string {
    return this.#options.token;
  }

  /**
   * Gets the validated Gateway options
   */
  get options(): GatewayOptions {
    return this.#options;
  }

  /**
   * Gets the current WebSocket ready state
   *
   * @returns WebSocket ready state (CONNECTING, OPEN, CLOSING, CLOSED)
   */
  get readyState(): number {
    return this.#ws?.readyState ?? WebSocket.CLOSED;
  }

  /**
   * Gets the timestamp when the connection was last ready
   *
   * @returns Timestamp in milliseconds or 0 if never connected
   */
  get readyAt(): number {
    return this.#session.readyAt ?? 0;
  }

  /**
   * Gets the uptime of the connection in milliseconds
   *
   * @returns Uptime in milliseconds or 0 if not connected
   */
  get uptime(): number {
    return this.#session.readyAt ? Date.now() - this.#session.readyAt : 0;
  }

  /**
   * Gets the latency of the connection in milliseconds
   *
   * @returns Latency in milliseconds
   */
  get latency(): number {
    return this.#heartbeat.latency;
  }

  /**
   * Gets the last received sequence number
   *
   * @returns Sequence number
   */
  get sequence(): number {
    return this.#session.sequence;
  }

  /**
   * Gets the current session ID
   *
   * @returns Session ID or null if not connected
   */
  get sessionId(): string | null {
    return this.#session.id;
  }

  /**
   * Gets the URL for resuming the current session
   *
   * @returns Resume URL or null if not available
   */
  get resumeUrl(): string | null {
    return this.#session.resumeUrl;
  }

  /**
   * Gets the HeartbeatManager instance
   */
  get heartbeat(): HeartbeatManager {
    return this.#heartbeat;
  }

  /**
   * Gets the ShardManager instance
   */
  get shard(): ShardManager {
    return this.#shard;
  }

  /**
   * Checks if the connection is ready
   *
   * @returns True if the connection is in the ready state
   */
  get isReady(): boolean {
    return this.#state === "ready";
  }

  /**
   * Connects to the Discord Gateway
   *
   * Establishes a new WebSocket connection to Discord's Gateway API
   * and completes the identify/resume process.
   *
   * @returns A promise that resolves when the connection is ready
   * @throws {Error} If connection fails
   *
   * @example
   * ```ts
   * try {
   *   await gateway.connect();
   *   console.log("Connected to Discord Gateway!");
   * } catch (error) {
   *   console.error("Failed to connect:", error);
   * }
   * ```
   */
  async connect(): Promise<void> {
    // Already connecting or connected
    if (this.#state !== "disconnected") {
      return;
    }

    this.#state = "connecting";

    // Close any existing connection
    if (this.#ws) {
      this.#closeWebSocket();
    }

    try {
      // Initialize services & Get gateway info and guild list
      const [gatewayInfo, guilds] = await Promise.all([
        this.#rest.gateway.fetchBotGatewayInfo(),
        this.#rest.users.fetchCurrentUserGuilds(),
        this.#encoding.initialize(),
        this.#compression.initialize(),
      ]);

      // Initialize sharding if enabled
      if (this.#shard.isEnabled) {
        await this.#shard.spawn(
          guilds.length,
          gatewayInfo.session_start_limit.max_concurrency,
          gatewayInfo.shards,
        );
      }

      // Connect to Gateway
      await this.#connectToGateway(gatewayInfo.url);

      // Wait for ready event
      await this.#waitForReady();

      // Connection successful
      this.#reconnectCount = 0;
    } catch (error) {
      this.#state = "disconnected";
      throw error;
    }
  }

  /**
   * Updates the bot's presence information
   *
   * @param presence - New presence data
   * @throws {Error} If the connection is not ready
   *
   * @example
   * ```ts
   * gateway.updatePresence({
   *   status: "online",
   *   activities: [{
   *     name: "with Discord API",
   *     type: 0
   *   }]
   * });
   * ```
   */
  updatePresence(presence: UpdatePresenceEntity): void {
    if (this.#state !== "ready") {
      throw new Error("Cannot update presence, connection not ready");
    }

    this.send(GatewayOpcodes.PresenceUpdate, presence);
  }

  /**
   * Updates the bot's voice state
   *
   * @param options - Voice state update options
   * @throws {Error} If the connection is not ready
   *
   * @example
   * ```ts
   * // Join a voice channel
   * gateway.updateVoiceState({
   *   guild_id: "123456789012345678",
   *   channel_id: "123456789012345679",
   *   self_mute: false,
   *   self_deaf: false
   * });
   *
   * // Leave a voice channel
   * gateway.updateVoiceState({
   *   guild_id: "123456789012345678",
   *   channel_id: null
   * });
   * ```
   */
  updateVoiceState(options: UpdateVoiceStateEntity): void {
    if (this.#state !== "ready") {
      throw new Error("Cannot update voice state, connection not ready");
    }

    this.send(GatewayOpcodes.VoiceStateUpdate, options);
  }

  /**
   * Requests guild member information
   *
   * @param options - Request options
   * @throws {Error} If the connection is not ready
   *
   * @example
   * ```ts
   * // Request all members for a guild
   * gateway.requestGuildMembers({
   *   guild_id: "123456789012345678",
   *   query: "",
   *   limit: 0
   * });
   *
   * // Request specific members
   * gateway.requestGuildMembers({
   *   guild_id: "123456789012345678",
   *   user_ids: ["123456789012345679", "123456789012345680"]
   * });
   * ```
   */
  requestGuildMembers(options: RequestGuildMembersEntity): void {
    if (this.#state !== "ready") {
      throw new Error("Cannot request guild members, connection not ready");
    }

    this.send(GatewayOpcodes.RequestGuildMembers, options);
  }

  /**
   * Requests soundboard sounds
   *
   * @param options - Request options
   * @throws {Error} If the connection is not ready
   */
  requestSoundboardSounds(options: RequestSoundboardSoundsEntity): void {
    if (this.#state !== "ready") {
      throw new Error("Cannot request soundboard sounds, connection not ready");
    }

    this.send(GatewayOpcodes.RequestSoundboardSounds, options);
  }

  /**
   * Sends a payload to the Gateway
   *
   * @param opcode - Gateway opcode
   * @param data - Payload data
   * @throws {Error} If the connection is not open
   */
  send<T extends keyof GatewaySendEvents>(
    opcode: T,
    data: GatewaySendEvents[T],
  ): void {
    if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) {
      throw new Error("Cannot send data, WebSocket is not open");
    }

    const payload: PayloadEntity = {
      op: opcode,
      d: data,
      s: null,
      t: null,
    };

    const encoded = this.#encoding.encode(payload);
    this.#ws.send(encoded);
  }

  /**
   * Gracefully disconnects from the Gateway
   *
   * Use this method to cleanly disconnect without triggering reconnection.
   *
   * @param code - WebSocket close code (defaults to 1000 - Normal Closure)
   * @param reason - Reason for disconnection
   *
   * @example
   * ```ts
   * // Normal disconnect
   * gateway.disconnect();
   *
   * // Disconnect with specific code and reason
   * gateway.disconnect(1000, "Bot shutting down");
   * ```
   */
  disconnect(code = 1000, reason = "Normal closure"): void {
    if (this.#state === "disconnected") {
      return;
    }

    // Send a clean close to Discord
    this.#closeWebSocket(code, reason);
    this.#state = "disconnected";

    // If the code is a clean close, clear session info
    if (code === 1000 || code === 1001) {
      this.#clearSession();
    }
  }

  /**
   * Destroys the Gateway connection and all associated resources
   *
   * @param code - WebSocket close code
   * @throws {Error} If destruction fails
   *
   * @example
   * ```ts
   * // Clean shutdown
   * process.on("SIGINT", () => {
   *   gateway.destroy();
   *   process.exit(0);
   * });
   * ```
   */
  destroy(code = 1000): void {
    try {
      // Close the WebSocket connection
      this.#closeWebSocket(code);
      this.#state = "disconnected";

      // Clear session information
      this.#clearSession();

      // Destroy services
      this.#encoding.destroy();
      this.#compression.destroy();
      this.#heartbeat.destroy();

      if (this.#shard.isEnabled) {
        this.#shard.destroy();
      }

      // Clear any event listeners
      this.removeAllListeners();
    } catch (error) {
      throw new Error("Failed to destroy gateway connection", {
        cause: error,
      });
    }
  }

  /**
   * Establishes a WebSocket connection to the Discord Gateway
   *
   * @param url - Base Gateway URL
   * @private
   */
  async #connectToGateway(url: string): Promise<void> {
    try {
      // Build the complete Gateway URL with parameters
      const wsUrl = this.#buildGatewayUrl(url);

      // Create new WebSocket connection
      const ws = new WebSocket(wsUrl);
      this.#ws = ws;

      // Set up event handlers
      ws.on("message", this.#handleMessage.bind(this));
      ws.on("close", this.#handleClose.bind(this));
      ws.on("error", this.#handleError.bind(this));

      // Wait for connection to open
      await new Promise<void>((resolve, reject) => {
        const connectionTimeout = setTimeout(() => {
          reject(new Error("WebSocket connection timed out"));
        }, 15000); // 15 second timeout

        ws.once("open", () => {
          clearTimeout(connectionTimeout);
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
   * Waits for the READY or RESUMED event after connection
   *
   * @private
   */
  async #waitForReady(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const connectionTimeout = setTimeout(() => {
        cleanup();
        reject(
          new Error("Connection timed out waiting for READY/RESUMED event"),
        );
      }, 30000); // 30 second timeout

      const cleanup = (): void => {
        clearTimeout(connectionTimeout);
        this.removeListener("dispatch", readyHandler);
        this.removeListener("error", errorHandler);
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
      this.once("error", errorHandler);
    });
  }

  /**
   * Processes an incoming WebSocket message
   *
   * @param data - Raw message data from WebSocket
   * @private
   */
  async #handleMessage(data: Buffer): Promise<void> {
    try {
      // Decompress if configured
      let processedData = data;
      if (this.#compression.isInitialized()) {
        processedData = this.#compression.decompress(data);
      }

      // Decode payload
      const payload = this.#encoding.decode(processedData);

      // Update sequence number if provided
      if (payload.s !== null) {
        this.#session.sequence = payload.s;
      }

      // Process payload by opcode
      await this.#processPayload(payload);
    } catch (error) {
      this.emit(
        "error",
        new Error("Error processing gateway message", {
          cause: error,
        }),
      );
    }
  }

  /**
   * Processes a decoded Gateway payload
   *
   * @param payload - Decoded Gateway payload
   * @private
   */
  async #processPayload(payload: PayloadEntity): Promise<void> {
    try {
      switch (payload.op) {
        case GatewayOpcodes.Dispatch:
          this.#handleDispatchEvent(payload);
          break;

        case GatewayOpcodes.Hello:
          await this.#handleHello(payload.d as HelloEntity);
          break;

        case GatewayOpcodes.Heartbeat:
          this.#heartbeat.sendHeartbeat();
          break;

        case GatewayOpcodes.HeartbeatAck:
          this.#heartbeat.ackHeartbeat();
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
    } catch (error) {
      this.emit(
        "error",
        new Error("Error handling gateway payload", {
          cause: error,
        }),
      );
    }
  }

  /**
   * Handles the Hello opcode
   *
   * @param hello - Hello payload data
   * @private
   */
  async #handleHello(hello: HelloEntity): Promise<void> {
    // Start heartbeats
    this.#heartbeat.start(hello.heartbeat_interval);

    // Either resume or identify
    if (this.#canResume()) {
      this.#state = "resuming";
      this.#sendResume();
    } else {
      this.#state = "identifying";
      await this.#sendIdentify();
    }
  }

  /**
   * Sends an identify payload to the Gateway
   *
   * @private
   */
  async #sendIdentify(): Promise<void> {
    const payload: IdentifyEntity = {
      token: this.#options.token,
      properties: {
        os: process.platform,
        browser: "nyx.js",
        device: "nyx.js",
      },
      compress: this.#compression.isInitialized(),
      large_threshold: this.#options.largeThreshold,
      intents: this.#options.intents,
    };

    // Add shard info if sharding is enabled
    if (this.#shard.isEnabled && this.#shard.totalShards > 0) {
      payload.shard = await this.#shard.getAvailableShard();
    }

    // Add presence if provided
    if (this.#options.presence) {
      payload.presence = this.#options.presence;
    }

    this.send(GatewayOpcodes.Identify, payload);
  }

  /**
   * Sends a resume payload to the Gateway
   *
   * @private
   */
  #sendResume(): void {
    if (!this.#session.id) {
      throw new Error("Cannot resume: no session ID available");
    }

    const payload: ResumeEntity = {
      token: this.#options.token,
      session_id: this.#session.id,
      seq: this.#session.sequence,
    };

    this.send(GatewayOpcodes.Resume, payload);
  }

  /**
   * Handles the InvalidSession opcode
   *
   * @param resumable - Whether the session is resumable
   * @private
   */
  async #handleInvalidSession(resumable: boolean): Promise<void> {
    this.emit("sessionInvalidate", {
      timestamp: new Date().toISOString(),
      sessionId: this.#session.id ?? "",
      resumable,
      reason: resumable ? "server_request" : "authentication_failed",
    });

    // Clear session if not resumable
    if (!resumable) {
      this.#clearSession();
    }

    // Reconnect after a delay
    await sleep(1000 + Math.random() * 4000);

    // Either try to resume or identify
    if (resumable && this.#canResume()) {
      this.#state = "resuming";
      this.#sendResume();
    } else {
      // Need to re-establish connection
      this.#closeWebSocket();
      await this.connect();
    }
  }

  /**
   * Handles the Reconnect opcode
   *
   * @private
   */
  async #handleReconnect(): Promise<void> {
    // Discord requested reconnection
    const canResume = this.#canResume();

    // Close current connection
    this.#closeWebSocket(4000);

    // Wait a moment before reconnecting
    await sleep(500);

    if (canResume) {
      // Try to resume
      await this.#attemptResume();
    } else {
      // Full reconnect
      await this.connect();
    }
  }

  /**
   * Handles WebSocket close events
   *
   * @param code - WebSocket close code
   * @param reason - Close reason
   * @private
   */
  async #handleClose(code: number, reason?: string): Promise<void> {
    // Destroy heartbeat to stop sending
    this.#heartbeat.destroy();

    // For clean closures or non-resumable codes, clear session
    if (
      code === 1000 ||
      code === 1001 ||
      this.#options.nonResumableCodes.includes(code)
    ) {
      this.#clearSession();
    }

    // Emit disconnect events for any active shards
    if (this.#shard.isEnabled) {
      for (const shard of this.#shard.shards) {
        if (shard.status !== "disconnected") {
          this.#shard.setShardStatus(shard.shardId, "disconnected");

          this.emit("shardDisconnect", {
            timestamp: new Date().toISOString(),
            shardId: shard.shardId,
            totalShards: shard.totalShards,
            closeCode: code,
            reason: reason || "Connection closed",
            willReconnect: this.#options.heartbeat.autoReconnect,
          });
        }
      }
    }

    // If not a normal closure and auto-reconnect is enabled
    if (
      code !== 1000 &&
      code !== 1001 &&
      this.#options.heartbeat.autoReconnect
    ) {
      this.#reconnectCount++;

      // Calculate reconnection delay
      const delay = this.#getReconnectionDelay();

      // Wait before reconnecting
      await sleep(delay);

      // Try to resume if possible, otherwise reconnect
      if (this.#shouldResume(code) && this.#canResume()) {
        await this.#attemptResume();
      } else {
        await this.connect();
      }
    } else {
      // Set state to disconnected if no reconnect is happening
      this.#state = "disconnected";
    }
  }

  /**
   * Handles WebSocket errors
   *
   * @param error - WebSocket error
   * @private
   */
  #handleError(error: Error): void {
    this.emit("error", new Error("WebSocket error", { cause: error }));
  }

  /**
   * Handles Gateway dispatch events
   *
   * @param payload - Dispatch payload
   * @private
   */
  #handleDispatchEvent(payload: PayloadEntity): void {
    if (!payload.t) {
      return;
    }

    // Handle specific events
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

    // Forward the dispatch event
    this.emit(
      "dispatch",
      payload.t,
      payload.d as GatewayReceiveEvents[typeof payload.t],
    );
  }

  /**
   * Handles the READY dispatch event
   *
   * @param data - Ready payload data
   * @private
   */
  #handleReadyEvent(data: ReadyEntity): void {
    // Update session information
    this.#session.id = data.session_id;
    this.#session.resumeUrl = data.resume_gateway_url;
    this.#session.readyAt = Date.now();
    this.#state = "ready";

    // Handle sharding if enabled
    if (this.#shard.isEnabled) {
      const shardId = data.shard?.[0] ?? 0;
      this.#shard.setShardStatus(shardId, "ready");

      // Add guilds to shard
      const guildIds = data.guilds.map((guild) => guild.id);
      this.#shard.addGuildsToShard(shardId, guildIds);
    }

    // Emit session start event
    this.emit("sessionStart", {
      timestamp: new Date().toISOString(),
      sessionId: data.session_id,
      resumeUrl: data.resume_gateway_url,
      userId: data.user.id,
      guildCount: data.guilds.length,
      encoding: this.#encoding.type,
      compression: this.#compression.type,
      shardCount: this.#shard.totalShards,
    });
  }

  /**
   * Handles the RESUMED dispatch event
   *
   * @private
   */
  #handleResumedEvent(): void {
    this.#state = "ready";

    if (!this.#session.readyAt) {
      this.#session.readyAt = Date.now();
    }

    this.emit("sessionResume", {
      timestamp: new Date().toISOString(),
      sessionId: this.#session.id ?? "",
      sequence: this.#session.sequence,
      replayedEvents: 0, // This is not tracked
      latencyMs: this.#heartbeat.latency,
    });
  }

  /**
   * Handles GUILD_CREATE events for shard management
   *
   * @param data - Guild create data
   * @private
   */
  #handleGuildCreate(data: GuildCreateEntity): void {
    if (this.#shard.isEnabled && "id" in data && !("unavailable" in data)) {
      this.#shard.addGuildToShard(data.id);
    }
  }

  /**
   * Handles GUILD_DELETE events for shard management
   *
   * @param data - Guild delete data
   * @private
   */
  #handleGuildDelete(data: UnavailableGuildEntity): void {
    if (this.#shard.isEnabled && "id" in data) {
      this.#shard.removeGuildFromShard(data.id);
    }
  }

  /**
   * Attempts to resume a session with the stored resume URL
   *
   * @private
   */
  async #attemptResume(): Promise<void> {
    if (!this.#canResume()) {
      throw new Error("Cannot resume: missing session ID or sequence number");
    }

    const resumeUrl = this.#session.resumeUrl;
    if (!resumeUrl) {
      throw new Error("Cannot resume: missing resume URL");
    }

    try {
      this.#state = "resuming";
      await this.#connectToGateway(resumeUrl);
      // Hello handler will send resume payload
    } catch (_error) {
      // If resume fails, fall back to a clean reconnect
      this.#clearSession();
      await this.connect();
    }
  }

  /**
   * Closes the WebSocket connection
   *
   * @param code - Close code to send
   * @param reason - Optional close reason
   * @private
   */
  #closeWebSocket(code?: number, reason?: string): void {
    const ws = this.#ws;
    if (!ws) {
      return;
    }

    // Remove all listeners to prevent handling after close
    ws.removeAllListeners();

    try {
      ws.close(code, reason);
    } catch (_error) {
      // Ignore errors during close
    }

    this.#ws = null;
  }

  /**
   * Builds the Gateway URL with query parameters
   *
   * @param baseUrl - Base Gateway URL
   * @returns Complete Gateway URL with parameters
   * @private
   */
  #buildGatewayUrl(baseUrl: string): string {
    const params = new URLSearchParams({
      v: String(this.#options.version),
      encoding: this.#encoding.type,
    });

    if (this.#compression.type) {
      params.append("compress", this.#compression.type);
    }

    return `${baseUrl}?${params}`;
  }

  /**
   * Checks if the current session can be resumed
   *
   * @returns True if the session can be resumed
   * @private
   */
  #canResume(): boolean {
    return Boolean(this.#session.id && this.#session.sequence > 0);
  }

  /**
   * Determines if a session should be resumed based on close code
   *
   * @param code - WebSocket close code
   * @returns True if session should be resumed
   * @private
   */
  #shouldResume(code: number): boolean {
    const isClean = code === 1000 || code === 1001;
    return !(isClean || this.#options.nonResumableCodes.includes(code));
  }

  /**
   * Clears the current session information
   *
   * @private
   */
  #clearSession(): void {
    this.#session = {
      id: null,
      resumeUrl: null,
      sequence: 0,
      readyAt: null,
    };
  }

  /**
   * Gets the reconnection delay based on attempt count
   *
   * @returns Delay in milliseconds
   * @private
   */
  #getReconnectionDelay(): number {
    const schedule = this.#options.backoffSchedule;
    const index = Math.min(this.#reconnectCount - 1, schedule.length - 1);

    // Use the last value in the schedule if we've exceeded the schedule length
    return schedule[index] ?? schedule.at(-1) ?? 1000;
  }
}
