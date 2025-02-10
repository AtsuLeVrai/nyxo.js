import {
  type LayoutType,
  PollEntity,
  type PollResultsEntity,
} from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { PollAnswer } from "./poll-answer.class.js";
import { PollMedia } from "./poll-media.class.js";
import { PollResults } from "./poll-results.class.js";

export class Poll {
  readonly #data: PollEntity;

  constructor(data: Partial<z.input<typeof PollEntity>> = {}) {
    try {
      this.#data = PollEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get question(): PollMedia {
    return new PollMedia(this.#data.question);
  }

  get answers(): PollAnswer[] {
    return Array.isArray(this.#data.answers)
      ? this.#data.answers.map((answer) => new PollAnswer(answer))
      : [];
  }

  get expiry(): string | null {
    return this.#data.expiry ?? null;
  }

  get allowMultiselect(): boolean {
    return Boolean(this.#data.allow_multiselect);
  }

  get layoutType(): LayoutType {
    return this.#data.layout_type;
  }

  get results(): PollResults | null {
    return this.#data.results
      ? new PollResults(this.#data.results as PollResultsEntity)
      : null;
  }

  toJson(): PollEntity {
    return { ...this.#data };
  }

  clone(): Poll {
    return new Poll(this.toJson());
  }

  validate(): boolean {
    try {
      PollSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<PollEntity>): Poll {
    return new Poll({ ...this.toJson(), ...other });
  }

  equals(other: Poll): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const PollSchema = z.instanceof(Poll);
