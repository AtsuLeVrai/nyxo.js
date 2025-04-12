import type {
  GuildScheduledEventEntity,
  GuildScheduledEventEntityMetadataEntity,
  GuildScheduledEventPrivacyLevel,
  GuildScheduledEventRecurrenceRuleEntity,
  GuildScheduledEventStatus,
  GuildScheduledEventType,
  GuildScheduledEventUserEntity,
  Snowflake,
} from "@nyxjs/core";
import type { Rest } from "../core/index.js";
import { FileHandler, type FileInput } from "../handlers/index.js";

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
   */
  channel_id?: Snowflake;

  /**
   * Additional metadata for the guild scheduled event.
   * Required for events with entity_type EXTERNAL, must include location.
   * Must be null for events with entity_type STAGE_INSTANCE or VOICE.
   */
  entity_metadata?: GuildScheduledEventEntityMetadataEntity;

  /**
   * The name of the scheduled event (1-100 characters)
   */
  name: string;

  /** The privacy level of the scheduled event */
  privacy_level: GuildScheduledEventPrivacyLevel;

  /**
   * The time the scheduled event will start
   * Format: ISO8601 datetime
   */
  scheduled_start_time: string;

  /**
   * The time the scheduled event will end.
   * Required for events with entity_type EXTERNAL.
   * Format: ISO8601 datetime
   */
  scheduled_end_time?: string;

  /**
   * The description of the scheduled event (1-1000 characters)
   */
  description?: string;

  /** The type of the scheduled event */
  entity_type: GuildScheduledEventType;

  /**
   * The cover image of the scheduled event.
   * Accepts file input which will be transformed to a data URI.
   */
  image?: FileInput;

  /**
   * The definition for how often this event should recur
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
   * Defaults to 100 if not specified
   */
  limit?: number;

  /**
   * Whether to include guild member data if it exists
   * Defaults to false if not specified
   */
  with_member?: boolean;

  /**
   * Consider only users before given user id (for pagination)
   */
  before?: Snowflake;

  /**
   * Consider only users after given user id (for pagination)
   */
  after?: Snowflake;
}

/**
 * Router class for handling Discord Guild Scheduled Event endpoints.
 *
 * This class provides methods to interact with Discord's scheduled events API,
 * allowing applications to create, read, update, and delete scheduled events
 * in guilds, as well as retrieve users subscribed to events.
 */
