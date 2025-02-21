import type { Snowflake } from "@nyxjs/core";
import type { Store } from "@nyxjs/store";
import type { z } from "zod";
import { fromError } from "zod-validation-error";
import type { Client } from "../core/index.js";

type HasId = { id: Snowflake };

export abstract class BaseClass<T> {
  protected client: Client;
  protected entity: T;

  protected constructor(
    client: Client,
    schema: z.ZodSchema<T>,
    entity: Partial<T> = {},
  ) {
    this.client = client;

    try {
      this.entity = schema.parse(entity);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    const className = this.constructor.name;
    const cacheKey = this.getCacheKey();

    if (cacheKey) {
      this.client.caches.set(className, cacheKey, this);
    }
  }

  get cache(): Store<string, this> {
    return this.client.caches.get(this.constructor.name);
  }

  abstract toJson(): T;

  protected getCacheKey(): string | null {
    if (this.#hasId(this.entity)) {
      return this.entity.id;
    }

    return null;
  }

  #hasId(entity: unknown): entity is T & HasId {
    // @ts-expect-error
    return "id" in entity && typeof entity.id === "string";
  }
}
