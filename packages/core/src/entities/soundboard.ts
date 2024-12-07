import type { Snowflake } from "../utils/index.js";
import type { UserEntity } from "./user.js";

/**
 * Represents a sound that can be played in a voice channel through the soundboard.
 *
 * @remarks
 * Soundboard sounds can be either default sounds (available to all users) or guild-specific
 * sounds (available in specific servers). Nitro subscribers can use guild sounds across
 * all servers. Sounds have a max file size of 512kb and a max duration of 5.2 seconds.
 *
 * @example
 * ```typescript
 * // Example of a default soundboard sound
 * const defaultSound: SoundboardSoundEntity = {
 *   name: "quack",
 *   sound_id: "1",
 *   volume: 1.0,
 *   emoji_id: null,
 *   emoji_name: "🦆",
 *   available: true
 * };
 *
 * // Example of a guild soundboard sound
 * const guildSound: SoundboardSoundEntity = {
 *   name: "Victory",
 *   sound_id: "123456789",
 *   volume: 0.8,
 *   emoji_id: "987654321",
 *   emoji_name: null,
 *   guild_id: "111222333",
 *   available: true,
 *   user: {
 *     id: "444555666",
 *     username: "SoundCreator"
 *   }
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/soundboard#soundboard-sound-object-soundboard-sound-structure}
 */
export interface SoundboardSoundEntity {
  /** The name of this sound */
  name: string;
  /** The ID of this sound */
  sound_id: Snowflake;
  /** The volume of this sound, from 0 to 1 */
  volume: number;
  /** The ID of this sound's custom emoji */
  emoji_id: Snowflake | null;
  /** The unicode character of this sound's standard emoji */
  emoji_name: string | null;
  /** The ID of the guild this sound is in (if it's a guild sound) */
  guild_id?: Snowflake;
  /** Whether this sound can be used (may be false due to loss of Server Boosts) */
  available: boolean;
  /** The user who created this sound (only present with certain permissions) */
  user?: UserEntity;
}
