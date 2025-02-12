import { GuildOnboardingPromptOptionEntity, type Snowflake } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { Emoji } from "./emoji.class.js";

export class GuildOnboardingPromptOption extends BaseClass<GuildOnboardingPromptOptionEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof GuildOnboardingPromptOptionEntity>> = {},
  ) {
    super(client, GuildOnboardingPromptOptionEntity, entity);
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get channelIds(): Snowflake[] {
    return Array.isArray(this.entity.channel_ids)
      ? [...this.entity.channel_ids]
      : [];
  }

  get roleIds(): Snowflake[] {
    return Array.isArray(this.entity.role_ids) ? [...this.entity.role_ids] : [];
  }

  get emoji(): Emoji | null {
    return this.entity.emoji ? new Emoji(this.client, this.entity.emoji) : null;
  }

  get emojiId(): Snowflake | null {
    return this.entity.emoji_id ?? null;
  }

  get emojiName(): string | null {
    return this.entity.emoji_name ?? null;
  }

  get emojiAnimated(): boolean {
    return Boolean(this.entity.emoji_animated);
  }

  get title(): string {
    return this.entity.title;
  }

  get description(): string | null {
    return this.entity.description ?? null;
  }

  toJson(): GuildOnboardingPromptOptionEntity {
    return { ...this.entity };
  }
}

export const GuildOnboardingPromptOptionSchema = z.instanceof(
  GuildOnboardingPromptOption,
);
