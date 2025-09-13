export enum LayoutType {
  Default = 1,
}

export interface PollAnswerCountEntity {
  id: number;
  count: number;
  me_voted: boolean;
}

export interface PollResultsEntity {
  is_finalized: boolean;
  answer_counts: PollAnswerCountEntity[];
}

export interface PollMediaEntity {
  text?: string;
  emoji?: Pick<EmojiEntity, "id"> | Pick<EmojiEntity, "name">;
}

export interface PollAnswerEntity {
  answer_id: number;
  poll_media: PollMediaEntity & {
    text?: string;
  };
}

export interface PollCreateRequestEntity {
  question: PollMediaEntity & {
    text?: string;
  };
  answers: { poll_media: PollAnswerEntity["poll_media"] }[];
  duration: number;
  allow_multiselect: boolean;
  layout_type: LayoutType;
}

export interface PollEntity {
  question: PollMediaEntity & {
    text?: string;
  };
  answers: PollAnswerEntity[];
  expiry: string | null;
  allow_multiselect: boolean;
  layout_type: LayoutType;
  results?: PollResultsEntity;
}

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

export class Poll extends BaseClass<PollEntity> implements CamelCaseKeys<PollEntity> {
  readonly question = this.rawData.question;
  readonly answers = this.rawData.answers.map((answer) => new PollAnswer(this.client, answer));
  readonly expiry = this.rawData.expiry;
  readonly allowMultiselect = this.rawData.allow_multiselect;
  readonly layoutType = this.rawData.layout_type;
  readonly results = this.rawData.results
    ? new PollResults(this.client, this.rawData.results)
    : undefined;
}

export class PollAnswer
  extends BaseClass<PollAnswerEntity>
  implements CamelCaseKeys<PollAnswerEntity>
{
  readonly answerId = this.rawData.answer_id;
  readonly pollMedia = this.rawData.poll_media;
}

export class PollResults
  extends BaseClass<PollResultsEntity>
  implements CamelCaseKeys<PollResultsEntity>
{
  readonly isFinalized = this.rawData.is_finalized;
  readonly answerCounts = this.rawData.answer_counts.map(
    (count) => new PollAnswerCount(this.client, count),
  );
}

export class PollAnswerCount
  extends BaseClass<PollAnswerCountEntity>
  implements CamelCaseKeys<PollAnswerCountEntity>
{
  readonly id = this.rawData.id;
  readonly count = this.rawData.count;
  readonly meVoted = this.rawData.me_voted;
}
