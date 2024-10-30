import type {
    ActionRowStructure,
    AllowedMentionStructure,
    AttachmentStructure,
    BitfieldResolvable,
    EmbedStructure,
    MessageFlags,
    MessageStructure,
    PollCreateRequestStructure,
    Snowflake,
    WebhookStructure,
} from "@nyxjs/core";
import { FileUploadManager } from "../managers/index.js";
import { type QueryStringParams, RestMethods, type RouteStructure } from "../types/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#delete-webhook-message-query-string-params|Delete Webhook Message}
 */
export type DeleteWebhookMessageQueryStringParams = Pick<QueryStringParams, "thread_id">;

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#edit-webhook-message-jsonform-params|Edit Webhook Message JSON/Form Params}
 */
export type EditWebhookMessageJsonFormParams = {
    /**
     * The message contents (up to 2000 characters)
     */
    content?: string;
    /**
     * Embedded rich content
     */
    embeds?: EmbedStructure[];
    /**
     * Allowed mentions for the message
     */
    allowed_mentions?: AllowedMentionStructure;
    /**
     * The components to include with the message
     */
    components?: ActionRowStructure[];
    /**
     * The contents of the file being sent/edited
     */
    files?: string[];
    /**
     * JSON encoded body of non-file params (multipart/form-data only)
     */
    payload_json?: string;
    /**
     * Attached files to keep and possible descriptions for new files
     */
    attachments?: Partial<AttachmentStructure>[];
    /**
     * A poll!
     */
    poll?: PollCreateRequestStructure;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#edit-webhook-message-query-string-params|Edit Webhook Message Query String Params}
 */
export type EditWebhookMessageQueryStringParams = Pick<QueryStringParams, "thread_id">;

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook-message-query-string-params|Get Webhook Message Query String Params}
 */
export type GetWebhookMessageQueryStringParams = Pick<QueryStringParams, "thread_id">;

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#execute-githubcompatible-webhook-query-string-params|Execute GitHub-Compatible Webhook Query String Params}
 */
export type ExecuteGitHubCompatibleWebhookQueryStringParams = Pick<QueryStringParams, "thread_id"> & {
    /**
     * Wait for server to confirm message create before response
     */
    wait?: boolean;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#execute-slackcompatible-webhook-query-string-params|Execute Slack-Compatible Webhook Query String Params}
 */
export type ExecuteSlackCompatibleWebhookQueryStringParams = ExecuteGitHubCompatibleWebhookQueryStringParams;

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook-jsonform-params|Execute Webhook JSON/Form Params}
 */
export type ExecuteWebhookJsonFormParams = {
    /**
     * The message contents (up to 2000 characters)
     */
    content: string;
    /**
     * Override the default username of the webhook
     */
    username: string;
    /**
     * Override the default avatar of the webhook
     */
    avatar_url: string;
    /**
     * True if this is a TTS message
     */
    tts: boolean;
    /**
     * Embedded rich content
     */
    embeds: EmbedStructure[];
    /**
     * Allowed mentions for the message
     */
    allowed_mentions: AllowedMentionStructure;
    /**
     * The components to include with the message
     */
    components: ActionRowStructure[];
    /**
     * The contents of the file being sent
     */
    files: string[];
    /**
     * JSON encoded body of non-file params (multipart/form-data only)
     */
    payload_json: string;
    /**
     * Attached files to keep and possible descriptions for new files
     */
    attachments: Partial<AttachmentStructure>[];
    /**
     * Message flags combined as a bitfield (only SUPPRESS_EMBEDS and SUPPRESS_NOTIFICATIONS can be set)
     */
    flags: BitfieldResolvable<MessageFlags.SuppressEmbeds | MessageFlags.SuppressNotifications>;
    /**
     * Name of thread to create (requires the webhook channel to be a forum or media channel)
     */
    thread_name: string;
    /**
     * Array of tag ids to apply to the thread (requires the webhook channel to be a forum or media channel)
     */
    applied_tags: Snowflake[];
    /**
     * A poll!
     */
    poll: PollCreateRequestStructure;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook-query-string-params|Execute Webhook Query String Params}
 */
export type ExecuteWebhookQueryStringParams = ExecuteGitHubCompatibleWebhookQueryStringParams;

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook-json-params|Modify Webhook JSON Params}
 */
