import type { SetNonNullable } from "type-fest";
import type { FileInput } from "../core/index.js";
import type { UserObject } from "./user.js";

export enum StickerFormatTypes {
  Png = 1,
  Apng = 2,
  Lottie = 3,
  Gif = 4,
}

export enum StickerTypes {
  Standard = 1,
  Guild = 2,
}

export interface StickerObject {
  id: string;
  pack_id?: string;
  name: string;
  description: string | null;
  tags: string;
  type: StickerTypes;
  format_type: StickerFormatTypes;
  available?: boolean;
  guild_id?: string;
  user?: UserObject;
  sort_value?: number;
}

export interface StickerItemObject {
  id: string;
  name: string;
  format_type: StickerFormatTypes;
}

export interface StickerPackObject {
  id: string;
  stickers: StickerObject[];
  name: string;
  sku_id: string;
  cover_sticker_id?: string;
  description: string;
  banner_asset_id?: string;
}

export interface ListStickerPacksResponse {
  sticker_packs: StickerPackObject[];
}

export interface CreateGuildStickerFormParams
  extends SetNonNullable<Pick<StickerObject, "name" | "description" | "tags">> {
  file: FileInput;
}

export type ModifyGuildStickerJSONParams = Partial<Omit<CreateGuildStickerFormParams, "file">>;

/**
 * Checks if a sticker is a standard Discord sticker
 * @param sticker The sticker to check
 * @returns true if it's a standard sticker
 */
export function isStandardSticker(sticker: StickerObject): boolean {
  return sticker.type === StickerTypes.Standard;
}

/**
 * Checks if a sticker is a guild-specific sticker
 * @param sticker The sticker to check
 * @returns true if it's a guild sticker
 */
export function isGuildSticker(sticker: StickerObject): boolean {
  return sticker.type === StickerTypes.Guild;
}

/**
 * Checks if a sticker is available for use
 * @param sticker The sticker to check
 * @returns true if the sticker is available
 */
export function isStickerAvailable(sticker: StickerObject): boolean {
  return sticker.available !== false;
}

/**
 * Checks if a sticker format is animated
 * @param formatType The sticker format type
 * @returns true if the format supports animation
 */
export function isAnimatedStickerFormat(formatType: StickerFormatTypes): boolean {
  return (
    formatType === StickerFormatTypes.Apng ||
    formatType === StickerFormatTypes.Lottie ||
    formatType === StickerFormatTypes.Gif
  );
}
