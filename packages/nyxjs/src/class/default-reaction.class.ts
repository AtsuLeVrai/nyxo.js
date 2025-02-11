import { DefaultReactionEntity, type Snowflake } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class DefaultReaction extends BaseClass<DefaultReactionEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof DefaultReactionEntity>> = {},
  ) {
    super(client, DefaultReactionEntity, data);
  }

  get emojiId(): Snowflake | null {
    return this.data.emoji_id ?? null;
  }

  get emojiName(): string | null {
    return this.data.emoji_name ?? null;
  }

  toJson(): DefaultReactionEntity {
    return { ...this.data };
  }
}

export const DefaultReactionSchema = z.instanceof(DefaultReaction);
