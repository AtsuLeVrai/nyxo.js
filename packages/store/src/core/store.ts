import { deepmerge } from "deepmerge-ts";
import { cloneDeep, unset } from "lodash-es";
import { z } from "zod";
import { LruTracker } from "../utils/index.js";

/**
 * Predicate function for finding or filtering store items.
 * Receives both value and key for flexible filtering criteria.
 *
 * @typeParam K - Key type in the store
 * @typeParam V - Value type in the store
 *
 * @param value - Stored value to evaluate
 * @param key - Associated key
 * @returns True if item matches criteria
 *
 * @example
 * ```typescript
 * const userPredicate: StorePredicate<string, User> = (user) => user.age >= 18;
 * const keyPredicate: StorePredicate<string, any> = (_, key) => key.startsWith('cache:');
 * ```
 *
 * @public
 */
export type StorePredicate<K extends PropertyKey, V> = (
  value: V,
  key: K,
) => boolean;

/**
 * Configuration options for Store initialization.
 * Controls memory management, caching strategies, and performance tuning.
 *
 * @public
 */
export const StoreOptions = z.object({
  /**
   * Maximum items before triggering eviction.
   * Setting to 0 disables size-based eviction.
   *
   * @default 10000
   */
  maxSize: z.number().int().nonnegative().default(10000),

  /**
   * Time-to-live duration in milliseconds.
   * Setting to 0 disables automatic expiration.
   *
   * @default 0
   */
  ttl: z.number().int().nonnegative().default(0),

  /**
   * Algorithm for item eviction when maxSize reached.
   * LRU evicts least recently used, FIFO evicts oldest first.
   *
   * @default "lru"
   */
  evictionStrategy: z.enum(["fifo", "lru"]).default("lru"),

  /**
   * Interval between automatic expired item sweeps.
   * Lower values provide faster cleanup but higher overhead.
   *
   * @default 15000
   */
  sweepInterval: z.number().int().positive().default(15000),

  /**
   * Items processed per sweep operation chunk.
   * Smaller chunks are more responsive, larger more efficient.
   *
   * @default 100
   */
  sweepChunkSize: z.number().int().positive().default(100),
});

export type StoreOptions = z.infer<typeof StoreOptions>;

/**
 * High-performance Map with advanced caching capabilities.
 * Provides automatic expiration, intelligent eviction, and object manipulation.
 *
 * @typeParam K - Key type, must extend PropertyKey
 * @typeParam V - Value type
 *
 * @example
 * ```typescript
 * const cache = new Store<string, User>({
 *   maxSize: 1000,
 *   ttl: 5 * 60 * 1000,
 *   evictionStrategy: "lru"
 * });
 *
 * cache.set("user:123", { id: 123, name: "John" });
 * const user = cache.get("user:123");
 * ```
 *
 * @public
 */
export class Store<K extends PropertyKey, V> extends Map<K, V> {
  /**
   * LRU access tracker for intelligent eviction.
   * @internal
   */
  #lruTracker: LruTracker<K> | null = null;

  /**
   * Timer handle for next scheduled sweep operation.
   * @internal
   */
  #sweepTimeout: NodeJS.Timeout | null = null;

  /**
   * Store destruction status.
   * @internal
   */
  #isDestroyed = false;

  /**
   * Map tracking expiration timestamps for TTL items.
   * @internal
   */
  readonly #ttlMap = new Map<K, number>();

  /**
   * Immutable configuration options for this instance.
   * @internal
   */
  readonly #options: StoreOptions;

