/**
 * Transforms all properties of a type to be non-nullable and required.
 * Removes both optional modifiers (?:) and null/undefined unions from all properties,
 * creating a strictly typed object with guaranteed non-null values.
 *
 * Uses mapped type modifiers:
 * - `-?` removes optional property modifiers
 * - `NonNullable<T[K]>` removes null and undefined from union types
 *
 * @typeParam T - Source object type to transform
 *
 * @see {@link SetNullable} for the inverse transformation (making properties nullable)
 * @see {@link https://www.typescriptlang.org/docs/handbook/utility-types.html#nonnullabletype} for NonNullable utility
 */
export type SetNonNullable<T> = {
  [K in keyof T]-?: NonNullable<T[K]>;
};

/**
 * Transforms all properties of a type to be nullable but required.
 * Removes optional modifiers (?:) while adding null to the union type of each property,
 * creating an object where all properties must be present but can explicitly be null.
 *
 * Uses mapped type modifiers:
 * - `-?` removes optional property modifiers
 * - `T[K] | null` adds null to the existing property type union
 *
 * Useful for database models, API responses, and serialization where explicit null
 * values are meaningful and different from missing properties.
 *
 * @typeParam T - Source object type to transform
 *
 * @see {@link SetNonNullable} for the inverse transformation (removing null from properties)
 */
export type SetNullable<T> = {
  [K in keyof T]-?: T[K] | null;
};
