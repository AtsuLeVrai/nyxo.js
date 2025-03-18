import type { AutoModerationRuleEntity, Snowflake } from "@nyxjs/core";
import { fromZodError } from "zod-validation-error";
import type { Rest } from "../core/index.js";
import {
  CreateAutoModerationRuleSchema,
  ModifyAutoModerationRuleSchema,
} from "../schemas/index.js";

/**
 * Router for Discord Auto Moderation-related API endpoints.
 * Provides methods to interact with guild auto moderation rules.
 *
 * @remarks
 * Auto Moderation enables automatic message moderation through server-defined rules
 * based on keywords, spam detection, and other trigger types.
 */
export class AutoModerationRouter {
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

  /** The REST client used for making API requests */
  readonly #rest: Rest;

  /**
   * Creates a new AutoModerationRouter instance.
   * @param rest - The REST client to use for making API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches all auto moderation rules for a guild.
   *
   * @param guildId - ID of the guild to fetch rules from
   * @returns A promise that resolves to an array of auto moderation rules
   * @remarks Requires the MANAGE_GUILD permission
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
   * Fetches a specific auto moderation rule from a guild.
   *
   * @param guildId - ID of the guild
   * @param ruleId - ID of the auto moderation rule to fetch
   * @returns A promise that resolves to the auto moderation rule
   * @remarks Requires the MANAGE_GUILD permission
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
   * Creates a new auto moderation rule in a guild.
   *
   * @param guildId - ID of the guild where the rule will be created
   * @param options - Configuration options for the new rule
   * @param reason - Optional audit log reason for the creation
   * @returns A promise that resolves to the created auto moderation rule
   * @throws Error if the provided options fail validation
   * @remarks Requires the MANAGE_GUILD permission
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
   * Modifies an existing auto moderation rule.
   *
   * @param guildId - ID of the guild
   * @param ruleId - ID of the rule to modify
   * @param options - New configuration options for the rule
   * @param reason - Optional audit log reason for the modification
   * @returns A promise that resolves to the updated auto moderation rule
   * @throws Error if the provided options fail validation
   * @remarks Requires the MANAGE_GUILD permission
   * @remarks The trigger_type field cannot be modified after rule creation
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
   * Deletes an auto moderation rule.
   *
   * @param guildId - ID of the guild
   * @param ruleId - ID of the rule to delete
   * @param reason - Optional audit log reason for the deletion
   * @returns A promise that resolves when the rule is deleted
   * @remarks Requires the MANAGE_GUILD permission
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
