import type {
  ActionRowEntity,
  AllowedMentionsEntity,
  AttachmentEntity,
  EmbedEntity,
  MessageFlags,
  MessageReferenceEntity,
  PollCreateRequestEntity,
  Snowflake,
} from "@nyxjs/core";
import type { FileInput } from "../handlers/index.js";

/**
 * Interface for query parameters when retrieving channel messages
 * Defines pagination parameters for fetching messages from a channel
 *
 * @see {@link https://discord.com/developers/docs/resources/message#get-channel-messages-query-string-params}
 */
export interface GetChannelMessagesQuerySchema {
  /**
   * Get messages around this message ID
   * This parameter is mutually exclusive with before and after
   *
   * @optional
   */
  around?: Snowflake;

  /**
   * Get messages before this message ID
   * This parameter is mutually exclusive with around and after
   *
   * @optional
   */
  before?: Snowflake;

  /**
   * Get messages after this message ID
   * This parameter is mutually exclusive with around and before
   *
   * @optional
   */
  after?: Snowflake;

  /**
   * Maximum number of messages to return (1-100)
   *
   * @minimum 1
   * @maximum 100
   * @default 50
   * @integer
   */
  limit?: number;
}

/**
 * Interface for creating a new message in a channel
 * Defines the parameters for sending messages via Discord's API
 * At least one of content, embeds, sticker_ids, components, files, or poll is required
 *
 * @see {@link https://discord.com/developers/docs/resources/message#create-message-jsonform-params}
 */
export interface CreateMessageSchema {
  /**
   * Message content (up to 2000 characters)
   *
   * @maxLength 2000
   * @optional
   */
  content?: string;

  /**
   * Used to verify a message was sent (up to 25 characters)
   * Can be an integer or string that will appear in the Message Create event
   *
   * @maxLength 25
   * @optional
   */
  nonce?: string | number;

  /**
   * Whether this is a text-to-speech message
   *
   * @optional
   */
  tts?: boolean;

  /**
   * Rich embedded content for the message (up to 10 embeds)
   *
   * @maxItems 10
   * @optional
   */
  embeds?: EmbedEntity[];

  /**
   * Controls mentions in the message
   *
   * @optional
   */
  allowed_mentions?: AllowedMentionsEntity;

  /**
   * Include to make the message a reply to another message
   *
   * @optional
   */
  message_reference?: MessageReferenceEntity;

  /**
   * Interactive components to include with the message
   *
   * @optional
   */
  components?: ActionRowEntity;

  /**
   * IDs of up to 3 stickers to send in the message
   *
   * @maxItems 3
   * @optional
   */
  sticker_ids?: Snowflake[];

  /**
   * File contents to be attached to the message
   *
   * @optional
   */
  files?: FileInput | FileInput[];

  /**
   * @deprecated Do not use `payload_json`. This is done automatically!
   *
   * @optional
   */
  payload_json?: string;

  /**
   * Information about attachments
   *
   * @maxItems 10
   * @optional
   */
  attachments?: AttachmentEntity[];

  /**
   * Message flags combined as a bitfield
   * Only SUPPRESS_EMBEDS and SUPPRESS_NOTIFICATIONS can be set
   *
   * @optional
   */
  flags?: MessageFlags.SuppressEmbeds | MessageFlags.SuppressNotifications;

  /**
   * If true and nonce is present, it will be checked for uniqueness
   * If another message was created with the same nonce, that message will be returned
   *
   * @optional
   */
  enforce_nonce?: boolean;

  /**
   * Poll to include with the message
   *
   * @optional
   */
  poll?: PollCreateRequestEntity;
}

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
 * Interface for query parameters when retrieving reactions on a message
 *
 * @see {@link https://discord.com/developers/docs/resources/message#get-reactions-query-string-params}
 */
export interface GetReactionsQuerySchema {
  /**
   * Type of reaction to get (normal or burst)
   *
   * @default ReactionTypeFlag.Normal
   * @optional
   */
  type?: ReactionTypeFlag;

  /**
   * Get users after this user ID for pagination
   *
   * @optional
   */
  after?: Snowflake;

  /**
   * Maximum number of users to return (1-100)
   *
   * @minimum 1
   * @maximum 100
   * @default 25
   * @integer
   */
  limit?: number;
}

/**
 * Interface for editing an existing message
 * Reuses fields from CreateMessageSchema but only includes those that can be edited
 *
 * @see {@link https://discord.com/developers/docs/resources/message#edit-message-jsonform-params}
 */
export type EditMessageSchema = Pick<
  CreateMessageSchema,
  | "content"
  | "embeds"
  | "flags"
  | "allowed_mentions"
  | "components"
  | "files"
  | "payload_json"
  | "attachments"
>;

/**
 * Interface for bulk deleting messages
 *
 * @see {@link https://discord.com/developers/docs/resources/message#bulk-delete-messages-json-params}
 */
export interface BulkDeleteMessagesSchema {
  /**
   * Array of message IDs to delete (2-100)
   * Messages cannot be older than 2 weeks
   *
   * @minItems 2
   * @maxItems 100
   */
  messages: Snowflake[];
}
