import type { UserEntity } from "../user/index.js";

/**
 * @description Supported file formats for Discord stickers with different use cases and limitations.
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-format-types}
 */
export enum StickerFormatType {
  Png = 1,
  Apng = 2,
  Lottie = 3,
  Gif = 4,
}

/**
 * @description Categories of Discord stickers distinguishing between official and custom stickers.
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-types}
 */
export enum StickerType {
  Standard = 1,
  Guild = 2,
}

/**
 * @description Represents a Discord sticker that can be sent in messages with metadata and usage permissions.
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-structure}
 */
export interface StickerEntity {
  /**
   * @description Unique snowflake identifier for this Discord sticker.
   */
  id: string;
  /**
   * @description Snowflake ID of the sticker pack (only for standard stickers from official packs).
   */
  pack_id?: string;
  /**
   * @description Display name of the sticker (2-30 characters for guild stickers).
   */
  name: string;
  /**
   * @description Optional description text for the sticker (max 100 characters for guild stickers).
   */
  description: string | null;
  /**
   * @description Comma-separated autocomplete tags for sticker suggestions (max 200 characters).
   */
  tags: string;
  /**
   * @description Category type indicating if this is an official or guild-specific sticker.
   */
  type: StickerType;
  /**
   * @description File format of the sticker determining rendering method and compatibility.
   */
  format_type: StickerFormatType;
  /**
   * @description Whether this guild sticker can be used (may be false due to insufficient Server Boosts).
   */
  available?: boolean;
  /**
   * @description Snowflake ID of the guild that owns this custom sticker.
   */
  guild_id?: string;
  /**
   * @description User who uploaded this guild sticker (requires CREATE_GUILD_EXPRESSIONS or MANAGE_GUILD_EXPRESSIONS permission to view).
   */
  user?: UserEntity;
  /**
   * @description Display order position within standard sticker packs.
   */
  sort_value?: number;
}

/**
 * @description Minimal sticker data required for rendering in messages without full metadata.
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-item-object-sticker-item-structure}
 */
export interface StickerItemEntity {
  /**
   * @description Unique snowflake identifier for this Discord sticker.
   */
  id: string;
  /**
   * @description Display name of the sticker.
   */
  name: string;
  /**
   * @description File format determining how this sticker should be rendered.
   */
  format_type: StickerFormatType;
}

/**
 * @description Collection of official Discord stickers available for Nitro subscribers with pack metadata.
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-pack-object-sticker-pack-structure}
 */
export interface StickerPackEntity {
  /**
   * @description Unique snowflake identifier for this sticker pack.
   */
  id: string;
  /**
   * @description Array of all stickers included in this official pack.
   */
  stickers: StickerEntity[];
  /**
   * @description Display name of the sticker pack.
   */
  name: string;
  /**
   * @description Snowflake ID of the SKU associated with this pack for purchase tracking.
   */
  sku_id: string;
  /**
   * @description Snowflake ID of a sticker from this pack used as the pack's display icon.
   */
  cover_sticker_id?: string;
  /**
   * @description Descriptive text explaining the theme or content of this sticker pack.
   */
  description: string;
  /**
   * @description Snowflake ID of the banner image asset displayed for this pack.
   */
  banner_asset_id?: string;
}
