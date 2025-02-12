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
    entity: Partial<z.input<typeof GuildPreviewEntity>> = {},
  ) {
    super(client, GuildPreviewEntity, entity);
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get name(): string {
    return this.entity.name;
  }

  get icon(): string | null {
    return this.entity.icon ?? null;
  }

  get splash(): string | null {
    return this.entity.splash ?? null;
  }

  get discoverySplash(): string | null {
    return this.entity.discovery_splash ?? null;
  }

  get emojis(): Emoji[] {
    return Array.isArray(this.entity.emojis)
      ? this.entity.emojis.map((emoji) => new Emoji(this.client, emoji))
      : [];
  }

  get features(): GuildFeature[] {
    return Array.isArray(this.entity.features) ? [...this.entity.features] : [];
  }

  get approximateMemberCount(): number {
    return this.entity.approximate_member_count;
  }

  get approximatePresenceCount(): number {
    return this.entity.approximate_presence_count;
  }

  get description(): string | null {
    return this.entity.description ?? null;
  }

  get stickers(): Sticker[] {
    return Array.isArray(this.entity.stickers)
      ? this.entity.stickers.map((sticker) => new Sticker(this.client, sticker))
      : [];
  }

  toJson(): GuildPreviewEntity {
    return { ...this.entity };
  }
}

export const GuildPreviewSchema = z.instanceof(GuildPreview);
