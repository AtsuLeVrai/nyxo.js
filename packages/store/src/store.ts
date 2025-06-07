import { deepmerge } from "deepmerge-ts";
import { cloneDeep, get, unset } from "lodash-es";
import { z } from "zod/v4";
import { LruTracker } from "./lru-tracker.js";

/**
 * Valid key types for the store
 */
export type StoreKey = string | number | symbol;

/**
 * A predicate used for finding or filtering items in the store.
 * Can be either a function that evaluates each item or a partial object pattern to match against.
 *
 * @typeParam K - The type of keys in the store
 * @typeParam V - The type of values in the store
 */
export type StorePredicate<K extends StoreKey, V> =
  | ((value: V, key: K) => boolean)
  | Partial<V>;

/**
 * Configuration options for the Store class.
 * These options control caching behavior, memory management, and data integrity.
 */
export const StoreOptions = z.object({
  /**
   * Maximum number of items to keep in the store before older items are evicted.
   *
   * When this limit is reached, the store will automatically remove items
   * based on the configured eviction strategy (FIFO or LRU).
   *
   * Set to 0 for unlimited storage (not recommended for production use
   * with large datasets as it may lead to memory issues).
   *
   * @default 10000
   */
  maxSize: z.number().int().nonnegative().default(10000),

  /**
   * Time-to-live duration in milliseconds after which items are considered expired.
   *
   * Once an item exceeds its TTL, it will be removed:
   * - Immediately when accessed via get()
   * - During periodic sweep operations based on sweepInterval
   *
   * Set to 0 to disable expiration (items will remain until evicted by maxSize).
   *
   * @default 0 (no expiration)
   */
  ttl: z.number().int().nonnegative().default(0),

  /**
   * Algorithm to determine which items to remove when maxSize is reached.
   *
   * Options:
   * - "lru" (Least Recently Used): Removes items that haven't been accessed recently.
   *   Optimizes for cached data that is likely to be needed again, providing better
   *   cache hit rates for most real-world applications.
   *
   * - "fifo" (First In First Out): Removes the oldest items first, regardless of access.
   *   Simpler algorithm with slightly better performance but potentially lower hit rates.
   *
   * @default "lru"
   */
  evictionStrategy: z.enum(["fifo", "lru"]).default("lru"),

  /**
   * Interval in milliseconds at which the store automatically sweeps for and removes expired items.
   *
   * This background sweep process ensures expired items are removed even if they're
   * never accessed again, preventing memory leaks with time-based expiration.
   *
   * Lower values:
   * - More responsive TTL enforcement
   * - Higher CPU overhead due to frequent sweep cycles
   *
   * Higher values:
   * - Lower CPU overhead
   * - Expired items may remain in memory longer
   *
   * Note: Items are also checked for expiration when accessed, regardless of this interval.
   *
   * @default 15000 (15 seconds)
   */
  sweepInterval: z.number().int().positive().default(15000),

  /**
   * Size of each chunk processed during the sweep operation.
   *
   * This controls how many expired items are removed in each sweep cycle.
   *
   * Lower values:
   * - More frequent sweeps with smaller batches
   * - Reduces memory spikes during sweeps
   *
   * Higher values:
   * - Fewer sweeps with larger batches
   * - Can lead to higher memory usage during sweeps
   *
   * @default 100
   */
  sweepChunkSize: z.number().int().positive().default(100),
});

export type StoreOptions = z.infer<typeof StoreOptions>;

/**
 * An enhanced Map implementation with additional features like TTL, eviction strategies,
 * and object manipulation capabilities.
 *
 * **Memory Management**: This implementation includes comprehensive memory leak prevention:
 * - Automatic sweep of expired items and internal references
 * - Proper disposal of LRU tracker nodes with reference cleanup
 * - Simple timeout-based sweep scheduling to prevent reference cycles
 * - Comprehensive resource management with Symbol.dispose support
 *
 * **Performance Characteristics**:
 * - O(1) get, set, has, delete operations
 * - O(1) LRU eviction when using LRU strategy
 * - O(n) sweep operations for expired item removal
 * - O(n) find, filter operations
 *
 * **Lifecycle**: After calling destroy(), the store remains functional for basic operations
 * but automatic TTL sweeping is disabled. This allows for graceful degradation rather than
 * throwing errors on every operation.
 *
 * @typeParam K - The type of keys in the store, must be string, number, or symbol
 * @typeParam V - The type of values in the store
 *
 * @remarks
 * This class extends the built-in Map\<K, V\> class
 */
