import type { Snowflake } from "../utils/index.js";
import type { UserEntity } from "./user.entity.js";

/**
 * Represents a soundboard sound that can be played in voice channels.
 * Users can play soundboard sounds in voice channels, triggering a Voice Channel Effect Send
 * Gateway event for users connected to the voice channel.
 *
 * Soundboard sounds can be either default sounds (available to all users)
 * or guild-specific sounds (available in the guild, and to Nitro subscribers in all guilds).
 *
 * @remarks
 * Soundboard sounds have a max file size of 512kb and a max duration of 5.2 seconds.
 * Playing sounds requires the `SPEAK` and `USE_SOUNDBOARD` permissions, and also the
 * `USE_EXTERNAL_SOUNDS` permission if the sound is from a different server.
 *
 * @see {@link https://discord.com/developers/docs/resources/soundboard#soundboard-sound-object}
 */
export interface SoundboardSoundEntity {
  /**
   * The name of this sound (2-32 characters)
   * This is the display name that appears in the Discord client
   */
  name: string;

  /**
   * The ID of this sound
   * Unique identifier for the soundboard sound
   * Can be used to retrieve the sound file from Discord's CDN:
   * https://cdn.discordapp.com/soundboard-sounds/{sound_id}
   */
  sound_id: Snowflake;

  /**
   * The volume of this sound, from 0 to 1
   * Controls how loud the sound plays when triggered
   * Default value is 1 (full volume)
   */
  volume: number;

  /**
   * The ID of this sound's custom emoji, if any
   * If the sound uses a custom emoji, this contains its ID
   * Will be null if the sound uses a standard emoji or no emoji
   */
  emoji_id: Snowflake | null;

  /**
   * The unicode character of this sound's standard emoji, if any
   * If the sound uses a standard unicode emoji, this contains the character
   * Will be null if the sound uses a custom emoji or no emoji
   */
  emoji_name: string | null;

  /**
   * The ID of the guild this sound is in, if applicable
   * Identifies which guild the sound belongs to for guild-specific sounds
   * Not present for default sounds available to all users
   */
  guild_id?: Snowflake;

  /**
   * Whether this sound can be used
   * May be false due to loss of Server Boosts or other permission restrictions
   * Users cannot play sounds that are unavailable
   */
  available: boolean;

  /**
   * The user who created this sound
   * Contains information about the user who uploaded the sound
   * Only included in responses if the bot has the `CREATE_GUILD_EXPRESSIONS`
   * or `MANAGE_GUILD_EXPRESSIONS` permission
   */
  user?: UserEntity;
}
