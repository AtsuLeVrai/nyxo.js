import type { UserEntity } from "../user/index.js";

export interface SoundboardSoundEntity {
  name: string;
  sound_id: string;
  volume: number;
  emoji_id: string | null;
  emoji_name: string | null;
  guild_id?: string;
  available: boolean;
  user?: UserEntity;
}

export interface SoundboardSoundsEntity {
  soundboard_sounds: SoundboardSoundEntity[];
  guild_id: string;
}

export interface GuildSoundboardSoundDeleteEntity {
  sound_id: string;
  guild_id: string;
}
