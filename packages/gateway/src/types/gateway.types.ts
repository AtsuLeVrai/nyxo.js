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
 * Base interface for all connection state objects
 */
export interface ConnectionStateBase extends GatewayEventBase {
  /** Current connection status */
  status: string;

  /** URL of the gateway websocket */
  gatewayUrl: string | null;
}

/**
 * Represents a connection in the initialization phase
 */
export interface ConnectionStartingState extends ConnectionStateBase {
  status: "starting";

  /** Encoding type being used */
  encoding: EncodingType;

  /** Compression type being used */
  compression: CompressionType | null;
}

/**
 * Represents a successfully established connection
 */
export interface ConnectionConnectedState extends ConnectionStateBase {
  status: "connected";

  /** Connection establishment duration in milliseconds */
  duration: number;

  /** Whether the connection is being resumed */
  resuming: boolean;
}

/**
 * Represents a failed connection attempt
 */
export interface ConnectionFailedState extends ConnectionStateBase {
  status: "failed";

  /** Error that caused the failure */
  error: Error;

  /** Current retry attempt number */
  attempt: number;

  /** Connection attempt duration in milliseconds */
  duration: number;
}

/**
 * Union type representing all possible connection states
 */
export type ConnectionState =
  | ConnectionStartingState
  | ConnectionConnectedState
  | ConnectionFailedState;

/**
 * Base interface for all heartbeat events
 */
export type HeartbeatStatus = "started" | "sent" | "ack" | "timeout";

/**
 * Base interface for all heartbeat state objects
 */
export interface HeartbeatStateBase extends GatewayEventBase {
  /** Current heartbeat status */
  status: HeartbeatStatus;
}

/**
 * Represents a newly started heartbeat system
 */
export interface HeartbeatStartedState extends HeartbeatStateBase {
  status: "started";

  /** Heartbeat interval in milliseconds */
  interval: number;

  /** Initial delay before first heartbeat in milliseconds */
  initialDelay: number;
}

/**
 * Represents a sent heartbeat
 */
export interface HeartbeatSentState extends HeartbeatStateBase {
  status: "sent";

  /** Current sequence number */
  sequence: number;

  /** Total number of heartbeats sent */
  totalBeats: number;
}

/**
 * Represents a received heartbeat acknowledgement
 */
export interface HeartbeatAckState extends HeartbeatStateBase {
  status: "ack";

  /** Latency in milliseconds */
  latency: number;

  /** Current sequence number */
  sequence: number;
}

/**
 * Represents a timed out heartbeat
 */
export interface HeartbeatTimeoutState extends HeartbeatStateBase {
  status: "timeout";

  /** Number of consecutive missed heartbeats */
  missedHeartbeats: number;

  /** Maximum number of retries configured */
  maxRetries: number;
}

/**
 * Union type representing all possible heartbeat states
 */
export type HeartbeatState =
  | HeartbeatStartedState
  | HeartbeatSentState
  | HeartbeatAckState
  | HeartbeatTimeoutState;

/**
 * Base interface for all session status objects
 */
export type SessionStatus = "started" | "resumed" | "invalidated";

/**
 * Base interface for all session state objects
 */
export interface SessionStateBase extends GatewayEventBase {
  /** Current session status */
  status: SessionStatus;

  /** Session ID */
  sessionId: string;
}

/**
 * Represents a newly started session
 */
export interface SessionStartedState extends SessionStateBase {
  status: "started";

  /** Resume URL provided by Discord */
  resumeUrl: string;

  /** User ID associated with this session */
  userId: string;

  /** Number of guilds in this session */
  guildCount: number;
}

/**
 * Represents a resumed session
 */
export interface SessionResumedState extends SessionStateBase {
  status: "resumed";

  /** Latency of the resume process in milliseconds */
  latency: number;

  /** Number of events replayed during resume */
  replayedEvents: number;
}

/**
 * Represents an invalidated session
 */
export interface SessionInvalidatedState extends SessionStateBase {
  status: "invalidated";

  /** Whether the session can be resumed */
  resumable: boolean;

  /** Reason for invalidation if available */
  reason?: string;
}

/**
 * Union type representing all possible session states
 */
export type SessionState =
  | SessionStartedState
  | SessionResumedState
  | SessionInvalidatedState;

/**
 * Base interface for all shard status objects
 */
export type ShardEventStatus =
  | "created"
  | "ready"
  | "disconnected"
  | "reconnecting"
  | "healthUpdate"
  | "rateLimit";

/**
 * Base interface for all shard state objects
 */
export interface ShardStateBase extends GatewayEventBase {
  /** Current shard status */
  status: ShardEventStatus;

  /** ID of the shard */
  shardId: number;
}

/**
 * Represents a newly created shard
 */
export interface ShardCreatedState extends ShardStateBase {
  status: "created";

  /** Total number of shards */
  totalShards: number;

  /** Rate limit bucket ID */
  bucket: number;
}

/**
 * Represents a ready shard
 */