  /**
   * Creates a new Store with comprehensive configuration options.
   *
   * @param options - Configuration controlling store behavior
   *
   * @throws {Error} When configuration validation fails
   *
   * @example
   * ```typescript
   * const cache = new Store<string, any>();
   * const webCache = new Store<string, APIResponse>({
   *   maxSize: 5000,
   *   ttl: 10 * 60 * 1000
   * });
   * ```
   *
   * @public
   */
  constructor(options: z.input<typeof StoreOptions> = {}) {
    super();

    try {
      this.#options = StoreOptions.parse(options);
    } catch (error) {
      this.destroy();

      if (error instanceof z.ZodError) {
        throw new Error(z.prettifyError(error));
      }

      throw new Error(`Store configuration validation failed: ${error}`);
    }

    if (this.#options.evictionStrategy === "lru" && this.#options.maxSize > 0) {
      this.#lruTracker = new LruTracker<K>(this.#options.maxSize);
    }

    if (this.#options.ttl > 0) {
      this.#scheduleSweep();
    }
  }

  /**
   * Populates store with multiple key-value pairs efficiently.
   * Processes entries through standard validation and policies.
   *
   * @param entries - Array of [key, value] tuples
   * @returns Store instance for method chaining
   *
   * @throws {Error} When input format is invalid
   *
   * @example
   * ```typescript
   * const usersFromDB = [
   *   ["user:1", { id: 1, name: "Alice" }],
   *   ["user:2", { id: 2, name: "Bob" }]
   * ];
   * userStore.populate(usersFromDB);
   * ```
   *
   * @see {@link set} - For adding individual entries
   *
   * @public
   */
  populate(entries: (readonly [K, V])[]): this {
    if (!Array.isArray(entries)) {
      throw new Error("Entries must be an array of [key, value] tuples");
    }

    if (entries.length === 0) {
      return this;
    }

    for (const entry of entries) {
      if (!Array.isArray(entry) || entry.length !== 2) {
        throw new Error(
          `Invalid entry format: expected [key, value] tuple, got ${JSON.stringify(entry)}`,
        );
      }

      const [key, value] = entry;
      this.set(key, value);
    }

    return this;
  }

  /**
   * Adds or updates value with intelligent merging.
   * Objects are deep merged, primitives are replaced.
   *
   * @param key - Key to add or update
   * @param value - Value to add or merge
   * @returns Store instance for method chaining
   *
   * @example
   * ```typescript
   * store.set("user:123", { name: "John", age: 30 });
   * store.add("user:123", { age: 31, city: "NYC" });
   * // Result: { name: "John", age: 31, city: "NYC" }
   * ```
   *
   * @see {@link set} - For direct value replacement
   *
   * @public
   */
  add(key: K, value: V | Partial<V>): this {
    if (!this.has(key)) {
      return this.set(key, value as V);
    }

    const existingValue = this.get(key) as V;

    if (
      typeof existingValue !== "object" ||
      existingValue === null ||
      typeof value !== "object" ||
      value === null
    ) {
      return this.set(key, value as V);
    }

    const hasNestedObjects = Object.values(value).some(
      (v) => typeof v === "object" && v !== null,
    );

    if (!hasNestedObjects) {
      const merged = { ...existingValue, ...value } as V;
      return this.set(key, merged);
    }

    const mergedValue = deepmerge(existingValue, value) as V;
    return this.set(key, mergedValue);
  }

  /**
   * Removes specific properties from stored object.
   * Supports dot notation for nested paths and creates deep copy.
   *
   * @param key - Key of item to modify
   * @param paths - Property paths to remove
   * @returns Store instance for method chaining
   *
   * @throws {Error} When key doesn't exist or value isn't an object
   *
   * @example
   * ```typescript
   * store.set("user", { name: "John", profile: { age: 30, city: "NYC" } });
   * store.remove("user", "profile.age");
   * store.remove("user", ["name", "profile.city"]);
   * ```
   *
   * @see {@link add} - For adding object properties
   *
   * @public
   */
  remove(key: K, paths: (string | keyof V)[] | string | keyof V): this {
    if (!this.has(key)) {
      throw new Error(`Key not found: ${String(key)}`);
    }

    const value = this.get(key);
    if (typeof value !== "object" || value === null) {
      throw new Error(
        `Cannot remove properties from non-object value at key: ${String(key)}`,
      );
    }

    const newValue = cloneDeep(value);
    const pathsArray = Array.isArray(paths) ? paths : [paths];

    for (const path of pathsArray) {
      unset(newValue, path as string);
    }

    this.set(key, newValue as V);
    return this;
  }

