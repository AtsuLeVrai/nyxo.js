/**
 * @description Privacy level options for Discord Stage instances determining visibility scope.
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#stage-instance-object-privacy-level}
 */
export enum StageInstancePrivacyLevel {
  /**
   * @description Stage instance is visible publicly (deprecated).
   */
  Public = 1,
  /**
   * @description Stage instance is visible to only guild members.
   */
  GuildOnly = 2,
}

/**
 * @description Represents a live Discord Stage instance with topic and privacy settings.
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#stage-instance-object-stage-instance-structure}
 */
export interface StageInstanceEntity {
  /**
   * @description Unique snowflake identifier for this Stage instance.
   */
  id: string;
  /**
   * @description Snowflake ID of the guild containing the associated Stage channel.
   */
  guild_id: string;
  /**
   * @description Snowflake ID of the associated Stage channel.
   */
  channel_id: string;
  /**
   * @description Topic of the Stage instance (1-120 characters).
   */
  topic: string;
  /**
   * @description Privacy level determining who can discover this Stage instance.
   */
  privacy_level: StageInstancePrivacyLevel;
  /**
   * @description Whether Stage Discovery is disabled (deprecated feature).
   */
  discoverable_disabled: boolean;
  /**
   * @description Snowflake ID of the scheduled event associated with this Stage instance.
   */
  guild_scheduled_event_id: string | null;
}
