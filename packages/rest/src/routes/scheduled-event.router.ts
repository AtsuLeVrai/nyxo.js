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
import type { Rest } from "../core/index.js";
import { FileHandler, type FileInput } from "../handlers/index.js";

/**
 * Interface for creating a guild scheduled event.
 *
 * This interface defines the structure for creating a new event in a guild,
 * which can be held in a voice/stage channel or at an external location.
 *
 * @remarks
 * Different fields are required based on the entity_type:
 * - For STAGE_INSTANCE and VOICE events, channel_id is required and entity_metadata must be null
 * - For EXTERNAL events, channel_id must be null, entity_metadata with location is required, and scheduled_end_time is required
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#create-guild-scheduled-event-json-params}
 */
export interface EventCreateOptions {
  /**
   * The channel ID in which the scheduled event will be hosted.
   *
   * Required for events with entity_type STAGE_INSTANCE or VOICE.
   * Must be null for events with entity_type EXTERNAL.
   * The channel must be a voice or stage channel in the guild.
   */
  channel_id?: Snowflake;

  /**
   * Additional metadata for the guild scheduled event.
   *
   * Required for events with entity_type EXTERNAL, must include location field.
   * Must be null for events with entity_type STAGE_INSTANCE or VOICE.
   * The location field has a max length of 100 characters.
   */
  entity_metadata?: GuildScheduledEventEntityMetadata;

  /**
   * The name of the scheduled event (1-100 characters).
   *
   * This is the title displayed for the event in the Discord UI.
   */
  name: string;

  /**
   * The privacy level of the scheduled event.
   *
   * Controls who can see and join the event.
   * Currently, GUILD_ONLY (2) is the only supported value.
   */
  privacy_level: GuildScheduledEventPrivacyLevel;

  /**
   * The time the scheduled event will start.
   *
   * Must be a valid ISO8601 datetime string.
   * Must be in the future.
   */
  scheduled_start_time: string;

  /**
   * The time the scheduled event will end.
   *
   * Required for events with entity_type EXTERNAL.
   * Must be a valid ISO8601 datetime string.
   * Must be after the scheduled_start_time.
   */
  scheduled_end_time?: string;

  /**
   * The description of the scheduled event (1-1000 characters).
   *
   * Provides additional details about the event, displayed in the event page.
   */
  description?: string;

  /**
   * The type of the scheduled event.
   *
   * Controls where the event takes place:
   * - 1: STAGE_INSTANCE - In a stage channel
   * - 2: VOICE - In a voice channel
   * - 3: EXTERNAL - At an external location
   */
  entity_type: GuildScheduledEventType;

  /**
   * The cover image of the scheduled event.
   *
   * Displays as a banner for the event in the Discord UI.
   * Accepts file input which will be transformed to a data URI.
   * Recommended aspect ratio is 16:9.
   */
  image?: FileInput;

  /**
   * The definition for how often this event should recur.
   *
   * When provided, creates a recurring event series rather than a one-time event.
   * Specifies frequency, interval, and other recurrence properties.
   */
  recurrence_rule?: GuildScheduledEventRecurrenceRuleEntity;
}

/**
 * Interface for modifying a guild scheduled event.
 *
 * This interface extends the EventCreateOptions and makes all fields optional.
 * It also adds the status field to allow changing the event status.
 *
 * @remarks
 * Special considerations for modifying entities:
 * - If updating entity_type to EXTERNAL:
 *   - channel_id must be set to null
 *   - entity_metadata with location field must be provided
 *   - scheduled_end_time must be provided
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#modify-guild-scheduled-event-json-params}
 */
export interface EventUpdateOptions extends Partial<EventCreateOptions> {
  /**
   * The status of the scheduled event.
   *
   * Can be used to start, complete, or cancel an event:
   * - 1: SCHEDULED - Default status, event is not yet started
   * - 2: ACTIVE - Event has started
   * - 3: COMPLETED - Event has ended
   * - 4: CANCELED - Event was canceled
   *
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
export interface EventUsersFetchParams {
  /**
   * Number of users to return (up to maximum 100).
   *
   * Controls the page size for pagination.
   * Defaults to 100 if not specified.
   */
  limit?: number;

