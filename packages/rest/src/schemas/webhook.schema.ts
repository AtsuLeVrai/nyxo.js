import { Snowflake } from "@nyxjs/core";
import { z } from "zod";
import { FileHandler } from "../handlers/index.js";
import type { FileInput } from "../types/index.js";
import { CreateMessageSchema } from "./message.schema.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#create-webhook-json-params}
 */
export const CreateWebhookSchema = z.object({
  name: z.string().min(1).max(80),
  avatar: z
    .custom<FileInput>(FileHandler.isValidSingleInput)
    .transform(FileHandler.toDataUri)
    .nullish(),
});

export type CreateWebhookSchema = z.input<typeof CreateWebhookSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook-json-params}
 */
export const ModifyWebhookSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  avatar: z
    .custom<FileInput>(FileHandler.isValidSingleInput)
    .transform(FileHandler.toDataUri)
    .nullish(),
  channel_id: Snowflake.optional(),
});

export type ModifyWebhookSchema = z.input<typeof ModifyWebhookSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook-query-string-params}
 */
export const ExecuteWebhookQuerySchema = z.object({
  wait: z.boolean().default(false),
  thread_id: Snowflake.optional(),
});

export type ExecuteWebhookQuerySchema = z.input<
  typeof ExecuteWebhookQuerySchema
>;

/**
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
  username: z.string().optional(),
  avatar_url: z.string().optional(),
  thread_name: z.string().optional(),
  applied_tags: z.array(Snowflake).optional(),
});

export type ExecuteWebhookSchema = z.input<typeof ExecuteWebhookSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook-message-query-string-params}
 */
export const GetWebhookMessageQuerySchema = ExecuteWebhookQuerySchema.pick({
  thread_id: true,
});

export type GetWebhookMessageQuerySchema = z.input<
  typeof GetWebhookMessageQuerySchema
>;

/**
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
