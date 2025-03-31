import type { Snowflake, SoundboardSoundEntity } from "@nyxjs/core";
import { BaseRouter } from "../bases/index.js";
import { FileHandler } from "../handlers/index.js";
import type {
  CreateGuildSoundboardSoundSchema,
  ListGuildSoundboardSoundsResponseEntity,
  ModifyGuildSoundboardSoundSchema,
  SendSoundboardSoundSchema,
} from "../schemas/index.js";

/**
 * Router class for handling Discord Soundboard endpoints.
 *
 * Soundboards allow users to play sound effects in voice channels. There are default sounds
 * available to all users, and custom sounds can be created for specific guilds. Nitro subscribers
 * can use guild sounds in all guilds.
 *
 * @see {@link https://discord.com/developers/docs/resources/soundboard}
 */
export class SoundboardRouter extends BaseRouter {
  /**
   * Collection of route patterns for soundboard-related endpoints.
   */
  static readonly ROUTES = {
    /**
     * Route for default soundboard sounds.
     */
    soundboardDefaultSounds: "/soundboard-default-sounds" as const,

    /**
     * Route for guild soundboard sounds collection.
     * @param guildId - The ID of the guild
     * @returns The endpoint path
     */
    guildSoundboardSounds: (guildId: Snowflake) =>
      `/guilds/${guildId}/soundboard-sounds` as const,

    /**
     * Route for a specific guild soundboard sound.
     * @param guildId - The ID of the guild
     * @param soundId - The ID of the soundboard sound
     * @returns The endpoint path
     */
    guildSoundboardSound: (guildId: Snowflake, soundId: Snowflake) =>
      `/guilds/${guildId}/soundboard-sounds/${soundId}` as const,

    /**
     * Route for sending a soundboard sound to a channel.
     * @param channelId - The ID of the voice channel
     * @returns The endpoint path
     */
    channelSendSoundboardSound: (channelId: Snowflake) =>
      `/channels/${channelId}/send-soundboard-sound` as const,
  } as const;

  /**
   * Sends a soundboard sound to a voice channel the user is connected to.
   *
   * Requires the `SPEAK` and `USE_SOUNDBOARD` permissions, and also the
   * `USE_EXTERNAL_SOUNDS` permission if the sound is from a different server.
   * Additionally, the user must be connected to the voice channel without
   * `deaf`, `self_deaf`, `mute`, or `suppress` enabled.
   *
   * Fires a Voice Channel Effect Send Gateway event.
   *
   * @param channelId - The ID of the voice channel to send the sound to
   * @param options - Options for sending the soundboard sound
   * @returns A promise that resolves when the sound is sent
   * @throws Error if the options are invalid
   * @see {@link https://discord.com/developers/docs/resources/soundboard#send-soundboard-sound}
   */
  sendSoundboardSound(
    channelId: Snowflake,
    options: SendSoundboardSoundSchema,
  ): Promise<void> {
    return this.rest.post(
      SoundboardRouter.ROUTES.channelSendSoundboardSound(channelId),
      {
        body: JSON.stringify(options),
      },
    );
  }

  /**
   * Lists all default soundboard sounds that can be used by all users.
   *
   * @returns A promise resolving to an array of soundboard sound entities
   * @see {@link https://discord.com/developers/docs/resources/soundboard#list-default-soundboard-sounds}
   */
  listDefaultSoundboardSounds(): Promise<SoundboardSoundEntity[]> {
    return this.rest.get(SoundboardRouter.ROUTES.soundboardDefaultSounds);
  }

  /**
   * Lists all soundboard sounds for a specific guild.
   *
   * Includes `user` fields if the bot has the `CREATE_GUILD_EXPRESSIONS` or
   * `MANAGE_GUILD_EXPRESSIONS` permission.
   *
   * @param guildId - The ID of the guild to list sounds for
   * @returns A promise resolving to the list guild soundboard sounds response entity
   * @see {@link https://discord.com/developers/docs/resources/soundboard#list-guild-soundboard-sounds}
   */
  listGuildSoundboardSounds(
    guildId: Snowflake,
  ): Promise<ListGuildSoundboardSoundsResponseEntity> {
    return this.rest.get(
      SoundboardRouter.ROUTES.guildSoundboardSounds(guildId),
    );
  }

