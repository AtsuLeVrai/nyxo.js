import type { Snowflake } from "@nyxjs/core";
import type { ChannelStructure } from "./channels";
import type { GuildStructure } from "./guilds";
import type { UserStructure } from "./users";

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#webhook-object-webhook-types}
 */
export enum WebhookTypes {
	/**
	 * Incoming Webhooks can post messages to channels with a generated token
	 */
	Incoming = 1,
	/**
	 * Channel Follower Webhooks are internal webhooks used with Channel Following to post new messages into channels
	 */
	ChannelFollower = 2,
	/**
	 * Application webhooks are webhooks used with Interactions
	 */
	Application = 3,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#webhook-object-webhook-structure}
 */
export type WebhookStructure = {
	/**
	 * The bot/OAuth2 application that created this webhook
	 */
	application_id: Snowflake | null;
	/**
	 * The default user avatar hash of the webhook
	 */
	avatar: string | null;
	/**
	 * The channel id this webhook is for, if any
	 */
	channel_id?: Snowflake | null;
	/**
	 * The guild id this webhook is for, if any
	 */
	guild_id?: Snowflake | null;
	/**
	 * The id of the webhook
	 */
	id: Snowflake;
	/**
	 * The default name of the webhook
	 */
	name: string | null;
	/**
	 * The channel that this webhook is following (returned for Channel Follower Webhooks)
	 */
	source_channel?: Pick<ChannelStructure, "id" | "name">;
	/**
	 * The guild of the channel that this webhook is following (returned for Channel Follower Webhooks)
	 */
	source_guild?: Pick<GuildStructure, "icon" | "id" | "name">;
	/**
	 * The secure token of the webhook (returned for Incoming Webhooks)
	 */
	token?: string;
	/**
	 * The type of the webhook
	 */
	type: WebhookTypes;
	/**
	 * The url used for executing the webhook (returned by the webhooks OAuth2 flow)
	 */
	url?: string;
	/**
	 * The user this webhook was created by (not returned when getting a webhook with its token)
	 */
	user?: UserStructure;
};
