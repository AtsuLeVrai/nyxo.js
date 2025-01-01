import { SnowflakeSchema } from "@nyxjs/core";
import { z } from "zod";
import { CreateMessageSchema } from "./message.schema.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#create-webhook-json-params}
 */
export const CreateWebhookSchema = z
  .object({
    name: z.string().min(1).max(80),
    avatar: z
      .string()
      .regex(/^data:image\/(jpeg|png|gif);base64,/)
      .nullish(),
  })
  .strict();

export type CreateWebhookEntity = z.infer<typeof CreateWebhookSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook-json-params}
 */
export const ModifyWebhookSchema = z
  .object({
    name: z.string().min(1).max(80).optional(),
    avatar: z
      .string()
      .regex(/^data:image\/(jpeg|png|gif);base64,/)
      .nullish(),
    channel_id: SnowflakeSchema.optional(),
  })
  .strict();

export type ModifyWebhookEntity = z.infer<typeof ModifyWebhookSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook-query-string-params}
 */
export const ExecuteWebhookQuerySchema = z
  .object({
    wait: z.boolean().default(false).optional(),
    thread_id: SnowflakeSchema.optional(),
  })
  .strict();

export type ExecuteWebhookQueryEntity = z.infer<
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
}).merge(
  z
    .object({
      username: z.string().optional(),
      avatar_url: z.string().optional(),
      thread_name: z.string().optional(),
      applied_tags: z.array(SnowflakeSchema).optional(),
    })
    .strict(),
);

export type ExecuteWebhookEntity = z.infer<typeof ExecuteWebhookSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook-message-query-string-params}
 */
export const GetWebhookMessageQuerySchema = ExecuteWebhookQuerySchema.pick({
  thread_id: true,
});

export type GetWebhookMessageQueryEntity = z.infer<
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

export type EditWebhookMessageEntity = z.infer<typeof EditWebhookMessageSchema>;
