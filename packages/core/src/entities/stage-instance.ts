import type { Snowflake } from "../utils/index.js";

/**
 * Represents the privacy level of a Stage instance.
 *
 * @remarks
 * Defines who can view and access the Stage instance.
 *
 * @example
 * ```typescript
 * const privacyLevel: StageInstancePrivacyLevel = StageInstancePrivacyLevel.GuildOnly;
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#stage-instance-object-privacy-level}
 */
export enum StageInstancePrivacyLevel {
  /** Stage instance is visible publicly (deprecated) */
  Public = 1,
  /** Stage instance is visible to only guild members */
  GuildOnly = 2,
}

/**
 * Represents a Stage instance in Discord.
 *
 * @remarks
 * A Stage instance holds information about a live stage channel, including its topic,
 * privacy settings, and associated guild information.
 *
 * @example
 * ```typescript
 * const stageInstance: StageInstanceEntity = {
 *   id: "840647391636226060",
 *   guild_id: "197038439483310086",
 *   channel_id: "733488538393510049",
 *   topic: "Testing Testing, 123",
 *   privacy_level: StageInstancePrivacyLevel.GuildOnly,
 *   discoverable_disabled: false,
 *   guild_scheduled_event_id: "947656305244532806"
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#stage-instance-object-stage-instance-structure}
 */
export interface StageInstanceEntity {
  /** Unique identifier of the Stage instance */
  id: Snowflake;
  /** ID of the guild this Stage instance belongs to */
  guild_id: Snowflake;
  /** ID of the associated Stage channel */
  channel_id: Snowflake;
  /** Topic of the Stage instance (1-120 characters) */
  topic: string;
  /** Privacy level of the Stage instance */
  privacy_level: StageInstancePrivacyLevel;
  /** Whether Stage Discovery is disabled (deprecated) */
  discoverable_disabled: boolean;
  /** ID of the scheduled event for this Stage instance */
  guild_scheduled_event_id: Snowflake | null;
}
