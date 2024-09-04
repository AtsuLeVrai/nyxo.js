import type { Snowflake } from "@nyxjs/core";
import type { AutoModerationActionStructure, AutoModerationTriggerTypes } from "@nyxjs/rest";

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#auto-moderation-action-execution-auto-moderation-action-execution-event-fields}
 */
export type AutoModerationActionExecutionEventFields = {
    /**
     * Action which was executed
     */
    action: AutoModerationActionStructure;
    /**
     * ID of any system auto moderation messages posted as a result of this action
     */
    alert_system_message_id?: Snowflake;
    /**
     * ID of the channel in which user content was posted
     */
    channel_id?: Snowflake;
    /**
     * User-generated text content
     */
    content?: string;
    /**
     * ID of the guild in which action was executed
     */
    guild_id: Snowflake;
    /**
     * Substring in content that triggered the rule
     */
    matched_content?: string | null;
    /**
     * Word or phrase configured in the rule that triggered the rule
     */
    matched_keyword: string | null;
    /**
     * ID of any user message which content belongs to
     */
    message_id?: Snowflake;
    /**
     * ID of the rule which action belongs to
     */
    rule_id: Snowflake;
    /**
     * Trigger type of rule which was triggered
     */
    rule_trigger_type: AutoModerationTriggerTypes;
    /**
     * ID of the user who triggered the rule
     */
    user_id: Snowflake;
};
