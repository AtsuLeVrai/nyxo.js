import type { Snowflake, WebhookEntity } from "@nyxjs/core";
import type { Rest } from "../core/index.js";
import { FileHandler, type FileInput } from "../handlers/index.js";
import type { CreateMessageSchema } from "./message.api.js";

/**
 * Interface for creating a new webhook in a channel.
 *
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
export interface CreateWebhookSchema {
  /**
   * Name of the webhook (1-80 characters).
   * Webhook name must not contain 'clyde' or 'discord' and must be at least 1 character.
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
 *
 * Modify a webhook. Requires the MANAGE_WEBHOOKS permission.
 * Returns the updated webhook object on success.
 * Fires a Webhooks Update Gateway event.
 *
 * All parameters to this endpoint are optional.
 *
 * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook-json-params}
 */
export interface ModifyWebhookSchema {
  /**
   * The default name of the webhook (1-80 characters).
   * Webhook name must not contain 'clyde' or 'discord'.
   */
  name?: string;

  /**
   * Image for the default webhook avatar.
   * Accepts file input which will be transformed to a data URI.
   */
  avatar?: FileInput | null;

  /**
   * The new channel ID this webhook should be moved to.
   * Requires the MANAGE_WEBHOOKS permission in the new channel.
   */
  channel_id?: Snowflake | null;
}

/**
 * Interface for query parameters when executing a webhook.
 *
 * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook-query-string-params}
 */
export interface ExecuteWebhookQuerySchema {
  /**
   * Waits for server confirmation of message send before response,
   * and returns the created message body.
   * When false, a message that is not saved does not return an error.
   * Defaults to false.
   */
  wait?: boolean;

  /**
   * Send a message to the specified thread within a webhook's channel.
   * The thread will automatically be unarchived.
   * Required if the webhook channel is a forum or media channel and thread_name is not provided.
   */
  thread_id?: Snowflake;
}

/**
 * Interface for executing a webhook to send a message.
 *
 * Note that when sending a message, you must provide a value for at least one of:
 * content, embeds, components, files, or poll.
 *
 * If the webhook channel is a forum or media channel, you must provide either thread_id
 * in the query string params, or thread_name in the JSON/form params.
 *
 * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook-jsonform-params}
 */
export interface ExecuteWebhookSchema
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
   */
  username?: string;

  /**
   * Override the default avatar of the webhook.
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
}

/**
 * Interface for query parameters when getting a webhook message.
 *
 * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook-message-query-string-params}
 */
export type GetWebhookMessageQuerySchema = Pick<
  ExecuteWebhookQuerySchema,
  "thread_id"
>;

/**
 * Interface for editing a webhook message.
 *
 * All parameters to this endpoint are optional and nullable.
 * When the content field is edited, the mentions array in the message object
 * will be reconstructed from scratch based on the new content.
 *
 * Starting with API v10, the attachments array must contain all attachments
 * that should be present after edit, including retained and new attachments.
 *
 * @see {@link https://discord.com/developers/docs/resources/webhook#edit-webhook-message-jsonform-params}
 */
