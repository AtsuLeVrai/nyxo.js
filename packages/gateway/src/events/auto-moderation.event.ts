import {
  AutoModerationActionEntity,
  AutoModerationRuleTriggerType,
  Snowflake,
} from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#auto-moderation-action-execution-auto-moderation-action-execution-event-fields}
 */
export const AutoModerationActionExecutionEntity = z
  .object({
    guild_id: Snowflake,
    action: AutoModerationActionEntity,
    rule_id: Snowflake,
    rule_trigger_type: z.nativeEnum(AutoModerationRuleTriggerType),
    user_id: Snowflake,
    channel_id: Snowflake.optional(),
    message_id: Snowflake.optional(),
    alert_system_message_id: Snowflake.optional(),
    content: z.string().optional(),
    matched_keyword: z.string().nullable(),
    matched_content: z.string().nullish(),
  })
  .strict();

export type AutoModerationActionExecutionEntity = z.infer<
  typeof AutoModerationActionExecutionEntity
>;
