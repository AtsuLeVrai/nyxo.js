import { GuildOnboardingPromptOptionEntity, type Snowflake } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { Emoji } from "./emoji.class.js";

export class GuildOnboardingPromptOption extends BaseClass<GuildOnboardingPromptOptionEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof GuildOnboardingPromptOptionEntity>> = {},
  ) {
    super(client, GuildOnboardingPromptOptionEntity, data);
  }

  get id(): Snowflake {
    return this.data.id;
  }

  get channelIds(): Snowflake[] {
    return Array.isArray(this.data.channel_ids)
      ? [...this.data.channel_ids]
      : [];
  }

  get roleIds(): Snowflake[] {
    return Array.isArray(this.data.role_ids) ? [...this.data.role_ids] : [];
  }

  get emoji(): Emoji | null {
    return this.data.emoji ? new Emoji(this.client, this.data.emoji) : null;
  }

  get emojiId(): Snowflake | null {
    return this.data.emoji_id ?? null;
  }

  get emojiName(): string | null {
    return this.data.emoji_name ?? null;
  }

  get emojiAnimated(): boolean {
    return Boolean(this.data.emoji_animated);
  }

  get title(): string {
    return this.data.title;
  }

  get description(): string | null {
    return this.data.description ?? null;
  }

  toJson(): GuildOnboardingPromptOptionEntity {
    return { ...this.data };
  }
}

export const GuildOnboardingPromptOptionSchema = z.instanceof(
  GuildOnboardingPromptOption,
);
