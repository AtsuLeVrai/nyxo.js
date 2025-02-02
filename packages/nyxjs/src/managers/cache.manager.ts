import { Store } from "@nyxjs/store";
import { z } from "zod";
import { fromError } from "zod-validation-error";

interface CacheEntry<T> {
  data: T;
  expiresAt?: number;
  createdAt: number;
}

export const CacheOptions = z
  .object({
    expiresIn: z.number().default(5 * 60 * 1000),
    maxSize: z.number().default(1000),
  })
  .strict();

export type CacheOptions = z.infer<typeof CacheOptions>;

export class CacheManager<K extends string | number | symbol, V> {
  #store = new Store<K, CacheEntry<V>>();
  #options: CacheOptions;

  constructor(options: z.input<typeof CacheOptions> = {}) {
    try {
      this.#options = CacheOptions.parse(options);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  add(key: K, value: V | Partial<V>): boolean {
    try {
      if (
        this.#options.maxSize &&
        this.#store.size >= this.#options.maxSize &&
        !this.has(key)
      ) {
        const oldestKey = this.#getOldestKey();
        if (oldestKey) {
          this.#store.delete(oldestKey);
        }
      }

      this.#store.add(key, {
        data: value as V,
        expiresAt: this.#options.expiresIn
          ? Date.now() + this.#options.expiresIn
          : undefined,
        createdAt: Date.now(),
      });

      return true;
    } catch (_error) {
      return false;
    }
  }

  set(key: K, value: V): void {
    if (this.#options.maxSize && this.#store.size >= this.#options.maxSize) {
      const oldestKey = this.#getOldestKey();
      if (oldestKey) {
        this.#store.delete(oldestKey);
      }
    }

    this.#store.set(key, {
      data: value,
      expiresAt: this.#options.expiresIn
        ? Date.now() + this.#options.expiresIn
        : undefined,
      createdAt: Date.now(),
    });
  }

  get(key: K): V | undefined {
    const entry = this.#store.get(key);
    if (!entry) {
      return undefined;
    }

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.#store.delete(key);
      return undefined;
    }

    return entry.data;
  }

  has(key: K): boolean {
    const entry = this.#store.get(key);
    if (!entry) {
      return false;
    }
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.#store.delete(key);
      return false;
    }
    return true;
  }

  delete(key: K): boolean {
    return this.#store.delete(key);
  }

  clear(): void {
    this.#store.clear();
  }

  #getOldestKey(): K | undefined {
    return this.#store.entries().next().value?.[0];
  }
}
