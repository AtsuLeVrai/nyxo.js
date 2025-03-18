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
import { FileHandler, type FileInput } from "../handlers/index.js";

/**
 * Schema for query parameters when retrieving channel messages
 * Defines pagination parameters for fetching messages from a channel
 *
 * @see {@link https://discord.com/developers/docs/resources/message#get-channel-messages-query-string-params}
 */
export const GetChannelMessagesQuerySchema = z.object({
  /**
   * Get messages around this message ID
   * This parameter is mutually exclusive with before and after
   */
  around: Snowflake.optional(),

  /**
   * Get messages before this message ID
   * This parameter is mutually exclusive with around and after
   */
  before: Snowflake.optional(),

  /**
   * Get messages after this message ID
   * This parameter is mutually exclusive with around and before
   */
  after: Snowflake.optional(),

  /**
   * Maximum number of messages to return (1-100)
   * @default 50
   */
  limit: z.number().int().min(1).max(100).default(50),
});

export type GetChannelMessagesQuerySchema = z.input<
  typeof GetChannelMessagesQuerySchema
>;

/**
 * Schema for creating a new message in a channel
 * Defines the parameters for sending messages via Discord's API
 * At least one of content, embeds, sticker_ids, components, files, or poll is required
 *
 * @see {@link https://discord.com/developers/docs/resources/message#create-message-jsonform-params}
 */
export const CreateMessageSchema = z.object({
  /**
   * Message content (up to 2000 characters)
   */
  content: z.string().max(2000).optional(),

  /**
   * Used to verify a message was sent (up to 25 characters)
   * Can be an integer or string that will appear in the Message Create event
   */
  nonce: z.union([z.string().max(25), z.number().int().max(25)]).optional(),

  /**
   * Whether this is a text-to-speech message
   */
  tts: z.boolean().optional(),

  /**
   * Rich embedded content for the message (up to 10 embeds)
   */
  embeds: EmbedEntity.array().max(10).optional(),

  /**
   * Controls mentions in the message
   */
  allowed_mentions: AllowedMentionsEntity.optional(),

  /**
   * Include to make the message a reply to another message
   */
  message_reference: MessageReferenceEntity.optional(),

  /**
   * Interactive components to include with the message
   */
  components: ActionRowEntity.optional(),

  /**
   * IDs of up to 3 stickers to send in the message
   */
  sticker_ids: Snowflake.array().max(3).optional(),

  /**
   * File contents to be attached to the message
   */
  files: z.custom<FileInput | FileInput[]>(FileHandler.isValidInput).optional(),

  /**
   * @deprecated Do not use `payload_json`. This is done automatically!
   */
  payload_json: z.string().optional(),

  /**
   * Information about attachments
   */
  attachments: AttachmentEntity.array().max(10).optional(),

  /**
   * Message flags combined as a bitfield
   * Only SUPPRESS_EMBEDS and SUPPRESS_NOTIFICATIONS can be set
   */
  flags: z
    .union([
      z.literal(MessageFlags.SuppressEmbeds),
      z.literal(MessageFlags.SuppressNotifications),
    ])
    .optional(),

  /**
   * If true and nonce is present, it will be checked for uniqueness
   * If another message was created with the same nonce, that message will be returned
   */
  enforce_nonce: z.boolean().optional(),

  /**
   * Poll to include with the message
   */
  poll: PollCreateRequestEntity.optional(),
});

export type CreateMessageSchema = z.input<typeof CreateMessageSchema>;

/**
 * Types of reactions that can be retrieved
 *
 * @see {@link https://discord.com/developers/docs/resources/message#get-reactions-reaction-types}
 */
export enum ReactionTypeFlag {
  /** Normal reaction */
  Normal = 0,

  /** Burst/Super reaction */
  Burst = 1,
}

/**
 * Schema for query parameters when retrieving reactions on a message
 *
 * @see {@link https://discord.com/developers/docs/resources/message#get-reactions-query-string-params}
 */
export const GetReactionsQuerySchema = z.object({
  /**
   * Type of reaction to get (normal or burst)
   * @default ReactionTypeFlag.Normal
   */
  type: z.nativeEnum(ReactionTypeFlag).optional(),

  /**
   * Get users after this user ID for pagination
   */
  after: Snowflake.optional(),

  /**
   * Maximum number of users to return (1-100)
   * @default 25
   */
  limit: z.number().int().min(1).max(100).default(25),
});

export type GetReactionsQuerySchema = z.input<typeof GetReactionsQuerySchema>;

/**
 * Schema for editing an existing message
 * Reuses fields from CreateMessageSchema but only includes those that can be edited
 *
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
 * Schema for bulk deleting messages
 *
 * @see {@link https://discord.com/developers/docs/resources/message#bulk-delete-messages-json-params}
 */
export const BulkDeleteMessagesSchema = z.object({
  /**
   * Array of message IDs to delete (2-100)
   * Messages cannot be older than 2 weeks
   */
  messages: Snowflake.array().min(2).max(100),
});

export type BulkDeleteMessagesSchema = z.input<typeof BulkDeleteMessagesSchema>;
