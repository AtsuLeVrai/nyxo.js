import { StickerPackEntity } from "@nyxjs/core";
import { z } from "zod";

export class StickerPack {
  readonly #data: StickerPackEntity;

  constructor(data: StickerPackEntity) {
    this.#data = StickerPackEntity.parse(data);
  }

  get id(): unknown {
    return this.#data.id;
  }

  get stickers(): object[] {
    return Array.isArray(this.#data.stickers) ? [...this.#data.stickers] : [];
  }

  get name(): string {
    return this.#data.name;
  }

  get skuId(): unknown {
    return this.#data.sku_id;
  }

  get coverStickerId(): unknown | null {
    return this.#data.cover_sticker_id ?? null;
  }

  get description(): string {
    return this.#data.description;
  }

  get bannerAssetId(): unknown | null {
    return this.#data.banner_asset_id ?? null;
  }

  static fromJson(json: StickerPackEntity): StickerPack {
    return new StickerPack(json);
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
