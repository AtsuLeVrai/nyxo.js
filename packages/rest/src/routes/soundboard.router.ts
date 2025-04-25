import type { Snowflake, SoundboardSoundEntity } from "@nyxojs/core";
import type { Rest } from "../core/index.js";
import { FileHandler, type FileInput } from "../handlers/index.js";

/**
 * Interface for sending a soundboard sound to a voice channel.
 * Defines parameters for playing a sound in a connected voice channel.
 *
 * @see {@link https://discord.com/developers/docs/resources/soundboard#send-soundboard-sound-json-params}
 */
export interface SoundboardSendOptions {
  /**
   * The ID of the soundboard sound to play.
   * Can be a default sound or a guild-specific sound.
   */
  sound_id: Snowflake;

  /**
   * The ID of the guild the soundboard sound is from.
   * Required for sounds from different servers than the current one.
   */
  source_guild_id?: Snowflake;
}

/**
 * Response structure for listing guild soundboard sounds.
 * Contains available sounds in a specific guild.
 *
 * @see {@link https://discord.com/developers/docs/resources/soundboard#list-guild-soundboard-sounds-response-structure}
 */
export interface GuildSoundsResponse {
  /**
   * Array of soundboard sound objects.
   * Each sound contains ID, name, emoji, and other details.
   */
  items: SoundboardSoundEntity[];
}

/**
 * Interface for creating a new soundboard sound in a guild.
 * Defines parameters for adding a custom sound to a guild's soundboard.
 *
 * @see {@link https://discord.com/developers/docs/resources/soundboard#create-guild-soundboard-sound-json-params}
 */
export interface GuildSoundCreateOptions {
  /**
   * Name of the soundboard sound (2-32 characters).
   * Displayed in the soundboard UI.
   */
  name: string;

  /**
   * The MP3 or OGG sound data, base64 encoded.
   * Maximum 512kb size and 5.2 seconds duration.
   */
  sound: FileInput;

  /**
   * The volume of the soundboard sound, from 0 to 1.
   * Controls playback volume, defaults to 1.
   */
  volume?: number | null;

  /**
   * The ID of the custom emoji for the soundboard sound.
   * Either emoji_id or emoji_name should be provided, not both.
   */
  emoji_id?: Snowflake | null;

  /**
   * The unicode character of a standard emoji for the soundboard sound.
   * Either emoji_name or emoji_id should be provided, not both.
   */
  emoji_name?: string | null;
}

/**
 * Interface for modifying an existing soundboard sound in a guild.
 * All parameters are optional for partial updates.
 *
 * @see {@link https://discord.com/developers/docs/resources/soundboard#modify-guild-soundboard-sound-json-params}
 */
export interface GuildSoundUpdateOptions {
  /**
   * Name of the soundboard sound (2-32 characters).
   * Updates the display name in the UI.
   */
  name?: string;

  /**
   * The volume of the soundboard sound, from 0 to 1.
   * Updates the default playback volume.
   */
  volume?: number | null;

  /**
   * The ID of the custom emoji for the soundboard sound.
   * Set to null to remove the current custom emoji.
   */
  emoji_id?: Snowflake | null;

  /**
   * The unicode character of a standard emoji for the soundboard sound.
   * Set to null to remove the current standard emoji.
   */
  emoji_name?: string | null;
}

/**
 * Router for Discord Soundboard-related endpoints.
 * Provides methods to play sounds and manage custom soundboard sounds.
 *
 * @see {@link https://discord.com/developers/docs/resources/soundboard}
 */
export class SoundboardRouter {
  /**
   * API route constants for soundboard-related endpoints.
   */
  static readonly SOUNDBOARD_ROUTES = {
    /** Route for default soundboard sounds */
    defaultSoundsEndpoint: "/soundboard-default-sounds",

    /**
     * Route for guild soundboard sounds collection.
     * @param guildId - The ID of the guild
     */
    guildSoundsEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/soundboard-sounds` as const,

    /**
     * Route for a specific guild soundboard sound.
     * @param guildId - The ID of the guild
     * @param soundId - The ID of the soundboard sound
     */
    guildSoundByIdEndpoint: (guildId: Snowflake, soundId: Snowflake) =>
      `/guilds/${guildId}/soundboard-sounds/${soundId}` as const,

    /**
     * Route for sending a soundboard sound to a channel.
     * @param channelId - The ID of the voice channel
     */
    playSoundInChannelEndpoint: (channelId: Snowflake) =>
      `/channels/${channelId}/send-soundboard-sound` as const,
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new Soundboard Router instance.
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Plays a soundboard sound in a voice channel the user is connected to.
   * Requires SPEAK and USE_SOUNDBOARD permissions.
   *
   * @param channelId - The ID of the voice channel to send the sound to
   * @param options - Options for sending the soundboard sound
   * @returns A promise that resolves when the sound is sent
   * @see {@link https://discord.com/developers/docs/resources/soundboard#send-soundboard-sound}
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
   * Retrieves built-in sounds provided by Discord.
   *
   * @returns A promise resolving to an array of soundboard sound entities
   * @see {@link https://discord.com/developers/docs/resources/soundboard#list-default-soundboard-sounds}
   */
  fetchDefaultSounds(): Promise<SoundboardSoundEntity[]> {
    return this.#rest.get(
      SoundboardRouter.SOUNDBOARD_ROUTES.defaultSoundsEndpoint,
    );
  }

  /**
   * Fetches all soundboard sounds for a specific guild.
   * Retrieves custom sounds added to the guild's soundboard.
   *
   * @param guildId - The ID of the guild to list sounds for
   * @returns A promise resolving to the list guild soundboard sounds response entity
   * @see {@link https://discord.com/developers/docs/resources/soundboard#list-guild-soundboard-sounds}
   */
  fetchSounds(guildId: Snowflake): Promise<GuildSoundsResponse> {
    return this.#rest.get(
      SoundboardRouter.SOUNDBOARD_ROUTES.guildSoundsEndpoint(guildId),
    );
  }

  /**
   * Fetches a specific soundboard sound from a guild.
   * Retrieves detailed information about a single custom sound.
   *
   * @param guildId - The ID of the guild the sound belongs to
   * @param soundId - The ID of the soundboard sound to retrieve
   * @returns A promise resolving to the soundboard sound entity
   * @see {@link https://discord.com/developers/docs/resources/soundboard#get-guild-soundboard-sound}
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
   * Requires the CREATE_GUILD_EXPRESSIONS permission.
   *
   * @param guildId - The ID of the guild to create the sound in
   * @param options - Options for creating the soundboard sound
   * @param reason - Optional audit log reason for the creation
   * @returns A promise resolving to the created soundboard sound entity
   * @see {@link https://discord.com/developers/docs/resources/soundboard#create-guild-soundboard-sound}
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
   * Modifies properties of a custom sound in the soundboard.
   *
   * @param guildId - The ID of the guild the sound belongs to
   * @param soundId - The ID of the soundboard sound to modify
   * @param options - Options for modifying the soundboard sound
   * @param reason - Optional audit log reason for the modification
   * @returns A promise resolving to the modified soundboard sound entity
   * @see {@link https://discord.com/developers/docs/resources/soundboard#modify-guild-soundboard-sound}
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
   * Permanently removes a custom sound from the soundboard.
   *
   * @param guildId - The ID of the guild the sound belongs to
   * @param soundId - The ID of the soundboard sound to delete
   * @param reason - Optional audit log reason for the deletion
   * @returns A promise that resolves when the sound is deleted
   * @see {@link https://discord.com/developers/docs/resources/soundboard#delete-guild-soundboard-sound}
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
