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
    entity: Partial<z.input<typeof AutoModerationActionExecutionEntity>> = {},
  ) {
    super(client, AutoModerationActionExecutionEntity, entity);
  }

  get guildId(): Snowflake {
    return this.entity.guild_id;
  }

  get action(): AutoModerationActionEntity {
    return this.entity.action;
  }

  get ruleId(): Snowflake {
    return this.entity.rule_id;
  }

  get ruleTriggerType(): AutoModerationRuleTriggerType {
    return this.entity.rule_trigger_type;
  }

  get userId(): Snowflake {
    return this.entity.user_id;
  }

  get channelId(): Snowflake | null {
    return this.entity.channel_id ?? null;
  }

  get messageId(): Snowflake | null {
    return this.entity.message_id ?? null;
  }

  get alertSystemMessageId(): Snowflake | null {
    return this.entity.alert_system_message_id ?? null;
  }

  get content(): string | null {
    return this.entity.content ?? null;
  }

  get matchedKeyword(): string | null {
    return this.entity.matched_keyword ?? null;
  }

  get matchedContent(): string | null {
    return this.entity.matched_content ?? null;
  }

  toJson(): AutoModerationActionExecutionEntity {
    return { ...this.entity };
  }
}

export const AutoModerationActionExecutionSchema = z.instanceof(
  AutoModerationActionExecution,
);
