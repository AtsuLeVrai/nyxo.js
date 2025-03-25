import type { MessageEntity, Snowflake } from "@nyxjs/core";
import type { Rest } from "../core/index.js";
import type {
  GetAnswerVotersQuerySchema,
  PollVotersResponseEntity,
} from "../schemas/index.js";

/**
 * Router class for Discord Poll-related endpoints
 * Provides methods to interact with polls, retrieve voters, and end polls
 *
 * @see {@link https://discord.com/developers/docs/resources/poll}
 */
export class PollRouter {
  /**
   * Collection of route URLs for poll-related endpoints
   */
  static readonly ROUTES = {
    /**
     * Route for retrieving voters for a specific poll answer
     *
     * @param channelId - The ID of the channel containing the poll
     * @param messageId - The ID of the message containing the poll
     * @param answerId - The ID of the answer to get voters for
     * @returns `/channels/{channel.id}/polls/{message.id}/answers/{answer_id}` route
     * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters}
     */
    channelPollAnswer: (
      channelId: Snowflake,
      messageId: Snowflake,
      answerId: number,
    ) =>
      `/channels/${channelId}/polls/${messageId}/answers/${answerId}` as const,

    /**
     * Route for ending a poll immediately
     *
     * @param channelId - The ID of the channel containing the poll
     * @param messageId - The ID of the message containing the poll
     * @returns `/channels/{channel.id}/polls/{message.id}/expire` route
     * @see {@link https://discord.com/developers/docs/resources/poll#end-poll}
     */
    channelPollExpire: (channelId: Snowflake, messageId: Snowflake) =>
      `/channels/${channelId}/polls/${messageId}/expire` as const,
  } as const;

  /** The REST client used to make requests to the Discord API */
  readonly #rest: Rest;

  /**
   * Creates a new PollRouter instance
   * @param rest - The REST client used to make requests to the Discord API
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Retrieves a list of users that voted for a specific poll answer
   * Supports pagination through the query parameters
   *
   * @param channelId - The ID of the channel containing the poll
   * @param messageId - The ID of the message containing the poll
   * @param answerId - The ID of the answer to get voters for
   * @param query - Query parameters for pagination
   * @param query.after - Get users after this user ID
   * @param query.limit - Maximum number of users to return (1-100)
   * @returns A list of users who voted for the specified answer
   * @throws Error if validation of query parameters fails
   * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters}
   */
  getAnswerVoters(
    channelId: Snowflake,
    messageId: Snowflake,
    answerId: number,
    query: GetAnswerVotersQuerySchema = {},
  ): Promise<PollVotersResponseEntity> {
    return this.#rest.get(
      PollRouter.ROUTES.channelPollAnswer(channelId, messageId, answerId),
      {
        query,
      },
    );
  }

  /**
   * Immediately ends a poll
   * Note: You cannot end polls created by other users
   *
   * @param channelId - The ID of the channel containing the poll
   * @param messageId - The ID of the message containing the poll
   * @returns The updated message object with the ended poll
   * @see {@link https://discord.com/developers/docs/resources/poll#end-poll}
   */
  endPoll(channelId: Snowflake, messageId: Snowflake): Promise<MessageEntity> {
    return this.#rest.post(
      PollRouter.ROUTES.channelPollExpire(channelId, messageId),
    );
  }
}
