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
    entity: Partial<z.input<typeof StickerEntity>> = {},
  ) {
    super(client, StickerEntity, entity);
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get packId(): Snowflake | null {
    return this.entity.pack_id ?? null;
  }

  get name(): string {
    return this.entity.name;
  }

  get description(): string | null {
    return this.entity.description ?? null;
  }

  get tags(): string {
    return this.entity.tags;
  }

  get type(): StickerType {
    return this.entity.type;
  }

  get formatType(): StickerFormatType {
    return this.entity.format_type;
  }

  get available(): boolean {
    return Boolean(this.entity.available);
  }

  get guildId(): Snowflake | null {
    return this.entity.guild_id ?? null;
  }

  get user(): User | null {
    return this.entity.user ? new User(this.client, this.entity.user) : null;
  }

  get sortValue(): number | null {
    return this.entity.sort_value ?? null;
  }

  toJson(): StickerEntity {
    return { ...this.entity };
  }
}

export const StickerSchema = z.instanceof(Sticker);
