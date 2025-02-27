import { z } from "zod";
import { Snowflake } from "../managers/index.js";
import { UserEntity } from "./user.entity.js";

/**
 * Represents a soundboard sound that can be played in voice channels.
 * Users can play soundboard sounds in voice channels, triggering a Voice Channel Effect Send
 * Gateway event for users connected to the voice channel.
 * @see {@link https://discord.com/developers/docs/resources/soundboard#soundboard-sound-object}
 */
export const SoundboardSoundEntity = z.object({
  /** The name of this sound (2-32 characters) */
  name: z.string().min(2).max(32),

  /** The ID of this sound */
  sound_id: Snowflake,

  /** The volume of this sound, from 0 to 1 */
  volume: z.number().min(0).max(1),

  /** The ID of this sound's custom emoji, if any */
  emoji_id: Snowflake.nullable(),

  /** The unicode character of this sound's standard emoji, if any */
  emoji_name: z.string().nullable(),

  /** The ID of the guild this sound is in, if applicable */
  guild_id: Snowflake.optional(),

  /** Whether this sound can be used, may be false due to loss of Server Boosts */
  available: z.boolean(),

  /** The user who created this sound */
  user: UserEntity.optional(),
});

export type SoundboardSoundEntity = z.infer<typeof SoundboardSoundEntity>;
