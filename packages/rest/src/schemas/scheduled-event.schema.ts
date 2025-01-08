import {
  GuildScheduledEventEntityMetadataEntity,
  GuildScheduledEventPrivacyLevel,
  GuildScheduledEventRecurrenceRuleEntity,
  GuildScheduledEventStatus,
  GuildScheduledEventType,
  Snowflake,
} from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#create-guild-scheduled-event-json-params}
 */
export const CreateGuildScheduledEventEntity = z
  .object({
    channel_id: Snowflake.optional(),
    entity_metadata: GuildScheduledEventEntityMetadataEntity.optional(),
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
    recurrence_rule: GuildScheduledEventRecurrenceRuleEntity.optional(),
  })
  .strict();

export type CreateGuildScheduledEventEntity = z.infer<
  typeof CreateGuildScheduledEventEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#modify-guild-scheduled-event-json-params}
 */
export const ModifyGuildScheduledEventEntity =
  CreateGuildScheduledEventEntity.partial().merge(
    z
      .object({
        status: z.nativeEnum(GuildScheduledEventStatus).optional(),
      })
      .strict(),
  );

export type ModifyGuildScheduledEventEntity = z.infer<
  typeof ModifyGuildScheduledEventEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event-users-query-string-params}
 */
export const GetGuildScheduledEventUsersQueryEntity = z
  .object({
    limit: z.number().max(100).default(100).optional(),
    with_member: z.boolean().default(false).optional(),
    before: Snowflake.optional(),
    after: Snowflake.optional(),
  })
  .strict();

export type GetGuildScheduledEventUsersQueryEntity = z.infer<
  typeof GetGuildScheduledEventUsersQueryEntity
>;
