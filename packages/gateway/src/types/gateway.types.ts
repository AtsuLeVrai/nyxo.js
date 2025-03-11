import type { ApiVersion } from "@nyxjs/core";
import type { CompressionType, EncodingType } from "../options/index.js";
import type { GatewayReceiveEvents } from "./index.js";

/**
 * Base interface for all Gateway events
 */
export interface GatewayEventBase {
  /** Timestamp when the event occurred (ISO string) */
  timestamp: string;
}

/**
 * Base interface for WebSocket connection-related events
 */
export interface WebSocketConnectionEventBase extends GatewayEventBase {
  /** URL of the gateway websocket */
  gatewayUrl: string;

  /** Encoding type being used */
  encoding: EncodingType;

  /** Compression type if any */
  compression: CompressionType | null;
}

/**
 * Event emitted when a WebSocket connection is initiated
 */
export type ConnectionStartEvent = WebSocketConnectionEventBase;

/**
 * Event emitted when a WebSocket connection completes
 */
export interface ConnectionCompleteEvent extends WebSocketConnectionEventBase {
  /** Connection establishment duration in milliseconds */
  duration: number;

  /** Whether the connection is being resumed */
  resuming: boolean;
}

/**
 * Event emitted when a WebSocket connection fails
 */
export interface ConnectionFailureEvent extends WebSocketConnectionEventBase {
  /** Error object or message */
  error: Error;

  /** Connection attempt duration in milliseconds */
  duration: number;

  /** Current retry attempt number (1-based) */
  attemptNumber: number;
}

/**
 * Base interface for payload-related events
 */
export interface PayloadEventBase extends GatewayEventBase {
  /** Gateway opcode */
  opcode: GatewayOpcodes;

  /** Sequence number if available */
  sequence?: number;

  /** Size of the payload in bytes */
  payloadSize: number;
}

/**
 * Event emitted when a payload is sent
 */
export type PayloadSendEvent = PayloadEventBase;

/**
 * Event emitted when a payload is received
 */
export interface PayloadReceiveEvent extends PayloadEventBase {
  /** Event type if applicable */
  eventType: keyof GatewayReceiveEvents | null;
}

/**
 * Base interface for heartbeat-related events
 */
export interface HeartbeatEventBase extends GatewayEventBase {
  /** Current sequence number */
  sequence: number;

  /** Heartbeat interval in milliseconds */
  interval: number;
}

/**
 * Event emitted when the heartbeat system is started
 */
export interface HeartbeatStartEvent extends HeartbeatEventBase {
  /** Initial delay before first heartbeat in milliseconds */
  initialDelay: number;

  /** Whether this is an initial start or a restart */
  isRestart: boolean;

  /** Previous interval if this is a restart, 0 otherwise */
  previousInterval: number;
}

/**
 * Event emitted when a heartbeat is sent
 */
export interface HeartbeatSendEvent extends HeartbeatEventBase {
  /** Total number of heartbeats sent */
  totalBeats: number;
}

/**
 * Event emitted when a heartbeat acknowledgement is received
 */
export interface HeartbeatAckEvent extends HeartbeatEventBase {
  /** Latency in milliseconds */
  latency: number;

  /** Average latency over time */
  averageLatency: number;
}

/**
 * Event emitted when a heartbeat times out
 */
export interface HeartbeatTimeoutEvent extends HeartbeatEventBase {
  /** Number of consecutive missed heartbeats */
  missedHeartbeats: number;

  /** Maximum number of retries configured */
  maxRetries: number;
}

/**
 * Base interface for session-related events
 */
export interface SessionEventBase extends GatewayEventBase {
  /** Session ID */
  sessionId: string;
}

/**
 * Event emitted when a session is established
 */
export interface SessionStartEvent extends SessionEventBase {
  /** Resume URL provided by Discord */
  resumeUrl: string;

  /** User ID associated with this session */
  userId: string;

  /** Gateway version */
  version: ApiVersion;

  /** Number of shards in use */
  shardCount: number;

  /** Number of guilds in this session */
  guildCount: number;

