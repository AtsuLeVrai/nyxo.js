import type { Snowflake, StickerEntity, StickerPackEntity } from "@nyxojs/core";
import type { Rest } from "../core/index.js";
import type { FileInput } from "../handlers/index.js";

/**
 * Response structure for listing sticker packs.
 * Represents available sticker packs provided by Discord.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#list-sticker-packs-response-structure}
 */
export interface StickerPacksResponse {
  /**
   * Array of sticker pack objects.
   * Each pack contains a collection of related stickers with metadata.
   */
  sticker_packs: StickerPackEntity[];
}

/**
 * Interface for creating a new sticker in a guild.
 * Defines parameters for uploading a custom sticker.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#create-guild-sticker-form-params}
 */
export interface GuildStickerCreateOptions {
  /**
   * Name of the sticker (2-30 characters).
   * Displayed in the sticker picker and search results.
   */
  name: string;

  /**
   * Description of the sticker (2-100 characters).
   * Provides context about the sticker and its usage.
   */
  description: string;

  /**
   * Autocomplete/suggestion tags for the sticker (max 200 characters).
   * Comma separated keywords that help users find the sticker.
   */
  tags: string;

  /**
   * The sticker file to upload.
   * Must be a PNG, APNG, GIF, or Lottie JSON file.
   */
  file: FileInput;
}

/**
 * Interface for modifying an existing sticker in a guild.
 * All parameters are optional for partial updates.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker#modify-guild-sticker-json-params}
 */
export interface GuildStickerUpdateOptions {
  /**
   * Name of the sticker (2-30 characters).
   * Updates the sticker name shown in the picker.
   */
  name?: string;

  /**
   * Description of the sticker.
   * Can be null or a string between 2-100 characters.
   */
  description?: string | null;

  /**
   * Autocomplete/suggestion tags for the sticker (max 200 characters).
   * Updates the search keywords for the sticker.
   */
  tags?: string;
}

/**
 * Router for Discord Sticker-related endpoints.
 * Provides methods to interact with standard sticker packs and custom guild stickers.
 *
 * @see {@link https://discord.com/developers/docs/resources/sticker}
 */
export class StickerRouter {
  /**
   * API route constants for sticker-related endpoints.
   */
  static readonly STICKER_ROUTES = {
    /** Route for sticker packs collection */
    stickerPacksEndpoint: "/sticker-packs",

    /**
     * Route for a specific sticker.
     * @param stickerId - The ID of the sticker
     */
    stickerByIdEndpoint: (stickerId: Snowflake) =>
      `/stickers/${stickerId}` as const,

    /**
     * Route for a specific sticker pack.
     * @param packId - The ID of the sticker pack
     */
    stickerPackByIdEndpoint: (packId: Snowflake) =>
      `/sticker-packs/${packId}` as const,

    /**
     * Route for guild stickers collection.
     * @param guildId - The ID of the guild
     */
    guildStickersEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/stickers` as const,

    /**
     * Route for a specific guild sticker.
     * @param guildId - The ID of the guild
     * @param stickerId - The ID of the sticker
     */
    guildStickerByIdEndpoint: (guildId: Snowflake, stickerId: Snowflake) =>
      `/guilds/${guildId}/stickers/${stickerId}` as const,
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new instance of a router.
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches a sticker by its ID.
   * Works for both standard stickers and guild stickers.
   *
   * @param stickerId - The ID of the sticker to retrieve
   * @returns A promise resolving to the sticker entity
   * @see {@link https://discord.com/developers/docs/resources/sticker#get-sticker}
   */
  fetchSticker(stickerId: Snowflake): Promise<StickerEntity> {
    return this.#rest.get(
      StickerRouter.STICKER_ROUTES.stickerByIdEndpoint(stickerId),
    );
  }

  /**
   * Fetches all available sticker packs.
   * Retrieves the official sticker packs provided by Discord.
   *
   * @returns A promise resolving to the list of sticker packs
   * @see {@link https://discord.com/developers/docs/resources/sticker#list-sticker-packs}
   */
  fetchStickerPacks(): Promise<StickerPacksResponse> {
    return this.#rest.get(StickerRouter.STICKER_ROUTES.stickerPacksEndpoint);
  }

  /**
   * Fetches a specific sticker pack by its ID.
   * Retrieves detailed information about a single official sticker pack.
   *
   * @param packId - The ID of the sticker pack to retrieve
   * @returns A promise resolving to the sticker pack entity
   * @see {@link https://discord.com/developers/docs/resources/sticker#get-sticker-pack}
   */
  fetchStickerPack(packId: Snowflake): Promise<StickerPackEntity> {
    return this.#rest.get(
      StickerRouter.STICKER_ROUTES.stickerPackByIdEndpoint(packId),
    );
  }

  /**
   * Fetches all stickers for a specific guild.
   * Retrieves all custom stickers uploaded to a guild.
   *
   * @param guildId - The ID of the guild to list stickers for
   * @returns A promise resolving to an array of sticker entities
   * @see {@link https://discord.com/developers/docs/resources/sticker#list-guild-stickers}
   */
  fetchGuildStickers(guildId: Snowflake): Promise<StickerEntity[]> {
    return this.#rest.get(
      StickerRouter.STICKER_ROUTES.guildStickersEndpoint(guildId),
    );
  }

  /**
   * Fetches a specific guild sticker.
   * Retrieves detailed information about a single custom sticker.
   *
   * @param guildId - The ID of the guild the sticker belongs to
   * @param stickerId - The ID of the sticker to retrieve
   * @returns A promise resolving to the sticker entity
   * @see {@link https://discord.com/developers/docs/resources/sticker#get-guild-sticker}
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
   * Requires the CREATE_GUILD_EXPRESSIONS permission.
   *
   * @param guildId - The ID of the guild to create the sticker in
   * @param options - Options for creating the sticker
   * @param reason - Optional audit log reason for the creation
   * @returns A promise resolving to the created sticker entity
   * @see {@link https://discord.com/developers/docs/resources/sticker#create-guild-sticker}
   */
  createGuildSticker(
    guildId: Snowflake,
    options: GuildStickerCreateOptions,
    reason?: string,
  ): Promise<StickerEntity> {
    const { file, ...rest } = options;
    return this.#rest.post(
      StickerRouter.STICKER_ROUTES.guildStickersEndpoint(guildId),
      { body: JSON.stringify(rest), files: file, reason },
    );
  }

  /**
   * Updates an existing sticker in a guild.
   * Modifies properties of an existing custom sticker.
   *
   * @param guildId - The ID of the guild the sticker belongs to
   * @param stickerId - The ID of the sticker to modify
   * @param options - Options for modifying the sticker
   * @param reason - Optional audit log reason for the modification
   * @returns A promise resolving to the modified sticker entity
   * @see {@link https://discord.com/developers/docs/resources/sticker#modify-guild-sticker}
   */
  updateGuildSticker(
    guildId: Snowflake,
    stickerId: Snowflake,
    options: GuildStickerUpdateOptions,
    reason?: string,
  ): Promise<StickerEntity> {
    return this.#rest.patch(
      StickerRouter.STICKER_ROUTES.guildStickerByIdEndpoint(guildId, stickerId),
      { body: JSON.stringify(options), reason },
    );
  }

  /**
   * Deletes a sticker from a guild.
   * Permanently removes a custom sticker.
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
      StickerRouter.STICKER_ROUTES.guildStickerByIdEndpoint(guildId, stickerId),
      { reason },
    );
  }
}
