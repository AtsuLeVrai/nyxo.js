import type { Snowflake } from "@lunajs/core";

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#integration-delete-integration-delete-event-fields}
 */
export type IntegrationDeleteEventFields = {
	/**
	 * ID of the bot/OAuth2 application for this discord integration
	 */
	application_id?: Snowflake;
	/**
	 * ID of the guild
	 */
	guild_id: Snowflake;
	/**
	 * Integration ID
	 */
	id: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#integration-update-integration-update-event-additional-fields}
 */
export type IntegrationUpdateEventFields = {
	/**
	 * ID of the guild
	 */
	guild_id: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#integration-create-integration-create-event-additional-fields}
 */
export type IntegrationCreateEventFields = {
	/**
	 * ID of the guild
	 */
	guild_id: Snowflake;
};
