import type { Integer, MessageStructure, Snowflake, UserStructure } from "@lunajs/core";
import type { RestRequestOptions } from "../globals/rest";

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters-query-string-params}
 */
export type GetAnswerVotersQuery = {
	/**
	 * Get users after this user ID
	 */
	after?: Snowflake;
	/**
	 * Max number of users to return (1-100)
	 */
	limit?: Integer;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters-response-body}
 */
export type GetAnswerVotersResponse = {
	/**
	 * Array of user objects
	 */
	users: UserStructure[];
};

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters}
 */
export function getAnswerVoters(channelId: Snowflake, messageId: Snowflake, answerId: Snowflake, query?: GetAnswerVotersQuery): RestRequestOptions<GetAnswerVotersResponse> {
	return {
		method: "GET",
		path: `/channels/${channelId}/polls/${messageId}/answers/${answerId}`,
		query,
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#end-poll}
 */
export function endPoll(channelId: Snowflake, messageId: Snowflake): RestRequestOptions<MessageStructure> {
	return {
		method: "POST",
		path: `/channels/${channelId}/polls/${messageId}/expire`,
	};
}
