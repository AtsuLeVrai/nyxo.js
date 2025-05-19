import {
  type FormattedChannel,
  type GuildEntity,
  type Snowflake,
  type WebhookEntity,
  WebhookType,
  formatChannel,
  isValidWebhookName,
} from "@nyxojs/core";
import {
  type AnimatedImageOptions,
  Cdn,
  type UserAvatarUrl,
  type WebhookExecuteOptions,
  type WebhookExecuteParams,
  type WebhookMessageEditOptions,
  type WebhookMessageFetchParams,
  type WebhookUpdateOptions,
} from "@nyxojs/rest";
import type { z } from "zod/v4";
import { BaseClass, Cacheable } from "../bases/index.js";
import type { Enforce, PropsToCamel } from "../types/index.js";
import { channelFactory } from "../utils/index.js";
import type { AnyChannel } from "./channel.class.js";
import { Guild } from "./guild.class.js";
import { Message } from "./message.class.js";
import { User } from "./user.class.js";

/**
 * Represents a Discord webhook, providing methods to interact with and manage webhook data.
 *
 * The Webhook class serves as a comprehensive wrapper around Discord's webhook API, offering:
 * - Access to webhook information (name, avatar, token, etc.)
 * - Methods to execute webhooks and send messages
 * - Management of webhook properties and configuration
 * - Support for specialized webhook types (Slack, GitHub)
 *
 * This class transforms snake_case API responses into camelCase properties for
 * a more JavaScript-friendly interface while maintaining type safety.
 *
 * @see {@link https://discord.com/developers/docs/resources/webhook}
 */
