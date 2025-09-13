export enum GuildScheduledEventRecurrenceRuleMonth {
  January = 1,
  February = 2,
  March = 3,
  April = 4,
  May = 5,
  June = 6,
  July = 7,
  August = 8,
  September = 9,
  October = 10,
  November = 11,
  December = 12,
}

export enum GuildScheduledEventRecurrenceRuleWeekday {
  Monday = 0,
  Tuesday = 1,
  Wednesday = 2,
  Thursday = 3,
  Friday = 4,
  Saturday = 5,
  Sunday = 6,
}

export enum GuildScheduledEventRecurrenceRuleFrequency {
  Yearly = 0,
  Monthly = 1,
  Weekly = 2,
  Daily = 3,
}

export enum GuildScheduledEventStatus {
  Scheduled = 1,
  Active = 2,
  Completed = 3,
  Canceled = 4,
}

export enum GuildScheduledEventType {
  StageInstance = 1,
  Voice = 2,
  External = 3,
}

export enum GuildScheduledEventPrivacyLevel {
  GuildOnly = 2,
}

export interface NWeekday {
  day: number;
  week: number;
}

export interface GuildScheduledEventRecurrenceRuleEntity {
  frequency: "WEEKLY" | "MONTHLY";
  count?: number | null;
  until?: number | null;
  interval: number;
  week_days?: number[];
  month_days?: number[];
  month_week_days?: NWeekday[];
}

export interface GuildScheduledEventUserEntity {
  guild_scheduled_event_id: string;
  user: UserEntity;
  member?: GuildMemberEntity;
}

export interface GuildScheduledEventEntityMetadata {
  location?: string;
}

export interface GuildScheduledEventEntity {
  id: string;
  guild_id: string;
  channel_id: string | null;
  creator_id?: string | null;
  name: string;
  description?: string | null;
  scheduled_start_time: string;
  scheduled_end_time: string | null;
  privacy_level: GuildScheduledEventPrivacyLevel;
  status: GuildScheduledEventStatus;
  entity_type: GuildScheduledEventType;
  entity_id: string | null;
  entity_metadata: GuildScheduledEventEntityMetadata | null;
  creator?: UserEntity;
  user_count?: number;
  image?: string | null;
  recurrence_rule?: GuildScheduledEventRecurrenceRuleEntity | null;
}

export interface GuildScheduledEventUserAddRemoveEntity {
  guild_scheduled_event_id: string;
  user_id: string;
  guild_id: string;
}

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
