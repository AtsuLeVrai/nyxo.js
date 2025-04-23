import type { MessageEntity, Snowflake, UserEntity } from "@nyxojs/core";
import type { Rest } from "../core/index.js";

/**
 * Interface representing the response body when retrieving poll answer voters.
 *
 * Contains a list of users who voted for a specific poll answer, allowing
 * visibility into who selected each option in a poll.
 *
 * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters-response-body}
 */
export interface PollVotersResponse {
  /**
   * Array of users who voted for the answer.
   *
   * Each user object contains standard user information such as
   * id, username, avatar, and other user profile details.
   */
  users: UserEntity[];
}

/**
 * Interface for query parameters when retrieving voters for a poll answer.
 *
 * These parameters allow for efficient pagination when listing the users
 * who voted for a specific answer, especially useful for polls with many votes.
 *
 * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters-query-string-params}
 */
export interface PollVotersFetchParams {
  /**
   * Get users after this user ID (for pagination).
   *
   * When specified, returns users with IDs that come after this value,
   * ordered by user ID in ascending order. Used for forward pagination.
   */
  after?: Snowflake;

  /**
   * Maximum number of users to return (1-100).
   *
   * Controls how many user objects are returned in a single request.
   * Defaults to 25 if not specified.
   */
  limit?: number;
}

/**
 * Router for Discord Poll-related endpoints.
 *
 * This class provides methods to interact with Discord's poll system,
 * allowing you to retrieve information about poll voters and end polls.
 * Polls are an interactive way for users to vote on options in Discord messages.
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
     *
     * @param channelId - The ID of the channel containing the poll
     * @param messageId - The ID of the message containing the poll
     * @param answerId - The ID of the answer to get voters for
     * @returns The formatted API route string
     * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters}
     */
    pollAnswerVotersEndpoint: (
      channelId: Snowflake,
      messageId: Snowflake,
      answerId: number,
    ) =>
      `/channels/${channelId}/polls/${messageId}/answers/${answerId}` as const,

    /**
     * Route for ending a poll immediately.
     *
     * @param channelId - The ID of the channel containing the poll
     * @param messageId - The ID of the message containing the poll
     * @returns The formatted API route string
     * @see {@link https://discord.com/developers/docs/resources/poll#end-poll}
     */
    endPollEndpoint: (channelId: Snowflake, messageId: Snowflake) =>
      `/channels/${channelId}/polls/${messageId}/expire` as const,
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new Poll Router instance.
   *
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches a list of users that voted for a specific poll answer.
   *
   * This method retrieves the users who selected a particular answer option
   * in a poll, with support for pagination to handle polls with many voters.
   *
   * @param channelId - The ID of the channel containing the poll
   * @param messageId - The ID of the message containing the poll
   * @param answerId - The ID of the answer to get voters for
   * @param query - Query parameters for pagination
   * @returns A Promise resolving to a list of users who voted for the specified answer
   * @throws {Error} Error if the poll doesn't exist, the answer is invalid, or you lack permissions
   *
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
      {
        query,
      },
    );
  }

  /**
   * Immediately ends a poll.
   *
   * This method forcibly closes a poll before its scheduled end time,
   * preventing further votes and finalizing the results.
   *
   * @param channelId - The ID of the channel containing the poll
   * @param messageId - The ID of the message containing the poll
   * @returns A Promise resolving to the updated message object with the ended poll
   * @throws {Error} Will throw an error if the poll doesn't exist or you didn't create it
   *
   * @see {@link https://discord.com/developers/docs/resources/poll#end-poll}
   *
   * @note You cannot end polls created by other users.
   */
  endPoll(channelId: Snowflake, messageId: Snowflake): Promise<MessageEntity> {
    return this.#rest.post(
      PollRouter.POLL_ROUTES.endPollEndpoint(channelId, messageId),
    );
  }
}
