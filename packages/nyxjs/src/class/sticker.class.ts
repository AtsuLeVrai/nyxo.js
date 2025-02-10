import {
  type Snowflake,
  StickerEntity,
  type StickerFormatType,
  type StickerType,
} from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { User } from "./user.class.js";

export class Sticker {
  readonly #data: StickerEntity;

  constructor(data: Partial<z.input<typeof StickerEntity>> = {}) {
    try {
      this.#data = StickerEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get id(): Snowflake {
    return this.#data.id;
  }

  get packId(): Snowflake | null {
    return this.#data.pack_id ?? null;
  }

  get name(): string {
    return this.#data.name;
  }

  get description(): string | null {
    return this.#data.description ?? null;
  }

  get tags(): string {
    return this.#data.tags;
  }

  get type(): StickerType {
    return this.#data.type;
  }

  get formatType(): StickerFormatType {
    return this.#data.format_type;
  }

  get available(): boolean {
    return Boolean(this.#data.available);
  }

  get guildId(): Snowflake | null {
    return this.#data.guild_id ?? null;
  }

  get user(): User | null {
    return this.#data.user ? new User(this.#data.user) : null;
  }

  get sortValue(): number | null {
    return this.#data.sort_value ?? null;
  }

  toJson(): StickerEntity {
    return { ...this.#data };
  }

  clone(): Sticker {
    return new Sticker(this.toJson());
  }

  validate(): boolean {
    try {
      StickerSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<StickerEntity>): Sticker {
    return new Sticker({ ...this.toJson(), ...other });
  }

  equals(other: Sticker): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const StickerSchema = z.instanceof(Sticker);
