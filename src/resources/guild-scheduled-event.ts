import type { FileInput } from "../utils/index.js";
import type { GuildMemberEntity } from "./guild.js";
import type { UserObject } from "./user.js";

export enum GuildScheduledEventPrivacyLevels {
  GuildOnly = 2,
}

export enum GuildScheduledEventEntityTypes {
  StageInstance = 1,

  Voice = 2,

  External = 3,
}

export enum GuildScheduledEventStatuses {
  Scheduled = 1,

  Active = 2,

  Completed = 3,

  Canceled = 4,
}

export enum RecurrenceRuleFrequencies {
  Yearly = 0,

  Monthly = 1,

  Weekly = 2,

  Daily = 3,
}

export enum RecurrenceRuleWeekdays {
  Monday = 0,

  Tuesday = 1,

  Wednesday = 2,

  Thursday = 3,

  Friday = 4,

  Saturday = 5,

  Sunday = 6,
}

export enum RecurrenceRuleMonths {
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

export interface NWeekdayObject {
  readonly day: number;

  readonly week: number;
}

export interface GuildScheduledEventEntityMetadataObject {
  readonly location?: string;
}

export interface GuildScheduledEventRecurrenceRuleObject {
  readonly start: string;

  readonly end?: string | null;

  readonly frequency: RecurrenceRuleFrequencies;

  readonly interval: number;

  readonly by_weekday?: RecurrenceRuleWeekdays[] | null;

  readonly by_n_weekday?: NWeekdayObject[] | null;

  readonly by_month?: RecurrenceRuleMonths[] | null;

  readonly by_month_day?: number[] | null;

  readonly by_year_day?: number[] | null;

  readonly count?: number | null;
}

export interface GuildScheduledEventUserObject {
  readonly guild_scheduled_event_id: string;

  readonly user: UserObject;

  readonly member?: GuildMemberEntity;
}

export interface GuildScheduledEventObject {
  readonly id: string;

  readonly guild_id: string;

  readonly channel_id: string | null;

  readonly creator_id?: string | null;

  readonly name: string;

  readonly description?: string | null;

  readonly scheduled_start_time: string;

  readonly scheduled_end_time: string | null;

  readonly privacy_level: GuildScheduledEventPrivacyLevels;

  readonly status: GuildScheduledEventStatuses;

  readonly entity_type: GuildScheduledEventEntityTypes;

  readonly entity_id: string | null;

  readonly entity_metadata: GuildScheduledEventEntityMetadataObject | null;

  readonly creator?: UserObject;

  readonly user_count?: number;

  readonly image?: string | null;

  readonly recurrence_rule?: GuildScheduledEventRecurrenceRuleObject | null;
}

export interface GuildScheduledEventUserAddRemoveObject {
  readonly guild_scheduled_event_id: string;

  readonly user_id: string;

  readonly guild_id: string;
}

export interface ListScheduledEventsForGuildQueryStringParams {
  readonly with_user_count?: boolean;
}

export interface GetGuildScheduledEventQueryStringParams {
  readonly with_user_count?: boolean;
}

export interface GetGuildScheduledEventUsersQueryStringParams {
  readonly limit?: number;

  readonly with_member?: boolean;

  readonly before?: string;

  readonly after?: string;
}

export interface CreateGuildScheduledEventJSONParams {
  readonly name: string;

  readonly privacy_level: GuildScheduledEventPrivacyLevels;

  readonly scheduled_start_time: string;

  readonly entity_type: GuildScheduledEventEntityTypes;

  readonly channel_id?: string;

  readonly entity_metadata?: GuildScheduledEventEntityMetadataObject;

  readonly scheduled_end_time?: string;

  readonly description?: string;

  readonly recurrence_rule?: GuildScheduledEventRecurrenceRuleObject;

  readonly image?: FileInput;
}

export interface ModifyGuildScheduledEventJSONParams {
  readonly name?: string;

  readonly privacy_level?: GuildScheduledEventPrivacyLevels;

  readonly scheduled_start_time?: string;

  readonly entity_type?: GuildScheduledEventEntityTypes;

  readonly channel_id?: string | null;

  readonly entity_metadata?: GuildScheduledEventEntityMetadataObject;

  readonly scheduled_end_time?: string;

  readonly description?: string | null;

  readonly recurrence_rule?: GuildScheduledEventRecurrenceRuleObject | null;

  readonly status?: GuildScheduledEventStatuses;

  readonly image?: FileInput;
}
