import { BaseRouter } from "../../bases/index.js";
import type { FileInput, RouteBuilder } from "../../core/index.js";
import type { StripNull } from "../../utils/index.js";
import type {
  GuildScheduledEventEntity,
  GuildScheduledEventStatus,
  GuildScheduledEventUserEntity,
} from "./guild-scheduled-event.entity.js";

export interface RESTCreateGuildScheduledEventJSONParams
  extends Pick<
      GuildScheduledEventEntity,
      "name" | "privacy_level" | "scheduled_start_time" | "entity_type"
    >,
    StripNull<
      Partial<
        Pick<
          GuildScheduledEventEntity,
          | "channel_id"
          | "entity_metadata"
          | "scheduled_end_time"
          | "description"
          | "recurrence_rule"
        >
      >
    > {
  image?: FileInput;
}

export interface RESTModifyGuildScheduledEventJSONParams
  extends Pick<RESTCreateGuildScheduledEventJSONParams, "image">,
    Partial<
      Pick<
        GuildScheduledEventEntity,
        | "channel_id"
        | "entity_metadata"
        | "name"
        | "privacy_level"
        | "scheduled_start_time"
        | "entity_type"
        | "description"
        | "recurrence_rule"
      > &
        StripNull<Pick<GuildScheduledEventEntity, "scheduled_end_time">>
    > {
  status?: GuildScheduledEventStatus;
}

export interface RESTGetGuildScheduledEventUsersQueryStringParams {
  limit?: number;
  with_member?: boolean;
  before?: string;
  after?: string;
}

export const GuildScheduledEventRoutes = {
  listScheduledEventsGuild: (guildId: string) => `/guilds/${guildId}/scheduled-events` as const,
  getGuildScheduledEvent: (guildId: string, eventId: string) =>
    `/guilds/${guildId}/scheduled-events/${eventId}` as const,
  getGuildScheduledEventUsers: (guildId: string, eventId: string) =>
    `/guilds/${guildId}/scheduled-events/${eventId}/users` as const,
} as const satisfies RouteBuilder;

export class GuildScheduledEventRouter extends BaseRouter {
  listScheduledEventsGuild(
    guildId: string,
    withUserCount = false,
  ): Promise<GuildScheduledEventEntity[]> {
    return this.rest.get(GuildScheduledEventRoutes.listScheduledEventsGuild(guildId), {
      query: { with_user_count: withUserCount },
    });
  }

  async createGuildScheduledEvent(
    guildId: string,
    options: RESTCreateGuildScheduledEventJSONParams,
    reason?: string,
  ): Promise<GuildScheduledEventEntity> {
    const processedOptions = await this.processFileOptions(options, ["image"]);
    return this.rest.post(GuildScheduledEventRoutes.listScheduledEventsGuild(guildId), {
      body: JSON.stringify(processedOptions),
      reason,
    });
  }

  getGuildScheduledEvent(
    guildId: string,
    eventId: string,
    withUserCount = false,
  ): Promise<GuildScheduledEventEntity> {
    return this.rest.get(GuildScheduledEventRoutes.getGuildScheduledEvent(guildId, eventId), {
      query: { with_user_count: withUserCount },
    });
  }

  async modifyGuildScheduledEvent(
    guildId: string,
    eventId: string,
    options: RESTModifyGuildScheduledEventJSONParams,
    reason?: string,
  ): Promise<GuildScheduledEventEntity> {
    const processedOptions = await this.processFileOptions(options, ["image"]);
    return this.rest.patch(GuildScheduledEventRoutes.getGuildScheduledEvent(guildId, eventId), {
      body: JSON.stringify(processedOptions),
      reason,
    });
  }

  deleteGuildScheduledEvent(guildId: string, eventId: string): Promise<void> {
    return this.rest.delete(GuildScheduledEventRoutes.getGuildScheduledEvent(guildId, eventId));
  }

  getGuildScheduledEventUsers(
    guildId: string,
    eventId: string,
    query?: RESTGetGuildScheduledEventUsersQueryStringParams,
  ): Promise<GuildScheduledEventUserEntity[]> {
    return this.rest.get(GuildScheduledEventRoutes.getGuildScheduledEventUsers(guildId, eventId), {
      query,
    });
  }
}
