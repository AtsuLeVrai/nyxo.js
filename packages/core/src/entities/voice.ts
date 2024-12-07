import type { Iso8601 } from "../formatting/index.js";
import type { Snowflake } from "../utils/index.js";
import type { GuildMemberEntity } from "./guild.js";

/**
 * Represents a voice region in Discord.
 *
 * @remarks
 * Voice regions define where voice servers are located.
 * They can be used when setting a voice or stage channel's rtc_region.
 *
 * @example
 * ```typescript
 * const region: VoiceRegionEntity = {
 *   id: "us-east",
 *   name: "US East",
 *   optimal: true,
 *   deprecated: false,
 *   custom: false
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/voice#voice-region-object-voice-region-structure}
 */
export interface VoiceRegionEntity {
  /** Unique identifier for the region */
  id: string;
  /** Name of the region */
  name: string;
  /** Whether this region is the closest to the current user's client */
  optimal: boolean;
  /** Whether this is a deprecated voice region (avoid switching to these) */
  deprecated: boolean;
  /** Whether this is a custom voice region (used for events/etc) */
  custom: boolean;
}

/**
 * Represents a user's voice connection status.
 *
 * @remarks
 * Voice states track various properties about a user's voice connection,
 * including mute status, deafened status, and whether they're streaming or have video enabled.
 * For stage channels, it also tracks speaking permissions and requests to speak.
 *
 * @example
 * ```typescript
 * const voiceState: VoiceStateEntity = {
 *   channel_id: "157733188964188161",
 *   user_id: "80351110224678912",
 *   session_id: "90326bd25d71d39b9ef95b299e3872ff",
 *   deaf: false,
 *   mute: false,
 *   self_deaf: false,
 *   self_mute: true,
 *   self_video: false,
 *   suppress: false,
 *   request_to_speak_timestamp: "2021-03-31T18:45:31.297561+00:00"
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/voice#voice-state-object-voice-state-structure}
 */
export interface VoiceStateEntity {
  /** The guild ID this voice state is for */
  guild_id?: Snowflake;
  /** The channel ID this user is connected to (null if disconnected) */
  channel_id: Snowflake | null;
  /** The user ID this voice state is for */
  user_id: Snowflake;
  /** The guild member this voice state is for */
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
  request_to_speak_timestamp: Iso8601 | null;
}
