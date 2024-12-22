import type { Integer } from "../formatting/index.js";
import type { Snowflake } from "../managers/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-keyword-matching-strategies}
 */
export type AutoModerationKeywordMatchType =
  | "prefix"
  | "suffix"
  | "anywhere"
  | "whole_word";

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
export enum AutoModerationMaxRules {
  Keyword = 6,
  Spam = 1,
  KeywordPreset = 1,
  MentionSpam = 1,
  MemberProfile = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-metadata}
 */
export interface AutoModerationRegexMetadata {
  pattern: string;
  valid: boolean;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object-action-metadata}
 */
export interface AutoModerationActionMetadata {
  channel_id: Snowflake;
  duration_seconds: Integer;
  custom_message?: string;
}

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
export interface AutoModerationActionEntity {
  type: AutoModerationActionType;
  metadata?: AutoModerationActionMetadata;
}

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
export interface AutoModerationRuleTriggerMetadata {
  keyword_filter?: string[];
  regex_patterns?: string[];
  presets?: AutoModerationKeywordPresetType[];
  allow_list?: string[];
  mention_total_limit?: Integer;
  mention_raid_protection_enabled?: boolean;
}

export interface AutoModerationRuleTriggerMetadataWithValidation
  extends AutoModerationRuleTriggerMetadata {
  regex_validation?: AutoModerationRegexMetadata[];
  keyword_match_type?: AutoModerationKeywordMatchType;
}

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
export interface AutoModerationRuleEntity {
  id: Snowflake;
  guild_id: Snowflake;
  name: string;
  creator_id: Snowflake;
  event_type: AutoModerationEventType;
  trigger_type: AutoModerationRuleTriggerType;
  trigger_metadata: AutoModerationRuleTriggerMetadata;
  actions: AutoModerationActionEntity[];
  enabled: boolean;
  exempt_roles: Snowflake[];
  exempt_channels: Snowflake[];
}
