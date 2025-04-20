import type {
  Snowflake,
  StickerEntity,
  StickerFormatType,
  StickerItemEntity,
  StickerPackEntity,
  StickerType,
  UserEntity,
} from "@nyxojs/core";
import type { CamelCasedProperties } from "type-fest";
import { BaseClass, Cacheable } from "../bases/index.js";
import type { Enforce } from "../types/index.js";
import { User } from "./user.class.js";

@Cacheable("stickers")
export class Sticker
  extends BaseClass<StickerEntity>
  implements Enforce<CamelCasedProperties<StickerEntity>>
{
  get id(): Snowflake {
    return this.data.id;
  }

  get packId(): Snowflake | undefined {
    return this.data.pack_id;
  }

  get name(): string {
    return this.data.name;
  }

  get description(): string | null {
    return this.data.description;
  }

  get tags(): string {
    return this.data.tags;
  }

  get type(): StickerType {
    return this.data.type;
  }

  get formatType(): StickerFormatType {
    return this.data.format_type;
  }

  get available(): boolean {
    return Boolean(this.data.available);
  }

  get guildId(): Snowflake | undefined {
    return this.data.guild_id;
  }

  get user(): User | undefined {
    if (!this.data.user) {
      return undefined;
    }

    return new User(this.client, this.data.user as UserEntity);
  }

  get sortValue(): number | undefined {
    return this.data.sort_value;
  }

  get asset(): string | undefined {
    return this.data.asset;
  }
}

export class StickerItem
  extends BaseClass<StickerItemEntity>
  implements Enforce<CamelCasedProperties<StickerItemEntity>>
{
  get id(): Snowflake {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get formatType(): StickerFormatType {
    return this.data.format_type;
  }
}

export class StickerPack
  extends BaseClass<StickerPackEntity>
  implements Enforce<CamelCasedProperties<StickerPackEntity>>
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
}
