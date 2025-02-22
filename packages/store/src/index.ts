import { deepmerge } from "deepmerge-ts";
import { get, unset } from "lodash-es";
import { LRUCache } from "lru-cache";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export type StorePredicate<K extends string | number | symbol, V> =
  | ((value: V, key: K, map: Store<K, V>) => boolean)
  | Partial<V>;

export const StoreOptions = z
  .object({
    maxSize: z.number().int().min(0).default(10000),
    ttl: z.number().int().min(0).default(0),
    evictionStrategy: z.enum(["fifo", "lru"]).default("lru"),
  })
  .readonly();

export type StoreOptions = z.infer<typeof StoreOptions>;

export class Store<K extends string | number | symbol, V> extends Map<K, V> {
  readonly #ttlMap = new Map<K, number>();
  readonly #lruCache: LRUCache<K, number> | null = null;

  readonly #options: Required<StoreOptions>;

  constructor(
    entries?: readonly (readonly [K, V])[] | null,
    options: z.input<typeof StoreOptions> = {},
  ) {
    super();

    try {
      this.#options = StoreOptions.parse(options);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    if (this.#options.evictionStrategy === "lru") {
      this.#lruCache = new LRUCache<K, number>({
        max: this.#options.maxSize,
      });
    }

    if (entries) {
      this.#bulkSet(entries);
    }

    if (this.#options.ttl > 0) {
      this.#startCleanupInterval();
    }
  }

  add(key: K, value: V | Partial<V>): this {
    if (this.has(key)) {
      const existingValue = this.get(key) as V;
      if (typeof existingValue === "object" && typeof value === "object") {
        this.set(key, deepmerge(existingValue, value) as V);
      } else {
        this.set(key, value as V);
      }
    } else {
      this.set(key, value as V);
    }
    return this;
  }

  remove(key: K, paths: (keyof V | string)[] | string | keyof V): this {
    if (!this.has(key)) {
      return this;
    }

    const value = this.get(key) as V;
    if (typeof value !== "object" || value === null) {
      return this;
    }

    const pathsArray = Array.isArray(paths) ? paths : [paths];
    const newValue = { ...value };

    for (const path of pathsArray) {
      unset(newValue, path);
    }

    this.set(key, newValue as V);
    return this;
  }

  find(predicate: StorePredicate<K, V>): V | undefined {
    if (typeof predicate === "function") {
      for (const [key, value] of this) {
        if (predicate(value, key, this)) {
          this.#updateAccessTime(key);
          return value;
        }
      }
      return undefined;
    }

    const entries = Object.entries(predicate);
    for (const [key, value] of this) {
      if (this.#matchesPattern(value, entries)) {
        this.#updateAccessTime(key);
        return value;
      }
    }
    return undefined;
  }

  filter(predicate: StorePredicate<K, V>): Store<K, V> {
    const newStore = new Store<K, V>(null, this.#options);

    if (typeof predicate === "function") {
      for (const [key, value] of this) {
        if (predicate(value, key, this)) {
          newStore.set(key, value);
        }
      }
      return newStore;
    }

    const entries = Object.entries(predicate);
    for (const [key, value] of this) {
      if (this.#matchesPattern(value, entries)) {
        newStore.set(key, value);
      }
    }
    return newStore;
  }

  override get(key: K): V | undefined {
    const value = super.get(key);
    if (value !== undefined) {
      if (this.isExpired(key)) {
        this.delete(key);
        return undefined;
      }
      this.#updateAccessTime(key);
    }
    return value;
  }

  setWithTtl(key: K, value: V, ttl: number): this {
    const expiryTime = Date.now() + ttl;
    this.#ttlMap.set(key, expiryTime);
    return this.set(key, value);
  }

  isExpired(key: K): boolean {
    const expiry = this.#ttlMap.get(key);
    return expiry !== undefined && Date.now() >= expiry;
  }

  override set(key: K, value: V): this {
    this.#evict();
    super.set(key, value);
    this.#updateAccessTime(key);
    return this;
  }

  override delete(key: K): boolean {
    this.#ttlMap.delete(key);
    this.#lruCache?.delete(key);
    return super.delete(key);
  }

  override clear(): void {
    super.clear();
    this.#ttlMap.clear();
    this.#lruCache?.clear();
  }

  map<R>(callback: (value: V, key: K, store: this) => R): R[] {
    return Array.from(this, ([key, value]) => callback(value, key, this));
  }

  sort(compareFn?: (a: V, b: V) => number): Store<K, V> {
    const sorted = [...this.entries()].sort(
      ([, a], [, b]) => compareFn?.(a, b) ?? String(a).localeCompare(String(b)),
    );
    return new Store(sorted, this.#options);
  }

  slice(page = 0, pageSize = 10): V[] {
    return [...this.values()].slice(page * pageSize, (page + 1) * pageSize);
  }

  #bulkSet(entries: readonly (readonly [K, V])[]): void {
    for (const [key, value] of entries) {
      this.set(key, value);
    }
  }

  #startCleanupInterval(): void {
    const cleanupInterval = Math.min(this.#options.ttl / 2, 60000);
    setInterval(() => this.#cleanup(), cleanupInterval);
  }

  #cleanup(): void {
    const now = Date.now();
    for (const [key, expiry] of this.#ttlMap) {
      if (now >= expiry) {
        this.delete(key);
      }
    }
  }

  #updateAccessTime(key: K): void {
    if (this.#options.evictionStrategy === "lru") {
      this.#lruCache?.set(key, Date.now());
    }
  }

  #evict(): void {
    if (!this.#options.maxSize || this.size < this.#options.maxSize) {
      return;
    }

    if (this.#options.evictionStrategy === "lru" && this.#lruCache) {
      const leastUsedKey = this.#lruCache.keys().next().value;
      if (leastUsedKey) {
        this.delete(leastUsedKey);
      }
    } else {
      const firstKey = this.keys().next().value;
      if (firstKey) {
        this.delete(firstKey);
      }
    }
  }

  #matchesPattern(value: V, pattern: [string, unknown][]): boolean {
    return pattern.every(([path, expectedValue]) => {
      const actualValue = get(value, path);
      return Array.isArray(actualValue)
        ? actualValue.includes(expectedValue)
        : actualValue === expectedValue;
    });
  }
}
