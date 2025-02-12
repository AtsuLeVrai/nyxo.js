import { ForumTagEntity, type Snowflake } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class ForumTag extends BaseClass<ForumTagEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof ForumTagEntity>> = {},
  ) {
    super(client, ForumTagEntity, entity);
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get name(): string {
    return this.entity.name;
  }

  get moderated(): boolean {
    return Boolean(this.entity.moderated);
  }

  get emojiId(): Snowflake | null {
    return this.entity.emoji_id ?? null;
  }

  get emojiName(): string | null {
    return this.entity.emoji_name ?? null;
  }

  toJson(): ForumTagEntity {
    return { ...this.entity };
  }
}

export const ForumTagSchema = z.instanceof(ForumTag);
