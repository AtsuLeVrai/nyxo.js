import { PollAnswerCountEntity } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class PollAnswerCount {
  readonly #data: PollAnswerCountEntity;

  constructor(data: Partial<z.input<typeof PollAnswerCountEntity>> = {}) {
    try {
      this.#data = PollAnswerCountEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get id(): number {
    return this.#data.id;
  }

  get count(): number {
    return this.#data.count;
  }

  get meVoted(): boolean {
    return Boolean(this.#data.me_voted);
  }

  toJson(): PollAnswerCountEntity {
    return { ...this.#data };
  }

  clone(): PollAnswerCount {
    return new PollAnswerCount(this.toJson());
  }

  validate(): boolean {
    try {
      PollAnswerCountSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<PollAnswerCountEntity>): PollAnswerCount {
    return new PollAnswerCount({ ...this.toJson(), ...other });
  }

  equals(other: PollAnswerCount): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const PollAnswerCountSchema = z.instanceof(PollAnswerCount);
