import { PollAnswerCountEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class PollAnswerCount extends BaseClass<PollAnswerCountEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof PollAnswerCountEntity>> = {},
  ) {
    super(client, PollAnswerCountEntity, entity);
  }

  get id(): number {
    return this.entity.id;
  }

  get count(): number {
    return this.entity.count;
  }

  get meVoted(): boolean {
    return Boolean(this.entity.me_voted);
  }

  toJson(): PollAnswerCountEntity {
    return { ...this.entity };
  }
}

export const PollAnswerCountSchema = z.instanceof(PollAnswerCount);
