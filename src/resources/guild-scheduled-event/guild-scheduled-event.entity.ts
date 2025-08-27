import type { GuildMemberEntity } from "../guild/index.js";
import type { UserEntity } from "../user/index.js";

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
