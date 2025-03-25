import type { Snowflake } from "../managers/index.js";
import type { UserEntity } from "./user.entity.js";

/**
 * Represents a soundboard sound that can be played in voice channels.
 * Users can play soundboard sounds in voice channels, triggering a Voice Channel Effect Send
 * Gateway event for users connected to the voice channel.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/Soundboard.md#soundboard-sound-object}
 */
export interface SoundboardSoundEntity {
  /**
   * The name of this sound (2-32 characters)
   * @minLength 2
   * @maxLength 32
   */
  name: string;

  /** The ID of this sound */
  sound_id: Snowflake;

  /**
   * The volume of this sound, from 0 to 1
   * @minimum 0
   * @maximum 1
   */
  volume: number;

  /** The ID of this sound's custom emoji, if any */
  emoji_id: Snowflake | null;

  /** The unicode character of this sound's standard emoji, if any */
  emoji_name: string | null;

  /** The ID of the guild this sound is in, if applicable */
  guild_id?: Snowflake;

  /** Whether this sound can be used, may be false due to loss of Server Boosts */
  available: boolean;

  /** The user who created this sound */
  user?: UserEntity;
}
