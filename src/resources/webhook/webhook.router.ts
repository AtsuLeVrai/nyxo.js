import { BaseRouter } from "../../bases/index.js";
import type { FileInput, RouteBuilder } from "../../core/index.js";
import type { DeepNonNullable, DeepNullable } from "../../utils/index.js";
import type {
  MessageEntity,
  RESTCreateMessageJSONParams,
  RESTCreateMessageV1JSONParams,
  RESTCreateMessageV2JSONParams,
} from "../message/index.js";
import type {
  AnyWebhookEntity,
  ChannelFollowerWebhookEntity,
  IncomingWebhookEntity,
} from "./webhook.entity.js";

/**
 * @description JSON parameters for creating a new Discord webhook in a channel.
 * @see {@link https://discord.com/developers/docs/resources/webhook#create-webhook}
 */
export interface RESTCreateWebhookJSONParams
  extends Required<DeepNonNullable<Pick<AnyWebhookEntity, "name">>> {
  /** Avatar image file for the webhook (up to 128 kilobytes) */
  avatar?: FileInput | null;
}

/**
 * @description JSON parameters for updating an existing Discord webhook.
 * All fields are optional as this is a PATCH operation.
 * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook}
 */
export type RESTWebhookUpdateJSONParams = Partial<
  RESTCreateWebhookJSONParams & Pick<ChannelFollowerWebhookEntity, "channel_id">
>;

/**
 * @description Query parameters for webhook execution requests.
 * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook-query-string-params}
 */
export interface RESTWebhookExecuteQueryStringParams {
  /** Whether to wait for server confirmation of message send before response (defaults to false) */
  wait?: boolean;
  /** Send message to the specified thread within a webhook's channel */
  thread_id?: string;
}

/**
 * @description JSON parameters for executing a webhook to send a message.
 * Extends regular message creation with webhook-specific options.
 * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook}
 */
export type RESTWebhookExecuteJSONParams = RESTCreateMessageJSONParams & {
  /** Override the default username of the webhook */
  username?: string;
  /** Override the default avatar of the webhook */
  avatar_url?: string;
  /** Name of thread to create (requires the webhook channel to be a forum or media channel) */
  thread_name?: string;
  /** Array of tag IDs to apply to the thread (if creating thread in forum channel) */
  applied_tags?: string[];
};

/**
 * @description JSON parameters for editing a webhook message.
 * Uses the same pattern as message editing with Partial and DeepNullable.
 */
export type RESTWebhookMessageEditJSONParams =
  | Partial<
      DeepNullable<
        Pick<
          RESTCreateMessageV1JSONParams,
          | "content"
          | "embeds"
          | "flags"
          | "allowed_mentions"
          | "components"
          | "files"
          | "payload_json"
          | "attachments"
        >
      >
    >
  | Partial<
      DeepNullable<
        Pick<
          RESTCreateMessageV2JSONParams,
          "allowed_mentions" | "files" | "payload_json" | "attachments" | "components" | "flags"
        >
      >
    >;

/**
 * @description Query parameters for webhook message operations (fetch/edit/delete).
 * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook-message-query-string-params}
 */
export interface RESTWebhookMessageQueryStringParams {
  /** Get message from the specified thread within a webhook's channel */
  thread_id?: string;
}

/**
 * @description Discord API endpoints for webhook operations with type-safe route building.
 * @see {@link https://discord.com/developers/docs/resources/webhook}
 */
export const WebhookRoutes = {
  channelWebhooks: (channelId: string) => `/channels/${channelId}/webhooks` as const,
  guildWebhooks: (guildId: string) => `/guilds/${guildId}/webhooks` as const,
  webhook: (webhookId: string) => `/webhooks/${webhookId}` as const,
  webhookWithToken: (webhookId: string, token: string) =>
    `/webhooks/${webhookId}/${token}` as const,
  slackWebhook: (webhookId: string, token: string) =>
    `/webhooks/${webhookId}/${token}/slack` as const,
  githubWebhook: (webhookId: string, token: string) =>
    `/webhooks/${webhookId}/${token}/github` as const,
  webhookMessage: (webhookId: string, token: string, messageId: string) =>
    `/webhooks/${webhookId}/${token}/messages/${messageId}` as const,
} as const satisfies RouteBuilder;

/**
 * @description Zero-cache Discord webhook API client with direct REST operations and comprehensive webhook management.
 * @see {@link https://discord.com/developers/docs/resources/webhook}
 */
export class WebhookRouter extends BaseRouter {
  /**
   * @description Creates a new webhook in a Discord channel.
   * @see {@link https://discord.com/developers/docs/resources/webhook#create-webhook}
   *
   * @param channelId - Snowflake ID of the channel to create the webhook in
   * @param options - Webhook configuration parameters
   * @param reason - Optional audit log reason for webhook creation
   * @returns Promise resolving to created incoming webhook object
   * @throws {Error} When lacking MANAGE_WEBHOOKS permission
   */
  async createWebhook(
    channelId: string,
    options: RESTCreateWebhookJSONParams,
    reason?: string,
  ): Promise<IncomingWebhookEntity> {
    const processedOptions = await this.processFileOptions(options, ["avatar"]);
    return this.rest.post(WebhookRoutes.channelWebhooks(channelId), {
      body: JSON.stringify(processedOptions),
      reason,
    });
  }

