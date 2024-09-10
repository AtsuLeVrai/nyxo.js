import type {
    ActionRowStructure,
    AllowedMentionsStructure,
    AttachmentStructure,
    EmbedStructure,
    RestHttpResponseCodes,
    Snowflake,
} from "@nyxjs/core";
import type { RestRequestOptions } from "../types/globals";

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#delete-webhook-message-query-string-params}
 */
export type DeleteWebhookMessageQueryStringParams = {
    /**
     * ID of the thread the message is in
     */
    thread_id?: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#delete-webhook-message}
 */
function deleteWebhookMessage(
    webhookId: Snowflake,
    webhookToken: string,
    messageId: Snowflake,
    query?: DeleteWebhookMessageQueryStringParams
): RestRequestOptions<RestHttpResponseCodes.NoContent> {
    return {
        method: "DELETE",
        path: `/webhooks/${webhookId}/${webhookToken}/messages/${messageId}`,
        query,
    };
}

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
    files?: unknown[];
    /**
     * JSON encoded body of non-file params (multipart/form-data only)
     */
    payload_json?: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#edit-webhook-message-query-string-params}
 */
export type EditWebhookMessageQueryStringParams = {
    /**
     * ID of the thread the message is in
     */
    thread_id?: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#edit-webhook-message}
 * TODO: Implement file support
 */
