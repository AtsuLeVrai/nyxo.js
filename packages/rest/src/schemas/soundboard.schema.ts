import { Snowflake, SoundboardSoundEntity } from "@nyxjs/core";
import { z } from "zod";
import { FileHandler, type FileInput } from "../handlers/index.js";

/**
 * Schema for sending a soundboard sound to a voice channel.
 *
 * Requires the `SPEAK` and `USE_SOUNDBOARD` permissions, and also the
 * `USE_EXTERNAL_SOUNDS` permission if the sound is from a different server.
 * Additionally, the user must be connected to the voice channel without
 * `deaf`, `self_deaf`, `mute`, or `suppress` enabled.
 *
 * @see {@link https://discord.com/developers/docs/resources/soundboard#send-soundboard-sound-json-params}
 */
export const SendSoundboardSoundSchema = z.object({
  /** The ID of the soundboard sound to play */
  sound_id: Snowflake,

  /**
   * The ID of the guild the soundboard sound is from.
   * Required to play sounds from different servers.
   */
  source_guild_id: Snowflake.optional(),
});

export type SendSoundboardSoundSchema = z.input<
  typeof SendSoundboardSoundSchema
>;

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
 * Schema for creating a new soundboard sound in a guild.
 *
 * Requires the `CREATE_GUILD_EXPRESSIONS` permission.
 * Soundboard sounds have a max file size of 512kb and a max duration of 5.2 seconds.
 *
 * @see {@link https://discord.com/developers/docs/resources/soundboard#create-guild-soundboard-sound-json-params}
 */
export const CreateGuildSoundboardSoundSchema = z.object({
  /**
   * Name of the soundboard sound (2-32 characters).
   * Reuses the validation from SoundboardSoundEntity.
   */
  name: SoundboardSoundEntity.shape.name,

  /**
   * The MP3 or OGG sound data, base64 encoded.
   * Similar to image data.
   */
  sound: z
    .custom<FileInput>(FileHandler.isValidSingleInput)
    .transform(FileHandler.toDataUri),

  /**
   * The volume of the soundboard sound, from 0 to 1.
   * Defaults to 1 if not specified.
   * Reuses the validation from SoundboardSoundEntity.
   */
  volume: SoundboardSoundEntity.shape.volume.nullish().default(1),

  /**
   * The ID of the custom emoji for the soundboard sound.
   * Reuses the validation from SoundboardSoundEntity.
   */
  emoji_id: SoundboardSoundEntity.shape.emoji_id.nullish(),

  /**
   * The unicode character of a standard emoji for the soundboard sound.
   * Reuses the validation from SoundboardSoundEntity.
   */
  emoji_name: SoundboardSoundEntity.shape.emoji_name.nullish(),
});

export type CreateGuildSoundboardSoundSchema = z.input<
  typeof CreateGuildSoundboardSoundSchema
>;

/**
 * Schema for modifying an existing soundboard sound in a guild.
 *
 * For sounds created by the current user, requires either the
 * `CREATE_GUILD_EXPRESSIONS` or `MANAGE_GUILD_EXPRESSIONS` permission.
 * For other sounds, requires the `MANAGE_GUILD_EXPRESSIONS` permission.
 *
 * All parameters to this endpoint are optional.
 *
 * @see {@link https://discord.com/developers/docs/resources/soundboard#modify-guild-soundboard-sound-json-params}
 */
export const ModifyGuildSoundboardSoundSchema = z.object({
  /**
   * Name of the soundboard sound (2-32 characters).
   * Reuses the validation from SoundboardSoundEntity.
   */
  name: SoundboardSoundEntity.shape.name.optional(),

  /**
   * The volume of the soundboard sound, from 0 to 1.
   * Reuses the validation from SoundboardSoundEntity.
   */
  volume: SoundboardSoundEntity.shape.volume.nullish(),

  /**
   * The ID of the custom emoji for the soundboard sound.
   * Reuses the validation from SoundboardSoundEntity.
   */
  emoji_id: SoundboardSoundEntity.shape.emoji_id.nullish(),

  /**
   * The unicode character of a standard emoji for the soundboard sound.
   * Reuses the validation from SoundboardSoundEntity.
   */
  emoji_name: SoundboardSoundEntity.shape.emoji_name.nullish(),
});

export type ModifyGuildSoundboardSoundSchema = z.input<
  typeof ModifyGuildSoundboardSoundSchema
>;
