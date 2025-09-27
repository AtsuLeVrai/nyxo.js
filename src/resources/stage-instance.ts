import type { SetNonNullable } from "../utils/index.js";

/**
 * Privacy levels that control visibility and discovery of Stage instances.
 * Determines who can view and participate in live Stage channel events.
 *
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#stage-instance-object-privacy-level} for privacy level specification
 */
export enum PrivacyLevel {
  /** Stage instance is visible publicly (deprecated, no longer recommended) */
  Public = 1,
  /** Stage instance is visible only to guild members */
  GuildOnly = 2,
}

/**
 * Live Stage instance containing information about an active Stage channel event.
 * Represents ongoing presentations, discussions, or performances in Stage channels.
 *
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#stage-instance-object} for stage instance specification
 */
export interface StageInstanceObject {
  /** Unique identifier for this Stage instance */
  readonly id: string;
  /** Guild containing the Stage channel */
  readonly guild_id: string;
  /** Stage channel where this instance is active */
  readonly channel_id: string;
  /** Topic or title of the Stage instance (1-120 characters) */
  readonly topic: string;
  /** Privacy level controlling instance visibility */
  readonly privacy_level: PrivacyLevel;
  /** Whether Stage Discovery is disabled (deprecated feature) */
  readonly discoverable_disabled: boolean;
  /** Associated scheduled event ID if created from an event */
  readonly guild_scheduled_event_id: string | null;
}

/**
 * Parameters for creating a new Stage instance on a Stage channel.
 * Requires moderator permissions and supports optional notification settings.
 *
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#create-stage-instance} for create stage instance endpoint
 */
export interface CreateStageInstanceJSONParams
  extends Pick<StageInstanceObject, "channel_id" | "topic">,
    Partial<
      SetNonNullable<Pick<StageInstanceObject, "privacy_level" | "guild_scheduled_event_id">>
    > {
  /** Whether to notify @everyone that Stage instance has started (requires MENTION_EVERYONE permission) */
  readonly send_start_notification?: boolean;
}

/**
 * Parameters for modifying an existing Stage instance.
 * Supports partial updates to topic and privacy level only.
 *
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance} for modify stage instance endpoint
 */
export type ModifyStageInstanceJSONParams = Partial<
  Pick<CreateStageInstanceJSONParams, "topic" | "privacy_level">
>;
