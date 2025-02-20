import { z } from "zod";
import { Snowflake } from "../managers/index.js";
import { UserEntity } from "./user.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/soundboard#soundboard-sound-object-soundboard-sound-structure}
 */
export const SoundboardSoundEntity = z.object({
  name: z.string().min(2).max(32),
  sound_id: Snowflake,
  volume: z.number().min(0).max(1),
  emoji_id: Snowflake.nullable(),
  emoji_name: z.string().nullable(),
  guild_id: Snowflake.optional(),
  available: z.boolean(),
  user: UserEntity.optional(),
});

export type SoundboardSoundEntity = z.infer<typeof SoundboardSoundEntity>;
