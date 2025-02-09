import type {
  GuildScheduledEventEntity,
  GuildScheduledEventUserEntity,
  Snowflake,
} from "@nyxjs/core";
import { fromZodError } from "zod-validation-error";
import { BaseRouter } from "../base/index.js";
import {
  CreateGuildScheduledEventSchema,
  GetGuildScheduledEventUsersQuerySchema,
  ModifyGuildScheduledEventSchema,
} from "../schemas/index.js";

export class ScheduledEventRouter extends BaseRouter {
  static readonly ROUTES = {
    guildScheduledEvents: (guildId: Snowflake) =>
      `/guilds/${guildId}/scheduled-events` as const,
    guildScheduledEvent: (guildId: Snowflake, eventId: Snowflake) =>
      `/guilds/${guildId}/scheduled-events/${eventId}` as const,
    guildScheduledEventUsers: (guildId: Snowflake, eventId: Snowflake) =>
      `/guilds/${guildId}/scheduled-events/${eventId}/users` as const,
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#list-scheduled-events-for-guild}
   */
  listScheduledEventsForGuild(
    guildId: Snowflake,
    withUserCount = false,
  ): Promise<GuildScheduledEventEntity[]> {
    return this.rest.get(
      ScheduledEventRouter.ROUTES.guildScheduledEvents(guildId),
      {
        query: { with_user_count: withUserCount },
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#create-guild-scheduled-event}
   */
  async createGuildScheduledEvent(
    guildId: Snowflake,
    event: CreateGuildScheduledEventSchema,
    reason?: string,
  ): Promise<GuildScheduledEventEntity> {
    const result = await CreateGuildScheduledEventSchema.safeParseAsync(event);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.rest.post(
      ScheduledEventRouter.ROUTES.guildScheduledEvents(guildId),
      {
        body: JSON.stringify(result.data),
        reason,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event}
   */
  getGuildScheduledEvent(
    guildId: Snowflake,
    eventId: Snowflake,
    withUserCount = false,
  ): Promise<GuildScheduledEventEntity> {
    return this.rest.get(
      ScheduledEventRouter.ROUTES.guildScheduledEvent(guildId, eventId),
      {
        query: { with_user_count: withUserCount },
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#modify-guild-scheduled-event}
   */
  modifyGuildScheduledEvent(
    guildId: Snowflake,
    eventId: Snowflake,
    modify: ModifyGuildScheduledEventSchema,
    reason?: string,
  ): Promise<GuildScheduledEventEntity> {
    const result = ModifyGuildScheduledEventSchema.safeParse(modify);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.rest.patch(
      ScheduledEventRouter.ROUTES.guildScheduledEvent(guildId, eventId),
      {
        body: JSON.stringify(result.data),
        reason,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#delete-guild-scheduled-event}
   */
  deleteGuildScheduledEvent(
    guildId: Snowflake,
    eventId: Snowflake,
  ): Promise<void> {
    return this.rest.delete(
      ScheduledEventRouter.ROUTES.guildScheduledEvent(guildId, eventId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event-users}
   */
  getGuildScheduledEventUsers(
    guildId: Snowflake,
    eventId: Snowflake,
    query: GetGuildScheduledEventUsersQuerySchema = {},
  ): Promise<GuildScheduledEventUserEntity[]> {
    const result = GetGuildScheduledEventUsersQuerySchema.safeParse(query);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.rest.get(
      ScheduledEventRouter.ROUTES.guildScheduledEventUsers(guildId, eventId),
      {
        query: result.data,
      },
    );
  }
}
