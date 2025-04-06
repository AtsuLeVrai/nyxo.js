import type {
  AutoModerationActionEntity,
  AutoModerationEventType,
  AutoModerationRuleEntity,
  AutoModerationRuleTriggerMetadataEntity,
  AutoModerationRuleTriggerType,
  Snowflake,
} from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../bases/index.js";

export class AutoModerationRule extends BaseClass<AutoModerationRuleEntity> {
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

  protected override getCacheInfo(): CacheEntityInfo | null {
    return {
      storeKey: "autoModerationRules",
      id: this.id,
    };
  }
}
