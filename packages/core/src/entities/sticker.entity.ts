import { z } from "zod";
import { Snowflake } from "../managers/index.js";
import { UserEntity } from "./user.entity.js";

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
export const StickerEntity = z.object({
  /** ID of the sticker */
  id: Snowflake,

  /** For standard stickers, ID of the pack the sticker is from */
  pack_id: Snowflake.optional(),

  /** Name of the sticker (2-30 characters) */
  name: z.string().min(2).max(30),

  /** Description of the sticker (null or 2-100 characters) */
  description: z.string().min(2).max(100).nullable(),

  /** Autocomplete/suggestion tags for the sticker (max 200 characters) */
  tags: z.string().max(200),

  /** Type of sticker */
  type: z.nativeEnum(StickerType),

  /** Type of sticker format */
  format_type: z.nativeEnum(StickerFormatType),

  /** Whether this guild sticker can be used, may be false due to loss of Server Boosts */
  available: z.boolean().optional(),

  /** ID of the guild that owns this sticker */
  guild_id: Snowflake.optional(),

  /** The user that uploaded the guild sticker */
  user: UserEntity.optional(),

  /** The standard sticker's sort order within its pack */
  sort_value: z.number().int().optional(),
});

export type StickerEntity = z.infer<typeof StickerEntity>;

/**
 * Represents a pack of standard stickers.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/Sticker.md#sticker-pack-object}
 */
export const StickerPackEntity = z.object({
  /** ID of the sticker pack */
  id: Snowflake,

  /** The stickers in the pack */
  stickers: StickerEntity.array(),

  /** Name of the sticker pack */
  name: z.string(),

  /** ID of the pack's SKU */
  sku_id: Snowflake,

  /** ID of a sticker in the pack which is shown as the pack's icon */
  cover_sticker_id: Snowflake.optional(),

  /** Description of the sticker pack */
  description: z.string(),

  /** ID of the sticker pack's banner image */
  banner_asset_id: Snowflake.optional(),
});

export type StickerPackEntity = z.infer<typeof StickerPackEntity>;

/**
 * Represents the smallest amount of data required to render a sticker.
 * This is a partial sticker object.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/Sticker.md#sticker-item-object}
 */
export const StickerItemEntity = z.object({
  /** ID of the sticker */
  id: Snowflake,

  /** Name of the sticker */
  name: z.string(),

  /** Type of sticker format */
  format_type: z.nativeEnum(StickerFormatType),
});

export type StickerItemEntity = z.infer<typeof StickerItemEntity>;
