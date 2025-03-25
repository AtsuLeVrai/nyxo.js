import type {
  GuildScheduledEventEntity,
  GuildScheduledEventUserEntity,
  Snowflake,
} from "@nyxjs/core";
import type { Rest } from "../core/index.js";
import { FileHandler } from "../handlers/index.js";
import type {
  CreateGuildScheduledEventSchema,
  GetGuildScheduledEventUsersQuerySchema,
  ModifyGuildScheduledEventSchema,
} from "../schemas/index.js";

/**
 * Router class for handling Discord Guild Scheduled Event endpoints.
 *
 * This class provides methods to interact with Discord's scheduled events API,
 * allowing applications to create, read, update, and delete scheduled events
 * in guilds, as well as retrieve users subscribed to events.
 */
export class ScheduledEventRouter {
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

  /**
   * The REST client used to make API requests.
   */
  readonly #rest: Rest;

  /**
   * Creates a new instance of the ScheduledEventRouter.
   * @param rest - The REST client to use for API requests
   */
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
      ScheduledEventRouter.ROUTES.guildScheduledEvents(guildId),
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
      ScheduledEventRouter.ROUTES.guildScheduledEvents(guildId),
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
      ScheduledEventRouter.ROUTES.guildScheduledEvent(guildId, eventId),
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
      ScheduledEventRouter.ROUTES.guildScheduledEvent(guildId, eventId),
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
      ScheduledEventRouter.ROUTES.guildScheduledEvent(guildId, eventId),
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
      ScheduledEventRouter.ROUTES.guildScheduledEventUsers(guildId, eventId),
      {
        query,
      },
    );
  }
}
