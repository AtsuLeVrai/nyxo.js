import type {
  GuildScheduledEventEntityMetadataEntity,
  GuildScheduledEventPrivacyLevel,
  GuildScheduledEventRecurrenceRuleEntity,
  GuildScheduledEventStatus,
  GuildScheduledEventType,
  Snowflake,
} from "@nyxjs/core";
import type { FileInput } from "../handlers/index.js";

/**
 * Interface for creating a guild scheduled event.
 *
 * This interface defines the structure of the request body when creating a new scheduled event in a guild.
 * Different fields are required based on the entity_type:
 * - For STAGE_INSTANCE and VOICE events, channel_id is required and entity_metadata must be null
 * - For EXTERNAL events, channel_id must be null, entity_metadata with location is required, and scheduled_end_time is required
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#create-guild-scheduled-event-json-params}
 */
export interface CreateGuildScheduledEventSchema {
  /**
   * The channel ID in which the scheduled event will be hosted.
   * Required for events with entity_type STAGE_INSTANCE or VOICE.
   * Must be null for events with entity_type EXTERNAL.
   *
   * @optional
   */
  channel_id?: Snowflake;

  /**
   * Additional metadata for the guild scheduled event.
   * Required for events with entity_type EXTERNAL, must include location.
   * Must be null for events with entity_type STAGE_INSTANCE or VOICE.
   *
   * @optional
   */
  entity_metadata?: GuildScheduledEventEntityMetadataEntity;

  /**
   * The name of the scheduled event (1-100 characters)
   *
   * @minLength 1
   * @maxLength 100
   */
  name: string;

  /** The privacy level of the scheduled event */
  privacy_level: GuildScheduledEventPrivacyLevel;

  /**
   * The time the scheduled event will start
   *
   * @format datetime
   */
  scheduled_start_time: string;

  /**
   * The time the scheduled event will end.
   * Required for events with entity_type EXTERNAL.
   *
   * @format datetime
   * @optional
   */
  scheduled_end_time?: string;

  /**
   * The description of the scheduled event (1-1000 characters)
   *
   * @minLength 1
   * @maxLength 1000
   * @optional
   */
  description?: string;

  /** The type of the scheduled event */
  entity_type: GuildScheduledEventType;

  /**
   * The cover image of the scheduled event.
   * Accepts file input which will be transformed to a data URI.
   *
   * @transform Converted to data URI using FileHandler.toDataUri
   * @optional
   */
  image?: FileInput;

  /**
   * The definition for how often this event should recur
   *
   * @optional
   */
  recurrence_rule?: GuildScheduledEventRecurrenceRuleEntity;
}

/**
 * Interface for modifying a guild scheduled event.
 *
 * This interface extends the CreateGuildScheduledEventSchema and makes all fields optional.
 * It also adds the status field to allow changing the event status.
 *
 * Special considerations for modifying entities:
 * - If updating entity_type to EXTERNAL:
 *   - channel_id must be set to null
 *   - entity_metadata with location field must be provided
 *   - scheduled_end_time must be provided
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#modify-guild-scheduled-event-json-params}
 */
export interface ModifyGuildScheduledEventSchema
  extends Partial<CreateGuildScheduledEventSchema> {
  /**
   * The status of the scheduled event.
   * Can be used to start, complete, or cancel an event.
   * Once status is set to COMPLETED or CANCELED, it can no longer be updated.
   *
   * @optional
   */
  status?: GuildScheduledEventStatus;
}

/**
 * Interface for query parameters when retrieving guild scheduled event users.
 *
 * These parameters control pagination and whether to include member data when
 * fetching users subscribed to a scheduled event.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event-users-query-string-params}
 */
export interface GetGuildScheduledEventUsersQuerySchema {
  /**
   * Number of users to return (up to maximum 100)
   *
   * @maximum 100
   * @default 100
   */
  limit?: number;

  /**
   * Whether to include guild member data if it exists
   *
   * @default false
   */
  with_member?: boolean;

  /**
   * Consider only users before given user id (for pagination)
   *
   * @optional
   */
  before?: Snowflake;

  /**
   * Consider only users after given user id (for pagination)
   *
   * @optional
   */
  after?: Snowflake;
}
