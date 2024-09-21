/**
 * A conditional type that resolves to type `T` if `C` is true, otherwise resolves to type `F`.
 */
export type If<C extends boolean, T, F> = C extends true ? T : F;