export class Store<K extends StoreKey, V> extends Map<K, V> {
  /**
   * Map to track expiration times for items with TTL.
   * Key: store key, Value: expiration timestamp in milliseconds
   * @internal
   */
  #ttlMap = new Map<K, number>();

  /**
   * LRU tracker to manage access times for the LRU eviction strategy.
   * Only initialized when using LRU eviction and maxSize > 0
   * @internal
   */
  #lruTracker: LruTracker<K> | null = null;

  /**
   * Timeout ID for the next scheduled sweep operation.
   * Set to null when sweep is disabled or store is destroyed.
   * @internal
   */
  #sweepTimeout: NodeJS.Timeout | null = null;

  /**
   * Flag to track if the store has been destroyed
   * @internal
   */
  #isDestroyed = false;

  /**
   * Parsed and validated options for this Store instance
   * @internal
   */
  readonly #options: StoreOptions;

  /**
   * Creates a new Store instance with optional initial entries and configuration.
   *
   * @param entriesOrOptions - Initial entries to populate the store with, or configuration options
   * @param maybeOptions - Configuration options for the store (used only if first parameter is entries)
   * @throws Error If the provided options fail validation or are incompatible
   */
  constructor(
    entriesOrOptions?:
      | readonly (readonly [K, V])[]
      | z.input<typeof StoreOptions>
      | null,
    maybeOptions?: z.input<typeof StoreOptions>,
  ) {
    super();

    // Helper functions for type checks
    const isEntriesArray = (
      arr: unknown,
    ): arr is readonly (readonly [K, V])[] => {
      return (
        Array.isArray(arr) &&
        (arr.length === 0 || (Array.isArray(arr[0]) && arr[0].length === 2))
      );
    };

    const isOptions = (obj: unknown): obj is z.input<typeof StoreOptions> => {
      return obj !== null && typeof obj === "object" && !Array.isArray(obj);
    };

    // Determine actual parameters based on overloaded constructor
    let actualEntries: readonly (readonly [K, V])[] | null | undefined = null;
    let actualOptions: z.input<typeof StoreOptions> = {};

    if (isEntriesArray(entriesOrOptions)) {
      // First parameter is an entries array
      actualEntries = entriesOrOptions;
      actualOptions = maybeOptions ?? {};
    } else if (isOptions(entriesOrOptions)) {
      // First parameter is an options object
      actualEntries = null;
      actualOptions = entriesOrOptions;
    } else if (entriesOrOptions === null || entriesOrOptions === undefined) {
      // First parameter is null or undefined
      actualEntries = null;
      actualOptions = maybeOptions ?? {};
    } else {
      // First parameter is neither an entries array nor an options object
      throw new Error(
        "First argument must be either an array of entries or an options object",
      );
    }

    // Initialize options with defaults
    let parsedOptions: StoreOptions;

    // Validate options and merge with defaults
    try {
      parsedOptions = StoreOptions.parse(actualOptions);
    } catch (error) {
      // If options validation fails, clean up the store
      this.destroy();

      // If validation fails, rethrow the error with additional context
      if (error instanceof z.ZodError) {
        // Convert Zod validation errors to more readable format
        throw new Error(z.prettifyError(error));
      }

      // If validation fails, rethrow the error with additional context
      throw error;
    }

    this.#options = parsedOptions;

    // Add initial entries if provided
    if (actualEntries) {
      this.#bulkSet(actualEntries);
    }

    // Set up periodic sweep if TTL is enabled
    if (this.#options.ttl > 0) {
      this.#scheduleSweep();
    }
  }

