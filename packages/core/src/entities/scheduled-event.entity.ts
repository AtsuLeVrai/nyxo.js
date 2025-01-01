import { z } from "zod";
import { SnowflakeSchema } from "../managers/index.js";
import { GuildMemberSchema } from "./guild.entity.js";
import { UserSchema } from "./user.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-month}
 */
export const GuildScheduledEventRecurrenceRuleMonth = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
} as const;

export type GuildScheduledEventRecurrenceRuleMonth =
  (typeof GuildScheduledEventRecurrenceRuleMonth)[keyof typeof GuildScheduledEventRecurrenceRuleMonth];

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-weekday}
 */
export const GuildScheduledEventRecurrenceRuleWeekday = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
};

export type GuildScheduledEventRecurrenceRuleWeekday =
  (typeof GuildScheduledEventRecurrenceRuleWeekday)[keyof typeof GuildScheduledEventRecurrenceRuleWeekday];

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-nweekday-structure}
 */
export const GuildScheduledEventRecurrenceRuleNWeekdaySchema = z
  .object({
    n: z.number().int().min(1).max(5),
    day: z.nativeEnum(GuildScheduledEventRecurrenceRuleWeekday),
  })
  .strict();

export type GuildScheduledEventRecurrenceRuleNWeekdayEntity = z.infer<
  typeof GuildScheduledEventRecurrenceRuleNWeekdaySchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-frequency}
 */
export const GuildScheduledEventRecurrenceRuleFrequency = {
  yearly: 0,
  monthly: 1,
  weekly: 2,
  daily: 3,
};

export type GuildScheduledEventRecurrenceRuleFrequency =
  (typeof GuildScheduledEventRecurrenceRuleFrequency)[keyof typeof GuildScheduledEventRecurrenceRuleFrequency];

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-structure}
 */
export const GuildScheduledEventRecurrenceRuleSchema = z
  .object({
    start: z.string().datetime(),
    end: z.string().datetime().nullable(),
    frequency: z.nativeEnum(GuildScheduledEventRecurrenceRuleFrequency),
    interval: z.number().int().positive(),
    by_weekday: z
      .array(z.nativeEnum(GuildScheduledEventRecurrenceRuleWeekday))
      .nullable(),
    by_n_weekday: z
      .array(GuildScheduledEventRecurrenceRuleNWeekdaySchema)
      .nullable(),
    by_month: z
      .array(z.nativeEnum(GuildScheduledEventRecurrenceRuleMonth))
      .nullable(),
    by_month_day: z.array(z.number().int()).nullable(),
    by_year_day: z.array(z.number().int()).nullable(),
    count: z.number().int().positive().nullable(),
  })
  .strict();

export type GuildScheduledEventRecurrenceRuleEntity = z.infer<
  typeof GuildScheduledEventRecurrenceRuleSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-user-object-guild-scheduled-event-user-structure}
 */
export const GuildScheduledEventUserSchema = z
  .object({
    guild_scheduled_event_id: SnowflakeSchema,
    user: UserSchema,
    member: GuildMemberSchema.optional(),
  })
  .strict();

export type GuildScheduledEventUserEntity = z.infer<
  typeof GuildScheduledEventUserSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-entity-metadata}
 */
export const GuildScheduledEventEntityMetadataSchema = z
  .object({
    location: z.string().min(1).max(100).optional(),
  })
  .strict();

export type GuildScheduledEventEntityMetadata = z.infer<
  typeof GuildScheduledEventEntityMetadataSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-status}
 */
export const GuildScheduledEventStatus = {
  scheduled: 1,
  active: 2,
  completed: 3,
  canceled: 4,
} as const;

export type GuildScheduledEventStatus =
  (typeof GuildScheduledEventStatus)[keyof typeof GuildScheduledEventStatus];

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-entity-types}
 */
export const GuildScheduledEventType = {
  stageInstance: 1,
  voice: 2,
  external: 3,
} as const;

export type GuildScheduledEventType =
  (typeof GuildScheduledEventType)[keyof typeof GuildScheduledEventType];

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-privacy-level}
 */
export const GuildScheduledEventPrivacyLevel = {
  guildOnly: 2,
} as const;

export type GuildScheduledEventPrivacyLevel =
  (typeof GuildScheduledEventPrivacyLevel)[keyof typeof GuildScheduledEventPrivacyLevel];

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-structure}
 */
export const GuildScheduledEventSchema = z
  .object({
    id: SnowflakeSchema,
    guild_id: SnowflakeSchema,
    channel_id: SnowflakeSchema.nullish(),
    creator_id: SnowflakeSchema.nullish(),
    name: z.string().min(1).max(100),
    description: z.string().min(1).max(1000).nullish(),
    scheduled_start_time: z.string().datetime(),
    scheduled_end_time: z.string().datetime().nullish(),
    privacy_level: z.nativeEnum(GuildScheduledEventPrivacyLevel),
    status: z.nativeEnum(GuildScheduledEventStatus),
    entity_type: z.nativeEnum(GuildScheduledEventType),
    entity_id: SnowflakeSchema.nullable(),
    entity_metadata: GuildScheduledEventEntityMetadataSchema.nullable(),
    creator: UserSchema.optional(),
    user_count: z.number().int().optional(),
    image: z.string().nullish(),
    recurrence_rule: GuildScheduledEventRecurrenceRuleSchema.nullable(),
  })
  .strict();

export type GuildScheduledEventEntity = z.infer<
  typeof GuildScheduledEventSchema
>;
