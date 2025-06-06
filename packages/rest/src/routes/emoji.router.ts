import type { EmojiEntity, Snowflake } from "@nyxojs/core";
import type { Rest } from "../core/index.js";
import type { FileInput } from "../handlers/index.js";

/**
 * Interface for creating a guild emoji.
 * Defines the required parameters for adding a new custom emoji to a Discord guild.
 *
 * @see {@link https://discord.com/developers/docs/resources/emoji#create-guild-emoji-json-params}
 */
export interface GuildEmojiCreateOptions {
  /**
   * Name of the emoji (1-32 characters).
   * Used when referencing the emoji with `:name:` syntax.
   */
  name: string;

  /**
   * The 128x128 emoji image as file data or URL.
   * Supports PNG, JPEG, GIF (for animated emojis), and WebP formats.
   */
  image: FileInput;

  /**
   * Array of role IDs allowed to use this emoji.
   * When omitted, all members can use the emoji.
   */
  roles?: Snowflake[];
}

/**
 * Interface for modifying a guild emoji.
 * Defines the properties that can be updated for an existing emoji.
 *
 * @see {@link https://discord.com/developers/docs/resources/emoji#modify-guild-emoji-json-params}
 */
export interface GuildEmojiUpdateOptions {
  /**
   * New name of the emoji (1-32 characters).
   * Must contain only alphanumeric characters and underscores.
   */
  name?: string;

  /**
   * New array of role IDs allowed to use this emoji.
   * Set to an empty array to allow all members to use the emoji.
   */
  roles?: Snowflake[] | null;
}

/**
 * Response interface for listing application emojis.
 * Application emojis are returned with a different structure than guild emojis.
 *
 * @see {@link https://discord.com/developers/docs/resources/emoji#list-application-emojis}
 */
export interface ApplicationEmojisResponse {
  /**
   * Array of emoji objects owned by the application.
   * Each emoji has properties like id, name, and animated.
   */
  items: EmojiEntity[];
}

/**
 * Interface for creating an application emoji.
 * Based on GuildEmojiCreateOptions but without the roles field.
 *
 * @see {@link https://discord.com/developers/docs/resources/emoji#create-application-emoji-json-params}
 */
export type ApplicationEmojiCreateOptions = Omit<
  GuildEmojiCreateOptions,
  "roles"
>;

/**
 * Interface for modifying an application emoji.
 * Only the name can be modified for application emojis.
 *
 * @see {@link https://discord.com/developers/docs/resources/emoji#modify-application-emoji-json-params}
 */
export type ApplicationEmojiUpdateOptions = Pick<
  GuildEmojiUpdateOptions,
  "name"
>;

/**
 * Router for Discord Emoji-related API endpoints.
 * Provides methods to interact with both guild emojis and application-owned emojis.
 *
 * @see {@link https://discord.com/developers/docs/resources/emoji}
 */
