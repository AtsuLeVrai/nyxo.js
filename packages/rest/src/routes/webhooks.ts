import type {
	AllowedMentionsStructure,
	AttachmentStructure,
	Boolean,
	ComponentStructure,
	EmbedStructure,
	MessageFlags,
	MessageStructure,
	PollCreateRequestStructure,
	Snowflake,
	WebhookStructure,
} from "@lunajs/core";
import { FormData } from "undici";
import type { RestRequestOptions } from "../globals/rest";

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#create-webhook-json-params}
 */
export type CreateWebhookJSON = {
	/**
	 * Image for the default webhook avatar
	 */
	avatar?: string | null;
	/**
	 * Name of the webhook (1-80 characters)
	 */
	name: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#create-webhook}
 */
export function createWebhook(channelId: Snowflake, json: CreateWebhookJSON): RestRequestOptions<WebhookStructure> {
	return {
		method: "POST",
		path: `/channels/${channelId}/webhooks`,
		body: JSON.stringify(json),
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#get-channel-webhooks}
 */
export function getChannelWebhooks(channelId: Snowflake): RestRequestOptions<WebhookStructure[]> {
	return {
		method: "GET",
		path: `/channels/${channelId}/webhooks`,
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#get-guild-webhooks}
 */
export function getGuildWebhooks(guildId: Snowflake): RestRequestOptions<WebhookStructure[]> {
	return {
		method: "GET",
		path: `/guilds/${guildId}/webhooks`,
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook}
 */
export function getWebhook(webhookId: Snowflake): RestRequestOptions<WebhookStructure> {
	return {
		method: "GET",
		path: `/webhooks/${webhookId}`,
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook-with-token}
 */
export function getWebhookWithToken(webhookId: Snowflake, token: string): RestRequestOptions<WebhookStructure> {
	return {
		method: "GET",
		path: `/webhooks/${webhookId}/${token}`,
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook-json-params}
 */
export type ModifyWebhookJSON = {
	/**
	 * Image for the default webhook avatar
	 */
	avatar?: string | null;
	/**
	 * The new channel ID this webhook should be moved to
	 */
	channel_id?: Snowflake;
	/**
	 * The default name of the webhook
	 */
	name?: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook}
 */
export function modifyWebhook(webhookId: Snowflake, reason: string, json: ModifyWebhookJSON): RestRequestOptions<WebhookStructure> {
	return {
		method: "PATCH",
		path: `/webhooks/${webhookId}`,
		body: JSON.stringify(json),
		headers: { "X-Audit-Log-Reason": reason },
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook-with-token}
 */
export function modifyWebhookWithToken(webhookId: Snowflake, token: string, reason: string, json: Omit<ModifyWebhookJSON, "channel_id">): RestRequestOptions<Omit<WebhookStructure, "user">> {
	return {
		method: "PATCH",
		path: `/webhooks/${webhookId}/${token}`,
		body: JSON.stringify(json),
		headers: { "X-Audit-Log-Reason": reason },
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#delete-webhook}
 */
export function deleteWebhook(webhookId: Snowflake, reason: string): RestRequestOptions<void> {
	return {
		method: "DELETE",
		path: `/webhooks/${webhookId}`,
		headers: { "X-Audit-Log-Reason": reason },
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#delete-webhook-with-token}
 */
export function deleteWebhookWithToken(webhookId: Snowflake, token: string, reason: string): RestRequestOptions<void> {
	return {
		method: "DELETE",
		path: `/webhooks/${webhookId}/${token}`,
		headers: { "X-Audit-Log-Reason": reason },
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook-query-string-params}
 */
export type ExecuteWebhookQuery = {
	/**
	 * Send a message to the specified thread within a webhook's channel. The thread will automatically be unarchived.
	 */
	thread_id?: Snowflake;
	/**
	 * Waits for server confirmation of message send before response, and returns the created message body (defaults to false; when false a message that is not saved does not return an error)
	 */
	wait?: Boolean;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook-jsonform-params}
 */
export type ExecuteWebhookJSON = {
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
	attachments?: AttachmentStructure[];
	/**
	 * Override the default avatar of the webhook
	 */
	avatar_url?: string;
	/**
	 * The components to include with the message
	 */
	components?: ComponentStructure[];
	/**
	 * The message contents (up to 2000 characters)
	 */
	content?: string;
	/**
	 * Embedded rich content
	 */
	embeds?: EmbedStructure[];
	/**
	 * The contents of the file being sent
	 */
	files?: object[];
	/**
	 * Message flags combined as a bitfield (only SUPPRESS_EMBEDS and SUPPRESS_NOTIFICATIONS can be set can be set)
	 */
	flags?: MessageFlags.SuppressEmbeds | MessageFlags.SuppressNotifications | bigint;
	/**
	 * JSON encoded body of non-file params
	 */
	payload_json?: string;
	/**
	 * A poll!
	 */
	poll?: PollCreateRequestStructure;
	/**
	 * Name of thread to create (requires the webhook channel to be a forum or media channel)
	 */
	thread_name?: string;
	/**
	 * `true` if this is a TTS message
	 */
	tts?: Boolean;
	/**
	 * Override the default username of the webhook
	 */
	username?: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook}
 */
export function executeWebhook(webhookId: Snowflake, token: string, json: Omit<ExecuteWebhookJSON, "payload_json">, query?: ExecuteWebhookQuery): RestRequestOptions<void> {
	const form = new FormData();
	form.append("payload_json", JSON.stringify(json));

	return {
		method: "POST",
		path: `/webhooks/${webhookId}/${token}`,
		body: form,
		query,
		headers: { "Content-Type": "multipart/form-data" },
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook-message-query-string-params}
 */
export type GetWebhookMessageQuery = {
	/**
	 * Id of the thread the message is in
	 */
	thread_id?: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook-message}
 */
export function getWebhookMessage(webhookId: Snowflake, token: string, messageId: Snowflake, query?: GetWebhookMessageQuery): RestRequestOptions<MessageStructure> {
	return {
		method: "GET",
		path: `/webhooks/${webhookId}/${token}/messages/${messageId}`,
		query,
	};
}

/**
 * TODO: Implement
 */