  /**
   * Gets a specific soundboard sound from a guild.
   *
   * Includes the `user` field if the bot has the `CREATE_GUILD_EXPRESSIONS` or
   * `MANAGE_GUILD_EXPRESSIONS` permission.
   *
   * @param guildId - The ID of the guild the sound belongs to
   * @param soundId - The ID of the soundboard sound to retrieve
   * @returns A promise resolving to the soundboard sound entity
   * @see {@link https://discord.com/developers/docs/resources/soundboard#get-guild-soundboard-sound}
   */
  getGuildSoundboardSound(
    guildId: Snowflake,
    soundId: Snowflake,
  ): Promise<SoundboardSoundEntity> {
    return this.rest.get(
      SoundboardRouter.ROUTES.guildSoundboardSound(guildId, soundId),
    );
  }

  /**
   * Creates a new soundboard sound for a guild.
   *
   * Requires the `CREATE_GUILD_EXPRESSIONS` permission.
   * Soundboard sounds have a max file size of 512kb and a max duration of 5.2 seconds.
   *
   * Fires a Guild Soundboard Sound Create Gateway event.
   *
   * @param guildId - The ID of the guild to create the sound in
   * @param options - Options for creating the soundboard sound
   * @param reason - Optional audit log reason for the creation
   * @returns A promise resolving to the created soundboard sound entity
   * @throws Error if the options are invalid
   * @see {@link https://discord.com/developers/docs/resources/soundboard#create-guild-soundboard-sound}
   */
  async createGuildSoundboardSound(
    guildId: Snowflake,
    options: CreateGuildSoundboardSoundSchema,
    reason?: string,
  ): Promise<SoundboardSoundEntity> {
    if (options.sound) {
      options.sound = await FileHandler.toDataUri(options.sound);
    }

    return this.rest.post(
      SoundboardRouter.ROUTES.guildSoundboardSounds(guildId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Modifies an existing soundboard sound in a guild.
   *
   * For sounds created by the current user, requires either the
   * `CREATE_GUILD_EXPRESSIONS` or `MANAGE_GUILD_EXPRESSIONS` permission.
   * For other sounds, requires the `MANAGE_GUILD_EXPRESSIONS` permission.
   *
   * All parameters to this endpoint are optional.
   *
   * Fires a Guild Soundboard Sound Update Gateway event.
   *
   * @param guildId - The ID of the guild the sound belongs to
   * @param soundId - The ID of the soundboard sound to modify
   * @param options - Options for modifying the soundboard sound
   * @param reason - Optional audit log reason for the modification
   * @returns A promise resolving to the modified soundboard sound entity
   * @throws Error if the options are invalid
   * @see {@link https://discord.com/developers/docs/resources/soundboard#modify-guild-soundboard-sound}
   */
  modifyGuildSoundboardSound(
    guildId: Snowflake,
    soundId: Snowflake,
    options: ModifyGuildSoundboardSoundSchema,
    reason?: string,
  ): Promise<SoundboardSoundEntity> {
    return this.rest.patch(
      SoundboardRouter.ROUTES.guildSoundboardSound(guildId, soundId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Deletes a soundboard sound from a guild.
   *
   * For sounds created by the current user, requires either the
   * `CREATE_GUILD_EXPRESSIONS` or `MANAGE_GUILD_EXPRESSIONS` permission.
   * For other sounds, requires the `MANAGE_GUILD_EXPRESSIONS` permission.
   *
   * Fires a Guild Soundboard Sound Delete Gateway event.
   *
   * @param guildId - The ID of the guild the sound belongs to
   * @param soundId - The ID of the soundboard sound to delete
   * @param reason - Optional audit log reason for the deletion
   * @returns A promise that resolves when the sound is deleted
   * @see {@link https://discord.com/developers/docs/resources/soundboard#delete-guild-soundboard-sound}
   */
  deleteGuildSoundboardSound(
    guildId: Snowflake,
    soundId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.rest.delete(
      SoundboardRouter.ROUTES.guildSoundboardSound(guildId, soundId),
      {
        reason,
      },
    );
  }
}
