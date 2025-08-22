import type { Snowflake } from "../common/index.js";
import type { DataUri } from "../core/index.js";
import type { EndpointFactory } from "../utils/index.js";
import type { GuildMemberObject } from "./guild.js";
import type { UserObject } from "./user.js";
export enum GuildScheduledEventPrivacyLevel {
  GuildOnly = 2,
}

export enum GuildScheduledEventEntityType {
  StageInstance = 1,
  Voice = 2,
  External = 3,
}

export enum GuildScheduledEventStatus {
  Scheduled = 1,
  Active = 2,
  Completed = 3,
  Canceled = 4,
}

export enum GuildScheduledEventRecurrenceRuleFrequency {
  Yearly = 0,
  Monthly = 1,
  Weekly = 2,
  Daily = 3,
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

export interface GuildScheduledEventEntityMetadataObject {
  location?: string;
}

export interface GuildScheduledEventRecurrenceRuleNWeekdayObject {
  n: number;
  day: GuildScheduledEventRecurrenceRuleWeekday;
}

export interface GuildScheduledEventRecurrenceRuleObject {
  start: string;
  end: string | null;
  frequency: GuildScheduledEventRecurrenceRuleFrequency;
  interval: number;
  by_weekday: GuildScheduledEventRecurrenceRuleWeekday[] | null;
  by_n_weekday: GuildScheduledEventRecurrenceRuleNWeekdayObject[] | null;
  by_month: GuildScheduledEventRecurrenceRuleMonth[] | null;
  by_month_day: number[] | null;
  by_year_day: number[] | null;
  count: number | null;
}

export interface GuildScheduledEventUserObject {
  guild_scheduled_event_id: Snowflake;
  user: UserObject;
  member?: GuildMemberObject;
}

export interface GuildScheduledEventObject {
  id: Snowflake;
  guild_id: Snowflake;
  channel_id: Snowflake | null;
  creator_id: Snowflake | null;
  name: string;
  description: string | null;
  scheduled_start_time: string;
  scheduled_end_time: string | null;
  privacy_level: GuildScheduledEventPrivacyLevel;
  status: GuildScheduledEventStatus;
  entity_type: GuildScheduledEventEntityType;
  entity_id: Snowflake | null;
  entity_metadata: GuildScheduledEventEntityMetadataObject | null;
  creator?: UserObject;
  user_count?: number;
  image: string | null;
  recurrence_rule: GuildScheduledEventRecurrenceRuleObject | null;
}

// Guild Scheduled Event Request Interfaces
export interface ListScheduledEventsQuery {
  with_user_count?: boolean;
}

export interface CreateGuildScheduledEventRequest {
  channel_id?: Snowflake;
  entity_metadata?: GuildScheduledEventEntityMetadataObject;
  name: string;
  privacy_level: GuildScheduledEventPrivacyLevel;
  scheduled_start_time: string;
  scheduled_end_time?: string;
  description?: string;
  entity_type: GuildScheduledEventEntityType;
  image?: DataUri;
  recurrence_rule?: GuildScheduledEventRecurrenceRuleObject;
}

export interface GetGuildScheduledEventQuery {
  with_user_count?: boolean;
}

export interface ModifyGuildScheduledEventRequest {
  channel_id?: Snowflake | null;
  entity_metadata?: GuildScheduledEventEntityMetadataObject | null;
  name?: string;
  privacy_level?: GuildScheduledEventPrivacyLevel;
  scheduled_start_time?: string;
  scheduled_end_time?: string;
  description?: string | null;
  entity_type?: GuildScheduledEventEntityType;
  status?: GuildScheduledEventStatus;
  image?: DataUri;
  recurrence_rule?: GuildScheduledEventRecurrenceRuleObject | null;
}

export interface GetGuildScheduledEventUsersQuery {
  limit?: number;
  with_member?: boolean;
  before?: Snowflake;
  after?: Snowflake;
}

export const GuildScheduledEventRoutes = {
  // GET /guilds/{guild.id}/scheduled-events - List Scheduled Events for Guild
  listScheduledEvents: ((guildId: Snowflake) =>
    `/guilds/${guildId}/scheduled-events`) as EndpointFactory<
    `/guilds/${string}/scheduled-events`,
    ["GET", "POST"],
    GuildScheduledEventObject[],
    true,
    false,
    CreateGuildScheduledEventRequest,
    ListScheduledEventsQuery
  >,

  // GET /guilds/{guild.id}/scheduled-events/{event.id} - Get Guild Scheduled Event
  getGuildScheduledEvent: ((guildId: Snowflake, eventId: Snowflake) =>
    `/guilds/${guildId}/scheduled-events/${eventId}`) as EndpointFactory<
    `/guilds/${string}/scheduled-events/${string}`,
    ["GET", "PATCH", "DELETE"],
    GuildScheduledEventObject,
    true,
    false,
    ModifyGuildScheduledEventRequest,
    GetGuildScheduledEventQuery
  >,

  // GET /guilds/{guild.id}/scheduled-events/{event.id}/users - Get Guild Scheduled Event Users
  getGuildScheduledEventUsers: ((guildId: Snowflake, eventId: Snowflake) =>
    `/guilds/${guildId}/scheduled-events/${eventId}/users`) as EndpointFactory<
    `/guilds/${string}/scheduled-events/${string}/users`,
    ["GET"],
    GuildScheduledEventUserObject[],
    false,
    false,
    undefined,
    GetGuildScheduledEventUsersQuery
  >,
} as const satisfies Record<string, EndpointFactory<any, any, any, any, any, any, any, any>>;