@Cacheable("webhooks")
export class Webhook
  extends BaseClass<WebhookEntity>
  implements Enforce<PropsToCamel<WebhookEntity>>
{
  /**
   * Gets the webhook's unique identifier (Snowflake).
   *
   * This ID is permanent and will not change for the lifetime of the webhook.
   * It can be used for API operations and persistent references.
   *
   * @returns The webhook's ID as a Snowflake string
   */
  get id(): Snowflake {
    return this.rawData.id;
  }

  /**
   * Gets the type of the webhook.
   *
   * The type determines the webhook's behavior and origin:
   * - 1: Incoming webhooks that can post messages to channels with a token
   * - 2: Channel Follower webhooks used with Channel Following
   * - 3: Application webhooks used with Interactions
   *
   * @returns The webhook's type value
   * @see {@link https://discord.com/developers/docs/resources/webhook#webhook-object-webhook-types}
   */
  get type(): WebhookType {
    return this.rawData.type;
  }

  /**
   * Gets the ID of the guild this webhook is for.
   *
   * May be undefined for global webhooks not associated with a specific guild.
   *
   * @returns The guild ID as a Snowflake string, null, or undefined
   */
  get guildId(): Snowflake | null | undefined {
    return this.rawData.guild_id;
  }

  /**
   * Gets the ID of the channel this webhook is for.
   *
   * The target channel where messages sent through this webhook will appear.
   * May be null for Application webhooks.
   *
   * @returns The channel ID as a Snowflake string or null
   */
  get channelId(): Snowflake | null {
    return this.rawData.channel_id;
  }

  /**
   * Gets the user object for the user who created this webhook.
   *
   * This property is not returned when getting a webhook with its token
   * for security reasons.
   *
   * @returns The User object, null, or undefined
   */
  get user(): User | null | undefined {
    if (!this.rawData.user) {
      return this.rawData.user;
    }
    return new User(this.client, this.rawData.user);
  }

  /**
   * Gets the default name of the webhook.
   *
   * The name that will be used when sending messages if no override is provided.
   * Must be 1-80 characters and cannot contain 'clyde' or 'discord' (case insensitive).
   *
   * @returns The webhook name, null, or undefined
   */
  get name(): string | null | undefined {
    return this.rawData.name;
  }

  /**
   * Gets the default avatar hash of the webhook.
   *
   * Used to construct the webhook's default avatar URL.
   * Can be null if no custom avatar has been set.
   *
   * @returns The avatar hash, null, or undefined
   */
  get avatar(): string | null | undefined {
    return this.rawData.avatar;
  }

  /**
   * Gets the secure token of the webhook.
   *
   * This token is used to execute the webhook and should be kept secret.
   * Only returned for Incoming webhooks and when creating webhooks.
   *
   * @returns The webhook token or undefined
   */
  get token(): string | undefined {
    return this.rawData.token;
  }

  /**
   * Gets the ID of the application that created this webhook.
   *
   * For Application webhooks, references the application that owns it.
   * Will be null for manually created webhooks.
   *
   * @returns The application ID or null
   */
  get applicationId(): Snowflake | null {
    return this.rawData.application_id;
  }

  /**
   * Gets the guild of the channel that this webhook is following.
   *
   * Contains partial information about the source guild.
   * Only returned for Channel Follower Webhooks and may be absent if
   * the webhook creator has lost access to the guild.
   *
   * @returns The partial Guild object, null, or undefined
   */
  get sourceGuild(): Guild | null | undefined {
    if (!this.rawData.source_guild) {
      return this.rawData.source_guild;
    }
    return new Guild(this.client, this.rawData.source_guild as GuildEntity);
  }

  /**
   * Gets the channel that this webhook is following.
   *
   * Contains information about the source channel being followed.
   * Only returned for Channel Follower Webhooks and may be absent if
   * the webhook creator has lost access to the guild.
   *
   * @returns The Channel object, null, or undefined
   */
  get sourceChannel(): AnyChannel | null | undefined {
    if (!this.rawData.source_channel) {
      return this.rawData.source_channel;
    }
    return channelFactory(this.client, this.rawData.source_channel);
  }

  /**
   * Gets the URL used for executing the webhook.
   *
   * A complete URL that can be used to execute the webhook directly.
   * Only returned in certain contexts, such as the OAuth2 flow.
   *
   * @returns The webhook URL or undefined
   */
  get url(): string | undefined {
    return this.rawData.url;
  }

  /**
   * Checks if this webhook is an Incoming webhook.
   *
   * Incoming webhooks can post messages to channels with a generated token.
   *
   * @returns True if this is an Incoming webhook, false otherwise
   */
  get isIncoming(): boolean {
    return this.type === WebhookType.Incoming;
  }

  /**
   * Checks if this webhook is a Channel Follower webhook.
   *
   * Channel Follower webhooks are used with Channel Following to post new
   * messages into channels.
   *
   * @returns True if this is a Channel Follower webhook, false otherwise
   */
  get isChannelFollower(): boolean {
    return this.type === WebhookType.ChannelFollower;
  }

  /**
   * Checks if this webhook is an Application webhook.
   *
   * Application webhooks are used with Interactions and provide a
   * persistent way to respond to interactions.
   *
   * @returns True if this is an Application webhook, false otherwise
   */
  get isApplication(): boolean {
    return this.type === WebhookType.Application;
  }

  /**
   * Checks if this webhook has a custom avatar set.
   *
   * @returns True if the webhook has a custom avatar, false otherwise
   */
  get hasAvatar(): boolean {
    return this.avatar !== null && this.avatar !== undefined;
  }

  /**
   * Gets the complete URL for executing this webhook.
   *
   * This URL includes the webhook ID and token and can be used directly
   * with HTTP requests to execute the webhook.
   *
   * @returns The complete execution URL or null if token is not available
   */
  get executionUrl(): string | null {
    if (!this.token) {
      return null;
    }
    return `https://discord.com/api/webhooks/${this.id}/${this.token}`;
  }

  /**
   * Gets the avatar URL for this webhook.
   *
   * @param options - Options for the avatar image (size, format, etc.)
   * @returns The URL for the webhook's avatar or null if not set
   */
  getAvatarUrl(
    options: z.input<typeof AnimatedImageOptions> = {},
  ): UserAvatarUrl | null {
    if (!this.avatar) {
      return null;
    }
    return Cdn.userAvatar(this.id, this.avatar, options);
  }

  /**
   * Executes this webhook to send a message.
   * Must provide at least one of: content, embeds, components, files, or poll.
   *
   * @param options - Options for executing the webhook
   * @param params - Query parameters for the execution
   * @returns A promise resolving to the created message or undefined if wait is false
   * @throws {Error} If the webhook token is not available
   */
  async execute(
    options: WebhookExecuteOptions,
    params?: WebhookExecuteParams,
  ): Promise<Message | undefined> {
    if (!this.token) {
      throw new Error("Webhook token is not available");
    }

    const result = await this.client.rest.webhooks.sendWebhook(
      this.id,
      this.token,
      options,
      params,
    );

    if (params?.wait && result) {
      return new Message(this.client, result);
    }

    return undefined;
  }

  /**
   * A simplified method to send a text message through this webhook.
   *
   * @param content - The text content to send
   * @param wait - Whether to wait for server confirmation and return the message
   * @returns A promise resolving to the created message if wait is true, otherwise undefined
   * @throws {Error} If the webhook token is not available
   */
  send(content: string, wait = false): Promise<Message | undefined> {
    return this.execute({ content }, { wait });
  }

  /**
   * Fetches a message that was previously sent by this webhook.
   *
   * @param messageId - The ID of the message to retrieve
   * @param threadId - Optional ID of the thread the message is in
   * @returns A promise resolving to the message
   * @throws {Error} If the webhook token is not available
   */
  async fetchMessage(
    messageId: Snowflake,
    threadId?: Snowflake,
  ): Promise<Message> {
    if (!this.token) {
      throw new Error("Webhook token is not available");
    }

    const query: WebhookMessageFetchParams = {};
    if (threadId) {
      query.thread_id = threadId;
    }

    const message = await this.client.rest.webhooks.fetchWebhookMessage(
      this.id,
      this.token,
      messageId,
      query,
    );

    return new Message(this.client, message);
  }

  /**
   * Edits a message that was previously sent by this webhook.
   *
   * @param messageId - The ID of the message to edit
   * @param options - The new message options
   * @param threadId - Optional ID of the thread the message is in
   * @returns A promise resolving to the edited message
   * @throws {Error} If the webhook token is not available
   */
  async editMessage(
    messageId: Snowflake,
    options: WebhookMessageEditOptions,
    threadId?: Snowflake,
  ): Promise<Message> {
    if (!this.token) {
      throw new Error("Webhook token is not available");
    }

    const query: WebhookMessageFetchParams = {};
    if (threadId) {
      query.thread_id = threadId;
    }

    const message = await this.client.rest.webhooks.updateWebhookMessage(
      this.id,
      this.token,
      messageId,
      options,
      query,
    );

    return new Message(this.client, message);
  }

  /**
   * Deletes a message that was sent by this webhook.
   *
   * @param messageId - The ID of the message to delete
   * @param threadId - Optional ID of the thread the message is in
   * @returns A promise that resolves when the message is deleted
   * @throws {Error} If the webhook token is not available
   */
  deleteMessage(messageId: Snowflake, threadId?: Snowflake): Promise<void> {
    if (!this.token) {
      throw new Error("Webhook token is not available");
    }

    const query: WebhookMessageFetchParams = {};
    if (threadId) {
      query.thread_id = threadId;
    }

    return this.client.rest.webhooks.deleteWebhookMessage(
      this.id,
      this.token,
      messageId,
      query,
    );
  }

  /**
   * Executes this webhook with Slack-compatible formatting.
   * Allows sending messages using Slack's webhook format.
   *
   * @param params - Query parameters for the execution
   * @returns A promise that resolves when the webhook is executed
   * @throws {Error} If the webhook token is not available
   */
  executeSlack(params?: WebhookExecuteParams): Promise<void> {
    if (!this.token) {
      throw new Error("Webhook token is not available");
    }

    return this.client.rest.webhooks.sendSlackWebhook(
      this.id,
      this.token,
      params,
    );
  }

  /**
   * Executes this webhook with GitHub-compatible formatting.
   * Automatically formats GitHub event data as Discord messages.
   *
   * @param params - Query parameters for the execution
   * @returns A promise that resolves when the webhook is executed
   * @throws {Error} If the webhook token is not available
   */
  executeGithub(params?: WebhookExecuteParams): Promise<void> {
    if (!this.token) {
      throw new Error("Webhook token is not available");
    }

    return this.client.rest.webhooks.sendGithubWebhook(
      this.id,
      this.token,
      params,
    );
  }

  /**
   * Updates this webhook's properties.
   *
   * @param options - Options for modifying the webhook
   * @param reason - Optional audit log reason for the update
   * @returns A promise resolving to the updated webhook
   */
  async edit(options: WebhookUpdateOptions, reason?: string): Promise<Webhook> {
    let updatedWebhook: WebhookEntity;

    if (this.token) {
      // If we have a token, we can update without authentication
      const { channel_id, ...tokenOptions } = options;
      updatedWebhook = await this.client.rest.webhooks.updateWebhookWithToken(
        this.id,
        this.token,
        tokenOptions,
        reason,
      );
    } else {
      // Otherwise, use authenticated update
      updatedWebhook = await this.client.rest.webhooks.updateWebhook(
        this.id,
        options,
        reason,
      );
    }

    this.patch(updatedWebhook);
    return this;
  }

  /**
   * Deletes this webhook.
   *
   * @param reason - Optional audit log reason for the deletion
   * @returns A promise that resolves to true if the webhook was deleted
   */
  async delete(reason?: string): Promise<boolean> {
    try {
      if (this.token) {
        await this.client.rest.webhooks.deleteWebhookWithToken(
          this.id,
          this.token,
          reason,
        );
      } else {
        await this.client.rest.webhooks.deleteWebhook(this.id, reason);
      }
      this.uncache();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Refreshes this webhook's data from the API.
   *
   * @returns A promise resolving to the updated Webhook instance
   */
  async refresh(): Promise<Webhook> {
    let webhookData: WebhookEntity;

    if (this.token) {
      webhookData = await this.client.rest.webhooks.fetchWebhookWithToken(
        this.id,
        this.token,
      );
    } else {
      webhookData = await this.client.rest.webhooks.fetchWebhook(this.id);
    }

    this.patch(webhookData);
    return this;
  }

  /**
   * Checks if this webhook's name is valid according to Discord's requirements.
   *
   * @returns True if the name is valid, false otherwise
   */
  hasValidName(): boolean {
    return isValidWebhookName(this.name);
  }

  /**
   * Fetches the guild this webhook belongs to.
   *
   * @returns A promise resolving to the Guild or null if not in a guild
   */
  async fetchGuild(): Promise<Guild | null> {
    if (!this.guildId) {
      return null;
    }

    const guild = await this.client.rest.guilds.fetchGuild(this.guildId);
    return new Guild(this.client, guild);
  }

  /**
   * Fetches the channel this webhook belongs to.
   *
   * @returns A promise resolving to the Channel or null if channel ID is null
   */
  async fetchChannel(): Promise<AnyChannel | null> {
    if (!this.channelId) {
      return null;
    }

    const channel = await this.client.rest.channels.fetchChannel(
      this.channelId,
    );
    return channelFactory(this.client, channel);
  }

  /**
   * Returns a formatted string representation of the webhook's channel.
   * This creates a channel mention if the webhook has a channel.
   *
   * @returns Formatted channel mention or 'No Channel'
   */
  override toString(): FormattedChannel | "No Channel" {
    return this.channelId ? formatChannel(this.channelId) : "No Channel";
  }
}
