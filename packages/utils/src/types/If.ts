/**
 * A conditional type that resolves to type `T` if `C` is true, otherwise resolves to type `F`.
 *
 * @template C - A boolean condition.
 * @template T - The type to resolve to if `C` is true.
 * @template F - The type to resolve to if `C` is false.
 */
export type If<C extends boolean, T, F> = C extends true ? T : F;
