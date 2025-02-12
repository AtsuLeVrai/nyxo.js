import { EmojiEntity, type Snowflake } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { User } from "./user.class.js";

export class Emoji extends BaseClass<EmojiEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof EmojiEntity>> = {},
  ) {
    super(client, EmojiEntity, entity);
  }

  get id(): Snowflake | null {
    return this.entity.id ?? null;
  }

  get name(): string | null {
    return this.entity.name ?? null;
  }

  get roles(): Snowflake[] | null {
    return this.entity.roles ?? null;
  }

  get user(): User | null {
    return this.entity.user ? new User(this.client, this.entity.user) : null;
  }

  get requireColons(): boolean {
    return Boolean(this.entity.require_colons);
  }

  get managed(): boolean {
    return Boolean(this.entity.managed);
  }

  get animated(): boolean {
    return Boolean(this.entity.animated);
  }

  get available(): boolean {
    return Boolean(this.entity.available);
  }

  toJson(): EmojiEntity {
    return { ...this.entity };
  }
}

export const EmojiSchema = z.instanceof(Emoji);
