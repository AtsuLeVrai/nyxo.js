import type {
  AutoModerationActionEntity,
  AutoModerationRuleTriggerType,
  Snowflake,
} from "@nyxjs/core";
import type { AutoModerationActionExecutionEntity } from "@nyxjs/gateway";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import type { EnforceCamelCase } from "../../types/index.js";

export class AutoModerationActionExecution
  extends BaseClass<AutoModerationActionExecutionEntity>
  implements EnforceCamelCase<AutoModerationActionExecutionEntity>
{
  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get action(): AutoModerationActionEntity {
    return this.data.action;
  }

  get ruleId(): Snowflake {
    return this.data.rule_id;
  }

  get ruleTriggerType(): AutoModerationRuleTriggerType {
    return this.data.rule_trigger_type;
  }

  get userId(): Snowflake {
    return this.data.user_id;
  }

  get channelId(): Snowflake | undefined {
    return this.data.channel_id;
  }

  get messageId(): Snowflake | undefined {
    return this.data.message_id;
  }

  get alertSystemMessageId(): Snowflake | undefined {
    return this.data.alert_system_message_id;
  }

  get content(): string | undefined {
    return this.data.content;
  }

  get matchedKeyword(): string | null {
    return this.data.matched_keyword;
  }

  get matchedContent(): string | null {
    return this.data.matched_content;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}
