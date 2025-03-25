import type { EmojiEntity, Snowflake } from "@nyxjs/core";
import type { Rest } from "../core/index.js";
import { FileHandler } from "../handlers/index.js";
import type {
  CreateApplicationEmojiSchema,
  CreateGuildEmojiSchema,
  ListApplicationEmojisEntity,
  ModifyApplicationEmojiSchema,
  ModifyGuildEmojiSchema,
} from "../schemas/index.js";

/**
 * Router for Discord Emoji-related API endpoints.
 * Provides methods to interact with both guild emojis and application-owned emojis.
 *
 * @remarks
 * Emoji endpoints have special rate limiting on a per-guild basis.
 * The quotas returned may be inaccurate and you might encounter 429 errors.
 */
export class EmojiRouter {
  /**
   * API route constants for emoji-related endpoints.
   */
  static readonly ROUTES = {
    /** Endpoint for managing all emojis in a guild */
    guildEmojis: (guildId: Snowflake) => `/guilds/${guildId}/emojis` as const,

    /** Endpoint for managing a specific emoji in a guild */
    guildEmoji: (guildId: Snowflake, emojiId: Snowflake) =>
      `/guilds/${guildId}/emojis/${emojiId}` as const,

    /** Endpoint for managing all emojis owned by an application */
    applicationEmojis: (applicationId: Snowflake) =>
      `/applications/${applicationId}/emojis` as const,

    /** Endpoint for managing a specific emoji owned by an application */
    applicationEmoji: (applicationId: Snowflake, emojiId: Snowflake) =>
      `/applications/${applicationId}/emojis/${emojiId}` as const,
  } as const;

  /** The REST client used for making API requests */
  readonly #rest: Rest;

  /**
   * Creates a new EmojiRouter instance.
   * @param rest - The REST client to use for making API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Lists all emojis in a guild.
   *
   * @param guildId - ID of the guild
   * @returns A promise that resolves to an array of emoji objects
   * @remarks Includes user fields if the bot has CREATE_GUILD_EXPRESSIONS or MANAGE_GUILD_EXPRESSIONS permission
   * @see {@link https://discord.com/developers/docs/resources/emoji#list-guild-emojis}
   */
  listGuildEmojis(guildId: Snowflake): Promise<EmojiEntity[]> {
    return this.#rest.get(EmojiRouter.ROUTES.guildEmojis(guildId));
  }

  /**
   * Gets a specific emoji from a guild.
   *
   * @param guildId - ID of the guild
   * @param emojiId - ID of the emoji
   * @returns A promise that resolves to the emoji object
   * @remarks Includes the user field if the bot has appropriate permissions
   * @see {@link https://discord.com/developers/docs/resources/emoji#get-guild-emoji}
   */
  getGuildEmoji(guildId: Snowflake, emojiId: Snowflake): Promise<EmojiEntity> {
    return this.#rest.get(EmojiRouter.ROUTES.guildEmoji(guildId, emojiId));
  }

