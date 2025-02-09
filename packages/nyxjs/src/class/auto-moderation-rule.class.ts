import { AutoModerationRuleEntity } from "@nyxjs/core";
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

  get id(): unknown {
    return this.#data.id;
  }

  get guildId(): unknown {
    return this.#data.guild_id;
  }

  get name(): string {
    return this.#data.name;
  }

  get creatorId(): unknown {
    return this.#data.creator_id;
  }

  get eventType(): unknown {
    return this.#data.event_type;
  }

  get triggerType(): unknown {
    return this.#data.trigger_type;
  }

  get triggerMetadata(): object | null {
    return this.#data.trigger_metadata
      ? { ...this.#data.trigger_metadata }
      : null;
  }

  get actions(): unknown[] {
    return Array.isArray(this.#data.actions) ? [...this.#data.actions] : [];
  }

  get enabled(): boolean {
    return Boolean(this.#data.enabled);
  }

  get exemptRoles(): unknown[] {
    return Array.isArray(this.#data.exempt_roles)
      ? [...this.#data.exempt_roles]
      : [];
  }

  get exemptChannels(): unknown[] {
    return Array.isArray(this.#data.exempt_channels)
      ? [...this.#data.exempt_channels]
      : [];
  }

  static fromJson(json: AutoModerationRuleEntity): AutoModerationRule {
    return new AutoModerationRule(json);
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
