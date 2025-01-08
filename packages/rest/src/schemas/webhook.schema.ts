import { Snowflake } from "@nyxjs/core";
import { z } from "zod";
import { CreateMessageEntity } from "./message.schema.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#create-webhook-json-params}
 */
export const CreateWebhookEntity = z
  .object({
    name: z.string().min(1).max(80),
    avatar: z
      .string()
      .regex(/^data:image\/(jpeg|png|gif);base64,/)
      .nullish(),
  })
  .strict();

export type CreateWebhookEntity = z.infer<typeof CreateWebhookEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook-json-params}
 */
export const ModifyWebhookEntity = z
  .object({
    name: z.string().min(1).max(80).optional(),
    avatar: z
      .string()
      .regex(/^data:image\/(jpeg|png|gif);base64,/)
      .nullish(),
    channel_id: Snowflake.optional(),
  })
  .strict();

export type ModifyWebhookEntity = z.infer<typeof ModifyWebhookEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook-query-string-params}
 */
export const ExecuteWebhookQueryEntity = z
  .object({
    wait: z.boolean().default(false).optional(),
    thread_id: Snowflake.optional(),
  })
  .strict();

export type ExecuteWebhookQueryEntity = z.infer<
  typeof ExecuteWebhookQueryEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook-jsonform-params}
 */
export const ExecuteWebhookEntity = CreateMessageEntity.pick({
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
      applied_tags: z.array(Snowflake).optional(),
    })
    .strict(),
);

export type ExecuteWebhookEntity = z.infer<typeof ExecuteWebhookEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#get-webhook-message-query-string-params}
 */
export const GetWebhookMessageQueryEntity = ExecuteWebhookQueryEntity.pick({
  thread_id: true,
});

export type GetWebhookMessageQueryEntity = z.infer<
  typeof GetWebhookMessageQueryEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#edit-webhook-message-jsonform-params}
 */
export const EditWebhookMessageEntity = ExecuteWebhookEntity.pick({
  content: true,
  embeds: true,
  allowed_mentions: true,
  components: true,
  files: true,
  payload_json: true,
  attachments: true,
  poll: true,
});

export type EditWebhookMessageEntity = z.infer<typeof EditWebhookMessageEntity>;
