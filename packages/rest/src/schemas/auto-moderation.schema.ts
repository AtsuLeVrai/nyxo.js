import type { AutoModerationRuleEntity, Snowflake } from "@nyxjs/core";

/**
 * Interface for creating a new Auto Moderation rule.
 * Inherits relevant fields from the AutoModerationRuleEntity to ensure consistency.
 *
 * @remarks
 * Auto Moderation rules enable server admins to set up automatic moderation
 * filters based on various criteria like keyword matching, spam detection, etc.
 *
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule-json-params}
 */
export interface CreateAutoModerationRuleSchema {
  /**
   * The name of the rule (1-32 characters)
   *
   * @minLength 1
   * @maxLength 100
   */
  name: string;

  /** The type of event to trigger the rule (message send, etc.) */
  event_type: number;

  /** The type of content to trigger the rule (keyword, spam, etc.) */
  trigger_type: number;

  /**
   * Additional metadata needed for certain trigger types
   *
   * @optional
   */
  trigger_metadata?: AutoModerationRuleEntity["trigger_metadata"];

  /**
   * The actions to take when the rule is triggered
   *
   * @minItems 1
   * @maxItems 3
   */
  actions: AutoModerationRuleEntity["actions"];

  /**
   * Whether the rule is enabled (false by default)
   *
   * @default false
   */
  enabled: boolean;

  /**
   * Array of role IDs that should not trigger the rule (max 20)
   *
   * @maxItems 20
   * @optional
   */
  exempt_roles?: Snowflake[];

  /**
   * Array of channel IDs where the rule should not apply (max 50)
   *
   * @maxItems 50
   * @optional
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
