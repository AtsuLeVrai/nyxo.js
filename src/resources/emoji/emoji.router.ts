import type { FileInput, Rest } from "../../core/index.js";
import type { EmojiEntity } from "./emoji.entity.js";

export interface GuildEmojiCreateOptions {
  name: string;
  image: FileInput;
  roles?: string[];
}

export interface GuildEmojiUpdateOptions {
  name?: string;
  roles?: string[] | null;
}

export interface ApplicationEmojisResponse {
  items: EmojiEntity[];
}

export type ApplicationEmojiCreateOptions = Omit<GuildEmojiCreateOptions, "roles">;

export type ApplicationEmojiUpdateOptions = Pick<GuildEmojiUpdateOptions, "name">;

export class EmojiRouter {
  static readonly Routes = {
    guildEmojisEndpoint: (guildId: string) => `/guilds/${guildId}/emojis` as const,
    guildEmojiByIdEndpoint: (guildId: string, emojiId: string) =>
      `/guilds/${guildId}/emojis/${emojiId}` as const,
    applicationEmojisEndpoint: (applicationId: string) =>
      `/applications/${applicationId}/emojis` as const,
    applicationEmojiByIdEndpoint: (applicationId: string, emojiId: string) =>
      `/applications/${applicationId}/emojis/${emojiId}` as const,
  } as const satisfies Record<string, (...args: any[]) => string>;
  readonly #rest: Rest;
  constructor(rest: Rest) {
    this.#rest = rest;
  }
  fetchGuildEmojis(guildId: string): Promise<EmojiEntity[]> {
    return this.#rest.get(EmojiRouter.Routes.guildEmojisEndpoint(guildId));
  }
  fetchGuildEmoji(guildId: string, emojiId: string): Promise<EmojiEntity> {
    return this.#rest.get(EmojiRouter.Routes.guildEmojiByIdEndpoint(guildId, emojiId));
  }
  async createGuildEmoji(
    guildId: string,
    options: GuildEmojiCreateOptions,
    reason?: string,
  ): Promise<EmojiEntity> {
    const processedOptions = { ...options };
    if (processedOptions.image) {
      processedOptions.image = await this.#rest.toDataUri(processedOptions.image);
    }
    return this.#rest.post(EmojiRouter.Routes.guildEmojisEndpoint(guildId), {
      body: JSON.stringify(processedOptions),
      reason,
    });
  }
  updateGuildEmoji(
    guildId: string,
    emojiId: string,
    options: GuildEmojiUpdateOptions,
    reason?: string,
  ): Promise<EmojiEntity> {
    return this.#rest.patch(EmojiRouter.Routes.guildEmojiByIdEndpoint(guildId, emojiId), {
      body: JSON.stringify(options),
      reason,
    });
  }
  deleteGuildEmoji(guildId: string, emojiId: string, reason?: string): Promise<void> {
    return this.#rest.delete(EmojiRouter.Routes.guildEmojiByIdEndpoint(guildId, emojiId), {
      reason,
    });
  }
  fetchApplicationEmojis(applicationId: string): Promise<ApplicationEmojisResponse> {
    return this.#rest.get(EmojiRouter.Routes.applicationEmojisEndpoint(applicationId));
  }
  fetchApplicationEmoji(applicationId: string, emojiId: string): Promise<EmojiEntity> {
    return this.#rest.get(EmojiRouter.Routes.applicationEmojiByIdEndpoint(applicationId, emojiId));
  }
  async createApplicationEmoji(
    applicationId: string,
    options: ApplicationEmojiCreateOptions,
    reason?: string,
  ): Promise<EmojiEntity> {
    const processedOptions = { ...options };
    if (processedOptions.image) {
      processedOptions.image = await this.#rest.toDataUri(processedOptions.image);
    }
    return this.#rest.post(EmojiRouter.Routes.applicationEmojisEndpoint(applicationId), {
      body: JSON.stringify(processedOptions),
      reason,
    });
  }
  updateApplicationEmoji(
    applicationId: string,
    emojiId: string,
    options: ApplicationEmojiUpdateOptions,
    reason?: string,
  ): Promise<EmojiEntity> {
    return this.#rest.patch(
      EmojiRouter.Routes.applicationEmojiByIdEndpoint(applicationId, emojiId),
      { body: JSON.stringify(options), reason },
    );
  }
  deleteApplicationEmoji(applicationId: string, emojiId: string, reason?: string): Promise<void> {
    return this.#rest.delete(
      EmojiRouter.Routes.applicationEmojiByIdEndpoint(applicationId, emojiId),
      { reason },
    );
  }
}
