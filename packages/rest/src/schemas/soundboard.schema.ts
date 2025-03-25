import type { Snowflake, SoundboardSoundEntity } from "@nyxjs/core";
import type { FileInput } from "../handlers/index.js";

/**
 * Interface for sending a soundboard sound to a voice channel.
 *
 * Requires the `SPEAK` and `USE_SOUNDBOARD` permissions, and also the
 * `USE_EXTERNAL_SOUNDS` permission if the sound is from a different server.
 * Additionally, the user must be connected to the voice channel without
 * `deaf`, `self_deaf`, `mute`, or `suppress` enabled.
 *
 * @see {@link https://discord.com/developers/docs/resources/soundboard#send-soundboard-sound-json-params}
 */
export interface SendSoundboardSoundSchema {
  /** The ID of the soundboard sound to play */
  sound_id: Snowflake;

  /**
   * The ID of the guild the soundboard sound is from.
   * Required to play sounds from different servers.
   *
   * @optional
   */
  source_guild_id?: Snowflake;
}

/**
 * Response structure for listing guild soundboard sounds.
 * Contains an array of soundboard sound objects.
 *
 * @see {@link https://discord.com/developers/docs/resources/soundboard#list-guild-soundboard-sounds-response-structure}
 */
export interface ListGuildSoundboardSoundsResponseEntity {
  /** Array of soundboard sound objects */
  items: SoundboardSoundEntity[];
}

/**
 * Interface for creating a new soundboard sound in a guild.
 *
 * Requires the `CREATE_GUILD_EXPRESSIONS` permission.
 * Soundboard sounds have a max file size of 512kb and a max duration of 5.2 seconds.
 *
 * @see {@link https://discord.com/developers/docs/resources/soundboard#create-guild-soundboard-sound-json-params}
 */
export interface CreateGuildSoundboardSoundSchema {
  /**
   * Name of the soundboard sound (2-32 characters).
   *
   * @minLength 2
   * @maxLength 32
   */
  name: string;

  /**
   * The MP3 or OGG sound data, base64 encoded.
   * Similar to image data.
   *
   * @transform Converted to data URI using FileHandler.toDataUri
   */
  sound: FileInput;

  /**
   * The volume of the soundboard sound, from 0 to 1.
   * Defaults to 1 if not specified.
   *
   * @minimum 0
   * @maximum 1
   * @default 1
   * @nullable
   * @optional
   */
  volume?: number | null;

  /**
   * The ID of the custom emoji for the soundboard sound.
   *
   * @nullable
   * @optional
   */
  emoji_id?: Snowflake | null;

  /**
   * The unicode character of a standard emoji for the soundboard sound.
   *
   * @nullable
   * @optional
   */
  emoji_name?: string | null;
}

/**
 * Interface for modifying an existing soundboard sound in a guild.
 *
 * For sounds created by the current user, requires either the
 * `CREATE_GUILD_EXPRESSIONS` or `MANAGE_GUILD_EXPRESSIONS` permission.
 * For other sounds, requires the `MANAGE_GUILD_EXPRESSIONS` permission.
 *
 * All parameters to this endpoint are optional.
 *
 * @see {@link https://discord.com/developers/docs/resources/soundboard#modify-guild-soundboard-sound-json-params}
 */
export interface ModifyGuildSoundboardSoundSchema {
  /**
   * Name of the soundboard sound (2-32 characters).
   *
   * @minLength 2
   * @maxLength 32
   * @optional
   */
  name?: string;

  /**
   * The volume of the soundboard sound, from 0 to 1.
   *
   * @minimum 0
   * @maximum 1
   * @nullable
   * @optional
   */
  volume?: number | null;

  /**
   * The ID of the custom emoji for the soundboard sound.
   *
   * @nullable
   * @optional
   */
  emoji_id?: Snowflake | null;

  /**
   * The unicode character of a standard emoji for the soundboard sound.
   *
   * @nullable
   * @optional
   */
  emoji_name?: string | null;
}
