import {
  type ActionRowEntity,
  AllowedMentionType,
  type AllowedMentionsEntity,
  type AttachmentEntity,
  AttachmentFlags,
  type ComponentEntity,
  ComponentType,
  type EmbedAuthorEntity,
  type EmbedEntity,
  type EmbedFieldEntity,
  type EmbedFooterEntity,
  type EmbedImageEntity,
  type EmbedProviderEntity,
  EmbedType,
  type EmbedVideoEntity,
  LayoutType,
  MessageFlags,
  type MessageReferenceEntity,
  MessageReferenceType,
  type PollAnswerEntity,
  type PollCreateRequestEntity,
  type PollMediaEntity,
  SnowflakeManager,
} from "@nyxjs/core";
import { z } from "zod";
import type { FileEntity } from "../types/index.js";

export const GetChannelMessagesQuerySchema = z
  .object({
    around: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
    before: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
    after: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
    limit: z.number().int().min(1).max(100).default(50).optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/message#get-channel-messages-query-string-params}
 */
export type GetChannelMessagesQueryEntity = z.infer<
  typeof GetChannelMessagesQuerySchema
>;

const EmbedFieldSchema: z.ZodType<EmbedFieldEntity> = z
  .object({
    name: z.string().max(256),
    value: z.string().max(1024),
    inline: z.boolean().optional(),
  })
  .strict();

const EmbedFooterSchema: z.ZodType<EmbedFooterEntity> = z
  .object({
    text: z.string().max(2048),
    icon_url: z.string().url().optional(),
    proxy_icon_url: z.string().url().optional(),
  })
  .strict();

const EmbedAuthorSchema: z.ZodType<EmbedAuthorEntity> = z
  .object({
    name: z.string().max(256),
    url: z.string().url().optional(),
    icon_url: z.string().url().optional(),
    proxy_icon_url: z.string().url().optional(),
  })
  .strict();

const EmbedProviderSchema: z.ZodType<EmbedProviderEntity> = z
  .object({
    name: z.string().optional(),
    url: z.string().url().optional(),
  })
  .strict();

const EmbedImageSchema: z.ZodType<EmbedImageEntity> = z
  .object({
    url: z.string().url(),
    proxy_url: z.string().url().optional(),
    height: z.number().int().optional(),
    width: z.number().int().optional(),
  })
  .strict();

const EmbedVideoSchema: z.ZodType<EmbedVideoEntity> = z
  .object({
    url: z.string().url(),
    proxy_url: z.string().url().optional(),
    height: z.number().int().optional(),
    width: z.number().int().optional(),
  })
  .strict();

const EmbedThumbnailSchema: z.ZodType<EmbedImageEntity> = z
  .object({
    url: z.string().url(),
    proxy_url: z.string().url().optional(),
    height: z.number().int().optional(),
    width: z.number().int().optional(),
  })
  .strict();

export const EmbedSchema: z.ZodType<EmbedEntity> = z
  .object({
    title: z.string().max(256).optional(),
    type: z.nativeEnum(EmbedType).default(EmbedType.Rich).optional(),
    description: z.string().max(4096).optional(),
    url: z.string().url().optional(),
    timestamp: z.string().datetime().optional(),
    color: z.number().int().optional(),
    footer: EmbedFooterSchema.optional(),
    image: EmbedImageSchema.optional(),
    thumbnail: EmbedThumbnailSchema.optional(),
    video: EmbedVideoSchema.optional(),
    provider: EmbedProviderSchema.optional(),
    author: EmbedAuthorSchema.optional(),
    fields: z.array(EmbedFieldSchema).max(25).optional(),
  })
  .strict();

const AllowedMentionSchema: z.ZodType<AllowedMentionsEntity> = z
  .object({
    parse: z.array(z.nativeEnum(AllowedMentionType)),
    roles: z.array(z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX)).max(100),
    users: z.array(z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX)).max(100),
    replied_user: z.boolean().default(false),
  })
  .strict();

