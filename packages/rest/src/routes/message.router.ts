import type { MessageEntity, Snowflake, UserEntity } from "@nyxjs/core";
import { fromZodError } from "zod-validation-error";
import type { Rest } from "../core/index.js";
import {
  BulkDeleteMessagesSchema,
  CreateMessageSchema,
  EditMessageSchema,
  GetChannelMessagesQuerySchema,
  GetReactionsQuerySchema,
} from "../schemas/index.js";

export class MessageRouter {
  static readonly ROUTES = {
    channelMessages: (channelId: Snowflake) =>
      `/channels/${channelId}/messages` as const,
    channelMessage: (channelId: Snowflake, messageId: Snowflake) =>
      `/channels/${channelId}/messages/${messageId}` as const,
    channelMessageCrosspost: (channelId: Snowflake, messageId: Snowflake) =>
      `/channels/${channelId}/messages/${messageId}/crosspost` as const,
    channelMessageReactions: (
      channelId: Snowflake,
      messageId: Snowflake,
      emoji: string,
    ) =>
      `/channels/${channelId}/messages/${messageId}/reactions/${emoji}` as const,
    channelMessageUserReaction: (
      channelId: Snowflake,
      messageId: Snowflake,
      emoji: string,
      userId: Snowflake = "@me",
    ) =>
      `/channels/${channelId}/messages/${messageId}/reactions/${emoji}/${userId}` as const,
    channelMessagesBulkDelete: (channelId: Snowflake) =>
      `/channels/${channelId}/messages/bulk-delete` as const,
  } as const;

  #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel-messages}
   */
  getMessages(
    channelId: Snowflake,
    query: GetChannelMessagesQuerySchema = {},
  ): Promise<MessageEntity[]> {
    const result = GetChannelMessagesQuerySchema.safeParse(query);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.get(MessageRouter.ROUTES.channelMessages(channelId), {
      query: result.data,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel-message}
   */
  getMessage(
    channelId: Snowflake,
    messageId: Snowflake,
  ): Promise<MessageEntity> {
    return this.#rest.get(
      MessageRouter.ROUTES.channelMessage(channelId, messageId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#create-message}
   */
  createMessage(
    channelId: Snowflake,
    options: CreateMessageSchema,
  ): Promise<MessageEntity> {
    const result = CreateMessageSchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    const { files, ...rest } = result.data;
    return this.#rest.post(MessageRouter.ROUTES.channelMessages(channelId), {
      body: JSON.stringify(rest),
      files: files,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#crosspost-message}
   */
  crosspostMessage(
    channelId: Snowflake,
    messageId: Snowflake,
  ): Promise<MessageEntity> {
    return this.#rest.post(
      MessageRouter.ROUTES.channelMessageCrosspost(channelId, messageId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#create-reaction}
   */
  createReaction(
    channelId: Snowflake,
    messageId: Snowflake,
    emoji: string,
  ): Promise<void> {
    return this.#rest.put(
      MessageRouter.ROUTES.channelMessageUserReaction(
        channelId,
        messageId,
        emoji,
      ),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-own-reaction}
   */
  deleteOwnReaction(
    channelId: Snowflake,
    messageId: Snowflake,
    emoji: string,
  ): Promise<void> {
    return this.#rest.delete(
      MessageRouter.ROUTES.channelMessageUserReaction(
        channelId,
        messageId,
        emoji,
      ),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-user-reaction}
   */
  deleteUserReaction(
    channelId: Snowflake,
    messageId: Snowflake,
    emoji: string,
    userId: Snowflake,
  ): Promise<void> {
    return this.#rest.delete(
      MessageRouter.ROUTES.channelMessageUserReaction(
        channelId,
        messageId,
        emoji,
        userId,
      ),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#get-reactions}
   */
  getReactions(
    channelId: Snowflake,
    messageId: Snowflake,
    emoji: string,
    query: GetReactionsQuerySchema = {},
  ): Promise<UserEntity[]> {
    const result = GetReactionsQuerySchema.safeParse(query);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.get(
      MessageRouter.ROUTES.channelMessageReactions(channelId, messageId, emoji),
      { query: result.data },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-all-reactions}
   */
  deleteAllReactions(
    channelId: Snowflake,
    messageId: Snowflake,
  ): Promise<void> {
    return this.#rest.delete(
      MessageRouter.ROUTES.channelMessageReactions(channelId, messageId, ""),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-all-reactions-for-emoji}
   */
  deleteAllReactionsForEmoji(
    channelId: Snowflake,
    messageId: Snowflake,
    emoji: string,
  ): Promise<void> {
    return this.#rest.delete(
      MessageRouter.ROUTES.channelMessageReactions(channelId, messageId, emoji),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#edit-message}
   */
  editMessage(
    channelId: Snowflake,
    messageId: Snowflake,
    options: EditMessageSchema,
  ): Promise<MessageEntity> {
    const result = EditMessageSchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    const { files, ...rest } = result.data;
    return this.#rest.patch(
      MessageRouter.ROUTES.channelMessage(channelId, messageId),
      {
        body: JSON.stringify(rest),
        files: files,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-message}
   */
  deleteMessage(
    channelId: Snowflake,
    messageId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.#rest.delete(
      MessageRouter.ROUTES.channelMessage(channelId, messageId),
      { reason },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#bulk-delete-messages}
   */
  bulkDeleteMessages(
    channelId: Snowflake,
    options: BulkDeleteMessagesSchema,
    reason?: string,
  ): Promise<void> {
    const result = BulkDeleteMessagesSchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.post(
      MessageRouter.ROUTES.channelMessagesBulkDelete(channelId),
      {
        body: JSON.stringify(result.data),
        reason,
      },
    );
  }
}
