import type { Snowflake } from "../markdown/index.js";
import type { UserEntity } from "./user.entity.js";

/**
 * Represents the possible formats that a sticker can be in.
 * Each format determines what type of file the sticker uses.
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-format-types}
 */
export enum StickerFormatType {
  /**
   * PNG sticker format (1)
   * Static image format
   */
  Png = 1,

  /**
   * APNG sticker format (2)
   * Animated PNG format supporting animations
   */
  Apng = 2,

  /**
   * Lottie sticker format (3)
   * Vector-based animation format that enables smaller file sizes
   * Can only be uploaded to guilds with VERIFIED and/or PARTNERED features
   */
  Lottie = 3,

  /**
   * GIF sticker format (4)
   * Raster-based animation format
   */
  Gif = 4,
}

/**
 * Represents the types of stickers available in Discord.
 * Identifies whether a sticker is part of a standard pack or specific to a guild.
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-types}
 */
export enum StickerType {
  /**
   * An official sticker in a pack (1)
   * Stickers that are part of Discord's official sticker packs
   */
  Standard = 1,

  /**
   * A sticker uploaded to a guild for the guild's members (2)
   * Custom stickers that are specific to a guild and available to its members
   */
  Guild = 2,
}

/**
 * Represents a sticker that can be sent in messages.
 * Stickers are small, animated or static images that can be used in Discord messages.
 *
 * @remarks
 * - Every guild has five free sticker slots by default, with more slots unlocked by Boost levels
 * - Uploaded stickers are constrained to 5 seconds in length for animated stickers
 * - Maximum size for stickers is 320 x 320 pixels and 512 KiB
 * - Lottie stickers can only be uploaded to guilds with VERIFIED and/or PARTNERED features
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-object}
 */
export interface StickerEntity {
  /**
   * ID of the sticker.
   * Unique identifier for this sticker.
   */
  id: Snowflake;

  /**
   * For standard stickers, ID of the pack the sticker is from.
   * If this sticker is part of a sticker pack, identifies which pack it belongs to.
   */
  pack_id?: Snowflake;

  /**
   * Name of the sticker.
   * Display name shown in the Discord client, 2-30 characters.
   */
  name: string;

  /**
   * Description of the sticker.
   * Short description of what the sticker depicts, 0-100 characters.
   */
  description: string | null;

  /**
   * Autocomplete/suggestion tags for the sticker (max 200 characters).
   * Comma-separated keywords used for search and suggestions.
   */
  tags: string;

  /**
   * Previously a sticker asset hash, now an empty string.
   * Deprecated field, only included for backward compatibility.
   * @deprecated
   */
  asset?: string;

  /**
   * Type of sticker.
   * Indicates whether this is a standard sticker or a guild-specific sticker.
   */
  type: StickerType;

  /**
   * Format type of sticker.
   * The file format of the sticker (PNG, APNG, Lottie, or GIF).
   */
  format_type: StickerFormatType;

  /**
   * Whether this guild sticker can be used by nitro users in other guilds.
   * Only applicable to guild stickers.
   */
  available?: boolean;

  /**
   * ID of the guild that owns this sticker.
   * Only present for guild stickers.
   */
  guild_id?: Snowflake;

  /**
   * The user that uploaded the guild sticker.
   * Only present for guild stickers and when the current user has the MANAGE_GUILD_EXPRESSIONS permission.
   */
  user?: UserEntity;

  /**
   * The standard sticker's sort order within its pack.
   * Only applicable to standard stickers in packs.
   */
  sort_value?: number;
}

/**
 * Represents the smallest amount of data required to render a sticker.
 * This is a partial sticker object containing only essential display information.
 * Used in contexts where the full sticker data isn't needed, such as in messages.
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-item-object}
 */
export interface StickerItemEntity {
  /**
   * ID of the sticker
   * Unique identifier for the sticker
   */
  id: Snowflake;

  /**
   * Name of the sticker
   * Display name shown in the Discord client
   */
  name: string;

  /**
   * Type of sticker format
   * Determines the file type of the sticker (PNG, APNG, Lottie, or GIF)
   */
  format_type: StickerFormatType;
}

/**
 * Represents a pack of standard stickers.
 * Sticker packs are collections of official Discord stickers that may be
 * available to users based on various factors like Nitro subscription status.
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-pack-object}
 */
export interface StickerPackEntity {
  /**
   * ID of the sticker pack
   * Unique identifier for the pack
   */
  id: Snowflake;

  /**
   * The stickers in the pack
   * Array of sticker objects contained in this pack
   */
  stickers: StickerEntity[];

  /**
   * Name of the sticker pack
   * Display name shown in the Discord client
   */
  name: string;

  /**
   * ID of the pack's SKU
   * Links the sticker pack to its purchasable SKU
   */
  sku_id: Snowflake;

  /**
   * ID of a sticker in the pack which is shown as the pack's icon
   * Used as the visual representation of the pack in the Discord client
   */
  cover_sticker_id?: Snowflake;

  /**
   * Description of the sticker pack
   * Brief explanation of the sticker pack's theme or contents
   */
  description: string;

  /**
   * ID of the sticker pack's banner image
   * Used as the background when viewing the pack in the Discord client
   */
  banner_asset_id?: Snowflake;
}
