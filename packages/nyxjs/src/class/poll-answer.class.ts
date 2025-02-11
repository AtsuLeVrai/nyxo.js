import { PollAnswerEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { PollMedia } from "./poll-media.class.js";

export class PollAnswer extends BaseClass<PollAnswerEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof PollAnswerEntity>> = {},
  ) {
    super(client, PollAnswerEntity, data);
  }

  get answerId(): number {
    return this.data.answer_id;
  }

  get pollMedia(): PollMedia | null {
    return this.data.poll_media
      ? new PollMedia(this.client, this.data.poll_media)
      : null;
  }

  toJson(): PollAnswerEntity {
    return { ...this.data };
  }
}

export const PollAnswerSchema = z.instanceof(PollAnswer);