  /**
   * Creates a new emoji in a guild.
   *
   * @param guildId - ID of the guild
   * @param options - Configuration for the new emoji
   * @param reason - Optional audit log reason
   * @returns A promise that resolves to the created emoji
   * @remarks
   * - Requires the CREATE_GUILD_EXPRESSIONS permission
   * - Emojis have a maximum file size of 256 KiB
   * - Fires a Guild Emojis Update Gateway event
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

    return this.#rest.post(EmojiRouter.ROUTES.guildEmojis(guildId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * Modifies an existing guild emoji.
   *
   * @param guildId - ID of the guild
   * @param emojiId - ID of the emoji to modify
   * @param options - New properties for the emoji
   * @param reason - Optional audit log reason
   * @returns A promise that resolves to the updated emoji
   * @remarks
   * - For emojis created by the current user, requires either CREATE_GUILD_EXPRESSIONS
   *   or MANAGE_GUILD_EXPRESSIONS permission
   * - For other emojis, requires the MANAGE_GUILD_EXPRESSIONS permission
   * - Fires a Guild Emojis Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/emoji#modify-guild-emoji}
   */
  modifyGuildEmoji(
    guildId: Snowflake,
    emojiId: Snowflake,
    options: ModifyGuildEmojiSchema,
    reason?: string,
  ): Promise<EmojiEntity> {
    return this.#rest.patch(EmojiRouter.ROUTES.guildEmoji(guildId, emojiId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * Deletes a guild emoji.
   *
   * @param guildId - ID of the guild
   * @param emojiId - ID of the emoji to delete
   * @param reason - Optional audit log reason
   * @returns A promise that resolves to void on success
   * @remarks
   * - For emojis created by the current user, requires either CREATE_GUILD_EXPRESSIONS
   *   or MANAGE_GUILD_EXPRESSIONS permission
   * - For other emojis, requires the MANAGE_GUILD_EXPRESSIONS permission
   * - Fires a Guild Emojis Update Gateway event
   * @see {@link https://discord.com/developers/docs/resources/emoji#delete-guild-emoji}
   */
  deleteGuildEmoji(
    guildId: Snowflake,
    emojiId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.#rest.delete(EmojiRouter.ROUTES.guildEmoji(guildId, emojiId), {
      reason,
    });
  }

  /**
   * Lists all emojis owned by an application.
   *
   * @param applicationId - ID of the application
   * @returns A promise that resolves to a ListApplicationEmojisEntity containing emoji objects
   * @remarks
   * - Applications can own up to 2000 emojis
   * - Includes user object for the team member or bot that uploaded the emoji
   * @see {@link https://discord.com/developers/docs/resources/emoji#list-application-emojis}
   */
  listApplicationEmojis(
    applicationId: Snowflake,
  ): Promise<ListApplicationEmojisEntity> {
    return this.#rest.get(EmojiRouter.ROUTES.applicationEmojis(applicationId));
  }

  /**
   * Gets a specific emoji owned by an application.
   *
   * @param applicationId - ID of the application
   * @param emojiId - ID of the emoji
   * @returns A promise that resolves to the emoji object
   * @remarks Always includes the user field
   * @see {@link https://discord.com/developers/docs/resources/emoji#get-application-emoji}
   */
  getApplicationEmoji(
    applicationId: Snowflake,
    emojiId: Snowflake,
  ): Promise<EmojiEntity> {
    return this.#rest.get(
      EmojiRouter.ROUTES.applicationEmoji(applicationId, emojiId),
    );
  }

  /**
   * Creates a new emoji for an application.
   *
   * @param applicationId - ID of the application
   * @param options - Configuration for the new emoji
   * @param reason - Optional reason
   * @returns A promise that resolves to the created emoji
   * @remarks
   * - Emojis have a maximum file size of 256 KiB
   * - Application emojis can be used without the USE_EXTERNAL_EMOJIS permission
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
      EmojiRouter.ROUTES.applicationEmojis(applicationId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Modifies an existing application emoji.
   *
   * @param applicationId - ID of the application
   * @param emojiId - ID of the emoji to modify
   * @param options - New properties for the emoji (only name can be modified)
   * @param reason - Optional reason
   * @returns A promise that resolves to the updated emoji
   * @see {@link https://discord.com/developers/docs/resources/emoji#modify-application-emoji}
   */
  modifyApplicationEmoji(
    applicationId: Snowflake,
    emojiId: Snowflake,
    options: ModifyApplicationEmojiSchema,
    reason?: string,
  ): Promise<EmojiEntity> {
    return this.#rest.patch(
      EmojiRouter.ROUTES.applicationEmoji(applicationId, emojiId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Deletes an application emoji.
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
      EmojiRouter.ROUTES.applicationEmoji(applicationId, emojiId),
      {
        reason,
      },
    );
  }
}
