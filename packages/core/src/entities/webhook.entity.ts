import type { Snowflake } from "../managers/index.js";
import type { AnyChannelEntity } from "./channel.entity.js";
import type { GuildEntity } from "./guild.entity.js";
import type { UserEntity } from "./user.entity.js";

/**
 * Represents the types of webhooks available in Discord.
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
 * Represents a Discord webhook, which is a low-effort way to post messages to channels.
 * Webhooks do not require a bot user or authentication to use.
 * @see {@link https://discord.com/developers/docs/resources/webhook#webhook-object}
 */
export interface WebhookEntity {
  /** The ID of the webhook */
  id: Snowflake;

  /** The type of the webhook */
  type: WebhookType;

  /** The guild ID this webhook is for, if any */
  guild_id?: Snowflake | null;

  /** The channel ID this webhook is for, if any */
  channel_id?: Snowflake | null;

  /** The user this webhook was created by (not returned when getting a webhook with its token) */
  user?: UserEntity | null;

  /** The default name of the webhook */
  name?: string | null;

  /** The default user avatar hash of the webhook */
  avatar?: string | null;

  /** The secure token of the webhook (returned for Incoming Webhooks) */
  token?: string;

  /** The bot/OAuth2 application that created this webhook */
  application_id: Snowflake | null;

  /** The guild of the channel that this webhook is following (returned for Channel Follower Webhooks) */
  source_guild?: Partial<GuildEntity> | null;

  /** The channel that this webhook is following (returned for Channel Follower Webhooks) */
  source_channel?: AnyChannelEntity | null;

  /** The URL used for executing the webhook (returned by the webhooks OAuth2 flow) */
  url?: string;
}
