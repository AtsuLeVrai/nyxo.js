import type { DeepNonNullable } from "../../utils/index.js";
import type { AnyChannelEntity } from "../channel/index.js";
import type { GuildEntity } from "../guild/index.js";
import type { UserEntity } from "../user/index.js";

/**
 * @description Discord webhook types defining the purpose and functionality of webhooks.
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
 * @description Discord webhook object representing a webhook for posting messages to channels.
 * @see {@link https://discord.com/developers/docs/resources/webhook#webhook-object-webhook-structure}
 */
export interface WebhookEntity {
  /** Snowflake ID of the webhook */
  id: string;
  /** Type of the webhook */
  type: WebhookType;
  /** Snowflake ID of the guild this webhook is for, if any */
  guild_id?: string | null;
  /** Snowflake ID of the channel this webhook is for, if any */
  channel_id: string | null;
  /** User this webhook was created by (not returned when getting a webhook with its token) */
  user?: UserEntity | null;
  /** Default name of the webhook */
  name?: string | null;
  /** Default user avatar hash of the webhook */
  avatar?: string | null;
  /** Secure token of the webhook (returned for Incoming Webhooks) */
  token?: string;
  /** Snowflake ID of the bot/OAuth2 application that created this webhook */
  application_id: string | null;
  /** Guild of the channel that this webhook is following (returned for Channel Follower Webhooks) */
  source_guild?: Partial<GuildEntity> | null;
  /** Channel that this webhook is following (returned for Channel Follower Webhooks) */
  source_channel?: AnyChannelEntity | null;
  /** URL used for executing the webhook (returned by the webhooks OAuth2 flow) */
  url?: string;
}

/**
 * @description Incoming webhook entity for posting messages to channels with a generated token.
 * Excludes source_guild and source_channel fields which are only for Channel Follower webhooks.
 * @see {@link https://discord.com/developers/docs/resources/webhook#webhook-object-webhook-types}
 */
export interface IncomingWebhookEntity
  extends Omit<WebhookEntity, "source_guild" | "source_channel"> {
  /** Must be Incoming webhook type */
  type: WebhookType.Incoming;
}

/**
 * @description Channel Follower webhook entity used with Channel Following to post new messages into channels.
 * Excludes token and url fields which are only for Incoming webhooks.
 * @see {@link https://discord.com/developers/docs/resources/webhook#webhook-object-webhook-types}
 */
export interface ChannelFollowerWebhookEntity extends Omit<WebhookEntity, "token" | "url"> {
  /** Must be Channel Follower webhook type */
  type: WebhookType.ChannelFollower;
  /** Required guild ID for Channel Follower webhooks */
  guild_id: string;
  /** Required channel ID for Channel Follower webhooks */
  channel_id: string;
}

/**
 * @description Application webhook entity used with Interactions for bot responses.
 * Only includes minimal fields needed for application webhooks.
 * @see {@link https://discord.com/developers/docs/resources/webhook#webhook-object-webhook-types}
 */
export interface ApplicationWebhookEntity extends Pick<WebhookEntity, "id" | "name" | "avatar"> {
  /** Must be Application webhook type */
  type: WebhookType.Application;
  /** Required application ID for Application webhooks */
  application_id: string;
}

/**
 * @description Union type for all Discord webhook entity variations.
 */
export type AnyWebhookEntity =
  | IncomingWebhookEntity
  | ChannelFollowerWebhookEntity
  | ApplicationWebhookEntity;

/**
 * @description Gateway event data when webhooks are updated in a guild.
 * Excludes Application webhooks as they don't trigger guild webhook updates.
 * @see {@link https://discord.com/developers/docs/events/gateway-events#webhooks-update}
 */
export type GatewayWebhooksUpdateEntity = Required<
  DeepNonNullable<
    Pick<Exclude<AnyWebhookEntity, ApplicationWebhookEntity>, "guild_id" | "channel_id">
  >
>;

/**
 * @description Validates a webhook name according to Discord's naming restrictions.
 * Webhook names cannot contain "clyde" or "discord" (case-insensitive) and must be 1-80 characters.
 *
 * @param name - The webhook name to validate
 * @returns True if the name is valid according to Discord's rules
 *
 * @example
 * ```typescript
 * isValidWebhookName("My Bot"); // true
 * isValidWebhookName("Clyde Bot"); // false - contains "clyde"
 * isValidWebhookName(""); // false - empty name
 * isValidWebhookName("a".repeat(81)); // false - too long
 * ```
 */
export function isValidWebhookName(name: AnyWebhookEntity["name"]): boolean {
  if (!name) {
    return false;
  }

  if (name.toLowerCase().includes("clyde") || name.toLowerCase().includes("discord")) {
    return false;
  }

  return !(name.length === 0 || name.length > 80);
}
