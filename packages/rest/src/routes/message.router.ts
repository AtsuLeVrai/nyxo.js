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
 * Interface for query parameters when retrieving channel messages.
 *
 * These parameters control pagination and fetching strategy when retrieving
 * messages from a channel. They offer three different methods of pagination
 * that are mutually exclusive.
 *
 * @see {@link https://discord.com/developers/docs/resources/message#get-channel-messages-query-string-params}
 */
export interface GetChannelMessagesQuerySchema {
  /**
   * Get messages around this message ID.
   *
   * Returns messages before and after the specified message ID.
   * This is useful for showing context around a specific message.
   * This parameter is mutually exclusive with before and after.
   */
  around?: Snowflake;

  /**
   * Get messages before this message ID.
   *
   * Returns newer messages that came before the specified message ID.
   * Used for scrolling back to older messages (upward pagination).
   * This parameter is mutually exclusive with around and after.
   */
  before?: Snowflake;

  /**
   * Get messages after this message ID.
   *
   * Returns older messages that came after the specified message ID.
   * Used for scrolling forward to newer messages (downward pagination).
   * This parameter is mutually exclusive with around and before.
   */
  after?: Snowflake;

  /**
   * Maximum number of messages to return (1-100).
   *
   * Controls the page size for pagination.
   * Defaults to 50 if not specified.
   */
  limit?: number;
}

/**
 * Interface for creating a new message in a channel.
 *
 * This interface defines all possible parameters when sending a message through
 * Discord's API. At least one of content, embeds, sticker_ids, components,
 * files, or poll is required.
 *
 * @see {@link https://discord.com/developers/docs/resources/message#create-message-jsonform-params}
 */
export interface CreateMessageSchema {
  /**
   * Message content (up to 2000 characters).
   *
   * The text content of the message. Can include Markdown formatting,
   * emoji, mentions, and other formatting.
   */
  content?: string;

  /**
   * Used to verify a message was sent (up to 25 characters).
   *
   * Can be an integer or string that will appear in the Message Create event.
   * Useful for ensuring idempotent operations when sending messages.
   */
  nonce?: string | number;

  /**
   * Whether this is a text-to-speech message.
   *
   * When true, the message will be read aloud to users in the channel
   * who have text-to-speech enabled.
   */
  tts?: boolean;

  /**
   * Rich embedded content for the message (up to 10 embeds).
   *
   * Embeds are special rich content blocks that can contain
   * formatted text, images, fields, and other structured data.
   */
  embeds?: EmbedEntity[];

  /**
   * Controls mentions in the message.
   *
   * Allows customizing which mentions will trigger notifications,
   * useful for preventing unwanted pings to roles or everyone.
   */
  allowed_mentions?: AllowedMentionsEntity;

  /**
   * Include to make the message a reply to another message.
   *
   * Contains the ID of the message being replied to and other options
   * like whether to mention the user being replied to.
   */
  message_reference?: MessageReferenceEntity;

  /**
   * Interactive components to include with the message.
   *
   * Can include buttons, select menus, and other interactive elements
   * that users can interact with.
   */
  components?: ActionRowEntity[];

  /**
   * IDs of up to 3 stickers to send in the message.
   *
   * Stickers are small, expressive images that can be
   * included in messages.
   */
  sticker_ids?: Snowflake[];

  /**
   * File contents to be attached to the message.
   *
   * Can be a single file or array of files to upload with the message.
   * Maximum of 10 attachments.
   */
  files?: FileInput | FileInput[];

  /**
   * @deprecated Do not use `payload_json`. This is done automatically!
   */
  payload_json?: string;

  /**
   * Information about attachments (up to 10).
   *
   * Used to reference existing attachments when editing messages
   * or to define metadata about uploaded files.
   */
  attachments?: AttachmentEntity[];

  /**
   * Message flags combined as a bitfield.
   *
   * Controls special behaviors for the message.
   * Only SUPPRESS_EMBEDS and SUPPRESS_NOTIFICATIONS can be set when creating a message.
   */
  flags?: MessageFlags;

  /**
   * If true and nonce is present, it will be checked for uniqueness.
   *
   * When true, if another message was created with the same nonce,
   * that message will be returned instead of creating a new one.
   * Useful for ensuring idempotent operations.
   */
  enforce_nonce?: boolean;

  /**
   * Poll to include with the message.
   *
   * Allows creating an interactive poll that users can vote on.
   * Includes the question, options, and configuration settings.
   */
  poll?: PollCreateRequestEntity;
}

/**
 * Types of reactions that can be retrieved.
 *
 * Defines the different types of reactions that can exist on a message.
 *
 * @see {@link https://discord.com/developers/docs/resources/message#get-reactions-reaction-types}
 */
export enum ReactionTypeFlag {
  /**
   * Normal reaction.
   *
   * Standard emoji reactions available to all users.
   */
  Normal = 0,

  /**
   * Burst/Super reaction.
   *
   * Premium reactions that have special effects and are
   * available to Nitro subscribers.
   */
  Burst = 1,
}

/**
 * Interface for query parameters when retrieving reactions on a message.
 *
 * These parameters control pagination and filtering when fetching
 * the users who have reacted to a message with a specific emoji.
 *
 * @see {@link https://discord.com/developers/docs/resources/message#get-reactions-query-string-params}
 */
export interface GetReactionsQuerySchema {
  /**
   * Type of reaction to get (normal or burst).
   *
   * Controls which type of reactions to retrieve.
   * Defaults to ReactionTypeFlag.Normal if not specified.
   */
  type?: ReactionTypeFlag;

  /**
   * Get users after this user ID for pagination.
   *
   * Used for pagination when retrieving more users
   * than can be returned in a single request.
   */
  after?: Snowflake;

  /**
   * Maximum number of users to return (1-100).
   *
   * Controls the maximum users returned in a single request.
   * Defaults to 25 if not specified.
   */
  limit?: number;
}

/**
 * Interface for editing an existing message.
 *
 * This interface includes only the fields from CreateMessageSchema
 * that can be modified after a message has been sent.
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
 * Interface for bulk deleting messages.
 *
 * This interface defines the parameters needed to delete
 * multiple messages in a single API call.
 *
 * @see {@link https://discord.com/developers/docs/resources/message#bulk-delete-messages-json-params}
 */
export interface BulkDeleteMessagesSchema {
  /**
   * Array of message IDs to delete (2-100).
   *
   * The list of message IDs to delete in a single operation.
   * Messages cannot be older than 2 weeks.
   * Must contain at least 2 and no more than 100 message IDs.
   */
  messages: Snowflake[];
}

/**
 * Router for Discord Message-related endpoints.
 *
 * This class provides methods to interact with Discord's message system,
 * allowing creation, retrieval, modification, and deletion of messages,
 * as well as management of reactions.
 *
 * @remarks
 * Messages are the basic building blocks of communication in Discord.
 * This router provides comprehensive access to message-related functionality,
 * including sending messages, retrieving message history, managing reactions,
 * and more complex operations like crossposting and bulk deletion.
 *
 * @see {@link https://discord.com/developers/docs/resources/message}
 */
export class MessageRouter {
  /**
   * API route constants for message-related endpoints.
   */
  static readonly MESSAGE_ROUTES = {
    /**
     * Route for channel messages operations.
     *
     * Used for getting message history or sending new messages.
     *
     * @param channelId - The ID of the channel
     * @returns The formatted API route string
     */
    channelMessagesEndpoint: (channelId: Snowflake) =>
      `/channels/${channelId}/messages` as const,

    /**
     * Route for operations on a specific message.
     *
     * Used for getting, editing, or deleting a specific message.
     *
     * @param channelId - The ID of the channel
     * @param messageId - The ID of the message
     * @returns The formatted API route string
     */
    channelMessageByIdEndpoint: (channelId: Snowflake, messageId: Snowflake) =>
      `/channels/${channelId}/messages/${messageId}` as const,

    /**
     * Route for crossposting a message.
     *
     * Used to publish a message to following channels.
     *
     * @param channelId - The ID of the channel
     * @param messageId - The ID of the message
     * @returns The formatted API route string
     */
    messagePublishEndpoint: (channelId: Snowflake, messageId: Snowflake) =>
      `/channels/${channelId}/messages/${messageId}/crosspost` as const,

    /**
     * Route for reactions on a message.
     *
     * Used for getting or removing reactions with a specific emoji.
     *
     * @param channelId - The ID of the channel
     * @param messageId - The ID of the message
     * @param emoji - The emoji to react with (URL encoded)
     * @returns The formatted API route string
     */
    messageReactionsEndpoint: (
      channelId: Snowflake,
      messageId: Snowflake,
      emoji: string,
    ) =>
      `/channels/${channelId}/messages/${messageId}/reactions/${emoji}` as const,

    /**
     * Route for user-specific reactions on a message.
     *
     * Used for adding or removing a specific user's reaction.
     *
     * @param channelId - The ID of the channel
     * @param messageId - The ID of the message
     * @param emoji - The emoji to react with (URL encoded)
     * @param userId - The ID of the user (defaults to @me for current user)
     * @returns The formatted API route string
     */
    userReactionEndpoint: (
      channelId: Snowflake,
      messageId: Snowflake,
      emoji: string,
      userId: Snowflake = "@me",
    ) =>
      `/channels/${channelId}/messages/${messageId}/reactions/${emoji}/${userId}` as const,

    /**
     * Route for bulk deleting messages.
     *
     * Used to delete multiple messages in a single operation.
     *
     * @param channelId - The ID of the channel
     * @returns The formatted API route string
     */
    bulkDeleteEndpoint: (channelId: Snowflake) =>
      `/channels/${channelId}/messages/bulk-delete` as const,
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new Message Router instance.
   *
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches a list of messages from a channel.
   *
   * This method retrieves messages from a channel, with support for
   * different pagination strategies through the query parameters.
   *
   * @param channelId - The ID of the channel to get messages from
   * @param query - Query parameters for pagination
   * @returns A promise resolving to an array of message objects
   * @throws {Error} Error if validation of query parameters fails or you lack permissions
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel-messages}
   *
   * @remarks
   * Requires VIEW_CHANNEL permission. If the channel is a voice channel, also requires CONNECT.
   * Requires READ_MESSAGE_HISTORY permission or no messages will be returned.
   */
  fetchMessages(
    channelId: Snowflake,
    query: GetChannelMessagesQuerySchema = {},
  ): Promise<MessageEntity[]> {
    return this.#rest.get(
      MessageRouter.MESSAGE_ROUTES.channelMessagesEndpoint(channelId),
      {
        query,
      },
    );
  }

  /**
   * Fetches a specific message from a channel.
   *
   * This method retrieves a single message by its ID within a specific channel.
   *
   * @param channelId - The ID of the channel containing the message
   * @param messageId - The ID of the message to retrieve
   * @returns A promise resolving to the message object
   * @throws {Error} Will throw an error if the message doesn't exist or you lack permissions
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel-message}
   *
   * @remarks
   * Requires VIEW_CHANNEL and READ_MESSAGE_HISTORY permissions.
   * If the channel is a voice channel, also requires CONNECT.
   */
  fetchMessage(
    channelId: Snowflake,
    messageId: Snowflake,
  ): Promise<MessageEntity> {
    return this.#rest.get(
      MessageRouter.MESSAGE_ROUTES.channelMessageByIdEndpoint(
        channelId,
        messageId,
      ),
    );
  }

  /**
   * Creates a new message in a channel.
   *
   * This method sends a message to a Discord channel with various optional
   * components such as text content, embeds, files, components, and more.
   *
   * @param channelId - The ID of the channel to send the message in
   * @param options - The message content and properties
   * @returns A promise resolving to the created message object
   * @throws {Error} Error if validation of options fails or you lack permissions
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#create-message}
   *
   * @remarks
   * Requires SEND_MESSAGES permission. If sending TTS, requires SEND_TTS_MESSAGES.
   * If replying to a message, requires READ_MESSAGE_HISTORY.
   * At least one of content, embeds, sticker_ids, components, files, or poll is required.
   */
  sendMessage(
    channelId: Snowflake,
    options: CreateMessageSchema,
  ): Promise<MessageEntity> {
    const { files, ...rest } = options;
    return this.#rest.post(
      MessageRouter.MESSAGE_ROUTES.channelMessagesEndpoint(channelId),
      {
        body: JSON.stringify(rest),
        files: files,
      },
    );
  }

  /**
   * Publishes a message from an announcement channel to following channels.
   *
   * This method "crossposts" a message, which makes it visible to users
   * in all channels that follow the announcement channel.
   *
   * @param channelId - The ID of the announcement channel
   * @param messageId - The ID of the message to crosspost
   * @returns A promise resolving to the crossposted message object
   * @throws {Error} Will throw an error if the channel isn't an announcement channel
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#crosspost-message}
   *
   * @remarks
   * Requires SEND_MESSAGES permission. If not the message author, also requires MANAGE_MESSAGES.
   * The channel must be an announcement channel (type 5).
   * Each message can only be crossposted once.
   */
  publishMessage(
    channelId: Snowflake,
    messageId: Snowflake,
  ): Promise<MessageEntity> {
    return this.#rest.post(
      MessageRouter.MESSAGE_ROUTES.messagePublishEndpoint(channelId, messageId),
    );
  }

  /**
   * Adds a reaction to a message.
   *
   * This method adds the bot's reaction to a message using the specified emoji.
   *
   * @param channelId - The ID of the channel containing the message
   * @param messageId - The ID of the message to react to
   * @param emoji - The emoji to react with (URL encoded)
   * @returns A promise that resolves when the reaction is added
   * @throws {Error} Will throw an error if you lack permissions or the emoji is invalid
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#create-reaction}
   *
   * @remarks
   * Requires READ_MESSAGE_HISTORY permission.
   * If nobody has reacted with this emoji yet, also requires ADD_REACTIONS permission.
   * For custom emojis, the format is `name:id` (e.g., `custom_emoji:123456789012345678`).
   * The emoji parameter should be URL-encoded if it contains special characters.
   */
  addReaction(
    channelId: Snowflake,
    messageId: Snowflake,
    emoji: string,
  ): Promise<void> {
    return this.#rest.put(
      MessageRouter.MESSAGE_ROUTES.userReactionEndpoint(
        channelId,
        messageId,
        emoji,
      ),
    );
  }

  /**
   * Removes the current user's reaction from a message.
   *
   * This method removes the bot's own reaction with the specified emoji
   * from a message.
   *
   * @param channelId - The ID of the channel containing the message
   * @param messageId - The ID of the message to remove reaction from
   * @param emoji - The emoji to remove (URL encoded)
   * @returns A promise that resolves when the reaction is removed
   * @throws {Error} Will throw an error if the reaction doesn't exist
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-own-reaction}
   *
   */
  removeOwnReaction(
    channelId: Snowflake,
    messageId: Snowflake,
    emoji: string,
  ): Promise<void> {
    return this.#rest.delete(
      MessageRouter.MESSAGE_ROUTES.userReactionEndpoint(
        channelId,
        messageId,
        emoji,
      ),
    );
  }

  /**
   * Removes another user's reaction from a message.
   *
   * This method removes a specific user's reaction with the specified emoji
   * from a message.
   *
   * @param channelId - The ID of the channel containing the message
   * @param messageId - The ID of the message to remove reaction from
   * @param emoji - The emoji to remove (URL encoded)
   * @param userId - The ID of the user whose reaction to remove
   * @returns A promise that resolves when the reaction is removed
   * @throws {Error} Will throw an error if you lack permissions or the reaction doesn't exist
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-user-reaction}
   *
   * @remarks
   * Requires MANAGE_MESSAGES permission.
   */
  removeUserReaction(
    channelId: Snowflake,
    messageId: Snowflake,
    emoji: string,
    userId: Snowflake,
  ): Promise<void> {
    return this.#rest.delete(
      MessageRouter.MESSAGE_ROUTES.userReactionEndpoint(
        channelId,
        messageId,
        emoji,
        userId,
      ),
    );
  }

  /**
   * Fetches a list of users who reacted to a message with a specific emoji.
   *
   * This method retrieves the users who have added the specified emoji
   * reaction to a message, with support for pagination.
   *
   * @param channelId - The ID of the channel containing the message
   * @param messageId - The ID of the message to get reactions for
   * @param emoji - The emoji to get reactions for (URL encoded)
   * @param query - Query parameters for pagination and reaction type
   * @returns A promise resolving to an array of user objects who reacted with the emoji
   * @throws {Error} Error if validation of query parameters fails
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#get-reactions}
   */
  fetchReactionUsers(
    channelId: Snowflake,
    messageId: Snowflake,
    emoji: string,
    query: GetReactionsQuerySchema = {},
  ): Promise<UserEntity[]> {
    return this.#rest.get(
      MessageRouter.MESSAGE_ROUTES.messageReactionsEndpoint(
        channelId,
        messageId,
        emoji,
      ),
      { query },
    );
  }

  /**
   * Removes all reactions from a message.
   *
   * This method clears all reactions of all types from a message.
   *
   * @param channelId - The ID of the channel containing the message
   * @param messageId - The ID of the message to remove all reactions from
   * @returns A promise that resolves when all reactions are removed
   * @throws {Error} Will throw an error if you lack permissions
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-all-reactions}
   *
   * @remarks
   * Requires MANAGE_MESSAGES permission.
   */
  removeAllReactions(
    channelId: Snowflake,
    messageId: Snowflake,
  ): Promise<void> {
    return this.#rest.delete(
      MessageRouter.MESSAGE_ROUTES.messageReactionsEndpoint(
        channelId,
        messageId,
        "",
      ),
    );
  }

  /**
   * Removes all reactions for a specific emoji from a message.
   *
   * This method clears all reactions of a specific emoji type from a message.
   *
   * @param channelId - The ID of the channel containing the message
   * @param messageId - The ID of the message to remove emoji reactions from
   * @param emoji - The emoji to remove all reactions for (URL encoded)
   * @returns A promise that resolves when the reactions are removed
   * @throws {Error} Will throw an error if you lack permissions
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-all-reactions-for-emoji}
   *
   * @remarks
   * Requires MANAGE_MESSAGES permission.
   */
  removeAllReactionsForEmoji(
    channelId: Snowflake,
    messageId: Snowflake,
    emoji: string,
  ): Promise<void> {
    return this.#rest.delete(
      MessageRouter.MESSAGE_ROUTES.messageReactionsEndpoint(
        channelId,
        messageId,
        emoji,
      ),
    );
  }

  /**
   * Updates a previously sent message.
   *
   * This method edits the content of an existing message, allowing changes
   * to text, embeds, components, and more.
   *
   * @param channelId - The ID of the channel containing the message
   * @param messageId - The ID of the message to edit
   * @param options - The new message content and properties
   * @returns A promise resolving to the edited message object
   * @throws {Error} Error if validation of options fails or you lack permissions
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#edit-message}
   *
   * @remarks
   * The original message author can edit content, embeds, and flags.
   * Other users with MANAGE_MESSAGES can only edit flags.
   * All files specified in the attachments array will be kept, and new files can be added.
   * If only removing attachments, specify an empty attachments array.
   */
  updateMessage(
    channelId: Snowflake,
    messageId: Snowflake,
    options: EditMessageSchema,
  ): Promise<MessageEntity> {
    const { files, ...rest } = options;
    return this.#rest.patch(
      MessageRouter.MESSAGE_ROUTES.channelMessageByIdEndpoint(
        channelId,
        messageId,
      ),
      {
        body: JSON.stringify(rest),
        files: files,
      },
    );
  }

  /**
   * Deletes a message.
   *
   * This method permanently removes a message from a channel.
   *
   * @param channelId - The ID of the channel containing the message
   * @param messageId - The ID of the message to delete
   * @param reason - Reason for deleting the message (for audit logs)
   * @returns A promise that resolves when the message is deleted
   * @throws {Error} Will throw an error if you lack permissions or the message doesn't exist
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-message}
   *
   * @remarks
   * If the message was not sent by the current user, requires MANAGE_MESSAGES permission.
   * Messages cannot be deleted if they are older than 2 weeks and were not sent by the current user.
   */
  deleteMessage(
    channelId: Snowflake,
    messageId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.#rest.delete(
      MessageRouter.MESSAGE_ROUTES.channelMessageByIdEndpoint(
        channelId,
        messageId,
      ),
      { reason },
    );
  }

  /**
   * Bulk deletes multiple messages in a single request.
   *
   * This method efficiently removes multiple messages from a channel
   * in a single operation.
   *
   * @param channelId - The ID of the channel to delete messages from
   * @param options - Object containing array of message IDs to delete
   * @param reason - Reason for deleting the messages (for audit logs)
   * @returns A promise that resolves when the messages are deleted
   * @throws {Error} Error if validation of options fails or you lack permissions
   *
   * @see {@link https://discord.com/developers/docs/resources/channel#bulk-delete-messages}
   *
   * @remarks
   * Requires MANAGE_MESSAGES permission.
   * Messages must not be older than 2 weeks.
   * Must contain at least 2 and no more than 100 message IDs.
   * If any message fails validation, no messages will be deleted.
   * This operation is much more efficient than deleting messages individually.
   */
  bulkDeleteMessages(
    channelId: Snowflake,
    options: BulkDeleteMessagesSchema,
    reason?: string,
  ): Promise<void> {
    return this.#rest.post(
      MessageRouter.MESSAGE_ROUTES.bulkDeleteEndpoint(channelId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }
}
