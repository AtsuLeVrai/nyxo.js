import type { Integer, MessageEntity, Snowflake } from "@nyxjs/core";
import type { FileEntity } from "./rest.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/message#create-message-jsonform-params}
 */
export interface MessageCreateEntity
  extends Partial<
    Pick<
      MessageEntity,
      | "content"
      | "nonce"
      | "tts"
      | "embeds"
      | "message_reference"
      | "components"
      | "attachments"
      | "flags"
      | "poll"
    >
  > {
  sticker_ids?: Snowflake[];
  files?: FileEntity[];
  payload_json?: string;
  enforce_nonce?: boolean;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/message#get-channel-messages-query-string-params}
 */
export interface MessageQueryEntity {
  around?: Snowflake;
  before?: Snowflake;
  after?: Snowflake;
  limit?: Integer;
}

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
export interface GetReactionsQueryEntity {
  type?: ReactionTypeFlag;
  after?: Snowflake;
  limit?: Integer;
}
