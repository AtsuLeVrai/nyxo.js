import { Snowflake, type SoundboardSoundEntity } from "@nyxjs/core";
import { z } from "zod";
import { FileHandler, type FileInput } from "../handlers/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/soundboard#send-soundboard-sound-json-params}
 */
export const SendSoundboardSoundSchema = z.object({
  sound_id: Snowflake,
  source_guild_id: Snowflake.optional(),
});

export type SendSoundboardSoundSchema = z.input<
  typeof SendSoundboardSoundSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/soundboard#list-guild-soundboard-sounds-response-structure}
 */
export interface ListGuildSoundboardSoundsResponseEntity {
  items: SoundboardSoundEntity[];
}

/**
 * @see {@link https://discord.com/developers/docs/resources/soundboard#create-guild-soundboard-sound-json-params}
 */
export const CreateGuildSoundboardSoundSchema = z.object({
  name: z.string().min(2).max(32),
  sound: z
    .custom<FileInput>(FileHandler.isValidSingleInput)
    .transform(FileHandler.toDataUri),
  volume: z.number().min(0).max(1).nullish().default(1),
  emoji_id: Snowflake.nullish(),
  emoji_name: z.string().nullish(),
});

export type CreateGuildSoundboardSoundSchema = z.input<
  typeof CreateGuildSoundboardSoundSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/soundboard#modify-guild-soundboard-sound-json-params}
 */
export const ModifyGuildSoundboardSoundSchema = z.object({
  name: z.string().min(2).max(32).optional(),
  volume: z.number().min(0).max(1).nullish(),
  emoji_id: Snowflake.nullish(),
  emoji_name: z.string().nullish(),
});

export type ModifyGuildSoundboardSoundSchema = z.input<
  typeof ModifyGuildSoundboardSoundSchema
>;
