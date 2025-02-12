import { PollAnswerEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { PollMedia } from "./poll-media.class.js";

export class PollAnswer extends BaseClass<PollAnswerEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof PollAnswerEntity>> = {},
  ) {
    super(client, PollAnswerEntity, entity);
  }

  get answerId(): number {
    return this.entity.answer_id;
  }

  get pollMedia(): PollMedia | null {
    return this.entity.poll_media
      ? new PollMedia(this.client, this.entity.poll_media)
      : null;
  }

  toJson(): PollAnswerEntity {
    return { ...this.entity };
  }
}

export const PollAnswerSchema = z.instanceof(PollAnswer);
