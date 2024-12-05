import type { Integer, Snowflake, UserEntity } from "@nyxjs/core";

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters-response-body}
 */
export interface PollVotersResponseEntity {
  users: UserEntity[];
}

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters-query-string-params}
 */
export interface GetVotersQueryEntity {
  after?: Snowflake;
  limit?: Integer;
}
