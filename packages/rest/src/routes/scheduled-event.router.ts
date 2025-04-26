import type {
  GuildScheduledEventEntity,
  GuildScheduledEventEntityMetadata,
  GuildScheduledEventPrivacyLevel,
  GuildScheduledEventRecurrenceRuleEntity,
  GuildScheduledEventStatus,
  GuildScheduledEventType,
  GuildScheduledEventUserEntity,
  Snowflake,
} from "@nyxojs/core";
import { BaseRouter } from "../bases/index.js";
import type { FileInput } from "../handlers/index.js";

/**
 * Interface for creating a guild scheduled event.
 * Defines structure for events held in voice/stage channels or external locations.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#create-guild-scheduled-event-json-params}
 */
export interface EventCreateOptions {
  /**
   * The channel ID in which the scheduled event will be hosted.
   * Required for STAGE_INSTANCE or VOICE events, null for EXTERNAL events.
   */
  channel_id?: Snowflake;

  /**
   * Additional metadata for the guild scheduled event.
   * Required for EXTERNAL events (must include location field).
   */
  entity_metadata?: GuildScheduledEventEntityMetadata;

  /**
   * The name of the scheduled event (1-100 characters).
   * Title displayed for the event in Discord.
   */
  name: string;

  /**
   * The privacy level of the scheduled event.
   * Currently, GUILD_ONLY (2) is the only supported value.
   */
  privacy_level: GuildScheduledEventPrivacyLevel;

  /**
   * The time the scheduled event will start.
   * Must be a valid ISO8601 datetime string in the future.
   */
  scheduled_start_time: string;

  /**
   * The time the scheduled event will end.
   * Required for EXTERNAL events, must be after start time.
   */
  scheduled_end_time?: string;

  /**
   * The description of the scheduled event (1-1000 characters).
   * Provides additional details about the event.
   */
  description?: string;

  /**
   * The type of the scheduled event.
   * Controls where the event takes place (stage, voice or external).
   */
  entity_type: GuildScheduledEventType;

  /**
   * The cover image of the scheduled event.
   * Displays as a banner for the event in Discord.
   */
  image?: FileInput;

  /**
   * The definition for how often this event should recur.
   * Creates a recurring event series rather than a one-time event.
   */
  recurrence_rule?: GuildScheduledEventRecurrenceRuleEntity;
}

/**
 * Interface for modifying a guild scheduled event.
 * Makes all fields optional and adds status field for changing event state.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#modify-guild-scheduled-event-json-params}
 */
export interface EventUpdateOptions extends Partial<EventCreateOptions> {
  /**
   * The status of the scheduled event.
   * Used to start, complete, or cancel an event.
   */
  status?: GuildScheduledEventStatus;
}

/**
 * Interface for query parameters when retrieving guild scheduled event users.
 * Controls pagination and member data inclusion.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event-users-query-string-params}
 */
export interface EventUsersFetchParams {
  /**
   * Number of users to return (up to maximum 100).
   * Controls pagination page size, defaults to 100.
   */
  limit?: number;

  /**
   * Whether to include guild member data if it exists.
   * When true, includes guild-specific user information.
   */
  with_member?: boolean;

  /**
   * Consider only users before given user id.
   * Returns users with IDs less than this value.
   */
  before?: Snowflake;

  /**
   * Consider only users after given user id.
   * Returns users with IDs greater than this value.
   */
  after?: Snowflake;
}

/**
 * Router for Discord Guild Scheduled Event endpoints.
 * Manages creation and management of guild events and their attendees.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event}
 */
