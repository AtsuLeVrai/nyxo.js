import { AutoModerationActionExecutionEntity } from "@nyxjs/gateway";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class AutoModerationActionExecution {
  readonly #data: AutoModerationActionExecutionEntity;

  constructor(
    data: Partial<z.input<typeof AutoModerationActionExecutionEntity>> = {},
  ) {
    try {
      this.#data = AutoModerationActionExecutionEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get guildId(): unknown {
    return this.#data.guild_id;
  }

  get action(): unknown {
    return this.#data.action;
  }

  get ruleId(): unknown {
    return this.#data.rule_id;
  }

  get ruleTriggerType(): unknown {
    return this.#data.rule_trigger_type;
  }

  get userId(): unknown {
    return this.#data.user_id;
  }

  get channelId(): unknown | null {
    return this.#data.channel_id ?? null;
  }

  get messageId(): unknown | null {
    return this.#data.message_id ?? null;
  }

  get alertSystemMessageId(): unknown | null {
    return this.#data.alert_system_message_id ?? null;
  }

  get content(): string | null {
    return this.#data.content ?? null;
  }

  get matchedKeyword(): string | null {
    return this.#data.matched_keyword ?? null;
  }

  get matchedContent(): string | null {
    return this.#data.matched_content ?? null;
  }

  static fromJson(
    json: AutoModerationActionExecutionEntity,
  ): AutoModerationActionExecution {
    return new AutoModerationActionExecution(json);
  }

  toJson(): AutoModerationActionExecutionEntity {
    return { ...this.#data };
  }

  clone(): AutoModerationActionExecution {
    return new AutoModerationActionExecution(this.toJson());
  }

  validate(): boolean {
    try {
      AutoModerationActionExecutionSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(
    other: Partial<AutoModerationActionExecutionEntity>,
  ): AutoModerationActionExecution {
    return new AutoModerationActionExecution({ ...this.toJson(), ...other });
  }

  equals(other: AutoModerationActionExecution): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const AutoModerationActionExecutionSchema = z.instanceof(
  AutoModerationActionExecution,
);
