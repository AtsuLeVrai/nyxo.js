export type StorePredicate<K, V> =
  | ((value: V, key: K, map: Store<K, V>) => boolean)
  | Partial<V>;

export interface StoreOptions {
  maxSize?: number;
  ttl?: number;
  evictionStrategy?: "fifo" | "lru";
}

export class Store<K, V> extends Map<K, V> {
  #ttlMap = new Map<K, number>();
  #accessOrder = new Map<K, number>();
  #lastAccess = 0;

  readonly #options: Required<StoreOptions>;

  constructor(
    entries?: readonly (readonly [K, V])[] | null,
    options: StoreOptions = {},
  ) {
    super();

    this.#options = {
      maxSize: 10000,
      ttl: 0,
      evictionStrategy: "lru",
      ...options,
    };

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
        this.set(key, this.#deepMerge(existingValue, value) as V);
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
    const newValue = { ...value } as Record<string, unknown>;

    for (const path of pathsArray) {
      delete newValue[path as string];
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
    this.#accessOrder.delete(key);
    return super.delete(key);
  }

  override clear(): void {
    super.clear();
    this.#ttlMap.clear();
    this.#accessOrder.clear();
    this.#lastAccess = 0;
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
      super.set(key, value);
      this.#updateAccessTime(key);
    }
  }

  #startCleanupInterval(): void {
    const cleanupInterval = Math.min(this.#options.ttl / 2, 60000); // Max 1 minute
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
      this.#accessOrder.set(key, ++this.#lastAccess);
    }
  }

  #evict(): void {
    if (!this.#options.maxSize || this.size < this.#options.maxSize) {
      return;
    }

    let keyToEvict: K | undefined;

    if (this.#options.evictionStrategy === "lru") {
      let oldestAccess = Number.POSITIVE_INFINITY;
      for (const [key, accessTime] of this.#accessOrder) {
        if (accessTime < oldestAccess) {
          oldestAccess = accessTime;
          keyToEvict = key;
        }
      }
    } else {
      keyToEvict = this.keys().next().value;
    }

    if (keyToEvict) {
      this.delete(keyToEvict);
    }
  }

  #matchesPattern(value: V, pattern: [string, unknown][]): boolean {
    return pattern.every(([k, v]) => {
      const valueAtKey = value[k as keyof V];
      return Array.isArray(valueAtKey)
        ? valueAtKey.includes(v)
        : valueAtKey === v;
    });
  }

  #deepMerge(target: V, source: V | Partial<V>): V {
    if (!source || typeof source !== "object") {
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
