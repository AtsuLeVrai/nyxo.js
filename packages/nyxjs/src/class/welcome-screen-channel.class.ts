import { type Snowflake, WelcomeScreenChannelEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class WelcomeScreenChannel extends BaseClass<WelcomeScreenChannelEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof WelcomeScreenChannelEntity>> = {},
  ) {
    super(client, WelcomeScreenChannelEntity, entity);
  }

  get channelId(): Snowflake {
    return this.entity.channel_id;
  }

  get description(): string {
    return this.entity.description;
  }

  get emojiId(): Snowflake | null {
    return this.entity.emoji_id ?? null;
  }

  get emojiName(): string | null {
    return this.entity.emoji_name ?? null;
  }

  toJson(): WelcomeScreenChannelEntity {
    return { ...this.entity };
  }
}

export const WelcomeScreenChannelSchema = z.instanceof(WelcomeScreenChannel);
