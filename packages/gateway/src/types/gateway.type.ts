import type { ApiVersion, Integer } from "@nyxjs/core";
import type { UpdatePresenceEntity } from "../events/index.js";
import type {
  GatewayReceiveEventsMap,
  GatewaySendEventsMap,
} from "./event.type.js";
import type { RateLimitOptions } from "./rate-limit.type.js";
import type { ShardOptions } from "./shard.type.js";

export enum CompressionType {
  ZlibStream = "zlib-stream",
  ZstdStream = "zstd-stream",
}

export enum EncodingType {
  Json = "json",
  Etf = "etf",
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#payload-structure}
 */
export type PayloadEntity<
  T extends keyof GatewayReceiveEventsMap | keyof GatewaySendEventsMap =
    | keyof GatewayReceiveEventsMap
    | keyof GatewaySendEventsMap,
> = T extends keyof GatewayReceiveEventsMap
  ? {
      op: GatewayOpcodes;
      d: GatewayReceiveEventsMap[T];
      s: Integer;
      t: T;
    }
  : T extends keyof GatewaySendEventsMap
    ? {
        op: T;
        d: GatewaySendEventsMap[T];
        s: null;
        t: null;
      }
    : {
        op: GatewayOpcodes;
        d: object | number | null;
        s: Integer | null;
        t: string | null;
      };

export interface GatewayOptions extends ShardOptions, RateLimitOptions {
  token?: string;
  version?: ApiVersion.V10;
  compress?: CompressionType;
  encoding?: EncodingType;
  intents: GatewayIntentsBits[] | number;
  largeThreshold?: Integer;
  presence?: UpdatePresenceEntity;
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

/**
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-close-event-codes}
 */
export enum GatewayCloseCodes {
  UnknownError = 4000,
  UnknownOpcode = 4001,
  DecodeError = 4002,
  NotAuthenticated = 4003,
  AuthenticationFailed = 4004,
  AlreadyAuthenticated = 4005,
  InvalidSeq = 4007,
  RateLimited = 4008,
  SessionTimedOut = 4009,
  InvalidShard = 4010,
  ShardingRequired = 4011,
  InvalidApiVersion = 4012,
  InvalidIntents = 4013,
  DisallowedIntents = 4014,
}
