/**
 * A type that extracts the keys of an object of type `T` whose values are functions.
 *
 * @template T - The type of the object whose method keys are being extracted.
 */
export type MethodsOf<T> = {
    [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];
