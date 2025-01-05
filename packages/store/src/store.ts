import type {
  AggregateOptions,
  AsyncFilterOptions,
  AsyncMapOptions,
  LoadAsyncOptions,
  PersistedStoreData,
  SearchOptions,
  SetOperation,
  SliceOptions,
  StoreKey,
  StorePredicate,
  StoreValue,
  ToFormat,
  ToOptions,
  ToReturnType,
  TransformOptions,
} from "./store.type.js";

export class Store<K, V> extends Map<K, V> {
  #array: V[] | null = null;
  #lastUpdate = Date.now();

  constructor(entries?: readonly (readonly [K, V])[] | null) {
    super(entries);
    this.#syncArray();
  }

  get lastUpdate(): number {
    return this.#lastUpdate;
  }

  static fromJson<K extends StoreKey, V extends StoreValue>(
    json: string,
  ): Store<K, V> {
    const entries = JSON.parse(json);
    return new Store<K, V>(entries);
  }

  add(key: K, value: V | Partial<V>): this {
    if (this.has(key)) {
      const existingValue = this.get(key) as V;
      if (typeof existingValue === "object" && typeof value === "object") {
        const mergedValue = this.#deepMerge(existingValue, value) as V;
        this.set(key, mergedValue);
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

    const pathsArray = Array.isArray(paths) ? paths : [paths];

    const value = this.get(key) as V;
    if (typeof value !== "object" || value === null) {
      return this;
    }

    const newValue = { ...value } as Record<string, unknown>;

    for (const path of pathsArray) {
      if (Object.prototype.hasOwnProperty.call(newValue, path)) {
        delete newValue[path as string];
      }
    }

    this.set(key, newValue as V);
    return this;
  }

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

  map<R>(callback: (value: V, key: K, store: this) => R): R[] {
    const result: R[] = [];
    for (const [key, value] of this) {
      result.push(callback(value, key, this));
    }
    return result;
  }

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

  sort(compareFn?: (a: V, b: V) => number): Store<K, V> {
    const sorted = [...this.entries()].sort(([, a], [, b]) =>
      compareFn ? compareFn(a, b) : String(a).localeCompare(String(b)),
    );
    return new Store(sorted);
  }

  every(predicate: (value: V, key: K, store: this) => boolean): boolean {
    for (const [key, value] of this) {
      if (!predicate(value, key, this)) {
        return false;
      }
    }
    return true;
  }

  some(predicate: (value: V, key: K, store: this) => boolean): boolean {
    for (const [key, value] of this) {
      if (predicate(value, key, this)) {
        return true;
      }
    }
    return false;
  }

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

  to<F extends ToFormat>(
    format: F,
    options?: ToOptions<V>,
  ): ToReturnType<K, V, F, typeof options> {
    const array = this.#getArray();
    switch (format) {
      case "array": {
        return array as ToReturnType<K, V, F, typeof options>;
      }

      case "object": {
        const obj: Record<string, V> = {};
        for (const [key, value] of this) {
          obj[String(key)] = value;
        }
        return obj as ToReturnType<K, V, F, typeof options>;
      }

      case "map": {
        return new Map(this) as ToReturnType<K, V, F, typeof options>;
      }

      case "set": {
        if (options?.property) {
          return new Set(
            array.map((v) => v[options.property as keyof V]),
          ) as ToReturnType<K, V, F, typeof options>;
        }
        return new Set(array) as ToReturnType<K, V, F, typeof options>;
      }

      case "pairs": {
        return Array.from(this.entries()) as ToReturnType<
          K,
          V,
          F,
          typeof options
        >;
      }

      default: {
        throw new Error(`Invalid format: ${format}`);
      }
    }
  }

  operate(other: Store<K, V>, operation: SetOperation): Store<K, V> {
    const newStore = new Store<K, V>();

    switch (operation) {
      case "union": {
        for (const [key, value] of this) {
          newStore.set(key, value);
        }
        for (const [key, value] of other) {
          newStore.set(key, value);
        }
        break;
      }

      case "difference": {
        for (const [key, value] of this) {
          if (!other.has(key)) {
            newStore.set(key, value);
          }
        }
        break;
      }

      case "intersection": {
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

  at(index: number): V | undefined {
    let i = index;
    const array = this.#getArray();
    if (index < 0) {
      i = array.length + index;
    }
    return array[i];
  }

  first(): V | undefined {
    return this.at(0);
  }

  last(): V | undefined {
    return this.at(-1);
  }

  random(): V | undefined {
    const array = this.#getArray();
    return array[Math.floor(Math.random() * array.length)];
  }

  sample(n: number): V[] {
    return this.shuffle().slice(0, n);
  }

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

  count(predicate: (value: V, key: K) => boolean): number {
    let count = 0;
    for (const [key, value] of this) {
      if (predicate(value, key)) {
        count++;
      }
    }
    return count;
  }

  isEmpty(): boolean {
    return this.size === 0;
  }

  tap(fn: (store: this) => void): this {
    fn(this);
    return this;
  }

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

  async persistAsync(
    persister: (data: PersistedStoreData<K, V>) => Promise<void>,
  ): Promise<void> {
    const data = {
      entries: Array.from(this.entries()),
      timestamp: this.lastUpdate,
    };

    await persister(data);
  }

  override set(key: K, value: V): this {
    super.set(key, value);
    this.#syncArray();
    return this;
  }

  override delete(key: K): boolean {
    const result = super.delete(key);
    if (result) {
      this.#syncArray();
    }
    return result;
  }

  override clear(): void {
    super.clear();
    this.#syncArray();
  }

  #getArray(): V[] {
    if (this.#array === null) {
      this.#syncArray();
    }

    return this.#array as V[];
  }

  #syncArray(): void {
    this.#array = Array.from(this.values());
    this.#lastUpdate = Date.now();
  }

  #deepMerge(target: V, source: V | Partial<V>): V {
    if (source === undefined) {
      return target;
    }

    if (source === null) {
      return source as V;
    }

    if (typeof source !== "object" || Array.isArray(source)) {
      return source as V;
    }

    const merged = { ...target } as Record<string, unknown>;

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const sourceValue = source[key as keyof typeof source];
        const targetValue = target[key as keyof V];

        if (
          sourceValue &&
          targetValue &&
          typeof sourceValue === "object" &&
          typeof targetValue === "object" &&
          !Array.isArray(sourceValue) &&
          !Array.isArray(targetValue)
        ) {
          merged[key] = this.#deepMerge(
            targetValue as V,
            sourceValue as Partial<V>,
          );
        } else if (sourceValue !== undefined) {
          merged[key] = sourceValue;
        }
      }
    }

    return merged as V;
  }
}
