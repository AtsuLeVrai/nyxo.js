import type { Snowflake, StickerEntity, StickerPackEntity } from "@nyxjs/core";
import type { Rest } from "../core/index.js";
import type { FileInput } from "../handlers/index.js";

/**
 * Response structure for listing sticker packs.
 * Returns an array of available sticker packs.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#list-sticker-packs-response-structure}
 */
export interface ListStickerPacksResponseEntity {
  /**
   * Array of sticker pack objects
   */
  sticker_packs: StickerPackEntity[];
}

/**
 * Interface for creating a new sticker in a guild.
 *
 * Every guild has five free sticker slots by default, and each Boost level will grant access to more slots.
 * Requires the `CREATE_GUILD_EXPRESSIONS` permission.
 *
 * Constraints:
 * - Uploaded stickers are limited to 5 seconds in length for animated stickers
 * - Images must be 320 x 320 pixels
 * - Maximum file size is 512 KiB
 * - Lottie stickers can only be uploaded in guilds with the `VERIFIED` and/or the `PARTNERED` guild feature
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#create-guild-sticker-form-params}
 */
export interface CreateGuildStickerSchema {
  /**
   * Name of the sticker (2-30 characters).
   */
  name: string;

  /**
   * Description of the sticker (2-100 characters).
   */
  description: string;

  /**
   * Autocomplete/suggestion tags for the sticker (max 200 characters).
   * A comma separated list of keywords is the format used by standard stickers, but this is just a convention.
   * The client will always use a name generated from an emoji as the value of this field when creating or modifying a guild sticker.
   */
  tags: string;

  /**
   * The sticker file to upload. Must be a PNG, APNG, GIF, or Lottie JSON file.
   * Will be transformed into a data URI for the API request.
   */
  file: FileInput;
}

/**
 * Interface for modifying an existing sticker in a guild.
 *
 * For stickers created by the current user, requires either the `CREATE_GUILD_EXPRESSIONS`
 * or `MANAGE_GUILD_EXPRESSIONS` permission. For other stickers, requires the
 * `MANAGE_GUILD_EXPRESSIONS` permission.
 *
 * All parameters to this endpoint are optional.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#modify-guild-sticker-json-params}
 */
export interface ModifyGuildStickerSchema {
  /**
   * Name of the sticker (2-30 characters).
   */
  name?: string;

  /**
   * Description of the sticker.
   * Can be null or a string between 2-100 characters.
   */
  description?: string | null;

  /**
   * Autocomplete/suggestion tags for the sticker (max 200 characters).
   */
  tags?: string;
}

/**
 * Router class for handling Discord Sticker endpoints.
 *
 * Stickers are small, expressive images that can be sent in messages.
 * There are two types of stickers:
 * - Standard stickers: Official stickers provided in packs by Discord
 * - Guild stickers: Custom stickers uploaded by guild members with appropriate permissions
 *
 * Stickers can be in PNG, APNG (animated PNG), GIF, or Lottie (vector-based animation) formats.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker}
 */
