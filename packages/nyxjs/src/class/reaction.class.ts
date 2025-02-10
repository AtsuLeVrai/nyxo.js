import { ReactionEntity } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { Emoji } from "./emoji.class.js";
import { ReactionCountDetails } from "./reaction-count-details.class.js";

export class Reaction {
  readonly #data: ReactionEntity;

  constructor(data: Partial<z.input<typeof ReactionEntity>> = {}) {
    try {
      this.#data = ReactionEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get count(): number {
    return this.#data.count;
  }

  get countDetails(): ReactionCountDetails | null {
    return this.#data.count_details
      ? new ReactionCountDetails(this.#data.count_details)
      : null;
  }

  get me(): boolean {
    return Boolean(this.#data.me);
  }

  get meBurst(): boolean {
    return Boolean(this.#data.me_burst);
  }

  get emoji(): Emoji | null {
    return this.#data.emoji ? new Emoji(this.#data.emoji) : null;
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

  merge(other: Partial<ReactionEntity>): Reaction {
    return new Reaction({ ...this.toJson(), ...other });
  }

  equals(other: Reaction): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const ReactionSchema = z.instanceof(Reaction);
