import type { FileInput, Rest } from "../../core/index.js";
import type {
  ActionRowEntity,
  ContainerEntity,
  FileEntity,
  MediaGalleryEntity,
  SectionEntity,
  SeparatorEntity,
  TextDisplayEntity,
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
} from "./message.entity.js";

export interface MessagesFetchParams {
  limit?: number;
  around?: string;
  before?: string;
  after?: string;
}

export interface MessageCreateBaseOptions {
  nonce?: string | number;
  tts?: boolean;
  allowed_mentions?: AllowedMentionsEntity;
  message_reference?: MessageReferenceEntity;
  files?: FileInput | FileInput[];
  payload_json?: string;
  flags?: MessageFlags;
  enforce_nonce?: boolean;
}

export interface MessageCreateV1Options extends MessageCreateBaseOptions {
  content?: string;
  embeds?: EmbedEntity[];
  components?: ActionRowEntity[];
  sticker_ids?: string[];
  attachments?: AttachmentEntity[];
  poll?: PollCreateRequestEntity;
}

export type TopLevelComponentV2 =
  | TextDisplayEntity
  | ContainerEntity
  | MediaGalleryEntity
  | FileEntity
  | SectionEntity
  | SeparatorEntity
  | ActionRowEntity;

export interface MessageCreateV2Options extends MessageCreateBaseOptions {
  components: TopLevelComponentV2[];
  attachments?: AttachmentEntity[];
  flags: MessageFlags;
}

export function isComponentsV2Schema(
  schema: MessageCreateV1Options | MessageCreateV2Options,
): schema is MessageCreateV2Options {
  return schema.flags !== undefined && (schema.flags & MessageFlags.IsComponentsV2) !== 0;
}

export type CreateMessageSchema = MessageCreateV1Options | MessageCreateV2Options;

export enum ReactionType {
  Normal = 0,
  Burst = 1,
}

export interface ReactionsFetchParams {
  type?: ReactionType;
  after?: string;
  limit?: number;
}

export interface MessageUpdateBaseOptions {
  allowed_mentions?: AllowedMentionsEntity;
  files?: FileInput | FileInput[];
  payload_json?: string;
  flags?: MessageFlags;
}

export interface MessageUpdateV1Options extends MessageUpdateBaseOptions {
  content?: string;
  embeds?: EmbedEntity[];
  components?: ActionRowEntity[];
  attachments?: AttachmentEntity[];
}

export interface MessageUpdateV2Options extends MessageUpdateBaseOptions {
  components: TopLevelComponentV2[];
  attachments?: AttachmentEntity[];
  flags: MessageFlags;
}

export function isEditComponentsV2Schema(
  schema: MessageUpdateV1Options | MessageUpdateV2Options,
): schema is MessageUpdateV2Options {
  return schema.flags !== undefined && (schema.flags & MessageFlags.IsComponentsV2) !== 0;
}

export type EditMessageSchema = MessageUpdateV1Options | MessageUpdateV2Options;

export interface MessagesBulkDeleteOptions {
  messages: string[];
}

export interface PinnedMessagesFetchParams {
  limit?: number;
  before?: string;
  after?: string;
}

