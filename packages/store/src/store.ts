import { deepmerge } from "deepmerge-ts";
import { get, unset } from "lodash-es";
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
 * @template K - The type of keys in the store
 * @template V - The type of values in the store
 */
export type StorePredicate<K extends StoreKey, V> =
  | ((value: V, key: K, map: Store<K, V>) => boolean)
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
  maxSize: z.number().int().min(0).default(10000),

  /**
   * Time-to-live duration in milliseconds after which items are considered expired.
   *
   * Once an item exceeds its TTL, it will be removed:
   * - Immediately when accessed via get()
   * - During periodic cleanup based on expirationCheckInterval
   *
   * Set to 0 to disable expiration (items will remain until evicted by maxSize).
   *
   * @default 0 (no expiration)
   */
  ttl: z.number().int().min(0).default(0),

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
   * Interval in milliseconds at which the store automatically checks for and removes expired items.
   *
   * This background cleanup process ensures expired items are removed even if they're
   * never accessed again, preventing memory leaks with time-based expiration.
   *
   * Lower values:
   * - More responsive TTL enforcement
   * - Higher CPU overhead due to frequent cleanup cycles
   *
   * Higher values:
   * - Lower CPU overhead
   * - Expired items may remain in memory longer
   *
   * Note: Items are also checked for expiration when accessed, regardless of this interval.
   *
   * @default 15000 (15 seconds)
   */
  expirationCheckInterval: z.number().int().min(1000).default(15000),
});

export type StoreOptions = z.infer<typeof StoreOptions>;

/**
 * An enhanced Map implementation with additional features like TTL, eviction strategies,
 * and object manipulation capabilities.
 *
 * **Memory Management**: This implementation includes comprehensive memory leak prevention:
 * - Automatic cleanup of internal references
 * - Proper disposal of LRU tracker nodes
 * - WeakRef-based interval management to prevent strong reference cycles
 * - Comprehensive cleanup methods with Symbol.dispose support
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
 *
 * @example
 * // Proper cleanup when done
 * using store = new Store<string, any>({ maxSize: 100 });
 * // Store will be automatically disposed when it goes out of scope
 */
export class Store<K extends StoreKey, V> extends Map<K, V> {
  /**
   * Map to track expiration times for items with TTL
   * @private
   */
  readonly #ttlMap = new Map<K, number>();

  /**
   * LRU tracker to manage access times for the LRU eviction strategy
   * @private
   */
  readonly #lruTracker: LruTracker<K> | null = null;

  /**
   * Parsed and validated options for this Store instance
   * @private
   */
  readonly #options: StoreOptions;

  /**
   * Cleanup interval ID
   * @private
   */
  #cleanupInterval: NodeJS.Timeout | null = null;

  /**
   * Flag to track if the store has been disposed
   * @private
   */
  #disposed = false;

  /**
   * WeakRef to this instance for use in interval callbacks
   * @private
   */
  readonly #selfRef: WeakRef<Store<K, V>>;

  /**
   * Creates a new Store instance.
   *
   * @param entriesOrOptions - Initial entries to populate the store with, or configuration options
   * @param maybeOptions - Configuration options for the store (used only if first parameter is entries)
   * @throws {Error} If the provided options fail validation
   *
   * @example
   * // Create empty store with default options
   * const store1 = new Store();
   *
   * @example
   * // Create store with initial entries
   * const store2 = new Store([['key1', 'value1'], ['key2', 'value2']]);
   *
   * @example
   * // Create store with custom options
   * const store3 = new Store({ maxSize: 500, ttl: 60000 });
   *
   * @example
   * // Create store with both initial entries and custom options
   * const store4 = new Store([['key1', 'value1']], { maxSize: 500 });
   */
  constructor(
    entriesOrOptions?:
      | readonly (readonly [K, V])[]
      | z.input<typeof StoreOptions>
      | null,
    maybeOptions?: z.input<typeof StoreOptions>,
  ) {
    super();

    // Create WeakRef to self to prevent strong reference cycles in intervals
    this.#selfRef = new WeakRef(this);

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

    // Determine actual parameters
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

    // Validate options and merge with defaults
    try {
      this.#options = StoreOptions.parse(actualOptions);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod validation errors to more readable format
        throw new Error(z.prettifyError(error));
      }

      // If validation fails, rethrow the error with additional context
      throw error;
    }

    // Set up LRU tracker if using LRU eviction strategy
    if (this.#options.evictionStrategy === "lru" && this.#options.maxSize > 0) {
      this.#lruTracker = new LruTracker<K>(this.#options.maxSize);
    }

    // Add initial entries if provided
    if (actualEntries) {
      this.#bulkSet(actualEntries);
    }

