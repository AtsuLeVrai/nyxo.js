import type { AutoModerationRuleEntity, Snowflake } from "@nyxojs/core";
import { BaseRouter } from "../bases/index.js";

/**
 * Interface for creating a new Auto Moderation rule.
 * Defines configuration for automatic content filtering rules.
 *
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule-json-params}
 */
export interface AutoModerationRuleCreateOptions {
  /**
   * The name of the rule (1-100 characters).
   * Used to identify the rule in the Discord UI.
   */
  name: string;

  /**
   * The type of event that will trigger the rule evaluation.
   * Currently only MESSAGE_SEND (1) is supported.
   */
  event_type: number;

  /**
   * The type of content to scan for and trigger on.
   * Can be KEYWORD (1), SPAM (2), KEYWORD_PRESET (3), or MENTION_SPAM (4).
   */
  trigger_type: number;

  /**
   * Additional metadata needed for certain trigger types.
   * Contains settings specific to each trigger type.
   */
  trigger_metadata?: AutoModerationRuleEntity["trigger_metadata"];

  /**
   * The actions to take when the rule is triggered.
   * Must include 1-3 actions (block, alert, timeout, etc).
   */
  actions: AutoModerationRuleEntity["actions"];

  /**
   * Whether the rule is enabled (false by default).
   * When false, the rule exists but doesn't moderate content.
   */
  enabled: boolean;

  /**
   * Array of role IDs that should not trigger the rule.
   * Users with these roles will be exempt from this rule.
   */
  exempt_roles?: Snowflake[];

  /**
   * Array of channel IDs where the rule should not apply.
   * Messages in these channels won't be evaluated against this rule.
   */
  exempt_channels?: Snowflake[];
}

/**
 * Interface for modifying an existing Auto Moderation rule.
 * All fields optional and trigger_type cannot be modified.
 *
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule-json-params}
 */
export type AutoModerationRuleUpdateOptions = Partial<
  Omit<AutoModerationRuleCreateOptions, "trigger_type">
>;

/**
 * Router for Discord Auto Moderation-related API endpoints.
 * Provides methods to manage automatic content filtering rules.
 *
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation}
 */
export class AutoModerationRouter extends BaseRouter {
  /**
   * API route constants for auto moderation-related endpoints.
   */
  static readonly MODERATION_ROUTES = {
    /**
     * Route for fetching or managing all auto moderation rules in a guild.
     * @param guildId - ID of the guild
     */
    guildRulesEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/auto-moderation/rules` as const,

    /**
     * Route for a specific auto moderation rule in a guild.
     * @param guildId - ID of the guild
     * @param ruleId - ID of the auto moderation rule
     */
    guildRuleByIdEndpoint: (guildId: Snowflake, ruleId: Snowflake) =>
      `/guilds/${guildId}/auto-moderation/rules/${ruleId}` as const,
  } as const;

  /**
   * Fetches all auto moderation rules for a guild.
   * Retrieves both enabled and disabled rules.
   *
   * @param guildId - ID of the guild to fetch rules from
   * @returns A promise that resolves to an array of auto moderation rules
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#list-auto-moderation-rules-for-guild}
   */
  fetchAllRules(guildId: Snowflake): Promise<AutoModerationRuleEntity[]> {
    return this.get(
      AutoModerationRouter.MODERATION_ROUTES.guildRulesEndpoint(guildId),
    );
  }

  /**
   * Fetches a specific auto moderation rule from a guild.
   * Retrieves detailed information about a single rule.
   *
   * @param guildId - ID of the guild
   * @param ruleId - ID of the auto moderation rule to fetch
   * @returns A promise that resolves to the auto moderation rule
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#get-auto-moderation-rule}
   */
  fetchRule(
    guildId: Snowflake,
    ruleId: Snowflake,
  ): Promise<AutoModerationRuleEntity> {
    return this.get(
      AutoModerationRouter.MODERATION_ROUTES.guildRuleByIdEndpoint(
        guildId,
        ruleId,
      ),
    );
  }

  /**
   * Creates a new auto moderation rule in a guild.
   * Establishes content filtering based on specified triggers and actions.
   *
   * @param guildId - ID of the guild where the rule will be created
   * @param options - Configuration options for the new rule
   * @param reason - Optional audit log reason for the creation
   * @returns A promise that resolves to the created auto moderation rule
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule}
   */
  createRule(
    guildId: Snowflake,
    options: AutoModerationRuleCreateOptions,
    reason?: string,
  ): Promise<AutoModerationRuleEntity> {
    return this.post(
      AutoModerationRouter.MODERATION_ROUTES.guildRulesEndpoint(guildId),
      options,
      { reason },
    );
  }

  /**
   * Modifies an existing auto moderation rule.
   * Updates rule configuration except for the trigger_type.
   *
   * @param guildId - ID of the guild
   * @param ruleId - ID of the rule to modify
   * @param options - New configuration options for the rule
   * @param reason - Optional audit log reason for the modification
   * @returns A promise that resolves to the updated auto moderation rule
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule}
   */
  updateRule(
    guildId: Snowflake,
    ruleId: Snowflake,
    options: AutoModerationRuleUpdateOptions,
    reason?: string,
  ): Promise<AutoModerationRuleEntity> {
    return this.patch(
      AutoModerationRouter.MODERATION_ROUTES.guildRuleByIdEndpoint(
        guildId,
        ruleId,
      ),
      options,
      { reason },
    );
  }

  /**
   * Deletes an auto moderation rule.
   * Permanently removes a rule from the guild.
   *
   * @param guildId - ID of the guild
   * @param ruleId - ID of the rule to delete
   * @param reason - Optional audit log reason for the deletion
   * @returns A promise that resolves when the rule is deleted
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#delete-auto-moderation-rule}
   */
  deleteRule(
    guildId: Snowflake,
    ruleId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.delete(
      AutoModerationRouter.MODERATION_ROUTES.guildRuleByIdEndpoint(
        guildId,
        ruleId,
      ),
      { reason },
    );
  }
}
