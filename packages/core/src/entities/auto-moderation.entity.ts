import type { Snowflake } from "../managers/index.js";

/**
 * Strategies for keyword matching in auto-moderation.
 * Defines how keywords are matched against content using wildcard symbols.
 * All keyword matching is case insensitive.
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#keyword-matching-strategies}
 */
export enum AutoModerationKeywordMatchType {
  /**
   * Word must start with the keyword.
   * Example: "cat*" matches "catch", "Catapult", "CATTLE"
   * @value "prefix"
   */
  Prefix = "prefix",

  /**
   * Word must end with the keyword.
   * Example: "*cat" matches "wildcat", "copyCat"
   * @value "suffix"
   */
  Suffix = "suffix",

  /**
   * Keyword can appear anywhere in the content.
   * Example: "*cat*" matches "location", "eduCation"
   * @value "anywhere"
   */
  Anywhere = "anywhere",

  /**
   * Keyword is a full word or phrase and must be surrounded by whitespace.
   * Example: "cat" only matches the standalone word "cat"
   * @value "whole_word"
   */
  WholeWord = "whole_word",
}

/**
 * Maximum limits for auto-moderation rule configurations.
 * These constants define the maximum number of items or character lengths
 * for various aspects of auto-moderation rules.
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#trigger-metadata-field-limits}
 */
export enum AutoModerationRuleLimit {
  /**
   * Maximum number of keywords in a filter.
   * Applies to keyword_filter for KEYWORD and MEMBER_PROFILE trigger types.
   * @value 1000
   */
  MaxKeywordFilter = 1000,

  /**
   * Maximum length of a keyword.
   * Each keyword must be 60 characters or less.
   * @value 60
   */
  MaxKeywordLength = 60,

  /**
   * Maximum number of regex patterns allowed.
   * Only Rust flavored regex is currently supported.
   * @value 10
   */
  MaxRegexPatterns = 10,

  /**
   * Maximum length of a regex pattern.
   * Each regex pattern must be 260 characters or less.
   * @value 260
   */
  MaxRegexLength = 260,

  /**
   * Maximum number of keywords in an allow list for Keyword and Member Profile trigger types.
   * @value 100
   */
  MaxAllowListKeyword = 100,

  /**
   * Maximum number of keywords in an allow list for Keyword Preset trigger type.
   * @value 1000
   */
  MaxAllowListPreset = 1000,
}

/**
 * Maximum number of rules per guild for each trigger type.
 * Discord limits how many rules of each type can exist in a guild.
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#trigger-types}
 */
export enum AutoModerationMaxRuleType {
  /**
   * Maximum number of member profile rules.
   * Checks profile content against a list of keywords.
   * @value 1
   */
  MemberProfile = 1,

  /**
   * Maximum number of keyword rules.
   * Checks message content against a list of keywords.
   * @value 6
   */
  Keyboard = 6,

  /**
   * Maximum number of spam rules.
   * Detects generic spam content.
   * @value 1
   */
  Spam = 1,

  /**
   * Maximum number of keyword preset rules.
   * Uses Discord's predefined wordsets.
   * @value 1
   */
  KeywordPreset = 1,

  /**
   * Maximum number of mention spam rules.
   * Limits the number of unique mentions per message.
   * @value 1
   */
  MentionSpam = 1,
}

/**
 * Types of actions that can be taken when a rule is triggered.
 * These actions determine what happens when auto-moderation detects a violation.
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#action-types}
 */
export enum AutoModerationActionType {
  /**
   * Blocks a member's message and prevents it from being posted.
   * A custom explanation can be specified and shown to members whenever their message is blocked.
   * @value 1
   */
  BlockMessage = 1,

  /**
   * Logs user content to a specified channel.
   * Requires specifying a channel_id in the action metadata.
   * @value 2
   */
  SendAlertMessage = 2,

  /**
   * Timeout user for a specified duration.
   * Requires the MODERATE_MEMBERS permission.
   * Can only be used with KEYWORD and MENTION_SPAM rules.
   * @value 3
   */
  Timeout = 3,

  /**
   * Prevents a member from using text, voice, or other interactions.
   * Blocks the member's interactions without applying a timeout.
   * @value 4
   */
  BlockMemberInteraction = 4,
}

