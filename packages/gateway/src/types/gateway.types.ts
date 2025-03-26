import type { ApiVersion } from "@nyxjs/core";
import type { CompressionType, EncodingType } from "../options/index.js";
import type {
  CircuitState,
  CircuitStateChangeEvent,
  FailureType,
} from "../services/index.js";
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
 * Event emitted when a failure is recorded
 */
export interface CircuitFailureEvent {
  /** Event timestamp */
  timestamp: string;

  /** Failure type */
  failureType: FailureType;

  /** Current circuit state */
  state: CircuitState;

  /** Number of consecutive failures */
  failureCount: number;

  /** Original error */
  error: Error;
}

/**
 * Event emitted when an operation is blocked by the circuit
 */
export interface CircuitBlockedEvent {
  /** Event timestamp */
  timestamp: string;

  /** Type of blocked operation */
  operationType: string;

  /** Current circuit state */
  state: CircuitState;

  /** Remaining time before the next test in milliseconds */
  remainingTimeout: number;
}

/**
 * Event emitted when a session limit is updated
 */
export interface SessionLimitUpdateEvent extends GatewayEventBase {
  /** Previous session limit */
  oldLimit: number;

  /** New session limit */
  newLimit: number;

  /** Number of guilds used for calculation */
  guildCount: number;

  /** Total number of shards */
  totalShards: number;

  /** Reason for the update */
  reason: "large_bot" | "very_large_bot" | "scaling_adjustment";
}

/**
 * Base interface for all shard events
 */
export interface ShardEventBase {
  /** Event timestamp (ISO string) */
  timestamp: string;
}

/**
 * Event emitted when a shard is created
 */
export interface ShardCreateEvent extends ShardEventBase {
  /** ID of the shard */
  shardId: number;

  /** Total number of shards */
  totalShards: number;

  /** Rate limit bucket ID */
  bucket: number;
}

/**
 * Event emitted when a shard is disconnected
 */
export interface ShardDisconnectEvent extends ShardEventBase {
  /** ID of the shard */
  shardId: number;

  /** Total number of shards */
  totalShards: number;

  /** WebSocket close code */
  code: number;

  /** Reason for disconnect */
  reason: string;
}

/**
 * Event emitted when a guild is added to a shard
 */
export interface ShardGuildAddEvent extends ShardEventBase {
  /** ID of the shard */
  shardId: number;

  /** Total number of shards */
  totalShards: number;

  /** ID of the guild that was added */
  guildId: string;

  /** New total guild count for this shard */
  newGuildCount: number;
}

/**
 * Event emitted when a guild is removed from a shard
 */
export interface ShardGuildRemoveEvent extends ShardEventBase {
  /** ID of the shard */
  shardId: number;

  /** Total number of shards */
  totalShards: number;

  /** ID of the guild that was removed */
  guildId: string;

  /** New total guild count for this shard */
  newGuildCount: number;
}

/**
 * Event emitted when multiple guilds are added to a shard
 */
export interface ShardGuildBulkAddEvent extends ShardEventBase {
  /** ID of the shard */
  shardId: number;

  /** Total number of shards */
  totalShards: number;

  /** IDs of the guilds that were added */
  guildIds: string[];

  /** Number of guilds added */
  addedCount: number;

  /** New total guild count for this shard */
  newGuildCount: number;
}

/**
 * Event emitted when a shard's health status is updated
 */
export interface ShardHealthUpdateEvent extends ShardEventBase {
  /** ID of the shard */
  shardId: number;

  /** Health metrics data */
  metrics: {
    /** Latency in milliseconds */
    latency: number;

    /** Time of last successful heartbeat */
    lastHeartbeat: number;

    /** Number of failed heartbeats */
    failedHeartbeats: number;
  };

  /** Current shard status */
  status: string;

  /** Health score (0-100) */
  score: number;
}

/**
 * Event emitted when a shard hits rate limits
 */
