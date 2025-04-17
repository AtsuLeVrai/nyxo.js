import { camelCase } from "change-case";

/**
 * Converts all object keys from snake_case to camelCase format recursively.
 *
 * This utility function transforms all keys in an object hierarchy from
 * snake_case (e.g., 'user_id') to camelCase (e.g., 'userId').
 * It recursively processes nested objects and arrays.
 *
 * @template T - The type of the input object
 * @template R - The type of the output object with camelCase keys
 *
 * @param input - The object with snake_case keys to transform
 * @returns A new object with all keys converted to camelCase
 */
export function toCamelCasedDeep<T extends object, R = unknown>(input: T): R {
  // Handle null or undefined
  if (input === null || input === undefined) {
    return input as unknown as R;
  }

  // Handle array inputs by mapping each element
  if (Array.isArray(input)) {
    // Process each array element recursively
    return input.map((item) =>
      typeof item === "object" ? toCamelCasedDeep(item) : item,
    ) as unknown as R;
  }

  // Process object properties
  if (typeof input === "object") {
    // Create a new object to store transformed properties
    const result: Record<string, unknown> = {};

    // Iterate through all object keys
    for (const [key, value] of Object.entries(input)) {
      // Transform the key to camelCase format
      const camelKey = camelCase(key);

      // Handle nested objects and arrays recursively
      if (value !== null && typeof value === "object") {
        result[camelKey] = toCamelCasedDeep(value);
      } else {
        // For primitive values, just assign with the transformed key
        result[camelKey] = value;
      }
    }

    return result as R;
  }

  // For non-object types, return as is
  return input as unknown as R;
}
