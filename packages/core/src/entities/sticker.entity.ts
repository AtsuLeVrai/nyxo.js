import { z } from "zod";
import { SnowflakeSchema } from "../managers/index.js";
import { UserSchema } from "./user.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-format-types}
 */
export const StickerFormatType = {
  png: 1,
  apng: 2,
  lottie: 3,
  gif: 4,
} as const;

export type StickerFormatType =
  (typeof StickerFormatType)[keyof typeof StickerFormatType];

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-types}
 */
export const StickerType = {
  standard: 1,
  guild: 2,
} as const;

export type StickerType = (typeof StickerType)[keyof typeof StickerType];

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-structure}
 */
export const StickerSchema = z
  .object({
    id: SnowflakeSchema,
    pack_id: SnowflakeSchema.optional(),
    name: z.string(),
    description: z.string().nullable(),
    tags: z.array(z.string()).transform((value) => value.join(",")),
    type: z.nativeEnum(StickerType),
    format_type: z.nativeEnum(StickerFormatType),
    available: z.boolean().optional(),
    guild_id: SnowflakeSchema.optional(),
    user: UserSchema.optional(),
    sort_value: z.number().int().optional(),
  })
  .strict();

export type StickerEntity = z.infer<typeof StickerSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-pack-object-sticker-pack-structure}
 */
export const StickerPackSchema = z
  .object({
    id: SnowflakeSchema,
    stickers: z.array(StickerSchema),
    name: z.string(),
    sku_id: SnowflakeSchema,
    cover_sticker_id: SnowflakeSchema.optional(),
    description: z.string(),
    banner_asset_id: SnowflakeSchema.optional(),
  })
  .strict();

export type StickerPackEntity = z.infer<typeof StickerPackSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-item-object-sticker-item-structure}
 */
export const StickerItemSchema = z
  .object({
    id: SnowflakeSchema,
    name: z.string(),
    format_type: z.nativeEnum(StickerFormatType),
  })
  .strict();

export type StickerItemEntity = z.infer<typeof StickerItemSchema>;
