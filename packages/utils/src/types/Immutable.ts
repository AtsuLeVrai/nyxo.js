/**
 * A type that recursively makes all properties of an object immutable.
 */
export type Immutable<T> = T extends (infer U)[]
    ? readonly Immutable<U>[]
    : T extends Map<infer K, infer V>
      ? ReadonlyMap<Immutable<K>, Immutable<V>>
      : T extends Set<infer U>
        ? ReadonlySet<Immutable<U>>
        : T extends object
          ? { readonly [K in keyof T]: Immutable<T[K]> }
          : T;
