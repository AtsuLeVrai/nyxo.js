export type ToFormat = "array" | "object" | "map" | "set" | "pairs";

export type ToOptions<V> = {
  property?: keyof V;
};

export type ToReturnType<
  K,
  V,
  F extends ToFormat,
  O extends ToOptions<V> | undefined,
> = F extends "array"
  ? V[]
  : F extends "object"
    ? Record<string, V>
    : F extends "map"
      ? Map<K, V>
      : F extends "set"
        ? O extends { property: keyof V }
          ? Set<V[O["property"]]>
          : Set<V>
        : F extends "pairs"
          ? [K, V][]
          : never;

export class Store<K, V> extends Map<K, V> {
  #array: V[] = [];
  #lastUpdate = Date.now();

  constructor(entries?: readonly (readonly [K, V])[] | null) {
    super(entries);
    this.#syncArray();
  }

  get lastUpdate(): number {
    return this.#lastUpdate;
  }

  static fromJson<K, V>(json: string): Store<K, V> {
    const entries = JSON.parse(json);
    return new Store<K, V>(entries);
  }

  find(
    predicate: ((value: V, key: K, map: this) => boolean) | Partial<V>,
    options?: {
      returnKey?: boolean;
      fromEnd?: boolean;
      multiple?: boolean;
    },
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

  filter(
    predicate: ((value: V, key: K, map: this) => boolean) | Partial<V>,
  ): Store<K, V> {
    const isPattern = typeof predicate !== "function";
    const newStore = new Store<K, V>();

    for (const [key, value] of this) {
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
        newStore.set(key, value);
      }
    }

    return newStore;
  }

  transform<T = V>(options: {
    values?: (value: V, key: K) => T;
    keys?: (key: K, value: V) => K;
    entries?: (entry: [K, V]) => [K, T];
  }): Store<K, T> {
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

  slice(
    options: {
      page?: number;
      pageSize?: number;
      start?: number;
      end?: number;
      size?: number;
      fromEnd?: boolean;
    } = {},
  ): V[] {
    this.#syncArray();

    if (options.page !== undefined && options.pageSize !== undefined) {
      const start = options.page * options.pageSize;
      return this.#array.slice(start, start + options.pageSize);
    }

    if (options.size !== undefined) {
      return options.fromEnd
        ? this.#array.slice(-options.size)
        : this.#array.slice(0, options.size);
    }

    return this.#array.slice(options.start, options.end);
  }

  to<F extends ToFormat>(
    format: F,
    options?: ToOptions<V>,
  ): ToReturnType<K, V, F, typeof options> {
    switch (format) {
      case "array":
        return this.#array as ToReturnType<K, V, F, typeof options>;

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
            this.#array.map((v) => v[options.property as keyof V]),
          ) as ToReturnType<K, V, F, typeof options>;
        }
        return new Set(this.#array) as ToReturnType<K, V, F, typeof options>;
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

  operate(
    other: Store<K, V>,
    operation: "union" | "difference" | "intersection",
  ): Store<K, V> {
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

  aggregate<T extends Record<string, unknown>>(options: {
    groupBy: keyof V | ((value: V) => string);
    operations: {
      [K in keyof T]: (group: V[]) => T[K];
    };
  }): Map<string, T> {
    const groups = new Map<string, V[]>();

    for (const value of this.values()) {
      const key =
        typeof options.groupBy === "function"
          ? options.groupBy(value)
          : String(value[options.groupBy]);

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)?.push(value);
    }

    const result = new Map<string, T>();
    for (const [key, group] of groups) {
      const aggregated = {} as T;
      for (const [opName, operation] of Object.entries(options.operations)) {
        aggregated[opName as keyof T] = operation(group);
      }
      result.set(key, aggregated);
    }

    return result;
  }

  at(index: number): V | undefined {
    let i = index;
    this.#syncArray();
    if (index < 0) {
      i = this.#array.length + index;
    }
    return this.#array[i];
  }

  first(): V | undefined {
    return this.at(0);
  }

  last(): V | undefined {
    return this.at(-1);
  }

  random(): V | undefined {
    this.#syncArray();
    return this.#array[Math.floor(Math.random() * this.#array.length)];
  }

  sample(n: number): V[] {
    return this.shuffle().slice(0, n);
  }

  shuffle(): V[] {
    this.#syncArray();
    const shuffled = [...this.#array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      // @ts-expect-error
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
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

  #syncArray(): void {
    this.#array = Array.from(this.values());
    this.#lastUpdate = Date.now();
  }
}
