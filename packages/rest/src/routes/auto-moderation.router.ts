import type { AutoModerationRuleEntity, Snowflake } from "@nyxjs/core";
import { fromZodError } from "zod-validation-error";
import type { Rest } from "../core/index.js";
import {
  CreateAutoModerationRuleSchema,
  ModifyAutoModerationRuleSchema,
} from "../schemas/index.js";

export class AutoModerationRouter {
  static readonly ROUTES = {
    guildAutoModerationRules: (guildId: Snowflake) =>
      `/guilds/${guildId}/auto-moderation/rules` as const,
    guildAutoModerationRule: (guildId: Snowflake, ruleId: Snowflake) =>
      `/guilds/${guildId}/auto-moderation/rules/${ruleId}` as const,
  } as const;

  #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#list-auto-moderation-rules-for-guild}
   */
  listAutoModerationRules(
    guildId: Snowflake,
  ): Promise<AutoModerationRuleEntity[]> {
    return this.#rest.get(
      AutoModerationRouter.ROUTES.guildAutoModerationRules(guildId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#get-auto-moderation-rule}
   */
  getAutoModerationRule(
    guildId: Snowflake,
    ruleId: Snowflake,
  ): Promise<AutoModerationRuleEntity> {
    return this.#rest.get(
      AutoModerationRouter.ROUTES.guildAutoModerationRule(guildId, ruleId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule}
   */
  createAutoModerationRule(
    guildId: Snowflake,
    options: CreateAutoModerationRuleSchema,
    reason?: string,
  ): Promise<AutoModerationRuleEntity> {
    const result = CreateAutoModerationRuleSchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.post(
      AutoModerationRouter.ROUTES.guildAutoModerationRules(guildId),
      {
        body: JSON.stringify(result.data),
        reason,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule}
   */
  modifyAutoModerationRule(
    guildId: Snowflake,
    ruleId: Snowflake,
    options: ModifyAutoModerationRuleSchema,
    reason?: string,
  ): Promise<AutoModerationRuleEntity> {
    const result = ModifyAutoModerationRuleSchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.patch(
      AutoModerationRouter.ROUTES.guildAutoModerationRule(guildId, ruleId),
      {
        body: JSON.stringify(result.data),
        reason,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#delete-auto-moderation-rule}
   */
  deleteAutoModerationRule(
    guildId: Snowflake,
    ruleId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.#rest.delete(
      AutoModerationRouter.ROUTES.guildAutoModerationRule(guildId, ruleId),
      {
        reason,
      },
    );
  }
}
