import type { Snowflake } from "../managers/index.js";
import type { AnyChannelEntity } from "./channel.entity.js";
import type { GuildEntity } from "./guild.entity.js";
import type { UserEntity } from "./user.entity.js";

/**
 * Represents the types of webhooks available in Discord.
 * Each type has a specific purpose and behavior in the Discord ecosystem.
 *
 * @remarks
 * These types are for incoming webhooks (posting to Discord) and do not include
 * outgoing webhook events that Discord can send to external services.
 *
 * @see {@link https://discord.com/developers/docs/resources/webhook#webhook-object-webhook-types}
 */
export enum WebhookType {
  /**
   * Incoming Webhooks can post messages to channels with a generated token (1)
   * These are the standard webhooks that can be created through the Discord UI or API
   * and allow external services to send messages to a Discord channel
   */
  Incoming = 1,

  /**
   * Channel Follower Webhooks are internal webhooks used with Channel Following to post new messages into channels (2)
   * These webhooks are automatically created when a channel is followed
   * and are used to cross-post messages from the source channel
   */
  ChannelFollower = 2,

  /**
   * Application webhooks are webhooks used with Interactions (3)
   * These webhooks are associated with applications and interactions
   * and provide a persistent way to respond to interactions
   */
  Application = 3,
}

/**
 * Validates a webhook name according to Discord's requirements.
 * Discord enforces specific rules for webhook names to prevent abuse and impersonation.
 *
 * Validation rules:
 * - Must not contain 'clyde' or 'discord' (case insensitive)
 * - Must follow nickname guidelines (similar to username requirements)
 * - Must be between 1-80 characters in length
 *
 * @param name The webhook name to validate
 * @returns Whether the name is valid according to Discord's requirements
 *
 * @see {@link https://discord.com/developers/docs/resources/webhook#create-webhook}
 */
export function isValidWebhookName(name?: string | null): boolean {
  if (!name) {
    return false;
  }

  // Check for forbidden substrings (case insensitive)
  if (
    name.toLowerCase().includes("clyde") ||
    name.toLowerCase().includes("discord")
  ) {
    return false;
  }

  // Check length (1-80 characters)
  if (name.length === 0 || name.length > 80) {
    return false;
  }

  // Follows the nickname guidelines (simplified)
  return true;
}

/**
 * Represents a Discord webhook, which is a low-effort way to post messages to channels.
 * Webhooks do not require a bot user or authentication to use.
 *
 * @remarks
 * - Webhooks can be used to post messages to channels without needing a bot
 * - There are three types of webhooks: Incoming, Channel Follower, and Application
 * - Creating and managing webhooks requires the MANAGE_WEBHOOKS permission
 * - Webhook names cannot contain 'clyde' or 'discord' and must be 1-80 characters
 * - Webhooks can be executed by anyone who has their token
 * - Channel Follower webhooks are created when a channel is followed and cannot be manually created
 *
 * @see {@link https://discord.com/developers/docs/resources/webhook#webhook-object}
 */
export interface WebhookEntity {
  /**
   * The ID of the webhook
   * Unique identifier for the webhook
   */
  id: Snowflake;

  /**
   * The type of the webhook
   * Determines the webhook's behavior and origin (Incoming, Channel Follower, or Application)
   */
  type: WebhookType;

  /**
   * The guild ID this webhook is for, if any
   * May be null for global webhooks not associated with a specific guild
   */
  guild_id?: Snowflake | null;

  /**
   * The channel ID this webhook is for, if any
   * The target channel where messages sent through this webhook will appear
   * May be null for Application webhooks
   */
  channel_id: Snowflake | null;

  /**
   * The user this webhook was created by
   * Not returned when getting a webhook with its token for security reasons
   * Contains information about the user who originally created the webhook
   */
  user?: UserEntity | null;

  /**
   * The default name of the webhook (1-80 characters)
   * The name that will be used when sending messages if no override is provided
   * Must not contain 'clyde' or 'discord' (case insensitive)
   * @minLength 1
   * @maxLength 80
   * @nullable
   * @optional
   * @validate Webhook name must not contain 'clyde' or 'discord' and must be 1-80 characters
   */
  name?: string | null;

  /**
   * The default user avatar hash of the webhook
   * Used to construct the webhook's default avatar URL
   * Can be null if no custom avatar has been set
   */
  avatar?: string | null;

  /**
   * The secure token of the webhook (returned for Incoming Webhooks)
   * This token is used to execute the webhook and should be kept secret
   * Only returned for Incoming webhooks and when creating webhooks
   */
  token?: string;

  /**
   * The bot/OAuth2 application that created this webhook
   * For Application webhooks, references the application that owns it
   * Will be null for manually created webhooks
   */
  application_id: Snowflake | null;

  /**
   * The guild of the channel that this webhook is following (returned for Channel Follower Webhooks).
   * Contains partial information about the source guild
   * Will be absent if the webhook creator has lost access to the guild.
   */
  source_guild?: Partial<GuildEntity> | null;

  /**
   * The channel that this webhook is following (returned for Channel Follower Webhooks).
   * Contains information about the source channel being followed
   * Will be absent if the webhook creator has lost access to the guild.
   */
  source_channel?: AnyChannelEntity | null;

  /**
   * The URL used for executing the webhook (returned by the webhooks OAuth2 flow)
   * A complete URL that can be used to execute the webhook directly
   * Only returned in certain contexts, such as the OAuth2 flow
   * @format url
   * @optional
   */
  url?: string;
}
