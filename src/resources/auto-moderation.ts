export enum AutoModerationKeywordMatchType {
  Prefix = "prefix",
  Suffix = "suffix",
  Anywhere = "anywhere",
  WholeWord = "whole_word",
}

export enum AutoModerationRuleLimit {
  MaxKeywordFilter = 1000,
  MaxKeywordLength = 60,
  MaxRegexPatterns = 10,
  MaxRegexLength = 260,
  MaxAllowListKeyword = 100,
  MaxAllowListPreset = 1000,
}

export enum AutoModerationMaxRuleType {
  MemberProfile = 1,
  Keyboard = 6,
  Spam = 1,
  KeywordPreset = 1,
  MentionSpam = 1,
}

export enum AutoModerationActionType {
  BlockMessage = 1,
  SendAlertMessage = 2,
  Timeout = 3,
  BlockMemberInteraction = 4,
}

export enum AutoModerationEventType {
  MessageSend = 1,
  MemberUpdate = 2,
}

export enum AutoModerationKeywordPresetType {
  Profanity = 1,
  SexualContent = 2,
  Slurs = 3,
}

export enum AutoModerationRuleTriggerType {
  Keyword = 1,
  Spam = 3,
  KeywordPreset = 4,
  MentionSpam = 5,
  MemberProfile = 6,
}

export interface AutoModerationRegexMetadataEntity {
  pattern: string;
  valid: boolean;
}

export interface AutoModerationActionMetadataEntity {
  channel_id?: string;
  duration_seconds?: number;
  custom_message?: string;
}

export interface AutoModerationActionEntity {
  type: AutoModerationActionType;
  metadata?: AutoModerationActionMetadataEntity;
}

export interface AutoModerationRuleTriggerMetadataEntity {
  keyword_filter?: string[];
  regex_patterns?: string[];
  presets?: AutoModerationKeywordPresetType[];
  allow_list?: string[];
  mention_total_limit?: number;
  mention_raid_protection_enabled?: boolean;
  regex_validation?: AutoModerationRegexMetadataEntity[];
  keyword_match_type?: AutoModerationKeywordMatchType[];
}

export interface AutoModerationRuleEntity {
  id: string;
  guild_id: string;
  name: string;
  creator_id: string;
  event_type: AutoModerationEventType;
  trigger_type: AutoModerationRuleTriggerType;
  trigger_metadata: AutoModerationRuleTriggerMetadataEntity;
  actions: AutoModerationActionEntity[];
  enabled: boolean;
  exempt_roles: string[];
  exempt_channels: string[];
}

export interface AutoModerationActionExecutionEntity {
  guild_id: string;
  action: AutoModerationActionEntity;
  rule_id: string;
  rule_trigger_type: AutoModerationRuleTriggerType;
  user_id: string;
  channel_id?: string;
  message_id?: string;
  alert_system_message_id?: string;
  content?: string;
  matched_keyword: string | null;
  matched_content: string | null;
}

export interface AutoModerationRuleCreateOptions {
  name: string;
  event_type: number;
  trigger_type: number;
  trigger_metadata?: AutoModerationRuleEntity["trigger_metadata"];
  actions: AutoModerationRuleEntity["actions"];
  enabled: boolean;
  exempt_roles?: string[];
  exempt_channels?: string[];
}

export type AutoModerationRuleUpdateOptions = Partial<
  Omit<AutoModerationRuleCreateOptions, "trigger_type">
>;

export class AutoModerationRouter {
  static readonly Routes = {
    guildRulesEndpoint: (guildId: string) => `/guilds/${guildId}/auto-moderation/rules` as const,
    guildRuleByIdEndpoint: (guildId: string, ruleId: string) =>
      `/guilds/${guildId}/auto-moderation/rules/${ruleId}` as const,
  } as const satisfies Record<string, (...args: any[]) => string>;
  readonly #rest: Rest;
  constructor(rest: Rest) {
    this.#rest = rest;
  }
  fetchAllRules(guildId: string): Promise<AutoModerationRuleEntity[]> {
    return this.#rest.get(AutoModerationRouter.Routes.guildRulesEndpoint(guildId));
  }
  fetchRule(guildId: string, ruleId: string): Promise<AutoModerationRuleEntity> {
    return this.#rest.get(AutoModerationRouter.Routes.guildRuleByIdEndpoint(guildId, ruleId));
  }
  createRule(
    guildId: string,
    options: AutoModerationRuleCreateOptions,
    reason?: string,
  ): Promise<AutoModerationRuleEntity> {
    return this.#rest.post(AutoModerationRouter.Routes.guildRulesEndpoint(guildId), {
      body: JSON.stringify(options),
      reason,
    });
  }
  updateRule(
    guildId: string,
    ruleId: string,
    options: AutoModerationRuleUpdateOptions,
    reason?: string,
  ): Promise<AutoModerationRuleEntity> {
    return this.#rest.patch(AutoModerationRouter.Routes.guildRuleByIdEndpoint(guildId, ruleId), {
      body: JSON.stringify(options),
      reason,
    });
  }
  deleteRule(guildId: string, ruleId: string, reason?: string): Promise<void> {
    return this.#rest.delete(AutoModerationRouter.Routes.guildRuleByIdEndpoint(guildId, ruleId), {
      reason,
    });
  }
}
