import type { Integer, Snowflake } from "@nyxjs/core";
import type { MessageStructure } from "../structures/messages";
import type { UserStructure } from "../structures/users";
import type { RestRequestOptions } from "../types/globals";

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters-response-body}
 */
export type GetAnswerVotersResponseBody = {
	/**
	 * Users who voted for this answer
	 */
	users: UserStructure[];
};

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters-query-string-params}
 */
export type GetAnswerVotersQueryStringParams = {
	/**
	 * Get users after this user ID
	 */
	after?: Snowflake;
	/**
	 * Max number of users to return (1-100)
	 */
	limit?: Integer;
};

export const PollRoutes = {
	/**
	 * @see {@link https://discord.com/developers/docs/resources/poll#end-poll}
	 */
	endPoll: (channelId: Snowflake, messageId: Snowflake): RestRequestOptions<MessageStructure> => ({
		method: "DELETE",
		path: `/channels/${channelId}/polls/${messageId}/expire`,
	}),
	/**
	 * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters}
	 */
	getAnswerVoters: (
		channelId: Snowflake,
		messageId: Snowflake,
		answerId: Snowflake,
		query?: GetAnswerVotersQueryStringParams,
	): RestRequestOptions<GetAnswerVotersResponseBody> => ({
		method: "GET",
		path: `/channels/${channelId}/polls/${messageId}/answers/${answerId}`,
		query,
	}),
};
