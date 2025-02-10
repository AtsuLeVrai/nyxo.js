import { PollMediaEntity } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { Emoji } from "./emoji.class.js";

export class PollMedia {
  readonly #data: PollMediaEntity;

  constructor(data: Partial<z.input<typeof PollMediaEntity>> = {}) {
    try {
      this.#data = PollMediaEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get text(): string | null {
    return this.#data.text ?? null;
  }

  get emoji(): Emoji | null {
    return this.#data.emoji ? new Emoji(this.#data.emoji) : null;
  }

  toJson(): PollMediaEntity {
    return { ...this.#data };
  }

  clone(): PollMedia {
    return new PollMedia(this.toJson());
  }

  validate(): boolean {
    try {
      PollMediaSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<PollMediaEntity>): PollMedia {
    return new PollMedia({ ...this.toJson(), ...other });
  }

  equals(other: PollMedia): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const PollMediaSchema = z.instanceof(PollMedia);
