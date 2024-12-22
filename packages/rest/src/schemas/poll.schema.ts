import { SnowflakeManager, type UserEntity } from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters-response-body}
 */
export interface PollVotersResponseEntity {
  users: UserEntity[];
}

export const GetAnswerVotersQuerySchema = z
  .object({
    after: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
    limit: z.number().int().min(1).max(100).default(25).optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters-query-string-params}
 */
export type GetAnswerVotersQueryEntity = z.infer<
  typeof GetAnswerVotersQuerySchema
>;
