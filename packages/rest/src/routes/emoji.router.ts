import type { EmojiEntity, Snowflake } from "@nyxjs/core";
import { BaseRouter } from "../base/index.js";
import {
  type CreateApplicationEmojiEntity,
  CreateApplicationEmojiSchema,
  type CreateGuildEmojiEntity,
  CreateGuildEmojiSchema,
  type ModifyApplicationEmojiEntity,
  ModifyApplicationEmojiSchema,
  type ModifyGuildEmojiEntity,
  ModifyGuildEmojiSchema,
} from "../schemas/index.js";

export class EmojiRouter extends BaseRouter {
  static readonly ROUTES = {
    guildBase: (guildId: Snowflake) => `/guilds/${guildId}/emojis` as const,
    guildEmoji: (guildId: Snowflake, emojiId: Snowflake) =>
      `/guilds/${guildId}/emojis/${emojiId}` as const,
    applicationBase: (applicationId: Snowflake) =>
      `/applications/${applicationId}/emojis` as const,
    applicationEmoji: (applicationId: Snowflake, emojiId: Snowflake) =>
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
  createGuildEmoji(
    guildId: Snowflake,
    options: CreateGuildEmojiEntity,
    reason?: string,
  ): Promise<EmojiEntity> {
    const result = CreateGuildEmojiSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.post(EmojiRouter.ROUTES.guildBase(guildId), {
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
    options: ModifyGuildEmojiEntity,
    reason?: string,
  ): Promise<EmojiEntity> {
    const result = ModifyGuildEmojiSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.patch(EmojiRouter.ROUTES.guildEmoji(guildId, emojiId), {
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
  createApplicationEmoji(
    applicationId: Snowflake,
    options: CreateApplicationEmojiEntity,
    reason?: string,
  ): Promise<EmojiEntity> {
    const result = CreateApplicationEmojiSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.post(EmojiRouter.ROUTES.applicationBase(applicationId), {
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
    options: ModifyApplicationEmojiEntity,
    reason?: string,
  ): Promise<EmojiEntity> {
    const result = ModifyApplicationEmojiSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.patch(
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
    return this.delete(
      EmojiRouter.ROUTES.applicationEmoji(applicationId, emojiId),
      {
        reason,
      },
    );
  }
}
