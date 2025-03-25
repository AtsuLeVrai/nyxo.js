import { deepmerge } from "deepmerge-ts";
import { get, unset } from "lodash-es";
import { LRUCache } from "lru-cache";

/**
 * A predicate used for finding or filtering items in the store.
 * Can be either a function that evaluates each item or a partial object pattern to match against.
 *
 * @template K - The type of keys in the store
 * @template V - The type of values in the store
 */
export type StorePredicate<K extends string | number | symbol, V> =
  | ((value: V, key: K, map: Store<K, V>) => boolean)
  | Partial<V>;

/**
 * Configuration options for the Store.
 */
export interface StoreOptions {
  /**
   * Maximum number of items to store before eviction (default: 10000)
   * @minimum 0
   */
  readonly maxSize?: number;

  /**
   * Time to live in milliseconds for items (default: 0, meaning no expiration)
   * @minimum 0
   */
  readonly ttl?: number;

  /**
   * Strategy for evicting items when maxSize is reached (default: "lru")
   * - "fifo": First-in-first-out - oldest entries are evicted first
   * - "lru": Least recently used - least accessed entries are evicted first
   */
  readonly evictionStrategy?: "fifo" | "lru";
}

/**
 * Default configuration options for the Store.
 */
const DEFAULT_STORE_OPTIONS: StoreOptions = {
  maxSize: 10000,
  ttl: 0,
  evictionStrategy: "lru",
};

/**
 * An enhanced Map implementation with additional features like TTL, eviction strategies,
 * and object manipulation capabilities.
 *
 * @template K - The type of keys in the store, must be string, number, or symbol
 * @template V - The type of values in the store
 * @extends {Map<K, V>}
 *
 * @example
 * // Create a simple store
 * const userStore = new Store<string, User>();
 *
 * @example
 * // Create a store with options
 * const cache = new Store<string, any>(null, {
 *   maxSize: 1000,
 *   ttl: 60 * 1000, // 1 minute
 *   evictionStrategy: "lru"
 * });
 */
export class Store<K extends string | number | symbol, V> extends Map<K, V> {
  /**
   * Map to track expiration times for items with TTL
   * @private
   */
  readonly #ttlMap = new Map<K, number>();

  /**
   * LRU cache to track access times for the LRU eviction strategy
   * @private
   */
  readonly #lruCache: LRUCache<K, number> | null = null;

  /**
   * Parsed and validated options for this Store instance
   * @private
   */
  readonly #options: StoreOptions;

  /**
   * Cleanup interval ID
   * @private
   */
  #cleanupInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Creates a new Store instance.
   *
   * @param {readonly (readonly [K, V])[] | null} entries - Initial entries to populate the store with
   * @param {StoreOptions} options - Configuration options for the store
   * @throws {Error} If the provided options fail validation
   */
  constructor(
    entries?: readonly (readonly [K, V])[] | null,
    options: StoreOptions = {},
  ) {
    super();

    // Validate options and merge with defaults
    try {
      this.#options = this.#validateOptions(options);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Invalid store options",
      );
    }

