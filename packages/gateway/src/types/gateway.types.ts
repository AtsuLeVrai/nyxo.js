import type { ShardStatus } from "../managers/index.js";
import type { CompressionType, EncodingType } from "../services/index.js";
import type { GatewayReceiveEvents } from "./index.js";

/**
 * Base interface for all Gateway events
 *
 * Provides common properties that all Discord Gateway events will contain.
 * Every event extends this interface to ensure consistent structure.
 */
export interface BaseGatewayEvent {
  /**
   * ISO8601 timestamp when the event was triggered
   * Format: YYYY-MM-DDTHH:mm:ss.sssZ
   */
  timestamp: string;
}

/**
 * Heartbeat Events for Gateway connection maintenance
 *
 * Represents heartbeat messages sent to and received from Discord
 * to keep the WebSocket connection alive.
 *
 * @see {@link https://discord.com/developers/docs/topics/gateway#heartbeating}
 */
export interface HeartbeatEvent extends BaseGatewayEvent {
  /**
   * Current sequence number of the Gateway connection
   * Used to resume connections and track message order
   */
  sequence: number;

  /**
   * Total count of heartbeats sent since establishing the connection
   * Useful for monitoring connection longevity and health
   */
  totalSent?: number;

  /**
   * Round-trip latency between sending heartbeat and receiving acknowledgement in milliseconds
   * Only present in heartbeat acknowledgement events
   */
  latency?: number;
}

/**
 * Event triggered when Discord fails to respond to heartbeats
 *
 * Emitted when the client doesn't receive a heartbeat acknowledgement (ACK)
 * within the expected timeframe, indicating potential connection issues.
 *
 * @see {@link https://discord.com/developers/docs/topics/gateway#resuming}
 */
export interface HeartbeatTimeoutEvent extends BaseGatewayEvent {
  /**
   * Number of consecutive heartbeats that received no acknowledgement
   * Used to determine severity of connection issues
   */
  missedCount: number;

  /**
   * Maximum number of missed heartbeats allowed before triggering different actions
   * Defined in the client configuration
   */
  maxRetries: number;

  /**
   * Indicates if the client will automatically attempt to reconnect
   * Based on configured retry policy and current missed count
   */
  willReconnect: boolean;
}

/**
 * Session establishment and management events
 *
 * Contains information about the Discord Gateway session,
 * including identifiers needed for resuming interrupted connections.
 *
 * @see {@link https://discord.com/developers/docs/topics/gateway#sessions}
 */
export interface SessionEvent extends BaseGatewayEvent {
  /**
   * Unique session identifier assigned by Discord
   * Required for resuming connections
   */
  sessionId: string;

  /**
   * Encoding type used for the session
   * Indicates the format of payloads sent and received
   */
  encoding: EncodingType;

  /**
   * Compression type used for the session
   * Indicates whether the payloads are compressed
   */
  compression?: CompressionType | null;

  /**
   * Special URL provided by Discord for resuming this specific session
   * May differ from the standard gateway URL
   */
  resumeUrl?: string;

  /**
   * Discord user ID associated with this session
   */
  userId?: string;

  /**
   * Total number of guilds (servers) available in this session
   * Useful for sharding calculations and monitoring
   */
  guildCount?: number;

  /**
   * Total number of shards available for this session
   * Useful for sharding calculations and monitoring
   */
  shardCount?: number;
}

/**
 * Event emitted when a session is successfully resumed
 *
 * Triggered when a disconnected session is successfully reconnected
 * using the resume protocol, avoiding a full re-identification.
 *
 * @see {@link https://discord.com/developers/docs/topics/gateway#resuming}
 */
export interface SessionResumeEvent extends BaseGatewayEvent {
  /**
   * Session ID used for the resume operation
   */
  sessionId: string;

  /**
   * Last sequence number that was successfully received before disconnect
   * Used to determine which events need to be replayed
   */
  sequence: number;

  /**
   * Time taken to process the resume operation in milliseconds
   * Measured from resume request to completion of event replay
   */
  latency: number;
}

/**
 * Event emitted when a session becomes invalid
 *
 * Triggered when a session can no longer be used, either due to
 * server-side invalidation, timeouts, or authentication failures.
 *
 * @see {@link https://discord.com/developers/docs/topics/gateway#resuming}
 */
export interface SessionInvalidateEvent extends BaseGatewayEvent {
  /**
   * ID of the session that has been invalidated
   */
  sessionId: string;

  /**
   * Indicates whether a new session can be created with a resume operation
   * If false, a complete re-identification is required
   */
  resumable: boolean;

  /**
   * Specific reason why the session was invalidated
   *
   * - server_request: Discord explicitly requested invalidation
   * - heartbeat_timeout: Failed to receive heartbeat acknowledgements
   * - authentication_failed: Token or credentials are invalid
   * - rate_limited: Too many connection attempts in a short period
   */
  reason:
    | "server_request"
    | "heartbeat_timeout"
    | "authentication_failed"
    | "rate_limited"
    | string;
}

