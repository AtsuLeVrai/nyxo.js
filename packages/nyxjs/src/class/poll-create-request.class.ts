import { PollCreateRequestEntity } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class PollCreateRequest {
  readonly #data: PollCreateRequestEntity;

  constructor(data: Partial<z.input<typeof PollCreateRequestEntity>> = {}) {
    try {
      this.#data = PollCreateRequestEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get question(): unknown {
    return this.#data.question;
  }

  get answers(): object[] {
    return Array.isArray(this.#data.answers) ? [...this.#data.answers] : [];
  }

  get duration(): unknown {
    return this.#data.duration;
  }

  get allowMultiselect(): unknown {
    return this.#data.allow_multiselect;
  }

  get layoutType(): unknown {
    return this.#data.layout_type;
  }

  static fromJson(json: PollCreateRequestEntity): PollCreateRequest {
    return new PollCreateRequest(json);
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
