/**
 * A type that makes all properties of `T` required except for those specified in `K`.
 *
 * @template T - The type with properties to be made required or optional.
 * @template K - The keys of the properties in `T` that should remain optional.
 */
export type RequiredExcept<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
