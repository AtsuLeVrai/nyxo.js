import type {
    ActionRowStructure,
    AllowedMentionsStructure,
    AttachmentStructure,
    Boolean,
    DataUriSchema,
    EmbedStructure,
    MessageFlags,
    MessageStructure,
    PollCreateRequestStructure,
    RestHttpResponseCodes,
    Snowflake,
    WebhookStructure,
} from "@nyxjs/core";
import { FileManager } from "../globals/FileManager";
import type { RestRequestOptions } from "../types/globals";

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#delete-webhook-message-query-string-params}
 */
export type WebhookMessageQueryStringParams = {
    /**
     * ID of the thread the message is in
     */
    thread_id?: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#edit-webhook-message-jsonform-params}
 */
export type EditWebhookMessageJSONFormParams = {
    /**
     * Allowed mentions for the message
     */
    allowed_mentions?: AllowedMentionsStructure;
    /**
     * Attached files to keep and possible descriptions for new files
     */
    attachments?: Partial<AttachmentStructure>[];
    /**
     * The components to include with the message
     */
    components?: ActionRowStructure[];
    /**
     * The message contents (up to 2000 characters)
     */
    content?: string;
    /**
     * Embedded rich content
     */
    embeds?: EmbedStructure[];
    /**
     * The contents of the file being sent/edited
     */
    files?: string[];
    /**
     * JSON encoded body of non-file params (multipart/form-data only)
     */
    payload_json?: string;
    /**
     * Poll request object
     */
    poll: PollCreateRequestStructure;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook-jsonform-params}
 */
export type ExecuteWebhookJSONFormParams = {
    /**
     * Allowed mentions for the message
     */
    allowed_mentions?: AllowedMentionsStructure;
    /**
     * Array of tag ids to apply to the thread (requires the webhook channel to be a forum or media channel)
     */
    applied_tags?: Snowflake[];
    /**
     * Attachment objects with filename and description
     */
    attachments?: Pick<AttachmentStructure, "description" | "filename">[];
    /**
     * Override the default avatar of the webhook
     */
    avatar_url?: string;
    /**
     * The components to include with the message
     */
    components?: ActionRowStructure[];
    /**
     * The message contents (up to 2000 characters)
     */
    content: string;
    /**
     * Embedded rich content
     */
    embeds: EmbedStructure[];
    /**
     * The contents of the file being sent
     */
    files: string[];
    /**
     * Message flags combined as a bitfield (only SUPPRESS_EMBEDS and SUPPRESS_NOTIFICATIONS can be set)
     */
    flags?: MessageFlags;
    /**
     * JSON encoded body of non-file params (multipart/form-data only)
     */
    payload_json?: string;
    /**
     * A poll!
     */
    poll: PollCreateRequestStructure;
    /**
     * Name of thread to create (requires the webhook channel to be a forum or media channel)
     */
    thread_name?: string;
    /**
     * True if this is a TTS message
     */
    tts?: boolean;
    /**
     * Override the default username of the webhook
     */
    username?: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook-query-string-params}
 */
export type ExecuteWebhookQueryStringParams = WebhookMessageQueryStringParams & {
    /**
     * waits for server confirmation of message send before response
     */
    wait?: Boolean;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook-json-params}
 */
export type ModifyWebhookJsonParams = {
    /**
     * Image for the default webhook avatar
     */
    avatar: DataUriSchema;
    /**
     * The new channel id this webhook should be moved to
     */
    channel_id: Snowflake;
    /**
     * The default name of the webhook
     */
    name: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#create-webhook-json-params}
 */
export type CreateWebhookJsonParams = {
    /**
     * Image for the default webhook avatar
     */
    avatar?: DataUriSchema;
    /**
     * Name of the webhook (1-80 characters)
     */
    name: string;
};

export class WebhookRoutes {
    /**
     * @see {@link https://discord.com/developers/docs/resources/webhook#delete-webhook-message}
     */
    public static deleteWebhookMessage(
        webhookId: Snowflake,
        webhookToken: string,
        messageId: Snowflake,
        query?: WebhookMessageQueryStringParams
    ): RestRequestOptions<RestHttpResponseCodes.NoContent> {
        return {
            method: "DELETE",
            path: `/webhooks/${webhookId}/${webhookToken}/messages/${messageId}`,
            query,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/webhook#edit-webhook-message}
     */
    public static editWebhookMessage(
        webhookId: Snowflake,
        webhookToken: string,
        messageId: Snowflake,
        json: EditWebhookMessageJSONFormParams,
        query?: WebhookMessageQueryStringParams
    ): RestRequestOptions<MessageStructure> {
        const formData = FileManager.createFormData(
            Object.fromEntries(Object.entries(json).filter(([key]) => key !== "files")),
            json.files
        );

        return {
            method: "PATCH",
            path: `/webhooks/${webhookId}/${webhookToken}/messages/${messageId}`,
            body: formData,
            query,
            headers: {
                "Content-Type": formData.getHeaders(),
            },
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook-message}
     */
    public static getWebhookMessage(
        webhookId: Snowflake,
        webhookToken: string,
        messageId: Snowflake,
        query?: WebhookMessageQueryStringParams
    ): RestRequestOptions<MessageStructure> {
        return {
            method: "GET",
            path: `/webhooks/${webhookId}/${webhookToken}/messages/${messageId}`,
            query,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook}
     */
    public static executeWebhook(
        webhookId: Snowflake,
        webhookToken: string,
        json: ExecuteWebhookJSONFormParams,
        query?: ExecuteWebhookQueryStringParams
    ): RestRequestOptions<MessageStructure> {
        const formData = FileManager.createFormData(
            Object.fromEntries(Object.entries(json).filter(([key]) => key !== "files")),
            json.files
        );

        return {
            method: "POST",
            path: `/webhooks/${webhookId}/${webhookToken}`,
            body: formData,
            query,
            headers: {
                "Content-Type": formData.getHeaders(),
            },
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/webhook#delete-webhook-with-token}
     */
    public static deleteWebhookWithToken(
        webhookId: Snowflake,
        webhookToken: string
    ): RestRequestOptions<RestHttpResponseCodes.NoContent> {
        return {
            method: "DELETE",
            path: `/webhooks/${webhookId}/${webhookToken}`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/webhook#delete-webhook}
     */
    public static deleteWebhook(
        webhookId: Snowflake,
        reason?: string
    ): RestRequestOptions<RestHttpResponseCodes.NoContent> {
        return {
            method: "DELETE",
            path: `/webhooks/${webhookId}`,
            headers: { ...(reason && { "X-Audit-Log-Reason": reason }) },
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook-with-token}
     */
    public static modifyWebhookWithToken(
        webhookId: Snowflake,
        webhookToken: string,
        json: Omit<ModifyWebhookJsonParams, "channel_id">
    ): RestRequestOptions<Omit<WebhookStructure, "user">> {
        return {
            method: "PATCH",
            path: `/webhooks/${webhookId}/${webhookToken}`,
            body: JSON.stringify(json),
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook}
     */
    public static modifyWebhook(
        webhookId: Snowflake,
        json: ModifyWebhookJsonParams,
        reason?: string
    ): RestRequestOptions<WebhookStructure> {
        return {
            method: "PATCH",
            path: `/webhooks/${webhookId}`,
            body: JSON.stringify(json),
            headers: { ...(reason && { "X-Audit-Log-Reason": reason }) },
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook-with-token}
     */
    public static getWebhookWithToken(
        webhookId: Snowflake,
        webhookToken: string
    ): RestRequestOptions<Omit<WebhookStructure, "user">> {
        return {
            method: "GET",
            path: `/webhooks/${webhookId}/${webhookToken}`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook}
     */
    public static getWebhook(webhookId: Snowflake): RestRequestOptions<WebhookStructure> {
        return {
            method: "GET",
            path: `/webhooks/${webhookId}`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/webhook#get-guild-webhooks}
     */
    public static getGuildWebhooks(guildId: Snowflake): RestRequestOptions<WebhookStructure[]> {
        return {
            method: "GET",
            path: `/guilds/${guildId}/webhooks`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/webhook#get-channel-webhooks}
     */
    public static getChannelWebhooks(channelId: Snowflake): RestRequestOptions<WebhookStructure[]> {
        return {
            method: "GET",
            path: `/channels/${channelId}/webhooks`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/webhook#create-webhook}
     */
    public static createWebhook(
        channelId: Snowflake,
        json: CreateWebhookJsonParams,
        reason?: string
    ): RestRequestOptions<WebhookStructure> {
        return {
            method: "POST",
            path: `/channels/${channelId}/webhooks`,
            body: JSON.stringify(json),
            headers: { ...(reason && { "X-Audit-Log-Reason": reason }) },
        };
    }
}