export class StickerApi {
  /**
   * Collection of route patterns for sticker-related endpoints.
   */
  static readonly ROUTES = {
    /**
     * Route for sticker packs collection.
     */
    stickerPacksBase: "/sticker-packs" as const,

    /**
     * Route for a specific sticker.
     * @param stickerId - The ID of the sticker
     * @returns The endpoint path
     */
    sticker: (stickerId: Snowflake) => `/stickers/${stickerId}` as const,

    /**
     * Route for a specific sticker pack.
     * @param packId - The ID of the sticker pack
     * @returns The endpoint path
     */
    stickerPack: (packId: Snowflake) => `/sticker-packs/${packId}` as const,

    /**
     * Route for guild stickers collection.
     * @param guildId - The ID of the guild
     * @returns The endpoint path
     */
    guildStickers: (guildId: Snowflake) =>
      `/guilds/${guildId}/stickers` as const,

    /**
     * Route for a specific guild sticker.
     * @param guildId - The ID of the guild
     * @param stickerId - The ID of the sticker
     * @returns The endpoint path
     */
    guildSticker: (guildId: Snowflake, stickerId: Snowflake) =>
      `/guilds/${guildId}/stickers/${stickerId}` as const,
  } as const;

  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Gets a sticker by its ID.
   *
   * @param stickerId - The ID of the sticker to retrieve
   * @returns A promise resolving to the sticker entity
   * @see {@link https://discord.com/developers/docs/resources/sticker#get-sticker}
   */
  getSticker(stickerId: Snowflake): Promise<StickerEntity> {
    return this.#rest.get(StickerApi.ROUTES.sticker(stickerId));
  }

  /**
   * Lists all available sticker packs.
   *
   * These are the official sticker packs provided by Discord.
   *
   * @returns A promise resolving to the list of sticker packs
   * @see {@link https://discord.com/developers/docs/resources/sticker#list-sticker-packs}
   */
  listStickerPacks(): Promise<ListStickerPacksResponseEntity> {
    return this.#rest.get(StickerApi.ROUTES.stickerPacksBase);
  }

  /**
   * Gets a specific sticker pack by its ID.
   *
   * @param packId - The ID of the sticker pack to retrieve
   * @returns A promise resolving to the sticker pack entity
   * @see {@link https://discord.com/developers/docs/resources/sticker#get-sticker-pack}
   */
  getStickerPack(packId: Snowflake): Promise<StickerPackEntity> {
    return this.#rest.get(StickerApi.ROUTES.stickerPack(packId));
  }

  /**
   * Lists all stickers for a specific guild.
   *
   * Includes the `user` field if the bot has the `CREATE_GUILD_EXPRESSIONS` or
   * `MANAGE_GUILD_EXPRESSIONS` permission.
   *
   * @param guildId - The ID of the guild to list stickers for
   * @returns A promise resolving to an array of sticker entities
   * @see {@link https://discord.com/developers/docs/resources/sticker#list-guild-stickers}
   */
  listGuildStickers(guildId: Snowflake): Promise<StickerEntity[]> {
    return this.#rest.get(StickerApi.ROUTES.guildStickers(guildId));
  }

  /**
   * Gets a specific guild sticker.
   *
   * Includes the `user` field if the bot has the `CREATE_GUILD_EXPRESSIONS` or
   * `MANAGE_GUILD_EXPRESSIONS` permission.
   *
   * @param guildId - The ID of the guild the sticker belongs to
   * @param stickerId - The ID of the sticker to retrieve
   * @returns A promise resolving to the sticker entity
   * @see {@link https://discord.com/developers/docs/resources/sticker#get-guild-sticker}
   */
  getGuildSticker(
    guildId: Snowflake,
    stickerId: Snowflake,
  ): Promise<StickerEntity> {
    return this.#rest.get(StickerApi.ROUTES.guildSticker(guildId, stickerId));
  }

  /**
   * Creates a new sticker for the guild.
   *
   * Requires the `CREATE_GUILD_EXPRESSIONS` permission.
   * Every guild has five free sticker slots by default, and each Boost level will grant access to more slots.
   *
   * Constraints:
   * - Uploaded stickers are limited to 5 seconds in length for animated stickers
   * - Images must be 320 x 320 pixels
   * - Maximum file size is 512 KiB
   * - Lottie stickers can only be uploaded in guilds with the `VERIFIED` and/or the `PARTNERED` guild feature
   *
   * Fires a Guild Stickers Update Gateway event.
   *
   * @param guildId - The ID of the guild to create the sticker in
   * @param options - Options for creating the sticker
   * @param reason - Optional audit log reason for the creation
   * @returns A promise resolving to the created sticker entity
   * @throws Error if the options are invalid
   * @see {@link https://discord.com/developers/docs/resources/sticker#create-guild-sticker}
   */
  createGuildSticker(
    guildId: Snowflake,
    options: CreateGuildStickerSchema,
    reason?: string,
  ): Promise<StickerEntity> {
    const { file, ...rest } = options;
    return this.#rest.post(StickerApi.ROUTES.guildStickers(guildId), {
      body: JSON.stringify(rest),
      files: file,
      reason,
    });
  }

  /**
   * Modifies an existing sticker in a guild.
   *
   * For stickers created by the current user, requires either the `CREATE_GUILD_EXPRESSIONS` or
   * `MANAGE_GUILD_EXPRESSIONS` permission. For other stickers, requires the `MANAGE_GUILD_EXPRESSIONS` permission.
   *
   * All parameters to this endpoint are optional.
   *
   * Fires a Guild Stickers Update Gateway event.
   *
   * @param guildId - The ID of the guild the sticker belongs to
   * @param stickerId - The ID of the sticker to modify
   * @param options - Options for modifying the sticker
   * @param reason - Optional audit log reason for the modification
   * @returns A promise resolving to the modified sticker entity
   * @throws Error if the options are invalid
   * @see {@link https://discord.com/developers/docs/resources/sticker#modify-guild-sticker}
   */
  modifyGuildSticker(
    guildId: Snowflake,
    stickerId: Snowflake,
    options: ModifyGuildStickerSchema,
    reason?: string,
  ): Promise<StickerEntity> {
    return this.#rest.patch(
      StickerApi.ROUTES.guildSticker(guildId, stickerId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Deletes a sticker from a guild.
   *
   * For stickers created by the current user, requires either the `CREATE_GUILD_EXPRESSIONS` or
   * `MANAGE_GUILD_EXPRESSIONS` permission. For other stickers, requires the `MANAGE_GUILD_EXPRESSIONS` permission.
   *
   * Fires a Guild Stickers Update Gateway event.
   *
   * @param guildId - The ID of the guild the sticker belongs to
   * @param stickerId - The ID of the sticker to delete
   * @param reason - Optional audit log reason for the deletion
   * @returns A promise that resolves when the sticker is deleted
   * @see {@link https://discord.com/developers/docs/resources/sticker#delete-guild-sticker}
   */
  deleteGuildSticker(
    guildId: Snowflake,
    stickerId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.#rest.delete(
      StickerApi.ROUTES.guildSticker(guildId, stickerId),
      {
        reason,
      },
    );
  }
}
