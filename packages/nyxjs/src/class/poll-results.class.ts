import { PollResultsEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { PollAnswerCount } from "./poll-answer-count.class.js";

export class PollResults extends BaseClass<PollResultsEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof PollResultsEntity>> = {},
  ) {
    super(client, PollResultsEntity, data);
  }

  get isFinalized(): boolean {
    return Boolean(this.data.is_finalized);
  }

  get answerCounts(): PollAnswerCount[] {
    return Array.isArray(this.data.answer_counts)
      ? this.data.answer_counts.map(
          (answerCount) => new PollAnswerCount(this.client, answerCount),
        )
      : [];
  }

  toJson(): PollResultsEntity {
    return { ...this.data };
  }
}

export const PollResultsSchema = z.instanceof(PollResults);
