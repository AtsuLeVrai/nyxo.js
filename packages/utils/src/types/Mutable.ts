/**
 * A type that makes specified properties of `T` mutable (i.e., not readonly).
 */
export type Mutable<T, K extends keyof T> = Omit<T, K> & {
    -readonly [P in K]: T[P];
};
