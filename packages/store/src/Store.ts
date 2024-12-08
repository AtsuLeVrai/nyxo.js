import {
  type AggregateOptions,
  type AsyncFilterOptions,
  type AsyncMapOptions,
  type DataFormat,
  type LoadAsyncOptions,
  type PersistedStoreData,
  type SearchOptions,
  SetOperation,
  type SliceOptions,
  type StoreKey,
  type StorePredicate,
  type StoreValue,
  type ToOptions,
  type ToReturnType,
  type TransformOptions,
} from "./types.js";

/**
 * A flexible key-value store that extends Map with additional utility methods.
 *
 * @typeParam K - The type of keys in the store
 * @typeParam V - The type of values in the store
 *
 * @remarks
 * Store provides enhanced functionality over the standard Map class, including:
 * - Data conversion to different formats
 * - Advanced filtering and searching
 * - Aggregation and transformation operations
 * - Collection manipulation methods
 *
 * @example
 * ```typescript
 * const users = new Store<string, User>();
 * users.set("user1", { id: "1", name: "John" });
 *
 * // Find a user
 * const user = users.find({ name: "John" });
 *
 * // Convert to array
 * const userArray = users.to("array");
 * ```
 */
export class Store<K, V> extends Map<K, V> {
  /**
   * Internal array of values for optimized access and operations.
   * This array is kept in sync with the Map entries via #syncArray().
   * @private
   */
  #array: V[] | null = null;

  /**
   * Timestamp of the last modification to the store.
   * Updated whenever the store's content changes through set, delete, or clear operations.
   * @private
   */
  #lastUpdate = Date.now();

  /**
   * Creates a new Store instance.
   *
   * @param entries - Initial entries for the store
   */
  constructor(entries?: readonly (readonly [K, V])[] | null) {
    super(entries);
    this.#syncArray();
  }

  /**
   * Gets the timestamp of the last update to the store.
   *
   * @returns The Unix timestamp of the last update
   */
  get lastUpdate(): number {
    return this.#lastUpdate;
  }

  /**
   * Creates a Store instance from a JSON string.
   *
   * @param json - The JSON string containing the entries
   * @returns A new Store instance
   *
   * @example
   * ```typescript
   * const store = Store.fromJson<string, User>('[["user1", {"id": "1", "name": "John"}]]');
   * ```
   */
  static fromJson<K extends StoreKey, V extends StoreValue>(
    json: string,
  ): Store<K, V> {
    const entries = JSON.parse(json);
    return new Store<K, V>(entries);
  }

  /**
   * Finds entries in the store based on a predicate or pattern.
   *
   * @param predicate - A function or partial object pattern to match against
   * @param options - Search options
   * @param options.returnKey - If true, returns the key instead of the value
   * @param options.fromEnd - If true, searches from the end of the store
   * @param options.multiple - If true, returns all matches instead of just the first
   * @returns The matched value(s), key(s), or undefined if no match is found
   *
   * @example
   * ```typescript
   * // Find by pattern
   * const user = store.find({ name: "John" });
   *
   * // Find by predicate
   * const admin = store.find((user) => user.role === "admin");
   *
   * // Find multiple matches
   * const users = store.find({ status: "active" }, { multiple: true });
   * ```
   */
  find(
    predicate: StorePredicate<K, V>,
    options?: SearchOptions,
  ): V | K | (V | K)[] | undefined {
    const isPattern = typeof predicate !== "function";
    const matches: (V | K)[] = [];
    const entries = options?.fromEnd
      ? [...this.entries()].reverse()
      : this.entries();

    for (const [key, value] of entries) {
      const isMatch = isPattern
        ? Object.entries(predicate as Partial<V>).every(
            ([k, v]) => value[k as keyof V] === v,
          )
        : (predicate as (value: V, key: K, map: this) => boolean)(
            value,
            key,
            this,
          );

      if (isMatch) {
        const result = options?.returnKey ? key : value;
        if (!options?.multiple) {
          return result;
        }
        matches.push(result);
      }
    }

    return options?.multiple ? matches : undefined;
  }

