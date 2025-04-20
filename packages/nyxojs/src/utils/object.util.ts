import { camelCase, snakeCase } from "change-case";
import type {
  CamelCasedProperties,
  CamelCasedPropertiesDeep,
  SnakeCasedProperties,
  SnakeCasedPropertiesDeep,
} from "type-fest";

/**
 * Converts object keys from snake_case to camelCase format at the first level only.
 *
 * This utility function transforms the keys in an object from
 * snake_case (e.g., 'user_id') to camelCase (e.g., 'userId')
 * without recursively processing nested objects or arrays.
 *
 * @template T - The type of the input object
 * @template R - The type of the output object with camelCase keys
 *
 * @param input - The object with snake_case keys to transform
 * @returns A new object with first-level keys converted to camelCase
 */
export function toCamelCasedProperties<T extends object>(
  input: T,
): CamelCasedProperties<T> {
  // Handle null or undefined
  if (input === null || input === undefined) {
    return input as unknown as CamelCasedProperties<T>;
  }

  // Handle array inputs by mapping each element (without recursion)
  if (Array.isArray(input)) {
    return input as unknown as CamelCasedProperties<T>;
  }

  // Process object properties (first level only)
  if (typeof input === "object") {
    const result: Record<string, unknown> = {};

    // Iterate through all object keys
    for (const [key, value] of Object.entries(input)) {
      // Transform the key to camelCase format
      const camelKey = camelCase(key);

      // Assign value without recursive processing
      result[camelKey] = value;
    }

    return result as CamelCasedProperties<T>;
  }

  // For non-object types, return as is
  return input as unknown as CamelCasedProperties<T>;
}

/**
 * Converts all object keys from snake_case to camelCase format recursively.
 *
 * This utility function transforms all keys in an object hierarchy from
 * snake_case (e.g., 'user_id') to camelCase (e.g., 'userId').
 * It recursively processes nested objects and arrays.
 *
 * @template T - The type of the input object
 *
 * @param input - The object with snake_case keys to transform
 * @returns A new object with all keys converted to camelCase
 */
export function toCamelCasedPropertiesDeep<T extends object>(
  input: T,
): CamelCasedPropertiesDeep<T> {
  // Handle null or undefined
  if (input === null || input === undefined) {
    return input as unknown as CamelCasedPropertiesDeep<T>;
  }

  // Handle array inputs by mapping each element
  if (Array.isArray(input)) {
    // Process each array element recursively
    return input.map((item) =>
      typeof item === "object" && item !== null
        ? toCamelCasedPropertiesDeep(item)
        : item,
    ) as unknown as CamelCasedPropertiesDeep<T>;
  }

  // Process object properties using toCamelCasedProperties for the first level
  const result = toCamelCasedProperties(input) as Record<string, unknown>;

  // Process nested objects and arrays recursively
  for (const [key, value] of Object.entries(result)) {
    if (value !== null && typeof value === "object") {
      result[key] = toCamelCasedPropertiesDeep(value as object);
    }
  }

  return result as CamelCasedPropertiesDeep<T>;
}

/**
 * Converts object keys from camelCase to snake_case format at the first level only.
 *
 * This utility function transforms the keys in an object from
 * camelCase (e.g., 'userId') to snake_case (e.g., 'user_id')
 * without recursively processing nested objects or arrays.
 *
 * @template T - The type of the input object
 *
 * @param input - The object with camelCase keys to transform
 * @returns A new object with first-level keys converted to snake_case
 */
export function toSnakeCaseProperties<T extends object>(
  input: T,
): SnakeCasedProperties<T> {
  // Handle null or undefined
  if (input === null || input === undefined) {
    return input as unknown as SnakeCasedProperties<T>;
  }

  // Handle array inputs by returning as is (without recursion)
  if (Array.isArray(input)) {
    return input as unknown as SnakeCasedProperties<T>;
  }

  // Process object properties (first level only)
  if (typeof input === "object") {
    const result: Record<string, unknown> = {};

    // Iterate through all object keys
    for (const [key, value] of Object.entries(input)) {
      // Transform the key to snake_case format
      const snakeKey = snakeCase(key);

      // Assign value without recursive processing
      result[snakeKey] = value;
    }

    return result as SnakeCasedProperties<T>;
  }

  // For non-object types, return as is
  return input as unknown as SnakeCasedProperties<T>;
}

/**
 * Converts all object keys from camelCase to snake_case format recursively.
 *
 * This utility function transforms all keys in an object hierarchy from
 * camelCase (e.g., 'userId') to snake_case (e.g., 'user_id').
 * It recursively processes nested objects and arrays.
 *
 * @template T - The type of the input object
 *
 * @param input - The object with camelCase keys to transform
 * @returns A new object with all keys converted to snake_case
 */
export function toSnakeCasePropertiesDeep<T extends object>(
  input: T,
): SnakeCasedPropertiesDeep<T> {
  // Handle null or undefined
  if (input === null || input === undefined) {
    return input as unknown as SnakeCasedPropertiesDeep<T>;
  }

  // Handle array inputs by mapping each element
  if (Array.isArray(input)) {
    // Process each array element recursively
    return input.map((item) =>
      typeof item === "object" && item !== null
        ? toSnakeCasePropertiesDeep(item)
        : item,
    ) as unknown as SnakeCasedPropertiesDeep<T>;
  }

  // Process object properties using toSnakeCaseProperties for the first level
  const result = toSnakeCaseProperties(input) as Record<string, unknown>;

  // Process nested objects and arrays recursively
  for (const [key, value] of Object.entries(result)) {
    if (value !== null && typeof value === "object") {
      result[key] = toSnakeCasePropertiesDeep(value as object);
    }
  }

  return result as SnakeCasedPropertiesDeep<T>;
}