export class EmojiRouter {
  /**
   * API route constants for emoji-related endpoints.
   */
  static readonly EMOJI_ROUTES = {
    /**
     * Endpoint for managing all emojis in a guild.
     * @param guildId - ID of the guild
     */
    guildEmojisEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/emojis` as const,

    /**
     * Endpoint for managing a specific emoji in a guild.
     * @param guildId - ID of the guild
     * @param emojiId - ID of the emoji
     */
    guildEmojiByIdEndpoint: (guildId: Snowflake, emojiId: Snowflake) =>
      `/guilds/${guildId}/emojis/${emojiId}` as const,

    /**
     * Endpoint for managing all emojis owned by an application.
     * @param applicationId - ID of the application
     */
    applicationEmojisEndpoint: (applicationId: Snowflake) =>
      `/applications/${applicationId}/emojis` as const,

    /**
     * Endpoint for managing a specific emoji owned by an application.
     * @param applicationId - ID of the application
     * @param emojiId - ID of the emoji
     */
    applicationEmojiByIdEndpoint: (
      applicationId: Snowflake,
      emojiId: Snowflake,
    ) => `/applications/${applicationId}/emojis/${emojiId}` as const,
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
   * Fetches all emojis in a guild.
   * Retrieves all custom emojis available in the specified guild.
   *
   * @param guildId - ID of the guild
   * @returns A promise that resolves to an array of emoji objects
   * @see {@link https://discord.com/developers/docs/resources/emoji#list-guild-emojis}
   */
  fetchGuildEmojis(guildId: Snowflake): Promise<EmojiEntity[]> {
    return this.#rest.get(
      EmojiRouter.EMOJI_ROUTES.guildEmojisEndpoint(guildId),
    );
  }

  /**
   * Fetches a specific emoji from a guild.
   * Retrieves detailed information about a single custom emoji.
   *
   * @param guildId - ID of the guild
   * @param emojiId - ID of the emoji
   * @returns A promise that resolves to the emoji object
   * @see {@link https://discord.com/developers/docs/resources/emoji#get-guild-emoji}
   */
  fetchGuildEmoji(
    guildId: Snowflake,
    emojiId: Snowflake,
  ): Promise<EmojiEntity> {
    return this.#rest.get(
      EmojiRouter.EMOJI_ROUTES.guildEmojiByIdEndpoint(guildId, emojiId),
    );
  }

  /**
   * Creates a new emoji in a guild.
   * Uploads and registers a new custom emoji in the specified guild.
   *
   * @param guildId - ID of the guild
   * @param options - Configuration for the new emoji
   * @param reason - Optional audit log reason
   * @returns A promise that resolves to the created emoji
   * @see {@link https://discord.com/developers/docs/resources/emoji#create-guild-emoji}
   */
  async createGuildEmoji(
    guildId: Snowflake,
    options: GuildEmojiCreateOptions,
    reason?: string,
  ): Promise<EmojiEntity> {
    const processedOptions = { ...options };

    if (processedOptions.image) {
      processedOptions.image = await this.#rest.file.toDataUri(
        processedOptions.image,
      );
    }

    return this.#rest.post(
      EmojiRouter.EMOJI_ROUTES.guildEmojisEndpoint(guildId),
      { body: JSON.stringify(processedOptions), reason },
    );
  }

  /**
   * Updates an existing guild emoji.
   * Allows changing the name or role restrictions of an existing custom emoji.
   *
   * @param guildId - ID of the guild
   * @param emojiId - ID of the emoji to modify
   * @param options - New properties for the emoji
   * @param reason - Optional audit log reason
   * @returns A promise that resolves to the updated emoji
   * @see {@link https://discord.com/developers/docs/resources/emoji#modify-guild-emoji}
   */
  updateGuildEmoji(
    guildId: Snowflake,
    emojiId: Snowflake,
    options: GuildEmojiUpdateOptions,
    reason?: string,
  ): Promise<EmojiEntity> {
    return this.#rest.patch(
      EmojiRouter.EMOJI_ROUTES.guildEmojiByIdEndpoint(guildId, emojiId),
      { body: JSON.stringify(options), reason },
    );
  }

  /**
   * Deletes a guild emoji.
   * Permanently removes a custom emoji from the specified guild.
   *
   * @param guildId - ID of the guild
   * @param emojiId - ID of the emoji to delete
   * @param reason - Optional audit log reason
   * @returns A promise that resolves to void on success
   * @see {@link https://discord.com/developers/docs/resources/emoji#delete-guild-emoji}
   */
  deleteGuildEmoji(
    guildId: Snowflake,
    emojiId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.#rest.delete(
      EmojiRouter.EMOJI_ROUTES.guildEmojiByIdEndpoint(guildId, emojiId),
      { reason },
    );
  }

  /**
   * Fetches all emojis owned by an application.
   * Retrieves all custom emojis that are owned by the application.
   *
   * @param applicationId - ID of the application
   * @returns A promise that resolves to an ApplicationEmojisResponse
   * @see {@link https://discord.com/developers/docs/resources/emoji#list-application-emojis}
   */
  fetchApplicationEmojis(
    applicationId: Snowflake,
  ): Promise<ApplicationEmojisResponse> {
    return this.#rest.get(
      EmojiRouter.EMOJI_ROUTES.applicationEmojisEndpoint(applicationId),
    );
  }

  /**
   * Fetches a specific emoji owned by an application.
   * Retrieves detailed information about a single custom emoji owned by the application.
   *
   * @param applicationId - ID of the application
   * @param emojiId - ID of the emoji
   * @returns A promise that resolves to the emoji object
   * @see {@link https://discord.com/developers/docs/resources/emoji#get-application-emoji}
   */
  fetchApplicationEmoji(
    applicationId: Snowflake,
    emojiId: Snowflake,
  ): Promise<EmojiEntity> {
    return this.#rest.get(
      EmojiRouter.EMOJI_ROUTES.applicationEmojiByIdEndpoint(
        applicationId,
        emojiId,
      ),
    );
  }

  /**
   * Creates a new emoji for an application.
   * Uploads and registers a new custom emoji owned by the application.
   *
   * @param applicationId - ID of the application
   * @param options - Configuration for the new emoji
   * @param reason - Optional reason
   * @returns A promise that resolves to the created emoji
   * @see {@link https://discord.com/developers/docs/resources/emoji#create-application-emoji}
   */
  async createApplicationEmoji(
    applicationId: Snowflake,
    options: ApplicationEmojiCreateOptions,
    reason?: string,
  ): Promise<EmojiEntity> {
    const processedOptions = { ...options };

    if (processedOptions.image) {
      processedOptions.image = await this.#rest.file.toDataUri(
        processedOptions.image,
      );
    }

    return this.#rest.post(
      EmojiRouter.EMOJI_ROUTES.applicationEmojisEndpoint(applicationId),
      { body: JSON.stringify(processedOptions), reason },
    );
  }

  /**
   * Updates an existing application emoji.
   * Allows changing the name of an existing custom emoji owned by the application.
   *
   * @param applicationId - ID of the application
   * @param emojiId - ID of the emoji to modify
   * @param options - New properties for the emoji (only name can be modified)
   * @param reason - Optional reason
   * @returns A promise that resolves to the updated emoji
   * @see {@link https://discord.com/developers/docs/resources/emoji#modify-application-emoji}
   */
  updateApplicationEmoji(
    applicationId: Snowflake,
    emojiId: Snowflake,
    options: ApplicationEmojiUpdateOptions,
    reason?: string,
  ): Promise<EmojiEntity> {
    return this.#rest.patch(
      EmojiRouter.EMOJI_ROUTES.applicationEmojiByIdEndpoint(
        applicationId,
        emojiId,
      ),
      { body: JSON.stringify(options), reason },
    );
  }

  /**
   * Deletes an application emoji.
   * Permanently removes a custom emoji owned by the application.
   *
   * @param applicationId - ID of the application
   * @param emojiId - ID of the emoji to delete
   * @param reason - Optional reason
   * @returns A promise that resolves to void on success
   * @see {@link https://discord.com/developers/docs/resources/emoji#delete-application-emoji}
   */
  deleteApplicationEmoji(
    applicationId: Snowflake,
    emojiId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.#rest.delete(
      EmojiRouter.EMOJI_ROUTES.applicationEmojiByIdEndpoint(
        applicationId,
        emojiId,
      ),
      { reason },
    );
  }
}