export type EditWebhookMessageSchema = Pick<
  ExecuteWebhookSchema,
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
 * Router class for handling Discord Webhook endpoints.
 *
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
export class WebhookApi {
  /**
   * Collection of route patterns for webhook-related endpoints.
   */
  static readonly ROUTES = {
    /**
     * Route for channel webhooks collection.
     * @param channelId - The ID of the channel
     * @returns The endpoint path
     */
    channelWebhooks: (channelId: Snowflake) =>
      `/channels/${channelId}/webhooks` as const,

    /**
     * Route for guild webhooks collection.
     * @param guildId - The ID of the guild
     * @returns The endpoint path
     */
    guildWebhooks: (guildId: Snowflake) =>
      `/guilds/${guildId}/webhooks` as const,

    /**
     * Base route for a webhook.
     * @param webhookId - The ID of the webhook
     * @returns The endpoint path
     */
    webhookBase: (webhookId: Snowflake) => `/webhooks/${webhookId}` as const,

    /**
     * Route for a webhook with token.
     * @param webhookId - The ID of the webhook
     * @param token - The token of the webhook
     * @returns The endpoint path
     */
    webhookWithToken: (webhookId: Snowflake, token: string) =>
      `/webhooks/${webhookId}/${token}` as const,

    /**
     * Route for executing a Slack-compatible webhook.
     * @param webhookId - The ID of the webhook
     * @param token - The token of the webhook
     * @returns The endpoint path
     */
    webhookWithTokenSlack: (webhookId: Snowflake, token: string) =>
      `/webhooks/${webhookId}/${token}/slack` as const,

    /**
     * Route for executing a GitHub-compatible webhook.
     * @param webhookId - The ID of the webhook
     * @param token - The token of the webhook
     * @returns The endpoint path
     */
    webhookWithTokenGithub: (webhookId: Snowflake, token: string) =>
      `/webhooks/${webhookId}/${token}/github` as const,

    /**
     * Route for a webhook message.
     * @param webhookId - The ID of the webhook
     * @param token - The token of the webhook
     * @param messageId - The ID of the message
     * @returns The endpoint path
     */
    webhookTokenMessage: (
      webhookId: Snowflake,
      token: string,
      messageId: Snowflake,
    ) => `/webhooks/${webhookId}/${token}/messages/${messageId}` as const,
  } as const;

  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Creates a new webhook in a channel.
   *
   * Requires the MANAGE_WEBHOOKS permission.
   * Fires a Webhooks Update Gateway event.
   *
   * A webhook name is valid if:
   * - It does not contain the substrings 'clyde' or 'discord' (case-insensitive)
   * - It follows the nickname guidelines (with max length of 80 characters)
   *
   * @param channelId - The ID of the channel to create the webhook in
   * @param options - Options for creating the webhook
   * @param reason - Optional audit log reason for the creation
   * @returns A promise resolving to the created webhook entity
   * @throws Error if the options are invalid or the webhook name is not valid
   * @see {@link https://discord.com/developers/docs/resources/webhook#create-webhook}
   */
  async createWebhook(
    channelId: Snowflake,
    options: CreateWebhookSchema,
    reason?: string,
  ): Promise<WebhookEntity> {
    if (options.avatar) {
      options.avatar = await FileHandler.toDataUri(options.avatar);
    }

    return this.#rest.post(WebhookApi.ROUTES.channelWebhooks(channelId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * Gets all webhooks for a channel.
   *
   * Requires the MANAGE_WEBHOOKS permission.
   *
   * @param channelId - The ID of the channel to get webhooks for
   * @returns A promise resolving to an array of webhook entities
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-channel-webhooks}
   */
  getChannelWebhooks(channelId: Snowflake): Promise<WebhookEntity[]> {
    return this.#rest.get(WebhookApi.ROUTES.channelWebhooks(channelId));
  }

  /**
   * Gets all webhooks for a guild.
   *
   * Requires the MANAGE_WEBHOOKS permission.
   *
   * @param guildId - The ID of the guild to get webhooks for
   * @returns A promise resolving to an array of webhook entities
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-guild-webhooks}
   */
  getGuildWebhooks(guildId: Snowflake): Promise<WebhookEntity[]> {
    return this.#rest.get(WebhookApi.ROUTES.guildWebhooks(guildId));
  }

  /**
   * Gets a specific webhook by ID.
   *
   * This request requires the MANAGE_WEBHOOKS permission unless the
   * application making the request owns the webhook.
   *
   * @param webhookId - The ID of the webhook to retrieve
   * @returns A promise resolving to the webhook entity
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook}
   */
  getWebhook(webhookId: Snowflake): Promise<WebhookEntity> {
    return this.#rest.get(WebhookApi.ROUTES.webhookBase(webhookId));
  }

  /**
   * Gets a webhook by ID and token without requiring authentication.
   *
   * Same as getWebhook, except this call does not require authentication
   * and returns no user in the webhook object.
   *
   * @param webhookId - The ID of the webhook to retrieve
   * @param token - The token of the webhook
   * @returns A promise resolving to the webhook entity (without user information)
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook-with-token}
   */
  getWebhookWithToken(
    webhookId: Snowflake,
    token: string,
  ): Promise<WebhookEntity> {
    return this.#rest.get(WebhookApi.ROUTES.webhookWithToken(webhookId, token));
  }

  /**
   * Modifies a webhook.
   *
   * Requires the MANAGE_WEBHOOKS permission.
   * Returns the updated webhook object on success.
   * Fires a Webhooks Update Gateway event.
   *
   * All parameters to this endpoint are optional.
   *
   * @param webhookId - The ID of the webhook to modify
   * @param options - Options for modifying the webhook
   * @param reason - Optional audit log reason for the modification
   * @returns A promise resolving to the updated webhook entity
   * @throws Error if the options are invalid
   * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook}
   */
  async modifyWebhook(
    webhookId: Snowflake,
    options: ModifyWebhookSchema,
    reason?: string,
  ): Promise<WebhookEntity> {
    if (options.avatar) {
      options.avatar = await FileHandler.toDataUri(options.avatar);
    }

    return this.#rest.patch(WebhookApi.ROUTES.webhookBase(webhookId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * Modifies a webhook by ID and token without requiring authentication.
   *
   * Same as modifyWebhook, except this call does not require authentication,
   * does not accept a channel_id parameter in the body, and does not return
   * a user in the webhook object.
   *
   * @param webhookId - The ID of the webhook to modify
   * @param token - The token of the webhook
   * @param options - Options for modifying the webhook (cannot include channel_id)
   * @param reason - Optional audit log reason for the modification
   * @returns A promise resolving to the updated webhook entity (without user information)
   * @throws Error if the options are invalid
   * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook-with-token}
   */
  async modifyWebhookWithToken(
    webhookId: Snowflake,
    token: string,
    options: Omit<ModifyWebhookSchema, "channel_id">,
    reason?: string,
  ): Promise<WebhookEntity> {
    if (options.avatar) {
      options.avatar = await FileHandler.toDataUri(options.avatar);
    }

    return this.#rest.patch(
      WebhookApi.ROUTES.webhookWithToken(webhookId, token),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Deletes a webhook permanently.
   *
   * Requires the MANAGE_WEBHOOKS permission.
   * Returns a 204 No Content response on success.
   * Fires a Webhooks Update Gateway event.
   *
   * @param webhookId - The ID of the webhook to delete
   * @param reason - Optional audit log reason for the deletion
   * @returns A promise that resolves when the webhook is deleted
   * @see {@link https://discord.com/developers/docs/resources/webhook#delete-webhook}
   */
  deleteWebhook(webhookId: Snowflake, reason?: string): Promise<void> {
    return this.#rest.delete(WebhookApi.ROUTES.webhookBase(webhookId), {
      reason,
    });
  }

  /**
   * Deletes a webhook by ID and token without requiring authentication.
   *
   * Same as deleteWebhook, except this call does not require authentication.
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
      WebhookApi.ROUTES.webhookWithToken(webhookId, token),
      {
        reason,
      },
    );
  }

  /**
   * Executes a webhook to send a message.
   *
   * Returns a message or 204 No Content depending on the wait query parameter.
   *
   * Important notes:
   * - When sending a message, you must provide a value for at least one of:
   *   content, embeds, components, files, or poll
   * - If the webhook channel is a forum or media channel, you must provide either
   *   thread_id in the query string params, or thread_name in the JSON/form params
   * - Discord may strip certain characters from message content
   *
   * @param webhookId - The ID of the webhook to execute
   * @param token - The token of the webhook
   * @param options - Options for executing the webhook
   * @param query - Query parameters for the execution
   * @returns A promise resolving to the created message entity if wait is true, otherwise undefined
   * @throws Error if the options or query parameters are invalid
   * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook}
   */
  executeWebhook(
    webhookId: Snowflake,
    token: string,
    options: ExecuteWebhookSchema,
    query: ExecuteWebhookQuerySchema = {},
  ): Promise<WebhookEntity | undefined> {
    const { files, ...rest } = options;
    return this.#rest.post(
      WebhookApi.ROUTES.webhookWithToken(webhookId, token),
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
   * Refer to Slack's documentation for more information.
   * Discord does not support Slack's channel, icon_emoji, mrkdwn, or mrkdwn_in properties.
   *
   * @param webhookId - The ID of the webhook to execute
   * @param token - The token of the webhook
   * @param query - Query parameters for the execution
   * @returns A promise that resolves when the webhook is executed
   * @throws Error if the query parameters are invalid
   * @see {@link https://discord.com/developers/docs/resources/webhook#execute-slackcompatible-webhook}
   */
  executeSlackCompatibleWebhook(
    webhookId: Snowflake,
    token: string,
    query: ExecuteWebhookQuerySchema = {},
  ): Promise<void> {
    return this.#rest.post(
      WebhookApi.ROUTES.webhookWithTokenSlack(webhookId, token),
      {
        query,
      },
    );
  }

  /**
   * Executes a GitHub-compatible webhook.
   *
   * Add a new webhook to your GitHub repo, and use this endpoint as the "Payload URL."
   * You can choose what events your Discord channel receives by selecting individual events.
   *
   * Supported events include: commit_comment, create, delete, fork, issue_comment, issues,
   * member, public, pull_request, pull_request_review, pull_request_review_comment, push,
   * release, watch, check_run, check_suite, discussion, and discussion_comment.
   *
   * @param webhookId - The ID of the webhook to execute
   * @param token - The token of the webhook
   * @param query - Query parameters for the execution
   * @returns A promise that resolves when the webhook is executed
   * @throws Error if the query parameters are invalid
   * @see {@link https://discord.com/developers/docs/resources/webhook#execute-githubcompatible-webhook}
   */
  executeGithubCompatibleWebhook(
    webhookId: Snowflake,
    token: string,
    query: ExecuteWebhookQuerySchema = {},
  ): Promise<void> {
    return this.#rest.post(
      WebhookApi.ROUTES.webhookWithTokenGithub(webhookId, token),
      {
        query,
      },
    );
  }

  /**
   * Gets a previously-sent webhook message from the same token.
   *
   * @param webhookId - The ID of the webhook
   * @param token - The token of the webhook
   * @param messageId - The ID of the message to retrieve
   * @param query - Query parameters (e.g., thread_id)
   * @returns A promise resolving to the message entity
   * @throws Error if the query parameters are invalid
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook-message}
   */
  getWebhookMessage(
    webhookId: Snowflake,
    token: string,
    messageId: Snowflake,
    query: GetWebhookMessageQuerySchema = {},
  ): Promise<WebhookEntity> {
    return this.#rest.get(
      WebhookApi.ROUTES.webhookTokenMessage(webhookId, token, messageId),
      {
        query,
      },
    );
  }

