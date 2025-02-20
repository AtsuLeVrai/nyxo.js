import { z } from "zod";
import { Snowflake } from "../managers/index.js";
import { UserEntity } from "./user.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-format-types}
 */
export enum StickerFormatType {
  Png = 1,
  Apng = 2,
  Lottie = 3,
  Gif = 4,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-types}
 */
export enum StickerType {
  Standard = 1,
  Guild = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-structure}
 */
export const StickerEntity = z.object({
  id: Snowflake,
  pack_id: Snowflake.optional(),
  name: z.string(),
  description: z.string().nullable(),
  tags: z.string().max(200),
  type: z.nativeEnum(StickerType),
  format_type: z.nativeEnum(StickerFormatType),
  available: z.boolean().optional(),
  guild_id: Snowflake.optional(),
  user: z.lazy(() => UserEntity).optional(),
  sort_value: z.number().int().optional(),
});

export type StickerEntity = z.infer<typeof StickerEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-pack-object-sticker-pack-structure}
 */
export const StickerPackEntity = z.object({
  id: Snowflake,
  stickers: z.array(StickerEntity),
  name: z.string(),
  sku_id: Snowflake,
  cover_sticker_id: Snowflake.optional(),
  description: z.string(),
  banner_asset_id: Snowflake.optional(),
});

export type StickerPackEntity = z.infer<typeof StickerPackEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-item-object-sticker-item-structure}
 */
export const StickerItemEntity = z.object({
  id: Snowflake,
  name: z.string(),
  format_type: z.nativeEnum(StickerFormatType),
});

export type StickerItemEntity = z.infer<typeof StickerItemEntity>;
