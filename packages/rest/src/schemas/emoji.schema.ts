import { SnowflakeManager } from "@nyxjs/core";
import { z } from "zod";

export const CreateGuildEmojiSchema = z
  .object({
    name: z.string(),
    image: z.string().regex(/^data:image\/(png|jpg|jpeg);base64,/),
    roles: z
      .array(z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX))
      .optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#create-guild-emoji-json-params}
 */
export type CreateGuildEmojiEntity = z.infer<typeof CreateGuildEmojiSchema>;

export const ModifyGuildEmojiSchema = z
  .object({
    name: z.string().optional(),
    roles: z
      .array(z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX))
      .optional()
      .nullable(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#modify-guild-emoji-json-params}
 */
export type ModifyGuildEmojiEntity = z.infer<typeof ModifyGuildEmojiSchema>;

export const CreateApplicationEmojiSchema = CreateGuildEmojiSchema.omit({
  roles: true,
});

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#create-application-emoji-json-params}
 */
export type CreateApplicationEmojiEntity = z.infer<
  typeof CreateApplicationEmojiSchema
>;

export const ModifyApplicationEmojiSchema = ModifyGuildEmojiSchema.pick({
  name: true,
});

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#modify-application-emoji-json-params}
 */
export type ModifyApplicationEmojiEntity = z.infer<
  typeof ModifyApplicationEmojiSchema
>;
