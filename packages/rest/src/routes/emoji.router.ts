import type { EmojiEntity, Snowflake } from "@nyxjs/core";
import type { Rest } from "../core/index.js";
import { FileHandler, type FileInput } from "../handlers/index.js";

/**
 * Interface for creating a guild emoji.
 *
 * This interface defines the required parameters for adding a new custom emoji
 * to a Discord guild. Custom emojis enrich server communication and branding.
 *
 * @remarks
 * Creating an emoji requires the CREATE_GUILD_EXPRESSIONS permission.
 * Emojis have a maximum file size of 256 KiB (both regular and animated).
 * Each guild has a limited number of emoji slots based on server boost level.
 *
 * @see {@link https://discord.com/developers/docs/resources/emoji#create-guild-emoji-json-params}
 */
export interface CreateGuildEmojiSchema {
  /**
   * Name of the emoji (1-32 characters).
   *
   * This name is used when referencing the emoji in messages using `:name:` syntax.
   * Must contain only alphanumeric characters and underscores.
   */
  name: string;

  /**
   * The 128x128 emoji image as file data or URL.
   *
   * Will be automatically converted to a data URI format.
   * Supports PNG, JPEG, GIF (for animated emojis), and WebP formats.
   * For best results, use square images with transparent backgrounds.
   */
  image: FileInput;

  /**
   * Array of role IDs allowed to use this emoji.
   *
   * When specified, only members with at least one of these roles can use this emoji.
   * When omitted or empty, all members can use the emoji (subject to other permissions).
   */
  roles?: Snowflake[];
}

/**
 * Interface for modifying a guild emoji.
 *
 * This interface defines the properties that can be updated for an existing
 * emoji in a guild.
 *
 * @remarks
 * Modifying an emoji requires either CREATE_GUILD_EXPRESSIONS or MANAGE_GUILD_EXPRESSIONS
 * permission, depending on whether you created the emoji.
 * All parameters are optional, allowing partial updates.
 *
 * @see {@link https://discord.com/developers/docs/resources/emoji#modify-guild-emoji-json-params}
 */
export interface ModifyGuildEmojiSchema {
  /**
   * New name of the emoji (1-32 characters).
   *
   * Must contain only alphanumeric characters and underscores.
   * This will change how the emoji is referenced in messages (`:new_name:`).
   */
  name?: string;

  /**
   * New array of role IDs allowed to use this emoji.
   *
   * When specified, only members with at least one of these roles can use this emoji.
   * Set to an empty array to allow all members to use the emoji.
   * Set to null to remove all role restrictions.
   */
  roles?: Snowflake[] | null;
}

/**
 * Response interface for listing application emojis.
 *
 * Application emojis are returned in an object with an "items" array,
 * unlike guild emojis which are returned as a direct array.
 *
 * @remarks
 * An application can own up to 2000 emojis that can only be used by that app.
 * These emojis don't count against any guild's emoji limit.
 *
 * @see {@link https://discord.com/developers/docs/resources/emoji#list-application-emojis}
 */
export interface ListApplicationEmojisEntity {
  /**
   * Array of emoji objects owned by the application.
   * Each emoji has properties like id, name, and animated.
   */
  items: EmojiEntity[];
}

/**
 * Interface for creating an application emoji.
 *
 * Based on CreateGuildEmojiSchema but without the roles field,
 * as application emojis don't support role restrictions.
 * Application emojis belong to the application rather than a guild.
 *
 * @remarks
 * Application emojis can be used across servers without requiring the USE_EXTERNAL_EMOJIS permission.
 * They're ideal for branded emojis that your application needs in multiple guilds.
 *
 * @see {@link https://discord.com/developers/docs/resources/emoji#create-application-emoji-json-params}
 */
export type CreateApplicationEmojiSchema = Omit<
  CreateGuildEmojiSchema,
  "roles"
>;

/**
 * Interface for modifying an application emoji.
 *
 * Only the name can be modified for application emojis, unlike
 * guild emojis which also support role restrictions.
 *
 * @see {@link https://discord.com/developers/docs/resources/emoji#modify-application-emoji-json-params}
 */
export type ModifyApplicationEmojiSchema = Pick<ModifyGuildEmojiSchema, "name">;

/**
 * Router for Discord Emoji-related API endpoints.
 *
 * This class provides methods to interact with both guild emojis and application-owned emojis.
 * Guild emojis are custom emojis available in a specific server, while application emojis
 * are owned by an application and can be used in any server where the application is installed.
 *
 * @remarks
 * Emoji endpoints have special rate limiting on a per-guild basis.
 * The quotas returned in rate limit headers may be inaccurate and you might encounter
 * 429 (Too Many Requests) errors even with careful quota management.
 */
