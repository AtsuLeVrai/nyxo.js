import type {
  AutoModerationActionEntity,
  AutoModerationRuleTriggerType,
  Snowflake,
} from "@nyxjs/core";
import { AutoModerationActionExecutionEntity } from "@nyxjs/gateway";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class AutoModerationActionExecution extends BaseClass<AutoModerationActionExecutionEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof AutoModerationActionExecutionEntity>> = {},
  ) {
    super(client, AutoModerationActionExecutionEntity, data);
  }

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

  get channelId(): Snowflake | null {
    return this.data.channel_id ?? null;
  }

  get messageId(): Snowflake | null {
    return this.data.message_id ?? null;
  }

  get alertSystemMessageId(): Snowflake | null {
    return this.data.alert_system_message_id ?? null;
  }

  get content(): string | null {
    return this.data.content ?? null;
  }

  get matchedKeyword(): string | null {
    return this.data.matched_keyword ?? null;
  }

  get matchedContent(): string | null {
    return this.data.matched_content ?? null;
  }

  toJson(): AutoModerationActionExecutionEntity {
    return { ...this.data };
  }
}

export const AutoModerationActionExecutionSchema = z.instanceof(
  AutoModerationActionExecution,
);
