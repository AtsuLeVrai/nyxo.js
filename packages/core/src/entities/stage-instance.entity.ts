import type { Snowflake } from "../managers/index.js";

/**
 * Represents the privacy level options for a Stage instance.
 * The privacy level determines who can see and access the Stage.
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#stage-instance-object-privacy-level}
 */
export enum StageInstancePrivacyLevel {
  /**
   * The Stage instance is visible publicly (1)
   * This allowed the Stage to be discoverable in Stage Discovery.
   * @deprecated This privacy level is deprecated by Discord and should not be used.
   */
  Public = 1,

  /**
   * The Stage instance is visible to only guild members (2)
   * The Stage can only be accessed by members of the guild.
   * This is the default and currently only supported privacy level.
   */
  GuildOnly = 2,
}

/**
 * Represents a live Stage instance within a Stage channel.
 * A Stage instance holds information about a live stage and indicates that a Stage
 * channel is currently "live". When a Stage instance is created, the Stage channel
 * is considered live, and when the Stage instance is deleted, the Stage is no longer live.
 *
 * @remarks
 * - Stages require specific permissions to moderate: MANAGE_CHANNELS, MUTE_MEMBERS, and MOVE_MEMBERS.
 * - A Stage instance will be automatically deleted when there are no speakers for a certain period of time (on the order of minutes).
 * - Creating a Stage instance requires the user to be a moderator of the Stage channel.
 *
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#stage-instance-object}
 */
export interface StageInstanceEntity {
  /**
   * The ID of this Stage instance
   * Unique identifier for the Stage instance
   */
  id: Snowflake;

  /**
   * The guild ID of the associated Stage channel
   * Identifies which guild this Stage instance belongs to
   */
  guild_id: Snowflake;

  /**
   * The ID of the associated Stage channel
   * Points to the Stage channel where this instance is active
   */
  channel_id: Snowflake;

  /**
   * The topic of the Stage instance (1-120 characters)
   * This is the blurb shown below the channel's name and in other places
   * where the Stage is displayed
   * @minLength 1
   * @maxLength 120
   */
  topic: string;

  /**
   * The privacy level of the Stage instance
   * Determines who can access the Stage
   * Currently, only GuildOnly (2) is fully supported
   */
  privacy_level: StageInstancePrivacyLevel;

  /**
   * Whether or not Stage Discovery is disabled
   * Related to the deprecated PUBLIC privacy level
   * @deprecated This field is deprecated by Discord along with the PUBLIC privacy level
   */
  discoverable_disabled: boolean;

  /**
   * The ID of the scheduled event for this Stage instance, if any
   * If this Stage is associated with a guild scheduled event, this contains its ID
   * This allows linking a scheduled event to a Stage instance
   */
  guild_scheduled_event_id: Snowflake | null;
}