  /**
   * @description Retrieves all webhooks for a Discord channel.
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-channel-webhooks}
   *
   * @param channelId - Snowflake ID of the channel to fetch webhooks from
   * @returns Promise resolving to array of webhook objects
   * @throws {Error} When lacking MANAGE_WEBHOOKS permission
   */
  getChannelWebhooks(channelId: string): Promise<AnyWebhookEntity[]> {
    return this.rest.get(WebhookRoutes.channelWebhooks(channelId));
  }

  /**
   * @description Retrieves all webhooks for a Discord guild.
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-guild-webhooks}
   *
   * @param guildId - Snowflake ID of the guild to fetch webhooks from
   * @returns Promise resolving to array of webhook objects
   * @throws {Error} When lacking MANAGE_WEBHOOKS permission
   */
  getGuildWebhooks(guildId: string): Promise<AnyWebhookEntity[]> {
    return this.rest.get(WebhookRoutes.guildWebhooks(guildId));
  }

  /**
   * @description Retrieves a specific webhook by ID (requires authentication).
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook}
   *
   * @param webhookId - Snowflake ID of the webhook to fetch
   * @returns Promise resolving to webhook object
   * @throws {Error} When lacking MANAGE_WEBHOOKS permission or webhook doesn't exist
   */
  getWebhook(webhookId: string): Promise<AnyWebhookEntity> {
    return this.rest.get(WebhookRoutes.webhook(webhookId));
  }

  /**
   * @description Retrieves a webhook using its token (no authentication required).
   * Returns partial webhook object without sensitive information.
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook-with-token}
   *
   * @param webhookId - Snowflake ID of the webhook to fetch
   * @param token - Webhook token for authentication
   * @returns Promise resolving to incoming webhook object (without user field)
   */
  getWebhookWithToken(webhookId: string, token: string): Promise<IncomingWebhookEntity> {
    return this.rest.get(WebhookRoutes.webhookWithToken(webhookId, token));
  }

  /**
   * @description Modifies an existing webhook (requires authentication).
   * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook}
   *
   * @param webhookId - Snowflake ID of the webhook to modify
   * @param options - Updated webhook configuration parameters
   * @param reason - Optional audit log reason for webhook modification
   * @returns Promise resolving to updated webhook object
   * @throws {Error} When lacking MANAGE_WEBHOOKS permission
   */
  async modifyWebhook(
    webhookId: string,
    options: RESTWebhookUpdateJSONParams,
    reason?: string,
  ): Promise<AnyWebhookEntity> {
    const processedOptions = await this.processFileOptions(options, ["avatar"]);
    return this.rest.patch(WebhookRoutes.webhook(webhookId), {
      body: JSON.stringify(processedOptions),
      reason,
    });
  }

  /**
   * @description Modifies a webhook using its token (no authentication required).
   * Cannot change channel_id when using token authentication.
   * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook-with-token}
   *
   * @param webhookId - Snowflake ID of the webhook to modify
   * @param token - Webhook token for authentication
   * @param options - Updated webhook configuration (excluding channel_id)
   * @param reason - Optional audit log reason for webhook modification
   * @returns Promise resolving to updated incoming webhook object
   */
  async modifyWebhookWithToken(
    webhookId: string,
    token: string,
    options: Omit<RESTWebhookUpdateJSONParams, "channel_id">,
    reason?: string,
  ): Promise<IncomingWebhookEntity> {
    const processedOptions = await this.processFileOptions(options, ["avatar"]);
    return this.rest.patch(WebhookRoutes.webhookWithToken(webhookId, token), {
      body: JSON.stringify(processedOptions),
      reason,
    });
  }

  /**
   * @description Deletes a webhook permanently (requires authentication).
   * @see {@link https://discord.com/developers/docs/resources/webhook#delete-webhook}
   *
   * @param webhookId - Snowflake ID of the webhook to delete
   * @param reason - Optional audit log reason for webhook deletion
   * @returns Promise resolving when webhook is successfully deleted
   * @throws {Error} When lacking MANAGE_WEBHOOKS permission
   */
  deleteWebhook(webhookId: string, reason?: string): Promise<void> {
    return this.rest.delete(WebhookRoutes.webhook(webhookId), {
      reason,
    });
  }

  /**
   * @description Deletes a webhook using its token (no authentication required).
   * @see {@link https://discord.com/developers/docs/resources/webhook#delete-webhook-with-token}
   *
   * @param webhookId - Snowflake ID of the webhook to delete
   * @param token - Webhook token for authentication
   * @param reason - Optional audit log reason for webhook deletion
   * @returns Promise resolving when webhook is successfully deleted
   */
  deleteWebhookWithToken(webhookId: string, token: string, reason?: string): Promise<void> {
    return this.rest.delete(WebhookRoutes.webhookWithToken(webhookId, token), {
      reason,
    });
  }

