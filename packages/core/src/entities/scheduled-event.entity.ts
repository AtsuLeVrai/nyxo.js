import { z } from "zod";
import { Snowflake } from "../managers/index.js";
import { GuildMemberEntity } from "./guild.entity.js";
import { UserEntity } from "./user.entity.js";

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
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-nweekday-structure}
 */
export const GuildScheduledEventRecurrenceRuleNWeekdayEntity = z.object({
  n: z.number().int().min(1).max(5),
  day: z.nativeEnum(GuildScheduledEventRecurrenceRuleWeekday),
});

export type GuildScheduledEventRecurrenceRuleNWeekdayEntity = z.infer<
  typeof GuildScheduledEventRecurrenceRuleNWeekdayEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-structure}
 */
export const GuildScheduledEventRecurrenceRuleEntity = z.object({
  start: z.string().datetime(),
  end: z.string().datetime().nullable(),
  frequency: z.nativeEnum(GuildScheduledEventRecurrenceRuleFrequency),
  interval: z.number().int().positive(),
  by_weekday: z
    .array(z.nativeEnum(GuildScheduledEventRecurrenceRuleWeekday))
    .nullable(),
  by_n_weekday: z
    .array(GuildScheduledEventRecurrenceRuleNWeekdayEntity)
    .nullable(),
  by_month: z
    .array(z.nativeEnum(GuildScheduledEventRecurrenceRuleMonth))
    .nullable(),
  by_month_day: z.array(z.number().int()).nullable(),
  by_year_day: z.array(z.number().int()).nullable(),
  count: z.number().int().positive().nullable(),
});

export type GuildScheduledEventRecurrenceRuleEntity = z.infer<
  typeof GuildScheduledEventRecurrenceRuleEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-user-object-guild-scheduled-event-user-structure}
 */
export const GuildScheduledEventUserEntity = z.object({
  guild_scheduled_event_id: Snowflake,
  user: UserEntity,
  member: GuildMemberEntity.optional(),
});

export type GuildScheduledEventUserEntity = z.infer<
  typeof GuildScheduledEventUserEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-entity-metadata}
 */
export const GuildScheduledEventEntityMetadataEntity = z.object({
  location: z.string().min(1).max(100).optional(),
});

export type GuildScheduledEventEntityMetadataEntity = z.infer<
  typeof GuildScheduledEventEntityMetadataEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-structure}
 */
export const GuildScheduledEventEntity = z.object({
  id: Snowflake,
  guild_id: Snowflake,
  channel_id: Snowflake.nullish(),
  creator_id: Snowflake.nullish(),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000).nullish(),
  scheduled_start_time: z.string().datetime(),
  scheduled_end_time: z.string().datetime().nullish(),
  privacy_level: z.nativeEnum(GuildScheduledEventPrivacyLevel),
  status: z.nativeEnum(GuildScheduledEventStatus),
  entity_type: z.nativeEnum(GuildScheduledEventType),
  entity_id: Snowflake.nullable(),
  entity_metadata: GuildScheduledEventEntityMetadataEntity.nullable(),
  creator: UserEntity.optional(),
  user_count: z.number().int().optional(),
  image: z.string().nullish(),
  recurrence_rule: GuildScheduledEventRecurrenceRuleEntity.nullable(),
});

export type GuildScheduledEventEntity = z.infer<
  typeof GuildScheduledEventEntity
>;
