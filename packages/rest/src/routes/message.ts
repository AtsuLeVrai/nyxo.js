import type {
  Integer,
  MessageEntity,
  Snowflake,
  UserEntity,
} from "@nyxjs/core";
import type { FileEntity } from "../types/index.js";
import { BaseRouter } from "./base.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/message#create-message-jsonform-params}
 */
export interface MessageCreateEntity
  extends Partial<
    Pick<
      MessageEntity,
      | "content"
      | "nonce"
      | "tts"
      | "embeds"
      | "message_reference"
      | "components"
      | "attachments"
      | "flags"
      | "poll"
    >
  > {
  sticker_ids?: Snowflake[];
  files?: FileEntity[];
  payload_json?: string;
  enforce_nonce?: boolean;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#get-channel-messages-query-string-params}
 */
export interface MessageQueryEntity {
  around?: Snowflake;
  before?: Snowflake;
  after?: Snowflake;
  limit?: Integer;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#get-reactions-reaction-types}
 */
export enum ReactionTypeFlag {
  Normal = 0,
  Burst = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#get-reactions-query-string-params}
 */
export interface GetReactionsQueryEntity {
  type?: ReactionTypeFlag;
  after?: Snowflake;
  limit?: Integer;
}

export class MessageRouter extends BaseRouter {
  static readonly routes = {
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
      userId: Snowflake = "@me" as Snowflake,
    ): `/channels/${Snowflake}/messages/${Snowflake}/reactions/${string}/${Snowflake}` => {
      return `/channels/${channelId}/messages/${messageId}/reactions/${emoji}/${userId}` as const;
    },
    bulkDelete: (
      channelId: Snowflake,
    ): `/channels/${Snowflake}/messages/bulk-delete` => {
      return `/channels/${channelId}/messages/bulk-delete` as const;
    },
  } as const;
  static readonly CONTENT_MAX_LENGTH = 2000;
  static readonly EMBEDS_MAX = 10;
  static readonly EMBEDS_TOTAL_CHARS = 6000;
  static readonly BULK_DELETE_MIN = 2;
  static readonly BULK_DELETE_MAX = 100;
  static readonly BULK_DELETE_MAX_AGE = 14 * 24 * 60 * 60 * 1000;

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel-messages}
   */
  getMessages(
    channelId: Snowflake,
    query?: MessageQueryEntity,
  ): Promise<MessageEntity[]> {
    return this.get(MessageRouter.routes.channelMessages(channelId), {
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
    return this.get(MessageRouter.routes.channelMessage(channelId, messageId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#create-message}
   */
  createMessage(
    channelId: Snowflake,
    options: Omit<MessageCreateEntity, "payload_json">,
  ): Promise<MessageEntity> {
    if (
      options.content &&
      options.content.length > MessageRouter.CONTENT_MAX_LENGTH
    ) {
      throw new Error(
        `Content exceeds maximum length of ${MessageRouter.CONTENT_MAX_LENGTH}`,
      );
    }

    if (options.embeds) {
      if (options.embeds.length > MessageRouter.EMBEDS_MAX) {
        throw new Error(
          `Maximum number of embeds exceeded (${MessageRouter.EMBEDS_MAX})`,
        );
      }
      let totalChars = 0;
      for (const embed of options.embeds) {
        totalChars += JSON.stringify(embed).length;
        if (totalChars > MessageRouter.EMBEDS_TOTAL_CHARS) {
          throw new Error(
            `Total embed characters exceed maximum (${MessageRouter.EMBEDS_TOTAL_CHARS})`,
          );
        }
      }
    }

    const { files, ...rest } = options;
    return this.post(MessageRouter.routes.channelMessages(channelId), {
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
    return this.post(MessageRouter.routes.crosspost(channelId, messageId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#create-reaction}
   */
  createReaction(
    channelId: Snowflake,
    messageId: Snowflake,
    emoji: string,
  ): Promise<void> {
    return this.put(
      MessageRouter.routes.userReaction(channelId, messageId, emoji),
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
    return this.delete(
      MessageRouter.routes.userReaction(channelId, messageId, emoji),
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
    return this.delete(
      MessageRouter.routes.userReaction(channelId, messageId, emoji, userId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#get-reactions}
   */
  getReactions(
    channelId: Snowflake,
    messageId: Snowflake,
    emoji: string,
    query?: GetReactionsQueryEntity,
  ): Promise<UserEntity[]> {
    return this.get(
      MessageRouter.routes.reactions(channelId, messageId, emoji),
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
    return this.delete(
      MessageRouter.routes.reactions(channelId, messageId, ""),
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
    return this.delete(
      MessageRouter.routes.reactions(channelId, messageId, emoji),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#edit-message}
   */
  editMessage(
    channelId: Snowflake,
    messageId: Snowflake,
    options: Partial<MessageCreateEntity>,
  ): Promise<MessageEntity> {
    if (
      options.content &&
      options.content.length > MessageRouter.CONTENT_MAX_LENGTH
    ) {
      throw new Error(
        `Content exceeds maximum length of ${MessageRouter.CONTENT_MAX_LENGTH}`,
      );
    }

    if (options.embeds) {
      if (options.embeds.length > MessageRouter.EMBEDS_MAX) {
        throw new Error(
          `Maximum number of embeds exceeded (${MessageRouter.EMBEDS_MAX})`,
        );
      }
      let totalChars = 0;
      for (const embed of options.embeds) {
        totalChars += JSON.stringify(embed).length;
        if (totalChars > MessageRouter.EMBEDS_TOTAL_CHARS) {
          throw new Error(
            `Total embed characters exceed maximum (${MessageRouter.EMBEDS_TOTAL_CHARS})`,
          );
        }
      }
    }

    return this.patch(
      MessageRouter.routes.channelMessage(channelId, messageId),
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
    return this.delete(
      MessageRouter.routes.channelMessage(channelId, messageId),
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
    if (
      messageIds.length < MessageRouter.BULK_DELETE_MIN ||
      messageIds.length > MessageRouter.BULK_DELETE_MAX
    ) {
      throw new Error(
        `Number of messages must be between ${MessageRouter.BULK_DELETE_MIN} and ${MessageRouter.BULK_DELETE_MAX}`,
      );
    }

    const twoWeeksAgo = Date.now() - MessageRouter.BULK_DELETE_MAX_AGE;
    for (const id of messageIds) {
      const timestamp = Number(BigInt(id) >> 22n) + 1420070400000;
      if (timestamp < twoWeeksAgo) {
        throw new Error("Messages must not be older than 2 weeks");
      }
    }

    if (new Set(messageIds).size !== messageIds.length) {
      throw new Error("Duplicate message IDs are not allowed");
    }

    return this.post(MessageRouter.routes.bulkDelete(channelId), {
      body: JSON.stringify({ messages: messageIds }),
      reason,
    });
  }
}
