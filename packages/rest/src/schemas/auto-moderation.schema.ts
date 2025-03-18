import { AutoModerationRuleEntity, Snowflake } from "@nyxjs/core";
import { z } from "zod";

/**
 * Schema for creating a new Auto Moderation rule.
 * Extends relevant fields from the AutoModerationRuleEntity to ensure consistency.
 *
 * @remarks
 * Auto Moderation rules enable server admins to set up automatic moderation
 * filters based on various criteria like keyword matching, spam detection, etc.
 *
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule-json-params}
 */
export const CreateAutoModerationRuleSchema = z.object({
  /** The name of the rule (1-32 characters) */
  name: AutoModerationRuleEntity.shape.name,

  /** The type of event to trigger the rule (message send, etc.) */
  event_type: AutoModerationRuleEntity.shape.event_type,

  /** The type of content to trigger the rule (keyword, spam, etc.) */
  trigger_type: AutoModerationRuleEntity.shape.trigger_type,

  /** Additional metadata needed for certain trigger types */
  trigger_metadata: AutoModerationRuleEntity.shape.trigger_metadata.optional(),

  /** The actions to take when the rule is triggered */
  actions: AutoModerationRuleEntity.shape.actions,

  /** Whether the rule is enabled (false by default) */
  enabled: z.boolean().default(false),

  /** Array of role IDs that should not trigger the rule (max 20) */
  exempt_roles: Snowflake.array().max(20).optional(),

  /** Array of channel IDs where the rule should not apply (max 50) */
  exempt_channels: Snowflake.array().max(50).optional(),
});

export type CreateAutoModerationRuleSchema = z.input<
  typeof CreateAutoModerationRuleSchema
>;

/**
 * Schema for modifying an existing Auto Moderation rule.
 * Extends from the creation schema but makes fields optional and removes `trigger_type`
 * which cannot be modified after rule creation.
 *
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule-json-params}
 */
export const ModifyAutoModerationRuleSchema =
  CreateAutoModerationRuleSchema.omit({
    trigger_type: true,
  }).partial();

export type ModifyAutoModerationRuleSchema = z.input<
  typeof ModifyAutoModerationRuleSchema
>;
