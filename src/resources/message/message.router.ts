import { BaseRouter } from "../../bases/index.js";
import type { FileInput, RouteBuilder } from "../../core/index.js";
import type { DeepNullable } from "../../utils/index.js";
import type {
  AnyComponentEntity,
  ComponentsV2MessageComponentEntity,
  LegacyActionRowEntity,
} from "../components/index.js";
import type { PollCreateRequestEntity } from "../poll/index.js";
import type { UserEntity } from "../user/index.js";
import {
  type AllowedMentionsEntity,
  type AttachmentEntity,
  type EmbedEntity,
  type MessageEntity,
  MessageFlags,
  type MessageReferenceEntity,
  type ReactionType,
} from "./message.entity.js";

/**
 * @description Query parameters for fetching channel messages with pagination and filtering options.
 * @see {@link https://discord.com/developers/docs/resources/message#get-channel-messages}
 */
export interface RESTGetChannelMessagesQueryStringParams {
  /**
   * @description Get messages around this message ID (mutually exclusive with before/after).
   */
  around?: string;
  /**
   * @description Get messages before this message ID (mutually exclusive with around/after).
   */
  before?: string;
  /**
   * @description Get messages after this message ID (mutually exclusive with around/before).
   */
  after?: string;
  /**
   * @description Maximum number of messages to return (1-100, defaults to 50).
   */
  limit?: number;
}

/**
 * @description Query parameters for fetching users who reacted with a specific emoji on a message.
 * @see {@link https://discord.com/developers/docs/resources/message#get-reactions}
 */
export interface RESTGetReactionsQueryStringParams {
  /**
   * @description Reaction type filter (0 = normal, 1 = burst).
   */
  type?: ReactionType;
  /**
   * @description Get users after this user ID for pagination.
   */
  after?: string;
  /**
   * @description Maximum number of users to return (1-100, defaults to 25).
   */
  limit?: number;
}

/**
 * @description Query parameters for fetching pinned messages with pagination support.
 * @see {@link https://discord.com/developers/docs/resources/message#get-channel-pins}
 */
export interface RESTGetPinnedMessagesQueryStringParams {
  /**
   * @description Get messages pinned before this timestamp.
   */
  before?: string;
  /**
   * @description Maximum number of pins to return (1-50, defaults to 50).
   */
  limit?: number;
}

/**
 * @description Complete base interface containing all possible parameters for creating Discord messages.
 * @see {@link https://discord.com/developers/docs/resources/message#create-message}
 */
export interface RESTCreateMessageBaseJSONParams {
  /**
   * @description Unique validation token to prevent duplicate messages (max 25 characters).
   */
  nonce?: string | number;
  /**
   * @description Whether this message should be sent as text-to-speech.
   */
  tts?: boolean;
  /**
   * @description Mention filtering configuration for the message.
   */
  allowed_mentions?: AllowedMentionsEntity;
  /**
   * @description Reference to another message for replies or forwards.
   */
  message_reference?: MessageReferenceEntity;
  /**
   * @description File attachments to include with the message.
   */
  files?: FileInput | FileInput[];
  /**
   * @description JSON payload for multipart/form-data requests.
   */
  payload_json?: string;
  /**
   * @description Message flags bitfield for special behaviors.
   */
  flags?: MessageFlags;
  /**
   * @description Whether to enforce nonce uniqueness validation.
   */
  enforce_nonce?: boolean;
  /**
   * @description Message text content (max 2000 characters) - Components v1 only.
   */
  content?: string;
  /**
   * @description Rich embed objects to include (max 10 embeds, max 6000 characters total) - Components v1 only.
   */
  embeds?: EmbedEntity[];
  /**
   * @description Server sticker IDs to include (max 3 stickers) - Components v1 only.
   */
  sticker_ids?: string[];
  /**
   * @description Poll configuration for interactive voting - Components v1 only.
   */
  poll?: PollCreateRequestEntity;
  /**
   * @description File attachment metadata for uploaded files.
   */
  attachments?: AttachmentEntity[];
  /**
   * @description Components to include with the message
   */
  components?: AnyComponentEntity[];
}

/**
 * @description JSON parameters for creating Components v1 messages with traditional content and embeds.
 * Type-safe interface that excludes Components v2 fields when IS_COMPONENTS_V2 flag is not set.
 * @see {@link https://discord.com/developers/docs/resources/message#create-message}
 */
