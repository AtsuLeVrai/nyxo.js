import { type Snowflake, StickerPackEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { Sticker } from "./sticker.class.js";

export class StickerPack extends BaseClass<StickerPackEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof StickerPackEntity>> = {},
  ) {
    super(client, StickerPackEntity, data);
  }

  get id(): Snowflake {
    return this.data.id;
  }

  get stickers(): Sticker[] {
    return Array.isArray(this.data.stickers)
      ? this.data.stickers.map((sticker) => new Sticker(this.client, sticker))
      : [];
  }

  get name(): string {
    return this.data.name;
  }

  get skuId(): Snowflake {
    return this.data.sku_id;
  }

  get coverStickerId(): Snowflake | null {
    return this.data.cover_sticker_id ?? null;
  }

  get description(): string {
    return this.data.description;
  }

  get bannerAssetId(): Snowflake | null {
    return this.data.banner_asset_id ?? null;
  }

  toJson(): StickerPackEntity {
    return { ...this.data };
  }
}

export const StickerPackSchema = z.instanceof(StickerPack);
