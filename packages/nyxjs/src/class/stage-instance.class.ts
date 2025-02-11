import {
  type Snowflake,
  StageInstanceEntity,
  type StageInstancePrivacyLevel,
} from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class StageInstance extends BaseClass<StageInstanceEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof StageInstanceEntity>> = {},
  ) {
    super(client, StageInstanceEntity, data);
  }

  get id(): Snowflake {
    return this.data.id;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get channelId(): Snowflake {
    return this.data.channel_id;
  }

  get topic(): string {
    return this.data.topic;
  }

  get privacyLevel(): StageInstancePrivacyLevel {
    return this.data.privacy_level;
  }

  get discoverableDisabled(): boolean {
    return Boolean(this.data.discoverable_disabled);
  }

  get guildScheduledEventId(): Snowflake | null {
    return this.data.guild_scheduled_event_id ?? null;
  }

  toJson(): StageInstanceEntity {
    return { ...this.data };
  }
}

export const StageInstanceSchema = z.instanceof(StageInstance);
