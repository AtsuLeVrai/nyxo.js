/**
 * A type that represents a value that can either be a promise of type `T` or a value of type `T`.
 */
export type Awaitable<T> = Promise<T> | T;
