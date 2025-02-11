import { type Snowflake, WelcomeScreenChannelEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class WelcomeScreenChannel extends BaseClass<WelcomeScreenChannelEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof WelcomeScreenChannelEntity>> = {},
  ) {
    super(client, WelcomeScreenChannelEntity, data);
  }

  get channelId(): Snowflake {
    return this.data.channel_id;
  }

  get description(): string {
    return this.data.description;
  }

  get emojiId(): Snowflake | null {
    return this.data.emoji_id ?? null;
  }

  get emojiName(): string | null {
    return this.data.emoji_name ?? null;
  }

  toJson(): WelcomeScreenChannelEntity {
    return { ...this.data };
  }
}

export const WelcomeScreenChannelSchema = z.instanceof(WelcomeScreenChannel);
