import type { Integer } from "../formatting/index.js";
import type { Snowflake } from "../utils/index.js";

/**
 * Constants for keyword matching patterns in auto-moderation rules.
 *
 * @remarks
 * Determines how keywords are matched in content:
 * - prefix: word must start with the keyword
 * - suffix: word must end with the keyword
 * - anywhere: keyword can appear anywhere in content
 * - whole_word: keyword must match the entire word
 *
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-keyword-matching-strategies}
 */
export type AutoModerationKeywordMatchType =
  | "prefix"
  | "suffix"
  | "anywhere"
  | "whole_word";

/**
 * Pattern validation constraints for auto-moderation rules.
 * Maximum lengths are enforced by Discord.
 *
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-metadata-field-limits}
 */
export enum AutoModerationRuleLimit {
  /** Maximum number of keywords in keyword_filter */
  MaxKeywordFilter = 1000,
  /** Maximum length of each keyword */
  MaxKeywordLength = 60,
  /** Maximum number of regex patterns */
  MaxRegexPatterns = 10,
  /** Maximum length of each regex pattern */
  MaxRegexLength = 260,
  /** Maximum number of keywords in allow_list for KEYWORD/MEMBER_PROFILE */
  MaxAllowListKeyword = 100,
  /** Maximum number of keywords in allow_list for KEYWORD_PRESET */
  MaxAllowListPreset = 1000,
}

/**
 * Maximum rules per trigger type constraints.
 *
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-types}
 */
export enum AutoModerationMaxRules {
  /** Maximum KEYWORD rules per guild */
  Keyword = 6,
  /** Maximum SPAM rules per guild */
  Spam = 1,
  /** Maximum KEYWORD_PRESET rules per guild */
  KeywordPreset = 1,
  /** Maximum MENTION_SPAM rules per guild */
  MentionSpam = 1,
  /** Maximum MEMBER_PROFILE rules per guild */
  MemberProfile = 1,
}

/**
 * Metadata for regex pattern validation in auto-moderation rules.
 *
 * @remarks
 * Only Rust flavored regex is currently supported.
 *
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-metadata}
 */
export interface AutoModerationRegexMetadata {
  /** Pattern to match (max 260 characters) */
  pattern: string;
  /** Whether the pattern is a valid Rust regex */
  valid: boolean;
}

/**
 * Metadata for auto-moderation actions.
 *
 * @remarks
 * Additional configuration required for certain action types.
 * Different fields are relevant based on the action type.
 *
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object-action-metadata}
 */
export interface AutoModerationActionMetadata {
  /** Channel to which user content should be logged */
  channel_id: Snowflake;
  /** Timeout duration in seconds (maximum of 2419200 seconds, 4 weeks) */
  duration_seconds: Integer;
  /** Additional explanation shown to members when their message is blocked (maximum of 150 characters) */
  custom_message?: string;
}

/**
 * Types of actions that can be taken when a rule is triggered.
 *
 * @remarks
 * The TIMEOUT action type requires MODERATE_MEMBERS permission and can only
 * be set up for KEYWORD and MENTION_SPAM rules.
 *
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object-action-types}
 */
export enum AutoModerationActionType {
  /** Blocks a member's message from being sent */
  BlockMessage = 1,
  /** Logs user content to a specified channel */
  SendAlertMessage = 2,
  /** Timeout user for specified duration */
  Timeout = 3,
  /** Prevents member from using text, voice, or other interactions */
  BlockMemberInteraction = 4,
}

/**
 * Represents an action that will execute when a rule is triggered.
 *
 * @example
 * ```typescript
 * const action: AutoModerationActionEntity = {
 *   type: AutoModerationActionType.BlockMessage,
 *   metadata: {
 *     custom_message: "This message was blocked by auto-moderation"
 *   }
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object-auto-moderation-action-structure}
 */
export interface AutoModerationActionEntity {
  /** Type of action to execute */
  type: AutoModerationActionType;
  /** Additional metadata needed for this action type */
  metadata?: AutoModerationActionMetadata;
}

/**
 * Event contexts where a rule can be triggered.
 *
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-event-types}
 */
export enum AutoModerationEventType {
  /** When a member sends or edits a message in the guild */
  MessageSend = 1,
  /** When a member updates their profile */
  MemberUpdate = 2,
}