export type ModifyWebhookJsonParams = {
    /**
     * The default name of the webhook
     */
    name?: string;
    /**
     * Image for the default webhook avatar
     */
    avatar?: string;
    /**
     * The new channel id this webhook should be moved to
     */
    channel_id?: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#create-webhook-json-params|Create Webhook JSON Params}
 */
export type CreateWebhookJsonParams = {
    /**
     * The name of the webhook (1-80 characters)
     */
    name: string;
    /**
     * Image for the default webhook avatar
     */
    avatar?: string;
};

export class WebhookRoutes {
    /**
     * @see {@link https://discord.com/developers/docs/resources/webhook#delete-webhook-message|Delete Webhook Message}
     */
    static deleteWebhookMessage(
        webhookId: Snowflake,
        token: string,
        messageId: Snowflake,
        params?: DeleteWebhookMessageQueryStringParams
    ): RouteStructure<void> {
        return {
            method: RestMethods.Delete,
            path: `/webhooks/${webhookId}/${token}/messages/${messageId}`,
            query: params,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/webhook#edit-webhook-message|Edit Webhook Message}
     */
    static editWebhookMessage(
        webhookId: Snowflake,
        token: string,
        messageId: Snowflake,
        params: EditWebhookMessageJsonFormParams,
        query?: EditWebhookMessageQueryStringParams
    ): RouteStructure<MessageStructure> {
        const { files, ...restParams } = params;
        const form = new FileUploadManager();
        form.addPayload(restParams);

        if (files) {
            void form.addFiles(files);
        }

        return {
            method: RestMethods.Patch,
            path: `/webhooks/${webhookId}/${token}/messages/${messageId}`,
            body: form.toBuffer(),
            headers: form.getHeaders(),
            query,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook-message|Get Webhook Message}
     */
    static getWebhookMessage(
        webhookId: Snowflake,
        token: string,
        messageId: Snowflake,
        params?: GetWebhookMessageQueryStringParams
    ): RouteStructure<MessageStructure> {
        return {
            method: RestMethods.Get,
            path: `/webhooks/${webhookId}/${token}/messages/${messageId}`,
            query: params,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/webhook#execute-githubcompatible-webhook|Execute GitHub-Compatible Webhook}
     */
    static executeGitHubCompatibleWebhook(
        webhookId: Snowflake,
        token: string,
        params?: ExecuteGitHubCompatibleWebhookQueryStringParams
    ): RouteStructure<void> {
        return {
            method: RestMethods.Post,
            path: `/webhooks/${webhookId}/${token}/github`,
            query: params,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/webhook#execute-slackcompatible-webhook|Execute Slack-Compatible Webhook}
     */
    static executeSlackCompatibleWebhook(
        webhookId: Snowflake,
        token: string,
        params?: ExecuteSlackCompatibleWebhookQueryStringParams
    ): RouteStructure<void> {
        return {
            method: RestMethods.Post,
            path: `/webhooks/${webhookId}/${token}/slack`,
            query: params,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook|Execute Webhook}
     */
    static executeWebhook(
        webhookId: Snowflake,
        token: string,
        params: ExecuteWebhookJsonFormParams,
        query?: ExecuteWebhookQueryStringParams
    ): RouteStructure<MessageStructure> {
        const { files, ...restParams } = params;
        const form = new FileUploadManager();
        form.addPayload(restParams);

        if (files) {
            void form.addFiles(files);
        }

        return {
            method: RestMethods.Post,
            path: `/webhooks/${webhookId}/${token}`,
            body: form.toBuffer(),
            headers: form.getHeaders(),
            query,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/webhook#delete-webhook-with-token|Delete Webhook with Token}
     */
    static deleteWebhookWithToken(webhookId: Snowflake, token: string, reason?: string): RouteStructure<void> {
        const headers: Record<string, string> = {};

        if (reason) {
            headers["X-Audit-Log-Reason"] = reason;
        }

        return {
            method: RestMethods.Delete,
            path: `/webhooks/${webhookId}/${token}`,
            headers,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/webhook#delete-webhook|Delete Webhook}
     */
    static deleteWebhook(webhookId: Snowflake, reason?: string): RouteStructure<void> {
        const headers: Record<string, string> = {};

        if (reason) {
            headers["X-Audit-Log-Reason"] = reason;
        }

        return {
            method: RestMethods.Delete,
            path: `/webhooks/${webhookId}`,
            headers,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook-with-token|Modify Webhook with Token}
     */
    static modifyWebhookWithToken(
        webhookId: Snowflake,
        token: string,
        params: ModifyWebhookJsonParams,
        reason?: string
    ): RouteStructure<WebhookStructure> {
        const headers: Record<string, string> = {};

        if (reason) {
            headers["X-Audit-Log-Reason"] = reason;
        }

        return {
            method: RestMethods.Patch,
            path: `/webhooks/${webhookId}/${token}`,
            body: Buffer.from(JSON.stringify(params)),
            headers,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook|Modify Webhook}
     */
    static modifyWebhook(
        webhookId: Snowflake,
        params: ModifyWebhookJsonParams,
        reason?: string
    ): RouteStructure<WebhookStructure> {
        const headers: Record<string, string> = {};

        if (reason) {
            headers["X-Audit-Log-Reason"] = reason;
        }

        return {
            method: RestMethods.Patch,
            path: `/webhooks/${webhookId}`,
            body: Buffer.from(JSON.stringify(params)),
            headers,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook-with-token|Get Webhook with Token}
     */
    static getWebhookWithToken(webhookId: Snowflake, token: string): RouteStructure<WebhookStructure> {
        return {
            method: RestMethods.Get,
            path: `/webhooks/${webhookId}/${token}`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook|Get Webhook}
     */
    static getWebhook(webhookId: Snowflake): RouteStructure<WebhookStructure> {
        return {
            method: RestMethods.Get,
            path: `/webhooks/${webhookId}`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/webhook#get-guild-webhooks|Get Guild Webhooks}
     */
    static getGuildWebhooks(guildId: Snowflake): RouteStructure<WebhookStructure[]> {
        return {
            method: RestMethods.Get,
            path: `/guilds/${guildId}/webhooks`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/webhook#get-channel-webhooks|Get Channel Webhooks}
     */
    static getChannelWebhooks(channelId: Snowflake): RouteStructure<WebhookStructure[]> {
        return {
            method: RestMethods.Get,
            path: `/channels/${channelId}/webhooks`,
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/webhook#create-webhook|Create Webhook}
     */
    static createWebhook(
        channelId: Snowflake,
        params: CreateWebhookJsonParams,
        reason?: string
    ): RouteStructure<WebhookStructure> {
        const headers: Record<string, string> = {};

        if (reason) {
            headers["X-Audit-Log-Reason"] = reason;
        }

        return {
            method: RestMethods.Post,
            path: `/channels/${channelId}/webhooks`,
            body: Buffer.from(JSON.stringify(params)),
            headers,
        };
    }
}
