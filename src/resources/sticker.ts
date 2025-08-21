import type { Snowflake } from "../common/index.js";
import type { UserObject } from "./user.js";

export enum StickerType {
  Standard = 1,
  Guild = 2,
}

export enum StickerFormatType {
  Png = 1,
  APng = 2,
  Lottie = 3,
  Gif = 4,
}

export interface StickerObject {
  id: Snowflake;
  pack_id?: Snowflake;
  name: string;
  description: string | null;
  tags: string;
  type: StickerType;
  format_type: StickerFormatType;
  available?: boolean;
  guild_id?: Snowflake;
  user?: UserObject;
  sort_value?: number;
}

export interface StickerItemObject {
  id: Snowflake;
  name: string;
  format_type: StickerFormatType;
}

export interface StickerPackObject {
  id: Snowflake;
  stickers: StickerObject[];
  name: string;
  sku_id: Snowflake;
  cover_sticker_id?: Snowflake;
  description: string;
  banner_asset_id?: Snowflake;
}
