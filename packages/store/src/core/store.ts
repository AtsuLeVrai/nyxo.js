import { deepmerge } from "deepmerge-ts";
import { cloneDeep, unset } from "lodash-es";
import { z } from "zod/v4";
import { LruTracker } from "../utils/index.js";

/**
 * A predicate function for finding or filtering items in the store.
 *
 * Receives both the value and key, allowing filtering based on data content or key patterns.
 *
 * @typeParam K - The type of keys in the store
 * @typeParam V - The type of values in the store
 *
 * @param value - The stored value to evaluate
 * @param key - The key associated with the value
 * @returns `true` if the item matches the criteria, `false` otherwise
 *
 * @example
 * ```typescript
 * // Filter by value content
 * const userPredicate: StorePredicate<string, User> = (user) => user.age >= 18;
 *
 * // Filter by key pattern
 * const keyPredicate: StorePredicate<string, any> = (_, key) => key.startsWith('cache:');
 *
 * // Combined filtering
 * const complexPredicate: StorePredicate<string, User> = (user, key) =>
 *   user.active && key.includes(user.department);
 * ```
 *
 * @public
 */
export type StorePredicate<K extends PropertyKey, V> = (
  value: V,
  key: K,
) => boolean;

/**
 * Configuration schema and options for the Store class.
 *
 * These options control store behavior including memory management,
 * caching strategies, expiration policies, and performance tuning.
 *
 * @example
 * ```typescript
 * const config: StoreOptions = {
 *   maxSize: 5000,
 *   ttl: 30000, // 30 seconds
 *   evictionStrategy: "lru",
 *   sweepInterval: 10000, // 10 seconds
 *   sweepChunkSize: 50
 * };
 * ```
 *
 * @public
 */
export const StoreOptions = z.object({
  /**
   * Maximum number of items to retain before triggering eviction.
   *
   * When this limit is reached, the store automatically removes items based on the
   * configured eviction strategy. Setting to 0 disables size-based eviction.
   *
   * @default 10000
   * @minimum 0
   */
  maxSize: z.number().int().nonnegative().default(10000),

  /**
   * Time-to-live duration in milliseconds for automatic item expiration.
   *
   * Items are considered expired after this duration and are removed when accessed
   * or during background sweeps. Setting to 0 disables automatic expiration.
   *
   * @default 0 (no expiration)
   * @minimum 0
   * @unit milliseconds
   */
  ttl: z.number().int().nonnegative().default(0),

  /**
   * Algorithm for determining which items to evict when `maxSize` is reached.
   *
   * **LRU (Least Recently Used)** - Evicts items that haven't been accessed recently.
   * Best for caches and frequently accessed data.
   *
   * **FIFO (First In, First Out)** - Evicts the oldest items first.
   * Simpler with lower overhead, good for temporary storage.
   *
   * @default "lru"
   */
  evictionStrategy: z.enum(["fifo", "lru"]).default("lru"),

  /**
   * Interval in milliseconds between automatic sweeps for expired items.
   *
   * Background process that removes expired items to prevent memory leaks.
   * Lower values provide faster cleanup but higher CPU overhead.
   *
   * @default 15000 (15 seconds)
   * @minimum 1
   * @unit milliseconds
   */
  sweepInterval: z.number().int().positive().default(15000),

  /**
   * Number of items to process in each sweep operation chunk.
   *
   * Sweep operations are divided into chunks to prevent blocking the event loop.
   * Smaller chunks are more responsive, larger chunks are more efficient.
   *
   * @default 100
   * @minimum 1
   */
  sweepChunkSize: z.number().int().positive().default(100),
});

/**
 * Type definition for validated store configuration options.
 *
 * This type represents the parsed and validated configuration after processing
 * through the Zod schema, with all defaults applied and types resolved.
 *
 * @public
 */
export type StoreOptions = z.infer<typeof StoreOptions>;

