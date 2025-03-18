import { StickerEntity, StickerPackEntity } from "@nyxjs/core";
import { z } from "zod";
import { FileHandler, type FileInput } from "../handlers/index.js";

/**
 * Response structure for listing sticker packs.
 * Returns an array of available sticker packs.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#list-sticker-packs-response-structure}
 */
export const ListStickerPacksResponseEntity = z.object({
  /**
   * Array of sticker pack objects
   */
  sticker_packs: StickerPackEntity.array(),
});

export type ListStickerPacksResponseEntity = z.infer<
  typeof ListStickerPacksResponseEntity
>;

/**
 * Schema for creating a new sticker in a guild.
 *
 * Every guild has five free sticker slots by default, and each Boost level will grant access to more slots.
 * Requires the `CREATE_GUILD_EXPRESSIONS` permission.
 *
 * Constraints:
 * - Uploaded stickers are limited to 5 seconds in length for animated stickers
 * - Images must be 320 x 320 pixels
 * - Maximum file size is 512 KiB
 * - Lottie stickers can only be uploaded in guilds with the `VERIFIED` and/or the `PARTNERED` guild feature
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#create-guild-sticker-form-params}
 */
export const CreateGuildStickerSchema = z.object({
  /**
   * Name of the sticker (2-30 characters).
   * Reuses the validation from StickerEntity.
   */
  name: StickerEntity.shape.name,

  /**
   * Description of the sticker (2-100 characters).
   * Reuses the validation from StickerEntity.
   */
  description: StickerEntity.shape.description.refine(
    (val) => val !== null && val.length >= 2 && val.length <= 100,
    { message: "Description must be between 2 and 100 characters" },
  ),

  /**
   * Autocomplete/suggestion tags for the sticker (max 200 characters).
   * A comma separated list of keywords is the format used by standard stickers, but this is just a convention.
   * The client will always use a name generated from an emoji as the value of this field when creating or modifying a guild sticker.
   * Reuses the validation from StickerEntity.
   */
  tags: StickerEntity.shape.tags,

  /**
   * The sticker file to upload. Must be a PNG, APNG, GIF, or Lottie JSON file.
   * Will be transformed into a data URI for the API request.
   */
  file: z
    .custom<FileInput>(FileHandler.isValidSingleInput)
    .transform(FileHandler.toDataUri),
});

export type CreateGuildStickerSchema = z.input<typeof CreateGuildStickerSchema>;

/**
 * Schema for modifying an existing sticker in a guild.
 *
 * For stickers created by the current user, requires either the `CREATE_GUILD_EXPRESSIONS`
 * or `MANAGE_GUILD_EXPRESSIONS` permission. For other stickers, requires the
 * `MANAGE_GUILD_EXPRESSIONS` permission.
 *
 * All parameters to this endpoint are optional.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#modify-guild-sticker-json-params}
 */
export const ModifyGuildStickerSchema = z.object({
  /**
   * Name of the sticker (2-30 characters).
   * Reuses the validation from StickerEntity.
   */
  name: StickerEntity.shape.name.optional(),

  /**
   * Description of the sticker.
   * Can be null or a string between 2-100 characters.
   * Reuses the validation from StickerEntity.
   */
  description: StickerEntity.shape.description.nullish(),

  /**
   * Autocomplete/suggestion tags for the sticker (max 200 characters).
   * Reuses the validation from StickerEntity.
   */
  tags: StickerEntity.shape.tags.optional(),
});

export type ModifyGuildStickerSchema = z.input<typeof ModifyGuildStickerSchema>;
