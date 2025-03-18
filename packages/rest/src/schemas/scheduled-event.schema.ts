import {
  GuildScheduledEventEntityMetadataEntity,
  GuildScheduledEventPrivacyLevel,
  GuildScheduledEventRecurrenceRuleEntity,
  GuildScheduledEventStatus,
  GuildScheduledEventType,
  Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { FileHandler, type FileInput } from "../handlers/index.js";

/**
 * Schema for creating a guild scheduled event.
 *
 * This schema defines the structure of the request body when creating a new scheduled event in a guild.
 * Different fields are required based on the entity_type:
 * - For STAGE_INSTANCE and VOICE events, channel_id is required and entity_metadata must be null
 * - For EXTERNAL events, channel_id must be null, entity_metadata with location is required, and scheduled_end_time is required
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#create-guild-scheduled-event-json-params}
 */
export const CreateGuildScheduledEventSchema = z.object({
  /**
   * The channel ID in which the scheduled event will be hosted.
   * Required for events with entity_type STAGE_INSTANCE or VOICE.
   * Must be null for events with entity_type EXTERNAL.
   */
  channel_id: Snowflake.optional(),

  /**
   * Additional metadata for the guild scheduled event.
   * Required for events with entity_type EXTERNAL, must include location.
   * Must be null for events with entity_type STAGE_INSTANCE or VOICE.
   */
  entity_metadata: GuildScheduledEventEntityMetadataEntity.optional(),

  /** The name of the scheduled event (1-100 characters) */
  name: z.string().min(1).max(100),

  /** The privacy level of the scheduled event */
  privacy_level: z.nativeEnum(GuildScheduledEventPrivacyLevel),

  /** The time the scheduled event will start */
  scheduled_start_time: z.string().datetime(),

  /**
   * The time the scheduled event will end.
   * Required for events with entity_type EXTERNAL.
   */
  scheduled_end_time: z.string().datetime().optional(),

  /** The description of the scheduled event (1-1000 characters) */
  description: z.string().min(1).max(1000).optional(),

  /** The type of the scheduled event */
  entity_type: z.nativeEnum(GuildScheduledEventType),

  /**
   * The cover image of the scheduled event.
   * Accepts file input which will be transformed to a data URI.
   */
  image: z
    .custom<FileInput>(FileHandler.isValidSingleInput)
    .transform(FileHandler.toDataUri)
    .optional(),

  /** The definition for how often this event should recur */
  recurrence_rule: GuildScheduledEventRecurrenceRuleEntity.optional(),
});

export type CreateGuildScheduledEventSchema = z.input<
  typeof CreateGuildScheduledEventSchema
>;

/**
 * Schema for modifying a guild scheduled event.
 *
 * This schema extends the CreateGuildScheduledEventSchema and makes all fields optional.
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
export const ModifyGuildScheduledEventSchema =
  CreateGuildScheduledEventSchema.partial().extend({
    /**
     * The status of the scheduled event.
     * Can be used to start, complete, or cancel an event.
     * Once status is set to COMPLETED or CANCELED, it can no longer be updated.
     */
    status: z.nativeEnum(GuildScheduledEventStatus).optional(),
  });

export type ModifyGuildScheduledEventSchema = z.input<
  typeof ModifyGuildScheduledEventSchema
>;

/**
 * Schema for query parameters when retrieving guild scheduled event users.
 *
 * These parameters control pagination and whether to include member data when
 * fetching users subscribed to a scheduled event.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event-users-query-string-params}
 */
export const GetGuildScheduledEventUsersQuerySchema = z.object({
  /** Number of users to return (up to maximum 100) */
  limit: z.number().max(100).default(100),

  /** Whether to include guild member data if it exists */
  with_member: z.boolean().default(false),

  /** Consider only users before given user id (for pagination) */
  before: Snowflake.optional(),

  /** Consider only users after given user id (for pagination) */
  after: Snowflake.optional(),
});

export type GetGuildScheduledEventUsersQuerySchema = z.input<
  typeof GetGuildScheduledEventUsersQuerySchema
>;
