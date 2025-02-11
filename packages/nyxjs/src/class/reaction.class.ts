import { ReactionEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { Emoji } from "./emoji.class.js";
import { ReactionCountDetails } from "./reaction-count-details.class.js";

export class Reaction extends BaseClass<ReactionEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof ReactionEntity>> = {},
  ) {
    super(client, ReactionEntity, data);
  }

  get count(): number {
    return this.data.count;
  }

  get countDetails(): ReactionCountDetails | null {
    return this.data.count_details
      ? new ReactionCountDetails(this.client, this.data.count_details)
      : null;
  }

  get me(): boolean {
    return Boolean(this.data.me);
  }

  get meBurst(): boolean {
    return Boolean(this.data.me_burst);
  }

  get emoji(): Emoji | null {
    return this.data.emoji ? new Emoji(this.client, this.data.emoji) : null;
  }

  get burstColors(): unknown {
    return this.data.burst_colors;
  }

  toJson(): ReactionEntity {
    return { ...this.data };
  }
}

export const ReactionSchema = z.instanceof(Reaction);
