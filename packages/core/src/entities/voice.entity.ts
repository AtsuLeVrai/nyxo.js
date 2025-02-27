import { z } from "zod";
import { Snowflake } from "../managers/index.js";
import { GuildMemberEntity } from "./guild.entity.js";

/**
 * Represents a Discord voice region, which can be used when setting a voice or stage channel's rtc_region.
 * @see {@link https://discord.com/developers/docs/resources/voice#voice-region-object}
 */
export const VoiceRegionEntity = z.object({
  /** Unique ID for the region */
  id: z.string(),

  /** Name of the region */
  name: z.string(),

  /** True for a single server that is closest to the current user's client */
  optimal: z.boolean(),

  /** Whether this is a deprecated voice region (avoid switching to these) */
  deprecated: z.boolean(),

  /** Whether this is a custom voice region (used for events/etc) */
  custom: z.boolean(),
});

export type VoiceRegionEntity = z.infer<typeof VoiceRegionEntity>;

/**
 * Represents a user's voice connection status in Discord.
 * Used to represent a user's voice connection status.
 * @see {@link https://discord.com/developers/docs/resources/voice#voice-state-object}
 */
export const VoiceStateEntity = z.object({
  /** The guild ID this voice state is for, if applicable */
  guild_id: Snowflake.optional(),

  /** The channel ID this user is connected to (null if disconnected) */
  channel_id: Snowflake.nullable(),

  /** The user ID this voice state is for */
  user_id: Snowflake,

  /** The guild member this voice state is for, if applicable */
  member: GuildMemberEntity.optional(),

  /** The session ID for this voice state */
  session_id: z.string(),

  /** Whether this user is deafened by the server */
  deaf: z.boolean(),

  /** Whether this user is muted by the server */
  mute: z.boolean(),

  /** Whether this user is locally deafened */
  self_deaf: z.boolean(),

  /** Whether this user is locally muted */
  self_mute: z.boolean(),

  /** Whether this user is streaming using "Go Live" */
  self_stream: z.boolean().optional(),

  /** Whether this user's camera is enabled */
  self_video: z.boolean(),

  /** Whether this user's permission to speak is denied */
  suppress: z.boolean(),

  /** The time at which the user requested to speak */
  request_to_speak_timestamp: z.string().datetime().nullable(),
});

export type VoiceStateEntity = z.infer<typeof VoiceStateEntity>;
