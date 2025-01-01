import { z } from "zod";
import { SnowflakeSchema } from "../managers/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-keyword-matching-strategies}
 */
export const AutoModerationKeywordMatchType = {
  prefix: "prefix",
  suffix: "suffix",
  anywhere: "anywhere",
  wholeWord: "whole_word",
} as const;

export type AutoModerationKeywordMatchType =
  (typeof AutoModerationKeywordMatchType)[keyof typeof AutoModerationKeywordMatchType];

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-metadata-field-limits}
 */
export const AutoModerationRuleLimit = {
  maxKeywordFilter: 1000,
  maxKeywordLength: 60,
  maxRegexPatterns: 10,
  maxRegexLength: 260,
  maxAllowListKeyword: 100,
  maxAllowListPreset: 1000,
} as const;

export type AutoModerationRuleLimit =
  (typeof AutoModerationRuleLimit)[keyof typeof AutoModerationRuleLimit];

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-types}
 */
export const AutoModerationMaxRuleType = {
  keyboard: 6,
  spam: 1,
  keywordPreset: 1,
  mentionSpam: 1,
  memberProfile: 1,
} as const;

export type AutoModerationMaxRuleType =
  (typeof AutoModerationMaxRuleType)[keyof typeof AutoModerationMaxRuleType];

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-metadata}
 */
export const AutoModerationRegexMetadataSchema = z
  .object({
    pattern: z.string().max(260),
    valid: z.boolean(),
  })
  .strict();

export type AutoModerationRegexMetadata = z.infer<
  typeof AutoModerationRegexMetadataSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object-action-metadata}
 */
export const AutoModerationActionMetadataSchema = z
  .object({
    channel_id: SnowflakeSchema,
    duration_seconds: z.number().int().max(2419200),
    custom_message: z.string().max(150).optional(),
  })
  .strict();

export type AutoModerationActionMetadata = z.infer<
  typeof AutoModerationActionMetadataSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object-action-types}
 */
export const AutoModerationActionType = {
  blockMessage: 1,
  sendAlertMessage: 2,
  timeout: 3,
  blockMemberInteraction: 4,
} as const;

export type AutoModerationActionType =
  (typeof AutoModerationActionType)[keyof typeof AutoModerationActionType];

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object-auto-moderation-action-structure}
 */
export const AutoModerationActionSchema = z
  .object({
    type: z.nativeEnum(AutoModerationActionType),
    metadata: AutoModerationActionMetadataSchema.optional(),
  })
  .strict()
  .refine((data) => {
    if (data.type === 2 && !data.metadata?.channel_id) {
      return false;
    }

    if (data.type === 3 && !data.metadata?.duration_seconds) {
      return false;
    }

    return true;
  });

export type AutoModerationActionEntity = z.infer<
  typeof AutoModerationActionSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-event-types}
 */
export const AutoModerationEventType = {
  messageSend: 1,
  memberUpdate: 2,
} as const;

export type AutoModerationEventType =
  (typeof AutoModerationEventType)[keyof typeof AutoModerationEventType];

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-keyword-preset-types}
 */
export const AutoModerationKeywordPresetType = {
  profanity: 1,
  sexualContent: 2,
  slurs: 3,
} as const;

export type AutoModerationKeywordPresetType =
  (typeof AutoModerationKeywordPresetType)[keyof typeof AutoModerationKeywordPresetType];

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-metadata}
 */
export const AutoModerationRuleTriggerMetadataSchema = z
  .object({
    keyword_filter: z.array(z.string().max(60)).max(1000).optional(),
    regex_patterns: z.array(z.string().max(260)).max(10).optional(),
    presets: z.array(z.nativeEnum(AutoModerationKeywordPresetType)).optional(),
    allow_list: z.array(z.string().max(60)).max(100).optional(),
    mention_total_limit: z.number().int().min(0).max(50).optional(),
    mention_raid_protection_enabled: z.boolean().optional(),
  })
  .strict();

export type AutoModerationRuleTriggerMetadata = z.infer<
  typeof AutoModerationRuleTriggerMetadataSchema
>;

export const AutoModerationRuleTriggerMetadataWithValidationSchema =
  AutoModerationRuleTriggerMetadataSchema.extend({
    regex_validation: z.array(AutoModerationRegexMetadataSchema).optional(),
    keyword_match_type: z.nativeEnum(AutoModerationKeywordMatchType).optional(),
  }).strict();

export type AutoModerationRuleTriggerMetadataWithValidation = z.infer<
  typeof AutoModerationRuleTriggerMetadataWithValidationSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-types}
 */
export const AutoModerationRuleTriggerType = {
  keyword: 1,
  spam: 3,
  keywordPreset: 4,
  mentionSpam: 5,
  memberProfile: 6,
} as const;

export type AutoModerationRuleTriggerType =
  (typeof AutoModerationRuleTriggerType)[keyof typeof AutoModerationRuleTriggerType];

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-auto-moderation-rule-structure}
 */
export const AutoModerationRuleSchema = z
  .object({
    id: SnowflakeSchema,
    guild_id: SnowflakeSchema,
    name: z.string(),
    creator_id: SnowflakeSchema,
    event_type: z.nativeEnum(AutoModerationEventType),
    trigger_type: z.nativeEnum(AutoModerationRuleTriggerType),
    trigger_metadata: AutoModerationRuleTriggerMetadataSchema,
    actions: z.array(AutoModerationActionSchema).max(3),
    enabled: z.boolean(),
    exempt_roles: z.array(SnowflakeSchema).max(20),
    exempt_channels: z.array(SnowflakeSchema).max(50),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (
      (data.trigger_type === 1 || data.trigger_type === 6) &&
      !data.trigger_metadata.keyword_filter
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "keyword_filter is required for Keyword and MemberProfile trigger types",
      });
    }

    if (data.trigger_type === 5 && !data.trigger_metadata.mention_total_limit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "mention_total_limit is required for MentionSpam trigger type",
      });
    }

    const hasTimeout = data.actions.some((action) => action.type === 3);
    if (hasTimeout && data.trigger_type !== 1 && data.trigger_type !== 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "TIMEOUT action only supported for Keyword and MentionSpam rules",
      });
    }
  });

export type AutoModerationRuleEntity = z.infer<typeof AutoModerationRuleSchema>;
