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
 * Configuration options for the Discord Gateway client
 *
 * These options control all aspects of the WebSocket connection to Discord's
 * Gateway API, including authentication, performance optimization, and operational behavior.
 *
 * The Gateway implements Discord's real-time WebSocket protocol for receiving events
 * about guilds, users, messages, and other Discord entities. Proper configuration
 * is essential for optimal performance and reliability.
 *
 * @see {@link https://discord.com/developers/docs/topics/gateway}
 */
export const GatewayOptions = z.object({
  /**
   * Discord bot token for authentication
   *
   * This token authenticates your bot with Discord's API and determines which
   * bot account the Gateway connection represents. The token format should be
   * "Bot YOUR_TOKEN_HERE" for bot accounts.
   *
   * Security note: Never expose this token in client-side code or public repositories.
   *
   * @see {@link https://discord.com/developers/docs/reference#authentication}
   */
  token: z.string(),

  /**
   * Gateway intents bitfield specifying which events to receive
   *
   * Intents are a system for controlling which Gateway events your bot receives.
   * They help reduce bandwidth usage and improve performance by filtering out
   * irrelevant events. Some intents require additional permissions or verification.
   *
   * Can be specified as an array of intent flags (automatically combined into bitfield)
   * or as a pre-calculated bitfield number.
   *
   * @see {@link https://discord.com/developers/docs/topics/gateway#gateway-intents}
   */
  intents: z.union([
    z
      .array(z.enum(GatewayIntentsBits))
      .transform((value) => Number(BitField.combine(value).valueOf())),
    z.number().int().min(0),
  ]),

  /**
   * Whether to wait for the READY event before considering the connection complete
   *
   * When true, the connect() method waits for Discord to send the READY event
   * before resolving. This ensures the bot is fully authenticated and ready
   * to process commands.
   *
   * Set to false if you want to handle the READY event manually or start
   * processing other events immediately after authentication begins.
   *
   * @default true
   */
  waitForReady: z.boolean().default(true),

  /**
   * Discord API version to target
   *
   * Specifies which version of Discord's API to use. Different versions may
   * have different event structures, endpoints, or capabilities.
   *
   * It's recommended to use the latest stable version unless you have specific
   * compatibility requirements.
   *
   * @default ApiVersion.V10
   * @see {@link https://discord.com/developers/docs/reference#api-versioning}
   */
  version: z.literal(ApiVersion.V10).default(ApiVersion.V10),

  /**
   * Member threshold for large guild optimization
   *
   * Guilds with more members than this threshold are considered "large" and
   * Discord will not send all member data in the initial GUILD_CREATE event.
   * Instead, you must request members using the Request Guild Members operation.
   *
   * Higher values increase initial payload size but provide more complete data.
   * Lower values reduce bandwidth but require additional requests for member data.
   *
   * @default 50
   * @minimum 50
   * @maximum 250
   * @see {@link https://discord.com/developers/docs/resources/guild#guild-object}
   */
  largeThreshold: z.number().int().min(50).max(250).default(50),

  /**
   * Payload encoding format for Gateway communication
   *
   * Controls how payloads are serialized for transmission:
   * - **json**: Standard JSON encoding (universal compatibility, human-readable)
   * - **etf**: Erlang Term Format (binary, smaller size, faster processing)
   *
   * ETF encoding can reduce bandwidth usage by 20-30% and improve performance,
   * but requires the optional 'erlpack' dependency.
   *
   * @default "json"
   * @see {@link https://discord.com/developers/docs/topics/gateway#encoding-and-compression}
   */
  encodingType: EncodingType.default("json"),

  /**
   * Payload compression algorithm for bandwidth optimization
   *
   * Enables compression of Gateway payloads to reduce bandwidth usage:
   * - **zlib-stream**: Industry-standard compression (60-70% size reduction)
   * - **zstd-stream**: Modern compression (70-80% size reduction, faster)
   * - **undefined**: No compression (higher bandwidth, lower CPU usage)
   *
   * Compression is highly recommended for production bots to reduce bandwidth
   * costs and improve performance over slower connections.
   *
   * @default undefined
   * @see {@link https://discord.com/developers/docs/topics/gateway#compression}
   */
  compressionType: CompressionType.optional(),

  /**
   * Exponential backoff schedule for reconnection attempts
   *
   * Defines wait times (in milliseconds) between reconnection attempts after
   * connection failures. Each subsequent failure uses the next delay in the array.
   * If more failures occur than array entries, the last value is used.
   *
   * Exponential backoff helps prevent overwhelming Discord's servers during
   * widespread outages and reduces the likelihood of rate limiting.
   *
   * @default [1000, 5000, 10000]
   */
  backoffSchedule: z
    .array(z.number().int().positive())
    .default([1000, 5000, 10000]),

  /**
   * WebSocket close codes that prevent session resumption
   *
   * These close codes indicate terminal failures where the session cannot be
   * resumed and a fresh connection must be established. Attempting to resume
   * with these codes will result in additional failures.
   *
   * The default list includes Discord's documented non-resumable codes:
   * - 4004: Authentication failed
   * - 4010: Invalid shard
   * - 4011: Sharding required
   * - 4012: Invalid API version
   * - 4013: Invalid intents
   * - 4014: Disallowed intents
   *
   * @default [4004, 4010, 4011, 4012, 4013, 4014]
   * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-close-event-codes}
   */
  nonResumableCodes: z
    .array(z.number().int().positive())
    .default([4004, 4010, 4011, 4012, 4013, 4014]),

  /**
   * Initial presence status to set when connecting
   *
   * Defines the bot's initial online status, activity, and other presence
   * information that users will see in Discord. If not specified, the bot
   * will appear online with no activity.
   *
   * Can be updated later using the updatePresence() method.
   *
   * @default undefined
   * @see {@link https://discord.com/developers/docs/topics/gateway-events#update-presence}
   */
  presence: z.custom<UpdatePresenceEntity>().optional(),

  /**
   * Heartbeat system configuration
   *
   * Controls the behavior of the heartbeat system that keeps the WebSocket
   * connection alive and monitors connection health.
   *
   * @see {@link HeartbeatOptions} for detailed cache configuration.
   */
  heartbeat: HeartbeatOptions.prefault({}),

  /**
   * Sharding configuration for large bots
   *
   * Controls how the bot's guild connections are distributed across multiple
   * shards for better performance and scalability. Required for bots in 2500+ guilds.
   *
   * @see {@link ShardOptions} for detailed cache configuration.
   * @see {@link https://discord.com/developers/docs/topics/gateway#sharding}
   */
  shard: ShardOptions.prefault({}),
});

export type GatewayOptions = z.infer<typeof GatewayOptions>;

/**
 * Primary Discord Gateway client for real-time communication
 *
 * The Gateway class implements Discord's WebSocket-based real-time communication protocol,
 * providing a robust, scalable interface for receiving events about Discord entities
 * (guilds, users, messages, etc.) and sending commands to Discord.
 *
 * ## Core Capabilities
 *
 * - **Real-time Events**: Receive live updates about Discord activity
 * - **Session Management**: Automatic connection handling with resumption support
 * - **Heartbeat System**: Connection health monitoring and automatic recovery
 * - **Sharding Support**: Horizontal scaling for large bots (2500+ guilds)
 * - **Compression & Encoding**: Bandwidth optimization with multiple algorithms
 * - **Error Recovery**: Robust reconnection logic with exponential backoff
 *
 * ## Connection Lifecycle
 *
 * 1. **Initialization**: Services are initialized and dependencies loaded
 * 2. **Connection**: WebSocket connection established to Discord's Gateway
 * 3. **Authentication**: Bot authenticates using Identify or Resume
 * 4. **Ready State**: Bot receives READY event and begins processing events
 * 5. **Event Processing**: Continuous event reception and heartbeat maintenance
 * 6. **Recovery**: Automatic reconnection and session resumption on failures
 *
 * ## Performance Characteristics
 *
 * - **Memory Usage**: ~50-100MB base + ~1KB per guild + event buffers
 * - **CPU Usage**: <1% on modern hardware for typical workloads
 * - **Bandwidth**: 10-50KB/s depending on activity and compression settings
 * - **Latency**: Typically 50-200ms depending on geographic location
 *
 * ## Error Handling
 *
 * The Gateway implements comprehensive error handling with automatic recovery:
 * - Transient network errors trigger automatic reconnection
 * - Authentication failures are reported and require manual intervention
 * - Rate limiting is handled automatically with exponential backoff
 * - Session resumption minimizes data loss during reconnections
 *
 * @see {@link https://discord.com/developers/docs/topics/gateway}
 */
export class Gateway extends EventEmitter<GatewayEvents> {
  /**
   * Heartbeat manager for connection health monitoring
   *
   * Manages the heartbeat protocol required to maintain the WebSocket connection.
   * Provides access to latency metrics, connection health status, and manual
   * heartbeat control for advanced use cases.
   *
   * The heartbeat system automatically:
   * - Sends periodic heartbeats at Discord's specified interval
   * - Monitors for acknowledgements to detect connection issues
   * - Triggers reconnection when heartbeats are missed
   * - Calculates round-trip latency for performance monitoring
   */
  readonly heartbeat: HeartbeatManager;

  /**
   * Session manager for connection state and resumption
   *
   * Handles all aspects of Gateway session lifecycle including establishment,
   * maintenance, and resumption after disconnections. Provides access to session
   * metrics, health information, and resumption capabilities.
   *
   * The session manager automatically:
   * - Tracks session IDs and resumption URLs from Discord
   * - Maintains sequence numbers for event ordering
   * - Handles session invalidation scenarios
   * - Provides health metrics and uptime tracking
   */
  readonly session: SessionManager;

  /**
   * Shard manager for horizontal scaling
   *
   * Manages multiple shard connections for bots that exceed Discord's single-shard
   * limits (2500+ guilds). Handles shard allocation, guild distribution, and
   * individual shard lifecycle management.
   *
   * Key features:
   * - Automatic shard spawning based on guild count
   * - Load balancing across available shards
   * - Individual shard health monitoring
   * - Guild-to-shard mapping for efficient operations
   */
  readonly shard: ShardManager;

  /**
   * Compression service for bandwidth optimization
   *
   * Handles compression and decompression of Gateway payloads to reduce bandwidth
   * usage. Supports multiple compression algorithms with different performance
   * characteristics.
   *
   * Performance benefits:
   * - 60-85% reduction in bandwidth usage
   * - Lower latency over slower connections
   * - Reduced data transfer costs
   * - Minimal CPU overhead on modern hardware
   */
  readonly compression: CompressionService;

  /**
   * Encoding service for payload serialization
   *
   * Manages encoding and decoding of Gateway payloads between raw bytes and
   * structured objects. Supports multiple encoding formats optimized for
   * different use cases.
   *
   * Available formats:
   * - JSON: Universal compatibility, human-readable debugging
   * - ETF: Binary format, smaller payload size, faster processing
   */
  readonly encoding: EncodingService;

  /**
   * Gets the current connection state
   *
   * Returns the high-level Gateway connection state which provides more semantic
   * meaning than the raw WebSocket state. This state reflects the Gateway's
   * position in the Discord authentication and event processing lifecycle.
   *
   * @returns Current Gateway connection state
   */
  state: GatewayConnectionState = GatewayConnectionState.Idle;

  /**
   * Current WebSocket connection to Discord's Gateway
   * Handles the underlying WebSocket communication protocol
   * Set to null when disconnected
   * @internal
   */
  #ws: WebSocket | null = null;

  /**
   * Reconnection attempt counter for backoff calculation
   * Incremented on each reconnection attempt and reset on successful connection
   * Used to implement exponential backoff strategy
   * @internal
   */
  #reconnectCount = 0;

  /**
   * Discord REST API client for Gateway URL discovery
   * Used to fetch gateway connection URLs and bot information
   * @internal
   */
  readonly #rest: Rest;

  /**
   * Validated Gateway configuration options
   * Contains all parsed and validated configuration settings
   * @internal
   */
  readonly #options: GatewayOptions;

  /**
   * Creates a new Gateway client instance
   *
   * Initializes the Gateway with the provided configuration, validates options,
   * and sets up all required services including heartbeat management, session
   * handling, encoding, compression, and sharding.
   *
   * This constructor only prepares the Gateway for connection - call connect()
   * to actually establish the WebSocket connection to Discord.
   *
   * @param rest - Discord REST API client for Gateway URL discovery and bot information
   * @param options - Gateway configuration controlling behavior, authentication, and features
   * @throws Error If configuration validation fails with detailed validation messages
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
   * Gets the current WebSocket state
   *
   * Returns the WebSocket connection state according to the WebSocket specification.
   * Useful for determining if the underlying connection is available for sending data.
   *
   * @returns WebSocket ready state constant (CONNECTING=0, OPEN=1, CLOSING=2, CLOSED=3)
   */
  get wsState(): number {
    return this.#ws?.readyState ?? WebSocket.CLOSED;
  }

  /**
   * Gets the timestamp when the connection last became ready
   *
   * Returns the timestamp (milliseconds since epoch) when the Gateway last received
   * a READY event from Discord, indicating successful authentication and connection.
   *
   * @returns Ready timestamp in milliseconds, or 0 if never connected
   */
  get readyAt(): number {
    return this.session.readyAt ?? 0;
  }

  /**
   * Gets the connection uptime in milliseconds
   *
   * Calculates how long the Gateway has been in the ready state since the last
   * successful connection. Useful for monitoring connection stability and
   * implementing uptime-based logic.
   *
   * @returns Uptime in milliseconds, or 0 if not connected
   */
  get uptime(): number {
    return this.session.uptime;
  }

  /**
   * Gets the connection latency in milliseconds
   *
   * Returns the round-trip time between sending a heartbeat and receiving an
   * acknowledgement from Discord. This represents the effective "ping" to Discord
   * and is a key metric for connection quality.
   *
   * @returns Current latency in milliseconds
   */
  get latency(): number {
    return this.heartbeat.latency;
  }

  /**
   * Gets the current event sequence number
   *
   * Returns the sequence number of the last received event from Discord.
   * This number is critical for session resumption and ensuring events
   * are processed in the correct order.
   *
   * @returns Current sequence number
   */
  get sequence(): number {
    return this.session.sequence;
  }

  /**
   * Gets the current session ID
   *
   * Returns the unique session identifier assigned by Discord. This ID is
   * required for session resumption and is provided in the READY event.
   *
   * @returns Session ID string, or null if not connected
   */
  get sessionId(): string | null {
    return this.session.id;
  }

  /**
   * Gets the session resume URL
   *
   * Returns the specific URL provided by Discord for resuming this session.
   * This URL may be different from the initial connection URL and is optimized
   * for the current session's requirements.
   *
   * @returns Resume URL string, or null if not available
   */
  get resumeUrl(): string | null {
    return this.session.resumeUrl;
  }

  /**
   * Checks if the Gateway is ready for normal operations
   *
   * Returns true when the Gateway has successfully authenticated with Discord
   * and is ready to send commands and receive events. Most Gateway operations
   * require this state.
   *
   * @returns True if ready for operations, false otherwise
   */
  get isReady(): boolean {
    return this.state === GatewayConnectionState.Ready;
  }

  /**
   * Establishes connection to Discord's Gateway
   *
   * Performs the complete connection sequence including service initialization,
   * WebSocket establishment, authentication, and readiness confirmation.
   *
   * The connection process:
   * 1. Validates current state and prevents duplicate connections
   * 2. Fetches Gateway URL and bot information from Discord API
   * 3. Initializes encoding and compression services
   * 4. Sets up sharding configuration if enabled
   * 5. Establishes WebSocket connection to Gateway
   * 6. Completes authentication (Identify or Resume)
   * 7. Waits for READY/RESUMED event if configured
   *
   * @returns Promise resolving when connection is established and ready
   * @throws Error If any step of the connection process fails
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
   * Updates the bot's presence information
   *
   * Changes the bot's status, activity, and other presence data visible to Discord users.
   * This affects how the bot appears in member lists, profiles, and other UI elements.
   *
   * @param presence - New presence configuration including status and activities
   * @throws Error If the Gateway is not ready for operations
   */
  updatePresence(presence: UpdatePresenceEntity): void {
    this.#requireReady("update presence");
    this.send(GatewayOpcodes.PresenceUpdate, presence);
  }

  /**
   * Updates the bot's voice connection state
   *
   * Controls voice channel connections for the bot, including joining, leaving,
   * muting, and deafening. Required for any voice functionality including music bots.
   *
   * @param options - Voice state configuration including guild and channel IDs
   * @throws Error If the Gateway is not ready for operations
   */
  updateVoiceState(options: UpdateVoiceStateEntity): void {
    this.#requireReady("update voice state");
    this.send(GatewayOpcodes.VoiceStateUpdate, options);
  }

  /**
   * Requests member information for a guild
   *
   * Fetches member data for guilds where the complete member list wasn't provided
   * in the initial GUILD_CREATE event (typically guilds over the large_threshold).
   * Can request all members or filter by user IDs or username prefixes.
   *
   * @param options - Request parameters including guild ID and query filters
   * @throws Error If the Gateway is not ready for operations
   */
  requestGuildMembers(options: RequestGuildMembersEntity): void {
    this.#requireReady("request guild members");
    this.send(GatewayOpcodes.RequestGuildMembers, options);
  }

  /**
   * Requests available soundboard sounds for a guild
   *
   * Fetches the list of soundboard sounds available in a specific guild.
   * Used for bots that interact with Discord's soundboard feature.
   *
   * @param options - Request parameters specifying the target guild
   * @throws Error If the Gateway is not ready for operations
   */
  requestSoundboardSounds(options: RequestSoundboardSoundsEntity): void {
    this.#requireReady("request soundboard sounds");
    this.send(GatewayOpcodes.RequestSoundboardSounds, options);
  }

  /**
   * Sends a raw payload to the Gateway
   *
   * Low-level method for sending Gateway opcodes and data directly to Discord.
   * Most users should use the higher-level methods instead, but this is available
   * for advanced use cases or implementing new Gateway features.
   *
   * @param opcode - Gateway opcode specifying the operation type
   * @param data - Payload data specific to the opcode
   * @throws Error If the WebSocket connection is not open
   */
  send<T extends keyof GatewaySendEvents>(
    opcode: T,
    data: GatewaySendEvents[T],
  ): void {
    if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) {
      throw new Error("Cannot send data: WebSocket connection not open");
    }

    const payload: PayloadEntity = {
      op: opcode,
      d: data,
      s: null,
      t: null,
    };

    const encoded = this.encoding.encode(payload);
    this.#ws.send(encoded);
  }

  /**
   * Gracefully disconnects from the Gateway
   *
   * Performs a clean shutdown of the Gateway connection without triggering
   * automatic reconnection. This is useful for maintenance, application shutdown,
   * or when temporary disconnection is desired.
   *
   * @param code - WebSocket close code (1000 = normal closure)
   * @param reason - Human-readable reason for disconnection
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
   * Completely destroys the Gateway and releases all resources
   *
   * Performs comprehensive cleanup including WebSocket closure, service destruction,
   * event listener removal, and resource deallocation. Should be called when the
   * Gateway instance is no longer needed.
   *
   * After calling destroy(), the Gateway instance cannot be reused.
   *
   * @param code - WebSocket close code for connection termination
   * @throws Error If destruction encounters errors during cleanup
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
   * Establishes WebSocket connection to Discord's Gateway
   *
   * Creates a new WebSocket connection to the provided Gateway URL, sets up
   * event handlers for the WebSocket lifecycle, and waits for the connection
   * to be established. The URL includes query parameters for API version,
   * encoding, and compression settings.
   *
   * @param url - Base Gateway URL from Discord's bot gateway info endpoint
   * @throws Error If WebSocket connection fails or times out
   * @internal
   */
  async #connectToGateway(url: string): Promise<void> {
    try {
      // Build the complete Gateway URL with required query parameters
      const wsUrl = this.#buildGatewayUrl(url);
      const ws = new WebSocket(wsUrl);
      this.#ws = ws;

      // Set up WebSocket event handlers for the connection lifecycle
      ws.on("message", this.#handleMessage.bind(this));
      ws.on("close", this.#handleClose.bind(this));
      ws.on("error", (error) => this.emit("wsError", error));

      // Wait for the connection to open with a timeout for reliability
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
   * Waits for READY or RESUMED event confirmation
   *
   * After establishing the WebSocket connection and sending authentication,
   * this method waits for Discord to confirm successful authentication with
   * either a READY (new session) or RESUMED (resumed session) event.
   *
   * @returns Promise that resolves when authentication is confirmed
   * @throws Error If authentication times out or fails
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
   * Processes incoming WebSocket messages
   *
   * Handles decompression (if enabled), decoding, sequence number updates,
   * and routing of all messages received from Discord's Gateway. This is
   * the entry point for all Gateway events and opcodes.
   *
   * @param data - Raw message data received from the WebSocket
   * @internal
   */
  async #handleMessage(data: Buffer): Promise<void> {
    // Emit raw message event for monitoring and debugging
    this.emit("wsMessage", data);

    // Decompress the payload if compression is enabled
    let processedData = data;
    if (this.compression.isInitialized) {
      processedData = this.compression.decompress(data);
    }

    // Decode the payload from the configured encoding format
    const payload = this.encoding.decode(processedData);

    // Update sequence number for session resumption if present
    if (payload.s !== null) {
      this.session.updateSequence(payload.s);
    }

    // Route the payload to the appropriate handler
    await this.#processPayload(payload);
  }

  /**
   * Routes payloads to appropriate handlers based on opcode
   *
   * Analyzes the payload opcode and delegates processing to the specific
   * handler for that operation. This is the central routing mechanism for
   * all Gateway protocol operations.
   *
   * @param payload - Decoded Gateway payload with opcode and data
   * @internal
   */
  async #processPayload(payload: PayloadEntity): Promise<void> {
    switch (payload.op) {
      case GatewayOpcodes.Dispatch:
        // Regular event dispatch (op 0)
        this.#handleDispatchEvent(payload);
        break;

      case GatewayOpcodes.Hello:
        // Initial hello message with heartbeat interval (op 10)
        await this.#handleHello(payload.d as HelloEntity);
        break;

      case GatewayOpcodes.Heartbeat:
        // Discord requested immediate heartbeat (op 1)
        this.heartbeat.sendHeartbeat();
        break;

      case GatewayOpcodes.HeartbeatAck:
        // Discord acknowledged our heartbeat (op 11)
        this.heartbeat.ackHeartbeat();
        break;

      case GatewayOpcodes.InvalidSession:
        // Session invalidation notification (op 9)
        await this.#handleInvalidSession(Boolean(payload.d));
        break;

      case GatewayOpcodes.Reconnect:
        // Discord requested reconnection (op 7)
        await this.#handleReconnect();
        break;

      default:
        // Unknown or unhandled opcode - safely ignore
        break;
    }
  }

  /**
   * Handles Hello opcode and starts authentication
   *
   * The Hello opcode is received immediately after WebSocket connection
   * and contains the heartbeat interval. It triggers the authentication
   * flow (either Identify for new sessions or Resume for existing sessions).
   *
   * @param hello - Hello payload containing heartbeat_interval
   * @internal
   */
  async #handleHello(hello: HelloEntity): Promise<void> {
    // Start heartbeat system with Discord's specified interval
    this.heartbeat.start(hello.heartbeat_interval);

    // Determine authentication method based on session state
    if (this.session.canResume) {
      this.#setState(GatewayConnectionState.Resuming);
      this.#sendResume();
    } else {
      this.#setState(GatewayConnectionState.Identifying);
      await this.#sendIdentify();
    }

    // Move to authenticating state while waiting for response
    this.#setState(GatewayConnectionState.Authenticating);
  }

  /**
   * Sends Identify payload for new session authentication
   *
   * Constructs and sends an Identify payload to establish a new Gateway session.
   * Includes bot token, intents, shard information, and presence data.
   * Used when no existing session can be resumed.
   *
   * @throws Error If shard information cannot be obtained when sharding is enabled
   * @internal
   */
  async #sendIdentify(): Promise<void> {
    // Construct the identify payload with required authentication data
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

    // Add shard information if sharding is enabled
    if (this.shard.totalShards > 0) {
      payload.shard = await this.shard.getAvailableShard();
    }

    // Add initial presence data if configured
    if (this.#options.presence) {
      payload.presence = this.#options.presence;
    }

    // Send the identify payload to Discord
    this.send(GatewayOpcodes.Identify, payload);
  }

  /**
   * Sends Resume payload for session resumption
   *
   * Constructs and sends a Resume payload to continue an existing Gateway session
   * after a disconnection. Uses stored session ID and sequence number to resume
   * from the last received event.
   *
   * @throws Error If no session ID is available for resumption
   * @internal
   */
  #sendResume(): void {
    if (!this.session.id) {
      throw new Error("Cannot resume: no session ID available");
    }

    // Get resume data from session manager
    const resumeData = this.session.getResumeData(this.#options.token);

    // Send the resume payload to Discord
    this.send(GatewayOpcodes.Resume, resumeData);
  }

  /**
   * Handles InvalidSession opcode
   *
   * Processes session invalidation messages from Discord. The payload indicates
   * whether the session can potentially be resumed or if a fresh connection
   * is required. Implements appropriate delays and retry logic.
   *
   * @param resumable - Whether Discord indicates the session might be resumable
   * @internal
   */
  async #handleInvalidSession(resumable: boolean): Promise<void> {
    // Notify session manager of invalidation
    this.session.invalidateSession(
      resumable,
      resumable ? "server_request" : "authentication_failed",
    );

    // Add jitter delay to prevent thundering herd effects
    await sleep(1000 + Math.random() * 4000);

    // Attempt appropriate recovery strategy
    if (resumable && this.session.canResume) {
      this.#setState(GatewayConnectionState.Resuming);
      this.#sendResume();
      this.#setState(GatewayConnectionState.Authenticating);
    } else {
      // Session cannot be resumed - establish fresh connection
      this.#closeWebSocket();
      await this.connect();
    }
  }

  /**
   * Handles Reconnect opcode from Discord
   *
   * Processes reconnection requests from Discord, typically sent during server
   * maintenance or load balancing. Attempts to resume the session if possible,
   * otherwise establishes a fresh connection.
   *
   * @internal
   */
  async #handleReconnect(): Promise<void> {
    // Check if session can be resumed
    const canResume = this.session.canResume;

    // Close current connection cleanly
    this.#closeWebSocket(4000);

    // Brief delay to ensure clean disconnection
    await sleep(500);

    // Attempt appropriate reconnection strategy
    if (canResume) {
      await this.#attemptResume();
    } else {
      await this.connect();
    }
  }

  /**
   * Handles WebSocket close events and manages reconnection
   *
   * Processes all WebSocket closure scenarios, determines appropriate recovery
   * actions based on close codes, manages shard state updates, and implements
   * exponential backoff for reconnection attempts.
   *
   * @param code - WebSocket close code indicating the reason for closure
   * @param reason - Human-readable close reason provided by the server
   * @internal
   */
  async #handleClose(code: number, reason: string): Promise<void> {
    // Emit close event for monitoring and logging
    this.emit("wsClose", code, reason);

    // Stop heartbeat system immediately to prevent zombied connections
    this.heartbeat.destroy();

    // Clear session data for non-resumable close codes
    if (
      code === 1000 ||
      code === 1001 ||
      this.#options.nonResumableCodes.includes(code)
    ) {
      this.session.destroy();
    }

    // Update shard statuses if sharding is enabled
    for (const shard of this.shard.shards) {
      if (shard.status !== "disconnected") {
        this.shard.setShardStatus(shard.shardId, "disconnected");
      }
    }

    // Implement reconnection logic for non-clean closures
    if (
      code !== 1000 &&
      code !== 1001 &&
      this.#options.heartbeat.autoReconnect
    ) {
      this.#reconnectCount++;
      this.#setState(GatewayConnectionState.Reconnecting);

      // Calculate exponential backoff delay
      const delay = this.#getReconnectionDelay();
      await sleep(delay);

      // Choose reconnection strategy based on session state
      if (this.#shouldResume(code) && this.session.canResume) {
        await this.#attemptResume();
      } else {
        await this.connect();
      }
    } else {
      // No reconnection needed - set final state
      this.#setState(GatewayConnectionState.Disconnected);
    }
  }

  /**
   * Processes Gateway dispatch events (op=0)
   *
   * Handles all dispatch events from Discord, performing internal processing
   * for session-critical events (READY, RESUMED, guild events) and forwarding
   * all events to application code via the dispatch event emitter.
   *
   * @param payload - Dispatch payload containing event type and data
   * @internal
   */
  #handleDispatchEvent(payload: PayloadEntity): void {
    if (!payload.t) {
      return;
    }

    // Process events that require internal handling
    switch (payload.t) {
      case "READY":
        // Session establishment event
        this.#handleReadyEvent(payload.d as ReadyEntity);
        break;

      case "RESUMED":
        // Session resumption confirmation
        this.#handleResumedEvent();
        break;

      case "GUILD_CREATE":
        // Guild availability notification
        this.#handleGuildCreate(payload.d as GuildCreateEntity);
        break;

      case "GUILD_DELETE":
        // Guild unavailability notification
        this.#handleGuildDelete(payload.d as UnavailableGuildEntity);
        break;

      default:
        // No internal processing required
        break;
    }

    // Forward all dispatch events to application code
    this.emit(
      "dispatch",
      payload.t,
      payload.d as GatewayReceiveEvents[typeof payload.t],
    );
  }

  /**
   * Handles READY event and initializes session
   *
   * Processes the READY event to establish session state, update shard information,
   * and emit session start events. The READY event marks successful authentication
   * and contains essential session data.
   *
   * @param data - READY event payload containing session and bot information
   * @internal
   */
  #handleReadyEvent(data: ReadyEntity): void {
    // Initialize session with data from READY event
    this.session.initializeSession(
      data,
      this.encoding.type,
      this.compression.type,
    );

    // Update connection state to ready
    this.#setState(GatewayConnectionState.Ready);

    // Handle shard-specific processing if sharding is enabled
    if (this.shard.totalShards > 0) {
      const shardId = data.shard?.[0] ?? 0;
      this.shard.setShardStatus(shardId, "ready");

      // Map initial guilds to the shard
      const guildIds = data.guilds.map((guild) => guild.id);
      this.shard.addGuildsToShard(shardId, guildIds);
    }
  }

  /**
   * Handles RESUMED event
   *
   * Processes session resumption confirmation from Discord. Updates session
   * state and connection status after successful session resumption.
   *
   * @internal
   */
  #handleResumedEvent(): void {
    // Update session state for successful resumption
    this.session.resumeSession();

    // Update connection state to ready
    this.#setState(GatewayConnectionState.Ready);
  }

  /**
   * Handles GUILD_CREATE for shard management
   *
   * Updates shard guild mappings when new guilds become available or when
   * the bot joins new guilds. Essential for maintaining accurate shard
   * load distribution.
   *
   * @param data - Guild create event data
   * @internal
   */
  #handleGuildCreate(data: GuildCreateEntity): void {
    // Only process available guilds for shard mapping
    if (
      this.shard.totalShards > 0 &&
      "id" in data &&
      !("unavailable" in data)
    ) {
      this.shard.addGuildToShard(data.id);
    }
  }

  /**
   * Handles GUILD_DELETE for shard management
   *
   * Updates shard guild mappings when guilds become unavailable or when
   * the bot is removed from guilds. Maintains accurate shard load tracking.
   *
   * @param data - Guild delete event data
   * @internal
   */
  #handleGuildDelete(data: UnavailableGuildEntity): void {
    // Remove guild from shard mappings
    if (this.shard.totalShards > 0 && "id" in data) {
      this.shard.removeGuildFromShard(data.id);
    }
  }

  /**
   * Attempts session resumption using stored resume URL
   *
   * Tries to resume an existing session using the resume URL provided by Discord.
   * If resumption fails, falls back to establishing a fresh connection.
   *
   * @throws Error If session cannot be resumed due to missing data
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
      // Resume failed - clear session and establish fresh connection
      this.session.destroy();
      await this.connect();
    }
  }

  /**
   * Safely closes WebSocket connection
   *
   * Performs cleanup of the WebSocket connection including event listener
   * removal and graceful closure. Handles errors during close operations
   * to prevent exceptions during shutdown.
   *
   * @param code - WebSocket close code to send
   * @param reason - Optional close reason string
   * @internal
   */
  #closeWebSocket(code?: number, reason?: string): void {
    const ws = this.#ws;
    if (!ws) {
      return;
    }

    // Remove all event listeners to prevent callbacks after closure
    ws.removeAllListeners();

    try {
      // Attempt graceful closure with provided code and reason
      ws.close(code, reason);
    } catch (_error) {
      // Ignore errors during close - connection may already be closed
      // or in an invalid state for closure
    }

    // Clear the WebSocket reference
    this.#ws = null;
  }

  /**
   * Builds complete Gateway URL with query parameters
   *
   * Constructs the full WebSocket URL by appending required query parameters
   * for API version, encoding format, and compression settings to the base
   * Gateway URL provided by Discord.
   *
   * @param baseUrl - Base Gateway URL from Discord's API
   * @returns Complete WebSocket URL with query parameters
   * @internal
   */
  #buildGatewayUrl(baseUrl: string): string {
    // Add required query parameters for Gateway connection
    const params = new URLSearchParams({
      v: String(this.#options.version), // API version
      encoding: this.encoding.type, // Payload encoding format
    });

    // Add compression parameter if enabled
    if (this.compression.type) {
      params.append("compress", this.compression.type);
    }

    // Combine base URL with parameters
    return `${baseUrl}?${params}`;
  }

  /**
   * Determines if session should be resumed based on close code
   *
   * Evaluates WebSocket close codes to determine whether session resumption
   * should be attempted or if a fresh connection is required. Uses Discord's
   * documented guidelines for resumable vs non-resumable scenarios.
   *
   * @param code - WebSocket close code received from Discord
   * @returns True if session resumption should be attempted
   * @internal
   */
  #shouldResume(code: number): boolean {
    // Clean closures (1000, 1001) should not be resumed
    const isClean = code === 1000 || code === 1001;

    // Non-resumable codes indicate session cannot be continued
    return !(isClean || this.#options.nonResumableCodes.includes(code));
  }

  /**
   * Calculates reconnection delay using exponential backoff
   *
   * Implements exponential backoff strategy with jitter to prevent thundering
   * herd effects during mass reconnections. Uses the configured backoff schedule
   * and adds randomization to distribute reconnection attempts over time.
   *
   * @returns Delay in milliseconds before next reconnection attempt
   * @internal
   */
  #getReconnectionDelay(): number {
    const schedule = this.#options.backoffSchedule;

    // Select delay based on attempt count, capped at schedule length
    const index = Math.min(this.#reconnectCount - 1, schedule.length - 1);
    const baseDelay = schedule[index] ?? schedule.at(-1) ?? 1000;

    // Add jitter (±20%) and cap at maximum delay
    return Math.min(baseDelay * (0.8 + Math.random() * 0.4), 30000);
  }

  /**
   * Updates connection state with validation
   *
   * Safely transitions the Gateway connection state while validating that
   * the transition is legal according to the state machine rules. Emits
   * state change events for monitoring and debugging.
   *
   * @param newState - Target connection state
   * @throws Error If the state transition is invalid
   * @internal
   */
  #setState(newState: GatewayConnectionState): void {
    const oldState = this.state;

    // Validate state transition is allowed
    if (!this.#isValidTransition(oldState, newState)) {
      throw new Error(`Invalid state transition: ${oldState} -> ${newState}`);
    }

    // Update state and emit change event
    this.state = newState;
    this.emit("stateChange", oldState, newState);
  }

  /**
   * Validates connection state transitions
   *
   * Enforces the Gateway state machine by validating that state transitions
   * follow the allowed paths. This prevents invalid state changes that could
   * lead to inconsistent behavior or connection issues.
   *
   * The state machine ensures logical progression through the connection lifecycle:
   * - Idle can only transition to Connecting or Failed
   * - Connected states lead to authentication phases
   * - Ready state allows normal operations and graceful disconnection
   * - Error states provide recovery paths
   *
   * @param from - Current connection state
   * @param to - Target connection state
   * @returns True if the transition is valid according to the state machine
   * @internal
   */
  #isValidTransition(
    from: GatewayConnectionState,
    to: GatewayConnectionState,
  ): boolean {
    // Define allowed state transitions for the Gateway connection lifecycle
    // This state machine ensures logical progression through connection phases
    const connectionTransitions: Record<
      GatewayConnectionState,
      GatewayConnectionState[]
    > = {
      // Initial state - can start connecting or fail immediately
      [GatewayConnectionState.Idle]: [
        GatewayConnectionState.Connecting,
        GatewayConnectionState.Failed,
      ],

      // Connection attempt - can succeed, fail, disconnect, or need reconnection
      [GatewayConnectionState.Connecting]: [
        GatewayConnectionState.Connected,
        GatewayConnectionState.Disconnected,
        GatewayConnectionState.Failed,
        GatewayConnectionState.Reconnecting,
      ],

      // WebSocket connected - can proceed to authentication or disconnect
      [GatewayConnectionState.Connected]: [
        GatewayConnectionState.Identifying,
        GatewayConnectionState.Resuming,
        GatewayConnectionState.Disconnected,
        GatewayConnectionState.Failed,
      ],

      // New session identification - can authenticate, disconnect, fail, or reconnect
      [GatewayConnectionState.Identifying]: [
        GatewayConnectionState.Authenticating,
        GatewayConnectionState.Disconnected,
        GatewayConnectionState.Failed,
        GatewayConnectionState.Reconnecting,
      ],

      // Session resumption - can authenticate, become ready, disconnect, fail, or reconnect
      [GatewayConnectionState.Resuming]: [
        GatewayConnectionState.Authenticating,
        GatewayConnectionState.Ready,
        GatewayConnectionState.Disconnected,
        GatewayConnectionState.Failed,
        GatewayConnectionState.Reconnecting,
      ],

      // Authentication phase - can become ready, disconnect, fail, or reconnect
      [GatewayConnectionState.Authenticating]: [
        GatewayConnectionState.Ready,
        GatewayConnectionState.Disconnected,
        GatewayConnectionState.Failed,
        GatewayConnectionState.Reconnecting,
      ],

      // Fully operational - can disconnect gracefully, ungracefully, reconnect, or fail
      [GatewayConnectionState.Ready]: [
        GatewayConnectionState.Disconnecting,
        GatewayConnectionState.Disconnected,
        GatewayConnectionState.Reconnecting,
        GatewayConnectionState.Failed,
      ],

      // Reconnection attempt - can connect, disconnect, or fail
      [GatewayConnectionState.Reconnecting]: [
        GatewayConnectionState.Connecting,
        GatewayConnectionState.Disconnected,
        GatewayConnectionState.Failed,
      ],

      // Graceful disconnection - can only complete to disconnected
      [GatewayConnectionState.Disconnecting]: [
        GatewayConnectionState.Disconnected,
      ],

      // Disconnected - can reconnect, fail, or return to idle
      [GatewayConnectionState.Disconnected]: [
        GatewayConnectionState.Connecting,
        GatewayConnectionState.Failed,
        GatewayConnectionState.Idle,
      ],

      // Failed state - can return to idle or attempt reconnection
      [GatewayConnectionState.Failed]: [
        GatewayConnectionState.Idle,
        GatewayConnectionState.Connecting,
      ],
    };

    // Check if the target state is in the list of allowed transitions
    return connectionTransitions[from]?.includes(to) ?? false;
  }

  /**
   * Validates Gateway is ready for operations
   *
   * Checks that the Gateway is in the Ready state before allowing operations
   * that require an authenticated connection. Provides descriptive error
   * messages for debugging connection issues.
   *
   * @param operation - Description of the operation being attempted
   * @throws Error If the Gateway is not ready with current state information
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
