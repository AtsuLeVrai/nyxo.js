import { PollEntity } from "@nyxjs/core";
import { z } from "zod";

export class Poll {
  readonly #data: PollEntity;

  constructor(data: PollEntity) {
    this.#data = PollEntity.parse(data);
  }

  get question(): unknown {
    return this.#data.question;
  }

  get answers(): object[] {
    return Array.isArray(this.#data.answers) ? [...this.#data.answers] : [];
  }

  get expiry(): string | null {
    return this.#data.expiry ?? null;
  }

  get allowMultiselect(): boolean {
    return Boolean(this.#data.allow_multiselect);
  }

  get layoutType(): unknown {
    return this.#data.layout_type;
  }

  get results(): object | null {
    return this.#data.results ?? null;
  }

  static fromJson(json: PollEntity): Poll {
    return new Poll(json);
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
