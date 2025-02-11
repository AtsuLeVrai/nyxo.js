import { EmojiEntity, type Snowflake } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { User } from "./user.class.js";

export class Emoji extends BaseClass<EmojiEntity> {
  constructor(client: Client, data: Partial<z.input<typeof EmojiEntity>> = {}) {
    super(client, EmojiEntity, data);
  }

  get id(): Snowflake | null {
    return this.data.id ?? null;
  }

  get name(): string | null {
    return this.data.name ?? null;
  }

  get roles(): Snowflake[] | null {
    return this.data.roles ?? null;
  }

  get user(): User | null {
    return this.data.user ? new User(this.client, this.data.user) : null;
  }

  get requireColons(): boolean {
    return Boolean(this.data.require_colons);
  }

  get managed(): boolean {
    return Boolean(this.data.managed);
  }

  get animated(): boolean {
    return Boolean(this.data.animated);
  }

  get available(): boolean {
    return Boolean(this.data.available);
  }

  toJson(): EmojiEntity {
    return { ...this.data };
  }
}

export const EmojiSchema = z.instanceof(Emoji);
