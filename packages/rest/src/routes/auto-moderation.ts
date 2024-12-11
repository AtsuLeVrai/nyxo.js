import {
  type AutoModerationActionEntity,
  type AutoModerationRuleEntity,
  type AutoModerationRuleTriggerMetadata,
  AutoModerationRuleTriggerType,
  type Snowflake,
} from "@nyxjs/core";
import type {
  CreateAutoModerationRuleOptionsEntity,
  ModifyAutoModerationRuleOptionsEntity,
} from "../types/index.js";
import { BaseRouter } from "./base.js";

export interface AutoModerationRoutes {
  readonly base: (
    guildId: Snowflake,
  ) => `/guilds/${Snowflake}/auto-moderation/rules`;

  readonly rule: (
    guildId: Snowflake,
    ruleId: Snowflake,
  ) => `/guilds/${Snowflake}/auto-moderation/rules/${Snowflake}`;
}

export class AutoModerationRouter extends BaseRouter {
  static readonly MAX_LENGTH_CUSTOM_MESSAGE = 150;
  static readonly MAX_LENGTH_KEYWORD = 60;
  static readonly MAX_LENGTH_REGEX_PATTERN = 260;
  static readonly MAX_LENGTH_ALLOW_LIST_KEYWORD = 60;
  static readonly MAX_COUNT_EXEMPT_ROLES = 20;
  static readonly MAX_COUNT_EXEMPT_CHANNELS = 50;
  static readonly MAX_COUNT_KEYWORD_FILTER = 1000;
  static readonly MAX_COUNT_REGEX_PATTERNS = 10;
  static readonly MAX_COUNT_ALLOW_LIST_KEYWORD = 100;
  static readonly MAX_COUNT_ALLOW_LIST_PRESET = 1000;
  static readonly MAX_COUNT_MENTION_TOTAL = 50;
  static readonly MAX_COUNT_TIMEOUT_SECONDS = 2419200;
  static readonly MAX_RULES_PER_TRIGGER_KEYWORD = 6;
  static readonly MAX_RULES_PER_TRIGGER_SPAM = 1;
  static readonly MAX_RULES_PER_TRIGGER_KEYWORD_PRESET = 1;
  static readonly MAX_RULES_PER_TRIGGER_MENTION_SPAM = 1;
  static readonly MAX_RULES_PER_TRIGGER_MEMBER_PROFILE = 1;

