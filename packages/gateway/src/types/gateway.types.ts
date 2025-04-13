import type { CompressionType, EncodingType } from "../options/index.js";
import type { GatewayReceiveEvents } from "./index.js";

/**
 * Base for all Gateway events
 */
export interface GatewayEventBase {
  /** ISO timestamp when the event occurred */
  timestamp: string;
}

/**
 * Emitted when a connection attempt is made to the gateway
 */
export interface ConnectionAttemptEvent extends GatewayEventBase {
  /** Gateway URL being connected to */
  gatewayUrl: string;

  /** Encoding type being used */
  encoding: EncodingType;

  /** Compression type being used (if any) */
  compression: CompressionType | null;
}

/**
 * Emitted when a connection to the gateway is established successfully
 */
export interface ConnectionSuccessEvent extends GatewayEventBase {
  /** Gateway URL that was connected to */
  gatewayUrl: string;

  /** Whether this was a resumed connection */
  resumed: boolean;
}

/**
 * Emitted when a connection attempt to the gateway fails
 */
export interface ConnectionFailureEvent extends GatewayEventBase {
  /** Gateway URL that was attempted */
  gatewayUrl: string | null;

  /** Error that caused the failure */
  error: Error;

  /** Which attempt number this was */
  attemptNumber: number;
}

/**
 * Emitted when a reconnection to the gateway is scheduled
 */
export interface ReconnectionEvent extends GatewayEventBase {
  /** Delay in milliseconds before the reconnection attempt */
  delayMs: number;

  /** Reason for the reconnection */
  reason:
    | "heartbeat_timeout"
    | "connection_closed"
    | "invalid_session"
    | "rate_limited"
    | "manual"
    | string;

  /** Number of previous connection attempts */
  previousAttempts: number;
}

/**
 * Heartbeat Events
 */
export interface HeartbeatEvent extends GatewayEventBase {
  /** Current sequence number */
  sequence: number;

  /** Total number of heartbeats sent since connection */
  totalSent?: number;

  /** Latency in milliseconds (only for acknowledgement) */
  latencyMs?: number;
}

/**
 * Emitted when a heartbeat timeout occurs
 */
export interface HeartbeatTimeoutEvent extends GatewayEventBase {
  /** Number of consecutive missed heartbeats */
  missedCount: number;

  /** Maximum number of retries configured */
  maxRetries: number;

  /** Whether automatic reconnection will be triggered */
  willReconnect: boolean;
}

/**
 * Session Events
 */
export interface SessionEvent extends GatewayEventBase {
  /** Session ID assigned by Discord */
  sessionId: string;

  /** Last sequence number received */
  duration: number;

  /** Resume URL provided by Discord */
  resumeUrl?: string;

  /** User ID associated with this session */
  userId?: string;

  /** Number of guilds in this session */
  guildCount?: number;
}

/**
 * Emitted when a session is resumed
 */
export interface SessionResumeEvent extends GatewayEventBase {
  /** Session ID */
  sessionId: string;

  /** Last sequence number that was received */
  sequence: number;

  /** Number of events replayed during resume */
  replayedEvents: number;

  /** Resume processing latency in milliseconds */
  latencyMs: number;
}

/**
 * Emitted when a session is invalidated
 */
export interface SessionInvalidateEvent extends GatewayEventBase {
  /** Session ID that was invalidated */
  sessionId: string;

  /** Whether the session can be resumed */
  resumable: boolean;

  /** Reason for invalidation */
  reason:
    | "server_request"
    | "heartbeat_timeout"
    | "authentication_failed"
    | "rate_limited"
    | string;
}

/**
 * Shard Events
 */
export interface ShardEvent extends GatewayEventBase {
  /** ID of the shard */
  shardId: number;

  /** Total number of shards */
  totalShards: number;
}

/**
 * Emitted when a shard is created
 */
export interface ShardReadyEvent extends ShardEvent {
  /** Number of guilds in this shard */
  guildCount: number;
}

/**
 * Emitted when a shard disconnects
 */
export interface ShardDisconnectEvent extends ShardEvent {
  /** WebSocket close code */
  closeCode: number;

  /** Reason for disconnect */
  reason: string;

  /** Whether this shard will try to reconnect */
  willReconnect: boolean;
}

/**
 * Rate limit management event
 * (Consolidated from circuit breaker and other rate limit handling)
 */
export interface RateLimitEvent extends GatewayEventBase {
  /** Type of rate limit */
  type: "global" | "identify" | "gateway" | "guild" | string;

  /** Time until the rate limit resets in milliseconds */
  resetAfterMs: number;

  /** ISO timestamp when the rate limit will reset */
  resetAt: string;

  /** Optional bucket ID or resource identifier */
  resourceId?: string;

  /** Whether connections are being throttled */
  isThrottling: boolean;

  /** Number of failed attempts */
  failureCount: number;
}

/**
 * Strongly typed event map for the gateway
 */
export interface GatewayEvents {
  // Connection lifecycle events
  connectionAttempt: [event: ConnectionAttemptEvent];
  connectionSuccess: [event: ConnectionSuccessEvent];
  connectionFailure: [event: ConnectionFailureEvent];
  reconnectionScheduled: [event: ReconnectionEvent];

  // Heartbeat communication events
  heartbeatSent: [event: HeartbeatEvent];
  heartbeatAcknowledge: [event: HeartbeatEvent];
  heartbeatTimeout: [event: HeartbeatTimeoutEvent];

  // Session events
  sessionStart: [event: SessionEvent];
  sessionResume: [event: SessionResumeEvent];
  sessionInvalidate: [event: SessionInvalidateEvent];

  // Shard events
  shardCreate: [event: ShardEvent];
  shardReady: [event: ShardReadyEvent];
  shardDisconnect: [event: ShardDisconnectEvent];

  // Rate limit event (fusion of circuit breaker)
  rateLimitDetected: [event: RateLimitEvent];

  // Discord gateway events (unchanged)
  error: [error: Error];
  dispatch: [
    event: keyof GatewayReceiveEvents,
    data: GatewayReceiveEvents[keyof GatewayReceiveEvents],
  ];
}

/**
 * Gateway Payload Structure
 * @see {@link https://discord.com/developers/docs/events/gateway-events#payload-structure}
 */
export interface PayloadEntity {
  op: GatewayOpcodes;
  d: object | number | null;
  s: number | null;
  t: keyof GatewayReceiveEvents | null;
}

/**
 * Gateway Intents
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
  All = Guilds |
    GuildMembers |
    GuildModeration |
    GuildExpressions |
    GuildIntegrations |
    GuildWebhooks |
    GuildInvites |
    GuildVoiceStates |
    GuildPresences |
    GuildMessages |
    GuildMessageReactions |
    GuildMessageTyping |
    DirectMessages |
    DirectMessageReactions |
    DirectMessageTyping |
    MessageContent |
    GuildScheduledEvents |
    AutoModerationConfiguration |
    AutoModerationExecution |
    GuildMessagePolls |
    DirectMessagePolls,
}

/**
 * Gateway Opcodes
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
