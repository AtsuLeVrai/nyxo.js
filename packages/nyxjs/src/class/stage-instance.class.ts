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
    entity: Partial<z.input<typeof StageInstanceEntity>> = {},
  ) {
    super(client, StageInstanceEntity, entity);
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get guildId(): Snowflake {
    return this.entity.guild_id;
  }

  get channelId(): Snowflake {
    return this.entity.channel_id;
  }

  get topic(): string {
    return this.entity.topic;
  }

  get privacyLevel(): StageInstancePrivacyLevel {
    return this.entity.privacy_level;
  }

  get discoverableDisabled(): boolean {
    return Boolean(this.entity.discoverable_disabled);
  }

  get guildScheduledEventId(): Snowflake | null {
    return this.entity.guild_scheduled_event_id ?? null;
  }

  toJson(): StageInstanceEntity {
    return { ...this.entity };
  }
}

export const StageInstanceSchema = z.instanceof(StageInstance);
