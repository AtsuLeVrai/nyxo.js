import type { MessageEntity, Snowflake } from "@nyxjs/core";
import { fromZodError } from "zod-validation-error";
import type { Rest } from "../core/index.js";
import {
  GetAnswerVotersQuerySchema,
  type PollVotersResponseEntity,
} from "../schemas/index.js";

export class PollRouter {
  static readonly ROUTES = {
    channelPollAnswer: (
      channelId: Snowflake,
      messageId: Snowflake,
      answerId: number,
    ) =>
      `/channels/${channelId}/polls/${messageId}/answers/${answerId}` as const,
    channelPollExpire: (channelId: Snowflake, messageId: Snowflake) =>
      `/channels/${channelId}/polls/${messageId}/expire` as const,
  } as const;

  #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters}
   */
  getAnswerVoters(
    channelId: Snowflake,
    messageId: Snowflake,
    answerId: number,
    query: GetAnswerVotersQuerySchema = {},
  ): Promise<PollVotersResponseEntity> {
    const result = GetAnswerVotersQuerySchema.safeParse(query);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.get(
      PollRouter.ROUTES.channelPollAnswer(channelId, messageId, answerId),
      {
        query: result.data,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/poll#end-poll}
   */
  endPoll(channelId: Snowflake, messageId: Snowflake): Promise<MessageEntity> {
    return this.#rest.post(
      PollRouter.ROUTES.channelPollExpire(channelId, messageId),
    );
  }
}
