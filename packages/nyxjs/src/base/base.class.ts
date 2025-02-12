import { Store } from "@nyxjs/store";
import type { z } from "zod";
import { fromError } from "zod-validation-error";
import type { Client } from "../core/index.js";

type HasId = { id: string };

export abstract class BaseClass<T> {
  protected client: Client;
  protected data: T;

  readonly #caches = new Store<string, Store<string, this>>();

  protected constructor(
    client: Client,
    schema: z.ZodSchema<T>,
    data: Partial<T> = {},
  ) {
    this.client = client;

    try {
      this.data = schema.parse(data);
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

      this.client.emit("cacheHit", {
        key: cacheKey,
        className,
        value: this,
      });

      if (classCache?.has(cacheKey)) {
        classCache?.add(cacheKey, this);
      } else {
        classCache?.set(cacheKey, this);
      }
    }
  }

  get cache(): Store<string, this> {
    return this.#caches.get(this.constructor.name) as Store<string, this>;
  }

  abstract toJson(): T;

  protected getCacheKey(): string | null {
    if (this.hasId(this.data)) {
      return this.data.id;
    }

    return null;
  }

  private hasId(data: unknown): data is T & HasId {
    // @ts-expect-error
    return "id" in data && typeof data.id === "string";
  }
}
