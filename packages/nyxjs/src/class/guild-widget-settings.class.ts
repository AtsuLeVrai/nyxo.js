import { GuildWidgetSettingsEntity, type Snowflake } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class GuildWidgetSettings extends BaseClass<GuildWidgetSettingsEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof GuildWidgetSettingsEntity>> = {},
  ) {
    super(client, GuildWidgetSettingsEntity, entity);
  }

  get enabled(): boolean {
    return Boolean(this.entity.enabled);
  }

  get channelId(): Snowflake | null {
    return this.entity.channel_id ?? null;
  }

  toJson(): GuildWidgetSettingsEntity {
    return { ...this.entity };
  }
}

export const GuildWidgetSettingsSchema = z.instanceof(GuildWidgetSettings);
