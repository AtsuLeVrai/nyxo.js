import type { MessageEntity, Snowflake, UserEntity } from "@nyxojs/core";
import type { Rest } from "../core/index.js";

/**
 * Interface representing the response body when retrieving poll answer voters.
 * Contains list of users who voted for a specific poll answer.
 *
 * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters-response-body}
 */
export interface PollVotersResponse {
  /**
   * Array of users who voted for the answer.
   * Contains standard user information such as id, username, avatar.
   */
  users: UserEntity[];
}

/**
 * Interface for query parameters when retrieving voters for a poll answer.
 * Allows pagination when listing users who voted for an answer.
 *
 * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters-query-string-params}
 */
export interface PollVotersFetchParams {
  /**
   * Get users after this user ID (for pagination).
   * Returns users with IDs greater than this value.
   */
  after?: Snowflake;

  /**
   * Maximum number of users to return (1-100).
   * Defaults to 25 if not specified.
   */
  limit?: number;
}

/**
 * Router for Discord Poll-related endpoints.
 * Provides methods to interact with polls and retrieve voter information.
 *
 * @see {@link https://discord.com/developers/docs/resources/poll}
 */
export class PollRouter {
  /**
   * API route constants for poll-related endpoints.
   */
  static readonly POLL_ROUTES = {
    /**
     * Route for retrieving voters for a specific poll answer.
     * @param channelId - The ID of the channel containing the poll
     * @param messageId - The ID of the message containing the poll
     * @param answerId - The ID of the answer to get voters for
     */
    pollAnswerVotersEndpoint: (
      channelId: Snowflake,
      messageId: Snowflake,
      answerId: number,
    ) =>
      `/channels/${channelId}/polls/${messageId}/answers/${answerId}` as const,

    /**
     * Route for ending a poll immediately.
     * @param channelId - The ID of the channel containing the poll
     * @param messageId - The ID of the message containing the poll
     */
    endPollEndpoint: (channelId: Snowflake, messageId: Snowflake) =>
      `/channels/${channelId}/polls/${messageId}/expire` as const,
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new instance of a router.
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches a list of users that voted for a specific poll answer.
   * Requires the READ_MESSAGE_HISTORY permission.
   *
   * @param channelId - The ID of the channel containing the poll
   * @param messageId - The ID of the message containing the poll
   * @param answerId - The ID of the answer to get voters for (zero-indexed)
   * @param query - Query parameters for pagination
   * @returns A Promise resolving to a list of users who voted for the answer
   * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters}
   */
  fetchAnswerVoters(
    channelId: Snowflake,
    messageId: Snowflake,
    answerId: number,
    query?: PollVotersFetchParams,
  ): Promise<PollVotersResponse> {
    return this.#rest.get(
      PollRouter.POLL_ROUTES.pollAnswerVotersEndpoint(
        channelId,
        messageId,
        answerId,
      ),
      { query },
    );
  }

  /**
   * Immediately ends a poll.
   * Requires being the poll creator or having MANAGE_MESSAGES permission.
   *
   * @param channelId - The ID of the channel containing the poll
   * @param messageId - The ID of the message containing the poll
   * @returns A Promise resolving to the updated message with the ended poll
   * @see {@link https://discord.com/developers/docs/resources/poll#end-poll}
   */
  endPoll(channelId: Snowflake, messageId: Snowflake): Promise<MessageEntity> {
    return this.#rest.post(
      PollRouter.POLL_ROUTES.endPollEndpoint(channelId, messageId),
    );
  }
}