  /**
   * Filters entries in the store based on a predicate or pattern.
   *
   * @param predicate - A function or partial object pattern to filter with
   * @returns A new Store containing the filtered entries
   *
   * @example
   * ```typescript
   * // Filter by pattern
   * const activeUsers = store.filter({ status: "active" });
   *
   * // Filter by predicate
   * const premiumUsers = store.filter((user) => user.isPremium);
   * ```
   */
  filter(predicate: StorePredicate<K, V>): Store<K, V> {
    const newStore = new Store<K, V>();

    if (typeof predicate === "function") {
      for (const [key, value] of this) {
        if (predicate(value, key, this)) {
          newStore.set(key, value);
        }
      }
    } else {
      const entries = Object.entries(predicate as Partial<V>);
      outer: for (const [key, value] of this) {
        for (const [k, v] of entries) {
          if (value[k as keyof V] !== v) {
            continue outer;
          }
        }
        newStore.set(key, value);
      }
    }

    return newStore;
  }

  /**
   * Maps values in the store and returns a new array.
   *
   * @param callback - Function to execute on each value
   * @returns Array of mapped values
   *
   * @example
   * ```typescript
   * const userNames = store.map(user => user.name);
   * ```
   */
  map<R>(callback: (value: V, key: K, store: this) => R): R[] {
    const result: R[] = [];
    for (const [key, value] of this) {
      result.push(callback(value, key, this));
    }
    return result;
  }

  /**
   * Reduces the store to a single value.
   *
   * @param callback - Function to execute on each value
   * @param initialValue - Initial value of the reduction
   * @returns The final reduced value
   *
   * @example
   * ```typescript
   * const totalAge = store.reduce((sum, user) => sum + user.age, 0);
   * ```
   */
  reduce<R>(
    callback: (accumulator: R, value: V, key: K) => R,
    initialValue: R,
  ): R {
    let result = initialValue;
    for (const [key, value] of this) {
      result = callback(result, value, key);
    }
    return result;
  }

  /**
   * Sorts the store by a given criterion and returns a new Store.
   *
   * @param compareFn - Comparison function
   * @returns A new Store with sorted entries
   *
   * @example
   * ```typescript
   * const sortedByAge = store.sort((a, b) => a.age - b.age);
   * const sortedByName = store.sort((a, b) => a.name.localeCompare(b.name));
   * ```
   */
  sort(compareFn?: (a: V, b: V) => number): Store<K, V> {
    const sorted = [...this.entries()].sort(([, a], [, b]) =>
      compareFn ? compareFn(a, b) : String(a).localeCompare(String(b)),
    );
    return new Store(sorted);
  }

