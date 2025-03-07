import type { Snowflake } from "../managers/index.js";
import type { GuildMemberEntity } from "./guild.entity.js";

/**
 * Represents a Discord voice region, which can be used when setting a voice or stage channel's rtc_region.
 * @see {@link https://discord.com/developers/docs/resources/voice#voice-region-object}
 */
export interface VoiceRegionEntity {
  /** Unique ID for the region */
  id: string;

  /** Name of the region */
  name: string;

  /** True for a single server that is closest to the current user's client */
  optimal: boolean;

  /** Whether this is a deprecated voice region (avoid switching to these) */
  deprecated: boolean;

  /** Whether this is a custom voice region (used for events/etc) */
  custom: boolean;
}

/**
 * Represents a user's voice connection status in Discord.
 * Used to represent a user's voice connection status.
 * @see {@link https://discord.com/developers/docs/resources/voice#voice-state-object}
 */
export interface VoiceStateEntity {
  /** The guild ID this voice state is for, if applicable */
  guild_id?: Snowflake;

  /** The channel ID this user is connected to (null if disconnected) */
  channel_id: Snowflake | null;

  /** The user ID this voice state is for */
  user_id: Snowflake;

  /** The guild member this voice state is for, if applicable */
  member?: GuildMemberEntity;

  /** The session ID for this voice state */
  session_id: string;

  /** Whether this user is deafened by the server */
  deaf: boolean;

  /** Whether this user is muted by the server */
  mute: boolean;

  /** Whether this user is locally deafened */
  self_deaf: boolean;

  /** Whether this user is locally muted */
  self_mute: boolean;

  /** Whether this user is streaming using "Go Live" */
  self_stream?: boolean;

  /** Whether this user's camera is enabled */
  self_video: boolean;

  /** Whether this user's permission to speak is denied */
  suppress: boolean;

  /** The time at which the user requested to speak */
  request_to_speak_timestamp: string | null;
}
