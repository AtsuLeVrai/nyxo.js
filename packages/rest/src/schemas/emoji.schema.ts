import { type EmojiEntity, Snowflake } from "@nyxjs/core";
import { z } from "zod";
import { FileHandler, type FileInput } from "../handlers/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#create-guild-emoji-json-params}
 */
export const CreateGuildEmojiSchema = z.object({
  name: z.string(),
  image: z
    .custom<FileInput>(FileHandler.isValidSingleInput)
    .transform(FileHandler.toDataUri),
  roles: z.array(Snowflake).optional(),
});

export type CreateGuildEmojiSchema = z.input<typeof CreateGuildEmojiSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#modify-guild-emoji-json-params}
 */
export const ModifyGuildEmojiSchema = z.object({
  name: z.string().optional(),
  roles: z.array(Snowflake).nullish(),
});

export type ModifyGuildEmojiSchema = z.input<typeof ModifyGuildEmojiSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#list-application-emojis}
 */
export interface ListApplicationEmojisEntity {
  items: EmojiEntity[];
}

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#create-application-emoji-json-params}
 */
export const CreateApplicationEmojiSchema = CreateGuildEmojiSchema.omit({
  roles: true,
});

export type CreateApplicationEmojiSchema = z.input<
  typeof CreateApplicationEmojiSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#modify-application-emoji-json-params}
 */
export const ModifyApplicationEmojiSchema = ModifyGuildEmojiSchema.pick({
  name: true,
});

export type ModifyApplicationEmojiSchema = z.input<
  typeof ModifyApplicationEmojiSchema
>;