  /**
   * Adds or updates a value in the store with intelligent merging behavior.
   * If the key already exists and both the existing and new values are objects,
   * performs a deep merge. Otherwise, replaces the existing value.
   *
   * @param key - The key to add or update
   * @param value - The value to add or merge with existing value
   * @returns The Store instance for method chaining
   */
  add(key: K, value: V | Partial<V>): this {
    if (!this.has(key)) {
      return this.set(key, value as V);
    }

    const existingValue = this.get(key) as V;

    // If either existing or new value is not an object, replace directly
    if (
      typeof existingValue !== "object" ||
      existingValue === null ||
      typeof value !== "object" ||
      value === null
    ) {
      return this.set(key, value as V);
    }

    // Check if both existing and new values are objects
    const hasNestedObjects = Object.values(value).some(
      (v) => typeof v === "object" && v !== null,
    );

    // If neither value has nested objects, perform a shallow merge
    if (!hasNestedObjects) {
      const merged = { ...existingValue, ...value } as V;
      return this.set(key, merged);
    }

    // If either value has nested objects, perform a deep merge
    const mergedValue = deepmerge(existingValue, value) as V;
    return this.set(key, mergedValue);
  }

  /**
   * Removes specific properties from an object stored at the given key.
   * Uses lodash unset and cloneDeep for deep property path support.
   *
   * @param key - The key of the item to modify
   * @param paths - The property path(s) to remove (supports dot notation for nested properties)
   * @returns The Store instance for method chaining
   * @throws Error If the key doesn't exist or the value is not an object
   */
  remove(key: K, paths: (keyof V | string)[] | string | keyof V): this {
    if (!this.has(key)) {
      throw new Error(`Key not found: ${String(key)}`);
    }

    const value = this.get(key);
    if (typeof value !== "object" || value === null) {
      throw new Error(
        `Cannot remove properties from non-object value at key: ${String(key)}`,
      );
    }

    // Create shallow copy to avoid modifying the original object
    const newValue = cloneDeep(value);
    const pathsArray = Array.isArray(paths) ? paths : [paths];

    // Remove each specified path using lodash unset
    for (const path of pathsArray) {
      unset(newValue, path as string);
    }

    this.set(key, newValue as V);
    return this;
  }

