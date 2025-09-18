import type { FileInput } from "../core/index.js";
import type { UserObject } from "./user.js";

export interface SoundboardSoundObject {
  name: string;
  sound_id: string;
  volume: number;
  emoji_id: string | null;
  emoji_name: string | null;
  guild_id?: string;
  available: boolean;
  user?: UserObject;
}

export interface SoundboardSoundsObject {
  guild_id: string;
  soundboard_sounds: SoundboardSoundObject[];
}

export interface GuildSoundboardSoundDeleteObject {
  guild_id: string;
  sound_id: string;
}

export interface SendSoundboardSoundJSONParams {
  sound_id: string;
  source_guild_id?: string;
}

export interface CreateGuildSoundboardSoundFormParams {
  name: string;
  sound: FileInput;
  volume?: number | null;
  emoji_id?: string | null;
  emoji_name?: string | null;
}

export interface ModifyGuildSoundboardSoundJSONParams {
  name?: string;
  volume?: number | null;
  emoji_id?: string | null;
  emoji_name?: string | null;
}

/**
 * Checks if a soundboard sound is available for use
 * @param sound The soundboard sound to check
 * @returns true if the sound is available
 */
export function isSoundAvailable(sound: SoundboardSoundObject): boolean {
  return sound.available;
}

/**
 * Checks if a soundboard sound is from a specific guild
 * @param sound The soundboard sound to check
 * @param guildId The guild ID to compare
 * @returns true if the sound is from the specified guild
 */
export function isSoundFromGuild(sound: SoundboardSoundObject, guildId: string): boolean {
  return sound.guild_id === guildId;
}