export interface RESTCreateMessageV1JSONParams
  extends Omit<RESTCreateMessageBaseJSONParams, "flags" | "components"> {
  /**
   * @description Interactive component action rows (max 5 rows).
   */
  components?: LegacyActionRowEntity[];
  /**
   * @description Message flags bitfield (IS_COMPONENTS_V2 flag forbidden for v1 messages).
   */
  flags?: Exclude<MessageFlags, MessageFlags.IsComponentsV2>;
}

/**
 * @description JSON parameters for creating Components v2 messages with fully component-driven layouts.
 * Type-safe interface that excludes Components v1 fields when IS_COMPONENTS_V2 flag is set.
 * @see {@link https://discord.com/developers/docs/resources/message#create-message}
 */
export interface RESTCreateMessageV2JSONParams
  extends Pick<
    RESTCreateMessageBaseJSONParams,
    | "nonce"
    | "tts"
    | "allowed_mentions"
    | "message_reference"
    | "files"
    | "payload_json"
    | "enforce_nonce"
    | "attachments"
  > {
  /**
   * @description Top-level component array for message layout (max 10 components, required).
   */
  components: ComponentsV2MessageComponentEntity[];
  /**
   * @description Message flags including IS_COMPONENTS_V2 (required for v2 messages).
   */
  flags: MessageFlags.IsComponentsV2 | (MessageFlags.IsComponentsV2 | MessageFlags);
}

/**
 * @description Union type for all message creation parameter variants.
 */
export type RESTCreateMessageJSONParams =
  | RESTCreateMessageV1JSONParams
  | RESTCreateMessageV2JSONParams;

/**
 * @description JSON parameters for updating Components v1 messages with traditional content and embeds.
 * Type-safe interface that excludes Components v2 fields when IS_COMPONENTS_V2 flag is not set.
 * @see {@link https://discord.com/developers/docs/resources/message#edit-message}
 */
export type RESTEditMessageV1JSONParams = Partial<
  DeepNullable<
    Pick<
      RESTCreateMessageV1JSONParams,
      | "content"
      | "embeds"
      | "flags"
      | "allowed_mentions"
      | "components"
      | "files"
      | "payload_json"
      | "attachments"
    >
  >
>;

/**
 * @description JSON parameters for updating Components v2 messages with fully component-driven layouts.
 * Type-safe interface that excludes Components v1 fields when IS_COMPONENTS_V2 flag is set.
 * @see {@link https://discord.com/developers/docs/resources/message#edit-message}
 */
export type RESTEditMessageV2JSONParams = Partial<
  DeepNullable<
    Pick<
      RESTCreateMessageV2JSONParams,
      "allowed_mentions" | "files" | "payload_json" | "attachments" | "components" | "flags"
    >
  >
>;

/**
 * @description Union type for all message edit parameter variants with automatic type safety based on flags.
 */
export type RESTEditMessageJSONParams = RESTEditMessageV1JSONParams | RESTEditMessageV2JSONParams;

/**
 * @description JSON parameters for bulk deleting multiple messages in a single operation.
 * Messages must be less than 2 weeks old and between 2-100 messages can be deleted at once.
 * @see {@link https://discord.com/developers/docs/resources/message#bulk-delete-messages}
 */
export interface RESTBulkDeleteMessagesJSONParams {
  /**
   * @description Array of message snowflake IDs to delete (2-100 messages, must be less than 2 weeks old).
   */
  messages: string[];
}

/**
 * @description Type guard to determine if message schema uses Components v2 layout system.
 * Provides compile-time type safety by checking the IS_COMPONENTS_V2 flag.
 * @param schema - Message creation or edit schema to check
 * @returns True if schema uses Components v2 system with IS_COMPONENTS_V2 flag set
 */
export function isComponentsV2Schema(
  schema: RESTCreateMessageJSONParams | RESTEditMessageJSONParams,
): schema is RESTCreateMessageV2JSONParams {
  return schema.flags !== undefined && (Number(schema.flags) & MessageFlags.IsComponentsV2) !== 0;
}

/**
 * @description Discord API endpoints for message operations with type-safe route building.
 * @see {@link https://discord.com/developers/docs/resources/message}
 */
