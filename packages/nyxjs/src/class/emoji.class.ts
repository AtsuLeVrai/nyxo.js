import { EmojiEntity } from "@nyxjs/core";
import { z } from "zod";

export class Emoji {
  readonly #data: EmojiEntity;

  constructor(data: EmojiEntity) {
    this.#data = EmojiEntity.parse(data);
  }

  get id(): unknown | null {
    return this.#data.id ?? null;
  }

  get name(): string | null {
    return this.#data.name ?? null;
  }

  get roles(): unknown[] | null {
    return this.#data.roles ?? null;
  }

  get user(): unknown | null {
    return this.#data.user ?? null;
  }

  get requireColons(): boolean | null {
    return this.#data.require_colons ?? null;
  }

  get managed(): boolean | null {
    return this.#data.managed ?? null;
  }

  get animated(): boolean | null {
    return this.#data.animated ?? null;
  }

  get available(): boolean | null {
    return this.#data.available ?? null;
  }

  static fromJson(json: EmojiEntity): Emoji {
    return new Emoji(json);
  }

  toJson(): EmojiEntity {
    return { ...this.#data };
  }

  clone(): Emoji {
    return new Emoji(this.toJson());
  }

  validate(): boolean {
    try {
      EmojiSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<EmojiEntity>): Emoji {
    return new Emoji({ ...this.toJson(), ...other });
  }

  equals(other: Emoji): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const EmojiSchema = z.instanceof(Emoji);
