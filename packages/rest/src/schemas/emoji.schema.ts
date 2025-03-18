import { EmojiEntity } from "@nyxjs/core";
import { z } from "zod";
import { FileHandler, type FileInput } from "../handlers/index.js";

/**
 * Schema for creating a guild emoji.
 *
 * @remarks
 * Creating an emoji requires the CREATE_GUILD_EXPRESSIONS permission.
 * Emojis have a maximum file size of 256 KiB (both regular and animated).
 *
 * @see {@link https://discord.com/developers/docs/resources/emoji#create-guild-emoji-json-params}
 */
export const CreateGuildEmojiSchema = z.object({
  /** Name of the emoji (1-32 characters) */
  name: EmojiEntity.shape.name.unwrap(),

  /** The 128x128 emoji image as file data or URL, will be converted to a data URI */
  image: z
    .custom<FileInput>(FileHandler.isValidSingleInput)
    .transform(FileHandler.toDataUri),

  /** Array of role IDs allowed to use this emoji (optional) */
  roles: EmojiEntity.shape.roles.optional(),
});

export type CreateGuildEmojiSchema = z.input<typeof CreateGuildEmojiSchema>;

/**
 * Schema for modifying a guild emoji.
 *
 * @remarks
 * Modifying an emoji requires either CREATE_GUILD_EXPRESSIONS or MANAGE_GUILD_EXPRESSIONS
 * permission, depending on whether you created the emoji.
 * All parameters are optional.
 *
 * @see {@link https://discord.com/developers/docs/resources/emoji#modify-guild-emoji-json-params}
 */
export const ModifyGuildEmojiSchema = z.object({
  /** New name of the emoji */
  name: EmojiEntity.shape.name.unwrap().optional(),

  /** New array of role IDs allowed to use this emoji, or null to remove all role restrictions */
  roles: EmojiEntity.shape.roles.nullish(),
});

export type ModifyGuildEmojiSchema = z.input<typeof ModifyGuildEmojiSchema>;

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
 * Schema for creating an application emoji.
 * Derived from CreateGuildEmojiSchema but without the roles field,
 * as application emojis don't support role restrictions.
 *
 * @remarks
 * Application emojis can be used across servers without requiring the USE_EXTERNAL_EMOJIS permission.
 *
 * @see {@link https://discord.com/developers/docs/resources/emoji#create-application-emoji-json-params}
 */
export const CreateApplicationEmojiSchema = CreateGuildEmojiSchema.omit({
  roles: true,
});

export type CreateApplicationEmojiSchema = z.input<
  typeof CreateApplicationEmojiSchema
>;

/**
 * Schema for modifying an application emoji.
 * Only the name can be modified for application emojis.
 *
 * @see {@link https://discord.com/developers/docs/resources/emoji#modify-application-emoji-json-params}
 */
export const ModifyApplicationEmojiSchema = ModifyGuildEmojiSchema.pick({
  name: true,
});

export type ModifyApplicationEmojiSchema = z.input<
  typeof ModifyApplicationEmojiSchema
>;
