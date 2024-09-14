/**
 * A type that generates a union of objects, each containing a single key-value pair from the original type `T`.
 *
 * @template T - The type whose key-value pairs are being transformed into individual objects.
 */
export type Combinations<T> = {
    [K in keyof T]: { [S in K]: T[S] };
}[keyof T];
