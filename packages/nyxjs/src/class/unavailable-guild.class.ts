import { UnavailableGuildEntity } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class UnavailableGuild {
  readonly #data: UnavailableGuildEntity;

  constructor(data: Partial<z.input<typeof UnavailableGuildEntity>> = {}) {
    try {
      this.#data = UnavailableGuildEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get id(): unknown {
    return this.#data.id;
  }

  get unavailable(): unknown {
    return this.#data.unavailable;
  }

  static fromJson(json: UnavailableGuildEntity): UnavailableGuild {
    return new UnavailableGuild(json);
  }

  toJson(): UnavailableGuildEntity {
    return { ...this.#data };
  }

  clone(): UnavailableGuild {
    return new UnavailableGuild(this.toJson());
  }

  validate(): boolean {
    try {
      UnavailableGuildSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<UnavailableGuildEntity>): UnavailableGuild {
    return new UnavailableGuild({ ...this.toJson(), ...other });
  }

  equals(other: UnavailableGuild): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const UnavailableGuildSchema = z.instanceof(UnavailableGuild);
