import { ReactionCountDetailsEntity } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class ReactionCountDetails {
  readonly #data: ReactionCountDetailsEntity;

  constructor(data: Partial<z.input<typeof ReactionCountDetailsEntity>> = {}) {
    try {
      this.#data = ReactionCountDetailsEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get burst(): number {
    return this.#data.burst;
  }

  get normal(): number {
    return this.#data.normal;
  }

  toJson(): ReactionCountDetailsEntity {
    return { ...this.#data };
  }

  clone(): ReactionCountDetails {
    return new ReactionCountDetails(this.toJson());
  }

  validate(): boolean {
    try {
      ReactionCountDetailsSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<ReactionCountDetailsEntity>): ReactionCountDetails {
    return new ReactionCountDetails({ ...this.toJson(), ...other });
  }

  equals(other: ReactionCountDetails): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const ReactionCountDetailsSchema = z.instanceof(ReactionCountDetails);
