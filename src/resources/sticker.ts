import type { FileInput, SetNonNullable } from "../utils/index.js";
import type { UserObject } from "./user.js";

/**
 * File formats supported for Discord sticker uploads and display.
 * Determines rendering method and animation capabilities for sticker content.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-format-types} for format types specification
 */
export enum StickerFormatTypes {
  /** Static PNG image format */
  Png = 1,
  /** Animated PNG format with transparency support */
  Apng = 2,
  /** Lottie JSON animation format (requires VERIFIED or PARTNERED guild) */
  Lottie = 3,
  /** Animated GIF format */
  Gif = 4,
}

/**
 * Categories of stickers available in Discord based on their source and availability.
 * Distinguishes between official Discord stickers and user-uploaded guild stickers.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-types} for sticker types specification
 */
export enum StickerTypes {
  /** Official sticker from a Discord sticker pack */
  Standard = 1,
  /** Custom sticker uploaded to a specific guild */
  Guild = 2,
}

/**
 * Complete sticker entity with metadata, ownership, and display information.
 * Represents both standard Discord stickers and custom guild-uploaded stickers.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-object} for sticker object specification
 */
export interface StickerObject {
  /** Unique identifier for the sticker */
  readonly id: string;
  /** Pack identifier for standard stickers */
  readonly pack_id?: string;
  /** Display name of the sticker */
  readonly name: string;
  /** Descriptive text for the sticker (null for some stickers) */
  readonly description: string | null;
  /** Comma-separated autocomplete/suggestion tags (max 200 characters) */
  readonly tags: string;
  /** Category indicating if sticker is standard or guild-specific */
  readonly type: StickerTypes;
  /** File format determining rendering and animation capabilities */
  readonly format_type: StickerFormatTypes;
  /** Whether guild sticker can be used (may be false due to lost Server Boosts) */
  readonly available?: boolean;
  /** Guild that owns this sticker (for guild stickers only) */
  readonly guild_id?: string;
  /** User who uploaded this guild sticker */
  readonly user?: UserObject;
  /** Sort order within sticker pack (for standard stickers) */
  readonly sort_value?: number;
}

/**
 * Minimal sticker data required for rendering in messages and UI components.
 * Partial sticker object containing only essential display information.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-item-object} for sticker item specification
 */
export interface StickerItemObject {
  /** Unique identifier for the sticker */
  readonly id: string;
  /** Display name of the sticker */
  readonly name: string;
  /** File format for proper rendering */
  readonly format_type: StickerFormatTypes;
}

/**
 * Collection of standard stickers grouped as a purchasable pack.
 * Represents official Discord sticker packs with associated SKU and branding.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-pack-object} for sticker pack specification
 */
export interface StickerPackObject {
  /** Unique identifier for the sticker pack */
  readonly id: string;
  /** Array of all stickers included in this pack */
  readonly stickers: StickerObject[];
  /** Display name of the sticker pack */
  readonly name: string;
  /** SKU identifier for purchase and entitlement tracking */
  readonly sku_id: string;
  /** Featured sticker used as pack icon */
  readonly cover_sticker_id?: string;
  /** Descriptive text for the sticker pack */
  readonly description: string;
  /** Banner image asset for pack branding */
  readonly banner_asset_id?: string;
}

/**
 * Response structure for listing available Discord sticker packs.
 * Contains array of all purchasable standard sticker packs.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#list-sticker-packs} for list sticker packs endpoint
 */
export interface ListStickerPacksResponse {
  /** Array of all available sticker packs */
  readonly sticker_packs: StickerPackObject[];
}

/**
 * Form parameters for creating new guild stickers via multipart upload.
 * Requires sticker file and metadata with specific constraints and permissions.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#create-guild-sticker} for create sticker endpoint
 */
export interface CreateGuildStickerFormParams
  extends SetNonNullable<Pick<StickerObject, "name" | "description" | "tags">> {
  /** Sticker file (PNG, APNG, GIF, or Lottie JSON, max 512 KiB, 320x320px, 5s duration) */
  readonly file: FileInput;
}

/**
 * JSON parameters for modifying existing guild sticker properties.
 * Allows partial updates to name, description, and tags without file replacement.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#modify-guild-sticker} for modify sticker endpoint
 */
export type ModifyGuildStickerJSONParams = Partial<Omit<CreateGuildStickerFormParams, "file">>;
