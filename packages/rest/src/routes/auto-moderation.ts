import type { AutoModerationRuleEntity, Snowflake } from "@nyxjs/core";
import type {
  CreateAutoModerationRuleOptionsEntity,
  ModifyAutoModerationRuleOptionsEntity,
} from "../types/index.js";
import { BaseRouter } from "./base.js";

export class AutoModerationRouter extends BaseRouter {
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

  /**
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#list-auto-moderation-rules-for-guild}
   */
  listAutoModerationRules(
    guildId: Snowflake,
  ): Promise<AutoModerationRuleEntity[]> {
    return this.get(AutoModerationRouter.routes.base(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#get-auto-moderation-rule}
   */
  getAutoModerationRule(
    guildId: Snowflake,
    ruleId: Snowflake,
  ): Promise<AutoModerationRuleEntity> {
    return this.get(AutoModerationRouter.routes.rule(guildId, ruleId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule}
   */
  createAutoModerationRule(
    guildId: Snowflake,
    options: CreateAutoModerationRuleOptionsEntity,
  ): Promise<AutoModerationRuleEntity> {
    return this.post(AutoModerationRouter.routes.base(guildId), {
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
    return this.patch(AutoModerationRouter.routes.rule(guildId, ruleId), {
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
    return this.delete(AutoModerationRouter.routes.rule(guildId, ruleId));
  }
}