export class ScheduledEventRouter extends BaseRouter {
  /**
   * API route constants for scheduled event endpoints.
   */
  static readonly EVENT_ROUTES = {
    /**
     * Route for guild scheduled events collection.
     * @param guildId - The ID of the guild
     */
    guildEventsEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/scheduled-events` as const,

    /**
     * Route for a specific guild scheduled event.
     * @param guildId - The ID of the guild
     * @param eventId - The ID of the scheduled event
     */
    guildEventByIdEndpoint: (guildId: Snowflake, eventId: Snowflake) =>
      `/guilds/${guildId}/scheduled-events/${eventId}` as const,

    /**
     * Route for users of a specific guild scheduled event.
     * @param guildId - The ID of the guild
     * @param eventId - The ID of the scheduled event
     */
    eventUsersEndpoint: (guildId: Snowflake, eventId: Snowflake) =>
      `/guilds/${guildId}/scheduled-events/${eventId}/users` as const,
  } as const;

  /**
   * Fetches all scheduled events for a guild.
   * Retrieves events with option to include subscriber counts.
   *
   * @param guildId - The ID of the guild to list events for
   * @param withUserCount - Whether to include the user count for each event
   * @returns A promise resolving to an array of guild scheduled event entities
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#list-scheduled-events-for-guild}
   */
  fetchEvents(
    guildId: Snowflake,
    withUserCount = false,
  ): Promise<GuildScheduledEventEntity[]> {
    return this.get(
      ScheduledEventRouter.EVENT_ROUTES.guildEventsEndpoint(guildId),
      {
        query: { with_user_count: withUserCount },
      },
    );
  }

  /**
   * Creates a new scheduled event in a guild.
   * Requires the MANAGE_EVENTS permission.
   *
   * @param guildId - The ID of the guild to create the event in
   * @param options - The event data to use for creation
   * @param reason - Optional audit log reason for the creation
   * @returns A promise resolving to the created guild scheduled event entity
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#create-guild-scheduled-event}
   */
  async createEvent(
    guildId: Snowflake,
    options: EventCreateOptions,
    reason?: string,
  ): Promise<GuildScheduledEventEntity> {
    const fileFields: (keyof EventCreateOptions)[] = ["image"];
    const processedOptions = await this.prepareBodyWithFiles(
      options,
      fileFields,
    );

    return this.post(
      ScheduledEventRouter.EVENT_ROUTES.guildEventsEndpoint(guildId),
      processedOptions,
      { reason },
    );
  }

  /**
   * Fetches a specific scheduled event from a guild.
   * Retrieves detailed information about a single event.
   *
   * @param guildId - The ID of the guild the event belongs to
   * @param eventId - The ID of the scheduled event to retrieve
   * @param withUserCount - Whether to include subscriber count
   * @returns A promise resolving to the guild scheduled event entity
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event}
   */
  fetchGuildEvent(
    guildId: Snowflake,
    eventId: Snowflake,
    withUserCount = false,
  ): Promise<GuildScheduledEventEntity> {
    return this.get(
      ScheduledEventRouter.EVENT_ROUTES.guildEventByIdEndpoint(
        guildId,
        eventId,
      ),
      {
        query: { with_user_count: withUserCount },
      },
    );
  }

  /**
   * Updates an existing scheduled event in a guild.
   * Modifies event details, timing, location, or status.
   *
   * @param guildId - The ID of the guild the event belongs to
   * @param eventId - The ID of the scheduled event to modify
   * @param options - The modifications to apply to the event
   * @param reason - Optional audit log reason for the modification
   * @returns A promise resolving to the modified guild scheduled event entity
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#modify-guild-scheduled-event}
   */
  async updateEvent(
    guildId: Snowflake,
    eventId: Snowflake,
    options: EventUpdateOptions,
    reason?: string,
  ): Promise<GuildScheduledEventEntity> {
    const fileFields: (keyof EventUpdateOptions)[] = ["image"];
    const processedOptions = await this.prepareBodyWithFiles(
      options,
      fileFields,
    );

    return this.patch(
      ScheduledEventRouter.EVENT_ROUTES.guildEventByIdEndpoint(
        guildId,
        eventId,
      ),
      processedOptions,
      { reason },
    );
  }

  /**
   * Deletes a scheduled event from a guild.
   * Permanently removes an event from the guild.
   *
   * @param guildId - The ID of the guild the event belongs to
   * @param eventId - The ID of the scheduled event to delete
   * @returns A promise resolving when the deletion is complete
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#delete-guild-scheduled-event}
   */
  deleteEvent(guildId: Snowflake, eventId: Snowflake): Promise<void> {
    return this.delete(
      ScheduledEventRouter.EVENT_ROUTES.guildEventByIdEndpoint(
        guildId,
        eventId,
      ),
    );
  }

  /**
   * Fetches users who are interested in a scheduled event.
   * Supports pagination and optional inclusion of guild member data.
   *
   * @param guildId - The ID of the guild the event belongs to
   * @param eventId - The ID of the scheduled event to get users for
   * @param query - Query parameters for pagination and member data
   * @returns A promise resolving to an array of guild scheduled event user entities
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event-users}
   */
  fetchEventUsers(
    guildId: Snowflake,
    eventId: Snowflake,
    query?: EventUsersFetchParams,
  ): Promise<GuildScheduledEventUserEntity[]> {
    return this.get(
      ScheduledEventRouter.EVENT_ROUTES.eventUsersEndpoint(guildId, eventId),
      { query },
    );
  }
}
