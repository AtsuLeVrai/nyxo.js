import type { Snowflake, StageInstancePrivacyLevel } from "@nyxjs/core";

/**
 * Interface for creating a new Stage instance.
 *
 * A Stage instance holds information about a live stage in a Stage channel.
 * Creating a Stage instance requires the user to be a moderator of the Stage channel,
 * which means having the MANAGE_CHANNELS, MUTE_MEMBERS, and MOVE_MEMBERS permissions.
 *
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#create-stage-instance-json-params}
 */
export interface CreateStageInstanceSchema {
  /**
   * The ID of the Stage channel.
   */
  channel_id: Snowflake;

  /**
   * The topic of the Stage instance (1-120 characters).
   * This is the blurb that gets shown below the channel's name, among other places.
   *
   * @minLength 1
   * @maxLength 120
   */
  topic: string;

  /**
   * The privacy level of the Stage instance.
   * Defaults to GUILD_ONLY (2) if not specified.
   *
   * @default StageInstancePrivacyLevel.GuildOnly
   */
  privacy_level?: StageInstancePrivacyLevel;

  /**
   * Whether to notify @everyone that a Stage instance has started.
   * The stage moderator must have the MENTION_EVERYONE permission for this notification to be sent.
   *
   * @optional
   */
  send_start_notification?: boolean;

  /**
   * The ID of the scheduled event associated with this Stage instance, if any.
   *
   * @optional
   * @nullable
   */
  guild_scheduled_event_id?: Snowflake | null;
}

/**
 * Interface for modifying an existing Stage instance.
 *
 * Updating a Stage instance requires the user to be a moderator of the Stage channel,
 * which means having the MANAGE_CHANNELS, MUTE_MEMBERS, and MOVE_MEMBERS permissions.
 *
 * All fields are optional, allowing partial updates to the Stage instance.
 *
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance-json-params}
 */
export interface ModifyStageInstanceSchema {
  /**
   * The topic of the Stage instance (1-120 characters).
   *
   * @minLength 1
   * @maxLength 120
   * @optional
   */
  topic?: string;

  /**
   * The privacy level of the Stage instance.
   *
   * @optional
   */
  privacy_level?: StageInstancePrivacyLevel;
}
