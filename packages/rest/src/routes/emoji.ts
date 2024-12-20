import type { EmojiEntity, Snowflake } from "@nyxjs/core";
import type { ImageData } from "../types/index.js";
import { BaseRouter } from "./base.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#create-guild-emoji-json-params}
 */
export interface GuildEmojiCreateEntity {
  name: string;
  image: ImageData;
  roles?: Snowflake[];
}

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#modify-guild-emoji-json-params}
 */
export interface GuildEmojiModifyEntity {
  name?: string;
  roles?: Snowflake[] | null;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#create-application-emoji-json-params}
 */
export interface ApplicationEmojiCreateEntity {
  name: string;
  image: ImageData;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#modify-application-emoji-json-params}
 */
export interface ApplicationEmojiModifyEntity {
  name: string;
}

export interface EmojiRoutes {
  readonly guildBase: (guildId: Snowflake) => `/guilds/${Snowflake}/emojis`;
  readonly guildEmoji: (
    guildId: Snowflake,
    emojiId: Snowflake,
  ) => `/guilds/${Snowflake}/emojis/${Snowflake}`;
  readonly applicationBase: (
    applicationId: Snowflake,
  ) => `/applications/${Snowflake}/emojis`;
  readonly applicationEmoji: (
    applicationId: Snowflake,
    emojiId: Snowflake,
  ) => `/applications/${Snowflake}/emojis/${Snowflake}`;
}

export class EmojiRouter extends BaseRouter {
  static readonly MAX_LIMIT_NAME_LENGTH_MIN = 1;
  static readonly MAX_LIMIT_NAME_LENGTH_MAX = 32;
  static readonly MAX_EMOJI_COUNT_GUILD_NORMAL = 50;
  static readonly MAX_EMOJI_COUNT_GUILD_PREMIUM = 25;
  static readonly MAX_EMOJI_COUNT_APPLICATION = 2000;
  static readonly MAX_ROLES = 20;

