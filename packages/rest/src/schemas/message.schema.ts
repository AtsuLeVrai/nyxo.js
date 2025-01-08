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
import type { FileType } from "../types/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/message#get-channel-messages-query-string-params}
 */
export const GetChannelMessagesQueryEntity = z
  .object({
    around: Snowflake.optional(),
    before: Snowflake.optional(),
    after: Snowflake.optional(),
    limit: z.number().int().min(1).max(100).default(50).optional(),
  })
  .strict();

export type GetChannelMessagesQueryEntity = z.infer<
  typeof GetChannelMessagesQueryEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#create-message-jsonform-params}
 */
export const CreateMessageEntity = z
  .object({
    content: z.string().max(2000).optional(),
    nonce: z.union([z.string().max(25), z.number().int().max(25)]).optional(),
    tts: z.boolean().optional(),
    embeds: z.array(EmbedEntity).max(10).optional(),
    allowed_mentions: AllowedMentionsEntity.optional(),
    message_reference: MessageReferenceEntity.optional(),
    components: ActionRowEntity.optional(),
    sticker_ids: z.array(Snowflake).max(3).optional(),
    files: z.custom<FileType | FileType[]>().optional(),
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
  })
  .strict();

export type CreateMessageEntity = z.infer<typeof CreateMessageEntity>;

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
export const GetReactionsQueryEntity = z
  .object({
    type: z.nativeEnum(ReactionTypeFlag).optional(),
    after: Snowflake.optional(),
    limit: z.number().int().min(1).max(100).default(25).optional(),
  })
  .strict();

export type GetReactionsQueryEntity = z.infer<typeof GetReactionsQueryEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#edit-message-jsonform-params}
 */
export const EditMessageEntity = CreateMessageEntity.pick({
  content: true,
  embeds: true,
  flags: true,
  allowed_mentions: true,
  components: true,
  files: true,
  payload_json: true,
  attachments: true,
});

export type EditMessageEntity = z.infer<typeof EditMessageEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#bulk-delete-messages-json-params}
 */
export const BulkDeleteMessagesEntity = z
  .object({
    messages: z.array(Snowflake).min(2).max(100),
  })
  .strict();

export type BulkDeleteMessagesEntity = z.infer<typeof BulkDeleteMessagesEntity>;
