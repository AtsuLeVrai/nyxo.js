import type { MessageEntity, Snowflake, UserEntity } from "@nyxjs/core";
import type { Rest } from "../core/index.js";
import type {
  BulkDeleteMessagesSchema,
  CreateMessageSchema,
  EditMessageSchema,
  GetChannelMessagesQuerySchema,
  GetReactionsQuerySchema,
} from "../schemas/index.js";

/**
 * Router class for Discord Message-related endpoints
 * Provides methods to create, retrieve, modify, and delete messages in channels
 *
 * @see {@link https://discord.com/developers/docs/resources/message}
 */
export class MessageRouter {
  /**
   * Collection of route URLs for message-related endpoints
   */
  static readonly ROUTES = {
    /**
     * Route for channel messages operations
     * @param channelId - The ID of the channel
     * @returns `/channels/{channel.id}/messages` route
     * @see {@link https://discord.com/developers/docs/resources/message#get-channel-messages}
     */
    channelMessages: (channelId: Snowflake) =>
      `/channels/${channelId}/messages` as const,

    /**
     * Route for operations on a specific message
     * @param channelId - The ID of the channel
     * @param messageId - The ID of the message
     * @returns `/channels/{channel.id}/messages/{message.id}` route
     * @see {@link https://discord.com/developers/docs/resources/message#get-channel-message}
     */
    channelMessage: (channelId: Snowflake, messageId: Snowflake) =>
      `/channels/${channelId}/messages/${messageId}` as const,

    /**
     * Route for crossposting a message
     * @param channelId - The ID of the channel
     * @param messageId - The ID of the message
     * @returns `/channels/{channel.id}/messages/{message.id}/crosspost` route
     * @see {@link https://discord.com/developers/docs/resources/message#crosspost-message}
     */
    channelMessageCrosspost: (channelId: Snowflake, messageId: Snowflake) =>
      `/channels/${channelId}/messages/${messageId}/crosspost` as const,

    /**
     * Route for reactions on a message
     * @param channelId - The ID of the channel
     * @param messageId - The ID of the message
     * @param emoji - The emoji to react with (URL encoded)
     * @returns `/channels/{channel.id}/messages/{message.id}/reactions/{emoji}` route
     * @see {@link https://discord.com/developers/docs/resources/message#get-reactions}
     */
    channelMessageReactions: (
      channelId: Snowflake,
      messageId: Snowflake,
      emoji: string,
    ) =>
      `/channels/${channelId}/messages/${messageId}/reactions/${emoji}` as const,

    /**
     * Route for user-specific reactions on a message
     * @param channelId - The ID of the channel
     * @param messageId - The ID of the message
     * @param emoji - The emoji to react with (URL encoded)
     * @param userId - The ID of the user (defaults to @me for current user)
     * @returns `/channels/{channel.id}/messages/{message.id}/reactions/{emoji}/{user.id}` route
     * @see {@link https://discord.com/developers/docs/resources/message#delete-user-reaction}
     */
    channelMessageUserReaction: (
      channelId: Snowflake,
      messageId: Snowflake,
      emoji: string,
      userId: Snowflake = "@me",
    ) =>
      `/channels/${channelId}/messages/${messageId}/reactions/${emoji}/${userId}` as const,

    /**
     * Route for bulk deleting messages
     * @param channelId - The ID of the channel
     * @returns `/channels/{channel.id}/messages/bulk-delete` route
     * @see {@link https://discord.com/developers/docs/resources/message#bulk-delete-messages}
     */
    channelMessagesBulkDelete: (channelId: Snowflake) =>
      `/channels/${channelId}/messages/bulk-delete` as const,
  } as const;

  /** The REST client used to make requests to the Discord API */
  readonly #rest: Rest;

