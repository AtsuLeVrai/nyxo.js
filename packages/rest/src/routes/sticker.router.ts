import type { Snowflake, StickerEntity, StickerPackEntity } from "@nyxojs/core";
import type { Rest } from "../core/index.js";
import type { FileInput } from "../handlers/index.js";

/**
 * Response structure for listing sticker packs.
 *
 * This interface represents the response from the API when fetching
 * available sticker packs provided by Discord.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#list-sticker-packs-response-structure}
 */
export interface StickerPacksResponse {
  /**
   * Array of sticker pack objects.
   *
   * Each sticker pack contains a collection of related stickers,
   * along with metadata like the pack name, description, and cover sticker.
   */
  sticker_packs: StickerPackEntity[];
}

/**
 * Interface for creating a new sticker in a guild.
 *
 * This interface defines the required parameters for uploading
 * a custom sticker to a Discord guild.
 *
 * @remarks
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
export interface GuildStickerCreateOptions {
  /**
   * Name of the sticker (2-30 characters).
   *
   * This name will be displayed in the sticker picker and search results.
   */
  name: string;

  /**
   * Description of the sticker (2-100 characters).
   *
   * Provides context about the sticker and when it might be used.
   */
  description: string;

  /**
   * Autocomplete/suggestion tags for the sticker (max 200 characters).
   *
   * A comma separated list of keywords that help users find the sticker
   * when searching. For example: "cat, pet, feline, cute"
   *
   * Note: The client will always use a name generated from an emoji as
   * the value of this field when creating or modifying a guild sticker.
   */
  tags: string;

  /**
   * The sticker file to upload.
   *
   * Must be a PNG, APNG, GIF, or Lottie JSON file.
   * Will be transformed into a data URI for the API request.
   */
  file: FileInput;
}

/**
 * Interface for modifying an existing sticker in a guild.
 *
 * This interface defines the parameters that can be updated
 * for an existing custom sticker in a guild.
 *
 * @remarks
 * For stickers created by the current user, requires either the `CREATE_GUILD_EXPRESSIONS`
 * or `MANAGE_GUILD_EXPRESSIONS` permission. For other stickers, requires the
 * `MANAGE_GUILD_EXPRESSIONS` permission.
 *
 * All parameters to this endpoint are optional.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#modify-guild-sticker-json-params}
 */
export interface GuildStickerUpdateOptions {
  /**
   * Name of the sticker (2-30 characters).
   *
   * Updates the sticker name shown in the sticker picker.
   */
  name?: string;

  /**
   * Description of the sticker.
   *
   * Updates the sticker description.
   * Can be null or a string between 2-100 characters.
   */
  description?: string | null;

  /**
   * Autocomplete/suggestion tags for the sticker (max 200 characters).
   *
   * Updates the search keywords for the sticker.
   */
  tags?: string;
}

/**
 * Router for Discord Sticker-related endpoints.
 *
 * This class provides methods to interact with Discord's sticker system,
 * allowing for fetching standard sticker packs and managing custom guild stickers.
 *
 * @remarks
 * Stickers are small, expressive images that can be sent in messages.
 * There are two types of stickers:
 * - Standard stickers: Official stickers provided in packs by Discord
 * - Guild stickers: Custom stickers uploaded by guild members with appropriate permissions
 *
 * Stickers can be in PNG, APNG (animated PNG), GIF, or Lottie (vector-based animation) formats.
 * Nitro subscribers can use stickers from any server they are a member of, while
 * non-Nitro users can only use stickers from the server they're currently in.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker}
 */
