/**
 * A type that extracts the keys of an object of type `T` whose values are not functions.
 */
export type PropertiesOf<T> = {
    [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
