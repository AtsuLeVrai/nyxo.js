import { ReactionCountDetailsEntity } from "@nyxjs/core";
import { z } from "zod";

export class ReactionCountDetails {
  readonly #data: ReactionCountDetailsEntity;

  constructor(data: ReactionCountDetailsEntity) {
    this.#data = ReactionCountDetailsEntity.parse(data);
  }

  get burst(): number {
    return this.#data.burst;
  }

  get normal(): number {
    return this.#data.normal;
  }

  static fromJson(json: ReactionCountDetailsEntity): ReactionCountDetails {
    return new ReactionCountDetails(json);
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