export class EmojiRouter {
  /**
   * API route constants for emoji-related endpoints.
   */
  static readonly EMOJI_ROUTES = {
    /**
     * Endpoint for managing all emojis in a guild.
     *
     * @param guildId - ID of the guild
     * @returns The formatted API route string
     */
    guildEmojisEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/emojis` as const,

    /**
     * Endpoint for managing a specific emoji in a guild.
     *
     * @param guildId - ID of the guild
     * @param emojiId - ID of the emoji
     * @returns The formatted API route string
     */
    guildEmojiByIdEndpoint: (guildId: Snowflake, emojiId: Snowflake) =>
      `/guilds/${guildId}/emojis/${emojiId}` as const,

    /**
     * Endpoint for managing all emojis owned by an application.
     *
     * @param applicationId - ID of the application
     * @returns The formatted API route string
     */
    applicationEmojisEndpoint: (applicationId: Snowflake) =>
      `/applications/${applicationId}/emojis` as const,

    /**
     * Endpoint for managing a specific emoji owned by an application.
     *
     * @param applicationId - ID of the application
     * @param emojiId - ID of the emoji
     * @returns The formatted API route string
     */
    applicationEmojiByIdEndpoint: (
      applicationId: Snowflake,
      emojiId: Snowflake,
    ) => `/applications/${applicationId}/emojis/${emojiId}` as const,
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new Emoji Router instance.
   *
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches all emojis in a guild.
   *
   * This method retrieves all custom emojis available in the specified guild,
   * including their IDs, names, and whether they're animated.
   *
   * @param guildId - ID of the guild
   * @returns A promise that resolves to an array of emoji objects
   *
   * @remarks
   * Includes user fields (showing who created the emoji) if the bot has
   * CREATE_GUILD_EXPRESSIONS or MANAGE_GUILD_EXPRESSIONS permission.
   *
   * @see {@link https://discord.com/developers/docs/resources/emoji#list-guild-emojis}
   */
  fetchGuildEmojis(guildId: Snowflake): Promise<EmojiEntity[]> {
    return this.#rest.get(
      EmojiRouter.EMOJI_ROUTES.guildEmojisEndpoint(guildId),
    );
  }

  /**
   * Fetches a specific emoji from a guild.
   *
   * This method retrieves detailed information about a single custom emoji
   * from the specified guild.
   *
   * @param guildId - ID of the guild
   * @param emojiId - ID of the emoji
   * @returns A promise that resolves to the emoji object
   *
   * @remarks
   * Includes the user field (showing who created the emoji) if the bot has
   * CREATE_GUILD_EXPRESSIONS or MANAGE_GUILD_EXPRESSIONS permission.
   *
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
   *
   * This method uploads and registers a new custom emoji in the specified guild.
   * The emoji can then be used in messages within that guild.
   *
   * @param guildId - ID of the guild
   * @param options - Configuration for the new emoji
   * @param reason - Optional audit log reason
   * @returns A promise that resolves to the created emoji
   *
   * @remarks
   * - Requires the CREATE_GUILD_EXPRESSIONS permission
   * - Emojis have a maximum file size of 256 KiB
   * - Each guild has a limited number of emoji slots based on server boost level
   * - Fires a Guild Emojis Update Gateway event
   *
   * @see {@link https://discord.com/developers/docs/resources/emoji#create-guild-emoji}
   */
  async createGuildEmoji(
    guildId: Snowflake,
    options: CreateGuildEmojiSchema,
    reason?: string,
  ): Promise<EmojiEntity> {
    if (options.image) {
      options.image = await FileHandler.toDataUri(options.image);
    }

    return this.#rest.post(
      EmojiRouter.EMOJI_ROUTES.guildEmojisEndpoint(guildId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Updates an existing guild emoji.
   *
   * This method allows changing the name or role restrictions of an existing
   * custom emoji in the specified guild.
   *
   * @param guildId - ID of the guild
   * @param emojiId - ID of the emoji to modify
   * @param options - New properties for the emoji
   * @param reason - Optional audit log reason
   * @returns A promise that resolves to the updated emoji
   *
   * @remarks
   * - For emojis created by the current user, requires either CREATE_GUILD_EXPRESSIONS
   *   or MANAGE_GUILD_EXPRESSIONS permission
   * - For other emojis, requires the MANAGE_GUILD_EXPRESSIONS permission
   * - Fires a Guild Emojis Update Gateway event
   *
   * @see {@link https://discord.com/developers/docs/resources/emoji#modify-guild-emoji}
   */
  updateGuildEmoji(
    guildId: Snowflake,
    emojiId: Snowflake,
    options: ModifyGuildEmojiSchema,
    reason?: string,
  ): Promise<EmojiEntity> {
    return this.#rest.patch(
      EmojiRouter.EMOJI_ROUTES.guildEmojiByIdEndpoint(guildId, emojiId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Deletes a guild emoji.
   *
   * This method permanently removes a custom emoji from the specified guild.
   *
   * @param guildId - ID of the guild
   * @param emojiId - ID of the emoji to delete
   * @param reason - Optional audit log reason
   * @returns A promise that resolves to void on success
   *
   * @remarks
   * - For emojis created by the current user, requires either CREATE_GUILD_EXPRESSIONS
   *   or MANAGE_GUILD_EXPRESSIONS permission
   * - For other emojis, requires the MANAGE_GUILD_EXPRESSIONS permission
   * - Fires a Guild Emojis Update Gateway event
   * - Once deleted, an emoji cannot be recovered
   *
   * @see {@link https://discord.com/developers/docs/resources/emoji#delete-guild-emoji}
   */
  deleteGuildEmoji(
    guildId: Snowflake,
    emojiId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.#rest.delete(
      EmojiRouter.EMOJI_ROUTES.guildEmojiByIdEndpoint(guildId, emojiId),
      {
        reason,
      },
    );
  }

  /**
   * Fetches all emojis owned by an application.
   *
   * This method retrieves all custom emojis that are owned by the application,
   * rather than by a specific guild.
   *
   * @param applicationId - ID of the application
   * @returns A promise that resolves to a ListApplicationEmojisEntity containing emoji objects
   *
   * @remarks
   * - Applications can own up to 2000 emojis
   * - Application emojis can be used anywhere the application has access
   * - Includes user object for the team member or bot that uploaded the emoji
   * - Response format differs from guild emojis (contains an "items" array)
   *
   * @see {@link https://discord.com/developers/docs/resources/emoji#list-application-emojis}
   */
  fetchApplicationEmojis(
    applicationId: Snowflake,
  ): Promise<ListApplicationEmojisEntity> {
    return this.#rest.get(
      EmojiRouter.EMOJI_ROUTES.applicationEmojisEndpoint(applicationId),
    );
  }

  /**
   * Fetches a specific emoji owned by an application.
   *
   * This method retrieves detailed information about a single custom emoji
   * that is owned by the application.
   *
   * @param applicationId - ID of the application
   * @param emojiId - ID of the emoji
   * @returns A promise that resolves to the emoji object
   *
   * @remarks
   * Always includes the user field showing which team member or bot created the emoji.
   *
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
   *
   * This method uploads and registers a new custom emoji owned by the application,
   * rather than by a specific guild.
   *
   * @param applicationId - ID of the application
   * @param options - Configuration for the new emoji
   * @param reason - Optional reason
   * @returns A promise that resolves to the created emoji
   *
   * @remarks
   * - Emojis have a maximum file size of 256 KiB
   * - Application emojis can be used without the USE_EXTERNAL_EMOJIS permission
   * - Applications can own up to 2000 emojis
   * - Application emojis don't count against any guild's emoji limit
   *
   * @see {@link https://discord.com/developers/docs/resources/emoji#create-application-emoji}
   */
  async createApplicationEmoji(
    applicationId: Snowflake,
    options: CreateApplicationEmojiSchema,
    reason?: string,
  ): Promise<EmojiEntity> {
    if (options.image) {
      options.image = await FileHandler.toDataUri(options.image);
    }

    return this.#rest.post(
      EmojiRouter.EMOJI_ROUTES.applicationEmojisEndpoint(applicationId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Updates an existing application emoji.
   *
   * This method allows changing the name of an existing custom emoji
   * owned by the application.
   *
   * @param applicationId - ID of the application
   * @param emojiId - ID of the emoji to modify
   * @param options - New properties for the emoji (only name can be modified)
   * @param reason - Optional reason
   * @returns A promise that resolves to the updated emoji
   *
   * @see {@link https://discord.com/developers/docs/resources/emoji#modify-application-emoji}
   */
  updateApplicationEmoji(
    applicationId: Snowflake,
    emojiId: Snowflake,
    options: ModifyApplicationEmojiSchema,
    reason?: string,
  ): Promise<EmojiEntity> {
    return this.#rest.patch(
      EmojiRouter.EMOJI_ROUTES.applicationEmojiByIdEndpoint(
        applicationId,
        emojiId,
      ),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Deletes an application emoji.
   *
   * This method permanently removes a custom emoji owned by the application.
   *
   * @param applicationId - ID of the application
   * @param emojiId - ID of the emoji to delete
   * @param reason - Optional reason
   * @returns A promise that resolves to void on success
   *
   * @remarks
   * - Once deleted, an emoji cannot be recovered
   * - After deletion, the emoji will no longer be usable in any guild
   *
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
      {
        reason,
      },
    );
  }
}
