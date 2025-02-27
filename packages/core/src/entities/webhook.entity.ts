import { z } from "zod";
import { Snowflake } from "../managers/index.js";
import { AnyChannelEntity } from "./channel.entity.js";
import { GuildEntity } from "./guild.entity.js";
import { UserEntity } from "./user.entity.js";

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
export const WebhookEntity = z.object({
  /** The ID of the webhook */
  id: Snowflake,

  /** The type of the webhook */
  type: z.nativeEnum(WebhookType),

  /** The guild ID this webhook is for, if any */
  guild_id: Snowflake.nullish(),

  /** The channel ID this webhook is for, if any */
  channel_id: Snowflake.nullish(),

  /** The user this webhook was created by (not returned when getting a webhook with its token) */
  user: UserEntity.nullish(),

  /** The default name of the webhook */
  name: z.string().nullish(),

  /** The default user avatar hash of the webhook */
  avatar: z.string().nullish(),

  /** The secure token of the webhook (returned for Incoming Webhooks) */
  token: z.string().optional(),

  /** The bot/OAuth2 application that created this webhook */
  application_id: Snowflake.nullable(),

  /** The guild of the channel that this webhook is following (returned for Channel Follower Webhooks) */
  source_guild: GuildEntity.partial().nullish(),

  /** The channel that this webhook is following (returned for Channel Follower Webhooks) */
  source_channel: AnyChannelEntity.nullish(),

  /** The URL used for executing the webhook (returned by the webhooks OAuth2 flow) */
  url: z.string().url().optional(),
});

export type WebhookEntity = z.infer<typeof WebhookEntity>;
