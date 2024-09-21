import type { Integer, Snowflake } from "@nyxjs/core";

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#message-poll-vote-remove-message-poll-vote-remove-fields}
 */
export type MessagePollVoteRemoveFields = {
    /**
     * ID of the answer
     */
    answer_id: Integer;
    /**
     * ID of the channel
     */
    channel_id: Snowflake;
    /**
     * ID of the guild
     */
    guild_id?: Snowflake;
    /**
     * ID of the message
     */
    message_id: Snowflake;
    /**
     * ID of the user
     */
    user_id: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#message-poll-vote-add-message-poll-vote-add-fields}
 */
export type MessagePollVoteAddFields = {
    /**
     * ID of the answer
     */
    answer_id: Integer;
    /**
     * ID of the channel
     */
    channel_id: Snowflake;
    /**
     * ID of the guild
     */
    guild_id?: Snowflake;
    /**
     * ID of the message
     */
    message_id: Snowflake;
    /**
     * ID of the user
     */
    user_id: Snowflake;
};
