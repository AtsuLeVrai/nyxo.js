import type { FileInput, SetNonNullable } from "../utils/index.js";
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
  readonly id: string;

  readonly pack_id?: string;

  readonly name: string;

  readonly description: string | null;

  readonly tags: string;

  readonly type: StickerTypes;

  readonly format_type: StickerFormatTypes;

  readonly available?: boolean;

  readonly guild_id?: string;

  readonly user?: UserObject;

  readonly sort_value?: number;
}

export interface StickerItemObject {
  readonly id: string;

  readonly name: string;

  readonly format_type: StickerFormatTypes;
}

export interface StickerPackObject {
  readonly id: string;

  readonly stickers: StickerObject[];

  readonly name: string;

  readonly sku_id: string;

  readonly cover_sticker_id?: string;

  readonly description: string;

  readonly banner_asset_id?: string;
}

export interface ListStickerPacksResponse {
  readonly sticker_packs: StickerPackObject[];
}

export interface CreateGuildStickerFormParams
  extends SetNonNullable<Pick<StickerObject, "name" | "description" | "tags">> {
  readonly file: FileInput;
}

export type ModifyGuildStickerJSONParams = Partial<Omit<CreateGuildStickerFormParams, "file">>;
