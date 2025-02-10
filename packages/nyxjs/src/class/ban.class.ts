import { BanEntity } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { User } from "./user.class.js";

export class Ban {
  readonly #data: BanEntity;

  constructor(data: Partial<z.input<typeof BanEntity>> = {}) {
    try {
      this.#data = BanEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get reason(): string | null {
    return this.#data.reason ?? null;
  }

  get user(): User {
    return new User(this.#data.user);
  }

  toJson(): BanEntity {
    return { ...this.#data };
  }

  clone(): Ban {
    return new Ban(this.toJson());
  }

  validate(): boolean {
    try {
      BanSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<BanEntity>): Ban {
    return new Ban({ ...this.toJson(), ...other });
  }

  equals(other: Ban): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const BanSchema = z.instanceof(Ban);
