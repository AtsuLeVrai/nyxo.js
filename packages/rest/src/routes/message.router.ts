import {
  type ActionRowEntity,
  type AllowedMentionsEntity,
  type AttachmentEntity,
  type ContainerEntity,
  type EmbedEntity,
  type FileEntity,
  type MediaGalleryEntity,
  type MessageEntity,
  MessageFlags,
  type MessageReferenceEntity,
  type PollCreateRequestEntity,
  type SectionEntity,
  type SeparatorEntity,
  type Snowflake,
  type TextDisplayEntity,
  type UserEntity,
} from "@nyxojs/core";
import type { Rest } from "../core/index.js";
import type { FileInput } from "../handlers/index.js";

/**
 * Interface for query parameters when retrieving channel messages.
 * Used to control pagination and filtering when fetching messages.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#get-channel-messages-query-string-params}
 */
export interface MessagesFetchParams {
  /**
   * Maximum number of messages to return (1-100)
   * Default is 50 if not specified.
   */
  limit?: number;

  /**
   * Get messages around this message ID
   * Cannot be used with before or after.
   */
  around?: Snowflake;

  /**
   * Get messages before this message ID
   * Cannot be used with around or after.
   */
  before?: Snowflake;

  /**
   * Get messages after this message ID
   * Cannot be used with around or before.
   */
  after?: Snowflake;
}

/**
 * Base interface for creating a message in a channel.
 * Holds the common parameters between V1 and V2 messages.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#create-message}
 */
export interface MessageCreateBaseOptions {
  /**
   * Used to verify a message was sent (up to 25 characters).
   * If a message with the same nonce has already been sent, that message will be returned.
   */
  nonce?: string | number;

  /**
   * Whether this is a text-to-speech message.
   * Defaults to false if not specified.
   */
  tts?: boolean;

  /**
   * Controls mentions in the message.
   * Customizes which mentions will trigger notifications.
   */
  allowed_mentions?: AllowedMentionsEntity;

  /**
   * Include to make the message a reply to another message.
   * The referenced message must be in the same channel or a thread within the channel.
   */
  message_reference?: MessageReferenceEntity;

  /**
   * File contents to be attached to the message.
   * Maximum of 10 attachments per message.
   */
  files?: FileInput | FileInput[];

  /**
   * @deprecated Do not use `payload_json`. This is done automatically!
   */
  payload_json?: string;

  /**
   * Message flags combined as a bitfield.
   * Controls special behaviors for the message.
   */
  flags?: MessageFlags;

  /**
   * If true and nonce is present, it will be checked for uniqueness.
   * Useful for ensuring idempotent operations when sending messages.
   */
  enforce_nonce?: boolean;
}

/**
 * Interface for creating a new message using Components V1.
 * Supports text content, embeds, components, stickers, and attachments.
 *
 * @see {@link https://discord.com/developers/docs/resources/message#create-message-jsonform-params}
 */
export interface MessageCreateV1Options extends MessageCreateBaseOptions {
  /**
   * Message content (up to 2000 characters).
   * At least one of content, embeds, sticker_ids, components, or files is required.
   */
  content?: string;

  /**
   * Rich embedded content for the message (up to 10 embeds).
   * Each embed has limits: 6000 characters total, 256 for title, 4096 for description.
   */
  embeds?: EmbedEntity[];

  /**
   * Interactive components to include with the message.
   * Maximum of 5 action rows per message.
   */
  components?: ActionRowEntity[];

  /**
   * IDs of up to 3 stickers to send in the message.
   * The bot must have access to the stickers being used.
   */
  sticker_ids?: Snowflake[];

  /**
   * Information about attachments (up to 10).
   * Used when editing messages to retain or modify existing attachments.
   */
  attachments?: AttachmentEntity[];

  /**
   * Poll to include with the message.
   * Includes the question, answer options, and configuration settings.
   */
  poll?: PollCreateRequestEntity;
}

/**
 * Allowed top-level components for Components V2 messages
 * Defines component types that can be used at the top level in V2 messages.
 */
export type TopLevelComponentV2 =
  | TextDisplayEntity
  | ContainerEntity
  | MediaGalleryEntity
  | FileEntity
  | SectionEntity
  | SeparatorEntity
  | ActionRowEntity;

/**
 * Interface for creating a new message using Components V2.
 * Uses a component-based approach instead of separate content fields.
 *
 * @see {@link https://discord.com/developers/docs/components/overview}
 */
export interface MessageCreateV2Options extends MessageCreateBaseOptions {
  /**
   * Components to include with the message.
   * Required for Components V2 messages.
   * Maximum of 10 top-level components per message.
   */
  components: TopLevelComponentV2[];