  static readonly ROUTES: AutoModerationRoutes = {
    base: (guildId) => `/guilds/${guildId}/auto-moderation/rules` as const,

    rule: (guildId, ruleId) =>
      `/guilds/${guildId}/auto-moderation/rules/${ruleId}` as const,
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#list-auto-moderation-rules-for-guild}
   */
  listAutoModerationRules(
    guildId: Snowflake,
  ): Promise<AutoModerationRuleEntity[]> {
    return this.get(AutoModerationRouter.ROUTES.base(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#get-auto-moderation-rule}
   */
  getAutoModerationRule(
    guildId: Snowflake,
    ruleId: Snowflake,
  ): Promise<AutoModerationRuleEntity> {
    return this.get(AutoModerationRouter.ROUTES.rule(guildId, ruleId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule}
   */
  createAutoModerationRule(
    guildId: Snowflake,
    options: CreateAutoModerationRuleOptionsEntity,
  ): Promise<AutoModerationRuleEntity> {
    this.#validateAutoModerationRule(options);
    return this.post(AutoModerationRouter.ROUTES.base(guildId), {
      body: JSON.stringify(options),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule}
   */
  modifyAutoModerationRule(
    guildId: Snowflake,
    ruleId: Snowflake,
    options: ModifyAutoModerationRuleOptionsEntity,
  ): Promise<AutoModerationRuleEntity> {
    this.#validateAutoModerationRule(options);
    return this.patch(AutoModerationRouter.ROUTES.rule(guildId, ruleId), {
      body: JSON.stringify(options),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#delete-auto-moderation-rule}
   */
  deleteAutoModerationRule(
    guildId: Snowflake,
    ruleId: Snowflake,
  ): Promise<void> {
    return this.delete(AutoModerationRouter.ROUTES.rule(guildId, ruleId));
  }

  #validateAutoModerationRule(
    rule:
      | CreateAutoModerationRuleOptionsEntity
      | ModifyAutoModerationRuleOptionsEntity,
  ): void {
    if (
      rule.exempt_roles &&
      rule.exempt_roles.length > AutoModerationRouter.MAX_COUNT_EXEMPT_ROLES
    ) {
      throw new Error(
        `Cannot exempt more than ${AutoModerationRouter.MAX_COUNT_EXEMPT_ROLES} roles`,
      );
    }

    if (
      rule.exempt_channels &&
      rule.exempt_channels?.length >
        AutoModerationRouter.MAX_COUNT_EXEMPT_CHANNELS
    ) {
      throw new Error(
        `Cannot exempt more than ${AutoModerationRouter.MAX_COUNT_EXEMPT_CHANNELS} channels`,
      );
    }

    if (rule.trigger_metadata && "trigger_type" in rule) {
      this.#validateTriggerMetadata(rule.trigger_metadata, rule.trigger_type);
    }

    if (rule.actions && rule.actions.length > 0) {
      for (const action of rule.actions.values()) {
        this.#validateAction(action);
      }
    }
  }

  #validateTriggerMetadata(
    metadata: AutoModerationRuleTriggerMetadata,
    triggerType: AutoModerationRuleTriggerType,
  ): void {
    if (metadata.keyword_filter) {
      if (
        metadata.keyword_filter.length >
        AutoModerationRouter.MAX_COUNT_KEYWORD_FILTER
      ) {
        throw new Error(
          `Cannot have more than ${AutoModerationRouter.MAX_COUNT_KEYWORD_FILTER} keywords`,
        );
      }

      for (const keyword of metadata.keyword_filter) {
        if (keyword.length > AutoModerationRouter.MAX_LENGTH_KEYWORD) {
          throw new Error(
            `Keywords must be ${AutoModerationRouter.MAX_LENGTH_KEYWORD} characters or less`,
          );
        }
      }
    }

    if (metadata.regex_patterns) {
      if (
        metadata.regex_patterns.length >
        AutoModerationRouter.MAX_COUNT_REGEX_PATTERNS
      ) {
        throw new Error(
          `Cannot have more than ${AutoModerationRouter.MAX_COUNT_REGEX_PATTERNS} regex patterns`,
        );
      }

      for (const pattern of metadata.regex_patterns) {
        if (pattern.length > AutoModerationRouter.MAX_LENGTH_REGEX_PATTERN) {
          throw new Error(
            `Regex patterns must be ${AutoModerationRouter.MAX_LENGTH_REGEX_PATTERN} characters or less`,
          );
        }
      }
    }

    if (metadata.allow_list) {
      const maxKeywords =
        triggerType === AutoModerationRuleTriggerType.KeywordPreset
          ? AutoModerationRouter.MAX_COUNT_ALLOW_LIST_PRESET
          : AutoModerationRouter.MAX_COUNT_ALLOW_LIST_KEYWORD;

      if (metadata.allow_list.length > maxKeywords) {
        throw new Error(
          `Cannot have more than ${maxKeywords} allow list keywords for this trigger type`,
        );
      }

      for (const keyword of metadata.allow_list) {
        if (
          keyword.length > AutoModerationRouter.MAX_LENGTH_ALLOW_LIST_KEYWORD
        ) {
          throw new Error(
            `Allow list keywords must be ${AutoModerationRouter.MAX_LENGTH_ALLOW_LIST_KEYWORD} characters or less`,
          );
        }
      }
    }

    if (
      metadata.mention_total_limit !== undefined &&
      metadata.mention_total_limit >
        AutoModerationRouter.MAX_COUNT_MENTION_TOTAL
    ) {
      throw new Error(
        `Mention limit cannot exceed ${AutoModerationRouter.MAX_COUNT_MENTION_TOTAL}`,
      );
    }
  }

  #validateAction(action: AutoModerationActionEntity): void {
    if (action.metadata) {
      if (
        action.metadata.duration_seconds &&
        action.metadata.duration_seconds >
          AutoModerationRouter.MAX_COUNT_TIMEOUT_SECONDS
      ) {
        throw new Error(
          `Timeout duration cannot exceed ${AutoModerationRouter.MAX_COUNT_TIMEOUT_SECONDS} seconds`,
        );
      }

      if (
        action.metadata.custom_message &&
        action.metadata.custom_message.length >
          AutoModerationRouter.MAX_LENGTH_CUSTOM_MESSAGE
      ) {
        throw new Error(
          `Custom message cannot exceed ${AutoModerationRouter.MAX_LENGTH_CUSTOM_MESSAGE} characters`,
        );
      }
    }
  }
}
