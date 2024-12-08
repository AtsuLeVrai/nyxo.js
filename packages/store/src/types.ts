import type { Store } from "./Store.js";

/**
 * All possible formats available for data conversion in the Store class.
 *
 * @remarks
 * These formats determine how the data will be structured when using conversion methods:
 * - Array: Linear list of values
 * - Object: Key-value pairs as a plain object
 * - Map: Native Map structure
 * - Set: Unique values collection
 * - Pairs: Array of key-value tuples
 */
export enum DataFormat {
  Array = "array",
  Object = "object",
  Map = "map",
  Set = "set",
  Pairs = "pairs",
}

/**
 * Set operations that can be performed between two Store instances.
 *
 * @remarks
 * These operations follow mathematical set theory:
 * - Union: Combines elements from both sets
 * - Difference: Elements in first set but not in second
 * - Intersection: Elements common to both sets
 */
export enum SetOperation {
  Union = "union",
  Difference = "difference",
  Intersection = "intersection",
}

/**
 * Represents the available format types for data conversion.
 *
 * @remarks
 * These formats determine how the data will be structured when using the `to` method.
 */
export type ToFormat = "array" | "object" | "map" | "set" | "pairs";

/**
 * Configuration options for data conversion.
 *
 * @typeParam V - The type of values stored in the collection
 */
export type ToOptions<V> = {
  /** Specific property to extract when converting to a Set */
  property?: keyof V;
};

/**
 * Represents the return type for the `to` method based on the format and options provided.
 *
 * @typeParam K - The type of keys in the collection
 * @typeParam V - The type of values in the collection
 * @typeParam F - The target format type
 * @typeParam O - The options type
 *
 * @remarks
 * This type provides type safety for the different conversion formats:
 * - "array": Returns an array of values
 * - "object": Returns an object with string keys
 * - "map": Returns a new Map
 * - "set": Returns a Set of values or specific properties
 * - "pairs": Returns an array of key-value pairs
 */
export type ToReturnType<
  K,
  V,
  F extends DataFormat,
  O extends ConversionOptions<V> | undefined,
> = F extends DataFormat.Array
  ? V[]
  : F extends DataFormat.Object
    ? Record<string, V>
    : F extends DataFormat.Map
      ? Map<K, V>
      : F extends DataFormat.Set
        ? O extends { property: keyof V }
          ? Set<V[O["property"]]>
          : Set<V>
        : F extends DataFormat.Pairs
          ? [K, V][]
          : never;

/**
 * Type representing a function or pattern used for filtering or finding entries.
 *
 * @typeParam K - The type of keys in the store
 * @typeParam V - The type of values in the store
 *
 * @remarks
 * Can be either:
 * - A function returning a boolean
 * - A partial object pattern to match against
 *
 * @example
 * ```typescript
 * // Function predicate
 * const byAge: StorePredicate<string, User> = (user) => user.age >= 18;
 *
 * // Pattern predicate
 * const byStatus: StorePredicate<string, User> = { status: 'active' };
 * ```
 */
export type StorePredicate<K, V> =
  | ((value: V, key: K, map: Store<K, V>) => boolean)
  | Partial<V>;

/**
 * Type guard to ensure a value is not null or undefined.
 *
 * @typeParam T - The type to check
 *
 * @remarks
 * Used for type safety when working with potentially nullable values.
 */
export type NonNullableValue<T> = T extends null | undefined ? never : T;

/**
 * Valid key types for the Store class.
 *
 * @remarks
 * Includes all valid key types that can be used in a Map.
 */
export type StoreKey = string | number | symbol;

/**
 * Base type for values that can be stored in the Store class.
 *
 * @remarks
 * Represents any valid value that can be stored.
 */
export type StoreValue = unknown;

/**
 * Base configuration interface for data operations.
 *
 * @typeParam fromEnd - When true, operations are performed from the end of the collection
 *
 * @example
 * ```typescript
 * const options: BaseOptions = { fromEnd: true };
 * ```
 */
export interface BaseOptions {
  fromEnd?: boolean;
}

/**
 * Options for data conversion operations.
 *
 * @typeParam V - The type of values being converted
 * @extends BaseOptions
 *
 * @remarks
 * Extends base options with property selection capability for Set conversions.
 *
 * @example
 * ```typescript
 * const options: ConversionOptions<User> = {
 *   property: 'id',
 *   fromEnd: false
 * };
 * ```
 */
export interface ConversionOptions<V> extends BaseOptions {
  property?: keyof V;
}

/**
 * Configuration options for search operations in the Store.
 *
 * @extends BaseOptions
 *
 * @remarks
 * Controls the behavior and output format of search operations:
 * - returnKey: Return matching keys instead of values
 * - multiple: Return all matches instead of just the first
 *
 * @example
 * ```typescript
 * const searchOptions: SearchOptions = {
 *   returnKey: true,
 *   multiple: true
 * };
 * ```
 */
export interface SearchOptions extends BaseOptions {
  returnKey?: boolean;
  multiple?: boolean;
}

