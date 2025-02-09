import { PollMediaEntity } from "@nyxjs/core";
import { z } from "zod";

export class PollMedia {
  readonly #data: PollMediaEntity;

  constructor(data: PollMediaEntity) {
    this.#data = PollMediaEntity.parse(data);
  }

  get text(): string | null {
    return this.#data.text ?? null;
  }

  get emoji(): unknown | null {
    return this.#data.emoji ?? null;
  }

  static fromJson(json: PollMediaEntity): PollMedia {
    return new PollMedia(json);
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
