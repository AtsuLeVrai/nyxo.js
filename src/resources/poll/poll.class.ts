import { BaseClass } from "../../bases/index.js";
import type { CamelCaseKeys } from "../../utils/index.js";
import type {
  PollAnswerCountEntity,
  PollAnswerEntity,
  PollEntity,
  PollResultsEntity,
} from "./poll.entity.js";

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
