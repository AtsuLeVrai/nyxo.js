import type {
  AutoModerationActionEntity,
  AutoModerationRuleEntity,
  AutoModerationRuleTriggerMetadata,
  Snowflake,
} from "@nyxjs/core";
import type { Rest } from "../core/index.js";

interface CreateAutoModerationRuleOptions {
  name: string;
  event_type: number;
  trigger_type: number;
  trigger_metadata?: AutoModerationRuleTriggerMetadata;
  actions: AutoModerationActionEntity[];
  enabled?: boolean;
  exempt_roles?: Snowflake[];
  exempt_channels?: Snowflake[];
}

interface ModifyAutoModerationRuleOptions {
  name?: string;
  event_type?: number;
  trigger_metadata?: AutoModerationRuleTriggerMetadata;
  actions?: AutoModerationActionEntity[];
  enabled?: boolean;
  exempt_roles?: Snowflake[];
  exempt_channels?: Snowflake[];
}

export class AutoModerationRoutes {
  static routes = {
    base: (
      guildId: Snowflake,
    ): `/guilds/${Snowflake}/auto-moderation/rules` => {
      return `/guilds/${guildId}/auto-moderation/rules` as const;
    },

    rule: (
      guildId: Snowflake,
      ruleId: Snowflake,
    ): `/guilds/${Snowflake}/auto-moderation/rules/${Snowflake}` => {
      return `/guilds/${guildId}/auto-moderation/rules/${ruleId}` as const;
    },
  } as const;

  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#list-auto-moderation-rules-for-guild}
   */
  listAutoModerationRules(
    guildId: Snowflake,
  ): Promise<AutoModerationRuleEntity[]> {
    return this.#rest.get(AutoModerationRoutes.routes.base(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#get-auto-moderation-rule}
   */
  getAutoModerationRule(
    guildId: Snowflake,
    ruleId: Snowflake,
  ): Promise<AutoModerationRuleEntity> {
    return this.#rest.get(AutoModerationRoutes.routes.rule(guildId, ruleId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule}
   */
  createAutoModerationRule(
    guildId: Snowflake,
    options: CreateAutoModerationRuleOptions,
  ): Promise<AutoModerationRuleEntity> {
    return this.#rest.post(AutoModerationRoutes.routes.base(guildId), {
      body: JSON.stringify(options),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule}
   */
  modifyAutoModerationRule(
    guildId: Snowflake,
    ruleId: Snowflake,
    options: ModifyAutoModerationRuleOptions,
  ): Promise<AutoModerationRuleEntity> {
    return this.#rest.patch(AutoModerationRoutes.routes.rule(guildId, ruleId), {
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
    return this.#rest.delete(AutoModerationRoutes.routes.rule(guildId, ruleId));
  }
}