export class MessageRouter {
  static readonly Routes = {
    channelMessagesEndpoint: (channelId: string) => `/channels/${channelId}/messages` as const,
    channelMessageByIdEndpoint: (channelId: string, messageId: string) =>
      `/channels/${channelId}/messages/${messageId}` as const,
    messagePublishEndpoint: (channelId: string, messageId: string) =>
      `/channels/${channelId}/messages/${messageId}/crosspost` as const,
    messageReactionsEndpoint: (channelId: string, messageId: string, emoji: string) =>
      `/channels/${channelId}/messages/${messageId}/reactions/${emoji}` as const,
    userReactionEndpoint: (channelId: string, messageId: string, emoji: string, userId = "@me") =>
      `/channels/${channelId}/messages/${messageId}/reactions/${emoji}/${userId}` as const,
    bulkDeleteEndpoint: (channelId: string) =>
      `/channels/${channelId}/messages/bulk-delete` as const,
    pinnedMessagesEndpoint: (channelId: string) => `/channels/${channelId}/messages/pins` as const,
    pinMessageEndpoint: (channelId: string, messageId: string) =>
      `/channels/${channelId}/messages/pins/${messageId}` as const,
  } as const satisfies Record<string, (...args: any[]) => string>;
  readonly #rest: Rest;
  constructor(rest: Rest) {
    this.#rest = rest;
  }
  fetchMessages(channelId: string, query?: MessagesFetchParams): Promise<MessageEntity[]> {
    return this.#rest.get(MessageRouter.Routes.channelMessagesEndpoint(channelId), {
      query,
    });
  }
  fetchMessage(channelId: string, messageId: string): Promise<MessageEntity> {
    return this.#rest.get(MessageRouter.Routes.channelMessageByIdEndpoint(channelId, messageId));
  }
  sendMessage(channelId: string, options: CreateMessageSchema): Promise<MessageEntity> {
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
    const { files, ...rest } = options;
    return this.#rest.post(MessageRouter.Routes.channelMessagesEndpoint(channelId), {
      body: JSON.stringify(rest),
      files,
    });
  }
  crosspostMessage(channelId: string, messageId: string): Promise<MessageEntity> {
    return this.#rest.post(MessageRouter.Routes.messagePublishEndpoint(channelId, messageId));
  }
  addReaction(channelId: string, messageId: string, emoji: string): Promise<void> {
    return this.#rest.put(MessageRouter.Routes.userReactionEndpoint(channelId, messageId, emoji));
  }
  removeOwnReaction(channelId: string, messageId: string, emoji: string): Promise<void> {
    return this.#rest.delete(
      MessageRouter.Routes.userReactionEndpoint(channelId, messageId, emoji),
    );
  }
  removeUserReaction(
    channelId: string,
    messageId: string,
    emoji: string,
    userId: string,
  ): Promise<void> {
    return this.#rest.delete(
      MessageRouter.Routes.userReactionEndpoint(channelId, messageId, emoji, userId),
    );
  }
  fetchReactionUsers(
    channelId: string,
    messageId: string,
    emoji: string,
    query?: ReactionsFetchParams,
  ): Promise<UserEntity[]> {
    return this.#rest.get(
      MessageRouter.Routes.messageReactionsEndpoint(channelId, messageId, emoji),
      { query },
    );
  }
  removeAllReactions(channelId: string, messageId: string): Promise<void> {
    return this.#rest.delete(
      MessageRouter.Routes.messageReactionsEndpoint(channelId, messageId, ""),
    );
  }
  removeEmojiReactions(channelId: string, messageId: string, emoji: string): Promise<void> {
    return this.#rest.delete(
      MessageRouter.Routes.messageReactionsEndpoint(channelId, messageId, emoji),
    );
  }
  updateMessage(
    channelId: string,
    messageId: string,
    options: EditMessageSchema,
  ): Promise<MessageEntity> {
    if (isEditComponentsV2Schema(options)) {
      if (!options.components || options.components.length === 0) {
        throw new Error("Components V2 messages must have at least one component");
      }
      if (options.components.length > 10) {
        throw new Error("Components V2 messages cannot have more than 10 top-level components");
      }
    }
    const { files, ...rest } = options;
    return this.#rest.patch(MessageRouter.Routes.channelMessageByIdEndpoint(channelId, messageId), {
      body: JSON.stringify(rest),
      files,
    });
  }
  deleteMessage(channelId: string, messageId: string, reason?: string): Promise<void> {
    return this.#rest.delete(
      MessageRouter.Routes.channelMessageByIdEndpoint(channelId, messageId),
      { reason },
    );
  }
  bulkDeleteMessages(
    channelId: string,
    options: MessagesBulkDeleteOptions,
    reason?: string,
  ): Promise<void> {
    return this.#rest.post(MessageRouter.Routes.bulkDeleteEndpoint(channelId), {
      body: JSON.stringify(options),
      reason,
    });
  }
  fetchPinnedMessages(
    channelId: string,
    query?: PinnedMessagesFetchParams,
  ): Promise<MessageEntity[]> {
    return this.#rest.get(MessageRouter.Routes.pinnedMessagesEndpoint(channelId), {
      query,
    });
  }
  pinMessage(channelId: string, messageId: string, reason?: string): Promise<void> {
    return this.#rest.put(MessageRouter.Routes.pinMessageEndpoint(channelId, messageId), {
      reason,
    });
  }
  unpinMessage(channelId: string, messageId: string, reason?: string): Promise<void> {
    return this.#rest.delete(MessageRouter.Routes.pinMessageEndpoint(channelId, messageId), {
      reason,
    });
  }
}
