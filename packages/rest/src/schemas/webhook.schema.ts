import type { Snowflake } from "@nyxjs/core";
import type { FileInput } from "../handlers/index.js";
import type { CreateMessageSchema } from "./message.schema.js";

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
   *
   * @minLength 1
   * @maxLength 80
   * @validate Webhook name must not contain 'clyde' or 'discord' and must be 1-80 characters
   * @validate Webhook name must be at least 1 character
   */
  name: string;

  /**
   * Image for the default webhook avatar.
   * Accepts file input which will be transformed to a data URI.
   *
   * @transform Converted to data URI using FileHandler.toDataUri
   * @nullable
   * @optional
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
   *
   * @minLength 1
   * @maxLength 80
   * @validate Webhook name must not contain 'clyde' or 'discord' and must be 1-80 characters
   * @optional
   */
  name?: string;

  /**
   * Image for the default webhook avatar.
   * Accepts file input which will be transformed to a data URI.
   *
   * @transform Converted to data URI using FileHandler.toDataUri
   * @nullable
   * @optional
   */
  avatar?: FileInput | null;

  /**
   * The new channel ID this webhook should be moved to.
   * Requires the MANAGE_WEBHOOKS permission in the new channel.
   *
   * @optional
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
   *
   * @default false
   */
  wait?: boolean;

  /**
   * Send a message to the specified thread within a webhook's channel.
   * The thread will automatically be unarchived.
   * Required if the webhook channel is a forum or media channel and thread_name is not provided.
   *
   * @optional
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
   *
   * @optional
   */
  username?: string;

  /**
   * Override the default avatar of the webhook.
   *
   * @optional
   */
  avatar_url?: string;

  /**
   * Name of thread to create.
   * Required if the webhook channel is a forum or media channel and thread_id is not provided.
   *
   * @optional
   */
  thread_name?: string;

  /**
   * Array of tag IDs to apply to the thread.
   * Only applies when creating a thread for a forum or media channel.
   *
   * @optional
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
