import { ReactionEntity } from "@nyxjs/core";
import { z } from "zod";

export class Reaction {
  readonly #data: ReactionEntity;

  constructor(data: ReactionEntity) {
    this.#data = ReactionEntity.parse(data);
  }

  get count(): number {
    return this.#data.count;
  }

  get countDetails(): object {
    return this.#data.count_details ? { ...this.#data.count_details } : null;
  }

  get me(): boolean {
    return Boolean(this.#data.me);
  }

  get meBurst(): boolean {
    return Boolean(this.#data.me_burst);
  }

  get emoji(): object {
    return this.#data.emoji ? { ...this.#data.emoji } : null;
  }

  get burstColors(): unknown {
    return this.#data.burst_colors;
  }

  toJson(): ReactionEntity {
    return { ...this.#data };
  }

  clone(): Reaction {
    return new Reaction(this.toJson());
  }

  validate(): boolean {
    try {
      ReactionSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  static fromJson(json: ReactionEntity): Reaction {
    return new Reaction(json);
  }

  merge(other: Partial<ReactionEntity>): Reaction {
    return new Reaction({ ...this.toJson(), ...other });
  }

  equals(other: Reaction): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const ReactionSchema = z.instanceof(Reaction);