  /**
   * @description Executes a webhook to send a message to its channel.
   * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook}
   *
   * @param webhookId - Snowflake ID of the webhook to execute
   * @param token - Webhook token for authentication
   * @param options - Message content and webhook execution parameters
   * @param query - Optional query parameters for execution behavior
   * @returns Promise resolving to message object if wait=true, undefined otherwise
   * @throws {Error} When message content validation fails or webhook is invalid
   */
  async executeWebhook(
    webhookId: string,
    token: string,
    options: RESTWebhookExecuteJSONParams,
    query?: RESTWebhookExecuteQueryStringParams,
  ): Promise<MessageEntity | undefined> {
    const processedOptions = await this.processFileOptions(options, ["files"]);
    const { files, ...rest } = processedOptions;

    return this.rest.post(WebhookRoutes.webhookWithToken(webhookId, token), {
      body: JSON.stringify(rest),
      files,
      query,
    });
  }

  /**
   * @description Sends a message via Slack-compatible webhook format.
   * @see {@link https://discord.com/developers/docs/resources/webhook#execute-slackcompatible-webhook}
   *
   * @param webhookId - Snowflake ID of the webhook to execute
   * @param token - Webhook token for authentication
   * @param options - Slack-formatted message content
   * @param query - Optional query parameters for execution behavior
   * @returns Promise resolving when message is sent
   */
  executeSlackWebhook(
    webhookId: string,
    token: string,
    options: any, // Slack format is different from Discord format
    query?: RESTWebhookExecuteQueryStringParams,
  ): Promise<void> {
    return this.rest.post(WebhookRoutes.slackWebhook(webhookId, token), {
      body: JSON.stringify(options),
      query,
    });
  }

  /**
   * @description Sends a message via GitHub-compatible webhook format.
   * @see {@link https://discord.com/developers/docs/resources/webhook#execute-githubcompatible-webhook}
   *
   * @param webhookId - Snowflake ID of the webhook to execute
   * @param token - Webhook token for authentication
   * @param options - GitHub-formatted webhook payload
   * @param query - Optional query parameters for execution behavior
   * @returns Promise resolving when message is sent
   */
  executeGithubWebhook(
    webhookId: string,
    token: string,
    options: any, // GitHub format is different from Discord format
    query?: RESTWebhookExecuteQueryStringParams,
  ): Promise<void> {
    return this.rest.post(WebhookRoutes.githubWebhook(webhookId, token), {
      body: JSON.stringify(options),
      query,
    });
  }

  /**
   * @description Retrieves a message that was sent by a webhook.
   * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook-message}
   *
   * @param webhookId - Snowflake ID of the webhook that sent the message
   * @param token - Webhook token for authentication
   * @param messageId - Snowflake ID of the message to fetch
   * @param query - Optional query parameters (thread_id)
   * @returns Promise resolving to message object
   */
  getWebhookMessage(
    webhookId: string,
    token: string,
    messageId: string,
    query?: RESTWebhookMessageQueryStringParams,
  ): Promise<MessageEntity> {
    return this.rest.get(WebhookRoutes.webhookMessage(webhookId, token, messageId), {
      query,
    });
  }

  /**
   * @description Edits a message that was sent by a webhook.
   * @see {@link https://discord.com/developers/docs/resources/webhook#edit-webhook-message}
   *
   * @param webhookId - Snowflake ID of the webhook that sent the message
   * @param token - Webhook token for authentication
   * @param messageId - Snowflake ID of the message to edit
   * @param options - Updated message content and configuration
   * @param query - Optional query parameters (thread_id)
   * @returns Promise resolving to updated message object
   */
  async editWebhookMessage(
    webhookId: string,
    token: string,
    messageId: string,
    options: RESTWebhookMessageEditJSONParams,
    query?: RESTWebhookMessageQueryStringParams,
  ): Promise<MessageEntity> {
    const processedOptions = await this.processFileOptions(options, ["files"]);
    const { files, ...rest } = processedOptions;

    return this.rest.patch(WebhookRoutes.webhookMessage(webhookId, token, messageId), {
      body: JSON.stringify(rest),
      files: files as FileInput[] | undefined,
      query,
    });
  }

  /**
   * @description Deletes a message that was sent by a webhook.
   * @see {@link https://discord.com/developers/docs/resources/webhook#delete-webhook-message}
   *
   * @param webhookId - Snowflake ID of the webhook that sent the message
   * @param token - Webhook token for authentication
   * @param messageId - Snowflake ID of the message to delete
   * @param query - Optional query parameters (thread_id)
   * @returns Promise resolving when message is successfully deleted
   */
  deleteWebhookMessage(
    webhookId: string,
    token: string,
    messageId: string,
    query?: RESTWebhookMessageQueryStringParams,
  ): Promise<void> {
    return this.rest.delete(WebhookRoutes.webhookMessage(webhookId, token, messageId), {
      query,
    });
  }
}
