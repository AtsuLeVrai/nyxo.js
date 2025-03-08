import {
  AutoModerationActionType,
  AutoModerationEventType,
  AutoModerationKeywordMatchType,
  AutoModerationKeywordPresetType,
  AutoModerationRuleLimit,
  AutoModerationRuleTriggerType,
  Snowflake,
} from "@nyxjs/core";
import { z } from "zod";

export const AutoModerationRegexMetadataSchema = z.object({
  pattern: z.string(),
  valid: z.boolean(),
});

export const AutoModerationRuleTriggerMetadataSchema = z.object({
  keyword_filter: z
    .array(z.string().max(AutoModerationRuleLimit.MaxKeywordLength))
    .max(AutoModerationRuleLimit.MaxKeywordFilter)
    .optional(),
  regex_patterns: z
    .array(z.string().max(AutoModerationRuleLimit.MaxRegexLength))
    .max(AutoModerationRuleLimit.MaxRegexPatterns)
    .optional(),
  presets: z.array(z.nativeEnum(AutoModerationKeywordPresetType)).optional(),
  allow_list: z
    .array(z.string())
    .max(AutoModerationRuleLimit.MaxAllowListPreset)
    .optional(),
  mention_total_limit: z.number().int().min(0).max(50).optional(),
  mention_raid_protection_enabled: z.boolean().optional(),
  regex_validation: z.array(AutoModerationRegexMetadataSchema).optional(),
  keyword_match_type: z
    .array(z.nativeEnum(AutoModerationKeywordMatchType))
    .optional(),
});

export type AutoModerationRuleTriggerMetadataSchema = z.input<
  typeof AutoModerationRuleTriggerMetadataSchema
>;

export const AutoModerationActionMetadataSchema = z
  .object({
    channel_id: Snowflake.optional(),
    duration_seconds: z.number().int().min(0).max(2419200).optional(),
    custom_message: z.string().max(150).optional(),
  })
  .partial();

export const AutoModerationActionSchema = z.object({
  type: z.nativeEnum(AutoModerationActionType),
  metadata: AutoModerationActionMetadataSchema.optional(),
});

export type AutoModerationActionSchema = z.input<
  typeof AutoModerationActionSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule-json-params}
 */
export const CreateAutoModerationRuleSchema = z.object({
  name: z.string(),
  event_type: z.nativeEnum(AutoModerationEventType),
  trigger_type: z.nativeEnum(AutoModerationRuleTriggerType),
  trigger_metadata: AutoModerationRuleTriggerMetadataSchema.optional(),
  actions: z.array(AutoModerationActionSchema),
  enabled: z.boolean().default(false),
  exempt_roles: z.array(Snowflake).max(20).optional(),
  exempt_channels: z.array(Snowflake).max(50).optional(),
});

export type CreateAutoModerationRuleSchema = z.input<
  typeof CreateAutoModerationRuleSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule-json-params}
 */

export const ModifyAutoModerationRuleSchema =
  CreateAutoModerationRuleSchema.omit({
    trigger_type: true,
  }).partial();

export type ModifyAutoModerationRuleSchema = z.input<
  typeof ModifyAutoModerationRuleSchema
>;
