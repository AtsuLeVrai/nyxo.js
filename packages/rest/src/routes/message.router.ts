import type {
  ActionRowEntity,
  AllowedMentionsEntity,
  AttachmentEntity,
  EmbedEntity,
  MessageEntity,
  MessageFlags,
  MessageReferenceEntity,
  PollCreateRequestEntity,
  Snowflake,
  UserEntity,
} from "@nyxjs/core";
import type { Rest } from "../core/index.js";
import type { FileInput } from "../handlers/index.js";

/**
 * Interface for query parameters when retrieving channel messages
 * Defines pagination parameters for fetching messages from a channel
 *
 * @see {@link https://discord.com/developers/docs/resources/message#get-channel-messages-query-string-params}
 */
export interface GetChannelMessagesQuerySchema {
  /**
   * Get messages around this message ID
   * This parameter is mutually exclusive with before and after
   */
  around?: Snowflake;

  /**
   * Get messages before this message ID
   * This parameter is mutually exclusive with around and after
   */
  before?: Snowflake;

  /**
   * Get messages after this message ID
   * This parameter is mutually exclusive with around and before
   */
  after?: Snowflake;

  /**
   * Maximum number of messages to return (1-100)
   * Defaults to 50 if not specified
   */
  limit?: number;
}

/**
 * Interface for creating a new message in a channel
 * Defines the parameters for sending messages via Discord's API
 * At least one of content, embeds, sticker_ids, components, files, or poll is required
 *
 * @see {@link https://discord.com/developers/docs/resources/message#create-message-jsonform-params}
 */
export interface CreateMessageSchema {
  /**
   * Message content (up to 2000 characters)
   */
  content?: string;

  /**
   * Used to verify a message was sent (up to 25 characters)
   * Can be an integer or string that will appear in the Message Create event
   */
  nonce?: string | number;

  /**
   * Whether this is a text-to-speech message
   */
  tts?: boolean;

  /**
   * Rich embedded content for the message (up to 10 embeds)
   */
  embeds?: EmbedEntity[];

  /**
   * Controls mentions in the message
   */
  allowed_mentions?: AllowedMentionsEntity;

  /**
   * Include to make the message a reply to another message
   */
  message_reference?: MessageReferenceEntity;

  /**
   * Interactive components to include with the message
   */
  components?: ActionRowEntity[];

  /**
   * IDs of up to 3 stickers to send in the message
   */
  sticker_ids?: Snowflake[];

  /**
   * File contents to be attached to the message
   */
  files?: FileInput | FileInput[];

  /**
   * @deprecated Do not use `payload_json`. This is done automatically!
   */
  payload_json?: string;

  /**
   * Information about attachments (up to 10)
   */
  attachments?: AttachmentEntity[];

  /**
   * Message flags combined as a bitfield
   * Only SUPPRESS_EMBEDS and SUPPRESS_NOTIFICATIONS can be set
   */
  flags?: MessageFlags;

  /**
   * If true and nonce is present, it will be checked for uniqueness
   * If another message was created with the same nonce, that message will be returned
   */
  enforce_nonce?: boolean;

  /**
   * Poll to include with the message
   */
  poll?: PollCreateRequestEntity;
}

/**
 * Types of reactions that can be retrieved
 *
 * @see {@link https://discord.com/developers/docs/resources/message#get-reactions-reaction-types}
 */
export enum ReactionTypeFlag {
  /** Normal reaction */
  Normal = 0,

  /** Burst/Super reaction */
  Burst = 1,
}

/**
 * Interface for query parameters when retrieving reactions on a message
 *
 * @see {@link https://discord.com/developers/docs/resources/message#get-reactions-query-string-params}
 */
export interface GetReactionsQuerySchema {
  /**
   * Type of reaction to get (normal or burst)
   * Defaults to ReactionTypeFlag.Normal if not specified
   */
  type?: ReactionTypeFlag;

  /**
   * Get users after this user ID for pagination
   */
  after?: Snowflake;

  /**
   * Maximum number of users to return (1-100)
   * Defaults to 25 if not specified
   */
  limit?: number;
}

/**
 * Interface for editing an existing message
 * Reuses fields from CreateMessageSchema but only includes those that can be edited
 *
 * @see {@link https://discord.com/developers/docs/resources/message#edit-message-jsonform-params}
 */
export type EditMessageSchema = Pick<
  CreateMessageSchema,
  | "content"
  | "embeds"
  | "flags"
  | "allowed_mentions"
  | "components"
  | "files"
  | "payload_json"
  | "attachments"
>;

/**
 * Interface for bulk deleting messages
 *
 * @see {@link https://discord.com/developers/docs/resources/message#bulk-delete-messages-json-params}
 */
export interface BulkDeleteMessagesSchema {
  /**
   * Array of message IDs to delete (2-100)
   * Messages cannot be older than 2 weeks
   */
  messages: Snowflake[];
}

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

  readonly #rest: Rest;

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
