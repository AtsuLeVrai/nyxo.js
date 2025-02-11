import {
  type Snowflake,
  StickerEntity,
  type StickerFormatType,
  type StickerType,
} from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { User } from "./user.class.js";

export class Sticker extends BaseClass<StickerEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof StickerEntity>> = {},
  ) {
    super(client, StickerEntity, data);
  }

  get id(): Snowflake {
    return this.data.id;
  }

  get packId(): Snowflake | null {
    return this.data.pack_id ?? null;
  }

  get name(): string {
    return this.data.name;
  }

  get description(): string | null {
    return this.data.description ?? null;
  }

  get tags(): string {
    return this.data.tags;
  }

  get type(): StickerType {
    return this.data.type;
  }

  get formatType(): StickerFormatType {
    return this.data.format_type;
  }

  get available(): boolean {
    return Boolean(this.data.available);
  }

  get guildId(): Snowflake | null {
    return this.data.guild_id ?? null;
  }

  get user(): User | null {
    return this.data.user ? new User(this.client, this.data.user) : null;
  }

  get sortValue(): number | null {
    return this.data.sort_value ?? null;
  }

  toJson(): StickerEntity {
    return { ...this.data };
  }
}

export const StickerSchema = z.instanceof(Sticker);
