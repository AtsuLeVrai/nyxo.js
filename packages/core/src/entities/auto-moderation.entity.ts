import { z } from "zod";
import { Snowflake } from "../managers/index.js";

/**
 * Strategies for keyword matching in auto-moderation
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-keyword-matching-strategies}
 */
export enum AutoModerationKeywordMatchType {
  /** Word must start with the keyword */
  Prefix = "prefix",

  /** Word must end with the keyword */
  Suffix = "suffix",

  /** Keyword can appear anywhere in the content */
  Anywhere = "anywhere",

  /** Keyword is a full word or phrase and must be surrounded by whitespace */
  WholeWord = "whole_word",
}

/**
 * Maximum limits for auto-moderation rule configurations
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-metadata-field-limits}
 */
export enum AutoModerationRuleLimit {
  /** Maximum number of keywords in a filter */
  MaxKeywordFilter = 1000,

  /** Maximum length of a keyword */
  MaxKeywordLength = 60,

  /** Maximum number of regex patterns allowed */
  MaxRegexPatterns = 10,

  /** Maximum length of a regex pattern */
  MaxRegexLength = 260,

  /** Maximum number of keywords in an allow list for Keyword and Member Profile trigger types */
  MaxAllowListKeyword = 100,

  /** Maximum number of keywords in an allow list for Keyword Preset trigger type */
  MaxAllowListPreset = 1000,
}

/**
 * Maximum number of rules per guild for each trigger type
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-types}
 */
export enum AutoModerationMaxRuleType {
  /** Maximum number of member profile rules */
  MemberProfile = 1,

  /** Maximum number of keyword rules */
  Keyboard = 6,

  /** Maximum number of spam rules */
  Spam = 1,

  /** Maximum number of keyword preset rules */
  KeywordPreset = 1,

  /** Maximum number of mention spam rules */
  MentionSpam = 1,
}

/**
 * Types of actions that can be taken when a rule is triggered
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object-action-types}
 */
export enum AutoModerationActionType {
  /** Blocks a member's message and prevents it from being posted */
  BlockMessage = 1,

  /** Logs user content to a specified channel */
  SendAlertMessage = 2,

  /** Timeout user for a specified duration */
  Timeout = 3,

  /** Prevents a member from using text, voice, or other interactions */
  BlockMemberInteraction = 4,
}

/**
 * Event contexts in which a rule should be checked
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-event-types}
 */
export enum AutoModerationEventType {
  /** When a member sends or edits a message in the guild */
  MessageSend = 1,

  /** When a member edits their profile */
  MemberUpdate = 2,
}

/**
 * Preset word lists for content filtering
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-keyword-preset-types}
 */
export enum AutoModerationKeywordPresetType {
  /** Words that may be considered forms of swearing or cursing */
  Profanity = 1,

  /** Words that refer to sexually explicit behavior or activity */
  SexualContent = 2,

  /** Personal insults or words that may be considered hate speech */
  Slurs = 3,
}

/**
 * Types of content that can trigger a rule
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-types}
 */
export enum AutoModerationRuleTriggerType {
  /** Check if content contains words from a user defined list of keywords */
  Keyword = 1,

  /** Check if content represents generic spam */
  Spam = 3,

  /** Check if content contains words from internal pre-defined wordsets */
  KeywordPreset = 4,

  /** Check if content contains more unique mentions than allowed */
  MentionSpam = 5,

  /** Check if member profile contains words from a user defined list of keywords */
  MemberProfile = 6,
}

/**
 * Regex metadata for auto-moderation rules
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-metadata}
 */
export const AutoModerationRegexMetadataEntity = z.object({
  /** Regular expression pattern */
  pattern: z.string().max(260),

  /** Whether the regex pattern is valid */
  valid: z.boolean(),
});

export type AutoModerationRegexMetadataEntity = z.infer<
  typeof AutoModerationRegexMetadataEntity
>;

/**
 * Metadata for auto-moderation actions
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object-action-metadata}
 */