export const MessageRoutes = {
  channelMessages: (channelId: string) => `/channels/${channelId}/messages` as const,
  channelMessage: (channelId: string, messageId: string) =>
    `/channels/${channelId}/messages/${messageId}` as const,
  crosspostMessage: (channelId: string, messageId: string) =>
    `/channels/${channelId}/messages/${messageId}/crosspost` as const,
  messageReactions: (channelId: string, messageId: string, emoji: string) =>
    `/channels/${channelId}/messages/${messageId}/reactions/${emoji}` as const,
  userReaction: (channelId: string, messageId: string, emoji: string, userId = "@me") =>
    `/channels/${channelId}/messages/${messageId}/reactions/${emoji}/${userId}` as const,
  allMessageReactions: (channelId: string, messageId: string) =>
    `/channels/${channelId}/messages/${messageId}/reactions` as const,
  bulkDeleteMessages: (channelId: string) => `/channels/${channelId}/messages/bulk-delete` as const,
  pinnedMessages: (channelId: string) => `/channels/${channelId}/messages/pins` as const,
  pinMessage: (channelId: string, messageId: string) =>
    `/channels/${channelId}/messages/pins/${messageId}` as const,
} as const satisfies RouteBuilder;

/**
 * @description Zero-cache Discord message API client with direct REST operations and comprehensive message management.
 * @see {@link https://discord.com/developers/docs/resources/message}
 */
export class MessageRouter extends BaseRouter {
  /**
   * @description Retrieves messages from a Discord channel with pagination and filtering options.
   * @see {@link https://discord.com/developers/docs/resources/message#get-channel-messages}
   *
   * @param channelId - Snowflake ID of the channel to fetch messages from
   * @param query - Optional pagination and filtering parameters
   * @returns Promise resolving to array of message objects from newest to oldest
   * @throws {Error} When lacking VIEW_CHANNEL or READ_MESSAGE_HISTORY permissions
   */
  getChannelMessages(
    channelId: string,
    query?: RESTGetChannelMessagesQueryStringParams,
  ): Promise<MessageEntity[]> {
    return this.rest.get(MessageRoutes.channelMessages(channelId), {
      query,
    });
  }

  /**
   * @description Retrieves a specific message from a Discord channel by ID.
   * @see {@link https://discord.com/developers/docs/resources/message#get-channel-message}
   *
   * @param channelId - Snowflake ID of the channel containing the message
   * @param messageId - Snowflake ID of the message to fetch
   * @returns Promise resolving to complete message object with all metadata
   * @throws {Error} When lacking VIEW_CHANNEL or READ_MESSAGE_HISTORY permissions
   */
  getChannelMessage(channelId: string, messageId: string): Promise<MessageEntity> {
    return this.rest.get(MessageRoutes.channelMessage(channelId, messageId));
  }

  /**
   * @description Creates a new message in a Discord channel with comprehensive content support.
   * @see {@link https://discord.com/developers/docs/resources/message#create-message}
   *
   * @param channelId - Snowflake ID of the target channel
   * @param options - Message content and configuration parameters
   * @returns Promise resolving to created message object
   * @throws {Error} When lacking SEND_MESSAGES permission or when content validation fails
   * @throws {Error} When Components v2 message has no components or exceeds 10 component limit
   */
  async createMessage(
    channelId: string,
    options: RESTCreateMessageJSONParams,
  ): Promise<MessageEntity> {
    if (isComponentsV2Schema(options)) {
      if (!options.components || options.components.length === 0) {
        throw new Error("Components V2 messages must have at least one component");
      }
      if (options.components.length > 10) {
        throw new Error("Components V2 messages cannot have more than 10 top-level components");
      }
    } else {
      const hasContent = !!options.content;
      const hasEmbeds = !!(options.embeds && options.embeds.length > 0);
      const hasStickerIds = !!(options.sticker_ids && options.sticker_ids.length > 0);
      const hasComponents = !!(options.components && options.components.length > 0);
      const hasFiles = !!options.files;
      const hasPoll = !!options.poll;

      if (!(hasContent || hasEmbeds || hasStickerIds || hasComponents || hasFiles || hasPoll)) {
        throw new Error(
          "At least one of content, embeds, sticker_ids, components, files, or poll is required",
        );
      }
    }

    const processedOptions = await this.processFileOptions(options, ["files"]);
    const { files, ...rest } = processedOptions;

    return this.rest.post(MessageRoutes.channelMessages(channelId), {
      body: JSON.stringify(rest),
      files,
    });
  }

  /**
   * @description Crossposts a message from an announcement channel to following channels.
   * @see {@link https://discord.com/developers/docs/resources/message#crosspost-message}
   *
   * @param channelId - Snowflake ID of the announcement channel
   * @param messageId - Snowflake ID of the message to crosspost
   * @returns Promise resolving to crossposted message object with updated flags
   * @throws {Error} When lacking SEND_MESSAGES permission (own message) or MANAGE_MESSAGES permission (others)
   */
  crosspostMessage(channelId: string, messageId: string): Promise<MessageEntity> {
    return this.rest.post(MessageRoutes.crosspostMessage(channelId, messageId));
  }

