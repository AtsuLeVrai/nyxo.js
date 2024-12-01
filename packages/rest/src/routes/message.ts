import type {
  Integer,
  MessageEntity,
  Snowflake,
  UserEntity,
} from "@nyxjs/core";
import type { ImageData } from "../types/index.js";
import { Router } from "./router.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/message#create-message-jsonform-params}
 */
export interface MessageCreate
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
  files?: ImageData[];
  payload_json?: string;
  enforce_nonce?: boolean;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#get-channel-messages-query-string-params}
 */
export interface MessageQuery {
  around?: Snowflake;
  before?: Snowflake;
  after?: Snowflake;
  limit?: Integer;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#get-reactions-reaction-types}
 */
export enum ReactionType {
  Normal = 0,
  Burst = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#get-reactions-query-string-params}
 */
interface GetReactionsQuery {
  type?: ReactionType;
  after?: Snowflake;
  limit?: Integer;
}

export class MessageRouter extends Router {
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

  /**
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel-messages}
   */
  getMessages(
    channelId: Snowflake,
    query?: MessageQuery,
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
    options: MessageCreate,
  ): Promise<MessageEntity> {
    return this.post(MessageRouter.routes.channelMessages(channelId), {
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
    query?: GetReactionsQuery,
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
    options: Partial<MessageCreate>,
  ): Promise<MessageEntity> {
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
    return this.post(MessageRouter.routes.bulkDelete(channelId), {
      body: JSON.stringify({ messages: messageIds }),
      reason,
    });
  }
}
