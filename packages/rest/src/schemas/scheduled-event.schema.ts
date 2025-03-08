import {
  GuildScheduledEventPrivacyLevel,
  GuildScheduledEventRecurrenceRuleFrequency,
  GuildScheduledEventRecurrenceRuleMonth,
  GuildScheduledEventRecurrenceRuleWeekday,
  GuildScheduledEventStatus,
  GuildScheduledEventType,
  Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { type FileInput, fileHandler } from "../handlers/index.js";

export const GuildScheduledEventEntityMetadataSchema = z.object({
  location: z.string().min(1).max(100).optional(),
});

export type GuildScheduledEventEntityMetadataSchema = z.input<
  typeof GuildScheduledEventEntityMetadataSchema
>;

export const GuildScheduledEventRecurrenceRuleWeekdaySchema = z.object({
  n: z.number().int().min(1).max(5),
  day: z.nativeEnum(GuildScheduledEventRecurrenceRuleWeekday),
});

export type GuildScheduledEventRecurrenceRuleWeekdaySchema = z.input<
  typeof GuildScheduledEventRecurrenceRuleWeekdaySchema
>;

export const GuildScheduledEventRecurrenceRuleSchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime().nullable(),
  frequency: z.nativeEnum(GuildScheduledEventRecurrenceRuleFrequency),
  interval: z.number().int().positive(),
  by_weekday: z
    .array(z.nativeEnum(GuildScheduledEventRecurrenceRuleWeekday))
    .nullable(),
  by_n_weekday: z
    .array(GuildScheduledEventRecurrenceRuleWeekdaySchema)
    .nullable(),
  by_month: z
    .array(z.nativeEnum(GuildScheduledEventRecurrenceRuleMonth))
    .nullable(),
  by_month_day: z.array(z.number().int().min(1).max(31)).nullable(),
  by_year_day: z.array(z.number().int().min(1).max(364)).nullable(),
  count: z.number().int().positive().nullable(),
});

export type GuildScheduledEventRecurrenceRuleSchema = z.input<
  typeof GuildScheduledEventRecurrenceRuleSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#create-guild-scheduled-event-json-params}
 */
export const CreateGuildScheduledEventSchema = z.object({
  channel_id: Snowflake.optional(),
  entity_metadata: GuildScheduledEventEntityMetadataSchema.optional(),
  name: z.string().min(1).max(100),
  privacy_level: z.nativeEnum(GuildScheduledEventPrivacyLevel),
  scheduled_start_time: z.string().datetime(),
  scheduled_end_time: z.string().datetime().optional(),
  description: z.string().min(1).max(1000).optional(),
  entity_type: z.nativeEnum(GuildScheduledEventType),
  image: z
    .custom<FileInput>(fileHandler.isValidSingleInput)
    .transform(fileHandler.toDataUri)
    .optional(),
  recurrence_rule: GuildScheduledEventRecurrenceRuleSchema.optional(),
});

export type CreateGuildScheduledEventSchema = z.input<
  typeof CreateGuildScheduledEventSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#modify-guild-scheduled-event-json-params}
 */
export const ModifyGuildScheduledEventSchema =
  CreateGuildScheduledEventSchema.partial().extend({
    status: z.nativeEnum(GuildScheduledEventStatus).optional(),
  });

export type ModifyGuildScheduledEventSchema = z.input<
  typeof ModifyGuildScheduledEventSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event-users-query-string-params}
 */
export const GetGuildScheduledEventUsersQuerySchema = z.object({
  limit: z.number().max(100).default(100),
  with_member: z.boolean().default(false),
  before: Snowflake.optional(),
  after: Snowflake.optional(),
});

export type GetGuildScheduledEventUsersQuerySchema = z.input<
  typeof GetGuildScheduledEventUsersQuerySchema
>;
