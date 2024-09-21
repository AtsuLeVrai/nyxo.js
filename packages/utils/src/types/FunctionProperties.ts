/**
 * A utility type that extracts the keys of properties that are functions from a given type.
 */
export type FunctionProperties<T> = {
    [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];
