import type { Snowflake } from "@nyxjs/core";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-poll-vote-remove-message-poll-vote-remove-fields}
 */
export interface MessagePollVoteRemoveEntity {
  user_id: Snowflake;
  channel_id: Snowflake;
  message_id: Snowflake;
  guild_id?: Snowflake;
  answer_id: number;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-poll-vote-add-message-poll-vote-add-fields}
 */
export type MessagePollVoteAddEntity = MessagePollVoteRemoveEntity;
