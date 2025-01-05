import { SnowflakeSchema } from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-poll-vote-remove-message-poll-vote-remove-fields}
 */
export const MessagePollVoteRemoveSchema = z
  .object({
    user_id: SnowflakeSchema,
    channel_id: SnowflakeSchema,
    message_id: SnowflakeSchema,
    guild_id: SnowflakeSchema.optional(),
    answer_id: z.number(),
  })
  .strict();

export type MessagePollVoteRemoveEntity = z.infer<
  typeof MessagePollVoteRemoveSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-poll-vote-add-message-poll-vote-add-fields}
 */
export const MessagePollVoteAddSchema = MessagePollVoteRemoveSchema;

export type MessagePollVoteAddEntity = z.infer<typeof MessagePollVoteAddSchema>;
