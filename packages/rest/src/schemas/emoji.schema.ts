import { type EmojiEntity, Snowflake } from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#create-guild-emoji-json-params}
 */
export const CreateGuildEmojiEntity = z
  .object({
    name: z.string(),
    image: z.string().regex(/^data:image\/(png|jpg|jpeg);base64,/),
    roles: z.array(Snowflake).optional(),
  })
  .strict();

export type CreateGuildEmojiEntity = z.infer<typeof CreateGuildEmojiEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#modify-guild-emoji-json-params}
 */
export const ModifyGuildEmojiEntity = z
  .object({
    name: z.string().optional(),
    roles: z.array(Snowflake).nullish(),
  })
  .strict();

export type ModifyGuildEmojiEntity = z.infer<typeof ModifyGuildEmojiEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#list-application-emojis}
 */
export interface ListApplicationEmojisEntity {
  items: EmojiEntity[];
}

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#create-application-emoji-json-params}
 */
export const CreateApplicationEmojiEntity = CreateGuildEmojiEntity.omit({
  roles: true,
});

export type CreateApplicationEmojiEntity = z.infer<
  typeof CreateApplicationEmojiEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#modify-application-emoji-json-params}
 */
export const ModifyApplicationEmojiEntity = ModifyGuildEmojiEntity.pick({
  name: true,
});

export type ModifyApplicationEmojiEntity = z.infer<
  typeof ModifyApplicationEmojiEntity
>;
