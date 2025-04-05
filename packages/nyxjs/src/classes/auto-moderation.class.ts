import type {
  AutoModerationActionEntity,
  AutoModerationRuleTriggerType,
  Snowflake,
} from "@nyxjs/core";
import type { AutoModerationActionExecutionEntity } from "@nyxjs/gateway";
import { BaseClass } from "../bases/index.js";

/**
 * Represents an AUTO_MODERATION_ACTION_EXECUTION event dispatched when a rule is triggered and an action is executed.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#auto-moderation-action-execution}
 */
export class AutoModerationActionExecution extends BaseClass<AutoModerationActionExecutionEntity> {
  /**
   * ID of the guild in which action was executed
   */
  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  /**
   * Action which was executed
   */
  get action(): AutoModerationActionEntity {
    return this.data.action;
  }

  /**
   * ID of the rule which action belongs to
   */
  get ruleId(): Snowflake {
    return this.data.rule_id;
  }

  /**
   * Trigger type of rule which was triggered
   */
  get ruleTriggerType(): AutoModerationRuleTriggerType {
    return this.data.rule_trigger_type;
  }

  /**
   * ID of the user which generated the content which triggered the rule
   */
  get userId(): Snowflake {
    return this.data.user_id;
  }

  /**
   * ID of the channel in which user content was posted
   */
  get channelId(): Snowflake | null {
    return this.data.channel_id || null;
  }

  /**
   * ID of any user message which content belongs to
   */
  get messageId(): Snowflake | null {
    return this.data.message_id || null;
  }

  /**
   * ID of any system auto moderation messages posted as a result of this action
   */
  get alertSystemMessageId(): Snowflake | null {
    return this.data.alert_system_message_id || null;
  }

  /**
   * User-generated text content (requires MESSAGE_CONTENT intent)
   */
  get content(): string | null {
    return this.data.content || null;
  }

  /**
   * Word or phrase configured in the rule that triggered the rule
   */
  get matchedKeyword(): string | null {
    return this.data.matched_keyword;
  }

  /**
   * Substring in content that triggered the rule (requires MESSAGE_CONTENT intent)
   */
  get matchedContent(): string | null {
    return this.data.matched_content;
  }
}
