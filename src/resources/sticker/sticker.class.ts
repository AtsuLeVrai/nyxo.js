import { BaseClass } from "../../bases/index.js";
import type { CamelCaseKeys } from "../../utils/index.js";
import type { StickerEntity, StickerPackEntity } from "./sticker.entity.js";

export class Sticker extends BaseClass<StickerEntity> implements CamelCaseKeys<StickerEntity> {
  readonly id = this.rawData.id;
  readonly packId = this.rawData.pack_id;
  readonly name = this.rawData.name;
  readonly description = this.rawData.description;
  readonly tags = this.rawData.tags;
  readonly type = this.rawData.type;
  readonly formatType = this.rawData.format_type;
  readonly available = this.rawData.available;
  readonly guildId = this.rawData.guild_id;
  readonly user = this.rawData.user;
  readonly sortValue = this.rawData.sort_value;
}

export class StickerPack
  extends BaseClass<StickerPackEntity>
  implements CamelCaseKeys<StickerPackEntity>
{
  readonly id = this.rawData.id;
  readonly stickers = this.rawData.stickers.map((sticker) => new Sticker(this.client, sticker));
  readonly name = this.rawData.name;
  readonly skuId = this.rawData.sku_id;
  readonly coverStickerId = this.rawData.cover_sticker_id;
  readonly description = this.rawData.description;
  readonly bannerAssetId = this.rawData.banner_asset_id;
}