  /**
   * @description Adds a reaction to a Discord message with the current user.
   * @see {@link https://discord.com/developers/docs/resources/message#create-reaction}
   *
   * @param channelId - Snowflake ID of the channel containing the message
   * @param messageId - Snowflake ID of the message to react to
   * @param emoji - URL-encoded emoji (unicode or name:id format for custom emoji)
   * @returns Promise resolving when reaction is successfully added
   * @throws {Error} When lacking READ_MESSAGE_HISTORY or ADD_REACTIONS permissions
   */
  createReaction(channelId: string, messageId: string, emoji: string): Promise<void> {
    return this.rest.put(MessageRoutes.userReaction(channelId, messageId, emoji));
  }

  /**
   * @description Removes the current user's reaction from a Discord message.
   * @see {@link https://discord.com/developers/docs/resources/message#delete-own-reaction}
   *
   * @param channelId - Snowflake ID of the channel containing the message
   * @param messageId - Snowflake ID of the message to remove reaction from
   * @param emoji - URL-encoded emoji (unicode or name:id format for custom emoji)
   * @returns Promise resolving when reaction is successfully removed
   */
  deleteOwnReaction(channelId: string, messageId: string, emoji: string): Promise<void> {
    return this.rest.delete(MessageRoutes.userReaction(channelId, messageId, emoji));
  }

  /**
   * @description Removes another user's reaction from a Discord message (requires MANAGE_MESSAGES).
   * @see {@link https://discord.com/developers/docs/resources/message#delete-user-reaction}
   *
   * @param channelId - Snowflake ID of the channel containing the message
   * @param messageId - Snowflake ID of the message to remove reaction from
   * @param emoji - URL-encoded emoji (unicode or name:id format for custom emoji)
   * @param userId - Snowflake ID of the user whose reaction to remove
   * @returns Promise resolving when reaction is successfully removed
   * @throws {Error} When lacking MANAGE_MESSAGES permission
   */
  deleteUserReaction(
    channelId: string,
    messageId: string,
    emoji: string,
    userId: string,
  ): Promise<void> {
    return this.rest.delete(MessageRoutes.userReaction(channelId, messageId, emoji, userId));
  }

  /**
   * @description Retrieves paginated list of users who reacted with a specific emoji.
   * @see {@link https://discord.com/developers/docs/resources/message#get-reactions}
   *
   * @param channelId - Snowflake ID of the channel containing the message
   * @param messageId - Snowflake ID of the message to fetch reactions from
   * @param emoji - URL-encoded emoji (unicode or name:id format for custom emoji)
   * @param query - Optional pagination and filtering parameters
   * @returns Promise resolving to array of user objects who reacted with emoji
   */
  getReactions(
    channelId: string,
    messageId: string,
    emoji: string,
    query?: RESTGetReactionsQueryStringParams,
  ): Promise<UserEntity[]> {
    return this.rest.get(MessageRoutes.messageReactions(channelId, messageId, emoji), {
      query,
    });
  }

  /**
   * @description Removes all reactions from a Discord message (requires MANAGE_MESSAGES).
   * @see {@link https://discord.com/developers/docs/resources/message#delete-all-reactions}
   *
   * @param channelId - Snowflake ID of the channel containing the message
   * @param messageId - Snowflake ID of the message to clear reactions from
   * @returns Promise resolving when all reactions are successfully removed
   * @throws {Error} When lacking MANAGE_MESSAGES permission
   */
  deleteAllReactions(channelId: string, messageId: string): Promise<void> {
    return this.rest.delete(MessageRoutes.allMessageReactions(channelId, messageId));
  }

  /**
   * @description Removes all reactions for a specific emoji from a Discord message.
   * @see {@link https://discord.com/developers/docs/resources/message#delete-all-reactions-for-emoji}
   *
   * @param channelId - Snowflake ID of the channel containing the message
   * @param messageId - Snowflake ID of the message to remove emoji reactions from
   * @param emoji - URL-encoded emoji (unicode or name:id format for custom emoji)
   * @returns Promise resolving when emoji reactions are successfully removed
   * @throws {Error} When lacking MANAGE_MESSAGES permission
   */
  deleteAllReactionsForEmoji(channelId: string, messageId: string, emoji: string): Promise<void> {
    return this.rest.delete(MessageRoutes.messageReactions(channelId, messageId, emoji));
  }