const MessageReferenceSchema: z.ZodType<MessageReferenceEntity> = z
  .object({
    type: z
      .nativeEnum(MessageReferenceType)
      .default(MessageReferenceType.Default)
      .optional(),
    message_id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
    channel_id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
    guild_id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
    fail_if_not_exists: z.boolean().default(true).optional(),
  })
  .strict();

const ActionRowSchema: z.ZodType<ActionRowEntity> = z
  .object({
    type: z.literal(ComponentType.ActionRow),
    components: z.array(z.custom<ComponentEntity>()).max(5),
  })
  .strict();

const AttachmentSchema: z.ZodType<AttachmentEntity> = z
  .object({
    id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX),
    filename: z.string(),
    title: z.string().optional(),
    description: z.string().max(1024).optional(),
    content_type: z.string().optional(),
    size: z.number().int(),
    url: z.string().url(),
    proxy_url: z.string().url(),
    height: z.number().int().optional().nullable(),
    width: z.number().int().optional().nullable(),
    ephemeral: z.boolean().optional(),
    duration_secs: z.number().int().optional(),
    waveform: z.string().optional(),
    flags: z.nativeEnum(AttachmentFlags).optional(),
  })
  .strict();

const PollMediaSchema: z.ZodType<PollMediaEntity> = z
  .object({
    text: z.string().max(300),
    emoji: z
      .union([
        z
          .object({ id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX) })
          .strict(),
        z.object({ name: z.string() }).strict(),
      ])
      .optional(),
  })
  .strict();

const PollAnswerSchema: z.ZodType<PollAnswerEntity> = z
  .object({
    answer_id: z.number().int(),
    poll_media: PollMediaSchema,
  })
  .strict();

const PollCreateRequestSchema: z.ZodType<PollCreateRequestEntity> = z
  .object({
    question: PollMediaSchema,
    answers: z.array(PollAnswerSchema).max(10),
    duration: z.number().int().max(32).default(24),
    allow_multiselect: z.boolean().default(false).optional(),
    layout_type: z
      .nativeEnum(LayoutType)
      .default(LayoutType.Default)
      .optional(),
  })
  .strict();

export const CreateMessageSchema = z
  .object({
    content: z.string().max(2000).optional(),
    nonce: z.union([z.string().max(25), z.number().int().max(25)]).optional(),
    tts: z.boolean().optional(),
    embeds: z.array(EmbedSchema).max(10).optional(),
    allowed_mentions: AllowedMentionSchema.optional(),
    message_reference: MessageReferenceSchema.optional(),
    components: ActionRowSchema.optional(),
    sticker_ids: z
      .array(z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX))
      .max(3)
      .optional(),
    files: z.custom<FileEntity>().optional(),
    /**
     * @deprecated Use `files` instead
     */
    payload_json: z.string().optional(),
    attachments: z.array(AttachmentSchema).max(10).optional(),
    flags: z
      .union([
        z.literal(MessageFlags.SuppressEmbeds),
        z.literal(MessageFlags.SuppressNotifications),
      ])
      .optional(),
    enforce_nonce: z.boolean().optional(),
    poll: PollCreateRequestSchema.optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/message#create-message-jsonform-params}
 */
export type CreateMessageEntity = z.infer<typeof CreateMessageSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/message#get-reactions-reaction-types}
 */
export enum ReactionTypeFlag {
  Normal = 0,
  Burst = 1,
}

export const GetReactionsQuerySchema = z
  .object({
    type: z.nativeEnum(ReactionTypeFlag).optional(),
    after: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
    limit: z.number().int().min(1).max(100).default(25).optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/message#get-reactions-query-string-params}
 */
export type GetReactionsQueryEntity = z.infer<typeof GetReactionsQuerySchema>;

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

/**
 * @see {@link https://discord.com/developers/docs/resources/message#edit-message-jsonform-params}
 */
export type EditMessageEntity = z.infer<typeof EditMessageSchema>;

export const BulkDeleteMessagesSchema = z
  .object({
    messages: z
      .array(z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX))
      .min(2)
      .max(100),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/message#bulk-delete-messages-json-params}
 */
export type BulkDeleteMessagesEntity = z.infer<typeof BulkDeleteMessagesSchema>;
