import { type LayoutType, PollCreateRequestEntity } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { PollAnswer } from "./poll-answer.class.js";
import { PollMedia } from "./poll-media.class.js";

export class PollCreateRequest {
  readonly #data: PollCreateRequestEntity;

  constructor(data: Partial<z.input<typeof PollCreateRequestEntity>> = {}) {
    try {
      this.#data = PollCreateRequestEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get question(): PollMedia | null {
    return this.#data.question ? new PollMedia(this.#data.question) : null;
  }

  get answers(): PollAnswer[] {
    return Array.isArray(this.#data.answers)
      ? this.#data.answers.map((answer) => new PollAnswer(answer))
      : [];
  }

  get duration(): number {
    return this.#data.duration;
  }

  get allowMultiselect(): boolean {
    return Boolean(this.#data.allow_multiselect);
  }

  get layoutType(): LayoutType {
    return this.#data.layout_type;
  }

  toJson(): PollCreateRequestEntity {
    return { ...this.#data };
  }

  clone(): PollCreateRequest {
    return new PollCreateRequest(this.toJson());
  }

  validate(): boolean {
    try {
      PollCreateRequestSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<PollCreateRequestEntity>): PollCreateRequest {
    return new PollCreateRequest({ ...this.toJson(), ...other });
  }

  equals(other: PollCreateRequest): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const PollCreateRequestSchema = z.instanceof(PollCreateRequest);
