import type {
  GuildScheduledEventEntity,
  GuildScheduledEventUserEntity,
  Snowflake,
} from "@nyxjs/core";
import type {
  CreateEventEntity,
  GetEventsQueryEntity,
  GetUsersQueryEntity,
  ModifyEventEntity,
} from "../types/index.js";
import { BaseRouter } from "./base.js";

export class ScheduledEventRouter extends BaseRouter {
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
    query?: GetEventsQueryEntity,
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
    event: CreateEventEntity,
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
    modify: ModifyEventEntity,
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
    query?: GetUsersQueryEntity,
  ): Promise<GuildScheduledEventUserEntity[]> {
    return this.get(ScheduledEventRouter.routes.users(guildId, eventId), {
      query,
    });
  }
}
