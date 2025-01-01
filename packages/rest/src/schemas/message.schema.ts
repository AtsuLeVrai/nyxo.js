import {
  ActionRowSchema,
  AllowedMentionsSchema,
  AttachmentSchema,
  EmbedSchema,
  MessageFlags,
  MessageReferenceSchema,
  PollCreateRequestSchema,
  SnowflakeSchema,
} from "@nyxjs/core";
import { z } from "zod";
import type { FileType } from "../types/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/message#get-channel-messages-query-string-params}
 */
export const GetChannelMessagesQuerySchema = z
  .object({
    around: SnowflakeSchema.optional(),
    before: SnowflakeSchema.optional(),
    after: SnowflakeSchema.optional(),
    limit: z.number().int().min(1).max(100).default(50).optional(),
  })
  .strict();

export type GetChannelMessagesQueryEntity = z.infer<
  typeof GetChannelMessagesQuerySchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#create-message-jsonform-params}
 */
export const CreateMessageSchema = z
  .object({
    content: z.string().max(2000).optional(),
    nonce: z.union([z.string().max(25), z.number().int().max(25)]).optional(),
    tts: z.boolean().optional(),
    embeds: z.array(EmbedSchema).max(10).optional(),
    allowed_mentions: AllowedMentionsSchema.optional(),
    message_reference: MessageReferenceSchema.optional(),
    components: ActionRowSchema.optional(),
    sticker_ids: z.array(SnowflakeSchema).max(3).optional(),
    files: z.custom<FileType | FileType[]>().optional(),
    /** @deprecated Do not use `payload_json`. This is done automatically! */
    payload_json: z.string().optional(),
    attachments: z.array(AttachmentSchema).max(10).optional(),
    flags: z
      .union([
        z.literal(MessageFlags.suppressEmbeds),
        z.literal(MessageFlags.suppressNotifications),
      ])
      .optional(),
    enforce_nonce: z.boolean().optional(),
    poll: PollCreateRequestSchema.optional(),
  })
  .strict();

export type CreateMessageEntity = z.infer<typeof CreateMessageSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#get-reactions-reaction-types}
 */
export const ReactionTypeFlag = {
  normal: 0,
  burst: 1,
} as const;

export type ReactionTypeFlag =
  (typeof ReactionTypeFlag)[keyof typeof ReactionTypeFlag];

/**
 * @see {@link https://discord.com/developers/docs/resources/message#get-reactions-query-string-params}
 */
export const GetReactionsQuerySchema = z
  .object({
    type: z.nativeEnum(ReactionTypeFlag).optional(),
    after: SnowflakeSchema.optional(),
    limit: z.number().int().min(1).max(100).default(25).optional(),
  })
  .strict();

export type GetReactionsQueryEntity = z.infer<typeof GetReactionsQuerySchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#edit-message-jsonform-params}
 */
export const EditMessageSchema = CreateMessageSchema.pick({
  content: true,
  embeds: true,
  flags: true,
  allowed_mentions: true,
  components: true,
  files: true,
  payload_json: true,
  attachments: true,
});

export type EditMessageEntity = z.infer<typeof EditMessageSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#bulk-delete-messages-json-params}
 */
export const BulkDeleteMessagesSchema = z
  .object({
    messages: z.array(SnowflakeSchema).min(2).max(100),
  })
  .strict();

export type BulkDeleteMessagesEntity = z.infer<typeof BulkDeleteMessagesSchema>;
