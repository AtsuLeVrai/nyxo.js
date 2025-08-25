import type { Rest } from "../../core/index.js";
import type { MessageEntity } from "../message/index.js";
import type { UserEntity } from "../user/index.js";

export interface PollVotersResponse {
  users: UserEntity[];
}

export interface PollVotersFetchParams {
  after?: string;
  limit?: number;
}

export class PollRouter {
  static readonly Routes = {
    pollAnswerVotersEndpoint: (channelId: string, messageId: string, answerId: number) =>
      `/channels/${channelId}/polls/${messageId}/answers/${answerId}` as const,
    endPollEndpoint: (channelId: string, messageId: string) =>
      `/channels/${channelId}/polls/${messageId}/expire` as const,
  } as const satisfies Record<string, (...args: any[]) => string>;
  readonly #rest: Rest;
  constructor(rest: Rest) {
    this.#rest = rest;
  }
  fetchAnswerVoters(
    channelId: string,
    messageId: string,
    answerId: number,
    query?: PollVotersFetchParams,
  ): Promise<PollVotersResponse> {
    return this.#rest.get(
      PollRouter.Routes.pollAnswerVotersEndpoint(channelId, messageId, answerId),
      { query },
    );
  }
  endPoll(channelId: string, messageId: string): Promise<MessageEntity> {
    return this.#rest.post(PollRouter.Routes.endPollEndpoint(channelId, messageId));
  }
}
