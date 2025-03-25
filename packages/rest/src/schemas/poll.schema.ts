import type { Snowflake, UserEntity } from "@nyxjs/core";

/**
 * Interface for representing the response body when retrieving poll answer voters.
 * Contains a list of users who voted for a specific poll answer.
 *
 * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters-response-body}
 */
export interface PollVotersResponseEntity {
  /**
   * Array of users who voted for the answer
   */
  users: UserEntity[];
}

/**
 * Interface for query parameters when retrieving voters for a poll answer.
 * Used for pagination when listing users who voted for a specific answer.
 *
 * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters-query-string-params}
 */
export interface GetAnswerVotersQuerySchema {
  /**
   * Get users after this user ID (for pagination)
   *
   * @optional
   */
  after?: Snowflake;

  /**
   * Maximum number of users to return (1-100)
   *
   * @minimum 1
   * @maximum 100
   * @default 25
   * @integer
   */
  limit?: number;
}
