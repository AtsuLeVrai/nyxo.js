import type { UpdatePresenceEntity } from "../events/index.js";
import type { ShardingConfig } from "./shard.type.js";

export type CompressionType = "zlib-stream" | "zstd-stream";
export type EncodingType = "json" | "etf";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#payload-structure}
 */
export interface PayloadEntity {
  op: GatewayOpcodes;
  d: object | number | null;
  s: number | null;
  t: string | null;
}

export interface GatewayOptions {
  token: string;
  version?: 10;
  compress?: CompressionType;
  encoding?: EncodingType;
  intents: GatewayIntentsBits[] | number;
  largeThreshold?: number;
  presence?: UpdatePresenceEntity;
  shard?: ShardingConfig;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway#list-of-intents}
 */
export const GatewayIntentsBits = {
  guilds: 1 << 0,
  guildMembers: 1 << 1,
  guildModeration: 1 << 2,
  guildExpressions: 1 << 3,
  guildIntegrations: 1 << 4,
  guildWebhooks: 1 << 5,
  guildInvites: 1 << 6,
  guildVoiceStates: 1 << 7,
  guildPresences: 1 << 8,
  guildMessages: 1 << 9,
  guildMessageReactions: 1 << 10,
  guildMessageTyping: 1 << 11,
  directMessages: 1 << 12,
  directMessageReactions: 1 << 13,
  directMessageTyping: 1 << 14,
  messageContent: 1 << 15,
  guildScheduledEvents: 1 << 16,
  autoModerationConfiguration: 1 << 20,
  autoModerationExecution: 1 << 21,
  guildMessagePolls: 1 << 24,
  directMessagePolls: 1 << 25,
} as const;

export type GatewayIntentsBits =
  (typeof GatewayIntentsBits)[keyof typeof GatewayIntentsBits];

/**
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-opcodes}
 */
export const GatewayOpcodes = {
  dispatch: 0,
  heartbeat: 1,
  identify: 2,
  presenceUpdate: 3,
  voiceStateUpdate: 4,
  resume: 6,
  reconnect: 7,
  requestGuildMembers: 8,
  invalidSession: 9,
  hello: 10,
  heartbeatAck: 11,
  requestSoundboardSounds: 31,
} as const;

export type GatewayOpcodes =
  (typeof GatewayOpcodes)[keyof typeof GatewayOpcodes];

/**
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-close-event-codes}
 */
export const GatewayCloseCodes = {
  unknownError: 4000,
  unknownOpcode: 4001,
  decodeError: 4002,
  notAuthenticated: 4003,
  authenticationFailed: 4004,
  alreadyAuthenticated: 4005,
  invalidSeq: 4007,
  rateLimited: 4008,
  sessionTimedOut: 4009,
  invalidShard: 4010,
  shardingRequired: 4011,
  invalidApiVersion: 4012,
  invalidIntents: 4013,
  disallowedIntents: 4014,
} as const;

export type GatewayCloseCodes =
  (typeof GatewayCloseCodes)[keyof typeof GatewayCloseCodes];
