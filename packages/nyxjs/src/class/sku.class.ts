import {
  BitFieldManager,
  SkuEntity,
  type SkuFlags,
  type SkuType,
  type Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class Sku {
  readonly #data: SkuEntity;
  readonly #flags: BitFieldManager<SkuFlags>;

  constructor(data: Partial<z.input<typeof SkuEntity>> = {}) {
    try {
      this.#data = SkuEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.#flags = new BitFieldManager(this.#data.flags);
  }

  get id(): Snowflake {
    return this.#data.id;
  }

  get type(): SkuType {
    return this.#data.type;
  }

  get applicationId(): Snowflake {
    return this.#data.application_id;
  }

  get name(): string {
    return this.#data.name;
  }

  get slug(): string {
    return this.#data.slug;
  }

  get flags(): BitFieldManager<SkuFlags> {
    return this.#flags;
  }

  toJson(): SkuEntity {
    return { ...this.#data };
  }

  clone(): Sku {
    return new Sku(this.toJson());
  }

  validate(): boolean {
    try {
      SkuSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<SkuEntity>): Sku {
    return new Sku({ ...this.toJson(), ...other });
  }

  equals(other: Sku): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const SkuSchema = z.instanceof(Sku);