/**
 * Event emitted when the WebSocket connection closes
 *
 * Triggered when the WebSocket connection to Discord is closed,
 * either due to normal closure, errors, or network issues.
 *
 * @see {@link https://discord.com/developers/docs/topics/gateway#sharding}
 */
export interface ShardStatusChangeEvent extends BaseGatewayEvent {
  /**
   * Zero-based index of the shard whose status changed
   * This is the same as the shardId in the sessionStart event
   */
  shardId: number;

  /**
   * Total number of shards in the current configuration
   * Used for distributing guilds across multiple connections
   */
  totalShards: number;

  /**
   * Previous status of the shard before the change
   * Represents the state before the current status update
   */
  oldStatus: ShardStatus;

  /**
   * New status of the shard after the change
   * Represents the state after the current status update
   */
  newStatus: ShardStatus;

  /**
   * WebSocket close code received from Discord
   * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-close-event-codes}
   */
  guildCount: number;

  /**
   * Human-readable description of the status change reason
   * Provides context for why the status changed
   */
  reconnectAttempts: number;
}

/**
 * Type definitions for all Gateway events
 *
 * Provides strong typing for event listeners to ensure correct parameter typing
 * when subscribing to Gateway events.
 */
export interface GatewayEvents {
  /**
   * Emitted when a heartbeat is sent to Discord
   * @param event Details about the sent heartbeat
   */
  heartbeatSent: [event: HeartbeatEvent];

  /**
   * Emitted when a heartbeat acknowledgement is received from Discord
   * @param event Details about the acknowledged heartbeat including latency
   */
  heartbeatAcknowledge: [event: HeartbeatEvent];

  /**
   * Emitted when Discord fails to acknowledge heartbeats
   * @param event Details about the timeout including missed count
   */
  heartbeatTimeout: [event: HeartbeatTimeoutEvent];

  /**
   * Emitted when a new session is established
   * @param event Session details including session ID
   */
  sessionStart: [event: SessionEvent];

  /**
   * Emitted when an existing session is successfully resumed
   * @param event Resume details including replayed events count
   */
  sessionResume: [event: SessionResumeEvent];

  /**
   * Emitted when a session becomes invalid
   * @param event Invalidation details including reason
   */
  sessionInvalidate: [event: SessionInvalidateEvent];

  /**
   * Emitted when the sequence number is updated
   * @param sequence The new sequence number
   */
  sequenceUpdate: [sequence: number];

  /**
   * Emitted when a shard's status changes
   * @param event Details about the status change including old and new status
   */
  shardStatusChange: [event: ShardStatusChangeEvent];

  /**
   * Emitted when the WebSocket closes the connection
   * @param code The close code received from Discord
   * @param reason Human-readable reason for the closure
   */
  wsClose: [code: number, reason: string];

  /**
   * Emitted when an error occurs in the Gateway connection
   * @param error The error that occurred
   */
  wsError: [error: Error];

  /**
   * Emitted when the WebSocket connection is opened
   */
  wsOpen: [];

  /**
   * Emitted when a message is received from the WebSocket
   * @param data The raw message data received from Discord
   */
  wsMessage: [data: Buffer];

  /**
   * Emitted when the connection state changes
   * @param oldState The previous connection state
   */
  stateChange: [
    oldState: GatewayConnectionState,
    newState: GatewayConnectionState,
  ];

  /**
   * Emitted for all Discord Gateway dispatch events
   * @param event The specific event name from Discord
   * @param data Event-specific data payload
   */
  dispatch: [
    event: keyof GatewayReceiveEvents,
    data: GatewayReceiveEvents[keyof GatewayReceiveEvents],
  ];
}

/**
 * Structure for Gateway payload messages
 *
 * Defines the format of all messages sent and received through
 * the Discord Gateway WebSocket connection.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#payload-structure}
 */
export interface PayloadEntity {
  /**
   * Opcode defining the payload type and how it should be processed
   * @see {@link GatewayOpcodes}
   */
  op: GatewayOpcodes;

  /**
   * Event data specific to the opcode
   * Structure varies based on the opcode and event type
   */
  d: object | number | null;

  /**
   * Sequence number for this event, used for resuming connections
   * Only present in op:0 (Dispatch) payloads
   */
  s: number | null;

  /**
   * Event name for Dispatch payloads
   * Only present in op:0 (Dispatch) payloads
   */
  t: keyof GatewayReceiveEvents | null;
}

/**
 * Enhanced connection states for the Discord Gateway
 *
 * Provides more granular states to better track the connection lifecycle
 * and enable more precise error handling and state management.
 */
export enum GatewayConnectionState {
  /** Initial state - no connection attempt has been made */
  Idle = "idle",

  /** Attempting to establish WebSocket connection */
  Connecting = "connecting",

  /** WebSocket connected, waiting for Hello message */
  Connected = "connected",

  /** Received Hello, sending Identify payload */
  Identifying = "identifying",

  /** Received Hello, sending Resume payload */
  Resuming = "resuming",

  /** Authentication successful, waiting for Ready/Resumed event */
  Authenticating = "authenticating",

  /** Fully connected and operational */
  Ready = "ready",

