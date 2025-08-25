import type { Rest } from "../../core/index.js";
import type { AutoModerationRuleEntity } from "./auto-moderation.entity.js";

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