  /**
   * Information about attachments (up to 10).
   * Must be exposed through components (like FileEntity) to be visible.
   */
  attachments?: AttachmentEntity[];

  /**
   * Message flags combined as a bitfield.
   * Must include the IS_COMPONENTS_V2 flag (1 << 15).
   */
  flags: MessageFlags;
}

/**
 * Type guard to check if a message schema is for Components V2
 *
 * @param schema - The message schema to check
 * @returns True if the schema is for Components V2
 */
export function isComponentsV2Schema(
  schema: MessageCreateV1Options | MessageCreateV2Options,
): schema is MessageCreateV2Options {
  return (
    schema.flags !== undefined &&
    (schema.flags & MessageFlags.IsComponentsV2) !== 0
  );
}

/**
 * Union type for message creation, supports both V1 and V2 message formats
 */
export type CreateMessageSchema =
  | MessageCreateV1Options
  | MessageCreateV2Options;

/**
 * Types of reactions that can be retrieved.
 * Defines the visual effects of different reaction types.
 *
 * @see {@link https://discord.com/developers/docs/resources/message#get-reactions-reaction-types}
 */
export enum ReactionType {
  /**
   * Normal reaction.
   * Standard emoji reactions available to all users.
   */
  Normal = 0,

  /**
   * Burst/Super reaction.
   * Premium reactions with special effects for Nitro subscribers.
   */
  Burst = 1,
}

/**
 * Interface for query parameters when retrieving reactions on a message.
 * Controls pagination and filtering for users who reacted.
 *
 * @see {@link https://discord.com/developers/docs/resources/message#get-reactions-query-string-params}
 */
export interface ReactionsFetchParams {
  /**
   * Type of reaction to get (normal or burst).
   * Defaults to ReactionType.Normal if not specified.
   */
  type?: ReactionType;

  /**
   * Get users after this user ID for pagination.
   * Results are ordered by when users reacted, with oldest first.
   */
  after?: Snowflake;

  /**
   * Maximum number of users to return (1-100).
   * Defaults to 25 if not specified.
   */
  limit?: number;
}

/**
 * Base interface for editing a message.
 * Holds common parameters for both V1 and V2 message edits.
 */
export interface MessageUpdateBaseOptions {
  /**
   * Controls mentions in the message.
   * Customizes which mentions will trigger notifications.
   */
  allowed_mentions?: AllowedMentionsEntity;

  /**
   * File contents to be attached to the message.
   * New files will be added to any existing attachments.
   */
  files?: FileInput | FileInput[];

  /**
   * @deprecated Do not use `payload_json`. This is done automatically!
   */
  payload_json?: string;

  /**
   * Message flags combined as a bitfield.
   * Only SUPPRESS_EMBEDS and SUPPRESS_NOTIFICATIONS can be modified.
   */
  flags?: MessageFlags;
}

/**
 * Interface for editing an existing message with Components V1.
 * Includes only fields that can be modified after a message is sent.
 *
 * @see {@link https://discord.com/developers/docs/resources/message#edit-message-jsonform-params}
 */
export interface MessageUpdateV1Options extends MessageUpdateBaseOptions {
  /**
   * Message content (up to 2000 characters).
   * Set to an empty string to remove the content.
   */
  content?: string;

  /**
   * Rich embedded content for the message (up to 10 embeds).
   * Set to an empty array to remove all embeds.
   */
  embeds?: EmbedEntity[];

  /**
   * Interactive components to include with the message.
   * Set to an empty array to remove all components.
   */
  components?: ActionRowEntity[];

  /**
   * Information about attachments (up to 10).
   * Must include all attachments that should remain on the message.
   */
  attachments?: AttachmentEntity[];
}

/**
 * Interface for editing an existing message with Components V2.
 * Uses component-based structure for all content.
 *
 * @see {@link https://discord.com/developers/docs/components/overview}
 */
export interface MessageUpdateV2Options extends MessageUpdateBaseOptions {
  /**
   * Components to include with the message.
   * Required for Components V2 messages.
   * All content must be structured as components.
   */
  components: TopLevelComponentV2[];

  /**
   * Information about attachments (up to 10).
   * Must be exposed through components to be visible.
   */
  attachments?: AttachmentEntity[];

  /**
   * Message flags combined as a bitfield.
   * Must include the IS_COMPONENTS_V2 flag (1 << 15).
   */
  flags: MessageFlags;
}

/**
 * Type guard to check if an edit message schema is for Components V2
 *
 * @param schema - The message schema to check
 * @returns True if the schema is for Components V2
 */
