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
export const CreateAutoModerationRuleEntity = z.object({
  name: z.string(),
  event_type: z.nativeEnum(AutoModerationEventType),
  trigger_type: z.nativeEnum(AutoModerationRuleTriggerType),
  trigger_metadata: AutoModerationRuleTriggerMetadataEntity.optional(),
  actions: z.array(AutoModerationActionEntity),
  enabled: z.boolean().optional().default(false),
  exempt_roles: z.array(Snowflake).max(20).optional(),
  exempt_channels: z.array(Snowflake).max(50).optional(),
});

export type CreateAutoModerationRuleEntity = z.infer<
  typeof CreateAutoModerationRuleEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule-json-params}
 */

export const ModifyAutoModerationRuleEntity =
  CreateAutoModerationRuleEntity.omit({
    trigger_type: true,
  }).partial();

export type ModifyAutoModerationRuleEntity = z.infer<
  typeof ModifyAutoModerationRuleEntity
>;
