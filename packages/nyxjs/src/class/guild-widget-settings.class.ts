import { GuildWidgetSettingsEntity, type Snowflake } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class GuildWidgetSettings extends BaseClass<GuildWidgetSettingsEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof GuildWidgetSettingsEntity>> = {},
  ) {
    super(client, GuildWidgetSettingsEntity, data);
  }

  get enabled(): boolean {
    return Boolean(this.data.enabled);
  }

  get channelId(): Snowflake | null {
    return this.data.channel_id ?? null;
  }

  toJson(): GuildWidgetSettingsEntity {
    return { ...this.data };
  }
}

export const GuildWidgetSettingsSchema = z.instanceof(GuildWidgetSettings);