    // Set up cleanup interval if TTL is enabled
    if (this.#options.ttl > 0) {
      this.#startCleanupInterval();
    }
  }

  /**
   * Returns the current configuration options for this store.
   * @returns A copy of the store options
   */
  get options(): StoreOptions {
    return { ...this.#options };
  }

  /**
   * Returns whether the store has been disposed.
   * @returns true if the store has been disposed, false otherwise
   */
  get isDisposed(): boolean {
    return this.#disposed;
  }

  /**
   * Adds or updates a value in the store.
   * If the key already exists and both the existing and new values are objects,
   * performs a deep merge. Otherwise, replaces the existing value.
   *
   * @param key - The key to add or update
   * @param value - The value to add or merge with existing value
   * @returns The Store instance for chaining
   * @throws {Error} If the store has been disposed
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
    this.#checkDisposed();

    if (this.has(key)) {
      const existingValue = this.get(key) as V;
      if (
        typeof existingValue === "object" &&
        existingValue !== null &&
        typeof value === "object" &&
        value !== null
      ) {
        const mergedValue = deepmerge(existingValue, value) as V;
        this.set(key, mergedValue);
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
   * @param key - The key of the item to modify
   * @param paths - The property path(s) to remove
   * @returns The Store instance for chaining
   * @throws {Error} If the key doesn't exist, the value is not an object, or the store has been disposed
   *
   * @example
   * // Remove a single property
   * store.remove('user1', 'email');
   *
   * @example
   * // Remove multiple properties
   * store.remove('user1', ['age', 'address.street']);
   */
  remove(key: K, paths: (keyof V | string)[] | string | keyof V): this {
    this.#checkDisposed();

    if (!this.has(key)) {
      throw new Error(`Key not found: ${String(key)}`);
    }

    const value = this.get(key);
    if (typeof value !== "object" || value === null) {
      throw new Error(
        `Cannot remove properties from non-object value at key: ${String(key)}`,
      );
    }

    const newValue = { ...(value as object) };
    const pathsArray = Array.isArray(paths) ? paths : [paths];

    for (const path of pathsArray) {
      unset(newValue, path as string);
    }

    this.set(key, newValue as V);
    return this;
  }

  /**
   * Finds the first value in the store that matches the provided predicate.
   *
   * @param predicate - A function or pattern object to match against
   * @returns The first matching value, or undefined if no match is found
   * @throws {Error} If the store has been disposed
   *
   * @example
   * // Find using a function predicate
   * const user = store.find((value, key) => value.age > 30);
   *
   * @example
   * // Find using a pattern object
   * const user = store.find({ role: 'admin' });
   */
  find(predicate: StorePredicate<K, V>): V | undefined {
    this.#checkDisposed();

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
   * Returns all values in the store that match the provided predicate.
   *
   * @param predicate - A function or pattern object to match against
   * @returns Array of matching values
   * @throws {Error} If the store has been disposed
   *
   * @example
   * // Find all users over 30
   * const olderUsers = store.findAll(user => user.age > 30);
   */
  findAll(predicate: StorePredicate<K, V>): V[] {
    this.#checkDisposed();

    const results: V[] = [];

    // Collect all matching values
    if (typeof predicate === "function") {
      for (const [key, value] of this) {
        if (predicate(value, key, this)) {
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
   *
   * @param predicate - A function or pattern object to match against
   * @returns A new Store instance containing the matching entries
   * @throws {Error} If the store has been disposed
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
    this.#checkDisposed();

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
   * @param key - The key to look up
   * @returns The value associated with the key, or undefined if not found or expired
   * @throws {Error} If the store has been disposed
   *
   * @remarks
   * - Automatically removes the item if it has expired
   * - Updates the access time for the key when using LRU eviction strategy
   *
   * @override Overrides Map.get
   */
  override get(key: K): V | undefined {
    this.#checkDisposed();

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
   * @throws {Error} If the store has been disposed
   *
   * @remarks
   * - Automatically removes the item if it has expired
   * - Uses the parent Map's has method for checking existence
   *
   * @override Overrides Map.has
   */
  override has(key: K): boolean {
    this.#checkDisposed();

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
   * Sets a value in the store with a specific TTL (Time-To-Live).
   *
   * @param key - The key to set
   * @param value - The value to store
   * @param ttl - Time to live in milliseconds
   * @returns The Store instance for chaining
   * @throws {Error} If TTL is negative or the store has been disposed
   *
   * @example
   * // Set a value that expires after 5 minutes
   * store.setWithTtl('session', { token: 'abc123' }, 5 * 60 * 1000);
   */
  setWithTtl(key: K, value: V, ttl: number): this {
    this.#checkDisposed();

    if (ttl < 0) {
      throw new Error(`TTL cannot be negative: ${ttl}`);
    }

    const expiryTime = Date.now() + ttl;
    this.#ttlMap.set(key, expiryTime);
    return this.set(key, value);
  }

  /**
   * Checks if an item has expired.
   *
   * @param key - The key to check
   * @returns true if the item has expired, false otherwise
   * @throws {Error} If the store has been disposed
   */
  isExpired(key: K): boolean {
    this.#checkDisposed();

    const expiry = this.#ttlMap.get(key);
    if (expiry === undefined) {
      // If no TTL is set and the global TTL is greater than 0,
      // use the global TTL as the default
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
   * Sets a value in the store.
   *
   * @param key - The key to set
   * @param value - The value to store
   * @returns The Store instance for chaining
   * @throws {Error} If the store has been disposed
   *
   * @remarks
   * - May trigger item eviction if the store size exceeds maxSize
   * - Updates the access time for the key when using LRU eviction strategy
   *
   * @override Overrides Map.set
   */
  override set(key: K, value: V): this {
    this.#checkDisposed();

    // Ensure there's room for the new item
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
    return this;
  }

  /**
   * Removes an item from the store.
   *
   * @param key - The key to delete
   * @returns true if an element was removed, false otherwise
   * @throws {Error} If the store has been disposed
   *
   * @remarks
   * Also removes the key from internal TTL and LRU trackers
   *
   * @override Overrides Map.delete
   */
  override delete(key: K): boolean {
    this.#checkDisposed();

    this.#ttlMap.delete(key);
    this.#lruTracker?.delete(key);
    return super.delete(key);
  }

  /**
   * Removes all items from the store.
   *
   * @throws {Error} If the store has been disposed
   *
   * @remarks
   * Also clears the internal TTL and LRU trackers
   *
   * @override Overrides Map.clear
   */
  override clear(): void {
    this.#checkDisposed();

    super.clear();
    this.#ttlMap.clear();
    this.#lruTracker?.clear();
  }

  /**
   * Maps each value in the store to a new value using the provided callback function.
   *
   * @param callback - Function to execute on each entry
   * @param callback.value - The current value being processed
   * @param callback.key - The key of the current value being processed
   * @param callback.store - The store instance
   * @returns Array containing the results of the callback function
   * @throws {Error} If the store has been disposed
   *
   * @example
   * // Get an array of all user names
   * const userNames = store.map(user => user.name);
   */
  map<R>(callback: (value: V, key: K, store: this) => R): R[] {
    this.#checkDisposed();

    return Array.from(this, ([key, value]) => callback(value, key, this));
  }

  /**
   * Returns a new Store with entries sorted according to the provided compare function.
   *
   * @param compareFn - Function to determine the sort order
   * @returns A new Store instance with sorted entries
   * @throws {Error} If the store has been disposed
   *
   * @example
   * // Sort users by age
   * const sortedUsers = store.sort((a, b) => a.age - b.age);
   */
  sort(compareFn?: (a: V, b: V) => number): Store<K, V> {
    this.#checkDisposed();

    const sorted = [...this.entries()].sort(
      ([, a], [, b]) => compareFn?.(a, b) ?? String(a).localeCompare(String(b)),
    );
    return new Store(sorted, this.#options);
  }

  /**
   * Returns a subset of values for pagination.
   *
   * @param page - The page number (0-based)
   * @param pageSize - The number of items per page
   * @returns Array of values for the requested page
   * @throws {Error} If page is negative, pageSize is not positive, or the store has been disposed
   *
   * @example
   * // Get the first page with 10 items per page
   * const firstPage = store.slice(0, 10);
   *
   * // Get the second page
   * const secondPage = store.slice(1, 10);
   */
  slice(page = 0, pageSize = 10): V[] {
    this.#checkDisposed();

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
   *
   * @returns Array of all values in the store
   * @throws {Error} If the store has been disposed
   */
  toArray(): V[] {
    this.#checkDisposed();
    return [...this.values()];
  }

  /**
   * Returns all keys in the store as an array.
   *
   * @returns Array of all keys in the store
   * @throws {Error} If the store has been disposed
   */
  keysArray(): K[] {
    this.#checkDisposed();
    return [...this.keys()];
  }

  /**
   * Returns all entries in the store as an array of [key, value] pairs.
   *
   * @returns Array of all entries in the store
   * @throws {Error} If the store has been disposed
   */
  entriesArray(): [K, V][] {
    this.#checkDisposed();
    return [...this.entries()];
  }

  /**
   * Cleans up all resources used by the store and prevents further operations.
   * This method should be called when the store is no longer needed to prevent memory leaks.
   *
   * @remarks
   * - Stops the cleanup interval timer
   * - Clears all internal data structures
   * - Properly disposes of LRU tracker resources
   * - Marks the store as disposed to prevent further use
   *
   * @example
   * // Manual cleanup
   * const store = new Store({ maxSize: 100, ttl: 60000 });
   * // ... use store ...
   * store.destroy();
   *
   * @example
   * // Automatic cleanup with using declaration
   * using store = new Store({ maxSize: 100 });
   * // Store will be automatically destroyed when it goes out of scope
   */
  destroy(): void {
    if (this.#disposed) {
      return;
    }

    // Stop cleanup interval
    if (this.#cleanupInterval) {
      clearInterval(this.#cleanupInterval);
      this.#cleanupInterval = null;
    }

    // Clear all data and properly dispose of LRU tracker
    this.clear();

    // Mark as disposed
    this.#disposed = true;
  }

  /**
   * Symbol.dispose implementation for automatic cleanup in `using` declarations.
   * This is part of the explicit resource management proposal.
   *
   * @example
   * using store = new Store({ maxSize: 100 });
   * // Store will be automatically disposed when it goes out of scope
   */
  [Symbol.dispose](): void {
    this.destroy();
  }

  /**
   * Sets multiple entries in the store at once.
   *
   * @param entries - The entries to set
   * @private
   */
  #bulkSet(entries: readonly (readonly [K, V])[]): void {
    for (const [key, value] of entries) {
      this.set(key, value);
    }
  }

  /**
   * Starts an interval to periodically clean up expired items.
   * Uses WeakRef to prevent the interval from holding a strong reference to the store.
   *
   * @private
   */
  #startCleanupInterval(): void {
    const cleanupInterval = Math.max(
      Math.min(this.#options.ttl / 2, 60000),
      this.#options.expirationCheckInterval,
    );

    // Use WeakRef to prevent strong reference cycle
    const storeRef = this.#selfRef;

    this.#cleanupInterval = setInterval(() => {
      const store = storeRef.deref();
      if (store && !store.#disposed) {
        store.#cleanup();
      } else if (this.#cleanupInterval) {
        // Store has been garbage collected or disposed, clear the interval
        clearInterval(this.#cleanupInterval);
      }
    }, cleanupInterval);

    // Force an immediate cleanup run
    this.#cleanup();
  }

  /**
   * Removes all expired items from the store.
   *
   * @private
   */
  #cleanup(): void {
    if (this.#disposed) {
      return;
    }

    const now = Date.now();
    const expiredKeys: K[] = [];

    // First, identify all expired keys
    for (const [key, expiry] of this.#ttlMap.entries()) {
      if (now >= expiry) {
        expiredKeys.push(key);
      }
    }

    // Then, remove them
    for (const key of expiredKeys) {
      this.delete(key);
    }
  }

  /**
   * Updates the last access time for a key when using the LRU eviction strategy.
   *
   * @param key - The key that was accessed
   * @private
   */
  #updateAccessTime(key: K): void {
    if (this.#options.evictionStrategy === "lru" && this.#lruTracker) {
      this.#lruTracker.touch(key);
    }
  }

  /**
   * Evicts an item if the store has reached its maximum size.
   * Uses the configured eviction strategy (LRU or FIFO).
   *
   * @private
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
   * Evicts the least recently used item.
   *
   * @private
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
   *
   * @private
   */
  #evictFifo(): void {
    const firstKey = this.keys().next().value;
    if (firstKey) {
      this.delete(firstKey);
    }
  }

  /**
   * Checks if a value matches a pattern of key-value pairs.
   *
   * @param value - The value to check
   * @param pattern - The pattern to match against
   * @returns true if the value matches the pattern, false otherwise
   * @private
   */
  #matchesPattern(value: V, pattern: [string, unknown][]): boolean {
    if (typeof value !== "object" || value === null) {
      return false;
    }

    return pattern.every(([path, expectedValue]) => {
      const actualValue = get(value, path);

      // Handle array contains checks
      if (Array.isArray(actualValue)) {
        if (Array.isArray(expectedValue)) {
          // Check if arrays are equal (all elements match)
          return (
            expectedValue.length === actualValue.length &&
            expectedValue.every((v) => actualValue.includes(v))
          );
        }
        // Check if array contains value
        return actualValue.includes(expectedValue);
      }

      // Default equality check
      return actualValue === expectedValue;
    });
  }

  /**
   * Checks if the store has been disposed and throws an error if it has.
   *
   * @throws {Error} If the store has been disposed
   * @private
   */
  #checkDisposed(): void {
    if (this.#disposed) {
      throw new Error("Store has been disposed and cannot be used");
    }
  }
}
