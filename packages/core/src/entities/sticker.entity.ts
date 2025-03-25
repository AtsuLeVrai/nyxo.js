import type { Snowflake } from "../managers/index.js";
import type { UserEntity } from "./user.entity.js";

/**
 * Represents the possible formats that a sticker can be in.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/Sticker.md#sticker-format-types}
 */
export enum StickerFormatType {
  /** PNG sticker format */
  Png = 1,

  /** APNG sticker format (animated PNG) */
  Apng = 2,

  /** Lottie sticker format (vector-based animation) */
  Lottie = 3,

  /** GIF sticker format */
  Gif = 4,
}

/**
 * Represents the types of stickers available in Discord.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/Sticker.md#sticker-types}
 */
export enum StickerType {
  /** An official sticker in a pack */
  Standard = 1,

  /** A sticker uploaded to a guild for the guild's members */
  Guild = 2,
}

/**
 * Represents a sticker that can be sent in messages.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/Sticker.md#sticker-object}
 */
export interface StickerEntity {
  /** ID of the sticker */
  id: Snowflake;

  /** For standard stickers, ID of the pack the sticker is from */
  pack_id?: Snowflake;

  /**
   * Name of the sticker (2-30 characters)
   * @minLength 2
   * @maxLength 30
   */
  name: string;

  /**
   * Description of the sticker (null or 2-100 characters)
   * @minLength 2
   * @maxLength 100
   * @nullable
   */
  description: string | null;

  /**
   * Autocomplete/suggestion tags for the sticker (max 200 characters)
   * @maxLength 200
   */
  tags: string;

  /** Type of sticker */
  type: StickerType;

  /** Type of sticker format */
  format_type: StickerFormatType;

  /** Whether this guild sticker can be used, may be false due to loss of Server Boosts */
  available?: boolean;

  /** ID of the guild that owns this sticker */
  guild_id?: Snowflake;

  /** The user that uploaded the guild sticker */
  user?: UserEntity;

  /** The standard sticker's sort order within its pack */
  sort_value?: number;
}

/**
 * Represents a pack of standard stickers.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/Sticker.md#sticker-pack-object}
 */
export interface StickerPackEntity {
  /** ID of the sticker pack */
  id: Snowflake;

  /** The stickers in the pack */
  stickers: StickerEntity[];

  /** Name of the sticker pack */
  name: string;

  /** ID of the pack's SKU */
  sku_id: Snowflake;

  /** ID of a sticker in the pack which is shown as the pack's icon */
  cover_sticker_id?: Snowflake;

  /** Description of the sticker pack */
  description: string;

  /** ID of the sticker pack's banner image */
  banner_asset_id?: Snowflake;
}

/**
 * Represents the smallest amount of data required to render a sticker.
 * This is a partial sticker object.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/Sticker.md#sticker-item-object}
 */
export interface StickerItemEntity {
  /** ID of the sticker */
  id: Snowflake;

  /** Name of the sticker */
  name: string;

  /** Type of sticker format */
  format_type: StickerFormatType;
}