  /**
   * Finds first value matching the predicate function.
   *
   * @param predicate - Function testing each value-key pair
   * @returns First matching value or undefined
   *
   * @example
   * ```typescript
   * const alice = userStore.find((user) => user.name === "Alice");
   * const firstUser = userStore.find((_, key) => key.startsWith("user:"));
   * ```
   *
   * @see {@link filter} - For finding all matching items
   *
   * @public
   */
  find(predicate: StorePredicate<K, V>): V | undefined {
    for (const [key, value] of this) {
      if (predicate(value, key)) {
        this.#updateAccessTime(key);
        return value;
      }
    }

    return undefined;
  }

  /**
   * Returns array of all values matching the predicate function.
   *
   * @param predicate - Function testing each value-key pair
   * @returns Array of matching values
   *
   * @example
   * ```typescript
   * const engineers = userStore.filter((user) => user.department === "Engineering");
   * const activeUsers = userStore.filter((user) => user.active && user.age >= 30);
   * ```
   *
   * @see {@link find} - For finding only first matching item
   *
   * @public
   */
  filter(predicate: StorePredicate<K, V>): V[] {
    const results: V[] = [];

    for (const [key, value] of this) {
      if (predicate(value, key)) {
        this.#updateAccessTime(key);
        results.push(value);
      }
    }

    return results;
  }

  /**
   * Sets value with custom TTL duration.
   *
   * @param key - Key to set
   * @param value - Value to store
   * @param ttl - Time to live in milliseconds
   * @returns Store instance for method chaining
   *
   * @throws {Error} When TTL is negative
   *
   * @example
   * ```typescript
   * sessionStore.setWithTtl("session:vip",
   *   { userId: 456, role: "admin" },
   *   2 * 60 * 60 * 1000
   * );
   * ```
   *
   * @see {@link set} - For setting with default TTL
   *
   * @public
   */
  setWithTtl(key: K, value: V, ttl: number): this {
    if (ttl < 0) {
      throw new Error(`TTL cannot be negative: ${ttl}`);
    }

    const expiryTime = Date.now() + ttl;
    this.#ttlMap.set(key, expiryTime);

    return this.set(key, value);
  }

  /**
   * Checks whether item has exceeded its TTL.
   *
   * @param key - Key to check for expiration
   * @returns True if expired, false if still valid
   *
   * @example
   * ```typescript
   * if (!cache.isExpired("api:users")) {
   *   const cachedUsers = cache.get("api:users");
   *   return cachedUsers;
   * }
   * ```
   *
   * @see {@link setWithTtl} - For setting custom TTL values
   *
   * @public
   */
  isExpired(key: K): boolean {
    const expiry = this.#ttlMap.get(key);

    if (expiry === undefined) {
      if (this.#options.ttl > 0 && super.has(key) && !this.#ttlMap.has(key)) {
        this.#ttlMap.set(key, Date.now() + this.#options.ttl);
        return false;
      }

      return false;
    }

    return Date.now() >= expiry;
  }

