import { BaseRouter } from "../../bases/index.js";
import type { FileInput, RouteBuilder } from "../../core/index.js";
import type { DeepNullable } from "../../utils/index.js";
import type { SoundboardSoundEntity } from "./soundboard.entity.js";

/**
 * @description JSON parameters for sending soundboard sounds to voice channels with permission validation.
 * @see {@link https://discord.com/developers/docs/resources/soundboard#send-soundboard-sound}
 */
export interface RESTSendSoundboardSoundJSONParams extends Pick<SoundboardSoundEntity, "sound_id"> {
  /**
   * @description Snowflake ID of the guild the soundboard sound is from (required for sounds from different servers).
   */
  source_guild_id?: string;
}

/**
 * @description JSON parameters for creating guild soundboard sounds with base64-encoded audio data.
 * @see {@link https://discord.com/developers/docs/resources/soundboard#create-guild-soundboard-sound}
 */
export interface RESTCreateGuildSoundboardSoundJSONParams
  extends Pick<SoundboardSoundEntity, "name">,
    Partial<DeepNullable<Pick<SoundboardSoundEntity, "volume" | "emoji_id" | "emoji_name">>> {
  /**
   * @description MP3 or Ogg sound data as base64-encoded data URI (max 512KB, max 5.2 seconds).
   */
  sound: FileInput;
}

/**
 * @description JSON parameters for modifying existing guild soundboard sounds with optional field updates.
 * @see {@link https://discord.com/developers/docs/resources/soundboard#modify-guild-soundboard-sound}
 */
export type RESTModifyGuildSoundboardSoundJSONParams = Omit<
  RESTCreateGuildSoundboardSoundJSONParams,
  "sound"
>;

/**
 * @description Discord API endpoints for soundboard operations with type-safe route building.
 * @see {@link https://discord.com/developers/docs/resources/soundboard}
 */
export const SoundboardRoutes = {
  sendSoundboardSound: (channelId: string) =>
    `/channels/${channelId}/send-soundboard-sound` as const,
  listDefaultSoundboardSounds: () => "/soundboard-default-sounds",
  listGuildSoundboardSounds: (guildId: string) => `/guilds/${guildId}/soundboard-sounds` as const,
  getGuildSoundboardSound: (guildId: string, soundId: string) =>
    `/guilds/${guildId}/soundboard-sounds/${soundId}` as const,
} as const satisfies RouteBuilder;

/**
 * @description Zero-cache Discord soundboard API client with direct REST operations and voice channel permission validation.
 * @see {@link https://discord.com/developers/docs/resources/soundboard}
 */
export class SoundboardRouter extends BaseRouter {
  /**
   * @description Sends soundboard sound to voice channel requiring user connection and permissions.
   * @see {@link https://discord.com/developers/docs/resources/soundboard#send-soundboard-sound}
   *
   * @param channelId - Snowflake ID of the voice channel to send sound to
   * @param options - Sound sending parameters including sound ID and optional source guild
   * @returns Promise resolving when sound is sent successfully
   * @throws {Error} When lacking SPEAK, USE_SOUNDBOARD, or USE_EXTERNAL_SOUNDS permissions
   * @throws {Error} When user is not connected to voice channel or has voice restrictions
   */
  sendSoundboardSound(
    channelId: string,
    options: RESTSendSoundboardSoundJSONParams,
  ): Promise<void> {
    return this.rest.post(SoundboardRoutes.sendSoundboardSound(channelId), {
      body: JSON.stringify(options),
    });
  }

  /**
   * @description Retrieves all default soundboard sounds available to all Discord users.
   * @see {@link https://discord.com/developers/docs/resources/soundboard#list-default-soundboard-sounds}
   *
   * @returns Promise resolving to array of default soundboard sound objects
   */
  listDefaultSoundboardSounds(): Promise<SoundboardSoundEntity[]> {
    return this.rest.get(SoundboardRoutes.listDefaultSoundboardSounds());
  }