export class ScheduledEventApi {
  /**
   * Collection of route patterns for scheduled event endpoints.
   */
  static readonly ROUTES = {
    /**
     * Route for guild scheduled events collection.
     * @param guildId - The ID of the guild
     * @returns The endpoint path
     */
    guildScheduledEvents: (guildId: Snowflake) =>
      `/guilds/${guildId}/scheduled-events` as const,

    /**
     * Route for a specific guild scheduled event.
     * @param guildId - The ID of the guild
     * @param eventId - The ID of the scheduled event
     * @returns The endpoint path
     */
    guildScheduledEvent: (guildId: Snowflake, eventId: Snowflake) =>
      `/guilds/${guildId}/scheduled-events/${eventId}` as const,

    /**
     * Route for users of a specific guild scheduled event.
     * @param guildId - The ID of the guild
     * @param eventId - The ID of the scheduled event
     * @returns The endpoint path
     */
    guildScheduledEventUsers: (guildId: Snowflake, eventId: Snowflake) =>
      `/guilds/${guildId}/scheduled-events/${eventId}/users` as const,
  } as const;

  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Lists all scheduled events for a guild.
   *
   * Retrieves a list of all scheduled events for the specified guild,
   * with an option to include the count of users subscribed to each event.
   *
   * @param guildId - The ID of the guild to list events for
   * @param withUserCount - Whether to include the user count for each event (default: false)
   * @returns A promise resolving to an array of guild scheduled event entities
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#list-scheduled-events-for-guild}
   */
  listScheduledEventsForGuild(
    guildId: Snowflake,
    withUserCount = false,
  ): Promise<GuildScheduledEventEntity[]> {
    return this.#rest.get(
      ScheduledEventApi.ROUTES.guildScheduledEvents(guildId),
      {
        query: { with_user_count: withUserCount },
      },
    );
  }

  /**
   * Creates a new scheduled event in a guild.
   *
   * Requirements vary based on entity type:
   * - For STAGE_INSTANCE and VOICE events: channel_id is required
   * - For EXTERNAL events: entity_metadata with location and scheduled_end_time are required
   *
   * A guild can have a maximum of 100 events with SCHEDULED or ACTIVE status at any time.
   *
   * @param guildId - The ID of the guild to create the event in
   * @param options - The event data to use for creation
   * @param reason - Optional audit log reason for the creation
   * @returns A promise resolving to the created guild scheduled event entity
   * @throws Error if the event data is invalid
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#create-guild-scheduled-event}
   */
  async createGuildScheduledEvent(
    guildId: Snowflake,
    options: CreateGuildScheduledEventSchema,
    reason?: string,
  ): Promise<GuildScheduledEventEntity> {
    if (options.image) {
      options.image = await FileHandler.toDataUri(options.image);
    }

    return this.#rest.post(
      ScheduledEventApi.ROUTES.guildScheduledEvents(guildId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Retrieves a specific scheduled event from a guild.
   *
   * @param guildId - The ID of the guild the event belongs to
   * @param eventId - The ID of the scheduled event to retrieve
   * @param withUserCount - Whether to include the count of users subscribed to the event (default: false)
   * @returns A promise resolving to the guild scheduled event entity
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event}
   */
  getGuildScheduledEvent(
    guildId: Snowflake,
    eventId: Snowflake,
    withUserCount = false,
  ): Promise<GuildScheduledEventEntity> {
    return this.#rest.get(
      ScheduledEventApi.ROUTES.guildScheduledEvent(guildId, eventId),
      {
        query: { with_user_count: withUserCount },
      },
    );
  }

  /**
   * Modifies an existing scheduled event in a guild.
   *
   * All fields are optional. Special considerations:
   * - To start or end an event, modify the status field
   * - If updating entity_type to EXTERNAL:
   *   - channel_id must be set to null
   *   - entity_metadata with location field must be provided
   *   - scheduled_end_time must be provided
   *
   * @param guildId - The ID of the guild the event belongs to
   * @param eventId - The ID of the scheduled event to modify
   * @param options - The modifications to apply to the event
   * @param reason - Optional audit log reason for the modification
   * @returns A promise resolving to the modified guild scheduled event entity
   * @throws Error if the modification data is invalid
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#modify-guild-scheduled-event}
   */
  async modifyGuildScheduledEvent(
    guildId: Snowflake,
    eventId: Snowflake,
    options: ModifyGuildScheduledEventSchema,
    reason?: string,
  ): Promise<GuildScheduledEventEntity> {
    if (options.image) {
      options.image = await FileHandler.toDataUri(options.image);
    }

    return this.#rest.patch(
      ScheduledEventApi.ROUTES.guildScheduledEvent(guildId, eventId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Deletes a scheduled event from a guild.
   *
   * @param guildId - The ID of the guild the event belongs to
   * @param eventId - The ID of the scheduled event to delete
   * @returns A promise resolving when the deletion is complete
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#delete-guild-scheduled-event}
   */
  deleteGuildScheduledEvent(
    guildId: Snowflake,
    eventId: Snowflake,
  ): Promise<void> {
    return this.#rest.delete(
      ScheduledEventApi.ROUTES.guildScheduledEvent(guildId, eventId),
    );
  }

  /**
   * Retrieves users subscribed to a scheduled event in a guild.
   *
   * Supports pagination via before/after parameters. Users are returned in
   * ascending order by user_id. If both before and after are provided,
   * only before is respected.
   *
   * @param guildId - The ID of the guild the event belongs to
   * @param eventId - The ID of the scheduled event to get users for
   * @param query - Query parameters for pagination and inclusion of member data
   * @returns A promise resolving to an array of guild scheduled event user entities
   * @throws Error if the query parameters are invalid
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event-users}
   */
  getGuildScheduledEventUsers(
    guildId: Snowflake,
    eventId: Snowflake,
    query: GetGuildScheduledEventUsersQuerySchema = {},
  ): Promise<GuildScheduledEventUserEntity[]> {
    return this.#rest.get(
      ScheduledEventApi.ROUTES.guildScheduledEventUsers(guildId, eventId),
      {
        query,
      },
    );
  }
}
