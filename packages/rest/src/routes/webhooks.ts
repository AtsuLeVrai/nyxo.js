import type { RestHttpResponseCodes, Snowflake } from "@nyxjs/core";
import type { FormData } from "undici";
import type { ActionRowStructure } from "../structures/interactions";
import type {
	AllowedMentionsStructure,
	AttachmentStructure,
	EmbedStructure,
	MessageStructure,
} from "../structures/messages";
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
function deleteWebhookMessage(webhookId: Snowflake, webhookToken: string, messageId: Snowflake, query?: DeleteWebhookMessageQueryStringParams): RestRequestOptions<RestHttpResponseCodes.NoContent> {
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
 */
function editWebhookMessage(webhookId: Snowflake, webhookToken: string, messageId: Snowflake, json: EditWebhookMessageJSONFormParams, query?: EditWebhookMessageQueryStringParams): RestRequestOptions<MessageStructure> {
	const body: EditWebhookMessageJSONFormParams = {};
	if (json.content !== undefined) {
		body.content = json.content;
	}

	if (json.embeds !== undefined) {
		body.embeds = json.embeds;
	}

	if (json.allowed_mentions !== undefined) {
		body.allowed_mentions = json.allowed_mentions;
	}

	if (json.components !== undefined) {
		body.components = json.components;
	}

	if (json.attachments !== undefined) {
		body.attachments = json.attachments;
	}

	const bodyStringify: FormData | string = JSON.stringify(body);

	/*	if (json.files) {
            const formData = new FormData();
            formData.append("payload_json", JSON.stringify(body));
            for (const [index, [filename, content]] of Object.entries(json.files).entries()) {
                formData.append(`files[${index}]`, new Blob([content]), filename);
            }

            bodyStringify = formData;
        }*/

	return {
		method: "PATCH",
		path: `/webhooks/${webhookId}/${webhookToken}/messages/${messageId}`,
		body: bodyStringify,
		headers: { "Content-Type": "multipart/form-data" },
		query,
	};
}
