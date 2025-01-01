import type { Store } from "./store.js";

export type SetOperation = "union" | "difference" | "intersection";
export type ToFormat = "array" | "object" | "map" | "set" | "pairs";
export type StoreKey = string | number | symbol;
export type StoreValue = unknown;
export type StorePredicate<K, V> =
  | ((value: V, key: K, map: Store<K, V>) => boolean)
  | Partial<V>;
export type ToReturnType<
  K,
  V,
  F extends ToFormat,
  O extends ConversionOptions<V> | undefined,
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

export interface ToOptions<V> {
  property?: keyof V;
}

export interface BaseOptions {
  fromEnd?: boolean;
}

export interface ConversionOptions<V> extends BaseOptions {
  property?: keyof V;
}

export interface SearchOptions extends BaseOptions {
  returnKey?: boolean;
  multiple?: boolean;
}

export interface SliceOptions extends BaseOptions {
  page?: number;
  pageSize?: number;
  start?: number;
  end?: number;
  size?: number;
}

export interface TransformOptions<K, V, T = V> {
  values?: (value: V, key: K) => T;
  keys?: (key: K, value: V) => K;
  entries?: (entry: [K, V]) => [K, T];
}

export interface AggregateOptions<V, T extends Record<string, unknown>> {
  groupBy: keyof V | ((value: V) => string);
  operations: {
    [K in keyof T]: (group: V[]) => T[K];
  };
}

export interface LoadAsyncOptions {
  merge?: "replace" | "skip" | "keep";
}

export interface AsyncMapOptions {
  concurrency?: number;
  errorHandler?: (error: Error, value: unknown) => void;
  timeout?: number;
}

export interface AsyncFilterOptions {
  concurrency?: number;
  errorBehavior?: "exclude" | "include" | "throw";
  timeout?: number;
}

export interface PersistedStoreData<K, V> {
  entries: [K, V][];
  timestamp: number;
  metadata?: Record<string, unknown>;
}