  /**
   * Whether to include guild member data if it exists.
   *
   * When true, each user object will include a member object with
   * guild-specific information about the user.
   * Defaults to false if not specified.
   */
  with_member?: boolean;

  /**
   * Consider only users before given user id (for pagination).
   *
   * Returns users with IDs less than this value.
   * Used for backward pagination (newer users).
   */
  before?: Snowflake;

  /**
   * Consider only users after given user id (for pagination).
   *
   * Returns users with IDs greater than this value.
   * Used for forward pagination (older users).
   */
  after?: Snowflake;
}

/**
 * Router for Discord Guild Scheduled Event endpoints.
 *
 * This class provides methods to interact with Discord's scheduled events system,
 * allowing creation, management, and deletion of guild events, as well as retrieving
 * information about the users interested in those events.
 *
 * @remarks
 * Guild scheduled events are a way for guilds to organize and schedule activities,
 * like voice chats, stage channels, or external events. They appear in a dedicated
 * events tab in the Discord UI and users can express interest in them by subscribing.
 *
 * Events can be held in the following locations:
 * - Voice channels within the guild
 * - Stage channels within the guild
 * - External locations outside of Discord
 *
 * A guild can have a maximum of 100 events with SCHEDULED or ACTIVE status at any time.
 */
export class ScheduledEventRouter {
  /**
   * API route constants for scheduled event endpoints.
   */
  static readonly EVENT_ROUTES = {
    /**
     * Route for guild scheduled events collection.
     *
     * Used for listing or creating events in a guild.
     *
     * @param guildId - The ID of the guild
     * @returns The formatted API route string
     */
    guildEventsEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/scheduled-events` as const,

    /**
     * Route for a specific guild scheduled event.
     *
     * Used for getting, updating, or deleting a specific event.
     *
     * @param guildId - The ID of the guild
     * @param eventId - The ID of the scheduled event
     * @returns The formatted API route string
     */
    guildEventByIdEndpoint: (guildId: Snowflake, eventId: Snowflake) =>
      `/guilds/${guildId}/scheduled-events/${eventId}` as const,

    /**
     * Route for users of a specific guild scheduled event.
     *
     * Used for listing users who are interested in an event.
     *
     * @param guildId - The ID of the guild
     * @param eventId - The ID of the scheduled event
     * @returns The formatted API route string
     */
    eventUsersEndpoint: (guildId: Snowflake, eventId: Snowflake) =>
      `/guilds/${guildId}/scheduled-events/${eventId}/users` as const,
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new Scheduled Event Router instance.
   *
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches all scheduled events for a guild.
   *
   * This method retrieves a list of all scheduled events in the specified guild,
   * with an option to include the count of users subscribed to each event.
   *
   * @param guildId - The ID of the guild to list events for
   * @param withUserCount - Whether to include the user count for each event (default: false)
   * @returns A promise resolving to an array of guild scheduled event entities
   *
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#list-scheduled-events-for-guild}
   */
  fetchEvents(
    guildId: Snowflake,
    withUserCount = false,
  ): Promise<GuildScheduledEventEntity[]> {
    return this.#rest.get(
      ScheduledEventRouter.EVENT_ROUTES.guildEventsEndpoint(guildId),
      {
        query: { with_user_count: withUserCount },
      },
    );
  }

  /**
   * Creates a new scheduled event in a guild.
   *
   * This method creates a new event in the specified guild, which can be
   * hosted in a voice channel, stage channel, or at an external location.
   *
   * @param guildId - The ID of the guild to create the event in
   * @param options - The event data to use for creation
   * @param reason - Optional audit log reason for the creation
   * @returns A promise resolving to the created guild scheduled event entity
   * @throws {Error} Error if the event data is invalid
   *
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#create-guild-scheduled-event}
   *
   * @remarks
   * Requirements vary based on entity type:
   * - For STAGE_INSTANCE and VOICE events: channel_id is required
   * - For EXTERNAL events: entity_metadata with location and scheduled_end_time are required
   *
   * A guild can have a maximum of 100 events with SCHEDULED or ACTIVE status at any time.
   */
  async createEvent(
    guildId: Snowflake,
    options: EventCreateOptions,
    reason?: string,
  ): Promise<GuildScheduledEventEntity> {
    if (options.image) {
      options.image = await FileHandler.toDataUri(options.image);
    }

    return this.#rest.post(
      ScheduledEventRouter.EVENT_ROUTES.guildEventsEndpoint(guildId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Fetches a specific scheduled event from a guild.
   *
   * This method retrieves detailed information about a single scheduled event
   * in the specified guild, with an option to include the user count.
   *
   * @param guildId - The ID of the guild the event belongs to
   * @param eventId - The ID of the scheduled event to retrieve
   * @param withUserCount - Whether to include the count of users subscribed to the event (default: false)
   * @returns A promise resolving to the guild scheduled event entity
   * @throws {Error} Will throw an error if the event doesn't exist
   *
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event}
   */
  fetchGuildEvent(
    guildId: Snowflake,
    eventId: Snowflake,
    withUserCount = false,
  ): Promise<GuildScheduledEventEntity> {
    return this.#rest.get(
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
   *
   * This method allows modifying various aspects of an event, including
   * its details, timing, location, and status.
   *
   * @param guildId - The ID of the guild the event belongs to
   * @param eventId - The ID of the scheduled event to modify
   * @param options - The modifications to apply to the event
   * @param reason - Optional audit log reason for the modification
   * @returns A promise resolving to the modified guild scheduled event entity
   * @throws {Error} Error if the modification data is invalid
   *
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#modify-guild-scheduled-event}
   *
   * @remarks
   * All fields are optional. Special considerations:
   * - To start or end an event, modify the status field
   * - If updating entity_type to EXTERNAL:
   *   - channel_id must be set to null
   *   - entity_metadata with location field must be provided
   *   - scheduled_end_time must be provided
   */
  async updateEvent(
    guildId: Snowflake,
    eventId: Snowflake,
    options: EventUpdateOptions,
    reason?: string,
  ): Promise<GuildScheduledEventEntity> {
    if (options.image) {
      options.image = await FileHandler.toDataUri(options.image);
    }

    return this.#rest.patch(
      ScheduledEventRouter.EVENT_ROUTES.guildEventByIdEndpoint(
        guildId,
        eventId,
      ),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Deletes a scheduled event from a guild.
   *
   * This method permanently removes an event from the guild.
   *
   * @param guildId - The ID of the guild the event belongs to
   * @param eventId - The ID of the scheduled event to delete
   * @returns A promise resolving when the deletion is complete
   * @throws {Error} Will throw an error if the event doesn't exist
   *
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#delete-guild-scheduled-event}
   */
  deleteEvent(guildId: Snowflake, eventId: Snowflake): Promise<void> {
    return this.#rest.delete(
      ScheduledEventRouter.EVENT_ROUTES.guildEventByIdEndpoint(
        guildId,
        eventId,
      ),
    );
  }

  /**
   * Fetches users who are interested in a scheduled event.
   *
   * This method retrieves a list of users who have marked interest in an event,
   * with support for pagination and optional inclusion of guild member data.
   *
   * @param guildId - The ID of the guild the event belongs to
   * @param eventId - The ID of the scheduled event to get users for
   * @param query - Query parameters for pagination and inclusion of member data
   * @returns A promise resolving to an array of guild scheduled event user entities
   * @throws {Error} Error if the query parameters are invalid
   *
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event-users}
   *
   * @remarks
   * Supports pagination via before/after parameters. Users are returned in
   * ascending order by user_id. If both before and after are provided,
   * only before is respected.
   */
  fetchEventUsers(
    guildId: Snowflake,
    eventId: Snowflake,
    query?: EventUsersFetchParams,
  ): Promise<GuildScheduledEventUserEntity[]> {
    return this.#rest.get(
      ScheduledEventRouter.EVENT_ROUTES.eventUsersEndpoint(guildId, eventId),
      {
        query,
      },
    );
  }
}
