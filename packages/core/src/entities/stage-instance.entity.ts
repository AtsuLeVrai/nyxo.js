import type { Snowflake } from "../utils/index.js";

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
   * The ID of the Stage instance.
   * Unique identifier for this live stage.
   */
  id: Snowflake;

  /**
   * The guild ID of the associated Stage channel.
   * The server where this stage is taking place.
   */
  guild_id: Snowflake;

  /**
   * The ID of the associated Stage channel.
   * The channel that has been converted to a stage.
   */
  channel_id: Snowflake;

  /**
   * The topic of the Stage instance (1-120 characters).
   * Describes what the stage is about.
   */
  topic: string;

  /**
   * The privacy level of the Stage instance.
   * Controls who can see and access this Stage.
   * Currently, GuildOnly is the only supported privacy level.
   */
  privacy_level: StageInstancePrivacyLevel;

  /**
   * Whether or not Stage Discovery is disabled.
   * If true, the Stage is not discoverable through Stage Discovery.
   */
  discoverable_disabled: boolean;

  /**
   * The ID of the scheduled event for this Stage instance.
   * Links a scheduled event to this Stage instance, if applicable.
   */
  guild_scheduled_event_id: Snowflake | null;
}