export interface ShardReadyState extends ShardStateBase {
  status: "ready";

  /** Total number of shards */
  totalShards: number;

  /** Number of guilds in this shard */
  guildCount: number;
}

/**
 * Represents a disconnected shard
 */
export interface ShardDisconnectedState extends ShardStateBase {
  status: "disconnected";

  /** Total number of shards */
  totalShards: number;

  /** WebSocket close code */
  code: number;

  /** Reason for disconnect */
  reason: string;
}

/**
 * Represents a reconnecting shard
 */
export interface ShardReconnectingState extends ShardStateBase {
  status: "reconnecting";

  /** Delay before retry in milliseconds */
  delayMs: number;
}

/**
 * Represents a health update for a shard
 */
export interface ShardHealthUpdateState extends ShardStateBase {
  status: "healthUpdate";

  /** Health metrics data */
  metrics: {
    /** Latency in milliseconds */
    latency: number;

    /** Time of last successful heartbeat */
    lastHeartbeat: number;

    /** Number of failed heartbeats */
    failedHeartbeats: number;
  };

  /** Health score (0-100) */
  score: number;
}

/**
 * Represents a rate-limited shard
 */
export interface ShardRateLimitState extends ShardStateBase {
  status: "rateLimit";

  /** Rate limit bucket ID */
  bucket: number;

  /** Time until reset in milliseconds */
  timeout: number;

  /** Reset timestamp */
  reset: number;
}

/**
 * Union type representing all possible shard states
 */
export type ShardState =
  | ShardCreatedState
  | ShardReadyState
  | ShardDisconnectedState
  | ShardReconnectingState
  | ShardHealthUpdateState
  | ShardRateLimitState;

/**
 * Base interface for all scaling status objects
 */
export type ScalingStatus = "started" | "completed" | "failed";

/**
 * Base interface for all scaling state objects
 */
export interface ScalingStateBase extends GatewayEventBase {
  /** Current scaling status */
  status: ScalingStatus;

  /** Previous number of shards */
  oldCount: number;

  /** New number of shards */
  newCount: number;
}

/**
 * Represents a started scaling operation
 */
export interface ScalingStartedState extends ScalingStateBase {
  status: "started";

  /** Reason for scaling */
  reason: string;
}

/**
 * Represents a completed scaling operation
 */
export interface ScalingCompletedState extends ScalingStateBase {
  status: "completed";

  /** Whether scaling was successful */
  successful: boolean;
}

/**
 * Represents a failed scaling operation
 */
export interface ScalingFailedState extends ScalingStateBase {
  status: "failed";

  /** Error that caused the failure */
  error: Error;
}

/**
 * Union type representing all possible scaling states
 */
export type ScalingState =
  | ScalingStartedState
  | ScalingCompletedState
  | ScalingFailedState;

/**
 * Base interface for all circuit breaker status objects
 */
export type CircuitBreakerStatus = "open" | "halfOpen" | "closed" | "blocked";

/**
 * Base interface for all circuit breaker state objects
 */
export interface CircuitBreakerStateBase {
  /** Current circuit breaker status */
  status: CircuitBreakerStatus;
}

/**
 * Represents an open circuit
 */
export interface CircuitBreakerOpenState extends CircuitBreakerStateBase {
  status: "open";

  /** Time until reset in milliseconds */
  resetTimeout: number;

  /** Type of failure that triggered the circuit */
  failureType?: string;

  /** Number of consecutive failures */
  failureCount: number;
}

/**
 * Represents a half-open circuit
 */
export interface CircuitBreakerHalfOpenState extends CircuitBreakerStateBase {
  status: "halfOpen";
}

/**
 * Represents a closed circuit
 */
export interface CircuitBreakerClosedState extends CircuitBreakerStateBase {
  status: "closed";
}

/**
 * Represents a blocked operation due to circuit breaker
 */
export interface CircuitBreakerBlockedState extends CircuitBreakerStateBase {
  status: "blocked";

  /** Type of blocked operation */
  operation: string;

  /** Remaining time before the next test in milliseconds */
  remainingTimeout: number;
}

/**
 * Union type representing all possible circuit breaker states
 */
export type CircuitBreakerState =
  | CircuitBreakerOpenState
  | CircuitBreakerHalfOpenState
  | CircuitBreakerClosedState
  | CircuitBreakerBlockedState;

/**
 * Strongly typed event map for the gateway
 */
export interface GatewayEvents {
  /** Emitted when connection state changes */
  connection: [state: ConnectionState];

  /** Emitted when heartbeat state changes */
  heartbeat: [state: HeartbeatState];

  /** Emitted when session state changes */
  session: [state: SessionState];

  /** Emitted when shard state changes */
  shard: [state: ShardState];

  /** Emitted when scaling state changes */
  scaling: [state: ScalingState];

  /** Emitted when circuit breaker state changes */
  circuitBreaker: [state: CircuitBreakerState];

  /** Emitted when an error occurs */
  error: [error: Error];

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
