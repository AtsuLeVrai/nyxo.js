/**
 * A type that makes specified properties of `T` mutable (i.e., not readonly).
 *
 * @template T - The type with properties to be made mutable.
 * @template K - The keys of the properties in `T` that should be mutable.
 */
export type Mutable<T, K extends keyof T> = Omit<T, K> & {
    -readonly [P in K]: T[P];
};
