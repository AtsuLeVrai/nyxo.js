import { Store } from "@nyxjs/store";
import type { z } from "zod";
import { fromError } from "zod-validation-error";
import type { Client } from "../core/index.js";

type HasId = { id: string };

export abstract class BaseClass<T> {
  protected client: Client;
  protected entity: T;

  readonly #caches = new Store<string, Store<string, this>>();

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
    if (!this.#caches.has(className)) {
      this.#caches.set(className, new Store(null, this.client.options));
    }

    const cacheKey = this.getCacheKey();
    if (cacheKey) {
      const classCache = this.#caches.get(className);

      if (classCache?.has(cacheKey)) {
        this.client.emit("cacheHit", {
          key: cacheKey,
          value: this,
          className,
        });
        classCache?.add(cacheKey, this);
      } else {
        this.client.emit("cacheMiss", {
          key: cacheKey,
          value: this,
          className,
        });
        classCache?.set(cacheKey, this);
      }
    }
  }

  get cache(): Store<string, this> {
    return this.#caches.get(this.constructor.name) as Store<string, this>;
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
