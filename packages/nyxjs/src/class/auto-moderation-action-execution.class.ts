import type {
  AutoModerationActionEntity,
  AutoModerationRuleTriggerType,
  Snowflake,
} from "@nyxjs/core";
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

  get guildId(): Snowflake {
    return this.#data.guild_id;
  }

  get action(): AutoModerationActionEntity {
    return this.#data.action;
  }

  get ruleId(): Snowflake {
    return this.#data.rule_id;
  }

  get ruleTriggerType(): AutoModerationRuleTriggerType {
    return this.#data.rule_trigger_type;
  }

  get userId(): Snowflake {
    return this.#data.user_id;
  }

  get channelId(): Snowflake | null {
    return this.#data.channel_id ?? null;
  }

  get messageId(): Snowflake | null {
    return this.#data.message_id ?? null;
  }

  get alertSystemMessageId(): Snowflake | null {
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
