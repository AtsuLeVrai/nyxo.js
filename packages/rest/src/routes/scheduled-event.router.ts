import type {
  GuildScheduledEventEntity,
  GuildScheduledEventUserEntity,
  Snowflake,
} from "@nyxjs/core";
import { BaseRouter } from "../base/index.js";
import {
  type CreateGuildScheduledEventEntity,
  CreateGuildScheduledEventSchema,
  type GetGuildScheduledEventUsersQueryEntity,
  GetGuildScheduledEventUsersQuerySchema,
  type ModifyGuildScheduledEventEntity,
  ModifyGuildScheduledEventSchema,
} from "../schemas/index.js";

export class ScheduledEventRouter extends BaseRouter {
  static ROUTES = {
    events: (guildId: Snowflake) =>
      `/guilds/${guildId}/scheduled-events` as const,
    event: (guildId: Snowflake, eventId: Snowflake) =>
      `/guilds/${guildId}/scheduled-events/${eventId}` as const,
    users: (guildId: Snowflake, eventId: Snowflake) =>
      `/guilds/${guildId}/scheduled-events/${eventId}/users` as const,
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#list-scheduled-events-for-guild}
   */
  listScheduledEventsForGuild(
    guildId: Snowflake,
    withUserCount = false,
  ): Promise<GuildScheduledEventEntity[]> {
    return this.get(ScheduledEventRouter.ROUTES.events(guildId), {
      query: { with_user_count: withUserCount },
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#create-guild-scheduled-event}
   */
  createGuildScheduledEvent(
    guildId: Snowflake,
    event: CreateGuildScheduledEventEntity,
    reason?: string,
  ): Promise<GuildScheduledEventEntity> {
    const result = CreateGuildScheduledEventSchema.safeParse(event);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.post(ScheduledEventRouter.ROUTES.events(guildId), {
      body: JSON.stringify(result.data),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event}
   */
  getGuildScheduledEvent(
    guildId: Snowflake,
    eventId: Snowflake,
    withUserCount = false,
  ): Promise<GuildScheduledEventEntity> {
    return this.get(ScheduledEventRouter.ROUTES.event(guildId, eventId), {
      query: { with_user_count: withUserCount },
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#modify-guild-scheduled-event}
   */
  modifyGuildScheduledEvent(
    guildId: Snowflake,
    eventId: Snowflake,
    modify: ModifyGuildScheduledEventEntity,
    reason?: string,
  ): Promise<GuildScheduledEventEntity> {
    const result = ModifyGuildScheduledEventSchema.safeParse(modify);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.patch(ScheduledEventRouter.ROUTES.event(guildId, eventId), {
      body: JSON.stringify(result.data),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#delete-guild-scheduled-event}
   */
  deleteGuildScheduledEvent(
    guildId: Snowflake,
    eventId: Snowflake,
  ): Promise<void> {
    return this.delete(ScheduledEventRouter.ROUTES.event(guildId, eventId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event-users}
   */
  getGuildScheduledEventUsers(
    guildId: Snowflake,
    eventId: Snowflake,
    query?: GetGuildScheduledEventUsersQueryEntity,
  ): Promise<GuildScheduledEventUserEntity[]> {
    const result = GetGuildScheduledEventUsersQuerySchema.safeParse(query);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.get(ScheduledEventRouter.ROUTES.users(guildId, eventId), {
      query: result.data,
    });
  }
}
