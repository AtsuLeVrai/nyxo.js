import type {
  GuildScheduledEventEntity,
  GuildScheduledEventUserEntity,
  Snowflake,
} from "@nyxjs/core";
import type { z } from "zod";
import { fromZodError } from "zod-validation-error";
import type { Rest } from "../rest.js";
import {
  CreateGuildScheduledEventEntity,
  GetGuildScheduledEventUsersQueryEntity,
  ModifyGuildScheduledEventEntity,
} from "../schemas/index.js";

export class ScheduledEventRouter {
  static ROUTES = {
    events: (guildId: Snowflake) =>
      `/guilds/${guildId}/scheduled-events` as const,
    event: (guildId: Snowflake, eventId: Snowflake) =>
      `/guilds/${guildId}/scheduled-events/${eventId}` as const,
    users: (guildId: Snowflake, eventId: Snowflake) =>
      `/guilds/${guildId}/scheduled-events/${eventId}/users` as const,
  } as const;

  #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#list-scheduled-events-for-guild}
   */
  listScheduledEventsForGuild(
    guildId: Snowflake,
    withUserCount = false,
  ): Promise<GuildScheduledEventEntity[]> {
    return this.#rest.get(ScheduledEventRouter.ROUTES.events(guildId), {
      query: { with_user_count: withUserCount },
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#create-guild-scheduled-event}
   */
  createGuildScheduledEvent(
    guildId: Snowflake,
    event: z.input<typeof CreateGuildScheduledEventEntity>,
    reason?: string,
  ): Promise<GuildScheduledEventEntity> {
    const result = CreateGuildScheduledEventEntity.safeParse(event);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.post(ScheduledEventRouter.ROUTES.events(guildId), {
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
    return this.#rest.get(ScheduledEventRouter.ROUTES.event(guildId, eventId), {
      query: { with_user_count: withUserCount },
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#modify-guild-scheduled-event}
   */
  modifyGuildScheduledEvent(
    guildId: Snowflake,
    eventId: Snowflake,
    modify: z.input<typeof ModifyGuildScheduledEventEntity>,
    reason?: string,
  ): Promise<GuildScheduledEventEntity> {
    const result = ModifyGuildScheduledEventEntity.safeParse(modify);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.patch(
      ScheduledEventRouter.ROUTES.event(guildId, eventId),
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
    return this.#rest.delete(
      ScheduledEventRouter.ROUTES.event(guildId, eventId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event-users}
   */
  getGuildScheduledEventUsers(
    guildId: Snowflake,
    eventId: Snowflake,
    query: z.input<typeof GetGuildScheduledEventUsersQueryEntity> = {},
  ): Promise<GuildScheduledEventUserEntity[]> {
    const result = GetGuildScheduledEventUsersQueryEntity.safeParse(query);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.get(ScheduledEventRouter.ROUTES.users(guildId, eventId), {
      query: result.data,
    });
  }
}