  /**
   * @description Lists all custom soundboard sounds uploaded to a Discord guild.
   * @see {@link https://discord.com/developers/docs/resources/soundboard#list-guild-soundboard-sounds}
   *
   * @param guildId - Snowflake ID of the target guild
   * @returns Promise resolving to response containing array of guild soundboard sounds (includes user field with proper permissions)
   */
  listGuildSoundboardSounds(guildId: string): Promise<{
    items: SoundboardSoundEntity[];
  }> {
    return this.rest.get(SoundboardRoutes.listGuildSoundboardSounds(guildId));
  }

  /**
   * @description Retrieves specific guild soundboard sound with full metadata and user information.
   * @see {@link https://discord.com/developers/docs/resources/soundboard#get-guild-soundboard-sound}
   *
   * @param guildId - Snowflake ID of the guild containing the sound
   * @param soundId - Snowflake ID of the soundboard sound to fetch
   * @returns Promise resolving to complete guild soundboard sound object (includes user field with proper permissions)
   */
  getGuildSoundboardSound(guildId: string, soundId: string): Promise<SoundboardSoundEntity> {
    return this.rest.get(SoundboardRoutes.getGuildSoundboardSound(guildId, soundId));
  }

  /**
   * @description Creates new custom soundboard sound for Discord guild with base64-encoded audio data.
   * @see {@link https://discord.com/developers/docs/resources/soundboard#create-guild-soundboard-sound}
   *
   * @param guildId - Snowflake ID of the target guild
   * @param options - Sound creation parameters including name, base64 audio data, and optional metadata
   * @param reason - Optional audit log reason for this action
   * @returns Promise resolving to newly created soundboard sound object
   * @throws {Error} When lacking CREATE_GUILD_EXPRESSIONS permission
   * @throws {Error} When audio file exceeds 512KB or 5.2 seconds, or name exceeds 32 characters
   */
  async createGuildSoundboardSound(
    guildId: string,
    options: RESTCreateGuildSoundboardSoundJSONParams,
    reason?: string,
  ): Promise<SoundboardSoundEntity> {
    const processedOptions = await this.processFileOptions(options, ["sound"]);
    return this.rest.post(SoundboardRoutes.listGuildSoundboardSounds(guildId), {
      body: JSON.stringify(processedOptions),
      reason,
    });
  }

  /**
   * @description Modifies existing guild soundboard sound metadata with optional field updates.
   * @see {@link https://discord.com/developers/docs/resources/soundboard#modify-guild-soundboard-sound}
   *
   * @param guildId - Snowflake ID of the guild containing the sound
   * @param soundId - Snowflake ID of the soundboard sound to modify
   * @param options - Partial sound data for fields to update
   * @param reason - Optional audit log reason for this action
   * @returns Promise resolving to updated soundboard sound object
   * @throws {Error} When lacking MANAGE_GUILD_EXPRESSIONS permission (or CREATE_GUILD_EXPRESSIONS for own sounds)
   */
  modifyGuildSoundboardSound(
    guildId: string,
    soundId: string,
    options: RESTModifyGuildSoundboardSoundJSONParams,
    reason?: string,
  ): Promise<SoundboardSoundEntity> {
    return this.rest.patch(SoundboardRoutes.getGuildSoundboardSound(guildId, soundId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * @description Permanently removes custom soundboard sound from Discord guild.
   * @see {@link https://discord.com/developers/docs/resources/soundboard#delete-guild-soundboard-sound}
   *
   * @param guildId - Snowflake ID of the guild containing the sound
   * @param soundId - Snowflake ID of the soundboard sound to delete
   * @param reason - Optional audit log reason for this action
   * @returns Promise resolving when deletion is complete (204 No Content)
   * @throws {Error} When lacking MANAGE_GUILD_EXPRESSIONS permission (or CREATE_GUILD_EXPRESSIONS for own sounds)
   */
  deleteGuildSoundboardSound(guildId: string, soundId: string, reason?: string): Promise<void> {
    return this.rest.delete(SoundboardRoutes.getGuildSoundboardSound(guildId, soundId), {
      reason,
    });
  }
}