  static readonly ROUTES: EmojiRoutes = {
    guildBase: (guildId) => `/guilds/${guildId}/emojis` as const,
    guildEmoji: (guildId, emojiId) =>
      `/guilds/${guildId}/emojis/${emojiId}` as const,
    applicationBase: (applicationId) =>
      `/applications/${applicationId}/emojis` as const,
    applicationEmoji: (applicationId, emojiId) =>
      `/applications/${applicationId}/emojis/${emojiId}` as const,
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/emoji#list-guild-emojis}
   */
  listGuildEmojis(guildId: Snowflake): Promise<EmojiEntity[]> {
    return this.get(EmojiRouter.ROUTES.guildBase(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/emoji#get-guild-emoji}
   */
  getGuildEmoji(guildId: Snowflake, emojiId: Snowflake): Promise<EmojiEntity> {
    return this.get(EmojiRouter.ROUTES.guildEmoji(guildId, emojiId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/emoji#create-guild-emoji}
   */
  async createGuildEmoji(
    guildId: Snowflake,
    options: GuildEmojiCreateEntity,
    reason?: string,
  ): Promise<EmojiEntity> {
    this.#validateEmojiCreate(options);
    const isAnimated = options.image.startsWith("data:image/gif;");
    await this.#validateEmojiLimits(guildId, undefined, isAnimated);

    return this.post(EmojiRouter.ROUTES.guildBase(guildId), {
      body: JSON.stringify(options),
      reason,
    });
  }
  /**
   * @see {@link https://discord.com/developers/docs/resources/emoji#modify-guild-emoji}
   */
  modifyGuildEmoji(
    guildId: Snowflake,
    emojiId: Snowflake,
    options: GuildEmojiModifyEntity,
    reason?: string,
  ): Promise<EmojiEntity> {
    this.#validateEmojiModify(options);

    return this.patch(EmojiRouter.ROUTES.guildEmoji(guildId, emojiId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/emoji#delete-guild-emoji}
   */
  deleteGuildEmoji(
    guildId: Snowflake,
    emojiId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.delete(EmojiRouter.ROUTES.guildEmoji(guildId, emojiId), {
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/emoji#list-application-emojis}
   */
  listApplicationEmojis(
    applicationId: Snowflake,
  ): Promise<{ items: EmojiEntity[] }> {
    return this.get(EmojiRouter.ROUTES.applicationBase(applicationId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/emoji#get-application-emoji}
   */
  getApplicationEmoji(
    applicationId: Snowflake,
    emojiId: Snowflake,
  ): Promise<EmojiEntity> {
    return this.get(
      EmojiRouter.ROUTES.applicationEmoji(applicationId, emojiId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/emoji#create-application-emoji}
   */
  async createApplicationEmoji(
    applicationId: Snowflake,
    options: ApplicationEmojiCreateEntity,
    reason?: string,
  ): Promise<EmojiEntity> {
    this.#validateEmojiCreate(options);
    await this.#validateEmojiLimits(undefined, applicationId);

    return this.post(EmojiRouter.ROUTES.applicationBase(applicationId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/emoji#modify-application-emoji}
   */
  modifyApplicationEmoji(
    applicationId: Snowflake,
    emojiId: Snowflake,
    options: ApplicationEmojiModifyEntity,
    reason?: string,
  ): Promise<EmojiEntity> {
    this.#validateEmojiModify(options);

    return this.patch(
      EmojiRouter.ROUTES.applicationEmoji(applicationId, emojiId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/emoji#delete-application-emoji}
   */
  deleteApplicationEmoji(
    applicationId: Snowflake,
    emojiId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.delete(
      EmojiRouter.ROUTES.applicationEmoji(applicationId, emojiId),
      {
        reason,
      },
    );
  }

  async #validateEmojiLimits(
    guildId?: Snowflake,
    applicationId?: Snowflake,
    isAnimated?: boolean,
  ): Promise<void> {
    if (guildId) {
      const existingEmojis = await this.listGuildEmojis(guildId);
      const normalEmojis = existingEmojis.filter(
        (emoji) => !emoji.animated,
      ).length;
      const premiumEmojis = existingEmojis.filter(
        (emoji) => emoji.animated,
      ).length;

      if (isAnimated) {
        if (premiumEmojis >= EmojiRouter.MAX_EMOJI_COUNT_GUILD_PREMIUM) {
          throw new Error(
            `Cannot exceed ${EmojiRouter.MAX_EMOJI_COUNT_GUILD_PREMIUM} premium emojis per guild`,
          );
        }
      } else if (normalEmojis >= EmojiRouter.MAX_EMOJI_COUNT_GUILD_NORMAL) {
        throw new Error(
          `Cannot exceed ${EmojiRouter.MAX_EMOJI_COUNT_GUILD_NORMAL} normal emojis per guild`,
        );
      }
    }

    if (applicationId) {
      const existingEmojis = await this.listApplicationEmojis(applicationId);
      if (
        existingEmojis.items.length >= EmojiRouter.MAX_EMOJI_COUNT_APPLICATION
      ) {
        throw new Error(
          `Cannot exceed ${EmojiRouter.MAX_EMOJI_COUNT_APPLICATION} emojis per application`,
        );
      }
    }
  }

  #validateEmojiCreate(
    options: GuildEmojiCreateEntity | ApplicationEmojiCreateEntity,
  ): void {
    if (!options.name) {
      throw new Error("Emoji name is required");
    }

    if (!options.image) {
      throw new Error("Emoji image is required");
    }

    this.#validateEmojiName(options.name);

    if (
      "roles" in options &&
      options.roles &&
      options.roles.length > EmojiRouter.MAX_ROLES
    ) {
      throw new Error(`Cannot exceed ${EmojiRouter.MAX_ROLES} roles per emoji`);
    }
  }

  #validateEmojiModify(
    options: GuildEmojiModifyEntity | ApplicationEmojiModifyEntity,
  ): void {
    if (options.name) {
      this.#validateEmojiName(options.name);
    }

    if (
      "roles" in options &&
      options.roles &&
      options.roles.length > EmojiRouter.MAX_ROLES
    ) {
      throw new Error(`Cannot exceed ${EmojiRouter.MAX_ROLES} roles per emoji`);
    }
  }

  #validateEmojiName(name: string): void {
    if (
      name.length < EmojiRouter.MAX_LIMIT_NAME_LENGTH_MIN ||
      name.length > EmojiRouter.MAX_LIMIT_NAME_LENGTH_MAX
    ) {
      throw new Error(
        `Emoji name must be between ${EmojiRouter.MAX_LIMIT_NAME_LENGTH_MIN} and ${EmojiRouter.MAX_LIMIT_NAME_LENGTH_MAX} characters`,
      );
    }
  }
}
