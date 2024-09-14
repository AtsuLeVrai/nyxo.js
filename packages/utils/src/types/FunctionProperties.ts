/**
 * A utility type that extracts the keys of properties that are functions from a given type.
 *
 * @template T - The type from which to extract function property keys.
 */
export type FunctionProperties<T> = {
    [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];
