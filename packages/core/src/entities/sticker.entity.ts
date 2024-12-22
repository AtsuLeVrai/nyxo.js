import type { Integer } from "../formatting/index.js";
import type { Snowflake } from "../managers/index.js";
import type { UserEntity } from "./user.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-format-types}
 */
export enum StickerFormatType {
  Png = 1,
  Apng = 2,
  Lottie = 3,
  Gif = 4,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-types}
 */
export enum StickerType {
  Standard = 1,
  Guild = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-structure}
 */
export interface StickerEntity {
  id: Snowflake;
  pack_id?: Snowflake;
  name: string;
  description: string | null;
  tags: string;
  type: StickerType;
  format_type: StickerFormatType;
  available?: boolean;
  guild_id?: Snowflake;
  user?: UserEntity;
  sort_value?: Integer;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-pack-object-sticker-pack-structure}
 */
export interface StickerPackEntity {
  id: Snowflake;
  stickers: StickerEntity[];
  name: string;
  sku_id: Snowflake;
  cover_sticker_id?: Snowflake;
  description: string;
  banner_asset_id?: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-item-object-sticker-item-structure}
 */
export interface StickerItemEntity {
  format_type: StickerFormatType;
  id: Snowflake;
  name: string;
}