export const AutoModerationActionMetadataEntity = z.object({
  /** Channel to which user content should be logged */
  channel_id: Snowflake,

  /** Timeout duration in seconds (maximum of 2419200 seconds, which is 4 weeks) */
  duration_seconds: z.number().int().max(2419200),

  /** Additional explanation that will be shown to members whenever their message is blocked (maximum of 150 characters) */
  custom_message: z.string().max(150).optional(),
});

export type AutoModerationActionMetadataEntity = z.infer<
  typeof AutoModerationActionMetadataEntity
>;

/**
 * Action to be taken when a rule is triggered
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object-auto-moderation-action-structure}
 */
export const AutoModerationActionEntity = z
  .object({
    /** The type of action */
    type: z.nativeEnum(AutoModerationActionType),

    /** Additional metadata needed during execution for this specific action type */
    metadata: AutoModerationActionMetadataEntity.optional(),
  })
  .refine((data) => {
    if (
      (data.type === 2 && !data.metadata?.channel_id) ||
      (data.type === 3 && !data.metadata?.duration_seconds)
    ) {
      return false;
    }

    return true;
  });

export type AutoModerationActionEntity = z.infer<
  typeof AutoModerationActionEntity
>;

/**
 * Additional data used to determine whether a rule should be triggered
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-metadata}
 */
export const AutoModerationRuleTriggerMetadataEntity = z.object({
  /** Substrings which will be searched for in content (Maximum of 1000) */
  keyword_filter: z.array(z.string().max(60)).max(1000).optional(),

  /** Regular expression patterns which will be matched against content (Maximum of 10) */
  regex_patterns: z.array(z.string().max(260)).max(10).optional(),

  /** The internally pre-defined wordsets which will be searched for in content */
  presets: z.array(z.nativeEnum(AutoModerationKeywordPresetType)).optional(),

  /** Substrings which should not trigger the rule (Maximum of 100 or 1000) */
  allow_list: z.array(z.string().max(60)).max(100).optional(),

  /** Total number of unique role and user mentions allowed per message (Maximum of 50) */
  mention_total_limit: z.number().int().min(0).max(50).optional(),

  /** Whether to automatically detect mention raids */
  mention_raid_protection_enabled: z.boolean().optional(),
});

export type AutoModerationRuleTriggerMetadataEntity = z.infer<
  typeof AutoModerationRuleTriggerMetadataEntity
>;

/**
 * Extended trigger metadata with validation fields
 */
export const AutoModerationRuleTriggerMetadataWithValidationEntity =
  AutoModerationRuleTriggerMetadataEntity.extend({
    /** Validation results for regex patterns */
    regex_validation: z.array(AutoModerationRegexMetadataEntity).optional(),

    /** The type of keyword matching strategy used */
    keyword_match_type: z.nativeEnum(AutoModerationKeywordMatchType).optional(),
  });

export type AutoModerationRuleTriggerMetadataWithValidationEntity = z.infer<
  typeof AutoModerationRuleTriggerMetadataWithValidationEntity
>;

/**
 * A rule that automatically takes actions based on content in a guild
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-auto-moderation-rule-structure}
 */
export const AutoModerationRuleEntity = z
  .object({
    /** The id of this rule */
    id: Snowflake,

    /** The id of the guild which this rule belongs to */
    guild_id: Snowflake,

    /** The rule name */
    name: z.string(),

    /** The user which first created this rule */
    creator_id: Snowflake,

    /** The rule event type */
    event_type: z.nativeEnum(AutoModerationEventType),

    /** The rule trigger type */
    trigger_type: z.nativeEnum(AutoModerationRuleTriggerType),

    /** The rule trigger metadata */
    trigger_metadata: AutoModerationRuleTriggerMetadataEntity,

    /** The actions which will execute when the rule is triggered */
    actions: z.array(AutoModerationActionEntity).max(3),

    /** Whether the rule is enabled */
    enabled: z.boolean(),

    /** The role ids that should not be affected by the rule (Maximum of 20) */
    exempt_roles: z.array(Snowflake).max(20),

    /** The channel ids that should not be affected by the rule (Maximum of 50) */
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
