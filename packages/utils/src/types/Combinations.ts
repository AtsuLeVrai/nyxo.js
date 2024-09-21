/**
 * A type that generates a union of objects, each containing a single key-value pair from the original type `T`.
 */
export type Combinations<T> = {
    [K in keyof T]: { [S in K]: T[S] };
}[keyof T];
