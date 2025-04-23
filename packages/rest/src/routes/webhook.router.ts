import type { Snowflake, WebhookEntity } from "@nyxojs/core";
import type { Rest } from "../core/index.js";
import { FileHandler, type FileInput } from "../handlers/index.js";
import type { CreateMessageSchema } from "./message.router.js";

/**
 * Interface for creating a new webhook in a channel.
 *
 * This interface defines the parameters needed to create a webhook,
 * which is a method to post messages to Discord channels from external sources.
 *
 * @remarks
 * Creates a new webhook and returns a webhook object on success.
 * Requires the MANAGE_WEBHOOKS permission.
 * Fires a Webhooks Update Gateway event.
 *
 * A webhook name is valid if:
 * - It does not contain the substrings 'clyde' or 'discord' (case-insensitive)
 * - It follows the nickname guidelines (with max length of 80 characters)
 *
 * @see {@link https://discord.com/developers/docs/resources/webhook#create-webhook-json-params}
 */
export interface WebhookCreateOptions {
  /**
   * Name of the webhook (1-80 characters).
   *
   * This name will be shown as the author of messages sent through the webhook.
   * Cannot contain 'clyde' or 'discord' (case-insensitive).
   */
  name: string;

  /**
   * Image for the default webhook avatar.
   *
   * This will be the default avatar shown for the webhook's messages,
   * though it can be overridden on a per-message basis.
   * Accepts file input which will be transformed to a data URI.
   */
  avatar?: FileInput | null;
}

/**
 * Interface for modifying an existing webhook.
 *
 * This interface defines the parameters that can be updated for an existing webhook,
 * including its name, avatar, and channel.
 *
 * @remarks
 * Modify a webhook. Requires the MANAGE_WEBHOOKS permission.
 * Returns the updated webhook object on success.
 * Fires a Webhooks Update Gateway event.
 *
 * All parameters to this endpoint are optional.
 *
 * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook-json-params}
 */
export interface WebhookUpdateOptions {
  /**
   * The default name of the webhook (1-80 characters).
   *
   * Updates the name shown as the author of messages sent through the webhook.
   * Cannot contain 'clyde' or 'discord' (case-insensitive).
   */
  name?: string;

  /**
   * Image for the default webhook avatar.
   *
   * Updates the default avatar shown for the webhook's messages.
   * Accepts file input which will be transformed to a data URI.
   * Set to null to remove the avatar (use default Discord webhook avatar).
   */
  avatar?: FileInput | null;

  /**
   * The new channel ID this webhook should be moved to.
   *
   * Used to transfer a webhook to a different channel.
   * Requires the MANAGE_WEBHOOKS permission in the new channel.
   * Set to null to remove the webhook from its current channel.
   */
  channel_id?: Snowflake | null;
}

/**
 * Interface for query parameters when executing a webhook.
 *
 * These parameters control how the webhook execution behaves, including
 * whether to wait for confirmation and which thread to target.
 *
 * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook-query-string-params}
 */
export interface WebhookExecuteParams {
  /**
   * Waits for server confirmation of message send before response,
   * and returns the created message body.
   *
   * When false, a message that is not saved does not return an error.
   * When true, the response will contain the message object if successful.
   * Defaults to false.
   */
  wait?: boolean;

  /**
   * Send a message to the specified thread within a webhook's channel.
   *
   * Allows targeting a specific thread in the channel the webhook is for.
   * The thread will automatically be unarchived.
   * Required if the webhook channel is a forum or media channel and thread_name is not provided.
   */
  thread_id?: Snowflake;
}

/**
 * Interface for executing a webhook to send a message.
 *
 * This interface defines the parameters for sending a message through a webhook,
 * including content, embeds, components, and more.
 *
 * @remarks
 * Note that when sending a message, you must provide a value for at least one of:
 * content, embeds, components, files, or poll.
 *
 * If the webhook channel is a forum or media channel, you must provide either thread_id
 * in the query string params, or thread_name in the JSON/form params.
 *
 * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook-jsonform-params}
 */
export interface WebhookExecuteOptions
  extends Pick<
    CreateMessageSchema,
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
  > {
  /**
   * Override the default username of the webhook.
   *
   * When provided, this name will be shown as the author of this specific message
   * instead of the webhook's default name.
   */
  username?: string;

  /**
   * Override the default avatar of the webhook.
   *
   * When provided, this avatar URL will be used for this specific message
   * instead of the webhook's default avatar.
   */
  avatar_url?: string;

  /**
   * Name of thread to create.
   *
   * Creates a new thread in the channel with this name.
   * Required if the webhook channel is a forum or media channel and thread_id is not provided.
   */
  thread_name?: string;

  /**
   * Array of tag IDs to apply to the thread.
   *
   * Only applies when creating a thread for a forum or media channel.
   * Each tag must be a valid tag ID for the channel.
   */
  applied_tags?: Snowflake[];
}