  /**
   * @description Updates an existing Discord message with new content or components.
   * @see {@link https://discord.com/developers/docs/resources/message#edit-message}
   *
   * @param channelId - Snowflake ID of the channel containing the message
   * @param messageId - Snowflake ID of the message to update
   * @param options - Updated message content and configuration parameters
   * @returns Promise resolving to updated message object
   * @throws {Error} When not message author (content changes) or lacking MANAGE_MESSAGES (flag changes)
   * @throws {Error} When Components v2 message has no components or exceeds 10 component limit
   */
  async editMessage(
    channelId: string,
    messageId: string,
    options: RESTEditMessageJSONParams,
  ): Promise<MessageEntity> {
    if (isComponentsV2Schema(options)) {
      if (!options.components || options.components.length === 0) {
        throw new Error("Components V2 messages must have at least one component");
      }
      if (options.components.length > 10) {
        throw new Error("Components V2 messages cannot have more than 10 top-level components");
      }
    }

    const processedOptions = await this.processFileOptions(options, ["files"]);
    const { files, ...rest } = processedOptions;

    return this.rest.patch(MessageRoutes.channelMessage(channelId, messageId), {
      body: JSON.stringify(rest),
      files: files as FileInput[] | undefined,
    });
  }

  /**
   * @description Permanently deletes a Discord message from the channel.
   * @see {@link https://discord.com/developers/docs/resources/message#delete-message}
   *
   * @param channelId - Snowflake ID of the channel containing the message
   * @param messageId - Snowflake ID of the message to delete
   * @param reason - Optional audit log reason for message deletion
   * @returns Promise resolving when message is successfully deleted
   * @throws {Error} When not message author or lacking MANAGE_MESSAGES permission
   */
  deleteMessage(channelId: string, messageId: string, reason?: string): Promise<void> {
    return this.rest.delete(MessageRoutes.channelMessage(channelId, messageId), {
      reason,
    });
  }

  /**
   * @description Bulk deletes multiple messages in a single operation for efficiency.
   * @see {@link https://discord.com/developers/docs/resources/message#bulk-delete-messages}
   *
   * @param channelId - Snowflake ID of the guild channel to delete messages from
   * @param options - Bulk deletion parameters with message ID array
   * @param reason - Optional audit log reason for bulk deletion
   * @returns Promise resolving when messages are successfully deleted
   * @throws {Error} When lacking MANAGE_MESSAGES permission or messages are older than 2 weeks
   */
  bulkDeleteMessages(
    channelId: string,
    options: RESTBulkDeleteMessagesJSONParams,
    reason?: string,
  ): Promise<void> {
    return this.rest.post(MessageRoutes.bulkDeleteMessages(channelId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * @description Retrieves paginated list of pinned messages from a Discord channel.
   * @see {@link https://discord.com/developers/docs/resources/message#get-channel-pins}
   *
   * @param channelId - Snowflake ID of the channel to fetch pins from
   * @param query - Optional pagination parameters for pin retrieval
   * @returns Promise resolving to response containing pinned message objects and pagination info
   * @throws {Error} When lacking VIEW_CHANNEL or READ_MESSAGE_HISTORY permissions
   */
  getPinnedMessages(
    channelId: string,
    query?: RESTGetPinnedMessagesQueryStringParams,
  ): Promise<{
    items: Array<{
      pinned_at: string;
      message: MessageEntity;
    }>;
    has_more: boolean;
  }> {
    return this.rest.get(MessageRoutes.pinnedMessages(channelId), {
      query,
    });
  }

  /**
   * @description Pins a Discord message to the channel for easy access.
   * @see {@link https://discord.com/developers/docs/resources/message#pin-message}
   *
   * @param channelId - Snowflake ID of the channel containing the message
   * @param messageId - Snowflake ID of the message to pin
   * @param reason - Optional audit log reason for message pinning
   * @returns Promise resolving when message is successfully pinned
   * @throws {Error} When lacking PIN_MESSAGES permission
   */
  pinMessage(channelId: string, messageId: string, reason?: string): Promise<void> {
    return this.rest.put(MessageRoutes.pinMessage(channelId, messageId), {
      reason,
    });
  }

  /**
   * @description Unpins a Discord message from the channel.
   * @see {@link https://discord.com/developers/docs/resources/message#unpin-message}
   *
   * @param channelId - Snowflake ID of the channel containing the pinned message
   * @param messageId - Snowflake ID of the message to unpin
   * @param reason - Optional audit log reason for message unpinning
   * @returns Promise resolving when message is successfully unpinned
   * @throws {Error} When lacking PIN_MESSAGES permission
   */
  unpinMessage(channelId: string, messageId: string, reason?: string): Promise<void> {
    return this.rest.delete(MessageRoutes.pinMessage(channelId, messageId), {
      reason,
    });
  }
}
