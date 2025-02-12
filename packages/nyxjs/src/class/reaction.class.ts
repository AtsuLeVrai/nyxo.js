import { ReactionEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { Emoji } from "./emoji.class.js";
import { ReactionCountDetails } from "./reaction-count-details.class.js";

export class Reaction extends BaseClass<ReactionEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof ReactionEntity>> = {},
  ) {
    super(client, ReactionEntity, entity);
  }

  get count(): number {
    return this.entity.count;
  }

  get countDetails(): ReactionCountDetails | null {
    return this.entity.count_details
      ? new ReactionCountDetails(this.client, this.entity.count_details)
      : null;
  }

  get me(): boolean {
    return Boolean(this.entity.me);
  }

  get meBurst(): boolean {
    return Boolean(this.entity.me_burst);
  }

  get emoji(): Emoji | null {
    return this.entity.emoji ? new Emoji(this.client, this.entity.emoji) : null;
  }

  get burstColors(): unknown {
    return this.entity.burst_colors;
  }

  toJson(): ReactionEntity {
    return { ...this.entity };
  }
}

export const ReactionSchema = z.instanceof(Reaction);
