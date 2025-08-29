import { BaseRouter } from "../../bases/index.js";
import type { RouteBuilder } from "../../core/index.js";
import type { MessageEntity } from "../message/index.js";
import type { UserEntity } from "../user/index.js";

/**
 * @description Query parameters for retrieving users who voted for a specific poll answer with pagination support.
 * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters}
 */
export interface RESTGetAnswerVotersQueryStringParams {
  /**
   * @description Snowflake ID to get users after this user ID for pagination.
   */
  after?: string;
  /**
   * @description Maximum number of users to return (1-100, defaults to 25).
   */
  limit?: number;
}

/**
 * @description Discord API endpoints for poll operations with type-safe route building.
 * @see {@link https://discord.com/developers/docs/resources/poll}
 */
export const PollRoutes = {
  getAnswerVoters: (channelId: string, messageId: string, answerId: string) =>
    `/channels/${channelId}/polls/${messageId}/answers/${answerId}` as const,
  endPoll: (channelId: string, messageId: string) =>
    `/channels/${channelId}/polls/${messageId}/expire` as const,
} as const satisfies RouteBuilder;

/**
 * @description Zero-cache Discord poll API client with direct REST operations for poll management and vote retrieval.
 * @see {@link https://discord.com/developers/docs/resources/poll}
 */
export class PollRouter extends BaseRouter {
  /**
   * @description Retrieves paginated list of users who voted for a specific poll answer.
   * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters}
   *
   * @param channelId - Snowflake ID of the channel containing the poll
   * @param messageId - Snowflake ID of the message containing the poll
   * @param answerId - Answer ID to fetch voters for
   * @param query - Optional pagination parameters
   * @returns Promise resolving to response containing array of user objects who voted for this answer
   */
  getAnswerVoters(
    channelId: string,
    messageId: string,
    answerId: string,
    query?: RESTGetAnswerVotersQueryStringParams,
  ): Promise<{
    users: UserEntity[];
  }> {
    return this.rest.get(PollRoutes.getAnswerVoters(channelId, messageId, answerId), {
      query,
    });
  }

  /**
   * @description Immediately ends an active poll (only poll creator can end their own polls).
   * @see {@link https://discord.com/developers/docs/resources/poll#end-poll}
   *
   * @param channelId - Snowflake ID of the channel containing the poll
   * @param messageId - Snowflake ID of the message containing the poll to end
   * @returns Promise resolving to updated message object with ended poll
   */
  endPoll(channelId: string, messageId: string): Promise<MessageEntity> {
    return this.rest.post(PollRoutes.endPoll(channelId, messageId));
  }
}
