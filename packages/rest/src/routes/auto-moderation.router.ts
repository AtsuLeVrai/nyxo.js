import type { AutoModerationRuleEntity, Snowflake } from "@nyxjs/core";
import { BaseRouter } from "../base/index.js";
import {
  type CreateAutoModerationRuleEntity,
  CreateAutoModerationRuleSchema,
  type ModifyAutoModerationRuleEntity,
  ModifyAutoModerationRuleSchema,
} from "../schemas/index.js";

export class AutoModerationRouter extends BaseRouter {
  static readonly ROUTES = {
    base: (guildId: Snowflake): `/guilds/${Snowflake}/auto-moderation/rules` =>
      `/guilds/${guildId}/auto-moderation/rules` as const,
    rule: (
      guildId: Snowflake,
      ruleId: Snowflake,
    ): `/guilds/${Snowflake}/auto-moderation/rules/${Snowflake}` =>
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
    options: CreateAutoModerationRuleEntity,
    reason?: string,
  ): Promise<AutoModerationRuleEntity> {
    const result = CreateAutoModerationRuleSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.post(AutoModerationRouter.ROUTES.base(guildId), {
      body: JSON.stringify(result.data),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule}
   */
  modifyAutoModerationRule(
    guildId: Snowflake,
    ruleId: Snowflake,
    options: ModifyAutoModerationRuleEntity,
    reason?: string,
  ): Promise<AutoModerationRuleEntity> {
    const result = ModifyAutoModerationRuleSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.patch(AutoModerationRouter.ROUTES.rule(guildId, ruleId), {
      body: JSON.stringify(result.data),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#delete-auto-moderation-rule}
   */
  deleteAutoModerationRule(
    guildId: Snowflake,
    ruleId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.delete(AutoModerationRouter.ROUTES.rule(guildId, ruleId), {
      reason,
    });
  }
}
