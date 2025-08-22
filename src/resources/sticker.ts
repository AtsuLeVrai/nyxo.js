import type { Snowflake } from "../common/index.js";
import type { EndpointFactory } from "../utils/index.js";
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

// Sticker Request Interfaces
export interface ListStickerPacksResponse {
  sticker_packs: StickerPackObject[];
}

export interface CreateGuildStickerRequest {
  name: string;
  description: string;
  tags: string;
  file: File;
}

export interface ModifyGuildStickerRequest {
  name?: string;
  description?: string | null;
  tags?: string;
}

export const StickerRoutes = {
  // GET /stickers/{sticker.id} - Get Sticker
  getSticker: ((stickerId: Snowflake) => `/stickers/${stickerId}`) as EndpointFactory<
    `/stickers/${string}`,
    ["GET"],
    StickerObject
  >,

  // GET /sticker-packs - List Sticker Packs
  listStickerPacks: (() => "/sticker-packs") as EndpointFactory<
    "/sticker-packs",
    ["GET"],
    ListStickerPacksResponse
  >,

  // GET /sticker-packs/{pack.id} - Get Sticker Pack
  getStickerPack: ((packId: Snowflake) => `/sticker-packs/${packId}`) as EndpointFactory<
    `/sticker-packs/${string}`,
    ["GET"],
    StickerPackObject
  >,

  // GET /guilds/{guild.id}/stickers - List Guild Stickers
  listGuildStickers: ((guildId: Snowflake) => `/guilds/${guildId}/stickers`) as EndpointFactory<
    `/guilds/${string}/stickers`,
    ["GET", "POST"],
    StickerObject[],
    true,
    true,
    CreateGuildStickerRequest
  >,

  // GET /guilds/{guild.id}/stickers/{sticker.id} - Get Guild Sticker
  getGuildSticker: ((guildId: Snowflake, stickerId: Snowflake) =>
    `/guilds/${guildId}/stickers/${stickerId}`) as EndpointFactory<
    `/guilds/${string}/stickers/${string}`,
    ["GET", "PATCH", "DELETE"],
    StickerObject,
    true,
    false,
    ModifyGuildStickerRequest
  >,
} as const satisfies Record<string, EndpointFactory<any, any, any, any, any, any, any, any>>;
