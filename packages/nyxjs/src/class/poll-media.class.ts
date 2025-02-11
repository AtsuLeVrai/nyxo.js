import { PollMediaEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { Emoji } from "./emoji.class.js";

export class PollMedia extends BaseClass<PollMediaEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof PollMediaEntity>> = {},
  ) {
    super(client, PollMediaEntity, data);
  }

  get text(): string | null {
    return this.data.text ?? null;
  }

  get emoji(): Emoji | null {
    return this.data.emoji ? new Emoji(this.client, this.data.emoji) : null;
  }

  toJson(): PollMediaEntity {
    return { ...this.data };
  }
}

export const PollMediaSchema = z.instanceof(PollMedia);
