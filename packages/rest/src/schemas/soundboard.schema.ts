import { Snowflake, type SoundboardSoundEntity } from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/resources/soundboard#send-soundboard-sound-json-params}
 */
export const SendSoundboardSoundEntity = z.object({
  sound_id: Snowflake,
  source_guild_id: Snowflake.optional(),
});

export type SendSoundboardSoundEntity = z.infer<
  typeof SendSoundboardSoundEntity
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
export const CreateGuildSoundboardSoundEntity = z.object({
  name: z.string().min(2).max(32),
  sound: z.string(),
  volume: z.number().min(0).max(1).nullish().default(1),
  emoji_id: Snowflake.nullish(),
  emoji_name: z.string().nullish(),
});

export type CreateGuildSoundboardSoundEntity = z.infer<
  typeof CreateGuildSoundboardSoundEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/soundboard#modify-guild-soundboard-sound-json-params}
 */
export const ModifyGuildSoundboardSoundEntity = z.object({
  name: z.string().min(2).max(32).optional(),
  volume: z.number().min(0).max(1).nullish(),
  emoji_id: Snowflake.nullish(),
  emoji_name: z.string().nullish(),
});

export type ModifyGuildSoundboardSoundEntity = z.infer<
  typeof ModifyGuildSoundboardSoundEntity
>;
