import { PollCreateRequestEntity } from "@nyxjs/core";
import { z } from "zod";

export class PollCreateRequest {
  readonly #data: PollCreateRequestEntity;

  constructor(data: PollCreateRequestEntity) {
    this.#data = PollCreateRequestEntity.parse(data);
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