  /**
   * Checks if all entries satisfy the predicate.
   *
   * @param predicate - Function to test each entry
   * @returns true if all entries satisfy the predicate
   *
   * @example
   * ```typescript
   * const allAdults = store.every(user => user.age >= 18);
   * ```
   */
  every(predicate: (value: V, key: K, store: this) => boolean): boolean {
    for (const [key, value] of this) {
      if (!predicate(value, key, this)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Checks if any entry satisfies the predicate.
   *
   * @param predicate - Function to test each entry
   * @returns true if any entry satisfies the predicate
   *
   * @example
   * ```typescript
   * const hasAdmin = store.some(user => user.role === 'admin');
   * ```
   */
  some(predicate: (value: V, key: K, store: this) => boolean): boolean {
    for (const [key, value] of this) {
      if (predicate(value, key, this)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns a new Store with unique values based on a key selector.
   *
   * @param selector - Function to select the key for uniqueness
   * @returns A new Store with unique values
   *
   * @example
   * ```typescript
   * // Keep only users with unique emails
   * const uniqueUsers = store.unique(user => user.email);
   * ```
   */
  unique<S>(selector: (value: V) => S): Store<K, V> {
    const seen = new Set<S>();
    const newStore = new Store<K, V>();

    for (const [key, value] of this) {
      const selected = selector(value);
      if (!seen.has(selected)) {
        seen.add(selected);
        newStore.set(key, value);
      }
    }
    return newStore;
  }

  /**
   * Creates chunks of the store with the specified size.
   *
   * @param size - The size of each chunk
   * @returns Array of Stores, each containing at most `size` entries
   *
   * @example
   * ```typescript
   * // Split store into chunks of 10 entries
   * const chunks = store.chunk(10);
   * ```
   */
  chunk(size: number): Store<K, V>[] {
    if (size <= 0) {
      throw new Error("Chunk size must be positive");
    }

    const result: Store<K, V>[] = [];
    const entries = [...this.entries()];

    for (let i = 0; i < entries.length; i += size) {
      result.push(new Store(entries.slice(i, i + size)));
    }

    return result;
  }

  /**
   * Merges multiple stores into the current store.
   *
   * @param stores - Stores to merge
   * @returns The current store with merged entries
   *
   * @example
   * ```typescript
   * store.merge(store1, store2, store3);
   * ```
   */
  merge(...stores: Store<K, V>[]): this {
    let updated = false;
    for (const store of stores) {
      for (const [key, value] of store) {
        if (!this.has(key) || this.get(key) !== value) {
          this.set(key, value);
          updated = true;
        }
      }
    }
    if (updated) {
      this.#syncArray();
    }
    return this;
  }

  /**
   * Transforms the store's entries using provided transformation functions.
   *
   * @typeParam T - The type of the transformed values
   * @param options - Transformation options
   * @param options.values - Function to transform values
   * @param options.keys - Function to transform keys
   * @param options.entries - Function to transform entire entries
   * @returns A new Store with transformed entries
   *
   * @example
   * ```typescript
   * const transformed = store.transform({
   *   values: (user) => ({ ...user, lastSeen: Date.now() }),
   *   keys: (key) => `user_${key}`
   * });
   * ```
   */
  transform<T extends StoreValue>(
    options: TransformOptions<K, V, T>,
  ): Store<K, T> {
    const newStore = new Store<K, T>();

    for (const [key, value] of this) {
      if (options.entries) {
        const [newKey, newValue] = options.entries([key, value]);
        newStore.set(newKey, newValue);
      } else {
        const newKey = options.keys ? options.keys(key, value) : key;
        const newValue = options.values
          ? options.values(value, key)
          : (value as unknown as T);
        newStore.set(newKey, newValue);
      }
    }

    return newStore;
  }

  /**
   * Returns a slice of the store's values.
   *
   * @param options - Slicing options
   * @param options.page - Page number for pagination
   * @param options.pageSize - Number of items per page
   * @param options.start - Start index
   * @param options.end - End index
   * @param options.size - Number of items to return
   * @param options.fromEnd - If true, slices from the end when using size
   * @returns An array of values from the specified slice
   *
   * @example
   * ```typescript
   * // Pagination
   * const page1 = store.slice({ page: 0, pageSize: 10 });
   *
   * // Get last 5 items
   * const lastFive = store.slice({ size: 5, fromEnd: true });
   * ```
   */
  slice(options: SliceOptions = {}): V[] {
    const array = this.#getArray();

    if (options.page !== undefined && options.pageSize !== undefined) {
      const start = options.page * options.pageSize;
      return array.slice(start, start + options.pageSize);
    }

    if (options.size !== undefined) {
      return options.fromEnd
        ? array.slice(-options.size)
        : array.slice(0, options.size);
    }

    return array.slice(options.start, options.end);
  }

  /**
   * Converts the store to a different format.
   *
   * @typeParam F - The target format type
   * @param format - The desired format
   * @param options - Conversion options
   * @returns The store data in the specified format
   *
   * @example
   * ```typescript
   * // Convert to array
   * const array = store.to("array");
   *
   * // Convert to object
   * const obj = store.to("object");
   *
   * // Convert to Set of specific property
   * const names = store.to("set", { property: "name" });
   * ```
   */
  to<F extends DataFormat>(
    format: F,
    options?: ToOptions<V>,
  ): ToReturnType<K, V, F, typeof options> {
    const array = this.#getArray();
    switch (format) {
      case "array":
        return array as ToReturnType<K, V, F, typeof options>;

      case "object": {
        const obj: Record<string, V> = {};
        for (const [key, value] of this) {
          obj[String(key)] = value;
        }
        return obj as ToReturnType<K, V, F, typeof options>;
      }

      case "map":
        return new Map(this) as ToReturnType<K, V, F, typeof options>;

      case "set": {
        if (options?.property) {
          return new Set(
            array.map((v) => v[options.property as keyof V]),
          ) as ToReturnType<K, V, F, typeof options>;
        }
        return new Set(array) as ToReturnType<K, V, F, typeof options>;
      }

      case "pairs":
        return Array.from(this.entries()) as ToReturnType<
          K,
          V,
          F,
          typeof options
        >;

      default:
        throw new Error(`Invalid format: ${format}`);
    }
  }

  /**
   * Performs set operations with another store.
   *
   * @param other - The other store to operate with
   * @param operation - The set operation to perform
   * @returns A new Store containing the result of the operation
   *
   * @example
   * ```typescript
   * // Union of two stores
   * const combined = storeA.operate(storeB, "union");
   *
   * // Difference between stores
   * const unique = storeA.operate(storeB, "difference");
   *
   * // Intersection of stores
   * const common = storeA.operate(storeB, "intersection");
   * ```
   */
  operate(other: Store<K, V>, operation: SetOperation): Store<K, V> {
    const newStore = new Store<K, V>();

    switch (operation) {
      case SetOperation.Union: {
        for (const [key, value] of this) {
          newStore.set(key, value);
        }
        for (const [key, value] of other) {
          newStore.set(key, value);
        }
        break;
      }

      case SetOperation.Difference: {
        for (const [key, value] of this) {
          if (!other.has(key)) {
            newStore.set(key, value);
          }
        }
        break;
      }

      case SetOperation.Intersection: {
        for (const [key, value] of this) {
          if (other.has(key)) {
            newStore.set(key, value);
          }
        }
        break;
      }

      default: {
        throw new Error("Invalid operation");
      }
    }

    return newStore;
  }

  /**
   * Aggregates store values into groups and performs operations on each group.
   *
   * @typeParam T - The type of the aggregated results
   * @param options - Aggregation options
   * @param options.groupBy - Property or function to group by
   * @param options.operations - Object containing aggregation operations
   * @returns A Map of grouped results
   *
   * @example
   * ```typescript
   * const results = store.aggregate({
   *   groupBy: "category",
   *   operations: {
   *     count: (group) => group.length,
   *     totalValue: (group) => group.reduce((sum, item) => sum + item.value, 0),
   *     average: (group) => group.reduce((sum, item) => sum + item.value, 0) / group.length
   *   }
   * });
   * ```
   */
  aggregate<T extends Record<string, unknown>>(
    options: AggregateOptions<V, T>,
  ): Map<string, T> {
    const groups = new Map<string, V[]>();
    const result = new Map<string, T>();
    const isFunction = typeof options.groupBy === "function";

    for (const value of this.values()) {
      const key = isFunction
        ? (options.groupBy as (value: V) => string)(value)
        : String(value[options.groupBy as keyof V]);

      let group = groups.get(key);
      if (!group) {
        group = [];
        groups.set(key, group);
      }
      group.push(value);
    }

    const operations = Object.entries(options.operations);

    for (const [key, group] of groups) {
      const aggregated = {} as T;
      for (const [opName, operation] of operations) {
        aggregated[opName as keyof T] = operation(group);
      }
      result.set(key, aggregated);
    }

    return result;
  }

  /**
   * Returns the value at the specified index in the store.
   *
   * @param index - The index of the value to retrieve (negative indices count from the end)
   * @returns The value at the specified index or undefined if not found
   *
   * @example
   * ```typescript
   * // Get first item
   * const first = store.at(0);
   *
   * // Get last item
   * const last = store.at(-1);
   * ```
   */
  at(index: number): V | undefined {
    let i = index;
    const array = this.#getArray();
    if (index < 0) {
      i = array.length + index;
    }
    return array[i];
  }

  /**
   * Returns the first value in the store.
   *
   * @returns The first value or undefined if the store is empty
   *
   * @example
   * ```typescript
   * const firstUser = store.first();
   * ```
   */
  first(): V | undefined {
    return this.at(0);
  }

  /**
   * Returns the last value in the store.
   *
   * @returns The last value or undefined if the store is empty
   *
   * @example
   * ```typescript
   * const lastUser = store.last();
   * ```
   */
  last(): V | undefined {
    return this.at(-1);
  }

  /**
   * Returns a random value from the store.
   *
   * @returns A random value or undefined if the store is empty
   *
   * @example
   * ```typescript
   * const randomUser = store.random();
   * ```
   */
  random(): V | undefined {
    const array = this.#getArray();
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Returns a specified number of random values from the store.
   *
   * @param n - The number of values to return
   * @returns An array of random values
   *
   * @example
   * ```typescript
   * // Get 3 random users
   * const randomUsers = store.sample(3);
   * ```
   */
  sample(n: number): V[] {
    return this.shuffle().slice(0, n);
  }

  /**
   * Returns a shuffled array of all values in the store.
   *
   * @returns A new array containing all values in random order
   *
   * @example
   * ```typescript
   * const shuffledUsers = store.shuffle();
   * ```
   */
  shuffle(): V[] {
    const array = this.#getArray();
    const shuffled = new Array(array.length);
    let i = array.length;

    while (i--) {
      const j = Math.floor(Math.random() * (i + 1));
      shuffled[i] = array[j];
      shuffled[j] = array[i];
    }

    return shuffled;
  }

  /**
   * Counts the number of entries that satisfy the predicate.
   *
   * @param predicate - Function to test each entry
   * @returns The number of entries that satisfy the predicate
   *
   * @example
   * ```typescript
   * const activeCount = store.count((user) => user.status === "active");
   * ```
   */
  count(predicate: (value: V, key: K) => boolean): number {
    let count = 0;
    for (const [key, value] of this) {
      if (predicate(value, key)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Checks if the store is empty.
   *
   * @returns true if the store contains no entries, false otherwise
   *
   * @example
   * ```typescript
   * if (store.isEmpty()) {
   *   console.log("No entries found");
   * }
   * ```
   */
  isEmpty(): boolean {
    return this.size === 0;
  }

  /**
   * Executes a function with the store as argument and returns the store.
   * Useful for side effects while maintaining chainability.
   *
   * @param fn - Function to execute
   * @returns The store instance
   *
   * @example
   * ```typescript
   * store
   *   .filter(predicate)
   *   .tap(filtered => console.log(`Found ${filtered.size} matches`))
   *   .transform(transformer);
   * ```
   */
  tap(fn: (store: this) => void): this {
    fn(this);
    return this;
  }

  /**
   * Removes empty or null values from the store.
   *
   * @returns A new Store with non-empty values
   *
   * @remarks
   * Values are considered empty if they are:
   * - null or undefined
   * - empty strings
   * - empty arrays
   * - objects with no own properties
   *
   * @example
   * ```typescript
   * const nonEmptyStore = store.compact();
   * ```
   */
  compact(): Store<K, V> {
    return this.filter((value): boolean => {
      if (value == null) {
        return false;
      }
      if (typeof value === "string") {
        return value.length > 0;
      }
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      if (typeof value === "object") {
        return Object.keys(value).length > 0;
      }
      return true;
    });
  }

  /**
   * Asynchronously loads data from an external source and merges it into the store.
   *
   * @param loader - Async function that returns entries to load
   * @param options - Load options
   * @param options.merge - How to handle existing entries (default: 'replace')
   * @returns Promise resolving to the updated store
   *
   * @example
   * ```typescript
   * await store.loadAsync(async () => {
   *   const response = await fetch('https://api.example.com/users');
   *   return response.json();
   * });
   * ```
   */
  async loadAsync(
    loader: () => Promise<Iterable<readonly [K, V]>>,
    options: LoadAsyncOptions = {},
  ): Promise<this> {
    const entries = await loader();
    const { merge = "replace" } = options;

    for (const [key, value] of entries) {
      const exists = this.has(key);
      if (!exists || merge === "replace" || (exists && merge === "keep")) {
        this.set(key, value);
      }
    }

    return this;
  }

  /**
   * Asynchronously processes entries in batches.
   *
   * @param batchSize - Size of each batch
   * @param processor - Async function to process each batch
   * @returns Promise resolving to an array of processor results
   *
   * @example
   * ```typescript
   * const results = await store.processBatchAsync(100, async (batch) => {
   *   await bulkSaveToDatabase(batch);
   *   return batch.length;
   * });
   * ```
   */
  async processBatchAsync<R>(
    batchSize: number,
    processor: (batch: V[]) => Promise<R>,
  ): Promise<R[]> {
    const chunks = this.chunk(batchSize);
    const results: R[] = [];

    for (const chunk of chunks) {
      const result = await processor(Array.from(chunk.values()));
      results.push(result);
    }

    return results;
  }

  /**
   * Asynchronously maps values using a mapper that returns promises.
   *
   * @typeParam R - The type of the transformed values
   * @param mapper - Async function to transform each value
   * @param options - Mapping options
   * @param options.concurrency - Maximum number of concurrent operations
   * @returns Promise resolving to a new Store with transformed values
   *
   * @example
   * ```typescript
   * const enrichedUsers = await store.mapAsync(async (user) => {
   *   const details = await fetchUserDetails(user.id);
   *   return { ...user, ...details };
   * }, { concurrency: 5 });
   * ```
   */
  async mapAsync<R>(
    mapper: (value: V, key: K) => Promise<R>,
    options: AsyncMapOptions = {},
  ): Promise<Store<K, R>> {
    const { concurrency = Number.POSITIVE_INFINITY } = options;
    const entries = Array.from(this.entries());
    const results = new Store<K, R>();

    for (let i = 0; i < entries.length; i += concurrency) {
      const chunk = entries.slice(i, i + concurrency);
      const promises = chunk.map(async ([key, value]) => {
        const mapped = await mapper(value, key);
        return [key, mapped] as const;
      });

      const mappedChunk = await Promise.all(promises);
      for (const [key, value] of mappedChunk) {
        results.set(key, value);
      }
    }

    return results;
  }

  /**
   * Asynchronously filters entries using a predicate that returns promises.
   *
   * @param predicate - Async function to test each entry
   * @param options - Filter options
   * @param options.concurrency - Maximum number of concurrent operations
   * @returns Promise resolving to a new Store with filtered entries
   *
   * @example
   * ```typescript
   * const activeUsers = await store.filterAsync(async (user) => {
   *   const status = await checkUserStatus(user.id);
   *   return status === 'active';
   * }, { concurrency: 3 });
   * ```
   */
  async filterAsync(
    predicate: (value: V, key: K) => Promise<boolean>,
    options: AsyncFilterOptions = {},
  ): Promise<Store<K, V>> {
    const { concurrency = Number.POSITIVE_INFINITY } = options;
    const entries = Array.from(this.entries());
    const results = new Store<K, V>();

    for (let i = 0; i < entries.length; i += concurrency) {
      const chunk = entries.slice(i, i + concurrency);
      const promises = chunk.map(async ([key, value]) => {
        const keep = await predicate(value, key);
        return keep ? ([key, value] as const) : null;
      });

      const filteredChunk = (await Promise.all(promises)).filter(
        (entry): entry is [K, V] => entry !== null,
      );
      for (const [key, value] of filteredChunk) {
        results.set(key, value);
      }
    }

    return results;
  }

  /**
   * Asynchronously persists the store data to an external storage.
   *
   * @param persister - Async function to handle the persistence
   * @returns Promise resolving once persistence is complete
   *
   * @example
   * ```typescript
   * await store.persistAsync(async (data) => {
   *   await fs.writeFile('store.json', JSON.stringify(data));
   * });
   * ```
   */
  async persistAsync(
    persister: (data: PersistedStoreData<K, V>) => Promise<void>,
  ): Promise<void> {
    const data = {
      entries: Array.from(this.entries()),
      timestamp: this.lastUpdate,
    };

    await persister(data);
  }

  /**
   * Sets a key-value pair in the store.
   *
   * @param key - The key to set
   * @param value - The value to set
   * @returns The Store instance for chaining
   *
   * @example
   * ```typescript
   * store.set("user1", { id: "1", name: "John" });
   * ```
   */
  override set(key: K, value: V): this {
    super.set(key, value);
    this.#syncArray();
    return this;
  }

  /**
   * Deletes an entry from the store.
   *
   * @param key - The key to delete
   * @returns true if the element was removed, false if it was not found
   *
   * @example
   * ```typescript
   * store.delete("user1");
   * ```
   */
  override delete(key: K): boolean {
    const result = super.delete(key);
    if (result) {
      this.#syncArray();
    }
    return result;
  }

  /**
   * Removes all entries from the store.
   *
   * @example
   * ```typescript
   * store.clear();
   * ```
   */
  override clear(): void {
    super.clear();
    this.#syncArray();
  }

  /**
   * Internal method to get the cached array of values.
   * Ensures the array is synchronized with the current store state through lazy loading.
   *
   * @private
   * @returns The array of all values in the store
   */
  #getArray(): V[] {
    if (this.#array === null) {
      this.#syncArray();
    }

    return this.#array as V[];
  }

  /**
   * Internal method to synchronize the internal array with the current store entries.
   * Synchronizes the internal array with the current store entries.
   *
   * @private
   */
  #syncArray(): void {
    this.#array = Array.from(this.values());
    this.#lastUpdate = Date.now();
  }
}
