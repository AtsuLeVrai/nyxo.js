import {
  AutoModerationActionSchema,
  AutoModerationEventType,
  AutoModerationRuleTriggerMetadataSchema,
  AutoModerationRuleTriggerType,
  SnowflakeSchema,
} from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule-json-params}
 */
export const CreateAutoModerationRuleSchema = z
  .object({
    name: z.string(),
    event_type: z.nativeEnum(AutoModerationEventType),
    trigger_type: z.nativeEnum(AutoModerationRuleTriggerType),
    trigger_metadata: AutoModerationRuleTriggerMetadataSchema.optional(),
    actions: z.array(AutoModerationActionSchema),
    enabled: z.boolean().default(false).optional(),
    exempt_roles: z.array(SnowflakeSchema).max(20).optional(),
    exempt_channels: z.array(SnowflakeSchema).max(50).optional(),
  })
  .strict();

export type CreateAutoModerationRuleEntity = z.infer<
  typeof CreateAutoModerationRuleSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule-json-params}
 */

export const ModifyAutoModerationRuleSchema =
  CreateAutoModerationRuleSchema.omit({
    trigger_type: true,
  })
    .strict()
    .partial();

export type ModifyAutoModerationRuleEntity = z.infer<
  typeof ModifyAutoModerationRuleSchema
>;
