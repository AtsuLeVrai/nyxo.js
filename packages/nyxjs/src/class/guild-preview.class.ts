import {
  type GuildFeature,
  GuildPreviewEntity,
  type Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { Emoji } from "./emoji.class.js";
import { Sticker } from "./sticker.class.js";

export class GuildPreview {
  readonly #data: GuildPreviewEntity;

  constructor(data: Partial<z.input<typeof GuildPreviewEntity>> = {}) {
    try {
      this.#data = GuildPreviewEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get id(): Snowflake {
    return this.#data.id;
  }

  get name(): string {
    return this.#data.name;
  }

  get icon(): string | null {
    return this.#data.icon ?? null;
  }

  get splash(): string | null {
    return this.#data.splash ?? null;
  }

  get discoverySplash(): string | null {
    return this.#data.discovery_splash ?? null;
  }

  get emojis(): Emoji[] {
    return Array.isArray(this.#data.emojis)
      ? this.#data.emojis.map((emoji) => new Emoji(emoji))
      : [];
  }

  get features(): GuildFeature[] {
    return Array.isArray(this.#data.features) ? [...this.#data.features] : [];
  }

  get approximateMemberCount(): number {
    return this.#data.approximate_member_count;
  }

  get approximatePresenceCount(): number {
    return this.#data.approximate_presence_count;
  }

  get description(): string | null {
    return this.#data.description ?? null;
  }

  get stickers(): Sticker[] {
    return Array.isArray(this.#data.stickers)
      ? this.#data.stickers.map((sticker) => new Sticker(sticker))
      : [];
  }

  toJson(): GuildPreviewEntity {
    return { ...this.#data };
  }

  clone(): GuildPreview {
    return new GuildPreview(this.toJson());
  }

  validate(): boolean {
    try {
      GuildPreviewSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<GuildPreviewEntity>): GuildPreview {
    return new GuildPreview({ ...this.toJson(), ...other });
  }

  equals(other: GuildPreview): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const GuildPreviewSchema = z.instanceof(GuildPreview);
