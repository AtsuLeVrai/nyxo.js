import type {
  ActionRowEntity,
  AllowedMentionsEntity,
  AttachmentEntity,
  EmbedEntity,
  MessageEntity,
  MessageReferenceEntity,
  PollCreateRequestEntity,
  Snowflake,
  UserEntity,
} from "@nyxjs/core";
import type { Rest } from "../core/index.js";
import type { ImageData } from "../types/index.js";

interface MessageCreate {
  content?: string;
  nonce?: string | number;
  tts?: boolean;
  embeds?: EmbedEntity[];
  allowed_mentions?: AllowedMentionsEntity;
  message_reference?: MessageReferenceEntity;
  components?: ActionRowEntity[];
  sticker_ids?: Snowflake[];
  files?: ImageData[];
  payload_json?: string;
  attachments?: AttachmentEntity[];
  flags?: number;
  enforce_nonce?: boolean;
  poll?: PollCreateRequestEntity;
}

interface MessageQuery {
  around?: Snowflake;
  before?: Snowflake;
  after?: Snowflake;
  limit?: number;
}

interface GetReactionsQuery {
  type?: number;
  after?: Snowflake;
  limit?: number;
}

export class MessageRoutes {
  static routes = {
    channelMessages: (
      channelId: Snowflake,
    ): `/channels/${Snowflake}/messages` => {
      return `/channels/${channelId}/messages` as const;
    },
    channelMessage: (
      channelId: Snowflake,
      messageId: Snowflake,
    ): `/channels/${Snowflake}/messages/${Snowflake}` => {
      return `/channels/${channelId}/messages/${messageId}` as const;
    },
    crosspost: (
      channelId: Snowflake,
      messageId: Snowflake,
    ): `/channels/${Snowflake}/messages/${Snowflake}/crosspost` => {
      return `/channels/${channelId}/messages/${messageId}/crosspost` as const;
    },
    reactions: (
      channelId: Snowflake,
      messageId: Snowflake,
      emoji: string,
    ): `/channels/${Snowflake}/messages/${Snowflake}/reactions/${string}` => {
      return `/channels/${channelId}/messages/${messageId}/reactions/${emoji}` as const;
    },
    userReaction: (
      channelId: Snowflake,
      messageId: Snowflake,
      emoji: string,
      userId: Snowflake = "@me",
    ): `/channels/${Snowflake}/messages/${Snowflake}/reactions/${string}/${Snowflake}` => {
      return `/channels/${channelId}/messages/${messageId}/reactions/${emoji}/${userId}` as const;
    },
    bulkDelete: (
      channelId: Snowflake,
    ): `/channels/${Snowflake}/messages/bulk-delete` => {
      return `/channels/${channelId}/messages/bulk-delete` as const;
    },
  } as const;

  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel-messages}
   */
  getMessages(
    channelId: Snowflake,
    query?: MessageQuery,
  ): Promise<MessageEntity[]> {
    return this.#rest.get(MessageRoutes.routes.channelMessages(channelId), {
      query,
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
      MessageRoutes.routes.channelMessage(channelId, messageId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#create-message}
   */
  createMessage(
    channelId: Snowflake,
    options: MessageCreate,
  ): Promise<MessageEntity> {
    return this.#rest.post(MessageRoutes.routes.channelMessages(channelId), {
      body: JSON.stringify(options),
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
      MessageRoutes.routes.crosspost(channelId, messageId),
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
      MessageRoutes.routes.userReaction(channelId, messageId, emoji),
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
      MessageRoutes.routes.userReaction(channelId, messageId, emoji),
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
      MessageRoutes.routes.userReaction(channelId, messageId, emoji, userId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#get-reactions}
   */
  getReactions(
    channelId: Snowflake,
    messageId: Snowflake,
    emoji: string,
    query?: GetReactionsQuery,
  ): Promise<UserEntity[]> {
    return this.#rest.get(
      MessageRoutes.routes.reactions(channelId, messageId, emoji),
      { query },
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
      MessageRoutes.routes.reactions(channelId, messageId, ""),
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
      MessageRoutes.routes.reactions(channelId, messageId, emoji),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#edit-message}
   */
  editMessage(
    channelId: Snowflake,
    messageId: Snowflake,
    options: Partial<MessageCreate>,
  ): Promise<MessageEntity> {
    return this.#rest.patch(
      MessageRoutes.routes.channelMessage(channelId, messageId),
      {
        body: JSON.stringify(options),
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
      MessageRoutes.routes.channelMessage(channelId, messageId),
      { reason },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#bulk-delete-messages}
   */
  bulkDeleteMessages(
    channelId: Snowflake,
    messageIds: Snowflake[],
    reason?: string,
  ): Promise<void> {
    return this.#rest.post(MessageRoutes.routes.bulkDelete(channelId), {
      body: JSON.stringify({ messages: messageIds }),
      reason,
    });
  }
}
