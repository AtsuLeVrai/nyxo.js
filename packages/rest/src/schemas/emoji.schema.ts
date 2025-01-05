import { type EmojiEntity, SnowflakeSchema } from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#create-guild-emoji-json-params}
 */
export const CreateGuildEmojiSchema = z
  .object({
    name: z.string(),
    image: z.string().regex(/^data:image\/(png|jpg|jpeg);base64,/),
    roles: z.array(SnowflakeSchema).optional(),
  })
  .strict();

export type CreateGuildEmojiEntity = z.infer<typeof CreateGuildEmojiSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#modify-guild-emoji-json-params}
 */
export const ModifyGuildEmojiSchema = z
  .object({
    name: z.string().optional(),
    roles: z.array(SnowflakeSchema).nullish(),
  })
  .strict();

export type ModifyGuildEmojiEntity = z.infer<typeof ModifyGuildEmojiSchema>;

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

export type CreateApplicationEmojiEntity = z.infer<
  typeof CreateApplicationEmojiSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#modify-application-emoji-json-params}
 */
export const ModifyApplicationEmojiSchema = ModifyGuildEmojiSchema.pick({
  name: true,
});

export type ModifyApplicationEmojiEntity = z.infer<
  typeof ModifyApplicationEmojiSchema
>;