  /**
   * Creates a new MessageRouter instance
   * @param rest - The REST client used to make requests to the Discord API
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Retrieves a list of messages from a channel
   * Requires VIEW_CHANNEL permission. If the channel is a voice channel, also requires CONNECT.
   * Requires READ_MESSAGE_HISTORY permission or no messages will be returned.
   *
   * @param channelId - The ID of the channel to get messages from
   * @param query - Query parameters for pagination
   * @param query.around - Get messages around this message ID
   * @param query.before - Get messages before this message ID
   * @param query.after - Get messages after this message ID
   * @param query.limit - Maximum number of messages to return (1-100)
   * @returns An array of message objects
   * @throws Error if validation of query parameters fails
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel-messages}
   */
  getMessages(
    channelId: Snowflake,
    query: GetChannelMessagesQuerySchema = {},
  ): Promise<MessageEntity[]> {
    return this.#rest.get(MessageRouter.ROUTES.channelMessages(channelId), {
      query,
    });
  }

  /**
   * Retrieves a specific message from a channel
   * Requires VIEW_CHANNEL and READ_MESSAGE_HISTORY permissions.
   * If the channel is a voice channel, also requires CONNECT.
   *
   * @param channelId - The ID of the channel containing the message
   * @param messageId - The ID of the message to retrieve
   * @returns The message object
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
   * Creates a new message in a channel
   * Requires SEND_MESSAGES permission. If sending TTS, requires SEND_TTS_MESSAGES.
   * If replying to a message, requires READ_MESSAGE_HISTORY.
   * At least one of content, embeds, sticker_ids, components, files, or poll is required.
   *
   * @param channelId - The ID of the channel to send the message in
   * @param options - The message content and properties
   * @returns The created message object
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/channel#create-message}
   */
  createMessage(
    channelId: Snowflake,
    options: CreateMessageSchema,
  ): Promise<MessageEntity> {
    const { files, ...rest } = options;
    return this.#rest.post(MessageRouter.ROUTES.channelMessages(channelId), {
      body: JSON.stringify(rest),
      files: files,
    });
  }

  /**
   * Crossposts a message from an announcement channel to following channels
   * Requires SEND_MESSAGES permission. If not the message author, also requires MANAGE_MESSAGES.
   * The channel must be an announcement channel.
   *
   * @param channelId - The ID of the announcement channel
   * @param messageId - The ID of the message to crosspost
   * @returns The crossposted message object
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
   * Creates a reaction on a message
   * Requires READ_MESSAGE_HISTORY permission.
   * If nobody has reacted with this emoji yet, also requires ADD_REACTIONS permission.
   *
   * @param channelId - The ID of the channel containing the message
   * @param messageId - The ID of the message to react to
   * @param emoji - The emoji to react with (URL encoded)
   * @returns A Promise that resolves when the reaction is added
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
   * Deletes the current user's reaction from a message
   *
   * @param channelId - The ID of the channel containing the message
   * @param messageId - The ID of the message to remove reaction from
   * @param emoji - The emoji to remove (URL encoded)
   * @returns A Promise that resolves when the reaction is removed
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
   * Deletes another user's reaction from a message
   * Requires MANAGE_MESSAGES permission.
   *
   * @param channelId - The ID of the channel containing the message
   * @param messageId - The ID of the message to remove reaction from
   * @param emoji - The emoji to remove (URL encoded)
   * @param userId - The ID of the user whose reaction to remove
   * @returns A Promise that resolves when the reaction is removed
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
   * Gets a list of users who reacted to a message with a specific emoji
   *
   * @param channelId - The ID of the channel containing the message
   * @param messageId - The ID of the message to get reactions for
   * @param emoji - The emoji to get reactions for (URL encoded)
   * @param query - Query parameters for pagination and reaction type
   * @param query.type - Type of reaction (normal or burst/super)
   * @param query.after - Get users after this user ID
   * @param query.limit - Maximum number of users to return (1-100)
   * @returns An array of user objects who reacted with the emoji
   * @throws Error if validation of query parameters fails
   * @see {@link https://discord.com/developers/docs/resources/channel#get-reactions}
   */
  getReactions(
    channelId: Snowflake,
    messageId: Snowflake,
    emoji: string,
    query: GetReactionsQuerySchema = {},
  ): Promise<UserEntity[]> {
    return this.#rest.get(
      MessageRouter.ROUTES.channelMessageReactions(channelId, messageId, emoji),
      { query },
    );
  }

  /**
   * Deletes all reactions from a message
   * Requires MANAGE_MESSAGES permission.
   *
   * @param channelId - The ID of the channel containing the message
   * @param messageId - The ID of the message to remove all reactions from
   * @returns A Promise that resolves when all reactions are removed
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
   * Deletes all reactions for a specific emoji from a message
   * Requires MANAGE_MESSAGES permission.
   *
   * @param channelId - The ID of the channel containing the message
   * @param messageId - The ID of the message to remove emoji reactions from
   * @param emoji - The emoji to remove all reactions for (URL encoded)
   * @returns A Promise that resolves when the reactions are removed
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
   * Edits a previously sent message
   * The original message author can edit content, embeds, and flags.
   * Other users with MANAGE_MESSAGES can only edit flags.
   * All files specified in the attachments array will be kept, and new files can be added.
   *
   * @param channelId - The ID of the channel containing the message
   * @param messageId - The ID of the message to edit
   * @param options - The new message content and properties
   * @returns The edited message object
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/channel#edit-message}
   */
  editMessage(
    channelId: Snowflake,
    messageId: Snowflake,
    options: EditMessageSchema,
  ): Promise<MessageEntity> {
    const { files, ...rest } = options;
    return this.#rest.patch(
      MessageRouter.ROUTES.channelMessage(channelId, messageId),
      {
        body: JSON.stringify(rest),
        files: files,
      },
    );
  }

  /**
   * Deletes a message
   * If the message was not sent by the current user, requires MANAGE_MESSAGES permission.
   *
   * @param channelId - The ID of the channel containing the message
   * @param messageId - The ID of the message to delete
   * @param reason - Reason for deleting the message (for audit logs)
   * @returns A Promise that resolves when the message is deleted
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
   * Bulk deletes multiple messages in a single request
   * Requires MANAGE_MESSAGES permission.
   * Messages must not be older than 2 weeks.
   *
   * @param channelId - The ID of the channel to delete messages from
   * @param options - Object containing array of message IDs to delete
   * @param reason - Reason for deleting the messages (for audit logs)
   * @returns A Promise that resolves when the messages are deleted
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/channel#bulk-delete-messages}
   */
  bulkDeleteMessages(
    channelId: Snowflake,
    options: BulkDeleteMessagesSchema,
    reason?: string,
  ): Promise<void> {
    return this.#rest.post(
      MessageRouter.ROUTES.channelMessagesBulkDelete(channelId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }
}
