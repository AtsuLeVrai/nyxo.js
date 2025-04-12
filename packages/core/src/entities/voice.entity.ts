import type { Snowflake } from "../markdown/index.js";
import type { GuildMemberEntity } from "./guild.entity.js";

/**
 * Represents a Discord voice region, which can be used when setting a voice or stage channel's rtc_region.
 * Voice regions determine the geographic location of voice servers that users connect to.
 * These can be retrieved using the List Voice Regions endpoint and used when configuring channels.
 *
 * @see {@link https://discord.com/developers/docs/resources/voice#voice-region-object}
 */
export interface VoiceRegionEntity {
  /**
   * Unique ID for the region
   * This identifier is used when setting a channel's rtc_region
   * Example values: "us-west", "brazil", "japan", etc.
   */
  id: string;

  /**
   * Name of the region
   * Human-readable name displayed in the Discord client
   * Example values: "US West", "Brazil", "Japan", etc.
   */
  name: string;

  /**
   * True for a single server that is closest to the current user's client
   * This is the region Discord would automatically choose for optimal performance
   */
  optimal: boolean;

  /**
   * Whether this is a deprecated voice region (avoid switching to these)
   * Deprecated regions may be removed in the future and should not be used for new channels
   */
  deprecated: boolean;

  /**
   * Whether this is a custom voice region (used for events/etc)
   * Custom regions are special-purpose regions not generally available to all users
   */
  custom: boolean;
}

/**
 * Represents a user's voice connection status in Discord.
 * Voice states track information about a user's connection to a voice or stage channel,
 * including mute/deafen status, video status, and speaking permissions.
 *
 * @remarks
 * - Voice states are created when a user joins a voice channel and removed when they disconnect
 * - Different types of mute/deafen exist: server-side (enforced by permissions) and client-side (user's choice)
 * - In stage channels, users can request to speak using request_to_speak_timestamp
 * - Modifying voice states has several caveats, especially in stage channels
 *
 * @see {@link https://discord.com/developers/docs/resources/voice#voice-state-object}
 */
export interface VoiceStateEntity {
  /**
   * The guild ID this voice state is for, if applicable
   * Only present when the voice state is for a guild channel
   */
  guild_id?: Snowflake;

  /**
   * The channel ID this user is connected to
   * Will be null if the user is not connected to a voice channel
   */
  channel_id: Snowflake | null;

  /**
   * The user ID this voice state is for
   * Identifies which user this voice state belongs to
   */
  user_id: Snowflake;

  /**
   * The guild member this voice state is for, if applicable
   * Contains additional information about the user in the context of the guild
   * Only present when the voice state is for a guild channel
   */
  member?: GuildMemberEntity;

  /**
   * The session ID for this voice state
   * A unique identifier for this specific voice connection
   * Used internally for voice connection management
   */
  session_id: string;

  /**
   * Whether this user is deafened by the server
   * When true, the user cannot hear anyone and others cannot hear them
   * This is enforced by the server and requires the DEAFEN_MEMBERS permission to change
   */
  deaf: boolean;

  /**
   * Whether this user is muted by the server
   * When true, others cannot hear the user but they can hear others
   * This is enforced by the server and requires the MUTE_MEMBERS permission to change
   */
  mute: boolean;

  /**
   * Whether this user is locally deafened
   * When true, the user has chosen not to hear anyone
   * This is controlled by the user themselves and cannot be changed by others
   */
  self_deaf: boolean;

  /**
   * Whether this user is locally muted
   * When true, the user has chosen not to speak
   * This is controlled by the user themselves and cannot be changed by others
   */
  self_mute: boolean;

  /**
   * Whether this user is streaming using "Go Live"
   * Indicates if the user is sharing their screen in the voice channel
   */
  self_stream?: boolean;

  /**
   * Whether this user's camera is enabled
   * Indicates if the user has their video feed turned on
   */
  self_video: boolean;

  /**
   * Whether this user's permission to speak is denied
   * In stage channels, this indicates whether the user is a speaker (false) or audience (true)
   * Requires the MUTE_MEMBERS permission to change for other users
   */
  suppress: boolean;

  /**
   * The time at which the user requested to speak
   * Used in stage channels when audience members want to become speakers
   * Set to the current time when a user requests to speak, and null when cleared
   * Requires the REQUEST_TO_SPEAK permission to set for yourself
   */
  request_to_speak_timestamp: string | null;
}
