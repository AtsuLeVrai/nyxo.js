import { type LayoutType, PollCreateRequestEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { PollAnswer } from "./poll-answer.class.js";
import { PollMedia } from "./poll-media.class.js";

export class PollCreateRequest extends BaseClass<PollCreateRequestEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof PollCreateRequestEntity>> = {},
  ) {
    super(client, PollCreateRequestEntity as z.ZodSchema, entity);
  }

  get question(): PollMedia | null {
    return this.entity.question
      ? new PollMedia(this.client, this.entity.question)
      : null;
  }

  get answers(): PollAnswer[] {
    return Array.isArray(this.entity.answers)
      ? this.entity.answers.map((answer) => new PollAnswer(this.client, answer))
      : [];
  }

  get duration(): number {
    return this.entity.duration;
  }

  get allowMultiselect(): boolean {
    return Boolean(this.entity.allow_multiselect);
  }

  get layoutType(): LayoutType {
    return this.entity.layout_type;
  }

  toJson(): PollCreateRequestEntity {
    return { ...this.entity };
  }
}

export const PollCreateRequestSchema = z.instanceof(PollCreateRequest);
