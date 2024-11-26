import type { AutoModerationRuleEntity, Snowflake } from "@nyxjs/core";
import type { Rest } from "../core/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule-json-params}
 */
export type CreateAutoModerationRuleOptions = Pick<
  AutoModerationRuleEntity,
  | "name"
  | "event_type"
  | "trigger_type"
  | "trigger_metadata"
  | "actions"
  | "enabled"
  | "exempt_roles"
  | "exempt_channels"
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule-json-params}
 */
export type ModifyAutoModerationRuleOptions = Partial<
  Pick<
    AutoModerationRuleEntity,
    | "name"
    | "event_type"
    | "trigger_metadata"
    | "actions"
    | "enabled"
    | "exempt_roles"
    | "exempt_channels"
  >
>;

export class AutoModerationRouter {
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
    return this.#rest.get(AutoModerationRouter.routes.base(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#get-auto-moderation-rule}
   */
  getAutoModerationRule(
    guildId: Snowflake,
    ruleId: Snowflake,
  ): Promise<AutoModerationRuleEntity> {
    return this.#rest.get(AutoModerationRouter.routes.rule(guildId, ruleId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule}
   */
  createAutoModerationRule(
    guildId: Snowflake,
    options: CreateAutoModerationRuleOptions,
  ): Promise<AutoModerationRuleEntity> {
    return this.#rest.post(AutoModerationRouter.routes.base(guildId), {
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
    return this.#rest.patch(AutoModerationRouter.routes.rule(guildId, ruleId), {
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
    return this.#rest.delete(AutoModerationRouter.routes.rule(guildId, ruleId));
  }
}
