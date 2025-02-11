import { PollAnswerCountEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class PollAnswerCount extends BaseClass<PollAnswerCountEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof PollAnswerCountEntity>> = {},
  ) {
    super(client, PollAnswerCountEntity, data);
  }

  get id(): number {
    return this.data.id;
  }

  get count(): number {
    return this.data.count;
  }

  get meVoted(): boolean {
    return Boolean(this.data.me_voted);
  }

  toJson(): PollAnswerCountEntity {
    return { ...this.data };
  }
}

export const PollAnswerCountSchema = z.instanceof(PollAnswerCount);
