import {
  type AutoModerationActionEntity,
  type AutoModerationEventType,
  AutoModerationRuleEntity,
  type AutoModerationRuleTriggerMetadataEntity,
  type AutoModerationRuleTriggerType,
  type Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class AutoModerationRule extends BaseClass<AutoModerationRuleEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof AutoModerationRuleEntity>> = {},
  ) {
    super(client, AutoModerationRuleEntity, entity);
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get guildId(): Snowflake {
    return this.entity.guild_id;
  }

  get name(): string {
    return this.entity.name;
  }

  get creatorId(): Snowflake {
    return this.entity.creator_id;
  }

  get eventType(): AutoModerationEventType {
    return this.entity.event_type;
  }

  get triggerType(): AutoModerationRuleTriggerType {
    return this.entity.trigger_type;
  }

  get triggerMetadata(): AutoModerationRuleTriggerMetadataEntity | null {
    return this.entity.trigger_metadata
      ? { ...this.entity.trigger_metadata }
      : null;
  }

  get actions(): AutoModerationActionEntity[] {
    return Array.isArray(this.entity.actions) ? [...this.entity.actions] : [];
  }

  get enabled(): boolean {
    return Boolean(this.entity.enabled);
  }

  get exemptRoles(): Snowflake[] {
    return Array.isArray(this.entity.exempt_roles)
      ? [...this.entity.exempt_roles]
      : [];
  }

  get exemptChannels(): Snowflake[] {
    return Array.isArray(this.entity.exempt_channels)
      ? [...this.entity.exempt_channels]
      : [];
  }

  toJson(): AutoModerationRuleEntity {
    return { ...this.entity };
  }
}

export const AutoModerationRuleSchema = z.instanceof(AutoModerationRule);
