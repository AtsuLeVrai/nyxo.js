import { BaseRouter } from "../../bases/index.js";
import type { RouteBuilder } from "../../core/index.js";
import type { MessageEntity } from "../message/index.js";
import type { UserEntity } from "../user/index.js";

export interface RESTGetAnswerVotersQueryStringParams {
  after?: string;
  limit?: number;
}

export const PollRoutes = {
  getAnswerVoters: (channelId: string, messageId: string, answerId: string) =>
    `/channels/${channelId}/polls/${messageId}/answers/${answerId}` as const,
  endPoll: (channelId: string, messageId: string) =>
    `/channels/${channelId}/polls/${messageId}/expire` as const,
} as const satisfies RouteBuilder;

export class PollRouter extends BaseRouter {
  getAnswerVoters(
    channelId: string,
    messageId: string,
    answerId: string,
    query?: RESTGetAnswerVotersQueryStringParams,
  ): Promise<{
    users: UserEntity[];
  }> {
    return this.rest.get(PollRoutes.getAnswerVoters(channelId, messageId, answerId), {
      query,
    });
  }

  endPoll(channelId: string, messageId: string): Promise<MessageEntity> {
    return this.rest.post(PollRoutes.endPoll(channelId, messageId));
  }
}
