import type { UserEntity } from "../user/index.js";

export enum StickerFormatType {
  Png = 1,
  Apng = 2,
  Lottie = 3,
  Gif = 4,
}

export enum StickerType {
  Standard = 1,
  Guild = 2,
}

export interface StickerEntity {
  id: string;
  pack_id?: string;
  name: string;
  description: string | null;
  tags: string;
  type: StickerType;
  format_type: StickerFormatType;
  available?: boolean;
  guild_id?: string;
  user?: UserEntity;
  sort_value?: number;
}

export interface StickerItemEntity {
  id: string;
  name: string;
  format_type: StickerFormatType;
}

export interface StickerPackEntity {
  id: string;
  stickers: StickerEntity[];
  name: string;
  sku_id: string;
  cover_sticker_id?: string;
  description: string;
  banner_asset_id?: string;
}
