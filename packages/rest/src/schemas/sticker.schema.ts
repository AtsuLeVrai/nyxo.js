import type { StickerPackEntity } from "@nyxjs/core";
import type { FileInput } from "../handlers/index.js";

/**
 * Response structure for listing sticker packs.
 * Returns an array of available sticker packs.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#list-sticker-packs-response-structure}
 */
export interface ListStickerPacksResponseEntity {
  /**
   * Array of sticker pack objects
   */
  sticker_packs: StickerPackEntity[];
}

/**
 * Interface for creating a new sticker in a guild.
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
export interface CreateGuildStickerSchema {
  /**
   * Name of the sticker (2-30 characters).
   *
   * @minLength 2
   * @maxLength 30
   */
  name: string;

  /**
   * Description of the sticker (2-100 characters).
   *
   * @minLength 2
   * @maxLength 100
   * @validate Description must be between 2 and 100 characters
   */
  description: string;

  /**
   * Autocomplete/suggestion tags for the sticker (max 200 characters).
   * A comma separated list of keywords is the format used by standard stickers, but this is just a convention.
   * The client will always use a name generated from an emoji as the value of this field when creating or modifying a guild sticker.
   *
   * @maxLength 200
   */
  tags: string;

  /**
   * The sticker file to upload. Must be a PNG, APNG, GIF, or Lottie JSON file.
   * Will be transformed into a data URI for the API request.
   *
   * @transform Converted to data URI using FileHandler.toDataUri
   */
  file: FileInput;
}

/**
 * Interface for modifying an existing sticker in a guild.
 *
 * For stickers created by the current user, requires either the `CREATE_GUILD_EXPRESSIONS`
 * or `MANAGE_GUILD_EXPRESSIONS` permission. For other stickers, requires the
 * `MANAGE_GUILD_EXPRESSIONS` permission.
 *
 * All parameters to this endpoint are optional.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#modify-guild-sticker-json-params}
 */
export interface ModifyGuildStickerSchema {
  /**
   * Name of the sticker (2-30 characters).
   *
   * @minLength 2
   * @maxLength 30
   * @optional
   */
  name?: string;

  /**
   * Description of the sticker.
   * Can be null or a string between 2-100 characters.
   *
   * @minLength 2
   * @maxLength 100
   * @nullable
   * @optional
   */
  description?: string | null;

  /**
   * Autocomplete/suggestion tags for the sticker (max 200 characters).
   *
   * @maxLength 200
   * @optional
   */
  tags?: string;
}