export interface ShardRateLimitEvent extends ShardEventBase {
  /** ID of the shard */
  shardId: number;

  /** Total number of shards */
  totalShards: number;

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
 * Event emitted when a shard becomes ready
 */
export interface ShardReadyEvent extends ShardEventBase {
  /** ID of the shard */
  shardId: number;

  /** Total number of shards */
  totalShards: number;

  /** Session ID for this shard */
  sessionId: string;

  /** Latency in milliseconds */
  latency: number;

  /** Number of guilds in this shard */
  guildCount: number;
}

/**
 * Event emitted when a shard needs to reconnect
 */
export interface ShardReconnectEvent extends ShardEventBase {
  /** ID of the shard */
  shardId: number;

  /** Total number of shards */
  totalShards: number;

  /** Delay before retry in milliseconds */
  delayMs: number;
}

/**
 * Event emitted when scaling the number of shards
 */
export interface ShardScalingEvent extends ShardEventBase {
  /** Previous number of shards */
  oldShardCount: number;

  /** New number of shards */
  newShardCount: number;

  /** Reason for scaling */
  reason: "scale_up" | "scale_down";
}

/**
 * Event emitted when shard scaling is complete
 */
export interface ShardScalingCompleteEvent extends ShardEventBase {
  /** Previous number of shards */
  oldShardCount: number;

  /** New number of shards */
  newShardCount: number;

  /** Whether scaling was successful */
  successful: boolean;
}

/**
 * Event emitted when shard scaling fails
 */
export interface ShardScalingFailedEvent extends ShardEventBase {
  /** Previous number of shards */
  oldShardCount: number;

  /** Target number of shards */
  newShardCount: number;

  /** Error that caused the failure */
  error: Error | unknown;

  /** Reason for failure */
  reason: string;
}

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

  /** Emitted when a session limit is updated */
  sessionLimitUpdate: [event: SessionLimitUpdateEvent];

  /** Emitted when a shard is created */
  shardCreate: [event: ShardCreateEvent];

  /** Emitted when a shard disconnects */
  shardDisconnect: [event: ShardDisconnectEvent];

  /** Emitted when a guild is added to a shard */
  shardGuildAdd: [event: ShardGuildAddEvent];

  /** Emitted when a guild is removed from a shard */
  shardGuildRemove: [event: ShardGuildRemoveEvent];

  /** Emitted when multiple guilds are added to a shard */
  shardGuildBulkAdd: [event: ShardGuildBulkAddEvent];

  /** Emitted when a shard's health status is updated */
  shardHealthUpdate: [event: ShardHealthUpdateEvent];

  /** Emitted when a shard hits rate limits */
  shardRateLimit: [event: ShardRateLimitEvent];

  /** Emitted when a shard becomes ready */
  shardReady: [event: ShardReadyEvent];

  /** Emitted when a shard is resuming */
  shardResuming: [event: ShardReadyEvent];

  /** Emitted when a shard needs to reconnect */
  shardReconnect: [event: ShardReconnectEvent];

  /** Emitted when scaling the number of shards */
  shardScaling: [event: ShardScalingEvent];

  /** Emitted when shard scaling is complete */
  shardScalingComplete: [event: ShardScalingCompleteEvent];

  /** Emitted when shard scaling fails */
  shardScalingFailed: [event: ShardScalingFailedEvent];

  /** Emitted when an error occurs */
  error: [error: Error | string];

  /** Emitted when an event is received from the gateway */
  dispatch: [
    event: keyof GatewayReceiveEvents,
    data: GatewayReceiveEvents[keyof GatewayReceiveEvents],
  ];

  /** Emitted when a circuit breaker state changes */
  circuitStateChange: [event: CircuitStateChangeEvent];

  /** Emitted when an operation is blocked by the circuit */
  circuitBlocked: [event: CircuitBlockedEvent];

  /** Emitted when a failure is recorded by the circuit */
  circuitFailure: [event: CircuitFailureEvent];
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
