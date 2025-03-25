import type { Snowflake } from "../managers/index.js";

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
export interface AutoModerationRegexMetadataEntity {
  /**
   * Regular expression pattern
   * @maxLength 260
   */
  pattern: string;

  /** Whether the regex pattern is valid */
  valid: boolean;
}

/**
 * Metadata for auto-moderation actions
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/auto-moderation.md#action-metadata}
 * @validate At least one of channel_id, duration_seconds, or custom_message must be present
 */
export interface AutoModerationActionMetadataEntity {
  /** Channel to which user content should be logged */
  channel_id?: Snowflake;

  /**
   * Timeout duration in seconds (maximum of 2419200 seconds, which is 4 weeks)
   * @minimum 1
   * @maximum 2419200
   */
  duration_seconds?: number;

  /**
   * Additional explanation that will be shown to members whenever their message is blocked (maximum of 150 characters)
   * @maxLength 150
   */
  custom_message?: string;
}

/**
 * Action to be taken when a rule is triggered
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/auto-moderation.md#auto-moderation-action-object}
 * @validate Required metadata fields missing for this action type
 */
export interface AutoModerationActionEntity {
  /** The type of action */
  type: AutoModerationActionType;

  /** Additional metadata needed during execution for this specific action type */
  metadata?: AutoModerationActionMetadataEntity;
}

/**
 * Additional data used to determine whether a rule should be triggered
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/auto-moderation.md#trigger-metadata}
 */
export interface AutoModerationRuleTriggerMetadataEntity {
  /**
   * Substrings which will be searched for in content (Maximum of 1000)
   * @maxItems 1000
   */
  keyword_filter?: string[];

  /**
   * Regular expression patterns which will be matched against content (Maximum of 10)
   * @maxItems 10
   */
  regex_patterns?: string[];

  /** The internally pre-defined wordsets which will be searched for in content */
  presets?: AutoModerationKeywordPresetType[];

  /**
   * Substrings which should not trigger the rule (Maximum of 100 or 1000 depending on trigger type)
   * @maxItems 1000
   * @validate allow_list can contain at most 100 items for Keyword and MemberProfile trigger types, or 1000 items for KeywordPreset trigger type
   */
  allow_list?: string[];

  /**
   * Total number of unique role and user mentions allowed per message (Maximum of 50)
   * @minimum 1
   * @maximum 50
   */
  mention_total_limit?: number;

  /** Whether to automatically detect mention raids */
  mention_raid_protection_enabled?: boolean;

  /** Validation results for regex patterns */
  regex_validation?: AutoModerationRegexMetadataEntity[];

  /** The type of keyword matching strategy used */
  keyword_match_type?: AutoModerationKeywordMatchType[];
}

/**
 * A rule that automatically takes actions based on content in a guild
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/auto-moderation.md#auto-moderation-rule-object}
 * @validate Trigger type specific validation rules apply
 */
export interface AutoModerationRuleEntity {
  /** The id of this rule */
  id: Snowflake;

  /** The id of the guild which this rule belongs to */
  guild_id: Snowflake;

  /**
   * The rule name
   * @minLength 1
   * @maxLength 100
   */
  name: string;

  /** The user which first created this rule */
  creator_id: Snowflake;

  /** The rule event type */
  event_type: AutoModerationEventType;

  /** The rule trigger type */
  trigger_type: AutoModerationRuleTriggerType;

  /** The rule trigger metadata */
  trigger_metadata: AutoModerationRuleTriggerMetadataEntity;

  /**
   * The actions which will execute when the rule is triggered
   * @minItems 1
   * @maxItems 3
   */
  actions: AutoModerationActionEntity[];

  /** Whether the rule is enabled */
  enabled: boolean;

  /**
   * The role ids that should not be affected by the rule (Maximum of 20)
   * @maxItems 20
   */
  exempt_roles: Snowflake[];

  /**
   * The channel ids that should not be affected by the rule (Maximum of 50)
   * @maxItems 50
   */
  exempt_channels: Snowflake[];
}