  /**
   * Edits a previously-sent webhook message from the same token.
   *
   * Important notes:
   * - When the content field is edited, the mentions array will be reconstructed
   * - Any provided files will be appended to the message
   * - Starting with API v10, the attachments array must contain all attachments
   *   that should be present after edit, including retained and new attachments
   * - All parameters to this endpoint are optional and nullable
   *
   * @param webhookId - The ID of the webhook
   * @param token - The token of the webhook
   * @param messageId - The ID of the message to edit
   * @param options - Options for editing the message
   * @param query - Query parameters (e.g., thread_id)
   * @returns A promise resolving to the edited message entity
   * @throws Error if the options or query parameters are invalid
   * @see {@link https://discord.com/developers/docs/resources/webhook#edit-webhook-message}
   */
  editWebhookMessage(
    webhookId: Snowflake,
    token: string,
    messageId: Snowflake,
    options: EditWebhookMessageSchema,
    query: GetWebhookMessageQuerySchema = {},
  ): Promise<WebhookEntity> {
    const { files, ...rest } = options;
    return this.#rest.patch(
      WebhookApi.ROUTES.webhookTokenMessage(webhookId, token, messageId),
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
   * Returns a 204 No Content response on success.
   *
   * @param webhookId - The ID of the webhook
   * @param token - The token of the webhook
   * @param messageId - The ID of the message to delete
   * @param query - Query parameters (e.g., thread_id)
   * @returns A promise that resolves when the message is deleted
   * @throws Error if the query parameters are invalid
   * @see {@link https://discord.com/developers/docs/resources/webhook#delete-webhook-message}
   */
  deleteWebhookMessage(
    webhookId: Snowflake,
    token: string,
    messageId: Snowflake,
    query: GetWebhookMessageQuerySchema = {},
  ): Promise<void> {
    return this.#rest.delete(
      WebhookApi.ROUTES.webhookTokenMessage(webhookId, token, messageId),
      {
        query,
      },
    );
  }
}
