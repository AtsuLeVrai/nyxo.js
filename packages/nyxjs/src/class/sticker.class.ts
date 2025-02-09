import { StickerEntity } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class Sticker {
  readonly #data: StickerEntity;

  constructor(data: Partial<z.input<typeof StickerEntity>> = {}) {
    try {
      this.#data = StickerEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get id(): unknown {
    return this.#data.id;
  }

  get packId(): unknown | null {
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

  get type(): unknown {
    return this.#data.type;
  }

  get formatType(): unknown {
    return this.#data.format_type;
  }

  get available(): boolean | null {
    return this.#data.available ?? null;
  }

  get guildId(): unknown | null {
    return this.#data.guild_id ?? null;
  }

  get user(): unknown | null {
    return this.#data.user ?? null;
  }

  get sortValue(): number | null {
    return this.#data.sort_value ?? null;
  }

  static fromJson(json: StickerEntity): Sticker {
    return new Sticker(json);
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
