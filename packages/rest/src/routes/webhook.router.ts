import type { Snowflake, WebhookEntity } from "@nyxojs/core";
import type { Rest } from "../core/index.js";
import { FileHandler, type FileInput } from "../handlers/index.js";
import type {
  MessageCreateV1Options,
  MessageCreateV2Options,
} from "./message.router.js";

/**
 * Interface for creating a new webhook in a channel.
 * A webhook is a method to post messages to Discord channels from external sources.
 *
 * @see {@link https://discord.com/developers/docs/resources/webhook#create-webhook-json-params}
 */
export interface WebhookCreateOptions {
  /**
   * Name of the webhook (1-80 characters).
   * Cannot contain 'clyde' or 'discord' (case-insensitive).
   */
  name: string;

  /**
   * Image for the default webhook avatar.
   * Accepts file input which will be transformed to a data URI.
   */
  avatar?: FileInput | null;
}

/**
 * Interface for modifying an existing webhook.
 * All parameters are optional, allowing partial updates.
 *
 * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook-json-params}
 */
export interface WebhookUpdateOptions {
  /**
   * The default name of the webhook (1-80 characters).
   * Cannot contain 'clyde' or 'discord' (case-insensitive).
   */
  name?: string;

  /**
   * Image for the default webhook avatar.
   * Set to null to remove the avatar.
   */
  avatar?: FileInput | null;

  /**
   * The new channel ID this webhook should be moved to.
   * Requires MANAGE_WEBHOOKS permission in the new channel.
   */
  channel_id?: Snowflake | null;
}

/**
 * Interface for query parameters when executing a webhook.
 * Controls webhook execution behavior.
 *
 * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook-query-string-params}
 */
export interface WebhookExecuteParams {
  /**
   * Waits for server confirmation of message send before response.
   * When true, the response will contain the message object.
   */
  wait?: boolean;

  /**
   * Send a message to the specified thread within a webhook's channel.
   * The thread will automatically be unarchived.
   */
  thread_id?: Snowflake;
}

/**
 * Interface for executing a webhook to send a message.
 * Must provide a value for at least one of: content, embeds, components, files, or poll.
 *
 * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook-jsonform-params}
 */
export type WebhookExecuteOptions = {
  /**
   * Override the default username of the webhook.
   * Shown as the message author instead of the webhook's default name.
   */
  username?: string;

  /**
   * Override the default avatar of the webhook.
   * Used for this specific message instead of the webhook's default avatar.
   */
  avatar_url?: string;

  /**
   * Name of thread to create.
   * Required if the webhook channel is a forum or media channel and thread_id is not provided.
   */
  thread_name?: string;

  /**
   * Array of tag IDs to apply to the thread.
   * Only applies when creating a thread for a forum or media channel.
   */
  applied_tags?: Snowflake[];
} & (
  | Pick<
      MessageCreateV1Options,
      | "content"
      | "tts"
      | "embeds"
      | "allowed_mentions"
      | "components"
      | "files"
      | "payload_json"
      | "attachments"
      | "flags"
      | "poll"
    >
  | Pick<
      MessageCreateV2Options,
      | "tts"
      | "allowed_mentions"
      | "components"
      | "files"
      | "payload_json"
      | "attachments"
      | "flags"
    >
);

/**
 * Interface for query parameters when getting a webhook message.
 * Used to specify which thread to retrieve the message from.
 *
 * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook-message-query-string-params}
 */
export type WebhookMessageFetchParams = Pick<WebhookExecuteParams, "thread_id">;

/**
 * Interface for editing a webhook message.
 * All parameters are optional and nullable.
 *
 * @see {@link https://discord.com/developers/docs/resources/webhook#edit-webhook-message-jsonform-params}
 */
export type WebhookMessageEditOptions = Pick<
  MessageCreateV1Options,
  | "content"
  | "embeds"
  | "allowed_mentions"
  | "components"
  | "files"
  | "payload_json"
  | "attachments"
  | "poll"
> &
  Pick<
    MessageCreateV2Options,
    "allowed_mentions" | "components" | "files" | "payload_json" | "attachments"
  >;

/**
 * Router for Discord Webhook-related endpoints.
 * Provides methods to create, manage, and execute webhooks for sending messages.
 *
 * @see {@link https://discord.com/developers/docs/resources/webhook}
 */