/**
 * High-performance Map implementation with advanced caching capabilities.
 *
 * Extends the native JavaScript Map with enterprise-grade features including
 * automatic expiration (TTL), intelligent eviction strategies, memory management,
 * and object manipulation utilities.
 *
 * @typeParam K - The type of keys in the store, must extend StoreKey
 * @typeParam V - The type of values stored
 *
 * @example
 * ```typescript
 * const cache = new Store<string, User>({
 *   maxSize: 1000,
 *   ttl: 5 * 60 * 1000, // 5 minutes
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
   * Only created when using LRU strategy with size limits.
   *
   * @internal
   */
  #lruTracker: LruTracker<K> | null = null;

  /**
   * Timer handle for the next scheduled background sweep operation.
   * Set when TTL is enabled, cleared when store is destroyed.
   *
   * @internal
   */
  #sweepTimeout: NodeJS.Timeout | null = null;

  /**
   * Flag indicating whether the store has been explicitly destroyed.
   * Prevents new sweep operations after cleanup.
   *
   * @internal
   */
  #isDestroyed = false;

  /**
   * Internal map tracking expiration timestamps for items with TTL.
   * Entries are added when TTL is set, removed when items are deleted.
   *
   * @readonly
   * @internal
   */
  readonly #ttlMap = new Map<K, number>();

  /**
   * Immutable configuration options for this Store instance.
   * Parsed and validated during construction with defaults applied.
   *
   * @readonly
   * @internal
   */
  readonly #options: StoreOptions;

  /**
   * Creates a new Store instance with comprehensive configuration options.
   *
   * @param options - Configuration options controlling store behavior
   *
   * @throws {Error} Configuration validation fails or contains invalid values
   *
   * @example
   * ```typescript
   * // Basic cache with sensible defaults
   * const cache = new Store<string, any>();
   *
   * // Configured for high-performance web application
   * const webCache = new Store<string, APIResponse>({
   *   maxSize: 5000,
   *   ttl: 10 * 60 * 1000, // 10 minutes
   *   evictionStrategy: "lru"
   * });
   * ```
   *
   * @public
   */
  constructor(options: z.input<typeof StoreOptions> = {}) {
    // Initialize the parent Map class with empty state
    super();

    // Parse and validate options, applying defaults for missing values
    try {
      this.#options = StoreOptions.parse(options);
    } catch (error) {
      // Clean up the partially initialized store to prevent memory leaks
      this.destroy();

      // Convert Zod validation errors to more readable format for developers
      if (error instanceof z.ZodError) {
        throw new Error(z.prettifyError(error));
      }

      // Re-throw any other validation errors with additional context
      throw new Error(`Store configuration validation failed: ${error}`);
    }

    // Initialize LRU tracker if using LRU eviction strategy and size limit is set
    // This is deferred initialization to avoid overhead when not needed
    if (this.#options.evictionStrategy === "lru" && this.#options.maxSize > 0) {
      this.#lruTracker = new LruTracker<K>(this.#options.maxSize);
    }

    // Start automatic TTL sweep if expiration is enabled
    // Uses setTimeout for better resource management than setInterval
    if (this.#options.ttl > 0) {
      this.#scheduleSweep();
    }
  }

  /**
   * Efficiently populates the store with multiple key-value pairs in a single operation.
   *
   * @param entries - Array of [key, value] tuples to add to the store
   * @returns The Store instance for method chaining
   *
   * @throws {Error} Input is not an array or contains invalid tuple formats
   *
   * @example
   * ```typescript
   * const userStore = new Store<string, User>();
   * const usersFromDB = [
   *   ["user:1", { id: 1, name: "Alice", email: "alice@example.com" }],
   *   ["user:2", { id: 2, name: "Bob", email: "bob@example.com" }]
   * ];
   * userStore.populate(usersFromDB);
   * ```
   *
   * @see {@link set} - For adding individual entries
   * @see {@link add} - For merging entries with existing data
   *
   * @public
   */
  populate(entries: (readonly [K, V])[]): this {
    // Validate input parameter type early to provide clear error messages
    if (!Array.isArray(entries)) {
      throw new Error("Entries must be an array of [key, value] tuples");
    }

    // Early return for empty arrays to avoid unnecessary processing
    // This is a common case and should be optimized
    if (entries.length === 0) {
      return this;
    }

    // Process each entry through the standard set() method to ensure
    // all store policies (TTL, eviction, validation) are properly applied
    // This approach maintains consistency and reduces code duplication
    for (const entry of entries) {
      // Validate that each entry is a proper [key, value] tuple
      // Provides detailed error information for debugging
      if (!Array.isArray(entry) || entry.length !== 2) {
        throw new Error(
          `Invalid entry format: expected [key, value] tuple, got ${JSON.stringify(entry)}`,
        );
      }

      const [key, value] = entry;

      // Use the standard set method to ensure all store logic is applied
      // This includes eviction, TTL setup, and LRU tracking
      this.set(key, value);
    }

    return this;
  }

  /**
   * Intelligently adds or updates a value with sophisticated merging capabilities.
   *
   * Automatically determines the appropriate merge strategy based on data types.
   * Objects are deep merged, primitives are replaced.
   *
   * @param key - The key to add or update
   * @param value - The value to add or merge with the existing value
   * @returns The Store instance for method chaining
   *
   * @example
   * ```typescript
   * store.set("user:123", { name: "John", age: 30 });
   * store.add("user:123", { age: 31, city: "NYC" });
   * // Result: { name: "John", age: 31, city: "NYC" }
   * ```
   *
   * @see {@link set} - For direct value replacement
   * @see {@link remove} - For removing specific properties
   *
   * @public
   */
  add(key: K, value: V | Partial<V>): this {
    // If key doesn't exist, simply add the value directly
    // This is equivalent to calling set() but avoids unnecessary merge logic
    if (!this.has(key)) {
      return this.set(key, value as V);
    }

    // Retrieve the existing value for merging
    // has() check above ensures this will not be undefined
    const existingValue = this.get(key) as V;

    // If either existing or new value is not an object, replace directly
    // This handles primitives, null, arrays, and other non-object types
    if (
      typeof existingValue !== "object" ||
      existingValue === null ||
      typeof value !== "object" ||
      value === null
    ) {
      return this.set(key, value as V);
    }

    // Analyze the structure to determine merge strategy
    // Check if the new value contains nested objects that would benefit from deep merge
    const hasNestedObjects = Object.values(value).some(
      (v) => typeof v === "object" && v !== null,
    );

    // If neither value has nested objects, perform a shallow merge for better performance
    if (!hasNestedObjects) {
      const merged = { ...existingValue, ...value } as V;
      return this.set(key, merged);
    }

    // Perform deep merge for complex nested structures
    // Uses deepmerge library for sophisticated merging logic
    const mergedValue = deepmerge(existingValue, value) as V;
    return this.set(key, mergedValue);
  }

  /**
   * Removes specific properties from an object stored at the given key.
   *
   * Supports dot notation for nested paths and creates a deep copy to avoid mutations.
   *
   * @param key - The key of the item to modify
   * @param paths - Property path(s) to remove (supports dot notation and arrays)
   * @returns The Store instance for method chaining
   *
   * @throws {Error} Key doesn't exist in the store
   * @throws {Error} Stored value is not an object (cannot remove properties)
   *
   * @example
   * ```typescript
   * store.set("user", { name: "John", profile: { age: 30, city: "NYC" } });
   *
   * // Remove nested property
   * store.remove("user", "profile.age");
   *
   * // Remove multiple properties
   * store.remove("user", ["name", "profile.city"]);
   * ```
   *
   * @see {@link add} - For adding or updating object properties
   * @see {@link set} - For complete object replacement
   * @see {@link get} - For retrieving the modified object
   *
   * @public
   */
  remove(key: K, paths: (string | keyof V)[] | string | keyof V): this {
    // Validate that the key exists in the store
    if (!this.has(key)) {
      throw new Error(`Key not found: ${String(key)}`);
    }

    // Retrieve the value and validate it's an object
    const value = this.get(key);
    if (typeof value !== "object" || value === null) {
      throw new Error(
        `Cannot remove properties from non-object value at key: ${String(key)}`,
      );
    }

    // Create deep copy to avoid modifying the original object
    // This ensures data integrity and prevents unintended side effects
    const newValue = cloneDeep(value);

    // Normalize paths to array format for consistent processing
    const pathsArray = Array.isArray(paths) ? paths : [paths];

    // Remove each specified path using lodash unset for robust path handling
    // Lodash handles complex nested paths and edge cases automatically
    for (const path of pathsArray) {
      unset(newValue, path as string);
    }

    // Store the modified object back in the store
    this.set(key, newValue as V);
    return this;
  }

  /**
   * Finds the first value in the store that matches the provided predicate function.
   *
   * @param predicate - Function that tests each value-key pair for a condition
   * @returns The first matching value, or `undefined` if no match is found
   *
   * @example
   * ```typescript
   * const alice = userStore.find((user) => user.name === "Alice");
   * const firstUser = userStore.find((_, key) => key.startsWith("user:"));
   * ```
   *
   * @see {@link filter} - For finding all matching items
   * @see {@link has} - For simple key existence checking
   *
   * @public
   */
  find(predicate: StorePredicate<K, V>): V | undefined {
    // Iterate through all store entries in insertion order
    for (const [key, value] of this) {
      // Apply the predicate function to test the current entry
      if (predicate(value, key)) {
        // Update access time for LRU tracking when item is found
        // This ensures recently accessed items are less likely to be evicted
        this.#updateAccessTime(key);
        return value;
      }
    }

    // No matching item was found
    return undefined;
  }

  /**
   * Returns an array of all values in the store that match the provided predicate function.
   *
   * @param predicate - Function that tests each value-key pair for inclusion
   * @returns Array of all matching values (empty array if no matches)
   *
   * @example
   * ```typescript
   * const engineers = userStore.filter((user) => user.department === "Engineering");
   * const activeUsers = userStore.filter((user) => user.active && user.age >= 30);
   * ```
   *
   * @see {@link find} - For finding only the first matching item
   * @see {@link has} - For checking existence of specific keys
   *
   * @public
   */
  filter(predicate: StorePredicate<K, V>): V[] {
    // Initialize results array for collecting matching values
    const results: V[] = [];

    // Iterate through all store entries to find matches
    for (const [key, value] of this) {
      // Test each entry against the predicate condition
      if (predicate(value, key)) {
        // Update access time for LRU tracking when item matches
        // This ensures recently accessed items are less likely to be evicted
        this.#updateAccessTime(key);

        // Add the matching value to the results
        results.push(value);
      }
    }

    return results;
  }

  /**
   * Sets a value in the store with a custom TTL (Time-To-Live) duration.
   *
   * @param key - The key to set
   * @param value - The value to store
   * @param ttl - Time to live in milliseconds from now
   * @returns The Store instance for method chaining
   *
   * @throws {Error} TTL value is negative (must be 0 or positive)
   *
   * @example
   * ```typescript
   * // VIP session with extended TTL (2 hours)
   * sessionStore.setWithTtl("session:vip",
   *   { userId: 456, role: "admin" },
   *   2 * 60 * 60 * 1000
   * );
   * ```
   *
   * @see {@link set} - For setting values with default TTL
   * @see {@link isExpired} - For checking if an item has expired
   *
   * @public
   */
  setWithTtl(key: K, value: V, ttl: number): this {
    // Validate TTL parameter to prevent invalid expiration times
    if (ttl < 0) {
      throw new Error(`TTL cannot be negative: ${ttl}`);
    }

    // Calculate absolute expiration time from current timestamp
    const expiryTime = Date.now() + ttl;

    // Store the expiration time in the TTL tracking map
    // This will override any existing TTL for this key
    this.#ttlMap.set(key, expiryTime);

    // Use the standard set method to store the value
    // This ensures all other store policies are applied correctly
    return this.set(key, value);
  }

  /**
   * Checks whether an item has exceeded its TTL and should be considered expired.
   *
   * @param key - The key to check for expiration
   * @returns `true` if the item has expired, `false` if still valid or no TTL is set
   *
   * @example
   * ```typescript
   * if (!cache.isExpired("api:users")) {
   *   const cachedUsers = cache.get("api:users");
   *   return cachedUsers; // Use cached data
   * } else {
   *   // Fetch fresh data from API
   * }
   * ```
   *
   * @see {@link setWithTtl} - For setting custom TTL values
   * @see {@link get} - Automatically removes expired items when accessed
   *
   * @public
   */
  isExpired(key: K): boolean {
    // Attempt to get the explicit expiration time for this key
    const expiry = this.#ttlMap.get(key);

    if (expiry === undefined) {
      // Handle items without explicit TTL
      if (this.#options.ttl > 0 && super.has(key) && !this.#ttlMap.has(key)) {
        // For existing keys without explicit TTL, assign the default TTL
        // This ensures consistent behavior for items added before TTL was configured
        this.#ttlMap.set(key, Date.now() + this.#options.ttl);
        return false; // Newly assigned TTL means item is not expired yet
      }

      // No TTL configured or key doesn't exist - never expires
      return false;
    }

    // Compare current time with stored expiration time
    return Date.now() >= expiry;
  }

  /**
   * Completely destroys the store and cleans up all associated resources.
   *
   * @example
   * ```typescript
   * const cache = new Store({ maxSize: 1000 });
   * try {
   *   // Use the cache...
   * } finally {
   *   cache.destroy(); // Explicit resource cleanup
   * }
   * ```
   *
   * @see {@link Symbol.dispose} - For automatic resource management
   * @see {@link clear} - For removing data while keeping the store functional
   *
   * @public
   */
  destroy(): void {
    // Mark as destroyed to prevent new sweep scheduling and operations
    this.#isDestroyed = true;

    // Stop periodic sweep timeout to prevent memory leaks and unnecessary operations
    if (this.#sweepTimeout) {
      clearTimeout(this.#sweepTimeout);
      this.#sweepTimeout = null;
    }

    // Clean up LRU tracker if it exists
    if (this.#lruTracker) {
      // Clear all access tracking data and dispose of internal structures
      this.#lruTracker.clear();
      this.#lruTracker = null;
    }

    // Clear the TTL map to remove all expiration tracking
    if (this.#ttlMap) {
      this.#ttlMap.clear();
    }

    // Clear all stored data from the underlying Map
    super.clear();
  }

  /**
   * Retrieves a value from the store with automatic expiration handling and LRU tracking.
   *
   * @param key - The key to look up in the store
   * @returns The value associated with the key, or `undefined` if not found or expired
   *
   * @example
   * ```typescript
   * const user = cache.get("user:123");
   * if (user) {
   *   console.log(`Found user: ${user.name}`);
   * }
   * ```
   *
   * @see {@link set} - For storing values in the store
   * @see {@link has} - For existence checking without retrieving values
   *
   * @public
   */
  override get(key: K): V | undefined {
    // Perform occasional passive sweep (1% chance) to maintain store health
    // This helps clean up expired items without dedicated background processes
    if (Math.random() < 0.01) {
      this.#sweep();
    }

    // Check expiration first and remove if expired
    // This ensures expired items are never returned to callers
    if (this.isExpired(key)) {
      this.delete(key);
      return undefined;
    }

    // Retrieve the value using the parent Map's get method
    const value = super.get(key);

    // Update access time for LRU tracking if value exists
    // This ensures recently accessed items are less likely to be evicted
    if (value !== undefined) {
      this.#updateAccessTime(key);
      return value;
    }

    return undefined;
  }

  /**
   * Checks if a key exists in the store and is not expired.
   *
   * @param key - The key to check for existence
   * @returns `true` if the key exists and is not expired, `false` otherwise
   *
   * @example
   * ```typescript
   * if (cache.has("session:abc123")) {
   *   console.log("Session is active");
   * } else {
   *   console.log("Session expired or doesn't exist");
   * }
   * ```
   *
   * @see {@link get} - For retrieving values (includes LRU tracking)
   * @see {@link isExpired} - For explicit expiration checking without removal
   *
   * @public
   */
  override has(key: K): boolean {
    // First check if the item has expired
    if (this.isExpired(key)) {
      // If expired, delete it and return false
      // This maintains store consistency by removing stale data
      this.delete(key);
      return false;
    }

    // If not expired, use the parent Map's has method for existence check
    return super.has(key);
  }

  /**
   * Sets a value in the store with comprehensive automatic management.
   *
   * @param key - The key to set
   * @param value - The value to store
   * @returns The Store instance for method chaining
   *
   * @example
   * ```typescript
   * cache.set("product:123", { id: 123, name: "Laptop", price: 999 });
   *
   * // Chaining operations
   * cache
   *   .set("product:124", { id: 124, name: "Mouse", price: 29 })
   *   .set("product:125", { id: 125, name: "Keyboard", price: 79 });
   * ```
   *
   * @see {@link setWithTtl} - For setting values with custom TTL
   * @see {@link add} - For intelligent merging with existing values
   *
   * @public
   */
  override set(key: K, value: V): this {
    // Ensure there's room for the new item by evicting if necessary
    // Only evict when adding new keys (not updating existing ones)
    if (
      this.#options.maxSize > 0 &&
      this.size >= this.#options.maxSize &&
      !this.has(key)
    ) {
      this.#evict();
    }

    // Set default TTL if global TTL is enabled and no custom TTL exists for this key
    // This ensures consistent expiration behavior for all items
    if (this.#options.ttl > 0 && !this.#ttlMap.has(key)) {
      this.#ttlMap.set(key, Date.now() + this.#options.ttl);
    }

    // Store the value using the parent Map's set method
    super.set(key, value);

    // Update access time for LRU tracking
    // This ensures recently set items are considered "accessed"
    this.#updateAccessTime(key);

    // Schedule sweep if TTL is enabled and not already scheduled
    // This ensures background cleanup runs when needed
    if (this.#options.ttl > 0 && !this.#sweepTimeout && !this.#isDestroyed) {
      this.#scheduleSweep();
    }

    return this;
  }

  /**
   * Removes an item from the store and cleans up all associated metadata.
   *
   * @param key - The key to delete from the store
   * @returns `true` if an element was removed, `false` if the key didn't exist
   *
   * @example
   * ```typescript
   * const deleted = cache.delete("user:123");
   * console.log(deleted); // true or false
   * ```
   *
   * @see {@link clear} - For removing all items from the store
   * @see {@link has} - For checking existence before deletion
   *
   * @public
   */
  override delete(key: K): boolean {
    // Check if the key exists in the store before attempting deletion
    const existed = super.has(key);
    if (!existed) {
      return false;
    }

    // Delete the item from the main store
    const result = super.delete(key);

    // Clean up associated TTL metadata to prevent memory leaks
    if (this.#ttlMap.size > 0) {
      this.#ttlMap.delete(key);
    }

    // Clean up LRU tracker metadata if it exists
    if (this.#lruTracker) {
      this.#lruTracker.delete(key);
    }

    return result;
  }

  /**
   * Removes all items from the store and clears all associated metadata.
   *
   * @example
   * ```typescript
   * cache.clear();
   * console.log(cache.size); // 0
   *
   * // Store remains functional
   * cache.set("new:data", { fresh: true });
   * ```
   *
   * @see {@link delete} - For removing individual items
   * @see {@link destroy} - For complete store destruction with cleanup
   *
   * @public
   */
  override clear(): void {
    // Clear all items from the main store
    super.clear();

    // Clear all TTL metadata to prevent memory leaks
    if (this.#ttlMap) {
      this.#ttlMap.clear();
    }

    // Clear the LRU tracker if it exists, resetting access patterns
    if (this.#lruTracker) {
      this.#lruTracker.clear();
    }
  }

  /**
   * Enables synchronous iteration over store entries with automatic expiration cleanup.
   *
   * @returns IterableIterator yielding [key, value] pairs for non-expired items
   *
   * @example
   * ```typescript
   * // Basic iteration
   * for (const [key, user] of cache) {
   *   console.log(`${key}: ${user.name}`);
   * }
   *
   * // Convert to array
   * const allUsers = [...cache];
   * ```
   *
   * @see {@link keys} - For iterating over keys only
   * @see {@link values} - For iterating over values only
   *
   * @public
   */
  override *[Symbol.iterator](): MapIterator<[K, V]> {
    for (const [key, value] of super[Symbol.iterator]()) {
      // Check expiration during iteration
      if (!this.isExpired(key)) {
        yield [key, value];
      } else {
        // Clean up expired items during iteration
        this.delete(key);
      }
    }
  }

  /**
   * Symbol.dispose implementation for automatic resource management.
   *
   * @example
   * ```typescript
   * {
   *   using cache = new Store<string, Data>({ maxSize: 100 });
   *   // Use the cache normally
   *   // Cache is automatically destroyed when leaving this scope
   * }
   * ```
   *
   * @see {@link destroy} - For manual resource cleanup
   *
   * @public
   */
  [Symbol.dispose](): void {
    this.destroy();
  }

  /**
   * Enables asynchronous iteration over store entries with non-blocking behavior.
   *
   * @returns AsyncIterableIterator yielding [key, value] pairs asynchronously
   *
   * @example
   * ```typescript
   * for await (const [id, document] of cache) {
   *   await processDocument(document);
   * }
   * ```
   *
   * @see {@link Symbol.iterator} - For synchronous iteration
   * @see {@link entries} - For explicit entry access
   *
   * @public
   */
  async *[Symbol.asyncIterator](): AsyncIterableIterator<[K, V]> {
    for (const [key, value] of this) {
      yield [key, value];

      // Yield control periodically for large stores to prevent blocking
      // 1% probability provides good balance between performance and responsiveness
      if (Math.random() < 0.01) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }
  }

  /**
   * Schedules the next background sweep operation for expired item cleanup.
   *
   * Uses setTimeout instead of setInterval for better resource management and self-regulating behavior.
   * Only schedules when TTL is enabled and sweep is not already scheduled.
   *
   * @internal
   */
  #scheduleSweep(): void {
    // Don't schedule if already destroyed or sweep is already scheduled
    if (this.#isDestroyed || this.#sweepTimeout) {
      return;
    }

    // Schedule next sweep operation using setTimeout for better resource management
    this.#sweepTimeout = setTimeout(() => {
      // Clear the timeout reference to allow new scheduling
      this.#sweepTimeout = null;

      // Only perform sweep if store hasn't been destroyed
      if (!this.#isDestroyed) {
        this.#sweep();

        // Reschedule if there are still items with TTL and store is active
        if (this.#ttlMap.size > 0 && !this.#isDestroyed) {
          this.#scheduleSweep();
        }
      }
    }, this.#options.sweepInterval);
  }

  /**
   * Performs background sweep operation to remove expired items from the store.
   *
   * Implements chunked processing to avoid blocking the event loop during large cleanup operations.
   * Processes items in configurable chunks with asynchronous continuation for remaining work.
   *
   * @internal
   */
  #sweep(): void {
    // Early exit if destroyed or no TTL items to process
    if (this.#isDestroyed || this.#ttlMap.size === 0) {
      return;
    }

    const now = Date.now();
    const expiredKeys: K[] = [];
    let processed = 0;

    // Iterate through TTL map to identify expired items
    for (const [key, expiry] of this.#ttlMap.entries()) {
      // Check if item has expired
      if (now >= expiry) {
        expiredKeys.push(key);
      }

      processed++;

      // Process in chunks to avoid blocking the event loop
      if (processed >= this.#options.sweepChunkSize) {
        // Process current batch of expired items
        if (expiredKeys.length > 0) {
          setTimeout(() => this.#sweepBatch(expiredKeys), 0);
        }

        // Schedule continuation of sweep operation
        setTimeout(() => this.#sweep(), 0);
        return;
      }
    }

    // Process final batch of expired items
    this.#sweepBatch(expiredKeys);
  }

  /**
   * Processes a batch of expired keys for removal during sweep operations.
   *
   * Handles actual deletion of expired items using the standard delete() method
   * to ensure complete cleanup including metadata removal.
   *
   * @param keys - Array of expired keys to delete in this batch
   * @internal
   */
  #sweepBatch(keys: K[]): void {
    // Delete each expired key using the standard delete method
    // This ensures complete cleanup including metadata removal
    for (const key of keys) {
      this.delete(key);
    }
  }

  /**
   * Updates the access time for a key when using LRU eviction strategy.
   *
   * Manages LRU tracking with lazy initialization to avoid overhead when using FIFO strategy.
   * Only operates when LRU strategy is configured and size limits are set.
   *
   * @param key - The key that was accessed and needs tracking update
   * @internal
   */
  #updateAccessTime(key: K): void {
    // Only update access time when using LRU eviction strategy
    if (this.#options.evictionStrategy === "lru") {
      // Lazy initialization of LRU tracker if needed
      if (!this.#lruTracker && this.#options.maxSize > 0) {
        this.#lruTracker = new LruTracker<K>(this.#options.maxSize);
      }

      // Update access time for the key (touch operation)
      this.#lruTracker?.touch(key);
    }
  }

  /**
   * Evicts items from the store when maximum size limit is reached.
   *
   * Delegates to the appropriate eviction strategy (LRU or FIFO) based on configuration.
   * Only operates when size limits are configured and exceeded.
   *
   * @internal
   */
  #evict(): void {
    // Early return if no size limit or under limit
    if (this.#options.maxSize <= 0 || this.size < this.#options.maxSize) {
      return;
    }

    // Delegate to appropriate eviction strategy
    if (this.#options.evictionStrategy === "lru") {
      this.#evictLru();
    } else {
      this.#evictFifo();
    }
  }

  /**
   * Evicts the least recently used item using LRU tracking information.
   *
   * Identifies and removes the item with the oldest access time. Falls back to FIFO
   * eviction if LRU tracker is unavailable or empty.
   *
   * @internal
   */
  #evictLru(): void {
    // Check if LRU tracker is available and has data
    if (!this.#lruTracker || this.#lruTracker.size === 0) {
      // Fall back to FIFO if LRU tracker is not available or empty
      this.#evictFifo();
      return;
    }

    // Get the least recently used key from the tracker
    const leastUsedKey = this.#lruTracker.lru;
    if (leastUsedKey) {
      // Delete the least recently used item
      this.delete(leastUsedKey);
    } else {
      // Fall back to FIFO if no LRU key is available
      this.#evictFifo();
    }
  }

  /**
   * Evicts the oldest item using FIFO (First-In-First-Out) strategy.
   *
   * Removes the item that was added earliest to the store using Map's insertion order guarantee.
   * Provides reliable fallback eviction when LRU is not available.
   *
   * @internal
   */
  #evictFifo(): void {
    // Get the first key from the store (oldest item)
    const firstKey = this.keys().next().value;
    if (firstKey) {
      // Delete the oldest item
      this.delete(firstKey);
    }
  }
}