  /**
   * Finds the first value in the store that matches the provided predicate.
   * Supports both function predicates and object pattern matching.
   *
   * @param predicate - A function or pattern object to match against
   * @returns The first matching value, or undefined if no match is found
   */
  find(predicate: StorePredicate<K, V>): V | undefined {
    if (typeof predicate === "function") {
      for (const [key, value] of this) {
        if (predicate(value, key)) {
          this.#updateAccessTime(key);
          return value;
        }
      }
      return undefined;
    }

    // Handle object pattern matching
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
   * Returns all values in the store that match the provided predicate.
   * Updates access times for all matching keys when using LRU eviction.
   *
   * @param predicate - A function or pattern object to match against
   * @returns Array of matching values (empty array if no matches)
   */
  findAll(predicate: StorePredicate<K, V>): V[] {
    const results: V[] = [];

    // Collect all matching values
    if (typeof predicate === "function") {
      for (const [key, value] of this) {
        if (predicate(value, key)) {
          this.#updateAccessTime(key);
          results.push(value);
        }
      }
    } else {
      const entries = Object.entries(predicate);
      for (const [key, value] of this) {
        if (this.#matchesPattern(value, entries)) {
          this.#updateAccessTime(key);
          results.push(value);
        }
      }
    }

    return results;
  }

  /**
   * Returns a new Store containing all entries that match the provided predicate.
   * The new store inherits the same configuration options as the current store.
   *
   * @param predicate - A function or pattern object to match against
   * @returns A new Store instance containing the matching entries
   */
  filter(predicate: StorePredicate<K, V>): Store<K, V> {
    const newStore = new Store<K, V>(null, this.#options);

    if (typeof predicate === "function") {
      for (const [key, value] of this) {
        if (predicate(value, key)) {
          newStore.set(key, value);
        }
      }
      return newStore;
    }

    // Handle object pattern matching
    const entries = Object.entries(predicate);
    for (const [key, value] of this) {
      if (this.#matchesPattern(value, entries)) {
        newStore.set(key, value);
      }
    }
    return newStore;
  }

  /**
   * Sets a value in the store with a specific TTL (Time-To-Live).
   * Overrides any existing TTL for the key.
   *
   * @param key - The key to set
   * @param value - The value to store
   * @param ttl - Time to live in milliseconds
   * @returns The Store instance for method chaining
   * @throws Error If TTL is negative
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
   * Checks if an item has expired based on its TTL.
   *
   * @param key - The key to check
   * @returns true if the item has expired, false otherwise
   */
  isExpired(key: K): boolean {
    const expiry = this.#ttlMap.get(key);
    if (expiry === undefined) {
      // If no TTL is set and the global TTL is greater than 0,
      // use the global TTL as the default for existing keys
      if (this.#options.ttl > 0 && super.has(key) && !this.#ttlMap.has(key)) {
        // For existing keys without explicit TTL, set TTL based on defaults
        this.#ttlMap.set(key, Date.now() + this.#options.ttl);
        return false;
      }
      return false;
    }
    return Date.now() >= expiry;
  }

  /**
   * Maps each value in the store to a new value using the provided callback function.
   * Similar to Array.map but for Store values.
   *
   * @param callback - Function to execute on each entry
   * @returns Array containing the results of the callback function
   */
  map<R>(callback: (value: V, key: K, store: this) => R): R[] {
    return Array.from(this, ([key, value]) => callback(value, key, this));
  }

  /**
   * Returns a new Store with entries sorted according to the provided compare function.
   * The new store inherits the same configuration options.
   *
   * @param compareFn - Function to determine the sort order (compares values)
   * @returns A new Store instance with sorted entries
   */
  sort(compareFn?: (a: V, b: V) => number): Store<K, V> {
    const sorted = [...this.entries()].sort(
      ([, a], [, b]) => compareFn?.(a, b) ?? String(a).localeCompare(String(b)),
    );
    return new Store(sorted, this.#options);
  }

  /**
   * Returns a subset of values for pagination support.
   *
   * @param page - The page number (0-based)
   * @param pageSize - The number of items per page
   * @returns Array of values for the requested page
   * @throws Error If page is negative or pageSize is not positive
   */
  slice(page = 0, pageSize = 10): V[] {
    if (page < 0) {
      throw new Error(`Page number cannot be negative: ${page}`);
    }
    if (pageSize <= 0) {
      throw new Error(`Page size must be positive: ${pageSize}`);
    }

    return [...this.values()].slice(page * pageSize, (page + 1) * pageSize);
  }

  /**
   * Returns all values in the store as an array.
   * Convenience method for converting store values to array format.
   *
   * @returns Array of all values in the store
   */
  toArray(): V[] {
    return [...this.values()];
  }

  /**
   * Returns all keys in the store as an array.
   * Convenience method for converting store keys to array format.
   *
   * @returns Array of all keys in the store
   */
  keysArray(): K[] {
    return [...this.keys()];
  }

  /**
   * Returns all entries in the store as an array of [key, value] pairs.
   * Convenience method for converting store entries to array format.
   *
   * @returns Array of all entries in the store
   */
  entriesArray(): [K, V][] {
    return [...this.entries()];
  }

  /**
   * Stops automatic TTL sweeping and cleans up resources.
   * The store remains functional for basic operations after calling this method,
   * but expired items will only be removed when explicitly accessed.
   *
   * @remarks
   * - Stops the sweep timeout to prevent memory leaks
   * - Clears all internal data structures and metadata
   * - Properly disposes of LRU tracker resources with reference cleanup
   * - Store remains usable for get/set operations (graceful degradation)
   */
  destroy(): void {
    // Mark as destroyed to prevent new sweep scheduling
    this.#isDestroyed = true;

    // Stop periodic sweep timeout
    if (this.#sweepTimeout) {
      clearTimeout(this.#sweepTimeout);
      this.#sweepTimeout = null;
    }

    // If using LRU eviction, dispose of the tracker
    if (this.#lruTracker) {
      this.#lruTracker.clear();
      this.#lruTracker = null;
    }

    // Clear the TTL map to remove all expiration tracking
    if (this.#ttlMap) {
      this.#ttlMap.clear();
    }

    // Clear all data
    super.clear();
  }

  /**
   * Retrieves a value from the store with automatic expiration handling.
   *
   * @param key - The key to look up
   * @returns The value associated with the key, or undefined if not found or expired
   *
   * @remarks
   * - Automatically removes the item if it has expired
   * - Updates the access time for the key when using LRU eviction strategy
   * - Performs occasional passive sweep to clean up expired items
   *
   * @override Overrides Map.get
   */
  override get(key: K): V | undefined {
    // Perform occasional passive sweep (1% chance to reduce overhead)
    if (Math.random() < 0.01) {
      this.#sweep();
    }

    // Check expiration first and remove if expired
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
   * Checks if a key exists in the store and is not expired.
   *
   * @param key - The key to check
   * @returns true if the key exists and is not expired, false otherwise
   *
   * @remarks
   * - Automatically removes the item if it has expired
   * - Uses the parent Map's has method for checking existence
   *
   * @override Overrides Map.has
   */
  override has(key: K): boolean {
    // First check if the item has expired
    if (this.isExpired(key)) {
      // If expired, delete it and return false
      this.delete(key);
      return false;
    }

    // If not expired, use the parent Map's has method
    return super.has(key);
  }

  /**
   * Sets a value in the store with automatic eviction and TTL management.
   *
   * @param key - The key to set
   * @param value - The value to store
   * @returns The Store instance for method chaining
   *
   * @remarks
   * - May trigger item eviction if the store size exceeds maxSize
   * - Updates the access time for the key when using LRU eviction strategy
   * - Applies default TTL if global TTL is configured and no custom TTL exists
   * - Schedules next sweep operation if TTL is enabled
   *
   * @override Overrides Map.set
   */
  override set(key: K, value: V): this {
    // Ensure there's room for the new item by evicting if necessary
    if (
      this.#options.maxSize > 0 &&
      this.size >= this.#options.maxSize &&
      !this.has(key)
    ) {
      this.#evict();
    }

    // Set default TTL if global TTL is enabled and no custom TTL exists for this key
    if (this.#options.ttl > 0 && !this.#ttlMap.has(key)) {
      this.#ttlMap.set(key, Date.now() + this.#options.ttl);
    }

    super.set(key, value);
    this.#updateAccessTime(key);

    // Schedule sweep if TTL is enabled and not already scheduled
    if (this.#options.ttl > 0 && !this.#sweepTimeout && !this.#isDestroyed) {
      this.#scheduleSweep();
    }

    return this;
  }

  /**
   * Removes an item from the store and all associated metadata.
   *
   * @param key - The key to delete
   * @returns true if an element was removed, false otherwise
   *
   * @remarks
   * Also removes the key from internal TTL and LRU trackers to prevent memory leaks
   *
   * @override Overrides Map.delete
   */
  override delete(key: K): boolean {
    // Check if the key exists in the store
    const existed = super.has(key);
    if (!existed) {
      return false;
    }

    // Delete the item from the store
    const result = super.delete(key);

    // Clean up associated metadata
    if (this.#ttlMap.size > 0) {
      this.#ttlMap.delete(key);
    }

    // Clean up LRU tracker if it exists
    if (this.#lruTracker) {
      this.#lruTracker.delete(key);
    }

    return result;
  }

  /**
   * Removes all items from the store and clears all associated metadata.
   *
   * @remarks
   * Also clears the internal TTL and LRU trackers to prevent memory leaks
   *
   * @override Overrides Map.clear
   */
  override clear(): void {
    super.clear();

    // Clear all metadata maps
    if (this.#ttlMap) {
      this.#ttlMap.clear();
    }

    // Clear the LRU tracker if it exists
    if (this.#lruTracker) {
      this.#lruTracker.clear();
    }
  }

  /**
   * Symbol.dispose implementation for automatic resource management.
   * This is part of the explicit resource management proposal (using declarations).
   * Automatically called when the store goes out of scope in a using declaration.
   */
  [Symbol.dispose](): void {
    this.destroy();
  }

  /**
   * Sets multiple entries in the store at once with optimized batch processing.
   *
   * @param entries - The entries to set
   * @internal
   */
  #bulkSet(entries: readonly (readonly [K, V])[]): void {
    for (const [key, value] of entries) {
      this.set(key, value);
    }
  }

  /**
   * Schedules the next sweep operation to remove expired items.
   * Uses setTimeout instead of setInterval for better resource management.
   *
   * @internal
   */
  #scheduleSweep(): void {
    // Don't schedule if already destroyed or sweep is already scheduled
    if (this.#isDestroyed || this.#sweepTimeout) {
      return;
    }

    this.#sweepTimeout = setTimeout(() => {
      // Clear the timeout reference
      this.#sweepTimeout = null;

      // Only sweep if not destroyed
      if (!this.#isDestroyed) {
        this.#sweep();

        // Reschedule if there are still items with TTL and not destroyed
        if (this.#ttlMap.size > 0 && !this.#isDestroyed) {
          this.#scheduleSweep();
        }
      }
    }, this.#options.sweepInterval);
  }

  /**
   * Performs a sweep operation to remove all expired items from the store.
   * This is a batch operation that identifies and removes multiple expired items efficiently.
   *
   * @internal
   */
  #sweep(): void {
    // Early exit if destroyed or no TTL items
    if (this.#isDestroyed || this.#ttlMap.size === 0) {
      return;
    }

    const now = Date.now();
    const expiredKeys: K[] = [];
    let processed = 0;

    // Iterate through the TTL map to find expired items
    for (const [key, expiry] of this.#ttlMap.entries()) {
      if (now >= expiry) {
        expiredKeys.push(key);
      }

      processed++;
      if (processed >= this.#options.sweepChunkSize) {
        // Batch processing to avoid blocking the event loop
        if (expiredKeys.length > 0) {
          setTimeout(() => this.#sweepBatch(expiredKeys), 0);
        }

        // Reset expired keys for the next batch
        setTimeout(() => this.#sweep(), 0);
        return;
      }
    }

    // Cleanup final
    this.#sweepBatch(expiredKeys);
  }

  /**
   * Continues the sweep operation after processing a batch of expired items.
   * This method is called recursively until all expired items are processed.
   *
   * @param keys
   * @private
   */
  #sweepBatch(keys: K[]): void {
    for (const key of keys) {
      this.delete(key);
    }
  }

  /**
   * Updates the last access time for a key when using the LRU eviction strategy.
   * This ensures recently accessed items are less likely to be evicted.
   *
   * @param key - The key that was accessed
   * @internal
   */
  #updateAccessTime(key: K): void {
    if (this.#options.evictionStrategy === "lru") {
      // Ensure LRU tracker is initialized if using LRU eviction
      if (!this.#lruTracker && this.#options.maxSize > 0) {
        this.#lruTracker = new LruTracker<K>(this.#options.maxSize);
      }

      this.#lruTracker?.touch(key);
    }
  }

  /**
   * Evicts an item if the store has reached its maximum size.
   * Uses the configured eviction strategy (LRU or FIFO) to determine which item to remove.
   *
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
   * Evicts the least recently used item using the LRU tracker.
   * Falls back to FIFO eviction if LRU tracker is unavailable or empty.
   *
   * @internal
   */
  #evictLru(): void {
    if (!this.#lruTracker || this.#lruTracker.size === 0) {
      // Fall back to FIFO if LRU tracker is not available or empty
      this.#evictFifo();
      return;
    }

    const leastUsedKey = this.#lruTracker.getLru();
    if (leastUsedKey) {
      this.delete(leastUsedKey);
    } else {
      // Fall back to FIFO if no least used key is found
      this.#evictFifo();
    }
  }

