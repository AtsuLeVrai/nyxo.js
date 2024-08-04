import type { Snowflake } from "@nyxjs/core";
import type { RESTMakeRequestOptions } from "../globals/rest";

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
export function deleteWebhookMessage(
	webhookId: Snowflake,
	webhookToken: string,
	messageId: Snowflake,
	query?: DeleteWebhookMessageQueryStringParams,
): RESTMakeRequestOptions<void> {
	return {
		method: "DELETE",
		path: `/webhooks/${webhookId}/${webhookToken}/messages/${messageId}`,
		query,
	};
}
