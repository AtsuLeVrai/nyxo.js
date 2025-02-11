import { ForumTagEntity, type Snowflake } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class ForumTag extends BaseClass<ForumTagEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof ForumTagEntity>> = {},
  ) {
    super(client, ForumTagEntity, data);
  }

  get id(): Snowflake {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get moderated(): boolean {
    return Boolean(this.data.moderated);
  }

  get emojiId(): Snowflake | null {
    return this.data.emoji_id ?? null;
  }

  get emojiName(): string | null {
    return this.data.emoji_name ?? null;
  }

  toJson(): ForumTagEntity {
    return { ...this.data };
  }
}

export const ForumTagSchema = z.instanceof(ForumTag);
