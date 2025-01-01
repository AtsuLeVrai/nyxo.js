import {
  SnowflakeManager,
  SnowflakeSchema,
  type SoundboardSoundEntity,
} from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/resources/soundboard#send-soundboard-sound-json-params}
 */
export const SendSoundboardSoundSchema = z
  .object({
    sound_id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX),
    source_guild_id: z
      .string()
      .regex(SnowflakeManager.SNOWFLAKE_REGEX)
      .optional(),
  })
  .strict();

export type SendSoundboardSoundEntity = z.infer<
  typeof SendSoundboardSoundSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/soundboard#list-guild-soundboard-sounds-response-structure}
 */
export interface ListGuildSoundboardSoundsResponse {
  items: SoundboardSoundEntity[];
}

/**
 * @see {@link https://discord.com/developers/docs/resources/soundboard#create-guild-soundboard-sound-json-params}
 */
export const CreateGuildSoundboardSoundSchema = z
  .object({
    name: z.string().min(2).max(32),
    sound: z.string(),
    volume: z.number().min(0).max(1).default(1).nullish(),
    emoji_id: SnowflakeSchema.nullish(),
    emoji_name: z.string().nullish(),
  })
  .strict();

export type CreateGuildSoundboardSoundEntity = z.infer<
  typeof CreateGuildSoundboardSoundSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/soundboard#modify-guild-soundboard-sound-json-params}
 */
export const ModifyGuildSoundboardSoundSchema = z
  .object({
    name: z.string().min(2).max(32).optional(),
    volume: z.number().min(0).max(1).nullish(),
    emoji_id: SnowflakeSchema.nullish(),
    emoji_name: z.string().nullish(),
  })
  .strict();

export type ModifyGuildSoundboardSoundEntity = z.infer<
  typeof ModifyGuildSoundboardSoundSchema
>;