/**
 * Interface for query parameters when getting a webhook message.
 *
 * Used to specify which thread to retrieve the message from, if applicable.
 *
 * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook-message-query-string-params}
 */
export type WebhookMessageFetchParams = Pick<WebhookExecuteParams, "thread_id">;

/**
 * Interface for editing a webhook message.
 *
 * This interface defines the parameters that can be updated for a message
 * previously sent through a webhook.
 *
 * @remarks
 * All parameters to this endpoint are optional and nullable.
 * When the content field is edited, the mentions array in the message object
 * will be reconstructed from scratch based on the new content.
 *
 * Starting with API v10, the attachments array must contain all attachments
 * that should be present after edit, including retained and new attachments.
 *
 * @see {@link https://discord.com/developers/docs/resources/webhook#edit-webhook-message-jsonform-params}
 */
export type WebhookMessageEditOptions = Pick<
  WebhookExecuteOptions,
  | "content"
  | "embeds"
  | "allowed_mentions"
  | "components"
  | "files"
  | "payload_json"
  | "attachments"
  | "poll"
>;

/**
 * Router for Discord Webhook-related endpoints.
 *
 * This class provides methods to interact with Discord's webhook system,
 * allowing for creation, management, and execution of webhooks to send messages
 * to channels without requiring a bot user to be present.
 *
 * @remarks
 * Webhooks are a low-effort way to post messages to channels in Discord.
 * They do not require a bot user or authentication to use.
 *
 * There are three types of webhooks:
 * - Incoming Webhooks: Post messages to channels with a generated token
 * - Channel Follower Webhooks: Internal webhooks used with Channel Following
 * - Application Webhooks: Used with Interactions
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
     *
     * Used to list or create webhooks in a specific channel.
     *
     * @param channelId - The ID of the channel
     * @returns The formatted API route string
     */
    channelWebhooksEndpoint: (channelId: Snowflake) =>
      `/channels/${channelId}/webhooks` as const,

    /**
     * Route for guild webhooks collection.
     *
     * Used to list all webhooks in a specific guild.
     *
     * @param guildId - The ID of the guild
     * @returns The formatted API route string
     */
    guildWebhooksEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/webhooks` as const,

    /**
     * Base route for a webhook.
     *
     * Used for authenticated operations on a specific webhook.
     *
     * @param webhookId - The ID of the webhook
     * @returns The formatted API route string
     */
    webhookByIdEndpoint: (webhookId: Snowflake) =>
      `/webhooks/${webhookId}` as const,

    /**
     * Route for a webhook with token.
     *
     * Used for non-authenticated operations on a specific webhook.
     *
     * @param webhookId - The ID of the webhook
     * @param token - The token of the webhook
     * @returns The formatted API route string
     */
    webhookWithTokenEndpoint: (webhookId: Snowflake, token: string) =>
      `/webhooks/${webhookId}/${token}` as const,

    /**
     * Route for executing a Slack-compatible webhook.
     *
     * Used to send messages with Slack-formatted payloads.
     *
     * @param webhookId - The ID of the webhook
     * @param token - The token of the webhook
     * @returns The formatted API route string
     */
    slackWebhookEndpoint: (webhookId: Snowflake, token: string) =>
      `/webhooks/${webhookId}/${token}/slack` as const,

    /**
     * Route for executing a GitHub-compatible webhook.
     *
     * Used to automatically format GitHub event payloads as Discord messages.
     *
     * @param webhookId - The ID of the webhook
     * @param token - The token of the webhook
     * @returns The formatted API route string
     */
    githubWebhookEndpoint: (webhookId: Snowflake, token: string) =>
      `/webhooks/${webhookId}/${token}/github` as const,

    /**
     * Route for a webhook message.
     *
     * Used to get, edit, or delete a message sent by a webhook.
     *
     * @param webhookId - The ID of the webhook
     * @param token - The token of the webhook
     * @param messageId - The ID of the message
     * @returns The formatted API route string
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
   *
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Creates a new webhook in a channel.
   *
   * This method creates a webhook that can be used to send messages to
   * a channel without requiring a bot user to be present.
   *
   * @param channelId - The ID of the channel to create the webhook in
   * @param options - Options for creating the webhook
   * @param reason - Optional audit log reason for the creation
   * @returns A promise resolving to the created webhook entity
   * @throws {Error} Error if the options are invalid or the webhook name is not valid
   *
   * @see {@link https://discord.com/developers/docs/resources/webhook#create-webhook}
   *
   * @remarks
   * Requires the MANAGE_WEBHOOKS permission.
   * Fires a Webhooks Update Gateway event.
   *
   * A webhook name is valid if:
   * - It does not contain the substrings 'clyde' or 'discord' (case-insensitive)
   * - It follows the nickname guidelines (with max length of 80 characters)
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
   *
   * This method retrieves all webhooks that exist in the specified channel.
   *
   * @param channelId - The ID of the channel to get webhooks for
   * @returns A promise resolving to an array of webhook entities
   *
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-channel-webhooks}
   *
   * @remarks
   * Requires the MANAGE_WEBHOOKS permission.
   */
  fetchChannelWebhooks(channelId: Snowflake): Promise<WebhookEntity[]> {
    return this.#rest.get(
      WebhookRouter.WEBHOOK_ROUTES.channelWebhooksEndpoint(channelId),
    );
  }

  /**
   * Fetches all webhooks for a guild.
   *
   * This method retrieves all webhooks that exist across all channels in the specified guild.
   *
   * @param guildId - The ID of the guild to get webhooks for
   * @returns A promise resolving to an array of webhook entities
   *
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-guild-webhooks}
   *
   * @remarks
   * Requires the MANAGE_WEBHOOKS permission.
   */
  fetchGuildWebhooks(guildId: Snowflake): Promise<WebhookEntity[]> {
    return this.#rest.get(
      WebhookRouter.WEBHOOK_ROUTES.guildWebhooksEndpoint(guildId),
    );
  }

  /**
   * Fetches a specific webhook by ID.
   *
   * This method retrieves detailed information about a webhook using its ID.
   *
   * @param webhookId - The ID of the webhook to retrieve
   * @returns A promise resolving to the webhook entity
   * @throws {Error} Will throw an error if the webhook doesn't exist or you lack permissions
   *
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook}
   *
   * @remarks
   * This request requires the MANAGE_WEBHOOKS permission unless the
   * application making the request owns the webhook.
   */
  fetchWebhook(webhookId: Snowflake): Promise<WebhookEntity> {
    return this.#rest.get(
      WebhookRouter.WEBHOOK_ROUTES.webhookByIdEndpoint(webhookId),
    );
  }

  /**
   * Fetches a webhook by ID and token without requiring authentication.
   *
   * This method retrieves information about a webhook using its ID and token,
   * without requiring bot authentication.
   *
   * @param webhookId - The ID of the webhook to retrieve
   * @param token - The token of the webhook
   * @returns A promise resolving to the webhook entity (without user information)
   *
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook-with-token}
   *
   * @remarks
   * Same as fetchWebhook, except this call does not require authentication
   * and returns no user in the webhook object.
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
   *
   * This method modifies an existing webhook's properties, such as its name,
   * avatar, or channel location.
   *
   * @param webhookId - The ID of the webhook to modify
   * @param options - Options for modifying the webhook
   * @param reason - Optional audit log reason for the modification
   * @returns A promise resolving to the updated webhook entity
   * @throws {Error} Error if the options are invalid
   *
   * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook}
   *
   * @remarks
   * Requires the MANAGE_WEBHOOKS permission.
   * Returns the updated webhook object on success.
   * Fires a Webhooks Update Gateway event.
   *
   * All parameters to this endpoint are optional.
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
   *
   * This method modifies an existing webhook's properties using its token,
   * without requiring bot authentication.
   *
   * @param webhookId - The ID of the webhook to modify
   * @param token - The token of the webhook
   * @param options - Options for modifying the webhook (cannot include channel_id)
   * @param reason - Optional audit log reason for the modification
   * @returns A promise resolving to the updated webhook entity (without user information)
   * @throws {Error} Error if the options are invalid
   *
   * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook-with-token}
   *
   * @remarks
   * Same as updateWebhook, except this call does not require authentication,
   * does not accept a channel_id parameter in the body, and does not return
   * a user in the webhook object.
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
   *
   * This method permanently removes a webhook, preventing it from being used
   * to send messages to the channel.
   *
   * @param webhookId - The ID of the webhook to delete
   * @param reason - Optional audit log reason for the deletion
   * @returns A promise that resolves when the webhook is deleted
   * @throws {Error} Will throw an error if the webhook doesn't exist or you lack permissions
   *
   * @see {@link https://discord.com/developers/docs/resources/webhook#delete-webhook}
   *
   * @remarks
   * Requires the MANAGE_WEBHOOKS permission.
   * Returns a 204 No Content response on success.
   * Fires a Webhooks Update Gateway event.
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
   * This method permanently removes a webhook using its token, without requiring
   * bot authentication.
   *
   * @param webhookId - The ID of the webhook to delete
   * @param token - The token of the webhook
   * @param reason - Optional audit log reason for the deletion
   * @returns A promise that resolves when the webhook is deleted
   * @throws {Error} Will throw an error if the webhook doesn't exist
   *
   * @see {@link https://discord.com/developers/docs/resources/webhook#delete-webhook-with-token}
   *
   * @remarks
   * Same as deleteWebhook, except this call does not require authentication.
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
   *
   * This method uses a webhook to send a message to its associated channel,
   * without requiring a bot user.
   *
   * @param webhookId - The ID of the webhook to execute
   * @param token - The token of the webhook
   * @param options - Options for executing the webhook
   * @param query - Query parameters for the execution
   * @returns A promise resolving to the created message entity if wait is true, otherwise undefined
   * @throws {Error} Error if the options or query parameters are invalid
   *
   * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook}
   *
   * @remarks
   * Important notes:
   * - When sending a message, you must provide a value for at least one of:
   *   content, embeds, components, files, or poll
   * - If the webhook channel is a forum or media channel, you must provide either
   *   thread_id in the query string params, or thread_name in the JSON/form params
   * - Discord may strip certain characters from message content
   * - Returns a message or 204 No Content depending on the wait query parameter
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
   *
   * This method allows sending messages to Discord using Slack's webhook format.
   *
   * @param webhookId - The ID of the webhook to execute
   * @param token - The token of the webhook
   * @param query - Query parameters for the execution
   * @returns A promise that resolves when the webhook is executed
   * @throws {Error} Error if the query parameters are invalid
   *
   * @see {@link https://discord.com/developers/docs/resources/webhook#execute-slackcompatible-webhook}
   *
   * @remarks
   * Refer to Slack's documentation for more information about the payload format.
   * Discord does not support Slack's channel, icon_emoji, mrkdwn, or mrkdwn_in properties.
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
   *
   * This method allows GitHub event data to be automatically formatted as Discord messages.
   *
   * @param webhookId - The ID of the webhook to execute
   * @param token - The token of the webhook
   * @param query - Query parameters for the execution
   * @returns A promise that resolves when the webhook is executed
   * @throws {Error} Error if the query parameters are invalid
   *
   * @see {@link https://discord.com/developers/docs/resources/webhook#execute-githubcompatible-webhook}
   *
   * @remarks
   * Add a new webhook to your GitHub repo, and use this endpoint as the "Payload URL."
   * You can choose what events your Discord channel receives by selecting individual events.
   *
   * Supported events include: commit_comment, create, delete, fork, issue_comment, issues,
   * member, public, pull_request, pull_request_review, pull_request_review_comment, push,
   * release, watch, check_run, check_suite, discussion, and discussion_comment.
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
   * Fetches a previously-sent webhook message from the same token.
   *
   * This method retrieves a message that was previously sent through the webhook.
   *
   * @param webhookId - The ID of the webhook
   * @param token - The token of the webhook
   * @param messageId - The ID of the message to retrieve
   * @param query - Query parameters (e.g., thread_id)
   * @returns A promise resolving to the message entity
   * @throws {Error} Error if the message doesn't exist or the query parameters are invalid
   *
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
   * Updates a previously-sent webhook message from the same token.
   *
   * This method modifies a message that was previously sent through the webhook.
   *
   * @param webhookId - The ID of the webhook
   * @param token - The token of the webhook
   * @param messageId - The ID of the message to edit
   * @param options - Options for editing the message
   * @param query - Query parameters (e.g., thread_id)
   * @returns A promise resolving to the edited message entity
   * @throws {Error} Error if the options or query parameters are invalid
   *
   * @see {@link https://discord.com/developers/docs/resources/webhook#edit-webhook-message}
   *
   * @remarks
   * Important notes:
   * - When the content field is edited, the mentions array will be reconstructed
   * - Any provided files will be appended to the message
   * - Starting with API v10, the attachments array must contain all attachments
   *   that should be present after edit, including retained and new attachments
   * - All parameters to this endpoint are optional and nullable
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
   * This method permanently removes a message that was previously sent through the webhook.
   *
   * @param webhookId - The ID of the webhook
   * @param token - The token of the webhook
   * @param messageId - The ID of the message to delete
   * @param query - Query parameters (e.g., thread_id)
   * @returns A promise that resolves when the message is deleted
   * @throws {Error} Error if the message doesn't exist or the query parameters are invalid
   *
   * @see {@link https://discord.com/developers/docs/resources/webhook#delete-webhook-message}
   *
   * @remarks
   * Returns a 204 No Content response on success.
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
