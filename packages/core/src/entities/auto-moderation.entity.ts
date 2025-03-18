import { z } from "zod";
import { Snowflake } from "../managers/index.js";

/**
 * Strategies for keyword matching in auto-moderation
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/auto-moderation.md#keyword-matching-strategies}
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
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/auto-moderation.md#trigger-metadata-field-limits}
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
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/auto-moderation.md#trigger-types}
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
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/auto-moderation.md#action-types}
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
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/auto-moderation.md#event-types}
 */
export enum AutoModerationEventType {
  /** When a member sends or edits a message in the guild */
  MessageSend = 1,

  /** When a member edits their profile */
  MemberUpdate = 2,
}

/**
 * Preset word lists for content filtering
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/auto-moderation.md#keyword-preset-types}
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
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/auto-moderation.md#trigger-types}
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
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/auto-moderation.md#trigger-metadata}
 */
export const AutoModerationRegexMetadataEntity = z.object({
  /** Regular expression pattern */
  pattern: z.string().max(AutoModerationRuleLimit.MaxRegexLength),

  /** Whether the regex pattern is valid */
  valid: z.boolean(),
});

export type AutoModerationRegexMetadataEntity = z.infer<
  typeof AutoModerationRegexMetadataEntity
>;

/**
 * Metadata for auto-moderation actions
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/auto-moderation.md#action-metadata}
 */
export const AutoModerationActionMetadataEntity = z
  .object({
    /** Channel to which user content should be logged */
    channel_id: Snowflake.optional(),

    /** Timeout duration in seconds (maximum of 2419200 seconds, which is 4 weeks) */
    duration_seconds: z.number().int().min(1).max(2419200).optional(),

    /** Additional explanation that will be shown to members whenever their message is blocked (maximum of 150 characters) */
    custom_message: z.string().max(150).optional(),
  })
  .refine(
    (data) => {
      // Si le channel_id est présent, assurez-vous qu'au moins une des propriétés est définie pour être valide
      return data.channel_id || data.duration_seconds || data.custom_message;
    },
    {
      message:
        "At least one of channel_id, duration_seconds, or custom_message must be present",
    },
  )
  .sourceType();

export type AutoModerationActionMetadataEntity = z.infer<
  typeof AutoModerationActionMetadataEntity
>;

/**
 * Action to be taken when a rule is triggered
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/auto-moderation.md#auto-moderation-action-object}
 */
export const AutoModerationActionEntity = z
  .object({
    /** The type of action */
    type: z.nativeEnum(AutoModerationActionType),

    /** Additional metadata needed during execution for this specific action type */
    metadata: AutoModerationActionMetadataEntity.optional(),
  })
  .refine(
    (data) => {
      // Valider que le metadata est présent pour les types d'action qui en ont besoin
      if (data.type === AutoModerationActionType.SendAlertMessage) {
        return !!data.metadata?.channel_id;
      }

      if (data.type === AutoModerationActionType.Timeout) {
        return !!data.metadata?.duration_seconds;
      }

      return true;
    },
    {
      message: "Required metadata fields missing for this action type",
    },
  )
  .sourceType();

export type AutoModerationActionEntity = z.infer<
  typeof AutoModerationActionEntity
>;

/**
 * Additional data used to determine whether a rule should be triggered
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/auto-moderation.md#trigger-metadata}
 */
