import {
  AutoModerationActionEntity,
  AutoModerationEventType,
  AutoModerationRuleTriggerMetadataEntity,
  AutoModerationRuleTriggerType,
  Snowflake,
} from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule-json-params}
 */
export const CreateAutoModerationRuleSchema = z.object({
  name: z.string(),
  event_type: z.nativeEnum(AutoModerationEventType),
  trigger_type: z.nativeEnum(AutoModerationRuleTriggerType),
  trigger_metadata: AutoModerationRuleTriggerMetadataEntity.optional(),
  actions: AutoModerationActionEntity.array(),
  enabled: z.boolean().default(false),
  exempt_roles: Snowflake.array().max(20).optional(),
  exempt_channels: Snowflake.array().max(50).optional(),
});

export type CreateAutoModerationRuleSchema = z.input<
  typeof CreateAutoModerationRuleSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule-json-params}
 */

export const ModifyAutoModerationRuleSchema =
  CreateAutoModerationRuleSchema.omit({
    trigger_type: true,
  }).partial();

export type ModifyAutoModerationRuleSchema = z.input<
  typeof ModifyAutoModerationRuleSchema
>;
