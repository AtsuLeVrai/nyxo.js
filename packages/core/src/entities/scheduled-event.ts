import type { Integer, Iso8601 } from "../formatting/index.js";
import type { Snowflake } from "../managers/index.js";
import type { GuildMemberEntity } from "./guild.js";
import type { UserEntity } from "./user.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-month}
 */
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

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-nweekday-structure}
 */
export interface GuildScheduledEventRecurrenceRuleNWeekdayEntity {
  n: 1 | 2 | 3 | 4 | 5;
  day: GuildScheduledEventRecurrenceRuleWeekday;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-weekday}
 */
export enum GuildScheduledEventRecurrenceRuleWeekday {
  Monday = 0,
  Tuesday = 1,
  Wednesday = 2,
  Thursday = 3,
  Friday = 4,
  Saturday = 5,
  Sunday = 6,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-frequency}
 */
export enum GuildScheduledEventRecurrenceRuleFrequency {
  Yearly = 0,
  Monthly = 1,
  Weekly = 2,
  Daily = 3,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-structure}
 */
export interface GuildScheduledEventRecurrenceRuleEntity {
  start: Iso8601;
  end: Iso8601 | null;
  frequency: GuildScheduledEventRecurrenceRuleFrequency;
  interval: Integer;
  by_weekday: GuildScheduledEventRecurrenceRuleWeekday[] | null;
  by_n_weekday: GuildScheduledEventRecurrenceRuleNWeekdayEntity[] | null;
  by_month: GuildScheduledEventRecurrenceRuleMonth[] | null;
  by_month_day: Integer[] | null;
  by_year_day: Integer[] | null;
  count: Integer | null;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-user-object-guild-scheduled-event-user-structure}
 */
export interface GuildScheduledEventUserEntity {
  guild_scheduled_event_id: Snowflake;
  user: UserEntity;
  member?: GuildMemberEntity;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-entity-metadata}
 */
export interface GuildScheduledEventEntityMetadata {
  location?: string;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-status}
 */
export enum GuildScheduledEventStatus {
  Scheduled = 1,
  Active = 2,
  Completed = 3,
  Canceled = 4,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-entity-types}
 */
export enum GuildScheduledEventType {
  StageInstance = 1,
  Voice = 2,
  External = 3,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-privacy-level}
 */
export enum GuildScheduledEventPrivacyLevel {
  GuildOnly = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-structure}
 */
export interface GuildScheduledEventEntity {
  id: Snowflake;
  guild_id: Snowflake;
  channel_id?: Snowflake | null;
  creator_id?: Snowflake | null;
  name: string;
  description?: string | null;
  scheduled_start_time: Iso8601;
  scheduled_end_time?: Iso8601 | null;
  privacy_level: GuildScheduledEventPrivacyLevel;
  status: GuildScheduledEventStatus;
  entity_type: GuildScheduledEventType;
  entity_id: Snowflake | null;
  entity_metadata?: GuildScheduledEventEntityMetadata | null;
  creator?: UserEntity;
  user_count?: Integer;
  image?: string | null;
  recurrence_rule: GuildScheduledEventRecurrenceRuleEntity | null;
}
