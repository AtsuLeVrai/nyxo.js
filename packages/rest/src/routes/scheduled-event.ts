import type {
  GuildScheduledEventEntity,
  GuildScheduledEventUserEntity,
  Snowflake,
} from "@nyxjs/core";
import type { Rest } from "../core/index.js";
import type { ImageData } from "../types/index.js";

interface GetEvents {
  with_user_count?: boolean;
}

interface GetUsers {
  limit?: number;
  with_member?: boolean;
  before?: Snowflake;
  after?: Snowflake;
}

interface Create
  extends Omit<
    GuildScheduledEventEntity,
    "id" | "guild_id" | "creator_id" | "creator" | "user_count"
  > {
  image?: ImageData;
}

interface Modify extends Partial<Create> {}

export class ScheduledEventRoutes {
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

  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#list-scheduled-events-for-guild}
   */
  list(
    guildId: Snowflake,
    query?: GetEvents,
  ): Promise<GuildScheduledEventEntity[]> {
    return this.#rest.get(ScheduledEventRoutes.routes.events(guildId), {
      query,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#create-guild-scheduled-event}
   */
  create(
    guildId: Snowflake,
    event: Create,
    reason?: string,
  ): Promise<GuildScheduledEventEntity> {
    return this.#rest.post(ScheduledEventRoutes.routes.events(guildId), {
      body: JSON.stringify(event),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event}
   */
  get(
    guildId: Snowflake,
    eventId: Snowflake,
    withUserCount?: boolean,
  ): Promise<GuildScheduledEventEntity> {
    return this.#rest.get(ScheduledEventRoutes.routes.event(guildId, eventId), {
      query: { with_user_count: withUserCount },
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#modify-guild-scheduled-event}
   */
  modify(
    guildId: Snowflake,
    eventId: Snowflake,
    modify: Modify,
    reason?: string,
  ): Promise<GuildScheduledEventEntity> {
    return this.#rest.patch(
      ScheduledEventRoutes.routes.event(guildId, eventId),
      {
        body: JSON.stringify(modify),
        reason,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#delete-guild-scheduled-event}
   */
  delete(guildId: Snowflake, eventId: Snowflake): Promise<void> {
    return this.#rest.delete(
      ScheduledEventRoutes.routes.event(guildId, eventId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event-users}
   */
  getUsers(
    guildId: Snowflake,
    eventId: Snowflake,
    query?: GetUsers,
  ): Promise<GuildScheduledEventUserEntity[]> {
    return this.#rest.get(ScheduledEventRoutes.routes.users(guildId, eventId), {
      query,
    });
  }
}
