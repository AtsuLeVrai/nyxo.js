import { PollMediaEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { Emoji } from "./emoji.class.js";

export class PollMedia extends BaseClass<PollMediaEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof PollMediaEntity>> = {},
  ) {
    super(client, PollMediaEntity, entity);
  }

  get text(): string | null {
    return this.entity.text ?? null;
  }

  get emoji(): Emoji | null {
    return this.entity.emoji ? new Emoji(this.client, this.entity.emoji) : null;
  }

  toJson(): PollMediaEntity {
    return { ...this.entity };
  }
}

export const PollMediaSchema = z.instanceof(PollMedia);
