import type { MessageStructure, Snowflake, UserStructure } from "@nyxjs/core";
import type { QueryStringParams, RestRequestOptions } from "../types";
import { BaseRoutes } from "./base";

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters-response-body|Get Answer Voters Response Body}
 */
export type GetAnswerVotersResponseBody = {
    /**
     * Users who voted for this answer
     */
    users: UserStructure[];
};

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters-query-string-params|Get Answer Voters Query String Params}
 */
export type GetAnswerVotersQueryStringParams = Pick<QueryStringParams, "after" | "limit">;

export class PollRoutes extends BaseRoutes {
    /**
     * @see {@link https://discord.com/developers/docs/resources/poll#end-poll|End Poll}
     */
    public static endPoll(channelId: Snowflake, messageId: Snowflake): RestRequestOptions<MessageStructure> {
        return this.delete(`/channels/${channelId}/polls/${messageId}/expire`);
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters|Get Answer Voters}
     */
    public static getAnswerVoters(
        channelId: Snowflake,
        messageId: Snowflake,
        answerId: Snowflake,
        params?: GetAnswerVotersQueryStringParams
    ): RestRequestOptions<GetAnswerVotersResponseBody> {
        return this.get(`/channels/${channelId}/polls/${messageId}/answers/${answerId}`, {
            query: params,
        });
    }
}
