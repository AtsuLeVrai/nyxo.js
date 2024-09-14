/**
 * A type that makes all properties of `T` optional except for those specified in `K`.
 *
 * @template T - The type with properties to be made optional or required.
 * @template K - The keys of the properties in `T` that should remain required.
 */
export type OptionalExcept<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