  /** Connection lost, attempting to reconnect */
  Reconnecting = "reconnecting",

  /** Gracefully disconnecting */
  Disconnecting = "disconnecting",

  /** Connection closed */
  Disconnected = "disconnected",

  /** Connection failed and won't retry */
  Failed = "failed",
}

/**
 * Bitfield flags for Gateway Intents
 *
 * Used when identifying with the Gateway to specify which events
 * the client wants to receive. Each bit represents a category of events.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway#list-of-intents}
 */
export enum GatewayIntentsBits {
  /**
   * Events about guilds, includes creates, updates, deletes, role changes, etc.
   * Requires the GUILD_CREATE intent to be enabled.
   */
  Guilds = 1 << 0,

  /**
   * Events about guild member changes (requires special verification for bots)
   * Includes member joins, leaves, updates, and bans.
   */
  GuildMembers = 1 << 1,

  /**
   * Events about moderation actions in guilds
   * Includes bans, kicks, and other moderation-related events.
   */
  GuildModeration = 1 << 2,

  /**
   * Events about guild expressions (emojis, stickers)
   * Includes creation, deletion, and updates of emojis and stickers.
   */
  GuildExpressions = 1 << 3,

  /**
   * Events about guild integration updates
   * Includes changes to integrations, such as Twitch or YouTube integrations.
   */
  GuildIntegrations = 1 << 4,

  /**
   * Events about webhook updates in guilds
   * Includes creation, deletion, and updates of webhooks.
   */
  GuildWebhooks = 1 << 5,

  /**
   * Events about invite creation and deletion
   * Includes invites to channels and guilds.
   */
  GuildInvites = 1 << 6,

  /**
   * Events about voice state updates
   * Includes voice channel joins, leaves, and state changes.
   */
  GuildVoiceStates = 1 << 7,

  /**
   * Events about user presence updates (requires special verification for bots)
   * Includes online/offline status changes, game activity updates, etc.
   */
  GuildPresences = 1 << 8,

  /**
   * Events about messages in guilds
   * Includes messages sent, edited, deleted, and pinned in guild channels.
   */
  GuildMessages = 1 << 9,

  /**
   * Events about reactions to messages in guilds
   * Includes reactions added or removed from messages.
   */
  GuildMessageReactions = 1 << 10,

  /**
   * Events about typing indicators in guilds
   * Includes typing events in guild channels.
   */
  GuildMessageTyping = 1 << 11,

  /**
   * Events about direct messages
   * Includes messages sent and received in DMs.
   */
  DirectMessages = 1 << 12,

  /**
   * Events about reactions to direct messages
   * Includes reactions to messages in DMs.
   */
  DirectMessageReactions = 1 << 13,

  /**
   * Events about typing indicators in DMs
   * Includes typing events in direct messages.
   */
  DirectMessageTyping = 1 << 14,

  /**
   * Enables access to message content (requires special verification for bots)
   * Includes the ability to read message content in guilds and DMs.
   */
  MessageContent = 1 << 15,

  /**
   * Events about scheduled events in guilds
   * Includes creation, updates, and deletions of scheduled events.
   */
  GuildScheduledEvents = 1 << 16,

  /**
   * Events about auto-moderation configuration
   * Includes creation, updates, and deletions of auto-moderation rules.
   */
  AutoModerationConfiguration = 1 << 20,

  /**
   * Events about auto-moderation actions
   * Includes actions taken by auto-moderation rules, such as message deletion.
   */
  AutoModerationExecution = 1 << 21,

  /**
   * Events about message polls in guilds
   * Includes creation, updates, and deletions of polls.
   */
  GuildMessagePolls = 1 << 24,

  /**
   * Events about message polls in direct messages
   * Includes creation, updates, and deletions of polls.
   */
  DirectMessagePolls = 1 << 25,
}

/**
 * Gateway operation codes for WebSocket communications
 *
 * Defines the different types of operations that can be performed
 * through the Discord Gateway WebSocket connection.
 *
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-opcodes}
 */
export enum GatewayOpcodes {
  /** Server → Client: An event was dispatched */
  Dispatch = 0,

  /** Client → Server: Request for a heartbeat */
  Heartbeat = 1,

  /** Client → Server: Initiates a new session with authentication */
  Identify = 2,

  /** Client → Server: Update the client's presence information */
  PresenceUpdate = 3,

  /** Client → Server: Used to join/leave or move between voice channels */
  VoiceStateUpdate = 4,

  /** Client → Server: Resume a previous session that was disconnected */
  Resume = 6,

  /** Server → Client: Indicates the client should reconnect and resume */
  Reconnect = 7,

  /** Client → Server: Request information about offline guild members */
  RequestGuildMembers = 8,

  /** Server → Client: The session has been invalidated, need to reconnect */
  InvalidSession = 9,

  /** Server → Client: Sent immediately after connecting, contains heartbeat info */
  Hello = 10,

  /** Server → Client: Confirmation of a received heartbeat */
  HeartbeatAck = 11,

  /** Client → Server: Request for available soundboard sounds */
  RequestSoundboardSounds = 31,
}
