import type {
  AutoModerationActionEntity,
  AutoModerationRuleTriggerType,
  Snowflake,
} from "@nyxjs/core";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#auto-moderation-action-execution-auto-moderation-action-execution-event-fields}
 */
export interface AutoModerationActionExecutionEntity {
  guild_id: Snowflake;
  action: AutoModerationActionEntity;
  rule_id: Snowflake;
  rule_trigger_type: AutoModerationRuleTriggerType;
  user_id: Snowflake;
  channel_id?: Snowflake;
  message_id?: Snowflake;
  alert_system_message_id?: Snowflake;
  content?: string;
  matched_keyword: string | null;
  matched_content?: string | null;
}
