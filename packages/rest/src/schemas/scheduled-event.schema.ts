import {
  GuildScheduledEventEntityMetadataSchema,
  GuildScheduledEventPrivacyLevel,
  GuildScheduledEventRecurrenceRuleSchema,
  GuildScheduledEventStatus,
  GuildScheduledEventType,
  SnowflakeSchema,
} from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#create-guild-scheduled-event-json-params}
 */
export const CreateGuildScheduledEventSchema = z
  .object({
    channel_id: SnowflakeSchema.optional(),
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

export type CreateGuildScheduledEventEntity = z.infer<
  typeof CreateGuildScheduledEventSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#modify-guild-scheduled-event-json-params}
 */
export const ModifyGuildScheduledEventSchema =
  CreateGuildScheduledEventSchema.partial().merge(
    z
      .object({
        status: z.nativeEnum(GuildScheduledEventStatus).optional(),
      })
      .strict(),
  );

export type ModifyGuildScheduledEventEntity = z.infer<
  typeof ModifyGuildScheduledEventSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event-users-query-string-params}
 */
export const GetGuildScheduledEventUsersQuerySchema = z
  .object({
    limit: z.number().max(100).default(100).optional(),
    with_member: z.boolean().default(false).optional(),
    before: SnowflakeSchema.optional(),
    after: SnowflakeSchema.optional(),
  })
  .strict();

export type GetGuildScheduledEventUsersQueryEntity = z.infer<
  typeof GetGuildScheduledEventUsersQuerySchema
>;
