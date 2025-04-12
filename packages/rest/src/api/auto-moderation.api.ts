import type { AutoModerationRuleEntity, Snowflake } from "@nyxjs/core";
import type { Rest } from "../core/index.js";

/**
 * Interface for creating a new Auto Moderation rule.
 * Inherits relevant fields from the AutoModerationRuleEntity to ensure consistency.
 *
 * Auto Moderation rules enable server admins to set up automatic moderation
 * filters based on various criteria like keyword matching, spam detection, etc.
 *
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule-json-params}
 */
export interface CreateAutoModerationRuleSchema {
  /**
   * The name of the rule (1-100 characters)
   */
  name: string;

  /** The type of event to trigger the rule (message send, etc.) */
  event_type: number;

  /** The type of content to trigger the rule (keyword, spam, etc.) */
  trigger_type: number;

  /**
   * Additional metadata needed for certain trigger types
   */
  trigger_metadata?: AutoModerationRuleEntity["trigger_metadata"];

  /**
   * The actions to take when the rule is triggered
   * Must include at least 1 and at most 3 actions
   */
  actions: AutoModerationRuleEntity["actions"];

  /**
   * Whether the rule is enabled (false by default)
   */
  enabled: boolean;

  /**
   * Array of role IDs that should not trigger the rule (max 20)
   */
  exempt_roles?: Snowflake[];

  /**
   * Array of channel IDs where the rule should not apply (max 50)
   */
  exempt_channels?: Snowflake[];
}

/**
 * Interface for modifying an existing Auto Moderation rule.
 * Based on the creation schema but with optional fields and without `trigger_type`
 * which cannot be modified after rule creation.
 *
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule-json-params}
 */
export type ModifyAutoModerationRuleSchema = Partial<
  Omit<CreateAutoModerationRuleSchema, "trigger_type">
>;

/**
 * Router for Discord Auto Moderation-related API endpoints.
 * Provides methods to interact with guild auto moderation rules.
 *
 * Auto Moderation enables automatic message moderation through server-defined rules
 * based on keywords, spam detection, and other trigger types.
 */
export class AutoModerationApi {
  /**
   * API route constants for auto moderation-related endpoints.
   */
  static readonly ROUTES = {
    /**
     * Route for fetching or managing all auto moderation rules in a guild
     * @param guildId - ID of the guild
     * @returns The formatted route string
     */
    guildAutoModerationRules: (guildId: Snowflake) =>
      `/guilds/${guildId}/auto-moderation/rules` as const,

    /**
     * Route for a specific auto moderation rule in a guild
     * @param guildId - ID of the guild
     * @param ruleId - ID of the auto moderation rule
     * @returns The formatted route string
     */
    guildAutoModerationRule: (guildId: Snowflake, ruleId: Snowflake) =>
      `/guilds/${guildId}/auto-moderation/rules/${ruleId}` as const,
  } as const;

  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches all auto moderation rules for a guild.
   *
   * @param guildId - ID of the guild to fetch rules from
   * @returns A promise that resolves to an array of auto moderation rules
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#list-auto-moderation-rules-for-guild}
   *
   * Requires the MANAGE_GUILD permission.
   */
  listAutoModerationRules(
    guildId: Snowflake,
  ): Promise<AutoModerationRuleEntity[]> {
    return this.#rest.get(
      AutoModerationApi.ROUTES.guildAutoModerationRules(guildId),
    );
  }

  /**
   * Fetches a specific auto moderation rule from a guild.
   *
   * @param guildId - ID of the guild
   * @param ruleId - ID of the auto moderation rule to fetch
   * @returns A promise that resolves to the auto moderation rule
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#get-auto-moderation-rule}
   *
   * Requires the MANAGE_GUILD permission.
   */
  getAutoModerationRule(
    guildId: Snowflake,
    ruleId: Snowflake,
  ): Promise<AutoModerationRuleEntity> {
    return this.#rest.get(
      AutoModerationApi.ROUTES.guildAutoModerationRule(guildId, ruleId),
    );
  }

  /**
   * Creates a new auto moderation rule in a guild.
   *
   * @param guildId - ID of the guild where the rule will be created
   * @param options - Configuration options for the new rule
   * @param reason - Optional audit log reason for the creation
   * @returns A promise that resolves to the created auto moderation rule
   * @throws Error if the provided options fail validation
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule}
   *
   * Requires the MANAGE_GUILD permission.
   */
  createAutoModerationRule(
    guildId: Snowflake,
    options: CreateAutoModerationRuleSchema,
    reason?: string,
  ): Promise<AutoModerationRuleEntity> {
    return this.#rest.post(
      AutoModerationApi.ROUTES.guildAutoModerationRules(guildId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Modifies an existing auto moderation rule.
   *
   * @param guildId - ID of the guild
   * @param ruleId - ID of the rule to modify
   * @param options - New configuration options for the rule
   * @param reason - Optional audit log reason for the modification
   * @returns A promise that resolves to the updated auto moderation rule
   * @throws Error if the provided options fail validation
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule}
   *
   * Requires the MANAGE_GUILD permission.
   * The trigger_type field cannot be modified after rule creation.
   */
  modifyAutoModerationRule(
    guildId: Snowflake,
    ruleId: Snowflake,
    options: ModifyAutoModerationRuleSchema,
    reason?: string,
  ): Promise<AutoModerationRuleEntity> {
    return this.#rest.patch(
      AutoModerationApi.ROUTES.guildAutoModerationRule(guildId, ruleId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Deletes an auto moderation rule.
   *
   * @param guildId - ID of the guild
   * @param ruleId - ID of the rule to delete
   * @param reason - Optional audit log reason for the deletion
   * @returns A promise that resolves when the rule is deleted
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#delete-auto-moderation-rule}
   *
   * Requires the MANAGE_GUILD permission.
   */
  deleteAutoModerationRule(
    guildId: Snowflake,
    ruleId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.#rest.delete(
      AutoModerationApi.ROUTES.guildAutoModerationRule(guildId, ruleId),
      {
        reason,
      },
    );
  }
}