    if (
      this.#options.evictionStrategy === "lru" &&
      this.#options.maxSize &&
      this.#options.maxSize > 0
    ) {
      this.#lruCache = new LRUCache<K, number>({
        max: this.#options.maxSize,
      });
    }

    if (entries) {
      this.#bulkSet(entries);
    }

    if (this.#options.ttl && this.#options.ttl > 0) {
      this.#startCleanupInterval();
    }
  }

  /**
   * Adds or updates a value in the store.
   * If the key already exists and both the existing and new values are objects,
   * performs a deep merge. Otherwise, replaces the existing value.
   *
   * @param {K} key - The key to add or update
   * @param {V | Partial<V>} value - The value to add or merge with existing value
   * @returns {this} The Store instance for chaining
   *
   * @example
   * // Add a new item
   * store.add('user1', { name: 'John', age: 30 });
   *
   * @example
   * // Update an existing item by merging
   * store.add('user1', { email: 'john@example.com' });
   * // Now 'user1' contains { name: 'John', age: 30, email: 'john@example.com' }
   */
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

  /**
   * Removes specific properties from an object stored at the given key.
   *
   * @param {K} key - The key of the item to modify
   * @param {(keyof V | string)[] | string | keyof V} paths - The property path(s) to remove
   * @returns {this} The Store instance for chaining
   *
   * @example
   * // Remove a single property
   * store.remove('user1', 'email');
   *
   * @example
   * // Remove multiple properties
   * store.remove('user1', ['age', 'address.street']);
   *
   * @remarks
   * - Does nothing if the key doesn't exist or the value is not an object
   * - Uses lodash's unset internally to support nested paths
   */
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

  /**
   * Finds the first value in the store that matches the provided predicate.
   *
   * @param {StorePredicate<K, V>} predicate - A function or pattern object to match against
   * @returns {V | undefined} The first matching value, or undefined if no match is found
   *
   * @example
   * // Find using a function predicate
   * const user = store.find((value, key) => value.age > 30);
   *
   * @example
   * // Find using a pattern object
   * const user = store.find({ role: 'admin' });
   *
   * @remarks
   * Updates the access time for the matching key when using LRU eviction strategy
   */
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

  /**
   * Returns a new Store containing all entries that match the provided predicate.
   *
   * @param {StorePredicate<K, V>} predicate - A function or pattern object to match against
   * @returns {Store<K, V>} A new Store instance containing the matching entries
   *
   * @example
   * // Filter using a function predicate
   * const adminUsers = store.filter((value, key) => value.role === 'admin');
   *
   * @example
   * // Filter using a pattern object
   * const activeUsers = store.filter({ status: 'active' });
   */
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

  /**
   * Retrieves a value from the store.
   *
   * @param {K} key - The key to look up
   * @returns {V | undefined} The value associated with the key, or undefined if not found or expired
   *
   * @remarks
   * - Automatically removes the item if it has expired
   * - Updates the access time for the key when using LRU eviction strategy
   *
   * @override Overrides Map.get
   */
  override get(key: K): V | undefined {
    if (this.isExpired(key)) {
      this.delete(key);
      return undefined;
    }

    const value = super.get(key);
    if (value !== undefined) {
      this.#updateAccessTime(key);
    }
    return value;
  }

  /**
   * Sets a value in the store with a specific TTL (Time-To-Live).
   *
   * @param {K} key - The key to set
   * @param {V} value - The value to store
   * @param {number} ttl - Time to live in milliseconds
   * @returns {this} The Store instance for chaining
   *
   * @example
   * // Set a value that expires after 5 minutes
   * store.setWithTtl('session', { token: 'abc123' }, 5 * 60 * 1000);
   */
  setWithTtl(key: K, value: V, ttl: number): this {
    const expiryTime = Date.now() + ttl;
    this.#ttlMap.set(key, expiryTime);
    return this.set(key, value);
  }

  /**
   * Checks if an item has expired.
   *
   * @param {K} key - The key to check
   * @returns {boolean} true if the item has expired, false otherwise
   */
  isExpired(key: K): boolean {
    const expiry = this.#ttlMap.get(key);
    if (expiry === undefined) {
      // If no TTL is set and the global TTL is greater than 0,
      // use the global TTL as the default
      // Check if we need to add a TTL for this key
      if (
        this.#options.ttl &&
        this.#options.ttl > 0 &&
        super.has(key) &&
        !this.#ttlMap.has(key)
      ) {
        // For existing keys without explicit TTL, set TTL based on defaults
        this.#ttlMap.set(key, Date.now() + (this.#options.ttl || 0));
        return false;
      }
      return false;
    }
    return Date.now() >= expiry;
  }

  /**
   * Sets a value in the store.
   *
   * @param {K} key - The key to set
   * @param {V} value - The value to store
   * @returns {this} The Store instance for chaining
   *
   * @remarks
   * - May trigger item eviction if the store size exceeds maxSize
   * - Updates the access time for the key when using LRU eviction strategy
   *
   * @override Overrides Map.set
   */
  override set(key: K, value: V): this {
    this.#evict();

    // Set default TTL if global TTL is enabled and no custom TTL exists for this key
    if (this.#options.ttl && this.#options.ttl > 0 && !this.#ttlMap.has(key)) {
      this.#ttlMap.set(key, Date.now() + (this.#options.ttl || 0));
    }

    super.set(key, value);
    this.#updateAccessTime(key);
    return this;
  }

  /**
   * Removes an item from the store.
   *
   * @param {K} key - The key to delete
   * @returns {boolean} true if an element was removed, false otherwise
   *
   * @remarks
   * Also removes the key from internal TTL and LRU trackers
   *
   * @override Overrides Map.delete
   */
  override delete(key: K): boolean {
    this.#ttlMap.delete(key);
    this.#lruCache?.delete(key);
    return super.delete(key);
  }

  /**
   * Removes all items from the store.
   *
   * @remarks
   * Also clears the internal TTL and LRU trackers
   *
   * @override Overrides Map.clear
   */
  override clear(): void {
    super.clear();
    this.#ttlMap.clear();
    this.#lruCache?.clear();
  }

  /**
   * Maps each value in the store to a new value using the provided callback function.
   *
   * @param {function} callback - Function to execute on each entry
   * @param {V} callback.value - The current value being processed
   * @param {K} callback.key - The key of the current value being processed
   * @param {Store<K, V>} callback.store - The store instance
   * @returns {R[]} Array containing the results of the callback function
   *
   * @example
   * // Get an array of all user names
   * const userNames = store.map(user => user.name);
   */
  map<R>(callback: (value: V, key: K, store: this) => R): R[] {
    return Array.from(this, ([key, value]) => callback(value, key, this));
  }

  /**
   * Returns a new Store with entries sorted according to the provided compare function.
   *
   * @param {function} [compareFn] - Function to determine the sort order
   * @returns {Store<K, V>} A new Store instance with sorted entries
   *
   * @example
   * // Sort users by age
   * const sortedUsers = store.sort((a, b) => a.age - b.age);
   *
   * @remarks
   * If no compare function is provided, values are converted to strings and sorted lexicographically
   */
  sort(compareFn?: (a: V, b: V) => number): Store<K, V> {
    const sorted = [...this.entries()].sort(
      ([, a], [, b]) => compareFn?.(a, b) ?? String(a).localeCompare(String(b)),
    );
    return new Store(sorted, this.#options);
  }

  /**
   * Returns a subset of values for pagination.
   *
   * @param {number} [page=0] - The page number (0-based)
   * @param {number} [pageSize=10] - The number of items per page
   * @returns {V[]} Array of values for the requested page
   *
   * @example
   * // Get the first page with 10 items per page
   * const firstPage = store.slice(0, 10);
   *
   * // Get the second page
   * const secondPage = store.slice(1, 10);
   */
  slice(page = 0, pageSize = 10): V[] {
    return [...this.values()].slice(page * pageSize, (page + 1) * pageSize);
  }

  /**
   * Stop cleanup interval when instance is no longer needed
   */
  destroy(): void {
    if (this.#cleanupInterval) {
      clearInterval(this.#cleanupInterval);
      this.#cleanupInterval = null;
    }
  }

  /**
   * Validates the options for the Store and returns the validated options merged with defaults.
   *
   * @param {StoreOptions} options - The options to validate
   * @returns {StoreOptions} The validated options merged with defaults
   * @private
   */
  #validateOptions(options: StoreOptions): StoreOptions {
    if (
      options.maxSize !== undefined &&
      (typeof options.maxSize !== "number" ||
        options.maxSize < 0 ||
        !Number.isInteger(options.maxSize))
    ) {
      throw new Error("maxSize must be a non-negative integer");
    }

    if (
      options.ttl !== undefined &&
      (typeof options.ttl !== "number" ||
        options.ttl < 0 ||
        !Number.isInteger(options.ttl))
    ) {
      throw new Error("ttl must be a non-negative integer");
    }

    if (
      options.evictionStrategy !== undefined &&
      options.evictionStrategy !== "fifo" &&
      options.evictionStrategy !== "lru"
    ) {
      throw new Error('evictionStrategy must be either "fifo" or "lru"');
    }

    // Return the validated options merged with defaults
    return { ...DEFAULT_STORE_OPTIONS, ...options };
  }

  /**
   * Sets multiple entries in the store at once.
   *
   * @param {readonly (readonly [K, V])[]} entries - The entries to set
   * @private
   */
  #bulkSet(entries: readonly (readonly [K, V])[]): void {
    for (const [key, value] of entries) {
      this.set(key, value);
    }
  }

  /**
   * Starts an interval to periodically clean up expired items.
   *
   * @private
   */
  #startCleanupInterval(): void {
    const cleanupInterval = Math.min((this.#options.ttl || 0) / 2, 60000);
    this.#cleanupInterval = setInterval(() => this.#cleanup(), cleanupInterval);
    // Force an immediate cleanup run
    this.#cleanup();
  }

  /**
   * Removes all expired items from the store.
   *
   * @private
   */
  #cleanup(): void {
    const now = Date.now();
    for (const [key, expiry] of this.#ttlMap.entries()) {
      if (now >= expiry) {
        this.delete(key);
      }
    }
  }

  /**
   * Updates the last access time for a key when using the LRU eviction strategy.
   *
   * @param {K} key - The key that was accessed
   * @private
   */
  #updateAccessTime(key: K): void {
    if (this.#options.evictionStrategy === "lru" && this.#lruCache) {
      this.#lruCache.set(key, Date.now());
    }
  }

  /**
   * Evicts an item if the store has reached its maximum size.
   * Uses the configured eviction strategy (LRU or FIFO).
   *
   * @private
   */
  #evict(): void {
    if (!this.#options.maxSize || this.size < (this.#options.maxSize || 0)) {
      return;
    }

    if (this.#options.evictionStrategy === "lru" && this.#lruCache) {
      // Find the least recently used key
      let oldestTime = Number.POSITIVE_INFINITY;
      let leastUsedKey: K | null = null;

      for (const [key, accessTime] of this.#lruCache.entries()) {
        if (accessTime < oldestTime) {
          oldestTime = accessTime;
          leastUsedKey = key;
        }
      }

      if (leastUsedKey) {
        this.delete(leastUsedKey);
      }
    } else {
      // FIFO - remove the first key added
      const firstKey = this.keys().next().value;
      if (firstKey) {
        this.delete(firstKey);
      }
    }
  }

  /**
   * Checks if a value matches a pattern of key-value pairs.
   *
   * @param {V} value - The value to check
   * @param {[string, unknown][]} pattern - The pattern to match against
   * @returns {boolean} true if the value matches the pattern, false otherwise
   * @private
   */
  #matchesPattern(value: V, pattern: [string, unknown][]): boolean {
    return pattern.every(([path, expectedValue]) => {
      const actualValue = get(value, path);
      return Array.isArray(actualValue)
        ? actualValue.includes(expectedValue)
        : actualValue === expectedValue;
    });
  }
}
