import { EmojiEntity, type Snowflake } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { User } from "./user.class.js";

export class Emoji {
  readonly #data: EmojiEntity;

  constructor(data: Partial<z.input<typeof EmojiEntity>> = {}) {
    try {
      this.#data = EmojiEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get id(): Snowflake | null {
    return this.#data.id ?? null;
  }

  get name(): string | null {
    return this.#data.name ?? null;
  }

  get roles(): Snowflake[] | null {
    return this.#data.roles ?? null;
  }

  get user(): User | null {
    return this.#data.user ? new User(this.#data.user) : null;
  }

  get requireColons(): boolean {
    return Boolean(this.#data.require_colons);
  }

  get managed(): boolean {
    return Boolean(this.#data.managed);
  }

  get animated(): boolean {
    return Boolean(this.#data.animated);
  }

  get available(): boolean {
    return Boolean(this.#data.available);
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
