import { z } from "zod";
import { Snowflake } from "../managers/index.js";
import { AnyChannelEntity } from "./channel.entity.js";
import { GuildEntity } from "./guild.entity.js";
import { UserEntity } from "./user.entity.js";

/**
 * Represents the types of webhooks available in Discord.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/webhook.md#webhook-types}
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
 * Validates a webhook name according to Discord's requirements.
 * - Must not contain 'clyde' or 'discord' (case insensitive)
 * - Must follow nickname guidelines
 * - Can be up to 80 characters
 *
 * @param name The webhook name to validate
 * @returns Whether the name is valid
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
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/webhook.md#webhook-object}
 */
export const WebhookEntity = z.object({
  /** The ID of the webhook */
  id: Snowflake,

  /** The type of the webhook */
  type: z.nativeEnum(WebhookType),

  /** The guild ID this webhook is for, if any */
  guild_id: Snowflake.nullish(),

  /** The channel ID this webhook is for, if any */
  channel_id: Snowflake.nullable(),

  /** The user this webhook was created by (not returned when getting a webhook with its token) */
  user: UserEntity.nullish(),

  /** The default name of the webhook (1-80 characters) */
  name: z.string().nullable().optional().refine(isValidWebhookName, {
    message:
      "Webhook name must not contain 'clyde' or 'discord' and must be 1-80 characters",
  }),

  /** The default user avatar hash of the webhook */
  avatar: z.string().nullish(),

  /** The secure token of the webhook (returned for Incoming Webhooks) */
  token: z.string().optional(),

  /** The bot/OAuth2 application that created this webhook */
  application_id: Snowflake.nullable(),

  /**
   * The guild of the channel that this webhook is following (returned for Channel Follower Webhooks).
   * Will be absent if the webhook creator has lost access to the guild.
   */
  source_guild: GuildEntity.partial().nullish(),

  /**
   * The channel that this webhook is following (returned for Channel Follower Webhooks).
   * Will be absent if the webhook creator has lost access to the guild.
   */
  source_channel: AnyChannelEntity.nullish(),

  /** The URL used for executing the webhook (returned by the webhooks OAuth2 flow) */
  url: z.string().url().optional(),
});

export type WebhookEntity = z.infer<typeof WebhookEntity>;
