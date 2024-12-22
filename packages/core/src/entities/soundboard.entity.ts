import type { Snowflake } from "../managers/index.js";
import type { UserEntity } from "./user.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/soundboard#soundboard-sound-object-soundboard-sound-structure}
 */
export interface SoundboardSoundEntity {
  name: string;
  sound_id: Snowflake;
  volume: number;
  emoji_id: Snowflake | null;
  emoji_name: string | null;
  guild_id?: Snowflake;
  available: boolean;
  user?: UserEntity;
}
