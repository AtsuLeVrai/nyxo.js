import { type LayoutType, PollEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { PollAnswer } from "./poll-answer.class.js";
import { PollMedia } from "./poll-media.class.js";
import { PollResults } from "./poll-results.class.js";

export class Poll extends BaseClass<PollEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof PollEntity>> = {},
  ) {
    super(client, PollEntity, entity);
  }

  get question(): PollMedia {
    return new PollMedia(this.client, this.entity.question);
  }

  get answers(): PollAnswer[] {
    return Array.isArray(this.entity.answers)
      ? this.entity.answers.map((answer) => new PollAnswer(this.client, answer))
      : [];
  }

  get expiry(): string | null {
    return this.entity.expiry ?? null;
  }

  get allowMultiselect(): boolean {
    return Boolean(this.entity.allow_multiselect);
  }

  get layoutType(): LayoutType {
    return this.entity.layout_type;
  }

  get results(): PollResults | null {
    return this.entity.results
      ? new PollResults(this.client, this.entity.results)
      : null;
  }

  toJson(): PollEntity {
    return { ...this.entity };
  }
}

export const PollSchema = z.instanceof(Poll);
