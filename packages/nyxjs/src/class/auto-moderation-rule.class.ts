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
    data: Partial<z.input<typeof AutoModerationRuleEntity>> = {},
  ) {
    super(client, AutoModerationRuleEntity, data);
  }

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

  get triggerMetadata(): AutoModerationRuleTriggerMetadataEntity | null {
    return this.data.trigger_metadata
      ? { ...this.data.trigger_metadata }
      : null;
  }

  get actions(): AutoModerationActionEntity[] {
    return Array.isArray(this.data.actions) ? [...this.data.actions] : [];
  }

  get enabled(): boolean {
    return Boolean(this.data.enabled);
  }

  get exemptRoles(): Snowflake[] {
    return Array.isArray(this.data.exempt_roles)
      ? [...this.data.exempt_roles]
      : [];
  }

  get exemptChannels(): Snowflake[] {
    return Array.isArray(this.data.exempt_channels)
      ? [...this.data.exempt_channels]
      : [];
  }

  toJson(): AutoModerationRuleEntity {
    return { ...this.data };
  }
}

export const AutoModerationRuleSchema = z.instanceof(AutoModerationRule);
