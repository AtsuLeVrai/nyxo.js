/**
 * A type that combines two types `T` and `U` by overwriting properties of `T` with properties of `U`.
 *
 * @template T - The base type whose properties are to be overwritten.
 * @template U - The type whose properties will overwrite those in `T`.
 */
export type MergeWithOverwrite<T, U> = Omit<T, keyof U> & U;
