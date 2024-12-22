import {
  type AutoModerationActionEntity,
  type AutoModerationActionMetadata,
  AutoModerationActionType,
  AutoModerationEventType,
  type AutoModerationRuleTriggerMetadata,
  AutoModerationRuleTriggerType,
  SnowflakeManager,
} from "@nyxjs/core";
import { z } from "zod";

const AutoModerationRuleTriggerMetadataSchema: z.ZodType<AutoModerationRuleTriggerMetadata> =
  z
    .object({
      keyword_filter: z.array(z.string()).max(1000).optional(),
      regex_patterns: z.array(z.string()).max(10).optional(),
      presets: z.array(z.number()).optional(),
      allow_list: z.array(z.string()).max(100).max(1000).optional(),
      mention_total_limit: z.number().int().max(50).optional(),
      mention_raid_protection_enabled: z.boolean().optional(),
    })
    .strict();

const AutoModerationActionMetadataSchema: z.ZodType<AutoModerationActionMetadata> =
  z
    .object({
      channel_id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX),
      duration_seconds: z.number().int().max(2419200),
      custom_message: z.string().max(150).optional(),
    })
    .strict();

const AutoModerationActionSchema: z.ZodType<AutoModerationActionEntity> = z
  .object({
    type: z.nativeEnum(AutoModerationActionType),
    metadata: AutoModerationActionMetadataSchema.optional(),
  })
  .strict();

export const CreateAutoModerationRuleSchema = z
  .object({
    name: z.string(),
    event_type: z.nativeEnum(AutoModerationEventType),
    trigger_type: z.nativeEnum(AutoModerationRuleTriggerType),
    trigger_metadata: AutoModerationRuleTriggerMetadataSchema.optional(),
    actions: z.array(AutoModerationActionSchema),
    enabled: z.boolean().default(false).optional(),
    exempt_roles: z
      .array(z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX))
      .max(20)
      .optional(),
    exempt_channels: z
      .array(z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX))
      .max(50)
      .optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule-json-params}
 */
export type CreateAutoModerationRuleEntity = z.infer<
  typeof CreateAutoModerationRuleSchema
>;

export const ModifyAutoModerationRuleSchema =
  CreateAutoModerationRuleSchema.omit({
    trigger_type: true,
  })
    .strict()
    .partial();

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule-json-params}
 */
export type ModifyAutoModerationRuleEntity = z.infer<
  typeof ModifyAutoModerationRuleSchema
>;
