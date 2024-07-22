import type { Snowflake } from "@lunajs/core";

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#webhooks-update-webhooks-update-event-fields}
 */
export type WebhooksUpdateEventFields = {
	/**
	 * ID of the channel
	 */
	channel_id: Snowflake;
	/**
	 * ID of the guild
	 */
	guild_id: Snowflake;
};
