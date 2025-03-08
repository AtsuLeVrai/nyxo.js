import {
  AllowedMentionType,
  AttachmentFlags,
  ButtonStyle,
  ComponentType,
  EmbedType,
  LayoutType,
  MessageFlags,
  MessageReferenceType,
  Snowflake,
  TextInputStyle,
} from "@nyxjs/core";
import { z } from "zod";
import { type FileInput, fileHandler } from "../handlers/index.js";

export const EmbedFieldSchema = z.object({
  name: z.string().min(1).max(256),
  value: z.string().min(1).max(1024),
  inline: z.boolean().optional(),
});

export const EmbedFooterSchema = z.object({
  text: z.string().min(1).max(2048),
  icon_url: z.string().url().optional(),
  proxy_icon_url: z.string().url().optional(),
});

export const EmbedAuthorSchema = z.object({
  name: z.string().min(1).max(256),
  url: z.string().url().optional(),
  icon_url: z.string().url().optional(),
  proxy_icon_url: z.string().url().optional(),
});

export const EmbedProviderSchema = z.object({
  name: z.string().optional(),
  url: z.string().url().optional(),
});

export const EmbedImageSchema = z.object({
  url: z.string().url(),
  proxy_url: z.string().url().optional(),
  height: z.number().int().optional(),
  width: z.number().int().optional(),
});

export const EmbedVideoSchema = z.object({
  url: z.string().url().optional(),
  proxy_url: z.string().url().optional(),
  height: z.number().int().optional(),
  width: z.number().int().optional(),
});

export const EmbedThumbnailSchema = z.object({
  url: z.string().url(),
  proxy_url: z.string().url().optional(),
  height: z.number().int().optional(),
  width: z.number().int().optional(),
});

export const EmbedSchema = z.object({
  title: z.string().max(256).optional(),
  type: z.nativeEnum(EmbedType),
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
});

export type EmbedSchema = z.input<typeof EmbedSchema>;

export const AllowedMentionsSchema = z.object({
  parse: z.array(z.nativeEnum(AllowedMentionType)),
  roles: z.array(Snowflake).max(100).optional(),
  users: z.array(Snowflake).max(100).optional(),
  replied_user: z.boolean().optional(),
});

export type AllowedMentionsSchema = z.input<typeof AllowedMentionsSchema>;

export const MessageReferenceSchema = z.object({
  type: z.nativeEnum(MessageReferenceType),
  message_id: Snowflake.optional(),
  channel_id: Snowflake.optional(),
  guild_id: Snowflake.optional(),
  fail_if_not_exists: z.boolean().optional(),
});

export type MessageReferenceSchema = z.input<typeof MessageReferenceSchema>;

export const AttachmentSchema = z.object({
  id: Snowflake,
  filename: z.string(),
  title: z.string().optional(),
  description: z.string().max(1024).optional(),
  content_type: z.string().optional(),
  size: z.number().int(),
  url: z.string().url(),
  proxy_url: z.string().url(),
  height: z.number().int().nullable().optional(),
  width: z.number().int().nullable().optional(),
  ephemeral: z.boolean().optional(),
  duration_secs: z.number().optional(),
  waveform: z.string().optional(),
  flags: z.nativeEnum(AttachmentFlags).optional(),
});

export type AttachmentSchema = z.input<typeof AttachmentSchema>;

export const PollMediaSchema = z.object({
  text: z.string().max(300).optional(),
  emoji: z
    .object({
      id: Snowflake.optional(),
      name: z.string().optional(),
    })
    .optional(),
});

export const PollAnswerWithoutIdSchema = z.object({
  poll_media: PollMediaSchema.extend({
    text: z.string().max(55).optional(),
  }),
});

export const PollCreateRequestSchema = z.object({
  question: PollMediaSchema,
  answers: z.array(PollAnswerWithoutIdSchema).min(2).max(10),
  duration: z.number().min(1).max(768).default(24),
  allow_multiselect: z.boolean().default(false),
  layout_type: z.nativeEnum(LayoutType).default(LayoutType.Default),
});

export type PollCreateRequestSchema = z.input<typeof PollCreateRequestSchema>;

export const ButtonComponentSchema = z.object({
  type: z.literal(ComponentType.Button),
  style: z.nativeEnum(ButtonStyle),
  label: z.string().max(80).optional(),
  emoji: z
    .object({
      id: Snowflake.optional(),
      name: z.string().optional(),
      animated: z.boolean().optional(),
    })
    .optional(),
  custom_id: z.string().max(100).optional(),
  sku_id: Snowflake.optional(),
  url: z.string().url().optional(),
  disabled: z.boolean().optional(),
});

export const TextInputComponentSchema = z.object({
  type: z.literal(ComponentType.TextInput),
  custom_id: z.string().max(100),
  style: z.nativeEnum(TextInputStyle),
  label: z.string().max(45),
  min_length: z.number().int().min(0).max(4000).optional(),
  max_length: z.number().int().min(1).max(4000).optional(),
  required: z.boolean().optional(),
  value: z.string().max(4000).optional(),
  placeholder: z.string().max(100).optional(),
});

export const ActionRowSchema = z.object({
  type: z.literal(ComponentType.ActionRow),
  components: z
    .array(z.union([ButtonComponentSchema, TextInputComponentSchema]))
    .max(5),
});

export type ActionRowSchema = z.input<typeof ActionRowSchema>;

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
  embeds: z.array(EmbedSchema).max(10).optional(),
  allowed_mentions: AllowedMentionsSchema.optional(),
  message_reference: MessageReferenceSchema.optional(),
  components: ActionRowSchema.optional(),
  sticker_ids: z.array(Snowflake).max(3).optional(),
  files: z.custom<FileInput | FileInput[]>(fileHandler.isValidInput).optional(),
  /** @deprecated Do not use `payload_json`. This is done automatically! */
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
