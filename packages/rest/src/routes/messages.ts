import type {
    ActionRowStructure,
    AllowedMentionStructure,
    AttachmentStructure,
    BitfieldResolvable,
    EmbedStructure,
    Integer,
    MessageFlags,
    MessageReferenceStructure,
    MessageStructure,
    PollCreateRequestStructure,
    Snowflake,
    UserStructure,
} from "@nyxjs/core";
import { FileUploadManager } from "../managers/index.js";
import { type QueryStringParams, RestMethods, type RouteStructure } from "../types/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/message#bulk-delete-messages-json-params|Bulk Delete Messages JSON Params}
 */
export interface BulkDeleteMessagesJsonParams {
    /**
     * An array of message ids to delete
     */
    messages: Snowflake[];
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#edit-message-jsonform-params|Edit Message JSON/Form Params}
 */
export interface EditMessageJsonFormParams {
    /**
     * Allowed mentions for the message
     */
    allowed_mentions?: AllowedMentionStructure;
    /**
     * Attached files to keep and possible descriptions for new files. See Uploading Files
     */
    attachments?: AttachmentStructure[];
    /**
     * Components to include with the message
     */
    components?: ActionRowStructure;
    /**
     * The message contents (up to 2000 characters)
     */
    content?: string;
    /**
     * Up to 10 rich embeds (up to 6000 characters)
     */
    embeds?: EmbedStructure[];
    /**
     * Contents of the file being sent/edited. See Uploading Files
     */
    files?: string[];
    /**
     * Edit the flags of a message (only SUPPRESS_EMBEDS can currently be set/unset)
     */
    flags?: MessageFlags.SuppressEmbeds;
    /**
     * JSON-encoded body of non-file params (multipart/form-data only). See Uploading Files
     */
    payload_json?: string;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#get-reactions-reaction-types|Get Reactions Reaction Types}
 */
export enum ReactionTypes {
    Normal = 0,
    Burst = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#get-reactions-query-string-params|Get Reactions Query String Params}
 */
export interface GetReactionsQueryStringParams extends Pick<QueryStringParams, "after" | "limit"> {
    /**
     * The type of reaction
     */
    type?: ReactionTypes;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#create-message-jsonform-params|Create Message JSON/Form Params}
 */
export interface CreateMessageJsonFormParams {
    /**
     * Allowed mentions for the message
     */
    allowed_mentions?: AllowedMentionStructure;
    /**
     * Attachment objects with filename and description. See Uploading Files
     */
    attachments?: AttachmentStructure[];
    /**
     * Components to include with the message
     */
    components?: ActionRowStructure[];
    /**
     * Message contents (up to 2000 characters)
     */
    content?: string;
    /**
     * Up to 10 rich embeds (up to 6000 characters)
     */
    embeds?: EmbedStructure[];
    /**
     * If true and nonce is present, it will be checked for uniqueness in the past few minutes. If another message was created by the same author with the same nonce, that message will be returned and no new message will be created.
     */
    enforce_nonce?: boolean;
    /**
     * Contents of the file being sent. See Uploading Files
     */
    files?: string[];
    /**
     * Message flags combined as a bitfield (only SUPPRESS_EMBEDS and SUPPRESS_NOTIFICATIONS can be set)
     */
    flags?: BitfieldResolvable<MessageFlags.SuppressEmbeds | MessageFlags.SuppressNotifications>;
    /**
     * Include to make your message a reply or a forward
     */
    message_reference?: MessageReferenceStructure;
    /**
     * Can be used to verify a message was sent (up to 25 characters). Value will appear in the Message Create event.
     */
    nonce?: Integer | string;
    /**
     * JSON-encoded body of non-file params, only for multipart/form-data requests. See Uploading Files
     */
    payload_json?: string;
    /**
     * A poll!
     */
    poll?: PollCreateRequestStructure;
    /**
     * IDs of up to 3 stickers in the server to send in the message
     */
    sticker_ids?: Snowflake[];
    /**
     * true if this is a TTS message
     */
    tts?: boolean;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#get-channel-messages-query-string-params|Get Channel Messages Query String Params}
 */
export interface GetChannelMessagesQueryStringParams extends Pick<QueryStringParams, "after" | "before" | "limit"> {
    /**
     * Get messages around this message ID
     */
    around?: Snowflake;
}

export const MessageRoutes = {
    /**
     * @see {@link https://discord.com/developers/docs/resources/message#bulk-delete-messages|Bulk Delete Messages}
     */
    bulkDeleteMessages(
        channelId: Snowflake,
        params: BulkDeleteMessagesJsonParams,
        reason?: string,
    ): RouteStructure<void> {
        const headers: Record<string, string> = {};

        if (reason) {
            headers["X-Audit-Log-Reason"] = reason;
        }

        return {
            method: RestMethods.Post,
            path: `/channels/${channelId}/messages/bulk-delete`,
            body: Buffer.from(JSON.stringify(params)),
            headers,
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/message#delete-message|Delete Message}
     */
    deleteMessage(channelId: Snowflake, messageId: Snowflake, reason?: string): RouteStructure<void> {
        const headers: Record<string, string> = {};

        if (reason) {
            headers["X-Audit-Log-Reason"] = reason;
        }

        return {
            method: RestMethods.Delete,
            path: `/channels/${channelId}/messages/${messageId}`,
            headers,
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/message#edit-message|Edit Message}
     */
    editMessage(
        channelId: Snowflake,
        messageId: Snowflake,
        params: EditMessageJsonFormParams,
    ): RouteStructure<MessageStructure> {
        const { files, ...restParams } = params;
        const form = new FileUploadManager();
        form.addPayload(restParams);

        if (files) {
            void form.addFiles(files);
        }

        return {
            method: RestMethods.Patch,
            path: `/channels/${channelId}/messages/${messageId}`,
            body: form.toBuffer(),
            headers: form.getHeaders(),
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/message#delete-all-reactions-for-emoji|Delete All Reactions For Emoji}
     */
    deleteAllReactionsForEmoji(channelId: Snowflake, messageId: Snowflake, emoji: string): RouteStructure<void> {
        return {
            method: RestMethods.Delete,
            path: `/channels/${channelId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`,
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/message#delete-all-reactions|Delete All Reactions}
     */
    deleteAllReactions(channelId: Snowflake, messageId: Snowflake): RouteStructure<void> {
        return {
            method: RestMethods.Delete,
            path: `/channels/${channelId}/messages/${messageId}/reactions`,
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/message#get-reactions|Get Reactions}
     */
    getReactions(
        channelId: Snowflake,
        messageId: Snowflake,
        emoji: string,
        params?: GetReactionsQueryStringParams,
    ): RouteStructure<UserStructure[], GetReactionsQueryStringParams> {
        return {
            method: RestMethods.Get,
            path: `/channels/${channelId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`,
            query: params,
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/message#delete-own-reaction|Delete Own Reaction}
     */
    deleteOwnReaction(channelId: Snowflake, messageId: Snowflake, emoji: string): RouteStructure<void> {
        return {
            method: RestMethods.Delete,
            path: `/channels/${channelId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}/@me`,
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/message#create-reaction|Create Reaction}
     */
    createReaction(channelId: Snowflake, messageId: Snowflake, emoji: string): RouteStructure<void> {
        return {
            method: RestMethods.Put,
            path: `/channels/${channelId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}/@me`,
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/message#crosspost-message|Crosspost Message}
     */
    crosspostMessage(channelId: Snowflake, messageId: Snowflake): RouteStructure<MessageStructure> {
        return {
            method: RestMethods.Post,
            path: `/channels/${channelId}/messages/${messageId}/crosspost`,
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/message#create-message|Create Message}
     */
    createMessage(channelId: Snowflake, params: CreateMessageJsonFormParams): RouteStructure<MessageStructure> {
        const { files, ...restParams } = params;
        const form = new FileUploadManager();
        form.addPayload(restParams);

        if (files) {
            void form.addFiles(files);
        }

        return {
            method: RestMethods.Post,
            path: `/channels/${channelId}/messages`,
            body: form.toBuffer(),
            headers: form.getHeaders(),
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/message#get-channel-message|Get Channel Message}
     */
    getChannelMessage(channelId: Snowflake, messageId: Snowflake): RouteStructure<MessageStructure> {
        return {
            method: RestMethods.Get,
            path: `/channels/${channelId}/messages/${messageId}`,
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/message#get-channel-messages|Get Channel Messages}
     */
    getChannelMessages(
        channelId: Snowflake,
        params?: GetChannelMessagesQueryStringParams,
    ): RouteStructure<MessageStructure[], GetChannelMessagesQueryStringParams> {
        return {
            method: RestMethods.Get,
            path: `/channels/${channelId}/messages`,
            query: params,
        };
    },
} as const;
