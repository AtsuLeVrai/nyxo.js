import type { Snowflake } from "../common/index.js";

export enum AutoModerationEventType {
  MessageSend = 1,
  MemberUpdate = 2,
}

export enum AutoModerationTriggerType {
  Keyword = 1,
  Spam = 3,
  KeywordPreset = 4,
  MentionSpam = 5,
  MemberProfile = 6,
}

export enum AutoModerationKeywordPresetType {
  Profanity = 1,
  SexualContent = 2,
  Slurs = 3,
}

export enum AutoModerationActionType {
  BlockMessage = 1,
  SendAlertMessage = 2,
  Timeout = 3,
  BlockMemberInteraction = 4,
}

export interface AutoModerationRuleObject {
  id: Snowflake;
  guild_id: Snowflake;
  name: string;
  creator_id: Snowflake;
  event_type: AutoModerationEventType;
  trigger_type: AutoModerationTriggerType;
  trigger_metadata: AutoModerationTriggerMetadataObject;
  actions: AutoModerationActionObject[];
  enabled: boolean;
  exempt_roles: Snowflake[];
  exempt_channels: Snowflake[];
}

export interface AutoModerationTriggerMetadataObject {
  keyword_filter?: string[];
  regex_patterns?: string[];
  presets?: AutoModerationKeywordPresetType[];
  allow_list?: string[];
  mention_total_limit?: number;
  mention_raid_protection_enabled?: boolean;
}

export interface AutoModerationActionObject {
  type: AutoModerationActionType;
  metadata?: AutoModerationActionMetadataObject;
}

export interface AutoModerationActionMetadataObject {
  channel_id?: Snowflake;
  duration_seconds?: number;
  custom_message?: string;
}
