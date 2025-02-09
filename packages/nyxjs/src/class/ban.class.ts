import { BanEntity } from "@nyxjs/core";
import { z } from "zod";

export class Ban {
  readonly #data: BanEntity;

  constructor(data: BanEntity) {
    this.#data = BanEntity.parse(data);
  }

  get reason(): string | null {
    return this.#data.reason ?? null;
  }

  get user(): unknown {
    return this.#data.user;
  }

  static fromJson(json: BanEntity): Ban {
    return new Ban(json);
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
