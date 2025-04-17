import type { AutoModerationRuleEntity, Snowflake } from "@nyxjs/core";
import type { Rest } from "../core/index.js";

/**
 * Interface for creating a new Auto Moderation rule.
 *
 * Auto Moderation rules enable server administrators to set up automatic content
 * filtering and moderation actions without requiring manual intervention.
 * This interface defines all properties needed to create a new rule.
 *
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule-json-params}
 */
export interface CreateAutoModerationRuleSchema {
  /**
   * The name of the rule (1-100 characters).
   * Used to identify the rule in the Discord UI and API responses.
   */
  name: string;

  /**
   * The type of event that will trigger the rule evaluation.
   *
   * Currently supported values:
   * - 1: MESSAGE_SEND - Rule is triggered when a message is sent
   */
  event_type: number;

  /**
   * The type of content to scan for and trigger on.
   *
   * Currently supported values:
   * - 1: KEYWORD - Rule checks for specific keywords in content
   * - 2: SPAM - Rule checks for spam content
   * - 3: KEYWORD_PRESET - Rule checks against Discord's preset list of keywords
   * - 4: MENTION_SPAM - Rule checks for mention spam
   */
  trigger_type: number;

  /**
   * Additional metadata needed for certain trigger types.
   *
   * For KEYWORD triggers: Include list of keywords to match
   * For KEYWORD_PRESET triggers: Specify which preset lists to use
   * For MENTION_SPAM triggers: Set threshold for number of mentions
   */
  trigger_metadata?: AutoModerationRuleEntity["trigger_metadata"];

  /**
   * The actions to take when the rule is triggered.
   *
   * Must include at least 1 and at most 3 actions.
   * Actions can include blocking messages, sending alerts,
   * applying timeouts, or sending warnings to users.
   */
  actions: AutoModerationRuleEntity["actions"];

  /**
   * Whether the rule is enabled (false by default).
   *
   * When false, the rule exists but doesn't actively moderate content.
   * This allows creating rules without immediately enabling them.
   */
  enabled: boolean;

  /**
   * Array of role IDs that should not trigger the rule (maximum 20).
   *
   * Users with any of these roles will be exempt from this rule,
   * even if their content would normally trigger it.
   */
  exempt_roles?: Snowflake[];

  /**
   * Array of channel IDs where the rule should not apply (maximum 50).
   *
   * Messages sent in these channels will not be evaluated against this rule,
   * allowing for designated "safe" channels where content restrictions are relaxed.
   */
  exempt_channels?: Snowflake[];
}

/**
 * Interface for modifying an existing Auto Moderation rule.
 *
 * Similar to the creation schema but with all fields optional and without
 * `trigger_type`, which cannot be modified after a rule is created.
 * This allows partial updates to rules while maintaining their fundamental type.
 *
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule-json-params}
 */
export type ModifyAutoModerationRuleSchema = Partial<
  Omit<CreateAutoModerationRuleSchema, "trigger_type">
>;

/**
 * Router for Discord Auto Moderation-related API endpoints.
 *
 * Auto Moderation enables automatic content filtering through server-defined rules
 * based on various trigger types such as keywords, spam detection, and mention spam.
 * This router provides methods to create, fetch, modify and delete these rules.
 *
 * Auto Moderation provides several advantages over traditional bot-based moderation:
 * - Native integration with Discord's systems
 * - Lower latency (rules are evaluated before message delivery)
 * - No reliance on third-party bot uptime
 * - Unified audit log entries for moderation actions
 */
