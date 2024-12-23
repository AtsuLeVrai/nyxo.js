import {
  type GuildScheduledEventEntityMetadata,
  GuildScheduledEventPrivacyLevel,
  type GuildScheduledEventRecurrenceRuleEntity,
  GuildScheduledEventRecurrenceRuleFrequency,
  GuildScheduledEventRecurrenceRuleMonth,
  type GuildScheduledEventRecurrenceRuleNWeekdayEntity,
  GuildScheduledEventRecurrenceRuleWeekday,
  GuildScheduledEventStatus,
  GuildScheduledEventType,
  SnowflakeManager,
} from "@nyxjs/core";
import { z } from "zod";

const GuildScheduledEventEntityMetadataSchema: z.ZodType<GuildScheduledEventEntityMetadata> =
  z
    .object({
      location: z.string().min(1).max(100).optional(),
    })
    .strict();

const guildScheduledEventRecurrenceRuleNWeekdaySchema: z.ZodType<GuildScheduledEventRecurrenceRuleNWeekdayEntity> =
  z
    .object({
      n: z.union([
        z.literal(1),
        z.literal(2),
        z.literal(3),
        z.literal(4),
        z.literal(5),
      ]),
      day: z.nativeEnum(GuildScheduledEventRecurrenceRuleWeekday),
    })
    .strict();

const GuildScheduledEventRecurrenceRuleSchema: z.ZodType<GuildScheduledEventRecurrenceRuleEntity> =
  z
    .object({
      start: z.string().datetime(),
      end: z.string().datetime().nullable(),
      frequency: z.nativeEnum(GuildScheduledEventRecurrenceRuleFrequency),
      interval: z.number().int(),
      by_weekday: z
        .array(z.nativeEnum(GuildScheduledEventRecurrenceRuleWeekday))
        .nullable(),
      by_n_weekday: z
        .array(guildScheduledEventRecurrenceRuleNWeekdaySchema)
        .nullable(),
      by_month: z
        .array(z.nativeEnum(GuildScheduledEventRecurrenceRuleMonth))
        .nullable(),
      by_month_day: z.array(z.number().int()).nullable(),
      by_year_day: z.array(z.number().int()).nullable(),
      count: z.number().int().nullable(),
    })
    .strict();

export const CreateGuildScheduledEventSchema = z
  .object({
    channel_id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
    entity_metadata: GuildScheduledEventEntityMetadataSchema.optional(),
    name: z.string().min(1).max(100),
    privacy_level: z.nativeEnum(GuildScheduledEventPrivacyLevel),
    scheduled_start_time: z.string().datetime(),
    scheduled_end_time: z.string().datetime().optional(),
    description: z.string().min(1).max(1000).optional(),
    entity_type: z.nativeEnum(GuildScheduledEventType),
    image: z
      .string()
      .regex(/^data:image\/(jpeg|png|gif);base64,/)
      .optional(),
    recurrence_rule: GuildScheduledEventRecurrenceRuleSchema.optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#create-guild-scheduled-event-json-params}
 */
export type CreateGuildScheduledEventEntity = z.infer<
  typeof CreateGuildScheduledEventSchema
>;

export const ModifyGuildScheduledEventSchema =
  CreateGuildScheduledEventSchema.partial().merge(
    z
      .object({
        status: z.nativeEnum(GuildScheduledEventStatus).optional(),
      })
      .strict(),
  );

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#modify-guild-scheduled-event-json-params}
 */
export type ModifyGuildScheduledEventEntity = z.infer<
  typeof ModifyGuildScheduledEventSchema
>;

export const GetGuildScheduledEventUsersQuerySchema = z
  .object({
    limit: z.number().max(100).default(100).optional(),
    with_member: z.boolean().default(false).optional(),
    before: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
    after: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event-users-query-string-params}
 */
export type GetGuildScheduledEventUsersQueryEntity = z.infer<
  typeof GetGuildScheduledEventUsersQuerySchema
>;
