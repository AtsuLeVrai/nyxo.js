import type { MessageEntity, Snowflake } from "@nyxjs/core";
import type { Rest } from "../rest.js";
import {
  type GetAnswerVotersQueryEntity,
  GetAnswerVotersQuerySchema,
  type PollVotersResponseEntity,
} from "../schemas/index.js";
import type { HttpResponse } from "../types/index.js";

export class PollRouter {
  static ROUTES = {
    channelPolls: (
      channelId: Snowflake,
      messageId: Snowflake,
      answerId: number,
    ) =>
      `/channels/${channelId}/polls/${messageId}/answers/${answerId}` as const,
    expirePoll: (channelId: Snowflake, messageId: Snowflake) =>
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
    query: GetAnswerVotersQueryEntity = {},
  ): Promise<HttpResponse<PollVotersResponseEntity>> {
    const result = GetAnswerVotersQuerySchema.safeParse(query);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.#rest.get(
      PollRouter.ROUTES.channelPolls(channelId, messageId, answerId),
      {
        query: result.data,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/poll#end-poll}
   */
  endPoll(
    channelId: Snowflake,
    messageId: Snowflake,
  ): Promise<HttpResponse<MessageEntity>> {
    return this.#rest.post(PollRouter.ROUTES.expirePoll(channelId, messageId));
  }
}