export class AutoModerationRouter {
  /**
   * API route constants for auto moderation-related endpoints.
   */
  static readonly MODERATION_ROUTES = {
    /**
     * Route for fetching or managing all auto moderation rules in a guild.
     *
     * @param guildId - ID of the guild
     * @returns The formatted API route string
     */
    guildRulesEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/auto-moderation/rules` as const,

    /**
     * Route for a specific auto moderation rule in a guild.
     *
     * @param guildId - ID of the guild
     * @param ruleId - ID of the auto moderation rule
     * @returns The formatted API route string
     */
    guildRuleByIdEndpoint: (guildId: Snowflake, ruleId: Snowflake) =>
      `/guilds/${guildId}/auto-moderation/rules/${ruleId}` as const,
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new Auto Moderation Router instance.
   *
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches all auto moderation rules for a guild.
   *
   * This method retrieves all auto moderation rules configured in the specified guild,
   * including both enabled and disabled rules.
   *
   * @param guildId - ID of the guild to fetch rules from
   * @returns A promise that resolves to an array of auto moderation rules
   * @throws {Error} Will throw an error if the user lacks the MANAGE_GUILD permission
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#list-auto-moderation-rules-for-guild}
   *
   * @note Requires the MANAGE_GUILD permission.
   */
  fetchAllRules(guildId: Snowflake): Promise<AutoModerationRuleEntity[]> {
    return this.#rest.get(
      AutoModerationRouter.MODERATION_ROUTES.guildRulesEndpoint(guildId),
    );
  }

  /**
   * Fetches a specific auto moderation rule from a guild.
   *
   * This method retrieves detailed information about a single auto moderation rule,
   * including its trigger conditions, actions, and exemptions.
   *
   * @param guildId - ID of the guild
   * @param ruleId - ID of the auto moderation rule to fetch
   * @returns A promise that resolves to the auto moderation rule
   * @throws {Error} Will throw an error if the rule doesn't exist or the user lacks permissions
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#get-auto-moderation-rule}
   *
   * @note Requires the MANAGE_GUILD permission.
   */
  fetchRule(
    guildId: Snowflake,
    ruleId: Snowflake,
  ): Promise<AutoModerationRuleEntity> {
    return this.#rest.get(
      AutoModerationRouter.MODERATION_ROUTES.guildRuleByIdEndpoint(
        guildId,
        ruleId,
      ),
    );
  }

  /**
   * Creates a new auto moderation rule in a guild.
   *
   * This method establishes a new content moderation rule with the specified
   * trigger conditions and actions. The rule can be configured to filter messages
   * based on keywords, spam patterns, or other criteria.
   *
   * @param guildId - ID of the guild where the rule will be created
   * @param options - Configuration options for the new rule
   * @param reason - Optional audit log reason for the creation
   * @returns A promise that resolves to the created auto moderation rule
   * @throws {Error} Error if the provided options fail validation or the user lacks permissions
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule}
   *
   * @note Requires the MANAGE_GUILD permission.
   */
  createRule(
    guildId: Snowflake,
    options: CreateAutoModerationRuleSchema,
    reason?: string,
  ): Promise<AutoModerationRuleEntity> {
    return this.#rest.post(
      AutoModerationRouter.MODERATION_ROUTES.guildRulesEndpoint(guildId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Modifies an existing auto moderation rule.
   *
   * This method updates an existing rule's configuration, allowing changes to
   * its name, trigger conditions, actions, exemptions, and enabled status.
   * Note that the rule's fundamental trigger_type cannot be changed after creation.
   *
   * @param guildId - ID of the guild
   * @param ruleId - ID of the rule to modify
   * @param options - New configuration options for the rule
   * @param reason - Optional audit log reason for the modification
   * @returns A promise that resolves to the updated auto moderation rule
   * @throws {Error} Error if the provided options fail validation or the user lacks permissions
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule}
   *
   * @note Requires the MANAGE_GUILD permission.
   * @note The trigger_type field cannot be modified after rule creation.
   */
  updateRule(
    guildId: Snowflake,
    ruleId: Snowflake,
    options: ModifyAutoModerationRuleSchema,
    reason?: string,
  ): Promise<AutoModerationRuleEntity> {
    return this.#rest.patch(
      AutoModerationRouter.MODERATION_ROUTES.guildRuleByIdEndpoint(
        guildId,
        ruleId,
      ),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Deletes an auto moderation rule.
   *
   * This method permanently removes an auto moderation rule from the guild.
   * Once deleted, the rule will no longer filter any messages.
   *
   * @param guildId - ID of the guild
   * @param ruleId - ID of the rule to delete
   * @param reason - Optional audit log reason for the deletion
   * @returns A promise that resolves when the rule is deleted
   * @throws {Error} Will throw an error if the rule doesn't exist or the user lacks permissions
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#delete-auto-moderation-rule}
   *
   * @note Requires the MANAGE_GUILD permission.
   */
  deleteRule(
    guildId: Snowflake,
    ruleId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.#rest.delete(
      AutoModerationRouter.MODERATION_ROUTES.guildRuleByIdEndpoint(
        guildId,
        ruleId,
      ),
      {
        reason,
      },
    );
  }
}