/**
 * Built-in keyword presets for filtering content.
 *
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
 * Configuration for how a rule's trigger should behave.
 *
 * @remarks
 * Different fields are relevant based on the trigger_type of the rule.
 * Keyword matching supports wildcard symbols (*) for prefix, suffix, and anywhere matches.
 *
 * @example
 * ```typescript
 * const metadata: AutoModerationRuleTriggerMetadata = {
 *   keyword_filter: ["bad*", "*word", "*phrase*"],
 *   allow_list: ["allowed_term"],
 *   mention_total_limit: 10
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-metadata}
 */
export interface AutoModerationRuleTriggerMetadata {
  /** Substrings that will trigger the rule (max 1000, each max 60 chars) */
  keyword_filter?: string[];
  /** Regex patterns to match against content (max 10, each max 260 chars) */
  regex_patterns?: string[];
  /** Internal preset keyword lists to check */
  presets?: AutoModerationKeywordPresetType[];
  /** Substrings that should not trigger the rule (max 100/1000 based on trigger type) */
  allow_list?: string[];
  /** Total number of unique role and user mentions allowed (max 50) */
  mention_total_limit?: Integer;
  /** Whether to automatically detect mention raids */
  mention_raid_protection_enabled?: boolean;
}

/**
 * Extended metadata for auto-moderation trigger configuration with validation.
 */
export interface AutoModerationRuleTriggerMetadataWithValidation
  extends AutoModerationRuleTriggerMetadata {
  /** Validation results for regex patterns */
  regex_validation?: AutoModerationRegexMetadata[];
  /** Type of keyword matching strategy used */
  keyword_match_type?: AutoModerationKeywordMatchType;
}

/**
 * Types of content that can trigger a rule.
 *
 * @remarks
 * Each trigger type has a maximum number of rules per guild:
 * - KEYWORD: 6 rules
 * - SPAM: 1 rule
 * - KEYWORD_PRESET: 1 rule
 * - MENTION_SPAM: 1 rule
 * - MEMBER_PROFILE: 1 rule
 *
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-types}
 */
export enum AutoModerationRuleTriggerType {
  /** Check if content contains words from a user defined list */
  Keyword = 1,
  /** Check if content represents generic spam */
  Spam = 3,
  /** Check if content contains words from internal preset lists */
  KeywordPreset = 4,
  /** Check if content contains more mentions than allowed */
  MentionSpam = 5,
  /** Check if member profile contains filtered words */
  MemberProfile = 6,
}

/**
 * Represents an auto-moderation rule configuration in a guild.
 *
 * @remarks
 * Rules require the MANAGE_GUILD permission to create and manage.
 * Some action types may require additional permissions (e.g., TIMEOUT requires MODERATE_MEMBERS).
 *
 * @example
 * ```typescript
 * const rule: AutoModerationRuleEntity = {
 *   name: "No Spam",
 *   trigger_type: AutoModerationRuleTriggerType.Spam,
 *   event_type: AutoModerationEventType.MessageSend,
 *   actions: [{
 *     type: AutoModerationActionType.BlockMessage
 *   }],
 *   enabled: true,
 *   exempt_roles: [],
 *   exempt_channels: []
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-auto-moderation-rule-structure}
 */
export interface AutoModerationRuleEntity {
  /** ID of this rule */
  id: Snowflake;
  /** ID of the guild which this rule belongs to */
  guild_id: Snowflake;
  /** Name of the rule */
  name: string;
  /** ID of the user who created this rule */
  creator_id: Snowflake;
  /** Event context when this rule should be checked */
  event_type: AutoModerationEventType;
  /** Type of content which can trigger this rule */
  trigger_type: AutoModerationRuleTriggerType;
  /** Rule trigger configuration */
  trigger_metadata: AutoModerationRuleTriggerMetadata;
  /** Actions to perform when rule is triggered */
  actions: AutoModerationActionEntity[];
  /** Whether the rule is enabled */
  enabled: boolean;
  /** Role IDs that should not be affected (max 20) */
  exempt_roles: Snowflake[];
  /** Channel IDs that should not be affected (max 50) */
  exempt_channels: Snowflake[];
}
