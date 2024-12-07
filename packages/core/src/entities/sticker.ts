import type { Integer } from "../formatting/index.js";
import type { Snowflake } from "../utils/index.js";
import type { UserEntity } from "./user.js";

/**
 * Represents the format type of a sticker.
 *
 * @remarks
 * Defines the file format that the sticker uses. Each format has different capabilities
 * and restrictions.
 *
 * @example
 * ```typescript
 * const format: StickerFormatType = StickerFormatType.Png;
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-format-types}
 */
export enum StickerFormatType {
  /** PNG format for static stickers */
  Png = 1,
  /** APNG format for animated stickers */
  Apng = 2,
  /** Lottie format for animated stickers (only available to verified/partnered guilds) */
  Lottie = 3,
  /** GIF format for animated stickers */
  Gif = 4,
}

/**
 * Represents the type of a sticker.
 *
 * @remarks
 * Determines whether the sticker is a standard sticker from a pack or a guild-specific sticker.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-types}
 */
export enum StickerType {
  /** An official sticker in a pack */
  Standard = 1,
  /** A sticker uploaded to a guild for the guild's members */
  Guild = 2,
}

/**
 * Represents a Discord sticker that can be sent in messages.
 *
 * @remarks
 * Stickers can be either standard stickers from packs or custom guild stickers.
 * Guild stickers have constraints on size and duration.
 *
 * @example
 * ```typescript
 * const sticker: StickerEntity = {
 *   id: "749054660769218631",
 *   name: "Wave",
 *   description: "Wumpus waves hello",
 *   tags: "wumpus, hello, wave",
 *   type: StickerType.Standard,
 *   format_type: StickerFormatType.Lottie,
 *   pack_id: "847199849233514549"
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-structure}
 */
export interface StickerEntity {
  /** ID of the sticker */
  id: Snowflake;
  /** For standard stickers, ID of the sticker pack */
  pack_id?: Snowflake;
  /** Name of the sticker (2-30 characters) */
  name: string;
  /** Description of the sticker (2-100 characters) */
  description: string | null;
  /** Autocomplete/suggestion tags for the sticker (max 200 characters) */
  tags: string;
  /** Type of sticker */
  type: StickerType;
  /** Format type of sticker */
  format_type: StickerFormatType;
  /** Whether this guild sticker can be used */
  available?: boolean;
  /** ID of the guild that owns this sticker */
  guild_id?: Snowflake;
  /** The user that uploaded the guild sticker */
  user?: UserEntity;
  /** The standard sticker's sort order within its pack */
  sort_value?: Integer;
}

/**
 * Represents a pack of standard stickers.
 *
 * @remarks
 * A sticker pack is a collection of standard stickers that can be used across guilds.
 *
 * @example
 * ```typescript
 * const pack: StickerPackEntity = {
 *   id: "847199849233514549",
 *   name: "Wumpus Beyond",
 *   stickers: [],
 *   sku_id: "847199849233514547",
 *   description: "Say hello to Wumpus!"
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-pack-object-sticker-pack-structure}
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
  /** ID of the sticker shown as the pack's icon */
  cover_sticker_id?: Snowflake;
  /** Description of the sticker pack */
  description: string;
  /** ID of the sticker pack's banner image */
  banner_asset_id?: Snowflake;
}

/**
 * Represents a minimal sticker object used in messages.
 *
 * @remarks
 * Contains the minimal amount of data required to render a sticker.
 * This is a partial version of the full sticker object.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-item-object-sticker-item-structure}
 */
export interface StickerItemEntity {
  /** Type of sticker format */
  format_type: StickerFormatType;
  /** ID of the sticker */
  id: Snowflake;
  /** Name of the sticker */
  name: string;
}
