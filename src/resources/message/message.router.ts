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

export interface RESTGetChannelMessagesQueryStringParams {
  around?: string;
  before?: string;
  after?: string;
  limit?: number;
}

export interface RESTGetReactionsQueryStringParams {
  type?: ReactionType;
  after?: string;
  limit?: number;
}

export interface RESTGetPinnedMessagesQueryStringParams {
  before?: string;
  limit?: number;
}

export interface RESTCreateMessageBaseJSONParams {
  nonce?: string | number;
  tts?: boolean;
  allowed_mentions?: AllowedMentionsEntity;
  message_reference?: MessageReferenceEntity;
  files?: FileInput | FileInput[];
  payload_json?: string;
  flags?: MessageFlags;
  enforce_nonce?: boolean;
  content?: string;
  embeds?: EmbedEntity[];
  sticker_ids?: string[];
  poll?: PollCreateRequestEntity;
  attachments?: AttachmentEntity[];
  components?: AnyComponentEntity[];
}

export interface RESTCreateMessageV1JSONParams
  extends Omit<RESTCreateMessageBaseJSONParams, "flags" | "components"> {
  components?: LegacyActionRowEntity[];
  flags?: Exclude<MessageFlags, MessageFlags.IsComponentsV2>;
}

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
  components: ComponentsV2MessageComponentEntity[];
  flags: MessageFlags.IsComponentsV2 | (MessageFlags.IsComponentsV2 | MessageFlags);
}

export type RESTCreateMessageJSONParams =
  | RESTCreateMessageV1JSONParams
  | RESTCreateMessageV2JSONParams;

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

export type RESTEditMessageV2JSONParams = Partial<
  DeepNullable<
    Pick<
      RESTCreateMessageV2JSONParams,
      "allowed_mentions" | "files" | "payload_json" | "attachments" | "components" | "flags"
    >
  >
>;

export type RESTEditMessageJSONParams = RESTEditMessageV1JSONParams | RESTEditMessageV2JSONParams;

export interface RESTBulkDeleteMessagesJSONParams {
  messages: string[];
}

export function isComponentsV2Schema(
  schema: RESTCreateMessageJSONParams | RESTEditMessageJSONParams,
): schema is RESTCreateMessageV2JSONParams {
  return schema.flags !== undefined && (Number(schema.flags) & MessageFlags.IsComponentsV2) !== 0;
}

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

export class MessageRouter extends BaseRouter {
  getChannelMessages(
    channelId: string,
    query?: RESTGetChannelMessagesQueryStringParams,
  ): Promise<MessageEntity[]> {
    return this.rest.get(MessageRoutes.channelMessages(channelId), {
      query,
    });
  }

  getChannelMessage(channelId: string, messageId: string): Promise<MessageEntity> {
    return this.rest.get(MessageRoutes.channelMessage(channelId, messageId));
  }

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

  crosspostMessage(channelId: string, messageId: string): Promise<MessageEntity> {
    return this.rest.post(MessageRoutes.crosspostMessage(channelId, messageId));
  }

  createReaction(channelId: string, messageId: string, emoji: string): Promise<void> {
    return this.rest.put(MessageRoutes.userReaction(channelId, messageId, emoji));
  }

  deleteOwnReaction(channelId: string, messageId: string, emoji: string): Promise<void> {
    return this.rest.delete(MessageRoutes.userReaction(channelId, messageId, emoji));
  }

  deleteUserReaction(
    channelId: string,
    messageId: string,
    emoji: string,
    userId: string,
  ): Promise<void> {
    return this.rest.delete(MessageRoutes.userReaction(channelId, messageId, emoji, userId));
  }

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

  deleteAllReactions(channelId: string, messageId: string): Promise<void> {
    return this.rest.delete(MessageRoutes.allMessageReactions(channelId, messageId));
  }

  deleteAllReactionsForEmoji(channelId: string, messageId: string, emoji: string): Promise<void> {
    return this.rest.delete(MessageRoutes.messageReactions(channelId, messageId, emoji));
  }

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

  deleteMessage(channelId: string, messageId: string, reason?: string): Promise<void> {
    return this.rest.delete(MessageRoutes.channelMessage(channelId, messageId), {
      reason,
    });
  }

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

  pinMessage(channelId: string, messageId: string, reason?: string): Promise<void> {
    return this.rest.put(MessageRoutes.pinMessage(channelId, messageId), {
      reason,
    });
  }

  unpinMessage(channelId: string, messageId: string, reason?: string): Promise<void> {
    return this.rest.delete(MessageRoutes.pinMessage(channelId, messageId), {
      reason,
    });
  }
}
