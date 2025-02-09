import { IntegrationApplicationEntity } from "@nyxjs/core";
import { z } from "zod";

export class IntegrationApplication {
  readonly #data: IntegrationApplicationEntity;

  constructor(data: IntegrationApplicationEntity) {
    this.#data = IntegrationApplicationEntity.parse(data);
  }

  get id(): unknown {
    return this.#data.id;
  }

  get name(): string {
    return this.#data.name;
  }

  get icon(): string | null {
    return this.#data.icon ?? null;
  }

  get description(): string {
    return this.#data.description;
  }

  get bot(): unknown | null {
    return this.#data.bot ?? null;
  }

  static fromJson(json: IntegrationApplicationEntity): IntegrationApplication {
    return new IntegrationApplication(json);
  }

  toJson(): IntegrationApplicationEntity {
    return { ...this.#data };
  }

  clone(): IntegrationApplication {
    return new IntegrationApplication(this.toJson());
  }

  validate(): boolean {
    try {
      IntegrationApplicationSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<IntegrationApplicationEntity>): IntegrationApplication {
    return new IntegrationApplication({ ...this.toJson(), ...other });
  }

  equals(other: IntegrationApplication): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const IntegrationApplicationSchema = z.instanceof(
  IntegrationApplication,
);
