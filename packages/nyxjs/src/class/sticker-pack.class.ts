import { type Snowflake, StickerPackEntity } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { Sticker } from "./sticker.class.js";

export class StickerPack {
  readonly #data: StickerPackEntity;

  constructor(data: Partial<z.input<typeof StickerPackEntity>> = {}) {
    try {
      this.#data = StickerPackEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get id(): Snowflake {
    return this.#data.id;
  }

  get stickers(): Sticker[] {
    return Array.isArray(this.#data.stickers)
      ? this.#data.stickers.map((sticker) => new Sticker(sticker))
      : [];
  }

  get name(): string {
    return this.#data.name;
  }

  get skuId(): Snowflake {
    return this.#data.sku_id;
  }

  get coverStickerId(): Snowflake | null {
    return this.#data.cover_sticker_id ?? null;
  }

  get description(): string {
    return this.#data.description;
  }

  get bannerAssetId(): Snowflake | null {
    return this.#data.banner_asset_id ?? null;
  }

  toJson(): StickerPackEntity {
    return { ...this.#data };
  }

  clone(): StickerPack {
    return new StickerPack(this.toJson());
  }

  validate(): boolean {
    try {
      StickerPackSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<StickerPackEntity>): StickerPack {
    return new StickerPack({ ...this.toJson(), ...other });
  }

  equals(other: StickerPack): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const StickerPackSchema = z.instanceof(StickerPack);
