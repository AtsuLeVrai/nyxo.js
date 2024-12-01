import type {
  GuildScheduledEventEntity,
  GuildScheduledEventUserEntity,
  Snowflake,
} from "@nyxjs/core";
import type { ImageData } from "../types/index.js";
import { Router } from "./router.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event-query-string-params}
 */
export interface GetEvents {
  with_user_count?: boolean;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event-users-query-string-params}
 */
export interface GetUsers {
  limit?: number;
  with_member?: boolean;
  before?: Snowflake;
  after?: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#create-guild-scheduled-event-json-params}
 */
export interface Create
  extends Pick<
    GuildScheduledEventEntity,
    | "channel_id"
    | "entity_metadata"
    | "name"
    | "privacy_level"
    | "scheduled_start_time"
    | "scheduled_end_time"
    | "description"
    | "entity_type"
    | "recurrence_rule"
  > {
  image?: ImageData;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#modify-guild-scheduled-event-json-params}
 */
export type Modify = Partial<Create>;

export class ScheduledEventRouter extends Router {
  static routes = {
    events: (guildId: Snowflake): `/guilds/${Snowflake}/scheduled-events` => {
      return `/guilds/${guildId}/scheduled-events` as const;
    },
    event: (
      guildId: Snowflake,
      eventId: Snowflake,
    ): `/guilds/${Snowflake}/scheduled-events/${Snowflake}` => {
      return `/guilds/${guildId}/scheduled-events/${eventId}` as const;
    },
    users: (
      guildId: Snowflake,
      eventId: Snowflake,
    ): `/guilds/${Snowflake}/scheduled-events/${Snowflake}/users` => {
      return `/guilds/${guildId}/scheduled-events/${eventId}/users` as const;
    },
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#list-scheduled-events-for-guild}
   */
  listEvents(
    guildId: Snowflake,
    query?: GetEvents,
  ): Promise<GuildScheduledEventEntity[]> {
    return this.get(ScheduledEventRouter.routes.events(guildId), {
      query,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#create-guild-scheduled-event}
   */
  createEvent(
    guildId: Snowflake,
    event: Create,
    reason?: string,
  ): Promise<GuildScheduledEventEntity> {
    return this.post(ScheduledEventRouter.routes.events(guildId), {
      body: JSON.stringify(event),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event}
   */
  getEvent(
    guildId: Snowflake,
    eventId: Snowflake,
    withUserCount?: boolean,
  ): Promise<GuildScheduledEventEntity> {
    return this.get(ScheduledEventRouter.routes.event(guildId, eventId), {
      query: { with_user_count: withUserCount },
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#modify-guild-scheduled-event}
   */
  modifyEvent(
    guildId: Snowflake,
    eventId: Snowflake,
    modify: Modify,
    reason?: string,
  ): Promise<GuildScheduledEventEntity> {
    return this.patch(ScheduledEventRouter.routes.event(guildId, eventId), {
      body: JSON.stringify(modify),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#delete-guild-scheduled-event}
   */
  deleteEvent(guildId: Snowflake, eventId: Snowflake): Promise<void> {
    return this.delete(ScheduledEventRouter.routes.event(guildId, eventId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event-users}
   */
  getUsers(
    guildId: Snowflake,
    eventId: Snowflake,
    query?: GetUsers,
  ): Promise<GuildScheduledEventUserEntity[]> {
    return this.get(ScheduledEventRouter.routes.users(guildId, eventId), {
      query,
    });
  }
}
