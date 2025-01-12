import { Snowflake } from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-poll-vote-remove-message-poll-vote-remove-fields}
 */
export const MessagePollVoteRemoveEntity = z.object({
  user_id: Snowflake,
  channel_id: Snowflake,
  message_id: Snowflake,
  guild_id: Snowflake.optional(),
  answer_id: z.number(),
});

export type MessagePollVoteRemoveEntity = z.infer<
  typeof MessagePollVoteRemoveEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-poll-vote-add-message-poll-vote-add-fields}
 */
export const MessagePollVoteAddEntity = MessagePollVoteRemoveEntity;

export type MessagePollVoteAddEntity = z.infer<typeof MessagePollVoteAddEntity>;
