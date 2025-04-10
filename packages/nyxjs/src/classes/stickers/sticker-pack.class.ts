import type { Snowflake, StickerEntity, StickerPackEntity } from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import type { EnforceCamelCase } from "../../types/index.js";

export class StickerPack
  extends BaseClass<StickerPackEntity>
  implements EnforceCamelCase<StickerPackEntity>
{
  get id(): Snowflake {
    return this.data.id;
  }

  get stickers(): StickerEntity[] {
    return this.data.stickers;
  }

  get name(): string {
    return this.data.name;
  }

  get skuId(): Snowflake {
    return this.data.sku_id;
  }

  get coverStickerId(): Snowflake | undefined {
    return this.data.cover_sticker_id;
  }

  get description(): string {
    return this.data.description;
  }

  get bannerAssetId(): Snowflake | undefined {
    return this.data.banner_asset_id;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}