/**
 * Options for slicing store data into smaller portions.
 *
 * @extends BaseOptions
 *
 * @remarks
 * Supports both pagination and direct slicing:
 * - Pagination: Use page and pageSize
 * - Direct slicing: Use start/end or size
 *
 * @example
 * ```typescript
 * // Pagination
 * const pageOptions: SliceOptions = {
 *   page: 0,
 *   pageSize: 10
 * };
 *
 * // Direct slice
 * const sliceOptions: SliceOptions = {
 *   start: 0,
 *   end: 5
 * };
 * ```
 */
export interface SliceOptions extends BaseOptions {
  page?: number;
  pageSize?: number;
  start?: number;
  end?: number;
  size?: number;
}

/**
 * Configuration for transforming store data.
 *
 * @typeParam K - The type of keys in the store
 * @typeParam V - The type of values before transformation
 * @typeParam T - The type of values after transformation
 *
 * @remarks
 * Provides three ways to transform data:
 * - values: Transform only the values
 * - keys: Transform only the keys
 * - entries: Transform both keys and values together
 *
 * @example
 * ```typescript
 * const options: TransformOptions<string, User, UserDTO> = {
 *   values: (user) => ({
 *     id: user.id,
 *     displayName: `${user.firstName} ${user.lastName}`
 *   })
 * };
 * ```
 */
export interface TransformOptions<K, V, T = V> {
  values?: (value: V, key: K) => T;
  keys?: (key: K, value: V) => K;
  entries?: (entry: [K, V]) => [K, T];
}

/**
 * Configuration for data aggregation operations.
 *
 * @typeParam V - The type of values being aggregated
 * @typeParam T - The type of the aggregation result
 *
 * @remarks
 * Defines how to group data and what operations to perform on each group.
 *
 * @example
 * ```typescript
 * const options: AggregateOptions<Order, OrderStats> = {
 *   groupBy: 'category',
 *   operations: {
 *     count: (group) => group.length,
 *     total: (group) => group.reduce((sum, order) => sum + order.amount, 0)
 *   }
 * };
 * ```
 */
export interface AggregateOptions<V, T extends Record<string, unknown>> {
  groupBy: keyof V | ((value: V) => string);
  operations: {
    [K in keyof T]: (group: V[]) => T[K];
  };
}

/**
 * Result type for transformation operations.
 *
 * @typeParam K - The type of keys in the store
 * @typeParam V - Original value type
 * @typeParam T - Transformed value type
 */
export type TransformResult<K, _V, T> = Store<K, T>;

/**
 * Result type for set operations between stores.
 *
 * @typeParam K - The type of keys in the stores
 * @typeParam V - The type of values in the stores
 */
export type SetOperationResult<K, V> = Store<K, V>;

/**
 * Result type for find operations, varying based on search options.
 *
 * @typeParam K - The type of keys in the store
 * @typeParam V - The type of values in the store
 */
export type FindResult<K, V> = V | K | (V | K)[] | undefined;

/**
 * Options for asynchronous loading operations.
 *
 * @typeParam K - The type of keys in the store
 * @typeParam V - The type of values in the store
 *
 * @remarks
 * Controls how new entries are merged with existing data:
 * - replace: Overwrites existing entries
 * - skip: Keeps existing entries, only adds new ones
 * - keep: Preserves existing entries, updates missing ones
 *
 * @example
 * ```typescript
 * const loadOptions: LoadAsyncOptions = {
 *   merge: 'skip'
 * };
 * ```
 */
export interface LoadAsyncOptions {
  merge?: "replace" | "skip" | "keep";
}

/**
 * Options for asynchronous mapping operations.
 *
 * @typeParam V - The type of values being mapped
 *
 * @remarks
 * Controls the execution of asynchronous mapping:
 * - concurrency: Maximum number of concurrent operations
 * - errorHandler: Optional function to handle mapping errors
 * - timeout: Optional timeout for each mapping operation
 *
 * @example
 * ```typescript
 * const options: AsyncMapOptions = {
 *   concurrency: 5,
 *   errorHandler: (error, value) => console.error(`Failed to map ${value}:`, error),
 *   timeout: 5000
 * };
 * ```
 */
export interface AsyncMapOptions {
  concurrency?: number;
  errorHandler?: (error: Error, value: unknown) => void;
  timeout?: number;
}

/**
 * Options for asynchronous filtering operations.
 *
 * @typeParam V - The type of values being filtered
 *
 * @remarks
 * Configures the behavior of asynchronous filtering:
 * - concurrency: Maximum number of concurrent predicate evaluations
 * - errorBehavior: How to handle predicate evaluation errors
 * - timeout: Optional timeout for each predicate evaluation
 *
 * @example
 * ```typescript
 * const options: AsyncFilterOptions = {
 *   concurrency: 3,
 *   errorBehavior: 'exclude',
 *   timeout: 2000
 * };
 * ```
 */
export interface AsyncFilterOptions {
  concurrency?: number;
  errorBehavior?: "exclude" | "include" | "throw";
  timeout?: number;
}

/**
 * Type representing the structure of persisted store data.
 *
 * @typeParam K - The type of keys in the store
 * @typeParam V - The type of values in the store
 *
 * @remarks
 * Standard format for persisted store data including:
 * - entries: The actual store entries
 * - timestamp: When the data was persisted
 * - metadata: Additional contextual information
 */
export interface PersistedStoreData<K, V> {
  entries: [K, V][];
  timestamp: number;
  metadata?: Record<string, unknown>;
}
