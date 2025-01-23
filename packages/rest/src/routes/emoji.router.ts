import type { EmojiEntity, Snowflake } from "@nyxjs/core";
import { fromZodError } from "zod-validation-error";
import type { Rest } from "../core/index.js";
import {
  CreateApplicationEmojiSchema,
  CreateGuildEmojiSchema,
  type ListApplicationEmojisEntity,
  ModifyApplicationEmojiSchema,
  ModifyGuildEmojiSchema,
} from "../schemas/index.js";

export class EmojiRouter {
  static readonly ROUTES = {
    guildEmojis: (guildId: Snowflake) => `/guilds/${guildId}/emojis` as const,
    guildEmoji: (guildId: Snowflake, emojiId: Snowflake) =>
      `/guilds/${guildId}/emojis/${emojiId}` as const,
    applicationEmojis: (applicationId: Snowflake) =>
      `/applications/${applicationId}/emojis` as const,
    applicationEmoji: (applicationId: Snowflake, emojiId: Snowflake) =>
      `/applications/${applicationId}/emojis/${emojiId}` as const,
  } as const;

  #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/emoji#list-guild-emojis}
   */
  listGuildEmojis(guildId: Snowflake): Promise<EmojiEntity[]> {
    return this.#rest.get(EmojiRouter.ROUTES.guildEmojis(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/emoji#get-guild-emoji}
   */
  getGuildEmoji(guildId: Snowflake, emojiId: Snowflake): Promise<EmojiEntity> {
    return this.#rest.get(EmojiRouter.ROUTES.guildEmoji(guildId, emojiId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/emoji#create-guild-emoji}
   */
  async createGuildEmoji(
    guildId: Snowflake,
    options: CreateGuildEmojiSchema,
    reason?: string,
  ): Promise<EmojiEntity> {
    const result = await CreateGuildEmojiSchema.safeParseAsync(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.post(EmojiRouter.ROUTES.guildEmojis(guildId), {
      body: JSON.stringify(result.data),
      reason,
    });
  }
  /**
   * @see {@link https://discord.com/developers/docs/resources/emoji#modify-guild-emoji}
   */
  modifyGuildEmoji(
    guildId: Snowflake,
    emojiId: Snowflake,
    options: ModifyGuildEmojiSchema,
    reason?: string,
  ): Promise<EmojiEntity> {
    const result = ModifyGuildEmojiSchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.patch(EmojiRouter.ROUTES.guildEmoji(guildId, emojiId), {
      body: JSON.stringify(result.data),
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
    return this.#rest.delete(EmojiRouter.ROUTES.guildEmoji(guildId, emojiId), {
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/emoji#list-application-emojis}
   */
  listApplicationEmojis(
    applicationId: Snowflake,
  ): Promise<ListApplicationEmojisEntity> {
    return this.#rest.get(EmojiRouter.ROUTES.applicationEmojis(applicationId));
  }

  /**
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
   * @see {@link https://discord.com/developers/docs/resources/emoji#create-application-emoji}
   */
  createApplicationEmoji(
    applicationId: Snowflake,
    options: CreateApplicationEmojiSchema,
    reason?: string,
  ): Promise<EmojiEntity> {
    const result = CreateApplicationEmojiSchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.post(
      EmojiRouter.ROUTES.applicationEmojis(applicationId),
      {
        body: JSON.stringify(result.data),
        reason,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/emoji#modify-application-emoji}
   */
  modifyApplicationEmoji(
    applicationId: Snowflake,
    emojiId: Snowflake,
    options: ModifyApplicationEmojiSchema,
    reason?: string,
  ): Promise<EmojiEntity> {
    const result = ModifyApplicationEmojiSchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.patch(
      EmojiRouter.ROUTES.applicationEmoji(applicationId, emojiId),
      {
        body: JSON.stringify(result.data),
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
    return this.#rest.delete(
      EmojiRouter.ROUTES.applicationEmoji(applicationId, emojiId),
      {
        reason,
      },
    );
  }
}
