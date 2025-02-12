import { type Snowflake, StickerPackEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { Sticker } from "./sticker.class.js";

export class StickerPack extends BaseClass<StickerPackEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof StickerPackEntity>> = {},
  ) {
    super(client, StickerPackEntity, entity);
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get stickers(): Sticker[] {
    return Array.isArray(this.entity.stickers)
      ? this.entity.stickers.map((sticker) => new Sticker(this.client, sticker))
      : [];
  }

  get name(): string {
    return this.entity.name;
  }

  get skuId(): Snowflake {
    return this.entity.sku_id;
  }

  get coverStickerId(): Snowflake | null {
    return this.entity.cover_sticker_id ?? null;
  }

  get description(): string {
    return this.entity.description;
  }

  get bannerAssetId(): Snowflake | null {
    return this.entity.banner_asset_id ?? null;
  }

  toJson(): StickerPackEntity {
    return { ...this.entity };
  }
}

export const StickerPackSchema = z.instanceof(StickerPack);