  /**
   * Destroys store and cleans up all resources.
   *
   * @example
   * ```typescript
   * try {
   *   // Use the cache...
   * } finally {
   *   cache.destroy();
   * }
   * ```
   *
   * @see {@link clear} - For removing data while keeping store functional
   *
   * @public
   */
  destroy(): void {
    this.#isDestroyed = true;

    if (this.#sweepTimeout) {
      clearTimeout(this.#sweepTimeout);
      this.#sweepTimeout = null;
    }

    if (this.#lruTracker) {
      this.#lruTracker.clear();
      this.#lruTracker = null;
    }

    if (this.#ttlMap) {
      this.#ttlMap.clear();
    }

    super.clear();
  }

  /**
   * Retrieves value with automatic expiration handling.
   *
   * @param key - Key to lookup
   * @returns Value or undefined if not found or expired
   *
   * @example
   * ```typescript
   * const user = cache.get("user:123");
   * if (user) {
   *   console.log(`Found user: ${user.name}`);
   * }
   * ```
   *
   * @see {@link set} - For storing values
   *
   * @public
   */
  override get(key: K): V | undefined {
    if (Math.random() < 0.01) {
      this.#sweep();
    }

    if (this.isExpired(key)) {
      this.delete(key);
      return undefined;
    }

    const value = super.get(key);

    if (value !== undefined) {
      this.#updateAccessTime(key);
      return value;
    }

    return undefined;
  }

  /**
   * Checks if key exists and is not expired.
   *
   * @param key - Key to check for existence
   * @returns True if exists and not expired
   *
   * @example
   * ```typescript
   * if (cache.has("session:abc123")) {
   *   console.log("Session is active");
   * }
   * ```
   *
   * @see {@link get} - For retrieving values with LRU tracking
   *
   * @public
   */
  override has(key: K): boolean {
    if (this.isExpired(key)) {
      this.delete(key);
      return false;
    }

    return super.has(key);
  }

  /**
   * Sets value with comprehensive automatic management.
   *
   * @param key - Key to set
   * @param value - Value to store
   * @returns Store instance for method chaining
   *
   * @example
   * ```typescript
   * cache.set("product:123", { id: 123, name: "Laptop", price: 999 });
   *
   * cache
   *   .set("product:124", { id: 124, name: "Mouse" })
   *   .set("product:125", { id: 125, name: "Keyboard" });
   * ```
   *
   * @see {@link setWithTtl} - For custom TTL values
   *
   * @public
   */
  override set(key: K, value: V): this {
    if (
      this.#options.maxSize > 0 &&
      this.size >= this.#options.maxSize &&
      !this.has(key)
    ) {
      this.#evict();
    }

    if (this.#options.ttl > 0 && !this.#ttlMap.has(key)) {
      this.#ttlMap.set(key, Date.now() + this.#options.ttl);
    }

    super.set(key, value);
    this.#updateAccessTime(key);

    if (this.#options.ttl > 0 && !this.#sweepTimeout && !this.#isDestroyed) {
      this.#scheduleSweep();
    }

    return this;
  }

  /**
   * Removes item and cleans up all metadata.
   *
   * @param key - Key to delete
   * @returns True if element was removed
   *
   * @example
   * ```typescript
   * const deleted = cache.delete("user:123");
   * console.log(deleted); // true or false
   * ```
   *
   * @see {@link clear} - For removing all items
   *
   * @public
   */
  override delete(key: K): boolean {
    const existed = super.has(key);
    if (!existed) {
      return false;
    }

    const result = super.delete(key);

    if (this.#ttlMap.size > 0) {
      this.#ttlMap.delete(key);
    }

    if (this.#lruTracker) {
      this.#lruTracker.delete(key);
    }

    return result;
  }

  /**
   * Removes all items and clears metadata.
   *
   * @example
   * ```typescript
   * cache.clear();
   * console.log(cache.size); // 0
   * cache.set("new:data", { fresh: true });
   * ```
   *
   * @see {@link delete} - For removing individual items
   *
   * @public
   */
  override clear(): void {
    super.clear();

    if (this.#ttlMap) {
      this.#ttlMap.clear();
    }

    if (this.#lruTracker) {
      this.#lruTracker.clear();
    }
  }

  /**
   * Enables iteration over non-expired entries.
   *
   * @returns Iterator yielding [key, value] pairs
   *
   * @example
   * ```typescript
   * for (const [key, user] of cache) {
   *   console.log(`${key}: ${user.name}`);
   * }
   * const allUsers = [...cache];
   * ```
   *
   * @see {@link keys} - For keys only
   *
   * @public
   */
  override *[Symbol.iterator](): MapIterator<[K, V]> {
    for (const [key, value] of super[Symbol.iterator]()) {
      if (!this.isExpired(key)) {
        yield [key, value];
      } else {
        this.delete(key);
      }
    }
  }

  /**
   * Symbol.dispose for automatic resource management.
   *
   * @example
   * ```typescript
   * {
   *   using cache = new Store<string, Data>({ maxSize: 100 });
   *   // Cache automatically destroyed when leaving scope
   * }
   * ```
   *
   * @see {@link destroy} - For manual cleanup
   *
   * @public
   */
  [Symbol.dispose](): void {
    this.destroy();
  }

  /**
   * Enables asynchronous iteration with non-blocking behavior.
   *
   * @returns Async iterator yielding [key, value] pairs
   *
   * @example
   * ```typescript
   * for await (const [id, document] of cache) {
   *   await processDocument(document);
   * }
   * ```
   *
   * @see {@link Symbol.iterator} - For synchronous iteration
   *
   * @public
   */
  async *[Symbol.asyncIterator](): AsyncIterableIterator<[K, V]> {
    for (const [key, value] of this) {
      yield [key, value];

      if (Math.random() < 0.01) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }
  }

  /**
   * Schedules next background sweep operation.
   * @internal
   */
  #scheduleSweep(): void {
    if (this.#isDestroyed || this.#sweepTimeout) {
      return;
    }

    this.#sweepTimeout = setTimeout(() => {
      this.#sweepTimeout = null;

      if (!this.#isDestroyed) {
        this.#sweep();

        if (this.#ttlMap.size > 0 && !this.#isDestroyed) {
          this.#scheduleSweep();
        }
      }
    }, this.#options.sweepInterval);
  }

  /**
   * Performs background sweep to remove expired items.
   * @internal
   */
  #sweep(): void {
    if (this.#isDestroyed || this.#ttlMap.size === 0) {
      return;
    }

    const now = Date.now();
    const expiredKeys: K[] = [];
    let processed = 0;

    for (const [key, expiry] of this.#ttlMap.entries()) {
      if (now >= expiry) {
        expiredKeys.push(key);
      }

      processed++;

      if (processed >= this.#options.sweepChunkSize) {
        if (expiredKeys.length > 0) {
          setTimeout(() => this.#sweepBatch(expiredKeys), 0);
        }

        setTimeout(() => this.#sweep(), 0);
        return;
      }
    }

    this.#sweepBatch(expiredKeys);
  }

  /**
   * Processes batch of expired keys for removal.
   * @internal
   */
  #sweepBatch(keys: K[]): void {
    for (const key of keys) {
      this.delete(key);
    }
  }

  /**
   * Updates access time for LRU tracking.
   * @internal
   */
  #updateAccessTime(key: K): void {
    if (this.#options.evictionStrategy === "lru") {
      if (!this.#lruTracker && this.#options.maxSize > 0) {
        this.#lruTracker = new LruTracker<K>(this.#options.maxSize);
      }

      this.#lruTracker?.touch(key);
    }
  }

  /**
   * Evicts items when maximum size reached.
   * @internal
   */
  #evict(): void {
    if (this.#options.maxSize <= 0 || this.size < this.#options.maxSize) {
      return;
    }

    if (this.#options.evictionStrategy === "lru") {
      this.#evictLru();
    } else {
      this.#evictFifo();
    }
  }

  /**
   * Evicts least recently used item.
   * @internal
   */
  #evictLru(): void {
    if (!this.#lruTracker || this.#lruTracker.size === 0) {
      this.#evictFifo();
      return;
    }

    const leastUsedKey = this.#lruTracker.lru;
    if (leastUsedKey) {
      this.delete(leastUsedKey);
    } else {
      this.#evictFifo();
    }
  }

  /**
   * Evicts oldest item using FIFO strategy.
   * @internal
   */
  #evictFifo(): void {
    const firstKey = this.keys().next().value;
    if (firstKey) {
      this.delete(firstKey);
    }
  }
}