  /**
   * Evicts the first item added to the store (First-In-First-Out).
   * This is the fallback eviction strategy and the default for "fifo" configuration.
   *
   * @internal
   */
  #evictFifo(): void {
    const firstKey = this.keys().next().value;
    if (firstKey) {
      this.delete(firstKey);
    }
  }

  /**
   * Checks if a value matches a pattern of key-value pairs using lodash get for deep property access.
   * Supports array matching and contains operations.
   *
   * @param value - The value to check
   * @param pattern - The pattern to match against as [path, expectedValue] pairs
   * @returns true if the value matches the pattern, false otherwise
   * @internal
   */
  #matchesPattern(value: V, pattern: [string, unknown][]): boolean {
    if (typeof value !== "object" || value === null) {
      return false;
    }

    // Optimisation: if the pattern is empty, always return true
    for (const [path, expectedValue] of pattern) {
      const actualValue = get(value, path);

      // If the actual value is undefined, it doesn't match
      if (Array.isArray(actualValue)) {
        if (Array.isArray(expectedValue)) {
          // If both are arrays, check if they match in length and content
          if (
            expectedValue.length !== actualValue.length ||
            !expectedValue.every((v) => actualValue.includes(v))
          ) {
            return false;
          }
        } else if (!actualValue.includes(expectedValue)) {
          return false;
        }
      } else if (actualValue !== expectedValue) {
        return false;
      }
    }

    return true;
  }
}
