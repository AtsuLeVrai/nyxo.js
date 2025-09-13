export interface EmojiEntity {
  id: string | null;
  name: string | null;
  roles?: string[];
  user?: UserEntity;
  require_colons?: boolean;
  managed?: boolean;
  animated?: boolean;
  available?: boolean;
}

export interface RESTCreateGuildEmojiJSONParams
  extends StripNull<Pick<EmojiEntity, "name">>,
    Pick<EmojiEntity, "roles"> {
  image: FileInput;
}

export type RESTModifyGuildEmojiJSONParams = Partial<
  Pick<RESTCreateGuildEmojiJSONParams, "name"> &
    Nullable<Pick<RESTCreateGuildEmojiJSONParams, "roles">>
>;

export type RESTCreateApplicationEmojiJSONParams = Omit<RESTCreateGuildEmojiJSONParams, "roles">;

export type RESTModifyApplicationEmojiJSONParams = Pick<RESTCreateGuildEmojiJSONParams, "name">;

export const EmojiRoutes = {
  listGuildEmojis: (guildId: string) => `/guilds/${guildId}/emojis` as const,
  getGuildEmoji: (guildId: string, emojiId: string) =>
    `/guilds/${guildId}/emojis/${emojiId}` as const,
  listApplicationEmojis: (applicationId: string) =>
    `/applications/${applicationId}/emojis` as const,
  getApplicationEmoji: (applicationId: string, emojiId: string) =>
    `/applications/${applicationId}/emojis/${emojiId}` as const,
} as const satisfies RouteBuilder;

export class EmojiRouter extends BaseRouter {
  listGuildEmojis(guildId: string): Promise<EmojiEntity[]> {
    return this.rest.get(EmojiRoutes.listGuildEmojis(guildId));
  }

  getGuildEmoji(guildId: string, emojiId: string): Promise<EmojiEntity> {
    return this.rest.get(EmojiRoutes.getGuildEmoji(guildId, emojiId));
  }

  async createGuildEmoji(
    guildId: string,
    options: RESTCreateGuildEmojiJSONParams,
    reason?: string,
  ): Promise<EmojiEntity> {
    const processedOptions = await this.processFileOptions(options, ["image"]);
    return this.rest.post(EmojiRoutes.listGuildEmojis(guildId), {
      body: JSON.stringify(processedOptions),
      reason,
    });
  }

  modifyGuildEmoji(
    guildId: string,
    emojiId: string,
    options: RESTModifyGuildEmojiJSONParams,
    reason?: string,
  ): Promise<EmojiEntity> {
    return this.rest.patch(EmojiRoutes.getGuildEmoji(guildId, emojiId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  deleteGuildEmoji(guildId: string, emojiId: string, reason?: string): Promise<void> {
    return this.rest.delete(EmojiRoutes.getGuildEmoji(guildId, emojiId), {
      reason,
    });
  }

  listApplicationEmojis(applicationId: string): Promise<{
    items: EmojiEntity[];
  }> {
    return this.rest.get(EmojiRoutes.listApplicationEmojis(applicationId));
  }

  getApplicationEmoji(applicationId: string, emojiId: string): Promise<EmojiEntity> {
    return this.rest.get(EmojiRoutes.getApplicationEmoji(applicationId, emojiId));
  }

  async createApplicationEmoji(
    applicationId: string,
    options: RESTCreateApplicationEmojiJSONParams,
    reason?: string,
  ): Promise<EmojiEntity> {
    const processedOptions = await this.processFileOptions(options, ["image"]);
    return this.rest.post(EmojiRoutes.listApplicationEmojis(applicationId), {
      body: JSON.stringify(processedOptions),
      reason,
    });
  }

  modifyApplicationEmoji(
    applicationId: string,
    emojiId: string,
    options: RESTModifyApplicationEmojiJSONParams,
    reason?: string,
  ): Promise<EmojiEntity> {
    return this.rest.patch(EmojiRoutes.getApplicationEmoji(applicationId, emojiId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  deleteApplicationEmoji(applicationId: string, emojiId: string, reason?: string): Promise<void> {
    return this.rest.delete(EmojiRoutes.getApplicationEmoji(applicationId, emojiId), {
      reason,
    });
  }
}