  /** Number of channels in this session */
  readyTimeout: number;
}

/**
 * Event emitted when a session is invalidated
 */
export interface SessionInvalidEvent extends SessionEventBase {
  /** Whether the session can be resumed */
  resumable: boolean;

  /** Reason for invalidation if available */
  reason?: string;
}

/**
 * Event emitted when a session is resumed
 */
export interface SessionResumeEvent extends SessionEventBase {
  /** Resume URL used */
  resumeUrl: string;

  /** Number of events replayed during resume */
  replayedEvents: number;

  /** Latency of the resume process in milliseconds */
  resumeLatency: number;
}

/**
 * Base interface for shard-related events
 */
export interface ShardEventBase extends GatewayEventBase {
  /** Shard ID */
  shardId: number;

  /** Total number of shards */
  totalShards: number;
}

/**
 * Event emitted when a shard is created
 */
export interface ShardCreateEvent extends ShardEventBase {
  /** Bucket ID for rate limiting */
  bucket: number;
}

/**
 * Event emitted when a shard connects
 */
export interface ShardReadyEvent extends ShardEventBase {
  /** Number of guilds in this shard */
  guildCount: number;

  /** Session ID for this shard */
  sessionId: string;

  /** Latency in milliseconds */
  latency: number;
}

/**
 * Event emitted when a shard disconnects
 */
export interface ShardDisconnectEvent extends ShardEventBase {
  /** Close code */
  code: number;

  /** Close reason */
  reason: string;

  /** Whether the disconnect was clean */
  wasClean: boolean;
}

/**
 * Event emitted when a shard needs to reconnect
 */
export interface ShardReconnectEvent extends ShardEventBase {
  /** Current retry attempt number (1-based) */
  attemptNumber: number;

  /** Delay before reconnect in milliseconds */
  delayMs: number;
}

/**
 * Event emitted when a guild is added to a shard
 */
export interface ShardGuildAddEvent extends ShardEventBase {
  /** Guild ID that was added */
  guildId: string;

  /** New total guild count for this shard */
  newGuildCount: number;
}

/**
 * Event emitted when a guild is removed from a shard
 */
export interface ShardGuildRemoveEvent extends ShardEventBase {
  /** Guild ID that was removed */
  guildId: string;

  /** New total guild count for this shard */
  newGuildCount: number;
}

/**
 * Event emitted when a shard hits rate limits
 */
export interface ShardRateLimitEvent extends ShardEventBase {
  /** Rate limit bucket ID */
  bucket: number;

  /** Time until reset in milliseconds */
  timeout: number;

  /** Remaining requests in this window */
  remaining: number;

  /** Reset timestamp */
  reset: number;
}

/**
 * Event emitted when a session limit update is calculated
 */
export interface SessionLimitUpdateEvent extends GatewayEventBase {
  /** Old session limit value */
  oldLimit: number;

  /** Newly calculated session limit */
  newLimit: number;

  /** Number of guilds that triggered this update */
  guildCount: number;

  /** Total number of shards */
  totalShards: number;

  /** Reason for session limit update */
  reason: "large_bot" | "very_large_bot" | "scaling_adjustment";
}

/**
 * Union of all event types for discrimination
 */
export type GatewayEvent =
  | ConnectionStartEvent
  | ConnectionCompleteEvent
  | ConnectionFailureEvent
  | PayloadSendEvent
  | PayloadReceiveEvent
  | HeartbeatSendEvent
  | HeartbeatAckEvent
  | HeartbeatTimeoutEvent
  | SessionStartEvent
  | SessionInvalidEvent
  | SessionResumeEvent
  | ShardCreateEvent
  | ShardReadyEvent
  | ShardDisconnectEvent
  | ShardReconnectEvent
  | ShardGuildAddEvent
  | ShardGuildRemoveEvent
  | ShardRateLimitEvent
  | SessionLimitUpdateEvent;

/**
 * Map of event names to their corresponding payload types
 */
