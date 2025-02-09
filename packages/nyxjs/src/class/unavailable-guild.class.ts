import { UnavailableGuildEntity } from "@nyxjs/core";
import { z } from "zod";

export class UnavailableGuild {
  readonly #data: UnavailableGuildEntity;

  constructor(data: UnavailableGuildEntity) {
    this.#data = UnavailableGuildEntity.parse(data);
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
