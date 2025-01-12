import type { EmojiEntity, Snowflake } from "@nyxjs/core";
import type { z } from "zod";
import { fromZodError } from "zod-validation-error";
import type { Rest } from "../rest.js";
import {
  CreateApplicationEmojiEntity,
  CreateGuildEmojiEntity,
  type ListApplicationEmojisEntity,
  ModifyApplicationEmojiEntity,
  ModifyGuildEmojiEntity,
} from "../schemas/index.js";
import type { HttpResponse } from "../types/index.js";

export class EmojiRouter {
  static readonly ROUTES = {
    guildBase: (guildId: Snowflake) => `/guilds/${guildId}/emojis` as const,
    guildEmoji: (guildId: Snowflake, emojiId: Snowflake) =>
      `/guilds/${guildId}/emojis/${emojiId}` as const,
    applicationBase: (applicationId: Snowflake) =>
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
  listGuildEmojis(guildId: Snowflake): Promise<HttpResponse<EmojiEntity[]>> {
    return this.#rest.get(EmojiRouter.ROUTES.guildBase(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/emoji#get-guild-emoji}
   */
  getGuildEmoji(
    guildId: Snowflake,
    emojiId: Snowflake,
  ): Promise<HttpResponse<EmojiEntity>> {
    return this.#rest.get(EmojiRouter.ROUTES.guildEmoji(guildId, emojiId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/emoji#create-guild-emoji}
   */
  createGuildEmoji(
    guildId: Snowflake,
    options: z.input<typeof CreateGuildEmojiEntity>,
    reason?: string,
  ): Promise<HttpResponse<EmojiEntity>> {
    const result = CreateGuildEmojiEntity.safeParse(options);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      throw new Error(validationError.message);
    }

    return this.#rest.post(EmojiRouter.ROUTES.guildBase(guildId), {
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
    options: z.input<typeof ModifyGuildEmojiEntity>,
    reason?: string,
  ): Promise<HttpResponse<EmojiEntity>> {
    const result = ModifyGuildEmojiEntity.safeParse(options);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      throw new Error(validationError.message);
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
  ): Promise<HttpResponse<void>> {
    return this.#rest.delete(EmojiRouter.ROUTES.guildEmoji(guildId, emojiId), {
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/emoji#list-application-emojis}
   */
  listApplicationEmojis(
    applicationId: Snowflake,
  ): Promise<HttpResponse<ListApplicationEmojisEntity>> {
    return this.#rest.get(EmojiRouter.ROUTES.applicationBase(applicationId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/emoji#get-application-emoji}
   */
  getApplicationEmoji(
    applicationId: Snowflake,
    emojiId: Snowflake,
  ): Promise<HttpResponse<EmojiEntity>> {
    return this.#rest.get(
      EmojiRouter.ROUTES.applicationEmoji(applicationId, emojiId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/emoji#create-application-emoji}
   */
  createApplicationEmoji(
    applicationId: Snowflake,
    options: z.input<typeof CreateApplicationEmojiEntity>,
    reason?: string,
  ): Promise<HttpResponse<EmojiEntity>> {
    const result = CreateApplicationEmojiEntity.safeParse(options);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      throw new Error(validationError.message);
    }

    return this.#rest.post(EmojiRouter.ROUTES.applicationBase(applicationId), {
      body: JSON.stringify(result.data),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/emoji#modify-application-emoji}
   */
  modifyApplicationEmoji(
    applicationId: Snowflake,
    emojiId: Snowflake,
    options: z.input<typeof ModifyApplicationEmojiEntity>,
    reason?: string,
  ): Promise<HttpResponse<EmojiEntity>> {
    const result = ModifyApplicationEmojiEntity.safeParse(options);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      throw new Error(validationError.message);
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
  ): Promise<HttpResponse<void>> {
    return this.#rest.delete(
      EmojiRouter.ROUTES.applicationEmoji(applicationId, emojiId),
      {
        reason,
      },
    );
  }
}