export const AutoModerationRuleTriggerMetadataEntity = z
  .object({
    /** Substrings which will be searched for in content (Maximum of 1000) */
    keyword_filter: z
      .string()
      .max(AutoModerationRuleLimit.MaxKeywordLength)
      .array()
      .max(AutoModerationRuleLimit.MaxKeywordFilter)
      .optional(),

    /** Regular expression patterns which will be matched against content (Maximum of 10) */
    regex_patterns: z
      .string()
      .max(AutoModerationRuleLimit.MaxRegexLength)
      .array()
      .max(AutoModerationRuleLimit.MaxRegexPatterns)
      .optional(),

    /** The internally pre-defined wordsets which will be searched for in content */
    presets: z.nativeEnum(AutoModerationKeywordPresetType).array().optional(),

    /** Substrings which should not trigger the rule (Maximum of 100 or 1000 depending on trigger type) */
    allow_list: z
      .string()
      .max(AutoModerationRuleLimit.MaxKeywordLength)
      .array()
      .max(AutoModerationRuleLimit.MaxAllowListPreset)
      .optional(),

    /** Total number of unique role and user mentions allowed per message (Maximum of 50) */
    mention_total_limit: z.number().int().min(1).max(50).optional(),

    /** Whether to automatically detect mention raids */
    mention_raid_protection_enabled: z.boolean().optional(),

    /** Validation results for regex patterns */
    regex_validation: AutoModerationRegexMetadataEntity.array().optional(),

    /** The type of keyword matching strategy used */
    keyword_match_type: z
      .nativeEnum(AutoModerationKeywordMatchType)
      .array()
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Validation plus spécifique en fonction des données
    if (data.allow_list && data.allow_list.length > 0) {
      if (data.presets && data.presets.length > 0) {
        // Pour KeywordPreset, la limite est plus grande
        if (
          data.allow_list.length > AutoModerationRuleLimit.MaxAllowListPreset
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.too_big,
            type: "array",
            maximum: AutoModerationRuleLimit.MaxAllowListPreset,
            inclusive: true,
            path: ["allow_list"],
            message: `allow_list can contain at most ${AutoModerationRuleLimit.MaxAllowListPreset} items for KeywordPreset trigger type`,
          });
        }
      } else if (
        data.allow_list.length > AutoModerationRuleLimit.MaxAllowListKeyword
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_big,
          type: "array",
          maximum: AutoModerationRuleLimit.MaxAllowListKeyword,
          inclusive: true,
          path: ["allow_list"],
          message: `allow_list can contain at most ${AutoModerationRuleLimit.MaxAllowListKeyword} items for this trigger type`,
        });
      }
    }
  })
  .sourceType();

export type AutoModerationRuleTriggerMetadataEntity = z.infer<
  typeof AutoModerationRuleTriggerMetadataEntity
>;

/**
 * A rule that automatically takes actions based on content in a guild
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/auto-moderation.md#auto-moderation-rule-object}
 */
export const AutoModerationRuleEntity = z
  .object({
    /** The id of this rule */
    id: Snowflake,

    /** The id of the guild which this rule belongs to */
    guild_id: Snowflake,

    /** The rule name */
    name: z.string().min(1).max(100),

    /** The user which first created this rule */
    creator_id: Snowflake,

    /** The rule event type */
    event_type: z.nativeEnum(AutoModerationEventType),

    /** The rule trigger type */
    trigger_type: z.nativeEnum(AutoModerationRuleTriggerType),

    /** The rule trigger metadata */
    trigger_metadata: AutoModerationRuleTriggerMetadataEntity,

    /** The actions which will execute when the rule is triggered */
    actions: AutoModerationActionEntity.array().min(1).max(3),

    /** Whether the rule is enabled */
    enabled: z.boolean(),

    /** The role ids that should not be affected by the rule (Maximum of 20) */
    exempt_roles: Snowflake.array().max(20),

    /** The channel ids that should not be affected by the rule (Maximum of 50) */
    exempt_channels: Snowflake.array().max(50),
  })
  .superRefine((data, ctx) => {
    // Vérifications supplémentaires basées sur le trigger_type
    switch (data.trigger_type) {
      case AutoModerationRuleTriggerType.Keyword:
      case AutoModerationRuleTriggerType.MemberProfile:
        if (
          !data.trigger_metadata.keyword_filter ||
          data.trigger_metadata.keyword_filter.length === 0
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["trigger_metadata", "keyword_filter"],
            message:
              "keyword_filter is required for KEYWORD and MEMBER_PROFILE trigger types",
          });
        }
        break;

      case AutoModerationRuleTriggerType.KeywordPreset:
        if (
          !data.trigger_metadata.presets ||
          data.trigger_metadata.presets.length === 0
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["trigger_metadata", "presets"],
            message: "presets is required for KEYWORD_PRESET trigger type",
          });
        }
        break;

      case AutoModerationRuleTriggerType.MentionSpam:
        if (
          !(
            data.trigger_metadata.mention_total_limit ||
            data.trigger_metadata.mention_raid_protection_enabled
          )
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["trigger_metadata"],
            message:
              "Either mention_total_limit or mention_raid_protection_enabled must be set for MENTION_SPAM trigger type",
          });
        }
        break;

      default:
        break;
    }

    // Vérification des actions pour le type Timeout (uniquement pour KEYWORD et MENTION_SPAM)
    const hasTimeoutAction = data.actions.some(
      (action) => action.type === AutoModerationActionType.Timeout,
    );
    if (
      hasTimeoutAction &&
      data.trigger_type !== AutoModerationRuleTriggerType.Keyword &&
      data.trigger_type !== AutoModerationRuleTriggerType.MentionSpam
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["actions"],
        message:
          "TIMEOUT action can only be set up for KEYWORD and MENTION_SPAM rules",
      });
    }
  })
  .sourceType();

export type AutoModerationRuleEntity = z.infer<typeof AutoModerationRuleEntity>;