export class StickerRouter {
  /**
   * API route constants for sticker-related endpoints.
   */
  static readonly STICKER_ROUTES = {
    /**
     * Route for sticker packs collection.
     *
     * Used to list the official sticker packs available on Discord.
     */
    stickerPacksEndpoint: "/sticker-packs",

    /**
     * Route for a specific sticker.
     *
     * Used to get information about any sticker by its ID.
     *
     * @param stickerId - The ID of the sticker
     * @returns The formatted API route string
     */
    stickerByIdEndpoint: (stickerId: Snowflake) =>
      `/stickers/${stickerId}` as const,

    /**
     * Route for a specific sticker pack.
     *
     * Used to get detailed information about a specific sticker pack.
     *
     * @param packId - The ID of the sticker pack
     * @returns The formatted API route string
     */
    stickerPackByIdEndpoint: (packId: Snowflake) =>
      `/sticker-packs/${packId}` as const,

    /**
     * Route for guild stickers collection.
     *
     * Used to list or create stickers in a specific guild.
     *
     * @param guildId - The ID of the guild
     * @returns The formatted API route string
     */
    guildStickersEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/stickers` as const,

    /**
     * Route for a specific guild sticker.
     *
     * Used to get, modify, or delete a specific sticker in a guild.
     *
     * @param guildId - The ID of the guild
     * @param stickerId - The ID of the sticker
     * @returns The formatted API route string
     */
    guildStickerByIdEndpoint: (guildId: Snowflake, stickerId: Snowflake) =>
      `/guilds/${guildId}/stickers/${stickerId}` as const,
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new Sticker Router instance.
   *
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches a sticker by its ID.
   *
   * This method retrieves detailed information about any sticker,
   * whether it's a standard sticker or a guild sticker.
   *
   * @param stickerId - The ID of the sticker to retrieve
   * @returns A promise resolving to the sticker entity
   * @throws {Error} Will throw an error if the sticker doesn't exist
   *
   * @see {@link https://discord.com/developers/docs/resources/sticker#get-sticker}
   */
  fetchSticker(stickerId: Snowflake): Promise<StickerEntity> {
    return this.#rest.get(
      StickerRouter.STICKER_ROUTES.stickerByIdEndpoint(stickerId),
    );
  }

  /**
   * Fetches all available sticker packs.
   *
   * This method retrieves the official sticker packs provided by Discord,
   * which contain the standard stickers available to all users or Nitro subscribers.
   *
   * @returns A promise resolving to the list of sticker packs
   *
   * @see {@link https://discord.com/developers/docs/resources/sticker#list-sticker-packs}
   */
  fetchStickerPacks(): Promise<StickerPacksResponse> {
    return this.#rest.get(StickerRouter.STICKER_ROUTES.stickerPacksEndpoint);
  }

  /**
   * Fetches a specific sticker pack by its ID.
   *
   * This method retrieves detailed information about a single official
   * sticker pack, including all the stickers it contains.
   *
   * @param packId - The ID of the sticker pack to retrieve
   * @returns A promise resolving to the sticker pack entity
   * @throws {Error} Will throw an error if the pack doesn't exist
   *
   * @see {@link https://discord.com/developers/docs/resources/sticker#get-sticker-pack}
   */
  fetchStickerPack(packId: Snowflake): Promise<StickerPackEntity> {
    return this.#rest.get(
      StickerRouter.STICKER_ROUTES.stickerPackByIdEndpoint(packId),
    );
  }

  /**
   * Fetches all stickers for a specific guild.
   *
   * This method retrieves all custom stickers that have been uploaded to a guild,
   * including information about who created them.
   *
   * @param guildId - The ID of the guild to list stickers for
   * @returns A promise resolving to an array of sticker entities
   *
   * @see {@link https://discord.com/developers/docs/resources/sticker#list-guild-stickers}
   *
   * @remarks
   * Includes the `user` field if the bot has the `CREATE_GUILD_EXPRESSIONS` or
   * `MANAGE_GUILD_EXPRESSIONS` permission.
   */
  fetchGuildStickers(guildId: Snowflake): Promise<StickerEntity[]> {
    return this.#rest.get(
      StickerRouter.STICKER_ROUTES.guildStickersEndpoint(guildId),
    );
  }

  /**
   * Fetches a specific guild sticker.
   *
   * This method retrieves detailed information about a single custom sticker
   * that has been uploaded to a guild.
   *
   * @param guildId - The ID of the guild the sticker belongs to
   * @param stickerId - The ID of the sticker to retrieve
   * @returns A promise resolving to the sticker entity
   * @throws {Error} Will throw an error if the sticker doesn't exist
   *
   * @see {@link https://discord.com/developers/docs/resources/sticker#get-guild-sticker}
   *
   * @remarks
   * Includes the `user` field if the bot has the `CREATE_GUILD_EXPRESSIONS` or
   * `MANAGE_GUILD_EXPRESSIONS` permission.
   */
  fetchGuildSticker(
    guildId: Snowflake,
    stickerId: Snowflake,
  ): Promise<StickerEntity> {
    return this.#rest.get(
      StickerRouter.STICKER_ROUTES.guildStickerByIdEndpoint(guildId, stickerId),
    );
  }

  /**
   * Creates a new sticker for the guild.
   *
   * This method uploads a new custom sticker to a guild, making it available
   * for members to use in messages.
   *
   * @param guildId - The ID of the guild to create the sticker in
   * @param options - Options for creating the sticker
   * @param reason - Optional audit log reason for the creation
   * @returns A promise resolving to the created sticker entity
   * @throws {Error} Error if the options are invalid or the guild's sticker limit is reached
   *
   * @see {@link https://discord.com/developers/docs/resources/sticker#create-guild-sticker}
   *
   * @remarks
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
   */
  createGuildSticker(
    guildId: Snowflake,
    options: GuildStickerCreateOptions,
    reason?: string,
  ): Promise<StickerEntity> {
    const { file, ...rest } = options;
    return this.#rest.post(
      StickerRouter.STICKER_ROUTES.guildStickersEndpoint(guildId),
      {
        body: JSON.stringify(rest),
        files: file,
        reason,
      },
    );
  }

  /**
   * Updates an existing sticker in a guild.
   *
   * This method modifies properties of an existing custom sticker in a guild,
   * such as its name, description, or tags.
   *
   * @param guildId - The ID of the guild the sticker belongs to
   * @param stickerId - The ID of the sticker to modify
   * @param options - Options for modifying the sticker
   * @param reason - Optional audit log reason for the modification
   * @returns A promise resolving to the modified sticker entity
   * @throws {Error} Error if the options are invalid or you lack permissions
   *
   * @see {@link https://discord.com/developers/docs/resources/sticker#modify-guild-sticker}
   *
   * @remarks
   * For stickers created by the current user, requires either the `CREATE_GUILD_EXPRESSIONS` or
   * `MANAGE_GUILD_EXPRESSIONS` permission. For other stickers, requires the `MANAGE_GUILD_EXPRESSIONS` permission.
   *
   * All parameters to this endpoint are optional.
   *
   * Fires a Guild Stickers Update Gateway event.
   */
  updateGuildSticker(
    guildId: Snowflake,
    stickerId: Snowflake,
    options: GuildStickerUpdateOptions,
    reason?: string,
  ): Promise<StickerEntity> {
    return this.#rest.patch(
      StickerRouter.STICKER_ROUTES.guildStickerByIdEndpoint(guildId, stickerId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Deletes a sticker from a guild.
   *
   * This method permanently removes a custom sticker from a guild.
   *
   * @param guildId - The ID of the guild the sticker belongs to
   * @param stickerId - The ID of the sticker to delete
   * @param reason - Optional audit log reason for the deletion
   * @returns A promise that resolves when the sticker is deleted
   * @throws {Error} Will throw an error if the sticker doesn't exist or you lack permissions
   *
   * @see {@link https://discord.com/developers/docs/resources/sticker#delete-guild-sticker}
   *
   * @remarks
   * For stickers created by the current user, requires either the `CREATE_GUILD_EXPRESSIONS` or
   * `MANAGE_GUILD_EXPRESSIONS` permission. For other stickers, requires the `MANAGE_GUILD_EXPRESSIONS` permission.
   *
   * Fires a Guild Stickers Update Gateway event.
   */
  deleteGuildSticker(
    guildId: Snowflake,
    stickerId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.#rest.delete(
      StickerRouter.STICKER_ROUTES.guildStickerByIdEndpoint(guildId, stickerId),
      {
        reason,
      },
    );
  }
}
