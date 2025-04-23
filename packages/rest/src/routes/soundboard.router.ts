import type { Snowflake, SoundboardSoundEntity } from "@nyxojs/core";
import type { Rest } from "../core/index.js";
import { FileHandler, type FileInput } from "../handlers/index.js";

/**
 * Interface for sending a soundboard sound to a voice channel.
 *
 * This interface defines the required parameters for playing a sound
 * from the soundboard in a voice channel that the user is connected to.
 *
 * @remarks
 * Requires the `SPEAK` and `USE_SOUNDBOARD` permissions, and also the
 * `USE_EXTERNAL_SOUNDS` permission if the sound is from a different server.
 * Additionally, the user must be connected to the voice channel without
 * `deaf`, `self_deaf`, `mute`, or `suppress` enabled.
 *
 * @see {@link https://discord.com/developers/docs/resources/soundboard#send-soundboard-sound-json-params}
 */
export interface SoundboardSendOptions {
  /**
   * The ID of the soundboard sound to play.
   *
   * This can be an ID of a default sound or a guild-specific sound.
   */
  sound_id: Snowflake;

  /**
   * The ID of the guild the soundboard sound is from.
   *
   * Required when playing sounds from different servers than the current one.
   * Should be omitted when playing sounds from the current server or default sounds.
   */
  source_guild_id?: Snowflake;
}

/**
 * Response structure for listing guild soundboard sounds.
 *
 * Contains an array of soundboard sound objects available in a specific guild.
 *
 * @see {@link https://discord.com/developers/docs/resources/soundboard#list-guild-soundboard-sounds-response-structure}
 */
export interface GuildSoundsResponse {
  /**
   * Array of soundboard sound objects.
   *
   * Each sound object contains details such as ID, name, emoji,
   * user who added it, and sound properties.
   */
  items: SoundboardSoundEntity[];
}

/**
 * Interface for creating a new soundboard sound in a guild.
 *
 * This interface defines all the parameters needed to add a new
 * custom sound to a guild's soundboard.
 *
 * @remarks
 * Requires the `CREATE_GUILD_EXPRESSIONS` permission.
 * Soundboard sounds have a max file size of 512kb and a max duration of 5.2 seconds.
 *
 * @see {@link https://discord.com/developers/docs/resources/soundboard#create-guild-soundboard-sound-json-params}
 */
export interface GuildSoundCreateOptions {
  /**
   * Name of the soundboard sound (2-32 characters).
   *
   * This name will be displayed in the soundboard UI and is used to
   * identify the sound to users.
   */
  name: string;

  /**
   * The MP3 or OGG sound data, base64 encoded.
   *
   * Similar to image data in other endpoints.
   * Will be automatically converted to a data URI format.
   * Must meet size (512kb max) and duration (5.2 sec max) requirements.
   */
  sound: FileInput;

  /**
   * The volume of the soundboard sound, from 0 to 1.
   *
   * Controls how loud the sound plays when activated.
   * Defaults to 1 (full volume) if not specified.
   */
  volume?: number | null;

  /**
   * The ID of the custom emoji for the soundboard sound.
   *
   * Used to represent the sound visually in the soundboard UI.
   * Either emoji_id or emoji_name should be provided, not both.
   */
  emoji_id?: Snowflake | null;

  /**
   * The unicode character of a standard emoji for the soundboard sound.
   *
   * Used to represent the sound visually in the soundboard UI.
   * Either emoji_name or emoji_id should be provided, not both.
   */
  emoji_name?: string | null;
}

/**
 * Interface for modifying an existing soundboard sound in a guild.
 *
 * This interface defines the parameters that can be updated for an
 * existing soundboard sound. All parameters are optional.
 *
 * @remarks
 * For sounds created by the current user, requires either the
 * `CREATE_GUILD_EXPRESSIONS` or `MANAGE_GUILD_EXPRESSIONS` permission.
 * For other sounds, requires the `MANAGE_GUILD_EXPRESSIONS` permission.
 *
 * @see {@link https://discord.com/developers/docs/resources/soundboard#modify-guild-soundboard-sound-json-params}
 */
export interface GuildSoundUpdateOptions {
  /**
   * Name of the soundboard sound (2-32 characters).
   *
   * Updates the display name of the sound in the UI.
   */
  name?: string;

  /**
   * The volume of the soundboard sound, from 0 to 1.
   *
   * Updates the default playback volume of the sound.
   */
  volume?: number | null;

  /**
   * The ID of the custom emoji for the soundboard sound.
   *
   * Updates the custom emoji used to represent the sound.
   * Set to null to remove the current custom emoji.
   */
  emoji_id?: Snowflake | null;

  /**
   * The unicode character of a standard emoji for the soundboard sound.
   *
   * Updates the standard emoji used to represent the sound.
   * Set to null to remove the current standard emoji.
   */
  emoji_name?: string | null;
}

