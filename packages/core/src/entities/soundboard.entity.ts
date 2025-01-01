import { z } from "zod";
import { SnowflakeSchema } from "../managers/index.js";
import { UserSchema } from "./user.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/soundboard#soundboard-sound-object-soundboard-sound-structure}
 */
export const SoundboardSoundSchema = z
  .object({
    name: z.string(),
    sound_id: SnowflakeSchema,
    volume: z.number().min(0).max(1),
    emoji_id: SnowflakeSchema.nullable(),
    emoji_name: z.string().nullable(),
    guild_id: SnowflakeSchema.optional(),
    available: z.boolean(),
    user: UserSchema.optional(),
  })
  .strict();

export type SoundboardSoundEntity = z.infer<typeof SoundboardSoundSchema>;
