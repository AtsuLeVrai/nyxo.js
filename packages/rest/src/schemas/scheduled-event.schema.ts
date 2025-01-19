import {
  GuildScheduledEventEntityMetadataEntity,
  GuildScheduledEventPrivacyLevel,
  GuildScheduledEventRecurrenceRuleEntity,
  GuildScheduledEventStatus,
  GuildScheduledEventType,
  Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { FileHandler } from "../handlers/index.js";
import type { FileInput } from "../types/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#create-guild-scheduled-event-json-params}
 */
export const CreateGuildScheduledEventSchema = z.object({
  channel_id: Snowflake.optional(),
  entity_metadata: GuildScheduledEventEntityMetadataEntity.optional(),
  name: z.string().min(1).max(100),
  privacy_level: z.nativeEnum(GuildScheduledEventPrivacyLevel),
  scheduled_start_time: z.string().datetime(),
  scheduled_end_time: z.string().datetime().optional(),
  description: z.string().min(1).max(1000).optional(),
  entity_type: z.nativeEnum(GuildScheduledEventType),
  image: z
    .custom<FileInput>(FileHandler.isValidFileInput)
    .transform(FileHandler.toDataUri)
    .optional(),
  recurrence_rule: GuildScheduledEventRecurrenceRuleEntity.optional(),
});

export type CreateGuildScheduledEventSchema = z.input<
  typeof CreateGuildScheduledEventSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#modify-guild-scheduled-event-json-params}
 */
export const ModifyGuildScheduledEventSchema =
  CreateGuildScheduledEventSchema.partial().merge(
    z.object({
      status: z.nativeEnum(GuildScheduledEventStatus).optional(),
    }),
  );

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