export class WebhookRouter {
  /**
   * API route constants for webhook-related endpoints.
   */
  static readonly WEBHOOK_ROUTES = {
    /**
     * Route for channel webhooks collection.
     * @param channelId - The ID of the channel
     */
    channelWebhooksEndpoint: (channelId: Snowflake) =>
      `/channels/${channelId}/webhooks` as const,

    /**
     * Route for guild webhooks collection.
     * @param guildId - The ID of the guild
     */
    guildWebhooksEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/webhooks` as const,

    /**
     * Base route for a webhook.
     * @param webhookId - The ID of the webhook
     */
    webhookByIdEndpoint: (webhookId: Snowflake) =>
      `/webhooks/${webhookId}` as const,

    /**
     * Route for a webhook with token.
     * @param webhookId - The ID of the webhook
     * @param token - The token of the webhook
     */
    webhookWithTokenEndpoint: (webhookId: Snowflake, token: string) =>
      `/webhooks/${webhookId}/${token}` as const,

    /**
     * Route for executing a Slack-compatible webhook.
     * @param webhookId - The ID of the webhook
     * @param token - The token of the webhook
     */
    slackWebhookEndpoint: (webhookId: Snowflake, token: string) =>
      `/webhooks/${webhookId}/${token}/slack` as const,

    /**
     * Route for executing a GitHub-compatible webhook.
     * @param webhookId - The ID of the webhook
     * @param token - The token of the webhook
     */
    githubWebhookEndpoint: (webhookId: Snowflake, token: string) =>
      `/webhooks/${webhookId}/${token}/github` as const,

    /**
     * Route for a webhook message.
     * @param webhookId - The ID of the webhook
     * @param token - The token of the webhook
     * @param messageId - The ID of the message
     */
    webhookMessageEndpoint: (
      webhookId: Snowflake,
      token: string,
      messageId: Snowflake,
    ) => `/webhooks/${webhookId}/${token}/messages/${messageId}` as const,
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new Webhook Router instance.
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Creates a new webhook in a channel.
   * Requires the MANAGE_WEBHOOKS permission.
   *
   * @param channelId - The ID of the channel to create the webhook in
   * @param options - Options for creating the webhook
   * @param reason - Optional audit log reason for the creation
   * @returns A promise resolving to the created webhook entity
   * @see {@link https://discord.com/developers/docs/resources/webhook#create-webhook}
   */
  async createWebhook(
    channelId: Snowflake,
    options: WebhookCreateOptions,
    reason?: string,
  ): Promise<WebhookEntity> {
    if (options.avatar) {
      options.avatar = await FileHandler.toDataUri(options.avatar);
    }

    return this.#rest.post(
      WebhookRouter.WEBHOOK_ROUTES.channelWebhooksEndpoint(channelId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Fetches all webhooks for a channel.
   * Requires the MANAGE_WEBHOOKS permission.
   *
   * @param channelId - The ID of the channel to get webhooks for
   * @returns A promise resolving to an array of webhook entities
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-channel-webhooks}
   */
  fetchChannelWebhooks(channelId: Snowflake): Promise<WebhookEntity[]> {
    return this.#rest.get(
      WebhookRouter.WEBHOOK_ROUTES.channelWebhooksEndpoint(channelId),
    );
  }

  /**
   * Fetches all webhooks for a guild.
   * Requires the MANAGE_WEBHOOKS permission.
   *
   * @param guildId - The ID of the guild to get webhooks for
   * @returns A promise resolving to an array of webhook entities
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-guild-webhooks}
   */
  fetchGuildWebhooks(guildId: Snowflake): Promise<WebhookEntity[]> {
    return this.#rest.get(
      WebhookRouter.WEBHOOK_ROUTES.guildWebhooksEndpoint(guildId),
    );
  }

  /**
   * Fetches a specific webhook by ID.
   * Requires the MANAGE_WEBHOOKS permission unless the application made the webhook.
   *
   * @param webhookId - The ID of the webhook to retrieve
   * @returns A promise resolving to the webhook entity
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook}
   */
  fetchWebhook(webhookId: Snowflake): Promise<WebhookEntity> {
    return this.#rest.get(
      WebhookRouter.WEBHOOK_ROUTES.webhookByIdEndpoint(webhookId),
    );
  }

  /**
   * Fetches a webhook by ID and token without requiring authentication.
   * Returns no user in the webhook object.
   *
   * @param webhookId - The ID of the webhook to retrieve
   * @param token - The token of the webhook
   * @returns A promise resolving to the webhook entity (without user information)
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook-with-token}
   */
  fetchWebhookWithToken(
    webhookId: Snowflake,
    token: string,
  ): Promise<WebhookEntity> {
    return this.#rest.get(
      WebhookRouter.WEBHOOK_ROUTES.webhookWithTokenEndpoint(webhookId, token),
    );
  }

  /**
   * Updates an existing webhook.
   * Requires the MANAGE_WEBHOOKS permission.
   *
   * @param webhookId - The ID of the webhook to modify
   * @param options - Options for modifying the webhook
   * @param reason - Optional audit log reason for the modification
   * @returns A promise resolving to the updated webhook entity
   * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook}
   */
  async updateWebhook(
    webhookId: Snowflake,
    options: WebhookUpdateOptions,
    reason?: string,
  ): Promise<WebhookEntity> {
    if (options.avatar) {
      options.avatar = await FileHandler.toDataUri(options.avatar);
    }

    return this.#rest.patch(
      WebhookRouter.WEBHOOK_ROUTES.webhookByIdEndpoint(webhookId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Updates a webhook by ID and token without requiring authentication.
   * Cannot include channel_id parameter and returns no user information.
   *
   * @param webhookId - The ID of the webhook to modify
   * @param token - The token of the webhook
   * @param options - Options for modifying the webhook (cannot include channel_id)
   * @param reason - Optional audit log reason for the modification
   * @returns A promise resolving to the updated webhook entity (without user information)
   * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook-with-token}
   */
  async updateWebhookWithToken(
    webhookId: Snowflake,
    token: string,
    options: Omit<WebhookUpdateOptions, "channel_id">,
    reason?: string,
  ): Promise<WebhookEntity> {
    if (options.avatar) {
      options.avatar = await FileHandler.toDataUri(options.avatar);
    }

    return this.#rest.patch(
      WebhookRouter.WEBHOOK_ROUTES.webhookWithTokenEndpoint(webhookId, token),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Deletes a webhook permanently.
   * Requires the MANAGE_WEBHOOKS permission.
   *
   * @param webhookId - The ID of the webhook to delete
   * @param reason - Optional audit log reason for the deletion
   * @returns A promise that resolves when the webhook is deleted
   * @see {@link https://discord.com/developers/docs/resources/webhook#delete-webhook}
   */
  deleteWebhook(webhookId: Snowflake, reason?: string): Promise<void> {
    return this.#rest.delete(
      WebhookRouter.WEBHOOK_ROUTES.webhookByIdEndpoint(webhookId),
      {
        reason,
      },
    );
  }

  /**
   * Deletes a webhook by ID and token without requiring authentication.
   *
   * @param webhookId - The ID of the webhook to delete
   * @param token - The token of the webhook
   * @param reason - Optional audit log reason for the deletion
   * @returns A promise that resolves when the webhook is deleted
   * @see {@link https://discord.com/developers/docs/resources/webhook#delete-webhook-with-token}
   */
  deleteWebhookWithToken(
    webhookId: Snowflake,
    token: string,
    reason?: string,
  ): Promise<void> {
    return this.#rest.delete(
      WebhookRouter.WEBHOOK_ROUTES.webhookWithTokenEndpoint(webhookId, token),
      {
        reason,
      },
    );
  }

  /**
   * Executes a webhook to send a message.
   * Must provide at least one of: content, embeds, components, files, or poll.
   *
   * @param webhookId - The ID of the webhook to execute
   * @param token - The token of the webhook
   * @param options - Options for executing the webhook
   * @param query - Query parameters for the execution
   * @returns A promise resolving to the created message entity if wait is true, otherwise undefined
   * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook}
   */
  sendWebhook(
    webhookId: Snowflake,
    token: string,
    options: WebhookExecuteOptions,
    query?: WebhookExecuteParams,
  ): Promise<WebhookEntity | undefined> {
    const { files, ...rest } = options;
    return this.#rest.post(
      WebhookRouter.WEBHOOK_ROUTES.webhookWithTokenEndpoint(webhookId, token),
      {
        body: JSON.stringify(rest),
        query,
        files,
      },
    );
  }

  /**
   * Executes a Slack-compatible webhook.
   * Allows sending messages using Slack's webhook format.
   *
   * @param webhookId - The ID of the webhook to execute
   * @param token - The token of the webhook
   * @param query - Query parameters for the execution
   * @returns A promise that resolves when the webhook is executed
   * @see {@link https://discord.com/developers/docs/resources/webhook#execute-slackcompatible-webhook}
   */
  sendSlackWebhook(
    webhookId: Snowflake,
    token: string,
    query?: WebhookExecuteParams,
  ): Promise<void> {
    return this.#rest.post(
      WebhookRouter.WEBHOOK_ROUTES.slackWebhookEndpoint(webhookId, token),
      {
        query,
      },
    );
  }

  /**
   * Executes a GitHub-compatible webhook.
   * Automatically formats GitHub event data as Discord messages.
   *
   * @param webhookId - The ID of the webhook to execute
   * @param token - The token of the webhook
   * @param query - Query parameters for the execution
   * @returns A promise that resolves when the webhook is executed
   * @see {@link https://discord.com/developers/docs/resources/webhook#execute-githubcompatible-webhook}
   */
  sendGithubWebhook(
    webhookId: Snowflake,
    token: string,
    query?: WebhookExecuteParams,
  ): Promise<void> {
    return this.#rest.post(
      WebhookRouter.WEBHOOK_ROUTES.githubWebhookEndpoint(webhookId, token),
      {
        query,
      },
    );
  }

  /**
   * Fetches a previously-sent webhook message.
   *
   * @param webhookId - The ID of the webhook
   * @param token - The token of the webhook
   * @param messageId - The ID of the message to retrieve
   * @param query - Query parameters (e.g., thread_id)
   * @returns A promise resolving to the message entity
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook-message}
   */
  fetchWebhookMessage(
    webhookId: Snowflake,
    token: string,
    messageId: Snowflake,
    query?: WebhookMessageFetchParams,
  ): Promise<WebhookEntity> {
    return this.#rest.get(
      WebhookRouter.WEBHOOK_ROUTES.webhookMessageEndpoint(
        webhookId,
        token,
        messageId,
      ),
      {
        query,
      },
    );
  }

  /**
   * Updates a previously-sent webhook message.
   *
   * @param webhookId - The ID of the webhook
   * @param token - The token of the webhook
   * @param messageId - The ID of the message to edit
   * @param options - Options for editing the message
   * @param query - Query parameters (e.g., thread_id)
   * @returns A promise resolving to the edited message entity
   * @see {@link https://discord.com/developers/docs/resources/webhook#edit-webhook-message}
   */
  updateWebhookMessage(
    webhookId: Snowflake,
    token: string,
    messageId: Snowflake,
    options: WebhookMessageEditOptions,
    query?: WebhookMessageFetchParams,
  ): Promise<WebhookEntity> {
    const { files, ...rest } = options;
    return this.#rest.patch(
      WebhookRouter.WEBHOOK_ROUTES.webhookMessageEndpoint(
        webhookId,
        token,
        messageId,
      ),
      {
        body: JSON.stringify(rest),
        query,
        files,
      },
    );
  }

  /**
   * Deletes a message that was created by the webhook.
   *
   * @param webhookId - The ID of the webhook
   * @param token - The token of the webhook
   * @param messageId - The ID of the message to delete
   * @param query - Query parameters (e.g., thread_id)
   * @returns A promise that resolves when the message is deleted
   * @see {@link https://discord.com/developers/docs/resources/webhook#delete-webhook-message}
   */
  deleteWebhookMessage(
    webhookId: Snowflake,
    token: string,
    messageId: Snowflake,
    query?: WebhookMessageFetchParams,
  ): Promise<void> {
    return this.#rest.delete(
      WebhookRouter.WEBHOOK_ROUTES.webhookMessageEndpoint(
        webhookId,
        token,
        messageId,
      ),
      {
        query,
      },
    );
  }
}
