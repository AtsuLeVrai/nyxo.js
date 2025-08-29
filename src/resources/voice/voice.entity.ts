import type { DeepNonNullable } from "../../utils/index.js";
import type { EmojiEntity } from "../emoji/index.js";
import type { GuildMemberEntity } from "../guild/index.js";

/**
 * @description Animation types for Discord voice channel effects like emoji reactions and soundboard sounds.
 * @see {@link https://discord.com/developers/docs/events/gateway-events#voice-channel-effect-send-animation-types}
 */
export enum VoiceChannelEffectSendAnimationType {
  /** Premium animation available to Nitro subscribers */
  Premium = 0,
  /** Standard animation available to all users */
  Basic = 1,
}

/**
 * @description Represents a Discord voice region for optimal voice connection routing.
 * @see {@link https://discord.com/developers/docs/resources/voice#voice-region-object}
 */
export interface VoiceRegionEntity {
  /** Unique identifier for the voice region */
  id: string;
  /** Human-readable name of the region */
  name: string;
  /** True if this region is closest to the current user's client */
  optimal: boolean;
  /** True if this is a deprecated voice region that should be avoided */
  deprecated: boolean;
  /** True if this is a custom voice region used for events */
  custom: boolean;
}

/**
 * @description Represents a Discord user's voice connection status in a guild or DM channel.
 * @see {@link https://discord.com/developers/docs/resources/voice#voice-state-object}
 */
export interface VoiceStateEntity {
  /** Guild ID where this voice state exists (undefined for DM channels) */
  guild_id?: string;
  /** Voice channel ID the user is connected to (null if disconnected) */
  channel_id: string | null;
  /** User ID this voice state represents */
  user_id: string;
  /** Guild member object if this voice state is in a guild */
  member?: GuildMemberEntity;
  /** Session ID for this voice connection */
  session_id: string;
  /** True if user is server deafened */
  deaf: boolean;
  /** True if user is server muted */
  mute: boolean;
  /** True if user is locally deafened */
  self_deaf: boolean;
  /** True if user is locally muted */
  self_mute: boolean;
  /** True if user is streaming using Go Live */
  self_stream?: boolean;
  /** True if user's camera is enabled */
  self_video: boolean;
  /** True if user's permission to speak is denied */
  suppress: boolean;
  /** ISO8601 timestamp when user requested to speak in stage channel */
  request_to_speak_timestamp: string | null;
}

/**
 * @description Voice server update data sent when connecting to or switching voice servers.
 * @see {@link https://discord.com/developers/docs/events/gateway-events#voice-server-update}
 */
export interface GatewayVoiceServerUpdateEntity {
  /** Voice connection token for authentication */
  token: string;
  /** Guild ID this voice server update is for */
  guild_id: string;
  /** Voice server host (null when server goes away and needs reallocation) */
  endpoint: string | null;
}

/**
 * @description Data for voice channel effects like emoji reactions and soundboard sounds.
 * @see {@link https://discord.com/developers/docs/events/gateway-events#voice-channel-effect-send}
 */
export interface GatewayVoiceChannelEffectSendEntity
  extends Required<DeepNonNullable<Pick<VoiceStateEntity, "channel_id" | "guild_id" | "user_id">>> {
  /** Emoji used for reaction and soundboard effects */
  emoji?: EmojiEntity | null;
  /** Type of emoji animation (Premium or Basic) */
  animation_type?: VoiceChannelEffectSendAnimationType;
  /** ID of the emoji animation */
  animation_id?: number;
  /** Soundboard sound ID (snowflake or integer) */
  sound_id?: string | number;
  /** Volume of soundboard sound from 0 to 1 */
  sound_volume?: number;
}
