import { Snowflake, UserEntity } from "@nyxjs/core";
import { z } from "zod";

/**
 * Schema for representing the response body when retrieving poll answer voters
 * Contains a list of users who voted for a specific poll answer
 *
 * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters-response-body}
 */
export const PollVotersResponseEntity = z.object({
  /**
   * Array of users who voted for the answer
   */
  users: UserEntity.array(),
});

export type PollVotersResponseEntity = z.infer<typeof PollVotersResponseEntity>;

/**
 * Schema for query parameters when retrieving voters for a poll answer
 * Used for pagination when listing users who voted for a specific answer
 *
 * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters-query-string-params}
 */
export const GetAnswerVotersQuerySchema = z.object({
  /**
   * Get users after this user ID (for pagination)
   */
  after: Snowflake.optional(),

  /**
   * Maximum number of users to return (1-100)
   * @default 25
   */
  limit: z.number().int().min(1).max(100).default(25),
});

export type GetAnswerVotersQuerySchema = z.input<
  typeof GetAnswerVotersQuerySchema
>;
