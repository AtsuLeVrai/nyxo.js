import type {
  GuildScheduledEventEntity,
  GuildScheduledEventEntityMetadata,
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
export interface CreateGuildScheduledEventSchema {
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
 * This interface extends the CreateGuildScheduledEventSchema and makes all fields optional.
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
export interface ModifyGuildScheduledEventSchema
  extends Partial<CreateGuildScheduledEventSchema> {
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
export interface GetGuildScheduledEventUsersQuerySchema {
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
   *
   * @example
   * ```typescript
   * // Fetch all scheduled events in a guild with user counts
   * const events = await eventRouter.fetchGuildEvents(
   *   "123456789012345678", // Guild ID
   *   true // Include user count
   * );
   *
   * console.log(`Found ${events.length} scheduled events`);
   *
   * // Group events by status
   * const scheduled = events.filter(e => e.status === 1);
   * const active = events.filter(e => e.status === 2);
   * const completed = events.filter(e => e.status === 3);
   * const canceled = events.filter(e => e.status === 4);
   *
   * console.log(`Upcoming events: ${scheduled.length}`);
   * console.log(`Active events: ${active.length}`);
   * console.log(`Completed events: ${completed.length}`);
   * console.log(`Canceled events: ${canceled.length}`);
   *
   * // Sort upcoming events by start time
   * const sortedUpcoming = [...scheduled].sort((a, b) =>
   *   new Date(a.scheduled_start_time).getTime() -
   *   new Date(b.scheduled_start_time).getTime()
   * );
   *
   * // Display the next three events
   * console.log("Next upcoming events:");
   * sortedUpcoming.slice(0, 3).forEach(event => {
   *   const startTime = new Date(event.scheduled_start_time).toLocaleString();
   *   console.log(`- ${event.name} (${startTime})`);
   *   if (event.user_count) {
   *     console.log(`  ${event.user_count} interested users`);
   *   }
   * });
   * ```
   */
  fetchGuildEvents(
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
   * @throws Error if the event data is invalid
   *
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#create-guild-scheduled-event}
   *
   * @example
   * ```typescript
   * // Create a voice channel event
   * const voiceEvent = await eventRouter.createGuildEvent(
   *   "123456789012345678", // Guild ID
   *   {
   *     channel_id: "234567890123456789", // Voice channel ID
   *     name: "Game Night",
   *     privacy_level: 2, // GUILD_ONLY
   *     scheduled_start_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
   *     description: "Join us for our weekly game night!",
   *     entity_type: 2 // VOICE
   *   },
   *   "Creating weekly game night event"
   * );
   * console.log(`Created voice event: ${voiceEvent.id}`);
   *
   * // Create an external event with cover image
   * const imageFile = await FileHandler.fromLocalFile("./path/to/image.png");
   * const externalEvent = await eventRouter.createGuildEvent(
   *   "123456789012345678", // Guild ID
   *   {
   *     name: "Community Meetup",
   *     privacy_level: 2, // GUILD_ONLY
   *     scheduled_start_time: new Date(Date.now() + 604800000).toISOString(), // Next week
   *     scheduled_end_time: new Date(Date.now() + 608400000).toISOString(), // Next week + 1 hour
   *     description: "Meet fellow community members in person!",
   *     entity_type: 3, // EXTERNAL
   *     entity_metadata: {
   *       location: "Central Park, New York City"
   *     },
   *     image: imageFile
   *   },
   *   "Creating community meetup event"
   * );
   * console.log(`Created external event: ${externalEvent.id}`);
   *
   * // Create a recurring stage event
   * const recurringEvent = await eventRouter.createGuildEvent(
   *   "123456789012345678", // Guild ID
   *   {
   *     channel_id: "345678901234567890", // Stage channel ID
   *     name: "Weekly Dev Updates",
   *     privacy_level: 2, // GUILD_ONLY
   *     scheduled_start_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
   *     description: "Weekly updates on our project development",
   *     entity_type: 1, // STAGE_INSTANCE
   *     recurrence_rule: {
   *       frequency: 1, // WEEKLY
   *       interval: 1
   *     }
   *   }
   * );
   * console.log(`Created recurring stage event: ${recurringEvent.id}`);
   * ```
   *
   * @remarks
   * Requirements vary based on entity type:
   * - For STAGE_INSTANCE and VOICE events: channel_id is required
   * - For EXTERNAL events: entity_metadata with location and scheduled_end_time are required
   *
   * A guild can have a maximum of 100 events with SCHEDULED or ACTIVE status at any time.
   */
  async createGuildEvent(
    guildId: Snowflake,
    options: CreateGuildScheduledEventSchema,
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
   * @throws Will throw an error if the event doesn't exist
   *
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event}
   *
   * @example
   * ```typescript
   * // Fetch a specific event with user count
   * try {
   *   const event = await eventRouter.fetchGuildEvent(
   *     "123456789012345678", // Guild ID
   *     "987654321987654321", // Event ID
   *     true // Include user count
   *   );
   *
   *   console.log(`Event: ${event.name}`);
   *   console.log(`Status: ${
   *     event.status === 1 ? "Scheduled" :
   *     event.status === 2 ? "Active" :
   *     event.status === 3 ? "Completed" :
   *     "Canceled"
   *   }`);
   *
   *   // Format start and end times
   *   const startTime = new Date(event.scheduled_start_time).toLocaleString();
   *   console.log(`Starts at: ${startTime}`);
   *
   *   if (event.scheduled_end_time) {
   *     const endTime = new Date(event.scheduled_end_time).toLocaleString();
   *     console.log(`Ends at: ${endTime}`);
   *   }
   *
   *   // Show event location
   *   if (event.entity_type === 3) { // EXTERNAL
   *     console.log(`Location: ${event.entity_metadata.location}`);
   *   } else if (event.channel_id) {
   *     console.log(`Channel ID: ${event.channel_id}`);
   *   }
   *
   *   // Show interested user count if available
   *   if (event.user_count !== undefined) {
   *     console.log(`Interested users: ${event.user_count}`);
   *   }
   *
   *   // Check if it's a recurring event
   *   if (event.recurrence_rule) {
   *     const frequency = event.recurrence_rule.frequency === 1 ? "Weekly" :
   *                       event.recurrence_rule.frequency === 2 ? "Monthly" : "Daily";
   *     console.log(`Recurring: ${frequency} (every ${event.recurrence_rule.interval || 1})`);
   *   }
   * } catch (error) {
   *   console.error("Failed to fetch event:", error);
   * }
   * ```
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
   * @throws Error if the modification data is invalid
   *
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#modify-guild-scheduled-event}
   *
   * @example
   * ```typescript
   * // Update an event's description and time
   * const updatedEvent = await eventRouter.updateGuildEvent(
   *   "123456789012345678", // Guild ID
   *   "987654321987654321", // Event ID
   *   {
   *     description: "Updated description with more details about the event",
   *     scheduled_start_time: new Date(Date.now() + 172800000).toISOString() // Two days from now
   *   },
   *   "Rescheduling and updating event details"
   * );
   * console.log(`Event updated: ${updatedEvent.name}`);
   *
   * // Start an event that was previously in scheduled status
   * const startedEvent = await eventRouter.updateGuildEvent(
   *   "123456789012345678", // Guild ID
   *   "987654321987654321", // Event ID
   *   {
   *     status: 2 // ACTIVE
   *   },
   *   "Starting the event"
   * );
   * console.log(`Event is now ${startedEvent.status === 2 ? "active" : "not active"}`);
   *
   * // Cancel an event
   * const canceledEvent = await eventRouter.updateGuildEvent(
   *   "123456789012345678", // Guild ID
   *   "987654321987654321", // Event ID
   *   {
   *     status: 4 // CANCELED
   *   },
   *   "Event canceled due to low interest"
   * );
   * console.log(`Event has been canceled`);
   *
   * // Change an event from voice to external
   * const changedLocationEvent = await eventRouter.updateGuildEvent(
   *   "123456789012345678", // Guild ID
   *   "987654321987654321", // Event ID
   *   {
   *     entity_type: 3, // EXTERNAL
   *     channel_id: null,
   *     entity_metadata: {
   *       location: "Discord HQ, San Francisco"
   *     },
   *     scheduled_end_time: new Date(Date.now() + 90000000).toISOString() // 25 hours from now
   *   },
   *   "Changing event to physical location"
   * );
   * ```
   *
   * @remarks
   * All fields are optional. Special considerations:
   * - To start or end an event, modify the status field
   * - If updating entity_type to EXTERNAL:
   *   - channel_id must be set to null
   *   - entity_metadata with location field must be provided
   *   - scheduled_end_time must be provided
   */
  async updateGuildEvent(
    guildId: Snowflake,
    eventId: Snowflake,
    options: ModifyGuildScheduledEventSchema,
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
   * @throws Will throw an error if the event doesn't exist
   *
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#delete-guild-scheduled-event}
   *
   * @example
   * ```typescript
   * // Delete an event
   * try {
   *   await eventRouter.deleteGuildEvent(
   *     "123456789012345678", // Guild ID
   *     "987654321987654321"  // Event ID
   *   );
   *   console.log("Event deleted successfully");
   * } catch (error) {
   *   console.error("Failed to delete event:", error);
   * }
   * ```
   */
  deleteGuildEvent(guildId: Snowflake, eventId: Snowflake): Promise<void> {
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
   * @throws Error if the query parameters are invalid
   *
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event-users}
   *
   * @example
   * ```typescript
   * // Fetch the first 50 users interested in an event, including their member data
   * const interestedUsers = await eventRouter.fetchEventUsers(
   *   "123456789012345678", // Guild ID
   *   "987654321987654321", // Event ID
   *   {
   *     limit: 50,
   *     with_member: true
   *   }
   * );
   *
   * console.log(`Found ${interestedUsers.length} interested users`);
   *
   * // Display information about the users
   * interestedUsers.forEach(user => {
   *   console.log(`- ${user.user.username}#${user.user.discriminator}`);
   *
   *   // Access member data if requested with with_member: true
   *   if (user.member) {
   *     const joinedAt = new Date(user.member.joined_at).toLocaleDateString();
   *     console.log(`  Joined server: ${joinedAt}`);
   *
   *     if (user.member.nick) {
   *       console.log(`  Nickname: ${user.member.nick}`);
   *     }
   *
   *     if (user.member.roles && user.member.roles.length > 0) {
   *       console.log(`  Roles: ${user.member.roles.length}`);
   *     }
   *   }
   * });
   *
   * // Implement pagination to fetch more users if needed
   * async function fetchAllEventUsers(guildId, eventId) {
   *   let allUsers = [];
   *   let lastUserId = null;
   *   let batch;
   *
   *   do {
   *     const query = lastUserId ? { after: lastUserId, limit: 100 } : { limit: 100 };
   *     batch = await eventRouter.fetchEventUsers(guildId, eventId, query);
   *
   *     allUsers = allUsers.concat(batch);
   *
   *     if (batch.length > 0) {
   *       lastUserId = batch[batch.length - 1].user.id;
   *     }
   *   } while (batch.length === 100);
   *
   *   return allUsers;
   * }
   * ```
   *
   * @remarks
   * Supports pagination via before/after parameters. Users are returned in
   * ascending order by user_id. If both before and after are provided,
   * only before is respected.
   */
  fetchEventUsers(
    guildId: Snowflake,
    eventId: Snowflake,
    query: GetGuildScheduledEventUsersQuerySchema = {},
  ): Promise<GuildScheduledEventUserEntity[]> {
    return this.#rest.get(
      ScheduledEventRouter.EVENT_ROUTES.eventUsersEndpoint(guildId, eventId),
      {
        query,
      },
    );
  }
}
