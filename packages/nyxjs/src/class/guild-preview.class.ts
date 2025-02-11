import {
  type GuildFeature,
  GuildPreviewEntity,
  type Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { Emoji } from "./emoji.class.js";
import { Sticker } from "./sticker.class.js";

export class GuildPreview extends BaseClass<GuildPreviewEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof GuildPreviewEntity>> = {},
  ) {
    super(client, GuildPreviewEntity, data);
  }

  get id(): Snowflake {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get icon(): string | null {
    return this.data.icon ?? null;
  }

  get splash(): string | null {
    return this.data.splash ?? null;
  }

  get discoverySplash(): string | null {
    return this.data.discovery_splash ?? null;
  }

  get emojis(): Emoji[] {
    return Array.isArray(this.data.emojis)
      ? this.data.emojis.map((emoji) => new Emoji(this.client, emoji))
      : [];
  }

  get features(): GuildFeature[] {
    return Array.isArray(this.data.features) ? [...this.data.features] : [];
  }

  get approximateMemberCount(): number {
    return this.data.approximate_member_count;
  }

  get approximatePresenceCount(): number {
    return this.data.approximate_presence_count;
  }

  get description(): string | null {
    return this.data.description ?? null;
  }

  get stickers(): Sticker[] {
    return Array.isArray(this.data.stickers)
      ? this.data.stickers.map((sticker) => new Sticker(this.client, sticker))
      : [];
  }

  toJson(): GuildPreviewEntity {
    return { ...this.data };
  }
}

export const GuildPreviewSchema = z.instanceof(GuildPreview);
