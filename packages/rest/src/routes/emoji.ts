import type { EmojiEntity, Snowflake } from "@nyxjs/core";
import type { Rest } from "../core/index.js";
import type { ImageData } from "../types/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#create-guild-emoji-json-params}
 */
export interface GuildEmojiCreate {
  name: string;
  image: ImageData;
  roles?: Snowflake[];
}

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#modify-guild-emoji-json-params}
 */
export interface GuildEmojiModify {
  name?: string;
  roles?: Snowflake[] | null;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#create-application-emoji-json-params}
 */
export interface ApplicationEmojiCreate {
  name: string;
  image: ImageData;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#modify-application-emoji-json-params}
 */
export interface ApplicationEmojiModify {
  name: string;
}

export class EmojiRouter {
  static routes = {
    guildEmojis: (guildId: Snowflake): `/guilds/${Snowflake}/emojis` => {
      return `/guilds/${guildId}/emojis` as const;
    },
    guildEmoji: (
      guildId: Snowflake,
      emojiId: Snowflake,
    ): `/guilds/${Snowflake}/emojis/${Snowflake}` => {
      return `/guilds/${guildId}/emojis/${emojiId}` as const;
    },
    applicationEmojis: (
      applicationId: Snowflake,
    ): `/applications/${Snowflake}/emojis` => {
      return `/applications/${applicationId}/emojis` as const;
    },
    applicationEmoji: (
      applicationId: Snowflake,
      emojiId: Snowflake,
    ): `/applications/${Snowflake}/emojis/${Snowflake}` => {
      return `/applications/${applicationId}/emojis/${emojiId}` as const;
    },
  } as const;

  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/emoji#list-guild-emojis}
   */
  listGuildEmojis(guildId: Snowflake): Promise<EmojiEntity[]> {
    return this.#rest.get(EmojiRouter.routes.guildEmojis(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/emoji#get-guild-emoji}
   */
  getGuildEmoji(guildId: Snowflake, emojiId: Snowflake): Promise<EmojiEntity> {
    return this.#rest.get(EmojiRouter.routes.guildEmoji(guildId, emojiId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/emoji#create-guild-emoji}
   */
  createGuildEmoji(
    guildId: Snowflake,
    options: GuildEmojiCreate,
    reason?: string,
  ): Promise<EmojiEntity> {
    return this.#rest.post(EmojiRouter.routes.guildEmojis(guildId), {
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
    options: GuildEmojiModify,
    reason?: string,
  ): Promise<EmojiEntity> {
    return this.#rest.patch(EmojiRouter.routes.guildEmoji(guildId, emojiId), {
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
    return this.#rest.delete(EmojiRouter.routes.guildEmoji(guildId, emojiId), {
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/emoji#list-application-emojis}
   */
  listApplicationEmojis(
    applicationId: Snowflake,
  ): Promise<{ items: EmojiEntity[] }> {
    return this.#rest.get(EmojiRouter.routes.applicationEmojis(applicationId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/emoji#get-application-emoji}
   */
  getApplicationEmoji(
    applicationId: Snowflake,
    emojiId: Snowflake,
  ): Promise<EmojiEntity> {
    return this.#rest.get(
      EmojiRouter.routes.applicationEmoji(applicationId, emojiId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/emoji#create-application-emoji}
   */
  createApplicationEmoji(
    applicationId: Snowflake,
    options: ApplicationEmojiCreate,
  ): Promise<EmojiEntity> {
    return this.#rest.post(
      EmojiRouter.routes.applicationEmojis(applicationId),
      {
        body: JSON.stringify(options),
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/emoji#modify-application-emoji}
   */
  modifyApplicationEmoji(
    applicationId: Snowflake,
    emojiId: Snowflake,
    options: ApplicationEmojiModify,
  ): Promise<EmojiEntity> {
    return this.#rest.patch(
      EmojiRouter.routes.applicationEmoji(applicationId, emojiId),
      {
        body: JSON.stringify(options),
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/emoji#delete-application-emoji}
   */
  deleteApplicationEmoji(
    applicationId: Snowflake,
    emojiId: Snowflake,
  ): Promise<void> {
    return this.#rest.delete(
      EmojiRouter.routes.applicationEmoji(applicationId, emojiId),
    );
  }
}
