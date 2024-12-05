import type { MessageEntity, Snowflake } from "@nyxjs/core";
import type {
  GetVotersQueryEntity,
  PollVotersResponseEntity,
} from "../types/index.js";
import { BaseRouter } from "./base.js";

export class PollRouter extends BaseRouter {
  static routes = {
    channelPolls: (
      channelId: Snowflake,
      messageId: Snowflake,
      answerId: number,
    ): `/channels/${Snowflake}/polls/${Snowflake}/answers/${number}` => {
      return `/channels/${channelId}/polls/${messageId}/answers/${answerId}` as const;
    },
    expirePoll: (
      channelId: Snowflake,
      messageId: Snowflake,
    ): `/channels/${Snowflake}/polls/${Snowflake}/expire` => {
      return `/channels/${channelId}/polls/${messageId}/expire` as const;
    },
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters}
   */
  getAnswerVoters(
    channelId: Snowflake,
    messageId: Snowflake,
    answerId: number,
    query?: GetVotersQueryEntity,
  ): Promise<PollVotersResponseEntity> {
    return this.get(
      PollRouter.routes.channelPolls(channelId, messageId, answerId),
      {
        query: {
          after: query?.after,
          limit: query?.limit,
        },
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/poll#end-poll}
   */
  endPoll(channelId: Snowflake, messageId: Snowflake): Promise<MessageEntity> {
    return this.post(PollRouter.routes.expirePoll(channelId, messageId));
  }
}
