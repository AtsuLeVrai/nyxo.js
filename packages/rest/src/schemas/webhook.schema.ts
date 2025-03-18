import { Snowflake, WebhookEntity } from "@nyxjs/core";
import { z } from "zod";
import { FileHandler, type FileInput } from "../handlers/index.js";
import { CreateMessageSchema } from "./message.schema.js";

/**
 * Schema for creating a new webhook in a channel.
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
export const CreateWebhookSchema = z.object({
  /**
   * Name of the webhook (1-80 characters).
   * Reuses the validation from WebhookEntity which includes validating
   * against forbidden names like 'discord' and 'clyde'.
   */
  name: WebhookEntity.shape.name.refine(
    (name) => name !== null && name !== undefined && name.length > 0,
    { message: "Webhook name must be at least 1 character" },
  ),

  /**
   * Image for the default webhook avatar.
   * Accepts file input which will be transformed to a data URI.
   */
  avatar: z
    .custom<FileInput>(FileHandler.isValidSingleInput)
    .transform(FileHandler.toDataUri)
    .nullish(),
});

export type CreateWebhookSchema = z.input<typeof CreateWebhookSchema>;

/**
 * Schema for modifying an existing webhook.
 *
 * Modify a webhook. Requires the MANAGE_WEBHOOKS permission.
 * Returns the updated webhook object on success.
 * Fires a Webhooks Update Gateway event.
 *
 * All parameters to this endpoint are optional.
 *
 * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook-json-params}
 */
export const ModifyWebhookSchema = z.object({
  /**
   * The default name of the webhook (1-80 characters).
   * Reuses the validation from WebhookEntity.
   */
  name: WebhookEntity.shape.name.optional(),

  /**
   * Image for the default webhook avatar.
   * Accepts file input which will be transformed to a data URI.
   */
  avatar: z
    .custom<FileInput>(FileHandler.isValidSingleInput)
    .transform(FileHandler.toDataUri)
    .nullish(),

  /**
   * The new channel ID this webhook should be moved to.
   * Requires the MANAGE_WEBHOOKS permission in the new channel.
   */
  channel_id: WebhookEntity.shape.channel_id.optional(),
});

export type ModifyWebhookSchema = z.input<typeof ModifyWebhookSchema>;

/**
 * Schema for query parameters when executing a webhook.
 *
 * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook-query-string-params}
 */
export const ExecuteWebhookQuerySchema = z.object({
  /**
   * Waits for server confirmation of message send before response,
   * and returns the created message body.
   * When false, a message that is not saved does not return an error.
   * Defaults to false.
   */
  wait: z.boolean().default(false),

  /**
   * Send a message to the specified thread within a webhook's channel.
   * The thread will automatically be unarchived.
   * Required if the webhook channel is a forum or media channel and thread_name is not provided.
   */
  thread_id: Snowflake.optional(),
});

export type ExecuteWebhookQuerySchema = z.input<
  typeof ExecuteWebhookQuerySchema
>;

/**
 * Schema for executing a webhook to send a message.
 *
 * Note that when sending a message, you must provide a value for at least one of:
 * content, embeds, components, files, or poll.
 *
 * If the webhook channel is a forum or media channel, you must provide either thread_id
 * in the query string params, or thread_name in the JSON/form params.
 *
 * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook-jsonform-params}
 */
export const ExecuteWebhookSchema = CreateMessageSchema.pick({
  content: true,
  tts: true,
  embeds: true,
  allowed_mentions: true,
  components: true,
  files: true,
  payload_json: true,
  attachments: true,
  flags: true,
  poll: true,
}).extend({
  /**
   * Override the default username of the webhook.
   */
  username: z.string().optional(),

  /**
   * Override the default avatar of the webhook.
   */
  avatar_url: z.string().optional(),

  /**
   * Name of thread to create.
   * Required if the webhook channel is a forum or media channel and thread_id is not provided.
   */
  thread_name: z.string().optional(),

  /**
   * Array of tag IDs to apply to the thread.
   * Only applies when creating a thread for a forum or media channel.
   */
  applied_tags: Snowflake.array().optional(),
});

export type ExecuteWebhookSchema = z.input<typeof ExecuteWebhookSchema>;

/**
 * Schema for query parameters when getting a webhook message.
 *
 * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook-message-query-string-params}
 */
export const GetWebhookMessageQuerySchema = ExecuteWebhookQuerySchema.pick({
  thread_id: true,
});

export type GetWebhookMessageQuerySchema = z.input<
  typeof GetWebhookMessageQuerySchema
>;

/**
 * Schema for editing a webhook message.
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
export const EditWebhookMessageSchema = ExecuteWebhookSchema.pick({
  content: true,
  embeds: true,
  allowed_mentions: true,
  components: true,
  files: true,
  payload_json: true,
  attachments: true,
  poll: true,
});

export type EditWebhookMessageSchema = z.input<typeof EditWebhookMessageSchema>;
