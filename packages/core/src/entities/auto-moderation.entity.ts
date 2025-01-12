import { z } from "zod";
import { Snowflake } from "../managers/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-keyword-matching-strategies}
 */
export enum AutoModerationKeywordMatchType {
  Prefix = "prefix",
  Suffix = "suffix",
  Anywhere = "anywhere",
  WholeWord = "whole_word",
}

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-metadata-field-limits}
 */
export enum AutoModerationRuleLimit {
  MaxKeywordFilter = 1000,
  MaxKeywordLength = 60,
  MaxRegexPatterns = 10,
  MaxRegexLength = 260,
  MaxAllowListKeyword = 100,
  MaxAllowListPreset = 1000,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-types}
 */
export enum AutoModerationMaxRuleType {
  Keyboard = 6,
  Spam = 1,
  KeywordPreset = 1,
  MentionSpam = 1,
  MemberProfile = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-metadata}
 */
export const AutoModerationRegexMetadataEntity = z.object({
  pattern: z.string().max(260),
  valid: z.boolean(),
});

export type AutoModerationRegexMetadataEntity = z.infer<
  typeof AutoModerationRegexMetadataEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object-action-metadata}
 */
export const AutoModerationActionMetadataEntity = z.object({
  channel_id: Snowflake,
  duration_seconds: z.number().int().max(2419200),
  custom_message: z.string().max(150).optional(),
});

export type AutoModerationActionMetadataEntity = z.infer<
  typeof AutoModerationActionMetadataEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object-action-types}
 */
export enum AutoModerationActionType {
  BlockMessage = 1,
  SendAlertMessage = 2,
  Timeout = 3,
  BlockMemberInteraction = 4,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object-auto-moderation-action-structure}
 */
export const AutoModerationActionEntity = z
  .object({
    type: z.nativeEnum(AutoModerationActionType),
    metadata: AutoModerationActionMetadataEntity.optional(),
  })

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
  typeof AutoModerationActionEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-event-types}
 */
export enum AutoModerationEventType {
  MessageSend = 1,
  MemberUpdate = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-keyword-preset-types}
 */
export enum AutoModerationKeywordPresetType {
  Profanity = 1,
  SexualContent = 2,
  Slurs = 3,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-metadata}
 */
export const AutoModerationRuleTriggerMetadataEntity = z.object({
  keyword_filter: z.array(z.string().max(60)).max(1000).optional(),
  regex_patterns: z.array(z.string().max(260)).max(10).optional(),
  presets: z.array(z.nativeEnum(AutoModerationKeywordPresetType)).optional(),
  allow_list: z.array(z.string().max(60)).max(100).optional(),
  mention_total_limit: z.number().int().min(0).max(50).optional(),
  mention_raid_protection_enabled: z.boolean().optional(),
});

export type AutoModerationRuleTriggerMetadataEntity = z.infer<
  typeof AutoModerationRuleTriggerMetadataEntity
>;

export const AutoModerationRuleTriggerMetadataWithValidationEntity =
  AutoModerationRuleTriggerMetadataEntity.extend({
    regex_validation: z.array(AutoModerationRegexMetadataEntity).optional(),
    keyword_match_type: z.nativeEnum(AutoModerationKeywordMatchType).optional(),
  });

export type AutoModerationRuleTriggerMetadataWithValidationEntity = z.infer<
  typeof AutoModerationRuleTriggerMetadataWithValidationEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-types}
 */
export enum AutoModerationRuleTriggerType {
  Keyword = 1,
  Spam = 3,
  KeywordPreset = 4,
  MentionSpam = 5,
  MemberProfile = 6,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-auto-moderation-rule-structure}
 */
export const AutoModerationRuleEntity = z
  .object({
    id: Snowflake,
    guild_id: Snowflake,
    name: z.string(),
    creator_id: Snowflake,
    event_type: z.nativeEnum(AutoModerationEventType),
    trigger_type: z.nativeEnum(AutoModerationRuleTriggerType),
    trigger_metadata: AutoModerationRuleTriggerMetadataEntity,
    actions: z.array(AutoModerationActionEntity).max(3),
    enabled: z.boolean(),
    exempt_roles: z.array(Snowflake).max(20),
    exempt_channels: z.array(Snowflake).max(50),
  })

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

export type AutoModerationRuleEntity = z.infer<typeof AutoModerationRuleEntity>;
