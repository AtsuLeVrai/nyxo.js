import {
  ActionRowEntity,
  AllowedMentionsEntity,
  AttachmentEntity,
  EmbedEntity,
  MessageFlags,
  MessageReferenceEntity,
  PollCreateRequestEntity,
  Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { FileHandler } from "../handlers/index.js";
import type { FileInput } from "../types/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/message#get-channel-messages-query-string-params}
 */
export const GetChannelMessagesQuerySchema = z.object({
  around: Snowflake.optional(),
  before: Snowflake.optional(),
  after: Snowflake.optional(),
  limit: z.number().int().min(1).max(100).default(50),
});

export type GetChannelMessagesQuerySchema = z.input<
  typeof GetChannelMessagesQuerySchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#create-message-jsonform-params}
 */
export const CreateMessageSchema = z.object({
  content: z.string().max(2000).optional(),
  nonce: z.union([z.string().max(25), z.number().int().max(25)]).optional(),
  tts: z.boolean().optional(),
  embeds: z.array(EmbedEntity).max(10).optional(),
  allowed_mentions: AllowedMentionsEntity.optional(),
  message_reference: MessageReferenceEntity.optional(),
  components: ActionRowEntity.optional(),
  sticker_ids: z.array(Snowflake).max(3).optional(),
  files: z
    .custom<FileInput | FileInput[]>(FileHandler.isValidFileInput)
    .optional(),
  /** @deprecated Do not use `payload_json`. This is done automatically! */
  payload_json: z.string().optional(),
  attachments: z.array(AttachmentEntity).max(10).optional(),
  flags: z
    .union([
      z.literal(MessageFlags.SuppressEmbeds),
      z.literal(MessageFlags.SuppressNotifications),
    ])
    .optional(),
  enforce_nonce: z.boolean().optional(),
  poll: PollCreateRequestEntity.optional(),
});

export type CreateMessageSchema = z.input<typeof CreateMessageSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#get-reactions-reaction-types}
 */
export enum ReactionTypeFlag {
  Normal = 0,
  Burst = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#get-reactions-query-string-params}
 */
export const GetReactionsQuerySchema = z.object({
  type: z.nativeEnum(ReactionTypeFlag).optional(),
  after: Snowflake.optional(),
  limit: z.number().int().min(1).max(100).default(25),
});

export type GetReactionsQuerySchema = z.input<typeof GetReactionsQuerySchema>;

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

export type EditMessageSchema = z.input<typeof EditMessageSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#bulk-delete-messages-json-params}
 */
export const BulkDeleteMessagesSchema = z.object({
  messages: z.array(Snowflake).min(2).max(100),
});

export type BulkDeleteMessagesSchema = z.input<typeof BulkDeleteMessagesSchema>;
