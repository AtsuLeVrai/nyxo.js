import { IntegrationApplicationEntity, type Snowflake } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { User } from "./user.class.js";

export class IntegrationApplication {
  readonly #data: IntegrationApplicationEntity;

  constructor(
    data: Partial<z.input<typeof IntegrationApplicationEntity>> = {},
  ) {
    try {
      this.#data = IntegrationApplicationEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get id(): Snowflake {
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

  get bot(): User | null {
    return this.#data.bot ? new User(this.#data.bot) : null;
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
