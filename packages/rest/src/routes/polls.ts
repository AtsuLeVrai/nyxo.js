import type { MessageStructure, Snowflake, UserStructure } from "@nyxjs/core";
import { type QueryStringParams, RestMethods, type RouteStructure } from "../types/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters-response-body|Get Answer Voters Response Body}
 */
export interface GetAnswerVotersResponseBody {
    /**
     * Users who voted for this answer
     */
    users: UserStructure[];
}

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters-query-string-params|Get Answer Voters Query String Params}
 */
export type GetAnswerVotersQueryStringParams = Pick<QueryStringParams, "after" | "limit">;

export const PollRoutes = {
    /**
     * @see {@link https://discord.com/developers/docs/resources/poll#end-poll|End Poll}
     */
    endPoll(channelId: Snowflake, messageId: Snowflake): RouteStructure<MessageStructure> {
        return {
            method: RestMethods.Delete,
            path: `/channels/${channelId}/polls/${messageId}`,
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters|Get Answer Voters}
     */
    getAnswerVoters(
        channelId: Snowflake,
        messageId: Snowflake,
        answerId: Snowflake,
        params?: GetAnswerVotersQueryStringParams,
    ): RouteStructure<GetAnswerVotersResponseBody> {
        return {
            method: RestMethods.Get,
            path: `/channels/${channelId}/polls/${messageId}/answers/${answerId}`,
            query: params,
        };
    },
} as const;
