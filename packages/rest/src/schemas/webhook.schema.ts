import { SnowflakeManager } from "@nyxjs/core";
import { z } from "zod";
import { CreateMessageSchema } from "./message.schema.js";

export const CreateWebhookSchema = z
  .object({
    name: z.string().min(1).max(80),
    avatar: z
      .string()
      .regex(/^data:image\/(jpeg|png|gif);base64,/)
      .optional()
      .nullable(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#create-webhook-json-params}
 */
export type CreateWebhookEntity = z.infer<typeof CreateWebhookSchema>;

export const ModifyWebhookSchema = z
  .object({
    name: z.string().min(1).max(80).optional(),
    avatar: z
      .string()
      .regex(/^data:image\/(jpeg|png|gif);base64,/)
      .optional()
      .nullable(),
    channel_id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook-json-params}
 */
export type ModifyWebhookEntity = z.infer<typeof ModifyWebhookSchema>;

export const ExecuteWebhookQuerySchema = z
  .object({
    wait: z.boolean().default(false).optional(),
    thread_id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook-query-string-params}
 */
export type ExecuteWebhookQueryEntity = z.infer<
  typeof ExecuteWebhookQuerySchema
>;

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
}).merge(
  z
    .object({
      username: z.string().optional(),
      avatar_url: z.string().optional(),
      thread_name: z.string().optional(),
      applied_tags: z
        .array(z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX))
        .optional(),
    })
    .strict(),
);

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook-jsonform-params}
 */
export type ExecuteWebhookEntity = z.infer<typeof ExecuteWebhookSchema>;

export const GetWebhookMessageQuerySchema = ExecuteWebhookQuerySchema.pick({
  thread_id: true,
});

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook-message-query-string-params}
 */
export type GetWebhookMessageQueryEntity = z.infer<
  typeof GetWebhookMessageQuerySchema
>;

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

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#edit-webhook-message-jsonform-params}
 */
export type EditWebhookMessageEntity = z.infer<typeof EditWebhookMessageSchema>;
