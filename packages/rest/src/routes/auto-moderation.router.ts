import type { AutoModerationRuleEntity, Snowflake } from "@nyxjs/core";
import type { z } from "zod";
import { fromZodError } from "zod-validation-error";
import type { Rest } from "../rest.js";
import {
  CreateAutoModerationRuleEntity,
  ModifyAutoModerationRuleEntity,
} from "../schemas/index.js";
import type { HttpResponse } from "../types/index.js";

export class AutoModerationRouter {
  static readonly ROUTES = {
    base: (guildId: Snowflake) =>
      `/guilds/${guildId}/auto-moderation/rules` as const,
    rule: (guildId: Snowflake, ruleId: Snowflake) =>
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
  ): Promise<HttpResponse<AutoModerationRuleEntity[]>> {
    return this.#rest.get(AutoModerationRouter.ROUTES.base(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#get-auto-moderation-rule}
   */
  getAutoModerationRule(
    guildId: Snowflake,
    ruleId: Snowflake,
  ): Promise<HttpResponse<AutoModerationRuleEntity>> {
    return this.#rest.get(AutoModerationRouter.ROUTES.rule(guildId, ruleId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule}
   */
  createAutoModerationRule(
    guildId: Snowflake,
    options: z.input<typeof CreateAutoModerationRuleEntity>,
    reason?: string,
  ): Promise<HttpResponse<AutoModerationRuleEntity>> {
    const result = CreateAutoModerationRuleEntity.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.post(AutoModerationRouter.ROUTES.base(guildId), {
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
    options: z.input<typeof ModifyAutoModerationRuleEntity>,
    reason?: string,
  ): Promise<HttpResponse<AutoModerationRuleEntity>> {
    const result = ModifyAutoModerationRuleEntity.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.patch(AutoModerationRouter.ROUTES.rule(guildId, ruleId), {
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
  ): Promise<HttpResponse<void>> {
    return this.#rest.delete(
      AutoModerationRouter.ROUTES.rule(guildId, ruleId),
      {
        reason,
      },
    );
  }
}
