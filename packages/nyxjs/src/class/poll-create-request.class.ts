import { type LayoutType, PollCreateRequestEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { PollAnswer } from "./poll-answer.class.js";
import { PollMedia } from "./poll-media.class.js";

export class PollCreateRequest extends BaseClass<PollCreateRequestEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof PollCreateRequestEntity>> = {},
  ) {
    super(client, PollCreateRequestEntity as z.ZodSchema, data);
  }

  get question(): PollMedia | null {
    return this.data.question
      ? new PollMedia(this.client, this.data.question)
      : null;
  }

  get answers(): PollAnswer[] {
    return Array.isArray(this.data.answers)
      ? this.data.answers.map((answer) => new PollAnswer(this.client, answer))
      : [];
  }

  get duration(): number {
    return this.data.duration;
  }

  get allowMultiselect(): boolean {
    return Boolean(this.data.allow_multiselect);
  }

  get layoutType(): LayoutType {
    return this.data.layout_type;
  }

  toJson(): PollCreateRequestEntity {
    return { ...this.data };
  }
}

export const PollCreateRequestSchema = z.instanceof(PollCreateRequest);
