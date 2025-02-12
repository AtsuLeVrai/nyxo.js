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

  constructor(client: Client, entity: Partial<z.input<typeof SkuEntity>> = {}) {
    super(client, SkuEntity, entity);
    this.#flags = new BitFieldManager(this.entity.flags);
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get type(): SkuType {
    return this.entity.type;
  }

  get applicationId(): Snowflake {
    return this.entity.application_id;
  }

  get name(): string {
    return this.entity.name;
  }

  get slug(): string {
    return this.entity.slug;
  }

  get flags(): BitFieldManager<SkuFlags> {
    return this.#flags;
  }

  toJson(): SkuEntity {
    return { ...this.entity };
  }
}

export const SkuSchema = z.instanceof(Sku);
