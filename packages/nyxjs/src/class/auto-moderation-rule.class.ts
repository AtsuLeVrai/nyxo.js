import {
  type AutoModerationActionEntity,
  type AutoModerationEventType,
  AutoModerationRuleEntity,
  type AutoModerationRuleTriggerMetadataEntity,
  type AutoModerationRuleTriggerType,
  type Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class AutoModerationRule {
  readonly #data: AutoModerationRuleEntity;

  constructor(data: Partial<z.input<typeof AutoModerationRuleEntity>> = {}) {
    try {
      this.#data = AutoModerationRuleEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get id(): Snowflake {
    return this.#data.id;
  }

  get guildId(): Snowflake {
    return this.#data.guild_id;
  }

  get name(): string {
    return this.#data.name;
  }

  get creatorId(): Snowflake {
    return this.#data.creator_id;
  }

  get eventType(): AutoModerationEventType {
    return this.#data.event_type;
  }

  get triggerType(): AutoModerationRuleTriggerType {
    return this.#data.trigger_type;
  }

  get triggerMetadata(): AutoModerationRuleTriggerMetadataEntity | null {
    return this.#data.trigger_metadata
      ? { ...this.#data.trigger_metadata }
      : null;
  }

  get actions(): AutoModerationActionEntity[] {
    return Array.isArray(this.#data.actions) ? [...this.#data.actions] : [];
  }

  get enabled(): boolean {
    return Boolean(this.#data.enabled);
  }

  get exemptRoles(): Snowflake[] {
    return Array.isArray(this.#data.exempt_roles)
      ? [...this.#data.exempt_roles]
      : [];
  }

  get exemptChannels(): Snowflake[] {
    return Array.isArray(this.#data.exempt_channels)
      ? [...this.#data.exempt_channels]
      : [];
  }

  toJson(): AutoModerationRuleEntity {
    return { ...this.#data };
  }

  clone(): AutoModerationRule {
    return new AutoModerationRule(this.toJson());
  }

  validate(): boolean {
    try {
      AutoModerationRuleSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<AutoModerationRuleEntity>): AutoModerationRule {
    return new AutoModerationRule({ ...this.toJson(), ...other });
  }

  equals(other: AutoModerationRule): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const AutoModerationRuleSchema = z.instanceof(AutoModerationRule);
