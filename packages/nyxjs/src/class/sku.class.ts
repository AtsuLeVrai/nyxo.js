import {
  BitFieldManager,
  SkuEntity,
  type SkuFlags,
  type SkuType,
  type Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class Sku extends BaseClass<SkuEntity> {
  readonly #flags: BitFieldManager<SkuFlags>;

  constructor(client: Client, data: Partial<z.input<typeof SkuEntity>> = {}) {
    super(client, SkuEntity, data);
    this.#flags = new BitFieldManager(this.data.flags);
  }

  get id(): Snowflake {
    return this.data.id;
  }

  get type(): SkuType {
    return this.data.type;
  }

  get applicationId(): Snowflake {
    return this.data.application_id;
  }

  get name(): string {
    return this.data.name;
  }

  get slug(): string {
    return this.data.slug;
  }

  get flags(): BitFieldManager<SkuFlags> {
    return this.#flags;
  }

  toJson(): SkuEntity {
    return { ...this.data };
  }
}

export const SkuSchema = z.instanceof(Sku);
