/**
 * A type that makes all properties of `T` required except for those specified in `K`.
 */
export type RequiredExcept<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
