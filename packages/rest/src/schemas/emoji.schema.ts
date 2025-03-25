import type { EmojiEntity, Snowflake } from "@nyxjs/core";
import type { FileInput } from "../handlers/index.js";

/**
 * Interface for creating a guild emoji.
 *
 * @remarks
 * Creating an emoji requires the CREATE_GUILD_EXPRESSIONS permission.
 * Emojis have a maximum file size of 256 KiB (both regular and animated).
 *
 * @see {@link https://discord.com/developers/docs/resources/emoji#create-guild-emoji-json-params}
 */
export interface CreateGuildEmojiSchema {
  /**
   * Name of the emoji (1-32 characters)
   *
   * @minLength 1
   * @maxLength 32
   */
  name: string;

  /**
   * The 128x128 emoji image as file data or URL, will be converted to a data URI
   *
   * @transform Converted to data URI using FileHandler.toDataUri
   */
  image: FileInput;

  /**
   * Array of role IDs allowed to use this emoji (optional)
   *
   * @optional
   */
  roles?: Snowflake[];
}

/**
 * Interface for modifying a guild emoji.
 *
 * @remarks
 * Modifying an emoji requires either CREATE_GUILD_EXPRESSIONS or MANAGE_GUILD_EXPRESSIONS
 * permission, depending on whether you created the emoji.
 * All parameters are optional.
 *
 * @see {@link https://discord.com/developers/docs/resources/emoji#modify-guild-emoji-json-params}
 */
export interface ModifyGuildEmojiSchema {
  /**
   * New name of the emoji
   *
   * @optional
   * @minLength 1
   * @maxLength 32
   */
  name?: string;

  /**
   * New array of role IDs allowed to use this emoji, or null to remove all role restrictions
   *
   * @nullable
   * @optional
   */
  roles?: Snowflake[] | null;
}

/**
 * Response interface for listing application emojis.
 * Application emojis are returned in an object with an "items" array.
 *
 * @remarks
 * An application can own up to 2000 emojis that can only be used by that app.
 *
 * @see {@link https://discord.com/developers/docs/resources/emoji#list-application-emojis}
 */
export interface ListApplicationEmojisEntity {
  /** Array of emoji objects owned by the application */
  items: EmojiEntity[];
}

/**
 * Interface for creating an application emoji.
 * Based on CreateGuildEmojiSchema but without the roles field,
 * as application emojis don't support role restrictions.
 *
 * @remarks
 * Application emojis can be used across servers without requiring the USE_EXTERNAL_EMOJIS permission.
 *
 * @see {@link https://discord.com/developers/docs/resources/emoji#create-application-emoji-json-params}
 */
export type CreateApplicationEmojiSchema = Omit<
  CreateGuildEmojiSchema,
  "roles"
>;

/**
 * Interface for modifying an application emoji.
 * Only the name can be modified for application emojis.
 *
 * @see {@link https://discord.com/developers/docs/resources/emoji#modify-application-emoji-json-params}
 */
export type ModifyApplicationEmojiSchema = Pick<ModifyGuildEmojiSchema, "name">;
