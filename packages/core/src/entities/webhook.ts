import type { Snowflake } from "../utils/index.js";
import type { ChannelEntity } from "./channel.js";
import type { GuildEntity } from "./guild.js";
import type { UserEntity } from "./user.js";

/**
 * Represents the type of webhook.
 *
 * @remarks
 * Webhooks are a low-effort way to post messages to channels in Discord.
 * These types don't include webhook events (outgoing webhooks sent by Discord).
 *
 * @example
 * ```typescript
 * const type: WebhookType = WebhookType.Incoming;
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/webhook#webhook-object-webhook-types}
 */
export enum WebhookType {
  /** Incoming Webhooks can post messages to channels with a generated token */
  Incoming = 1,
  /** Channel Follower Webhooks are internal webhooks used with Channel Following to post new messages into channels */
  ChannelFollower = 2,
  /** Application webhooks are webhooks used with Interactions */
  Application = 3,
}

/**
 * Represents a webhook in Discord.
 *
 * @remarks
 * Webhooks are a way to send messages to channels without needing a bot user or authentication.
 * They can be used to post messages, execute Slack/GitHub compatible webhooks, and more.
 * Webhooks have a secure token that should be kept private.
 *
 * @example
 * ```typescript
 * const webhook: WebhookEntity = {
 *   id: "223704706495545344",
 *   type: WebhookType.Incoming,
 *   name: "test webhook",
 *   avatar: null,
 *   channel_id: "199737254929760256",
 *   guild_id: "199737254929760256",
 *   application_id: null,
 *   token: "3d89bb7572e0fb30d8128367b3b1b44fecd1726de135cbe28a41f8b2f777c372ba2939e72279b94526ff5d1bd4358d65cf11"
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/webhook#webhook-object-webhook-structure}
 */
export interface WebhookEntity {
  /** Unique identifier of the webhook */
  id: Snowflake;
  /** Type of the webhook */
  type: WebhookType;
  /** Guild ID this webhook is for, if any */
  guild_id?: Snowflake | null;
  /** Channel ID this webhook is for, if any */
  channel_id: Snowflake | null;
  /** User that created this webhook */
  user?: UserEntity;
  /** Default name of the webhook (1-80 characters) */
  name: string | null;
  /** Default avatar hash of the webhook */
  avatar: string | null;
  /** Secure token of the webhook (returned for Incoming Webhooks) */
  token?: string;
  /** The bot/OAuth2 application that created this webhook */
  application_id: Snowflake | null;
  /** The guild of the channel that this webhook is following (returned for Channel Follower Webhooks) */
  source_guild?: Partial<GuildEntity>;
  /** The channel that this webhook is following (returned for Channel Follower Webhooks) */
  source_channel?: Partial<ChannelEntity>;
  /** The url used for executing the webhook (returned by the webhooks OAuth2 flow) */
  url?: string;
}