/**
 * Router for Discord Soundboard-related endpoints.
 *
 * This class provides methods to interact with Discord's soundboard system,
 * allowing for sound playback in voice channels and management of custom sounds.
 *
 * @remarks
 * Soundboards allow users to play sound effects in voice channels. There are default sounds
 * available to all users, and custom sounds can be created for specific guilds. Nitro subscribers
 * can use guild sounds in all guilds.
 *
 * Soundboard features include:
 * - Playing sounds in voice channels
 * - Creating custom sounds for guilds
 * - Modifying or deleting custom sounds
 * - Accessing default sounds provided by Discord
 *
 * @see {@link https://discord.com/developers/docs/resources/soundboard}
 */
export class SoundboardRouter {
  /**
   * API route constants for soundboard-related endpoints.
   */
  static readonly SOUNDBOARD_ROUTES = {
    /**
     * Route for default soundboard sounds.
     *
     * Used to list the built-in sounds provided by Discord.
     */
    defaultSoundsEndpoint: "/soundboard-default-sounds",

    /**
     * Route for guild soundboard sounds collection.
     *
     * Used to list or create custom sounds in a guild.
     *
     * @param guildId - The ID of the guild
     * @returns The formatted API route string
     */
    guildSoundsEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/soundboard-sounds` as const,

    /**
     * Route for a specific guild soundboard sound.
     *
     * Used to get, modify, or delete a specific sound.
     *
     * @param guildId - The ID of the guild
     * @param soundId - The ID of the soundboard sound
     * @returns The formatted API route string
     */
    guildSoundByIdEndpoint: (guildId: Snowflake, soundId: Snowflake) =>
      `/guilds/${guildId}/soundboard-sounds/${soundId}` as const,

    /**
     * Route for sending a soundboard sound to a channel.
     *
     * Used to play a sound in a voice channel.
     *
     * @param channelId - The ID of the voice channel
     * @returns The formatted API route string
     */
    playSoundInChannelEndpoint: (channelId: Snowflake) =>
      `/channels/${channelId}/send-soundboard-sound` as const,
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new Soundboard Router instance.
   *
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Plays a soundboard sound in a voice channel the user is connected to.
   *
   * This method triggers a sound to play in the specified voice channel,
   * where both the bot and the user must be present.
   *
   * @param channelId - The ID of the voice channel to send the sound to
   * @param options - Options for sending the soundboard sound
   * @returns A promise that resolves when the sound is sent
   * @throws {Error} Error if the sound can't be played or permissions are missing
   *
   * @see {@link https://discord.com/developers/docs/resources/soundboard#send-soundboard-sound}
   *
   * @remarks
   * Requires the `SPEAK` and `USE_SOUNDBOARD` permissions, and also the
   * `USE_EXTERNAL_SOUNDS` permission if the sound is from a different server.
   * Additionally, the user must be connected to the voice channel without
   * `deaf`, `self_deaf`, `mute`, or `suppress` enabled.
   *
   * Fires a Voice Channel Effect Send Gateway event.
   */
  sendSound(
    channelId: Snowflake,
    options: SoundboardSendOptions,
  ): Promise<void> {
    return this.#rest.post(
      SoundboardRouter.SOUNDBOARD_ROUTES.playSoundInChannelEndpoint(channelId),
      {
        body: JSON.stringify(options),
      },
    );
  }

  /**
   * Fetches all default soundboard sounds that can be used by all users.
   *
   * This method retrieves the built-in sounds provided by Discord, which are
   * available to all users regardless of server or Nitro status.
   *
   * @returns A promise resolving to an array of soundboard sound entities
   *
   * @see {@link https://discord.com/developers/docs/resources/soundboard#list-default-soundboard-sounds}
   *
   */
  fetchDefaultSounds(): Promise<SoundboardSoundEntity[]> {
    return this.#rest.get(
      SoundboardRouter.SOUNDBOARD_ROUTES.defaultSoundsEndpoint,
    );
  }

  /**
   * Fetches all soundboard sounds for a specific guild.
   *
   * This method retrieves all custom sounds that have been added to a guild's
   * soundboard, including details about who added them.
   *
   * @param guildId - The ID of the guild to list sounds for
   * @returns A promise resolving to the list guild soundboard sounds response entity
   *
   * @see {@link https://discord.com/developers/docs/resources/soundboard#list-guild-soundboard-sounds}
   *
   * @remarks
   * Includes `user` fields if the bot has the `CREATE_GUILD_EXPRESSIONS` or
   * `MANAGE_GUILD_EXPRESSIONS` permission.
   */
  fetchSounds(guildId: Snowflake): Promise<GuildSoundsResponse> {
    return this.#rest.get(
      SoundboardRouter.SOUNDBOARD_ROUTES.guildSoundsEndpoint(guildId),
    );
  }

  /**
   * Fetches a specific soundboard sound from a guild.
   *
   * This method retrieves detailed information about a single custom sound
   * that has been added to a guild's soundboard.
   *
   * @param guildId - The ID of the guild the sound belongs to
   * @param soundId - The ID of the soundboard sound to retrieve
   * @returns A promise resolving to the soundboard sound entity
   * @throws {Error} Will throw an error if the sound doesn't exist
   *
   * @see {@link https://discord.com/developers/docs/resources/soundboard#get-guild-soundboard-sound}
   *
   * @remarks
   * Includes the `user` field if the bot has the `CREATE_GUILD_EXPRESSIONS` or
   * `MANAGE_GUILD_EXPRESSIONS` permission.
   */
  fetchGuildSound(
    guildId: Snowflake,
    soundId: Snowflake,
  ): Promise<SoundboardSoundEntity> {
    return this.#rest.get(
      SoundboardRouter.SOUNDBOARD_ROUTES.guildSoundByIdEndpoint(
        guildId,
        soundId,
      ),
    );
  }

  /**
   * Creates a new soundboard sound for a guild.
   *
   * This method uploads and registers a new custom sound for a guild's
   * soundboard, which members can then use in voice channels.
   *
   * @param guildId - The ID of the guild to create the sound in
   * @param options - Options for creating the soundboard sound
   * @param reason - Optional audit log reason for the creation
   * @returns A promise resolving to the created soundboard sound entity
   * @throws {Error} Error if the sound file doesn't meet requirements or permissions are missing
   *
   * @see {@link https://discord.com/developers/docs/resources/soundboard#create-guild-soundboard-sound}
   *
   * @remarks
   * Requires the `CREATE_GUILD_EXPRESSIONS` permission.
   * Soundboard sounds have a max file size of 512kb and a max duration of 5.2 seconds.
   *
   * Fires a Guild Soundboard Sound Create Gateway event.
   */
  async createSound(
    guildId: Snowflake,
    options: GuildSoundCreateOptions,
    reason?: string,
  ): Promise<SoundboardSoundEntity> {
    if (options.sound) {
      options.sound = await FileHandler.toDataUri(options.sound);
    }

    return this.#rest.post(
      SoundboardRouter.SOUNDBOARD_ROUTES.guildSoundsEndpoint(guildId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Updates an existing soundboard sound in a guild.
   *
   * This method modifies properties of an existing custom sound in a guild's
   * soundboard, such as its name, volume, or emoji.
   *
   * @param guildId - The ID of the guild the sound belongs to
   * @param soundId - The ID of the soundboard sound to modify
   * @param options - Options for modifying the soundboard sound
   * @param reason - Optional audit log reason for the modification
   * @returns A promise resolving to the modified soundboard sound entity
   * @throws {Error} Error if the updates are invalid or permissions are missing
   *
   * @see {@link https://discord.com/developers/docs/resources/soundboard#modify-guild-soundboard-sound}
   *
   * @remarks
   * For sounds created by the current user, requires either the
   * `CREATE_GUILD_EXPRESSIONS` or `MANAGE_GUILD_EXPRESSIONS` permission.
   * For other sounds, requires the `MANAGE_GUILD_EXPRESSIONS` permission.
   *
   * Fires a Guild Soundboard Sound Update Gateway event.
   */
  updateSound(
    guildId: Snowflake,
    soundId: Snowflake,
    options: GuildSoundUpdateOptions,
    reason?: string,
  ): Promise<SoundboardSoundEntity> {
    return this.#rest.patch(
      SoundboardRouter.SOUNDBOARD_ROUTES.guildSoundByIdEndpoint(
        guildId,
        soundId,
      ),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Deletes a soundboard sound from a guild.
   *
   * This method permanently removes a custom sound from a guild's soundboard.
   *
   * @param guildId - The ID of the guild the sound belongs to
   * @param soundId - The ID of the soundboard sound to delete
   * @param reason - Optional audit log reason for the deletion
   * @returns A promise that resolves when the sound is deleted
   * @throws {Error} Will throw an error if the sound doesn't exist or permissions are missing
   *
   * @see {@link https://discord.com/developers/docs/resources/soundboard#delete-guild-soundboard-sound}
   *
   * @remarks
   * For sounds created by the current user, requires either the
   * `CREATE_GUILD_EXPRESSIONS` or `MANAGE_GUILD_EXPRESSIONS` permission.
   * For other sounds, requires the `MANAGE_GUILD_EXPRESSIONS` permission.
   *
   * Fires a Guild Soundboard Sound Delete Gateway event.
   */
  deleteSound(
    guildId: Snowflake,
    soundId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.#rest.delete(
      SoundboardRouter.SOUNDBOARD_ROUTES.guildSoundByIdEndpoint(
        guildId,
        soundId,
      ),
      {
        reason,
      },
    );
  }
}