export interface GatewayEvents {
  /** Emitted when a WebSocket connection is initiated */
  connectionStart: [event: ConnectionStartEvent];

  /** Emitted when a WebSocket connection completes */
  connectionComplete: [event: ConnectionCompleteEvent];

  /** Emitted when a WebSocket connection fails */
  connectionFailure: [event: ConnectionFailureEvent];

  /** Emitted when a payload is sent */
  payloadSend: [event: PayloadSendEvent];

  /** Emitted when a payload is received */
  payloadReceive: [event: PayloadReceiveEvent];

  /** Emitted when heartbeat system is started */
  heartbeatStart: [event: HeartbeatStartEvent];

  /** Emitted when a heartbeat is sent */
  heartbeatSend: [event: HeartbeatSendEvent];

  /** Emitted when a heartbeat acknowledgement is received */
  heartbeatAck: [event: HeartbeatAckEvent];

  /** Emitted when a heartbeat times out */
  heartbeatTimeout: [event: HeartbeatTimeoutEvent];

  /** Emitted when a session is established */
  sessionStart: [event: SessionStartEvent];

  /** Emitted when a session is invalidated */
  sessionInvalid: [event: SessionInvalidEvent];

  /** Emitted when a session is resumed */
  sessionResume: [event: SessionResumeEvent];

  /** Emitted when a shard is created */
  shardCreate: [event: ShardCreateEvent];

  /** Emitted when a shard connects */
  shardReady: [event: ShardReadyEvent];

  /** Emitted when a shard disconnects */
  shardDisconnect: [event: ShardDisconnectEvent];

  /** Emitted when a shard needs to reconnect */
  shardReconnect: [event: ShardReconnectEvent];

  /** Emitted when a guild is added to a shard */
  shardGuildAdd: [event: ShardGuildAddEvent];

  /** Emitted when a guild is removed from a shard */
  shardGuildRemove: [event: ShardGuildRemoveEvent];

  /** Emitted when a shard hits rate limits */
  shardRateLimit: [event: ShardRateLimitEvent];

  /** Emitted when session limits are recalculated */
  sessionLimitUpdate: [event: SessionLimitUpdateEvent];

  /** Emitted when an error occurs */
  error: [error: Error | string];

  /** Emitted when an event is received from the gateway */
  dispatch: [
    event: keyof GatewayReceiveEvents,
    data: GatewayReceiveEvents[keyof GatewayReceiveEvents],
  ];
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#payload-structure}
 */
export interface PayloadEntity {
  op: GatewayOpcodes;
  d: object | number | null;
  s: number | null;
  t: keyof GatewayReceiveEvents | null;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway#list-of-intents}
 */
export enum GatewayIntentsBits {
  Guilds = 1 << 0,
  GuildMembers = 1 << 1,
  GuildModeration = 1 << 2,
  GuildExpressions = 1 << 3,
  GuildIntegrations = 1 << 4,
  GuildWebhooks = 1 << 5,
  GuildInvites = 1 << 6,
  GuildVoiceStates = 1 << 7,
  GuildPresences = 1 << 8,
  GuildMessages = 1 << 9,
  GuildMessageReactions = 1 << 10,
  GuildMessageTyping = 1 << 11,
  DirectMessages = 1 << 12,
  DirectMessageReactions = 1 << 13,
  DirectMessageTyping = 1 << 14,
  MessageContent = 1 << 15,
  GuildScheduledEvents = 1 << 16,
  AutoModerationConfiguration = 1 << 20,
  AutoModerationExecution = 1 << 21,
  GuildMessagePolls = 1 << 24,
  DirectMessagePolls = 1 << 25,
}

/**
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-opcodes}
 */
export enum GatewayOpcodes {
  Dispatch = 0,
  Heartbeat = 1,
  Identify = 2,
  PresenceUpdate = 3,
  VoiceStateUpdate = 4,
  Resume = 6,
  Reconnect = 7,
  RequestGuildMembers = 8,
  InvalidSession = 9,
  Hello = 10,
  HeartbeatAck = 11,
  RequestSoundboardSounds = 31,
}
