import { type LayoutType, PollEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { PollAnswer } from "./poll-answer.class.js";
import { PollMedia } from "./poll-media.class.js";
import { PollResults } from "./poll-results.class.js";

export class Poll extends BaseClass<PollEntity> {
  constructor(client: Client, data: Partial<z.input<typeof PollEntity>> = {}) {
    super(client, PollEntity, data);
  }

  get question(): PollMedia {
    return new PollMedia(this.client, this.data.question);
  }

  get answers(): PollAnswer[] {
    return Array.isArray(this.data.answers)
      ? this.data.answers.map((answer) => new PollAnswer(this.client, answer))
      : [];
  }

  get expiry(): string | null {
    return this.data.expiry ?? null;
  }

  get allowMultiselect(): boolean {
    return Boolean(this.data.allow_multiselect);
  }

  get layoutType(): LayoutType {
    return this.data.layout_type;
  }

  get results(): PollResults | null {
    return this.data.results
      ? new PollResults(this.client, this.data.results)
      : null;
  }

  toJson(): PollEntity {
    return { ...this.data };
  }
}

export const PollSchema = z.instanceof(Poll);
