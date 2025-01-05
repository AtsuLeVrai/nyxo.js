import {
  AutoModerationActionSchema,
  AutoModerationRuleTriggerType,
  SnowflakeSchema,
} from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#auto-moderation-action-execution-auto-moderation-action-execution-event-fields}
 */
export const AutoModerationActionExecutionSchema = z
  .object({
    guild_id: SnowflakeSchema,
    action: AutoModerationActionSchema,
    rule_id: SnowflakeSchema,
    rule_trigger_type: z.nativeEnum(AutoModerationRuleTriggerType),
    user_id: SnowflakeSchema,
    channel_id: SnowflakeSchema.optional(),
    message_id: SnowflakeSchema.optional(),
    alert_system_message_id: SnowflakeSchema.optional(),
    content: z.string().optional(),
    matched_keyword: z.string().nullable(),
    matched_content: z.string().nullish(),
  })
  .strict();

export type AutoModerationActionExecutionEntity = z.infer<
  typeof AutoModerationActionExecutionSchema
>;
