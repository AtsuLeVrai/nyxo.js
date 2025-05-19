import {
  ApiVersion,
  BitField,
  type UnavailableGuildEntity,
  sleep,
} from "@nyxojs/core";
import type { Rest } from "@nyxojs/rest";
import { EventEmitter } from "eventemitter3";
import WebSocket from "ws";
import { z } from "zod/v4";
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
   * @see {@link https://discord.com/developers/docs/topics/gateway#gateway-intents}
   */
  intents: z.union([
    z
      .array(z.enum(GatewayIntentsBits))
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
  heartbeat: HeartbeatOptions.prefault({}),

  /**
   * Sharding configuration options
   *
   * @default {}
   */
  shard: ShardOptions.prefault({}),
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
 * This class implements Discord's Gateway protocol for real-time communication.
 * It handles connection lifecycle, payload encoding/decoding, heartbeats, and event dispatching.
 *
 * Key responsibilities:
 * - Establishing and maintaining the WebSocket connection to Discord
 * - Processing Gateway events and opcodes
 * - Managing session lifecycle (identify, resume, reconnect)
 * - Coordinating heartbeats and sharding
 * - Dispatching events to client applications
 */
export class Gateway extends EventEmitter<GatewayEvents> {
  /**
   * Current WebSocket connection to Discord Gateway
   * Handles the underlying WebSocket communication protocol
   * Set to null when disconnected
   * @private
   */
  #ws: WebSocket | null = null;

  /**
   * Tracks the current state of the Gateway connection
   * Used to manage connection lifecycle and prevent invalid operations
   * @private
   */
  #state: ConnectionState = "disconnected";

  /**
   * Stores critical session data needed for connection management
   * Contains session ID, resume URL, sequence number, and ready timestamp
   * Used for session resumption and connection metrics
   * @private
   */
  #session: SessionInfo = {
    id: null,
    resumeUrl: null,
    sequence: 0,
    readyAt: null,
  };

  /**
   * Tracks the number of reconnection attempts
   * Used for implementing exponential backoff strategy
   * Reset when connection is successfully established
   * @private
   */
  #reconnectCount = 0;

  /**
   * Discord REST API client
   * Used for gateway URL discovery and other API requests
   * @private
   */
  readonly #rest: Rest;

  /**
   * Manages heartbeat lifecycle for maintaining the connection
   * Handles sending heartbeats and tracking acknowledgements
   * @private
   */
  readonly #heartbeat: HeartbeatManager;

  /**
   * Manages sharding for multi-shard bots
   * Handles shard allocation, guild distribution, and shard status tracking
   * @private
   */
  readonly #shard: ShardManager;

  /**
   * Handles payload compression/decompression
   * Reduces bandwidth usage when communicating with Discord
   * @private
   */
  readonly #compression: CompressionService;

  /**
   * Handles payload encoding/decoding (JSON, ETF)
   * Transforms payloads between raw and structured formats
   * @private
   */
  readonly #encoding: EncodingService;

  /**
   * Gateway configuration options
   * Controls gateway behavior, timeouts, retry logic, etc.
   * @private
   */
  readonly #options: GatewayOptions;

  /**
   * Creates a new Gateway client
   *
   * Initializes the Gateway with the provided configuration and dependencies.
   * Sets up the heartbeat manager, shard manager, and encoding/compression services.
   *
   * @param rest - Discord REST API client for gateway URL discovery and API requests
   * @param options - Gateway configuration options controlling behavior
   * @throws {Error} If options validation fails with detailed validation errors
   */
  constructor(rest: Rest, options: z.input<typeof GatewayOptions>) {
    super();

    try {
      // Parse and validate the options using Zod schema
      this.#options = GatewayOptions.parse(options);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod validation errors to more readable format
        throw new Error(z.prettifyError(error));
      }

      // If validation fails, rethrow the error with additional context
      throw error;
    }

    // Initialize dependencies
    this.#rest = rest;
    this.#heartbeat = new HeartbeatManager(this, this.#options.heartbeat);
    this.#shard = new ShardManager(this, this.#options.shard);
    this.#compression = new CompressionService(this.#options.compressionType);
    this.#encoding = new EncodingService(this.#options.encodingType);
  }

  /**
   * Gets the bot token used for authentication
   *
   * This token is used to authenticate the bot with Discord's Gateway.
   *
   * @returns The bot token as a string
   */
  get token(): string {
    return this.#options.token;
  }

  /**
   * Gets the validated Gateway options
   *
   * Returns the complete, validated configuration options for the Gateway.
   * These options have been processed through the Zod schema and have all defaults applied.
   *
   * @returns The complete Gateway configuration options
   */
  get options(): GatewayOptions {
    return this.#options;
  }

  /**
   * Gets the current WebSocket ready state
   *
   * Provides the WebSocket connection state according to the WebSocket specification:
   * - WebSocket.CONNECTING (0): Connection is being established
   * - WebSocket.OPEN (1): Connection is open and operational
   * - WebSocket.CLOSING (2): Connection is in the process of closing
   * - WebSocket.CLOSED (3): Connection is closed or couldn't be opened
   *
   * @returns WebSocket ready state (CONNECTING, OPEN, CLOSING, CLOSED)
   */
  get readyState(): number {
    return this.#ws?.readyState ?? WebSocket.CLOSED;
  }

  /**
   * Gets the timestamp when the connection was last ready
   *
   * Provides the timestamp (in milliseconds since epoch) when the READY event
   * was last received from Discord, indicating a successful connection.
   * Returns 0 if the Gateway has never successfully connected.
   *
   * @returns Timestamp in milliseconds or 0 if never connected
   */
  get readyAt(): number {
    return this.#session.readyAt ?? 0;
  }

  /**
   * Gets the uptime of the connection in milliseconds
   *
   * Calculates how long the Gateway has been connected since the last READY event.
   * Returns 0 if the Gateway is not currently connected.
   *
   * Useful for monitoring connection health and implementing reconnection strategies
   * based on connection age.
   *
   * @returns Uptime in milliseconds or 0 if not connected
   */
  get uptime(): number {
    return this.#session.readyAt ? Date.now() - this.#session.readyAt : 0;
  }

  /**
   * Gets the latency of the connection in milliseconds
   *
   * Returns the round-trip time between sending a heartbeat and receiving an
   * acknowledgement from Discord. This is effectively the "ping" and is a key
   * metric for connection health.
   *
   * High latency may indicate network issues or Discord service problems.
   *
   * @returns Latency in milliseconds
   */
  get latency(): number {
    return this.#heartbeat.latency;
  }

  /**
   * Gets the last received sequence number
   *
   * The sequence number is used to track the order of events from Discord.
   * It's critical for resuming connections and ensuring events are processed
   * in the correct order.
   *
   * This value is updated each time a payload with a sequence number is received
   * from Discord.
   *
   * @returns Current sequence number
   */
  get sequence(): number {
    return this.#session.sequence;
  }

  /**
   * Gets the current session ID
   *
   * The session ID is assigned by Discord when the connection is established
   * and is required for resuming disconnected sessions. It's received in the
   * READY event.
   *
   * Returns null if the Gateway has not yet received a session ID from Discord.
   *
   * @returns Session ID or null if not connected
   */
  get sessionId(): string | null {
    return this.#session.id;
  }

  /**
   * Gets the URL for resuming the current session
   *
   * Discord provides a specific URL for resuming disconnected sessions, which
   * may be different from the initial connection URL. This is received in the
   * READY event.
   *
   * Returns null if no resume URL has been provided by Discord.
   *
   * @returns Resume URL or null if not available
   */
  get resumeUrl(): string | null {
    return this.#session.resumeUrl;
  }

  /**
   * Gets the HeartbeatManager instance
   *
   * Provides access to the heartbeat manager for monitoring heartbeat status
   * and metrics. The heartbeat manager handles the periodic heartbeats required
   * by Discord to maintain the connection.
   *
   * @returns The HeartbeatManager instance
   */
  get heartbeat(): HeartbeatManager {
    return this.#heartbeat;
  }

  /**
   * Gets the ShardManager instance
   *
   * Provides access to the shard manager for multi-shard bot implementations.
   * The shard manager handles shard allocation, guild distribution, and
   * tracking shard status.
   *
   * @returns The ShardManager instance
   */
  get shard(): ShardManager {
    return this.#shard;
  }

  /**
   * Checks if the connection is ready to process commands and events
   *
   * A connection is ready when it has successfully authenticated with Discord
   * and received the READY event. This indicates the Gateway can send and
   * receive Gateway commands and events.
   *
   * Most Gateway operations require the connection to be ready.
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
   * and completes the identify/resume process. This is the primary method
   * to initialize the Gateway connection.
   *
   * The connection process involves:
   * 1. Fetching Gateway URL and bot information from Discord
   * 2. Initializing encoding and compression services
   * 3. Setting up sharding if enabled
   * 4. Establishing the WebSocket connection
   * 5. Authenticating via Identify or Resume
   * 6. Waiting for the READY or RESUMED event
   *
   * @returns A promise that resolves when the connection is ready
   * @throws {Error} If connection fails at any stage with detailed error information
   */
  async connect(): Promise<void> {
    // Already connecting or connected - prevent duplicate connection attempts
    if (this.#state !== "disconnected") {
      return;
    }

    // Update state to connecting
    this.#state = "connecting";

    // Close any existing connection to ensure a clean start
    if (this.#ws) {
      this.#closeWebSocket();
    }

    try {
      // Initialize services and fetch required Gateway information
      // These operations are performed in parallel for efficiency
      const [gatewayInfo, guilds] = await Promise.all([
        this.#rest.gateway.fetchBotGatewayInfo(),
        this.#rest.users.fetchCurrentGuilds(),
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

      // Connect to Gateway with the URL provided by Discord
      await this.#connectToGateway(gatewayInfo.url);

      // Wait for the READY or RESUMED event to consider connection complete
      await this.#waitForReady();

      // Connection successful - reset reconnect counter
      this.#reconnectCount = 0;
    } catch (error) {
      // Connection failed - update state and rethrow error
      this.#state = "disconnected";
      throw error;
    }
  }

  /**
   * Updates the bot's presence information
   *
   * Changes the bot's status, activity, or other presence information displayed in Discord.
   * This information is visible to users in the Discord client.
   *
   * @param presence - New presence data containing status and activities
   * @throws {Error} If the connection is not ready
   */
  updatePresence(presence: UpdatePresenceEntity): void {
    // Verify the connection is ready before attempting to update presence
    if (this.#state !== "ready") {
      throw new Error("Cannot update presence, connection not ready");
    }

    // Send presence update payload to Discord
    this.send(GatewayOpcodes.PresenceUpdate, presence);
  }

  /**
   * Updates the bot's voice state
   *
   * Controls the bot's voice connection state, allowing it to join or leave
   * voice channels. Required for voice functionality such as music bots.
   *
   * @param options - Voice state update options including guild and channel IDs
   * @throws {Error} If the connection is not ready
   */
  updateVoiceState(options: UpdateVoiceStateEntity): void {
    // Verify the connection is ready before attempting to update voice state
    if (this.#state !== "ready") {
      throw new Error("Cannot update voice state, connection not ready");
    }

    // Send voice state update payload to Discord
    this.send(GatewayOpcodes.VoiceStateUpdate, options);
  }

  /**
   * Requests guild member information
   *
   * Fetches member information for a specific guild. This is necessary for bots
   * with large guild membership (over the large_threshold) to access complete
   * member lists. Also allows requesting specific members by user ID or searching
   * by username prefix.
   *
   * @param options - Request options specifying guild ID and query parameters
   * @throws {Error} If the connection is not ready
   */
  requestGuildMembers(options: RequestGuildMembersEntity): void {
    // Verify the connection is ready before requesting guild members
    if (this.#state !== "ready") {
      throw new Error("Cannot request guild members, connection not ready");
    }

    // Send request guild members payload to Discord
    this.send(GatewayOpcodes.RequestGuildMembers, options);
  }

  /**
   * Requests soundboard sounds
   *
   * Fetches available soundboard sounds for a specific guild. This allows
   * bots to interact with Discord's soundboard feature.
   *
   * @param options - Request options specifying the guild ID
   * @throws {Error} If the connection is not ready
   */
  requestSoundboardSounds(options: RequestSoundboardSoundsEntity): void {
    // Verify the connection is ready before requesting soundboard sounds
    if (this.#state !== "ready") {
      throw new Error("Cannot request soundboard sounds, connection not ready");
    }

    // Send request soundboard sounds payload to Discord
    this.send(GatewayOpcodes.RequestSoundboardSounds, options);
  }

  /**
   * Sends a payload to the Gateway
   *
   * Low-level method to send an opcode and data payload to Discord's Gateway.
   * Used internally by other methods but also available for advanced use cases.
   *
   * @param opcode - Gateway opcode defining the operation
   * @param data - Payload data specific to the opcode
   * @throws {Error} If the connection is not open
   */
  send<T extends keyof GatewaySendEvents>(
    opcode: T,
    data: GatewaySendEvents[T],
  ): void {
    // Verify WebSocket is open before sending data
    if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) {
      throw new Error("Cannot send data, WebSocket is not open");
    }

    // Construct the payload with the provided opcode and data
    const payload: PayloadEntity = {
      op: opcode,
      d: data,
      s: null,
      t: null,
    };

    // Encode the payload using the configured encoding format
    const encoded = this.#encoding.encode(payload);

    // Send the encoded payload through the WebSocket
    this.#ws.send(encoded);
  }

  /**
   * Gracefully disconnects from the Gateway
   *
   * Performs a clean disconnect from Discord's Gateway without triggering
   * automatic reconnection. This is useful for maintenance, shutdown, or
   * when you need to temporarily disconnect the bot.
   *
   * @param code - WebSocket close code (defaults to 1000 - Normal Closure)
   * @param reason - Reason for disconnection (for logging and debugging)
   */
  disconnect(code = 1000, reason = "Normal closure"): void {
    // If already disconnected, do nothing
    if (this.#state === "disconnected") {
      return;
    }

    // Send a clean close to Discord with the provided code and reason
    this.#closeWebSocket(code, reason);

    // Update state to disconnected
    this.#state = "disconnected";

    // If the code indicates a clean close, clear session info to prevent resuming
    if (code === 1000 || code === 1001) {
      this.#clearSession();
    }
  }

  /**
   * Destroys the Gateway connection and all associated resources
   *
   * Performs a complete cleanup of the Gateway instance, including:
   * - Closing the WebSocket connection
   * - Clearing session information
   * - Destroying all services (encoding, compression, heartbeat, sharding)
   * - Removing all event listeners
   *
   * This should be called when the bot is shutting down or when the Gateway
   * instance is no longer needed.
   *
   * @param code - WebSocket close code (defaults to 1000 - Normal Closure)
   * @throws {Error} If destruction fails with detailed error information
   */
  destroy(code = 1000): void {
    if (this.#state === "disconnected") {
      return;
    }

    try {
      // Close the WebSocket connection with the provided code
      this.#closeWebSocket(code);
      this.#state = "disconnected";

      // Clear session information to prevent resuming
      this.#clearSession();

      // Destroy all services to release resources
      this.#encoding.destroy();
      this.#compression.destroy();
      this.#heartbeat.destroy();

      // Destroy shard manager if enabled
      if (this.#shard.isEnabled) {
        this.#shard.destroy();
      }

      // Clear all event listeners to prevent memory leaks
      this.removeAllListeners();
    } catch (error) {
      // Wrap and rethrow any errors with additional context
      throw new Error("Failed to destroy gateway connection", {
        cause: error,
      });
    }
  }

  /**
   * Establishes a WebSocket connection to the Discord Gateway
   *
   * Creates a new WebSocket connection to Discord's Gateway URL, sets up
   * event handlers, and waits for the connection to open.
   *
   * @param url - Base Gateway URL from Discord
   * @private
   */
  async #connectToGateway(url: string): Promise<void> {
    try {
      // Build the complete Gateway URL with query parameters for version, encoding, etc.
      const wsUrl = this.#buildGatewayUrl(url);

      // Create new WebSocket connection
      const ws = new WebSocket(wsUrl);
      this.#ws = ws;

      // Set up event handlers for WebSocket events
      ws.on("message", this.#handleMessage.bind(this));
      ws.on("close", this.#handleClose.bind(this));
      ws.on("error", (error) => this.emit("wsError", error));

      // Wait for connection to open with timeout handling
      await new Promise<void>((resolve, reject) => {
        // Set a timeout to prevent hanging if connection doesn't establish
        const connectionTimeout = setTimeout(() => {
          reject(new Error("WebSocket connection timed out"));
        }, 15000); // 15 second timeout

        // Handle successful connection
        ws.once("open", () => {
          clearTimeout(connectionTimeout);
          resolve();
        });

        // Handle connection error
        ws.once("error", (err) => {
          clearTimeout(connectionTimeout);
          reject(err);
        });
      });
    } catch (error) {
      // Clean up if connection failed
      this.#closeWebSocket();
      throw new Error("Failed to connect to Gateway", { cause: error });
    }
  }

  /**
   * Waits for the READY or RESUMED event after connection
   *
   * After establishing the WebSocket connection and sending Identify/Resume,
   * this method waits for Discord to confirm the authentication with either
   * a READY or RESUMED event.
   *
   * @private
   */
  async #waitForReady(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // Set a timeout to prevent hanging if events aren't received
      const connectionTimeout = setTimeout(() => {
        cleanup();
        reject(
          new Error("Connection timed out waiting for READY/RESUMED event"),
        );
      }, 30000); // 30 second timeout

      // Function to clean up event listeners and timeouts
      const cleanup = (): void => {
        clearTimeout(connectionTimeout);
        this.removeListener("dispatch", readyHandler);
        this.removeListener("wsError", errorHandler);
      };

      // Event handler for dispatch events
      const readyHandler = (event: keyof GatewayReceiveEvents): void => {
        // Resolve when either READY or RESUMED is received
        if (event === "READY" || event === "RESUMED") {
          cleanup();
          resolve();
        }
      };

      // Event handler for error events
      const errorHandler = (error: Error): void => {
        cleanup();
        reject(error);
      };

      // Register event handlers
      this.once("dispatch", readyHandler);
      this.once("wsError", errorHandler);
    });
  }

  /**
   * Processes an incoming WebSocket message
   *
   * Handles decompression, decoding, and initial processing of
   * messages received from Discord's Gateway.
   *
   * @param data - Raw message data from WebSocket
   * @private
   */
  async #handleMessage(data: Buffer): Promise<void> {
    // Decompress the data if compression is enabled
    let processedData = data;
    if (this.#compression.isInitialized) {
      processedData = this.#compression.decompress(data);
    }

    // Decode the payload using the configured encoding format
    const payload = this.#encoding.decode(processedData);

    // Update sequence number if provided for resumability
    if (payload.s !== null) {
      this.#session.sequence = payload.s;
    }

    // Process the payload according to its opcode
    await this.#processPayload(payload);
  }

  /**
   * Processes a decoded Gateway payload
   *
   * Routes the payload to the appropriate handler based on its opcode.
   * This is the central dispatcher for all Gateway events and operations.
   *
   * @param payload - Decoded Gateway payload
   * @private
   */
  async #processPayload(payload: PayloadEntity): Promise<void> {
    // Process the payload based on its opcode
    switch (payload.op) {
      case GatewayOpcodes.Dispatch:
        // Regular event dispatch
        this.#handleDispatchEvent(payload);
        break;

      case GatewayOpcodes.Hello:
        // Initial hello message with heartbeat interval
        await this.#handleHello(payload.d as HelloEntity);
        break;

      case GatewayOpcodes.Heartbeat:
        // Discord requested an immediate heartbeat
        this.#heartbeat.sendHeartbeat();
        break;

      case GatewayOpcodes.HeartbeatAck:
        // Discord acknowledged our heartbeat
        this.#heartbeat.ackHeartbeat();
        break;

      case GatewayOpcodes.InvalidSession:
        // Session is invalid, need to reconnect
        await this.#handleInvalidSession(Boolean(payload.d));
        break;

      case GatewayOpcodes.Reconnect:
        // Discord requested a reconnection
        await this.#handleReconnect();
        break;

      default:
        // Unknown or unhandled opcode
        break;
    }
  }

  /**
   * Handles the Hello opcode
   *
   * The Hello opcode is the first message received after connecting.
   * It contains the heartbeat interval and triggers the authentication flow.
   *
   * @param hello - Hello payload data including heartbeat_interval
   * @private
   */
  async #handleHello(hello: HelloEntity): Promise<void> {
    // Start heartbeats with the interval provided by Discord
    this.#heartbeat.start(hello.heartbeat_interval);

    // Either resume the existing session or identify as a new session
    if (this.#canResume()) {
      // Try to resume existing session
      this.#state = "resuming";
      this.#sendResume();
    } else {
      // Identify as a new session
      this.#state = "identifying";
      await this.#sendIdentify();
    }
  }

  /**
   * Sends an identify payload to the Gateway
   *
   * The identify payload authenticates the bot with Discord and
   * establishes the session parameters like intents and compression.
   *
   * @private
   */
  async #sendIdentify(): Promise<void> {
    // Construct the identify payload with authentication and connection parameters
    const payload: IdentifyEntity = {
      token: this.#options.token,
      properties: {
        os: process.platform,
        browser: "nyxo.js",
        device: "nyxo.js",
      },
      compress: this.#compression.isInitialized,
      large_threshold: this.#options.largeThreshold,
      intents: this.#options.intents,
    };

    // Add shard info if sharding is enabled and configured
    if (this.#shard.isEnabled && this.#shard.totalShards > 0) {
      // Get the next available shard to connect
      payload.shard = await this.#shard.getAvailableShard();
    }

    // Add presence information if provided in options
    if (this.#options.presence) {
      payload.presence = this.#options.presence;
    }

    // Send the identify payload to Discord
    this.send(GatewayOpcodes.Identify, payload);
  }

  /**
   * Sends a resume payload to the Gateway
   *
   * The resume payload attempts to continue an existing session after
   * a disconnection, allowing the bot to receive missed events.
   *
   * @private
   */
  #sendResume(): void {
    // Check that we have a session ID to resume
    if (!this.#session.id) {
      throw new Error("Cannot resume: no session ID available");
    }

    // Construct the resume payload with session information
    const payload: ResumeEntity = {
      token: this.#options.token,
      session_id: this.#session.id,
      seq: this.#session.sequence,
    };

    // Send the resume payload to Discord
    this.send(GatewayOpcodes.Resume, payload);
  }

  /**
   * Handles the InvalidSession opcode
   *
   * The InvalidSession opcode indicates the session could not be continued.
   * The payload includes a boolean indicating if the session is resumable.
   *
   * @param resumable - Whether the session is resumable
   * @private
   */
  async #handleInvalidSession(resumable: boolean): Promise<void> {
    // Emit event with session invalidation details
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

    // Wait a random amount of time before reconnecting (1-5 seconds)
    // This jitter helps prevent thundering herd issues with many bots reconnecting at once
    await sleep(1000 + Math.random() * 4000);

    // Either try to resume or identify
    if (resumable && this.#canResume()) {
      // Try to resume the session
      this.#state = "resuming";
      this.#sendResume();
    } else {
      // Need to establish a new session
      this.#closeWebSocket();
      await this.connect();
    }
  }

  /**
   * Handles the Reconnect opcode
   *
   * The Reconnect opcode indicates Discord wants the bot to reconnect,
   * typically due to maintenance or server migration.
   *
   * @private
   */
  async #handleReconnect(): Promise<void> {
    // Check if we can resume the session after reconnecting
    const canResume = this.#canResume();

    // Close current connection with code 4000 (normal disconnection)
    this.#closeWebSocket(4000);

    // Wait briefly before reconnecting to ensure clean disconnection
    await sleep(500);

    if (canResume) {
      // Try to resume the existing session
      await this.#attemptResume();
    } else {
      // Need to establish a new session
      await this.connect();
    }
  }

  /**
   * Handles WebSocket close events
   *
   * Processes WebSocket closure, determines if reconnection is appropriate,
   * and manages the reconnection strategy based on the close code.
   *
   * @param code - WebSocket close code
   * @param reason - Close reason provided by the server
   * @private
   */
  async #handleClose(code: number, reason: string): Promise<void> {
    this.emit("wsClose", code, reason);

    // Stop heartbeats immediately to prevent zombied connection
    this.#heartbeat.destroy();

    // For clean closures or non-resumable codes, clear session
    if (
      code === 1000 || // Normal closure
      code === 1001 || // Going away
      this.#options.nonResumableCodes.includes(code) // Discord-specific non-resumable codes
    ) {
      this.#clearSession();
    }

    // Handle shard disconnection events if sharding is enabled
    if (this.#shard.isEnabled) {
      for (const shard of this.#shard.shards) {
        if (shard.status !== "disconnected") {
          // Update shard status
          this.#shard.setShardStatus(shard.shardId, "disconnected");

          // Emit event for shard disconnection
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

    // If not a normal closure and auto-reconnect is enabled, attempt reconnection
    if (
      code !== 1000 && // Not normal closure
      code !== 1001 && // Not going away
      this.#options.heartbeat.autoReconnect // Auto-reconnect is enabled
    ) {
      // Increment reconnection attempts counter
      this.#reconnectCount++;

      // Calculate reconnection delay using exponential backoff
      const delay = this.#getReconnectionDelay();

      // Wait before reconnecting to prevent rapid reconnection cycles
      await sleep(delay);

      // Determine reconnection strategy
      if (this.#shouldResume(code) && this.#canResume()) {
        // Try to resume existing session
        await this.#attemptResume();
      } else {
        // Establish a new session
        await this.connect();
      }
    } else {
      // No reconnection - set state to disconnected
      this.#state = "disconnected";
    }
  }

  /**
   * Handles Gateway dispatch events
   *
   * Processes events received from Discord (op=0) and routes them
   * to the appropriate handlers and event emitters.
   *
   * @param payload - Dispatch payload
   * @private
   */
  #handleDispatchEvent(payload: PayloadEntity): void {
    // Ensure the payload has an event type
    if (!payload.t) {
      return;
    }

    // Handle specific events that require internal processing
    switch (payload.t) {
      case "READY":
        // Process READY event to update session information
        this.#handleReadyEvent(payload.d as ReadyEntity);
        break;

      case "RESUMED":
        // Process RESUMED event to update session state
        this.#handleResumedEvent();
        break;

      case "GUILD_CREATE":
        // Process GUILD_CREATE for shard management
        this.#handleGuildCreate(payload.d as GuildCreateEntity);
        break;

      case "GUILD_DELETE":
        // Process GUILD_DELETE for shard management
        this.#handleGuildDelete(payload.d as UnavailableGuildEntity);
        break;

      default:
        // No internal processing needed for other event types
        break;
    }

    // Forward the dispatch event to client code
    this.emit(
      "dispatch",
      payload.t,
      payload.d as GatewayReceiveEvents[typeof payload.t],
    );
  }

  /**
   * Handles the READY dispatch event
   *
   * The READY event contains initial state data and confirms
   * a successful connection to Discord.
   *
   * @param data - Ready payload data
   * @private
   */
  #handleReadyEvent(data: ReadyEntity): void {
    // Update session information from the READY payload
    this.#session.id = data.session_id;
    this.#session.resumeUrl = data.resume_gateway_url;
    this.#session.readyAt = Date.now();
    this.#state = "ready";

    // Handle sharding information if enabled
    if (this.#shard.isEnabled) {
      // Get current shard ID from the READY payload or default to 0
      const shardId = data.shard?.[0] ?? 0;

      // Update shard status to ready
      this.#shard.setShardStatus(shardId, "ready");

      // Add guild IDs to shard for tracking and guild-to-shard mapping
      const guildIds = data.guilds.map((guild) => guild.id);
      this.#shard.addGuildsToShard(shardId, guildIds);
    }

    // Emit session start event with detailed connection information
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
   * The RESUMED event confirms a successful session resumption
   * after a disconnection.
   *
   * @private
   */
  #handleResumedEvent(): void {
    // Update state to ready as the session is now active
    this.#state = "ready";

    // If readyAt is not set (unusual case), set it now
    if (!this.#session.readyAt) {
      this.#session.readyAt = Date.now();
    }

    // Emit session resume event with session information
    this.emit("sessionResume", {
      timestamp: new Date().toISOString(),
      sessionId: this.#session.id ?? "",
      sequence: this.#session.sequence,
      latency: this.#heartbeat.latency,
    });
  }

  /**
   * Handles GUILD_CREATE events for shard management
   *
   * Updates shard guild mappings when new guilds are joined or
   * become available after an outage.
   *
   * @param data - Guild create data
   * @private
   */
  #handleGuildCreate(data: GuildCreateEntity): void {
    // Update shard guild mappings if sharding is enabled and guild is available
    if (this.#shard.isEnabled && "id" in data && !("unavailable" in data)) {
      this.#shard.addGuildToShard(data.id);
    }
  }

  /**
   * Handles GUILD_DELETE events for shard management
   *
   * Updates shard guild mappings when guilds are removed or
   * become unavailable due to an outage.
   *
   * @param data - Guild delete data
   * @private
   */
  #handleGuildDelete(data: UnavailableGuildEntity): void {
    // Update shard guild mappings if sharding is enabled
    if (this.#shard.isEnabled && "id" in data) {
      this.#shard.removeGuildFromShard(data.id);
    }
  }

  /**
   * Attempts to resume a session with the stored resume URL
   *
   * Uses the resume URL provided by Discord to attempt to resume
   * an existing session after a disconnection.
   *
   * @private
   */
  async #attemptResume(): Promise<void> {
    // Verify we have the required data to resume
    if (!this.#canResume()) {
      throw new Error("Cannot resume: missing session ID or sequence number");
    }

    // Get the resume URL
    const resumeUrl = this.#session.resumeUrl;
    if (!resumeUrl) {
      throw new Error("Cannot resume: missing resume URL");
    }

    try {
      // Update state and establish a new connection to the resume URL
      this.#state = "resuming";
      await this.#connectToGateway(resumeUrl);
      // The Hello handler will send the resume payload when the connection is established
    } catch (_error) {
      // If resume fails, fall back to a clean reconnect
      this.#clearSession();
      await this.connect();
    }
  }

  /**
   * Closes the WebSocket connection
   *
   * Safely closes the WebSocket connection and cleans up resources.
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

    // Remove all listeners to prevent callbacks after close
    ws.removeAllListeners();

    try {
      // Attempt to close the connection gracefully
      ws.close(code, reason);
    } catch (_error) {
      // Ignore errors during close - they're often caused by the connection
      // already being closed or in a closing state
    }

    // Clear the WebSocket reference
    this.#ws = null;
  }

  /**
   * Builds the Gateway URL with query parameters
   *
   * Constructs the complete Gateway URL with parameters for API version,
   * encoding, and compression.
   *
   * @param baseUrl - Base Gateway URL
   * @returns Complete Gateway URL with parameters
   * @private
   */
  #buildGatewayUrl(baseUrl: string): string {
    // Add required query parameters
    const params = new URLSearchParams({
      v: String(this.#options.version), // API version
      encoding: this.#encoding.type, // Payload encoding (json, etf)
    });

    // Add compression parameter if configured
    if (this.#compression.type) {
      params.append("compress", this.#compression.type);
    }

    // Combine base URL with query parameters
    return `${baseUrl}?${params}`;
  }

  /**
   * Checks if the current session can be resumed
   *
   * Determines if the Gateway has the necessary information to
   * attempt a session resumption.
   *
   * @returns True if the session can be resumed
   * @private
   */
  #canResume(): boolean {
    // Need both a session ID and a sequence number > 0 to resume
    return Boolean(this.#session.id && this.#session.sequence > 0);
  }

  /**
   * Determines if a session should be resumed based on close code
   *
   * Evaluates whether a session should be resumed based on the
   * WebSocket close code.
   *
   * @param code - WebSocket close code
   * @returns True if session should be resumed
   * @private
   */
  #shouldResume(code: number): boolean {
    // Check if it's a clean closure (1000, 1001) or a non-resumable code
    const isClean = code === 1000 || code === 1001;
    return !(isClean || this.#options.nonResumableCodes.includes(code));
  }

  /**
   * Clears the current session information
   *
   * Resets all session data, preventing resumption and preparing
   * for a fresh connection.
   *
   * @private
   */
  #clearSession(): void {
    // Reset all session information
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
   * Calculates the appropriate delay for reconnection attempts
   * using the configured backoff schedule.
   *
   * @returns Delay in milliseconds
   * @private
   */
  #getReconnectionDelay(): number {
    const schedule = this.#options.backoffSchedule;

    // Find the appropriate delay based on reconnection attempt
    const index = Math.min(this.#reconnectCount - 1, schedule.length - 1);

    // Use the last value in the schedule if we've exceeded the schedule length
    return Math.min(
      (schedule[index] ?? schedule.at(-1) ?? 1000) *
        (0.8 + Math.random() * 0.4),
      30000,
    );
  }
}
