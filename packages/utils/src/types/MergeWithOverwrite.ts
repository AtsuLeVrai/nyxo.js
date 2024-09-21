/**
 * A type that combines two types `T` and `U` by overwriting properties of `T` with properties of `U`.
 */
export type MergeWithOverwrite<T, U> = Omit<T, keyof U> & U;
