export type SetNonNullable<T> = {
  [K in keyof T]-?: NonNullable<T[K]>;
};

export type SetNullable<T> = {
  [K in keyof T]-?: T[K] | null;
};