/**
 * Event contexts in which a rule should be checked.
 * Determines when auto-moderation rules should be applied.
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#event-types}
 */
export enum AutoModerationEventType {
  /**
   * When a member sends or edits a message in the guild.
   * Rules with this event type check message content.
   * @value 1
   */
  MessageSend = 1,

  /**
   * When a member edits their profile.
   * Rules with this event type check profile content.
   * @value 2
   */
  MemberUpdate = 2,
}

/**
 * Preset word lists for content filtering.
 * Discord provides built-in word lists that can be used for common moderation needs.
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#keyword-preset-types}
 */
export enum AutoModerationKeywordPresetType {
  /**
   * Words that may be considered forms of swearing or cursing.
   * Discord-maintained list of profane words and phrases.
   * @value 1
   */
  Profanity = 1,

  /**
   * Words that refer to sexually explicit behavior or activity.
   * Discord-maintained list of words related to sexual content.
   * @value 2
   */
  SexualContent = 2,

  /**
   * Personal insults or words that may be considered hate speech.
   * Discord-maintained list of slurs and hateful terms.
   * @value 3
   */
  Slurs = 3,
}

/**
 * Types of content that can trigger a rule.
 * Determines what criteria will cause the rule to trigger.
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#trigger-types}
 */
export enum AutoModerationRuleTriggerType {
  /**
   * Check if content contains words from a user defined list of keywords.
   * Maximum of 6 rules per guild.
   * @value 1
   */
  Keyword = 1,

  /**
   * Check if content represents generic spam.
   * Maximum of 1 rule per guild.
   * @value 3
   */
  Spam = 3,

  /**
   * Check if content contains words from internal pre-defined wordsets.
   * Uses Discord's built-in word lists (profanity, sexual content, slurs).
   * Maximum of 1 rule per guild.
   * @value 4
   */
  KeywordPreset = 4,

  /**
   * Check if content contains more unique mentions than allowed.
   * Can be configured with a mention limit or automatic raid protection.
   * Maximum of 1 rule per guild.
   * @value 5
   */
  MentionSpam = 5,

  /**
   * Check if member profile contains words from a user defined list of keywords.
   * Checks against profile data when a user updates their profile.
   * Maximum of 1 rule per guild.
   * @value 6
   */
  MemberProfile = 6,
}

/**
 * Regex metadata for auto-moderation rules.
 * Contains validation information for regex patterns.
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#trigger-metadata}
 */
export interface AutoModerationRegexMetadataEntity {
  /**
   * Regular expression pattern.
   * Only Rust flavored regex is currently supported.
   * @maxLength 260
   */
  pattern: string;

  /**
   * Whether the regex pattern is valid.
   * Indicates if the pattern is syntactically correct.
   */
  valid: boolean;
}

/**
 * Metadata for auto-moderation actions.
 * Additional data used when an action is executed, varying by action type.
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#action-metadata}
 * @validate At least one of channel_id, duration_seconds, or custom_message must be present, depending on the action type
 */
export interface AutoModerationActionMetadataEntity {
  /**
   * Channel to which user content should be logged.
   * Required for SEND_ALERT_MESSAGE actions.
   * Must be an existing channel in the guild.
   */
  channel_id?: Snowflake;

  /**
   * Timeout duration in seconds.
   * Required for TIMEOUT actions.
   * @minimum 1
   * @maximum 2419200 - Equivalent to 4 weeks, the maximum timeout duration
   */
  duration_seconds?: number;

  /**
   * Additional explanation that will be shown to members whenever their message is blocked.
   * Optional for BLOCK_MESSAGE actions.
   * @maxLength 150
   */
  custom_message?: string;
}

/**
 * Action to be taken when a rule is triggered.
 * Defines what happens when auto-moderation detects a violation.
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object}
 * @validate Required metadata fields missing for this action type
 */
export interface AutoModerationActionEntity {
  /**
   * The type of action.
   * Determines how the rule responds to violations.
   */
  type: AutoModerationActionType;

  /**
   * Additional metadata needed during execution for this specific action type.
   * Required fields depend on the action type:
   * - SEND_ALERT_MESSAGE requires channel_id
   * - TIMEOUT requires duration_seconds
   * - BLOCK_MESSAGE can optionally use custom_message
   */
  metadata?: AutoModerationActionMetadataEntity;
}

