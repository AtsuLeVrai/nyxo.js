import type {
  AutoModerationActionEntity,
  AutoModerationEventType,
  AutoModerationRuleEntity,
  AutoModerationRuleTriggerMetadataEntity,
  AutoModerationRuleTriggerType,
  Snowflake,
} from "@nyxjs/core";
import type { AutoModerationActionExecutionEntity } from "@nyxjs/gateway";
import { BaseClass, Cacheable } from "../bases/index.js";
import type { EnforceCamelCase } from "../types/index.js";

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
}

@Cacheable("autoModerationRules")
export class AutoModerationRule
  extends BaseClass<AutoModerationRuleEntity>
  implements EnforceCamelCase<AutoModerationRuleEntity>
{
  get id(): Snowflake {
    return this.data.id;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get name(): string {
    return this.data.name;
  }

  get creatorId(): Snowflake {
    return this.data.creator_id;
  }

  get eventType(): AutoModerationEventType {
    return this.data.event_type;
  }

  get triggerType(): AutoModerationRuleTriggerType {
    return this.data.trigger_type;
  }

  get triggerMetadata(): AutoModerationRuleTriggerMetadataEntity {
    return this.data.trigger_metadata;
  }

  get actions(): AutoModerationActionEntity[] {
    return this.data.actions;
  }

  get enabled(): boolean {
    return this.data.enabled;
  }

  get exemptRoles(): Snowflake[] {
    return this.data.exempt_roles;
  }

  get exemptChannels(): Snowflake[] {
    return this.data.exempt_channels;
  }
}
