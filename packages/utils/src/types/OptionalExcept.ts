/**
 * A type that makes all properties of `T` optional except for those specified in `K`.
 */
export type OptionalExcept<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