export function isEditComponentsV2Schema(
  schema: MessageUpdateV1Options | MessageUpdateV2Options,
): schema is MessageUpdateV2Options {
  return (
    schema.flags !== undefined &&
    (schema.flags & MessageFlags.IsComponentsV2) !== 0
  );
}

/**
 * Union type for message editing, supports both V1 and V2 message formats
 */
export type EditMessageSchema = MessageUpdateV1Options | MessageUpdateV2Options;

/**
 * Interface for bulk deleting messages.
 * Allows removing multiple messages in a single API call.
 *
 * @see {@link https://discord.com/developers/docs/resources/message#bulk-delete-messages-json-params}
 */
export interface MessagesBulkDeleteOptions {
  /**
   * Array of message IDs to delete (2-100).
   * All messages must be younger than 2 weeks.
   */
  messages: Snowflake[];
}

/**
 * Router for Discord Message-related endpoints.
 * Provides methods to interact with messages, including creation, modification, reactions, and deletion.
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
     * @param channelId - The ID of the channel
     */
    channelMessagesEndpoint: (channelId: Snowflake) =>
      `/channels/${channelId}/messages` as const,

    /**
     * Route for operations on a specific message.
     * @param channelId - The ID of the channel
     * @param messageId - The ID of the message
     */
    channelMessageByIdEndpoint: (channelId: Snowflake, messageId: Snowflake) =>
      `/channels/${channelId}/messages/${messageId}` as const,

    /**
     * Route for crossposting a message.
     * @param channelId - The ID of the channel
     * @param messageId - The ID of the message
     */
    messagePublishEndpoint: (channelId: Snowflake, messageId: Snowflake) =>
      `/channels/${channelId}/messages/${messageId}/crosspost` as const,

    /**
     * Route for reactions on a message.
     * @param channelId - The ID of the channel
     * @param messageId - The ID of the message
     * @param emoji - The emoji to react with (URL encoded)
     */
    messageReactionsEndpoint: (
      channelId: Snowflake,
      messageId: Snowflake,
      emoji: string,
    ) =>
      `/channels/${channelId}/messages/${messageId}/reactions/${emoji}` as const,

    /**
     * Route for user-specific reactions on a message.
     * @param channelId - The ID of the channel
     * @param messageId - The ID of the message
     * @param emoji - The emoji to react with (URL encoded)
     * @param userId - The ID of the user (defaults to @me for current user)
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
     * @param channelId - The ID of the channel
     */
    bulkDeleteEndpoint: (channelId: Snowflake) =>
      `/channels/${channelId}/messages/bulk-delete` as const,
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new Message Router instance.
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches a list of messages from a channel.
   * Supports different pagination strategies through query parameters.
   *
   * @param channelId - The ID of the channel to get messages from
   * @param query - Query parameters for pagination
   * @returns A promise resolving to an array of message objects
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel-messages}
   */
  fetchMessages(
    channelId: Snowflake,
    query?: MessagesFetchParams,
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
   * Retrieves a single message by its ID within a specific channel.
   *
   * @param channelId - The ID of the channel containing the message
   * @param messageId - The ID of the message to retrieve
   * @returns A promise resolving to the message object
   * @see {@link https://discord.com/developers/docs/resources/channel#get-channel-message}
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
   * Sends a message with various optional components like text, embeds, files, etc.
   *
   * @param channelId - The ID of the channel to send the message in
   * @param options - The message content and properties
   * @returns A promise resolving to the created message object
   * @see {@link https://discord.com/developers/docs/resources/channel#create-message}
   */
  sendMessage(
    channelId: Snowflake,
    options: CreateMessageSchema,
  ): Promise<MessageEntity> {
    // Validate message schema according to its version
    if (isComponentsV2Schema(options)) {
      // V2 validation
      if (!options.components || options.components.length === 0) {
        throw new Error(
          "Components V2 messages must have at least one component",
        );
      }

      if (options.components.length > 10) {
        throw new Error(
          "Components V2 messages cannot have more than 10 top-level components",
        );
      }
    } else {
      // V1 validation
      const hasContent = !!options.content;
      const hasEmbeds = !!(options.embeds && options.embeds.length > 0);
      const hasStickerIds = !!(
        options.sticker_ids && options.sticker_ids.length > 0
      );
      const hasComponents = !!(
        options.components && options.components.length > 0
      );
      const hasFiles = !!options.files;
      const hasPoll = !!options.poll;

      if (
        !(
          hasContent ||
          hasEmbeds ||
          hasStickerIds ||
          hasComponents ||
          hasFiles ||
          hasPoll
        )
      ) {
        throw new Error(
          "At least one of content, embeds, sticker_ids, components, files, or poll is required",
        );
      }
    }

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
   * Makes a message visible to users in all channels that follow the announcement channel.
   *
   * @param channelId - The ID of the announcement channel
   * @param messageId - The ID of the message to crosspost
   * @returns A promise resolving to the crossposted message object
   * @see {@link https://discord.com/developers/docs/resources/channel#crosspost-message}
   */
  crosspostMessage(
    channelId: Snowflake,
    messageId: Snowflake,
  ): Promise<MessageEntity> {
    return this.#rest.post(
      MessageRouter.MESSAGE_ROUTES.messagePublishEndpoint(channelId, messageId),
    );
  }

  /**
   * Adds a reaction to a message.
   * Adds the bot's reaction to a message using the specified emoji.
   *
   * @param channelId - The ID of the channel containing the message
   * @param messageId - The ID of the message to react to
   * @param emoji - The emoji to react with (URL encoded)
   * @returns A promise that resolves when the reaction is added
   * @see {@link https://discord.com/developers/docs/resources/channel#create-reaction}
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
   * Removes the bot's own reaction with the specified emoji from a message.
   *
   * @param channelId - The ID of the channel containing the message
   * @param messageId - The ID of the message to remove reaction from
   * @param emoji - The emoji to remove (URL encoded)
   * @returns A promise that resolves when the reaction is removed
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-own-reaction}
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
   * Removes a specific user's reaction with the specified emoji from a message.
   *
   * @param channelId - The ID of the channel containing the message
   * @param messageId - The ID of the message to remove reaction from
   * @param emoji - The emoji to remove (URL encoded)
   * @param userId - The ID of the user whose reaction to remove
   * @returns A promise that resolves when the reaction is removed
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-user-reaction}
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
   * Supports pagination and filtering by reaction type.
   *
   * @param channelId - The ID of the channel containing the message
   * @param messageId - The ID of the message to get reactions for
   * @param emoji - The emoji to get reactions for (URL encoded)
   * @param query - Query parameters for pagination and reaction type
   * @returns A promise resolving to an array of user objects who reacted with the emoji
   * @see {@link https://discord.com/developers/docs/resources/channel#get-reactions}
   */
  fetchReactionUsers(
    channelId: Snowflake,
    messageId: Snowflake,
    emoji: string,
    query?: ReactionsFetchParams,
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
   * Clears all reactions of all types from a message.
   *
   * @param channelId - The ID of the channel containing the message
   * @param messageId - The ID of the message to remove all reactions from
   * @returns A promise that resolves when all reactions are removed
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-all-reactions}
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
   * Clears all reactions of a specific emoji type from a message.
   *
   * @param channelId - The ID of the channel containing the message
   * @param messageId - The ID of the message to remove emoji reactions from
   * @param emoji - The emoji to remove all reactions for (URL encoded)
   * @returns A promise that resolves when the reactions are removed
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-all-reactions-for-emoji}
   */
  removeEmojiReactions(
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
   * Edits the content of an existing message.
   *
   * @param channelId - The ID of the channel containing the message
   * @param messageId - The ID of the message to edit
   * @param options - The new message content and properties
   * @returns A promise resolving to the edited message object
   * @see {@link https://discord.com/developers/docs/resources/channel#edit-message}
   */
  updateMessage(
    channelId: Snowflake,
    messageId: Snowflake,
    options: EditMessageSchema,
  ): Promise<MessageEntity> {
    // Validate message schema according to its version
    if (isEditComponentsV2Schema(options)) {
      // V2 validation
      if (!options.components || options.components.length === 0) {
        throw new Error(
          "Components V2 messages must have at least one component",
        );
      }

      if (options.components.length > 10) {
        throw new Error(
          "Components V2 messages cannot have more than 10 top-level components",
        );
      }
    }

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
   * Permanently removes a message from a channel.
   *
   * @param channelId - The ID of the channel containing the message
   * @param messageId - The ID of the message to delete
   * @param reason - Reason for deleting the message (for audit logs)
   * @returns A promise that resolves when the message is deleted
   * @see {@link https://discord.com/developers/docs/resources/channel#delete-message}
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
   * Efficiently removes multiple messages from a channel.
   *
   * @param channelId - The ID of the channel to delete messages from
   * @param options - Object containing array of message IDs to delete
   * @param reason - Reason for deleting the messages (for audit logs)
   * @returns A promise that resolves when the messages are deleted
   * @see {@link https://discord.com/developers/docs/resources/channel#bulk-delete-messages}
   */
  bulkDeleteMessages(
    channelId: Snowflake,
    options: MessagesBulkDeleteOptions,
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
