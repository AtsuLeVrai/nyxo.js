import type { Snowflake } from "../markdown/index.js";
import type { ChannelStructure } from "./channels.js";
import type { GuildStructure } from "./guilds.js";
import type { UserStructure } from "./users.js";

/**
 * Enum representing the different types of webhooks.
 *
 * @see {@link https://discord.com/developers/docs/resources/webhook#webhook-object-webhook-types|Webhook Types}
 */
export enum WebhookTypes {
    /**
     * Incoming Webhooks can post messages to channels with a generated token.
     */
    Incoming = 1,
    /**
     * Channel Follower Webhooks are internal webhooks used with Channel Following to post new messages into channels.
     */
    ChannelFollower = 2,
    /**
     * Application webhooks are webhooks used with Interactions.
     */
    Application = 3,
}

/**
 * Type representing the structure of a webhook.
 *
 * @see {@link https://discord.com/developers/docs/resources/webhook#webhook-object-webhook-structure|Webhook Structure}
 */
export interface WebhookStructure {
    /**
     * The bot/OAuth2 application that created this webhook.
     */
    application_id?: Snowflake | null;
    /**
     * The default user avatar hash of the webhook.
     */
    avatar?: string | null;
    /**
     * The channel id this webhook is for, if any.
     */
    channel_id: Snowflake | null;
    /**
     * The guild id this webhook is for, if any.
     */
    guild_id?: Snowflake | null;
    /**
     * The id of the webhook.
     */
    id: Snowflake;
    /**
     * The default name of the webhook.
     */
    name?: string | null;
    /**
     * The channel that this webhook is following (returned for Channel Follower Webhooks).
     *
     * @todo Verify if this is correct
     */
    source_channel?: Pick<ChannelStructure, "id" | "name">;
    /**
     * The guild of the channel that this webhook is following (returned for Channel Follower Webhooks).
     *
     * @todo Verify if this is correct
     */
    source_guild?: Pick<GuildStructure, "icon" | "id" | "name">;
    /**
     * The secure token of the webhook (returned for Incoming Webhooks).
     */
    token?: string | null;
    /**
     * The type of the webhook.
     */
    type: WebhookTypes;
    /**
     * The url used for executing the webhook (returned by the webhooks OAuth2 flow).
     */
    url?: string | null;
    /**
     * The user this webhook was created by (not returned when getting a webhook with its token).
     */
    user?: UserStructure;
}