/**
 * Additional data used to determine whether a rule should be triggered.
 * The relevant fields depend on the trigger_type of the rule.
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#trigger-metadata}
 */
export interface AutoModerationRuleTriggerMetadataEntity {
  /**
   * Substrings which will be searched for in content.
   * Used with KEYWORD and MEMBER_PROFILE trigger types.
   * A keyword can be a phrase which contains multiple words.
   * Wildcard symbols (*) can be used to customize matching.
   * @maxItems 1000
   */
  keyword_filter?: string[];

  /**
   * Regular expression patterns which will be matched against content.
   * Used with KEYWORD and MEMBER_PROFILE trigger types.
   * Only Rust flavored regex is currently supported.
   * @maxItems 10
   */
  regex_patterns?: string[];

  /**
   * The internally pre-defined wordsets which will be searched for in content.
   * Used with KEYWORD_PRESET trigger type.
   * Can include Profanity, SexualContent, and/or Slurs.
   */
  presets?: AutoModerationKeywordPresetType[];

  /**
   * Substrings which should not trigger the rule.
   * Works with KEYWORD, KEYWORD_PRESET, and MEMBER_PROFILE trigger types.
   * Acts as exceptions to the rule, allowing specific terms.
   * @maxItems 1000
   * @validate allow_list can contain at most 100 items for Keyword and MemberProfile trigger types, or 1000 items for KeywordPreset trigger type
   */
  allow_list?: string[];

  /**
   * Total number of unique role and user mentions allowed per message.
   * Used with MENTION_SPAM trigger type.
   * @minimum 1
   * @maximum 50
   */
  mention_total_limit?: number;

  /**
   * Whether to automatically detect mention raids.
   * Used with MENTION_SPAM trigger type.
   * Enables Discord's automatic protection against mention spam.
   */
  mention_raid_protection_enabled?: boolean;

  /**
   * Validation results for regex patterns.
   * Contains information about each regex pattern's validity.
   */
  regex_validation?: AutoModerationRegexMetadataEntity[];

  /**
   * The type of keyword matching strategy used.
   * Determines how keywords are matched (prefix, suffix, anywhere, whole_word).
   */
  keyword_match_type?: AutoModerationKeywordMatchType[];
}

/**
 * A rule that automatically takes actions based on content in a guild.
 * Auto Moderation is a feature that allows each guild to set up rules
 * that trigger based on specific criteria and execute actions automatically.
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object}
 * @validate Trigger type specific validation rules apply
 */
export interface AutoModerationRuleEntity {
  /**
   * The id of this rule.
   * Unique identifier for the auto-moderation rule.
   */
  id: Snowflake;

  /**
   * The id of the guild which this rule belongs to.
   * Rules are specific to a single guild.
   */
  guild_id: Snowflake;

  /**
   * The rule name.
   * Descriptive name for the rule.
   * @minLength 1
   * @maxLength 100
   */
  name: string;

  /**
   * The user which first created this rule.
   * ID of the user who created the rule.
   */
  creator_id: Snowflake;

  /**
   * The rule event type.
   * Determines when the rule should be checked (messages, profile updates).
   */
  event_type: AutoModerationEventType;

  /**
   * The rule trigger type.
   * Determines what criteria will cause the rule to trigger.
   */
  trigger_type: AutoModerationRuleTriggerType;

  /**
   * The rule trigger metadata.
   * Additional data used to determine whether a rule should be triggered.
   */
  trigger_metadata: AutoModerationRuleTriggerMetadataEntity;

  /**
   * The actions which will execute when the rule is triggered.
   * Each rule must have at least one action and can have up to 3.
   * @minItems 1
   * @maxItems 3
   */
  actions: AutoModerationActionEntity[];

  /**
   * Whether the rule is enabled.
   * Rules can be created in a disabled state and enabled later.
   */
  enabled: boolean;

  /**
   * The role ids that should not be affected by the rule.
   * Members with these roles will be exempt from this rule.
   * @maxItems 20
   */
  exempt_roles: Snowflake[];

  /**
   * The channel ids that should not be affected by the rule.
   * Messages in these channels will be exempt from this rule.
   * @maxItems 50
   */
  exempt_channels: Snowflake[];
}
