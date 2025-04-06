import type { IncomingHttpHeaders } from "node:http";

/**
 * Represents all possible formats of HTTP headers that can be handled.
 *
 * @remarks
 * This type accommodates various header formats including:
 * - String arrays (as provided by some HTTP clients)
 * - Node.js IncomingHttpHeaders objects
 * - Record objects with string or string[] values
 * - Iterable collections of key-value pairs
 * - null or undefined values
 */
export type RawHeaders =
  | string[] // String array format: ['key1', 'value1', 'key2', 'value2']
  | IncomingHttpHeaders // Node.js incoming headers
  | Iterable<[string, string | string[] | undefined]> // Headers as iterable (like Headers from fetch API)
  | Record<string, string | string[] | undefined> // Plain object with string keys
  | null
  | undefined;

/**
 * Result of parsing headers, containing both normalized and raw representations.
 */
export interface ParsedHeaders {
  /** Normalized headers with all values as strings (multiple values joined with comma) */
  headers: Record<string, string>;

  /** Raw headers with preserved array values for multi-value headers */
  rawHeaders: Record<string, string | string[]>;
}

/**
 * Utility for handling HTTP headers in various formats.
 */
export const HeaderHandler = {
  /**
   * Parses headers from any supported format into a standardized object.
   *
   * @param headers - Headers in any supported format
   * @returns An object containing both normalized and raw representations of the headers
   */
  parse(headers: RawHeaders): ParsedHeaders {
    if (!headers) {
      return { headers: {}, rawHeaders: {} };
    }

    const rawHeaders = this.normalizeHeaders(headers);
    const normalizedHeaders = this.convertToStringRecord(rawHeaders);

    return {
      headers: normalizedHeaders,
      rawHeaders,
    };
  },

  /**
   * Extracts a specific header value by key.
   *
   * @param headers - Headers in any supported format
   * @param key - The header key to extract (case-insensitive)
   * @returns The header value as a string, or undefined if not found
   */
  getValue(headers: RawHeaders, key: string): string | undefined {
    if (!headers) {
      return undefined;
    }

    const normalizedKey = this.normalizeKey(key);
    const parsedHeaders = this.parse(headers);

    return parsedHeaders.headers[normalizedKey];
  },

  /**
   * Extracts a numeric header value by key.
   *
   * @param headers - Headers in any supported format
   * @param key - The header key to extract (case-insensitive)
   * @returns The header value parsed as a number, or undefined if not found or not a number
   */
  getNumber(headers: RawHeaders, key: string): number | undefined {
    const value = this.getValue(headers, key);
    if (value === undefined) {
      return undefined;
    }

    const num = Number(value);
    return Number.isNaN(num) ? undefined : num;
  },

  /**
   * Checks if a specific header exists.
   *
   * @param headers - Headers in any supported format
   * @param key - The header key to check (case-insensitive)
   * @returns True if the header exists, false otherwise
   */
  has(headers: RawHeaders, key: string): boolean {
    if (!headers) {
      return false;
    }

    const normalizedKey = this.normalizeKey(key);
    return normalizedKey in this.parse(headers).headers;
  },

  /**
   * Normalizes a header key to lowercase and trims whitespace.
   *
   * @param key - The header key to normalize
   * @returns The normalized key
   */
  normalizeKey(key: string): string {
    return key.toLowerCase().trim();
  },

  /**
   * Normalizes a header value by joining arrays and trimming strings.
   *
   * @param value - The header value to normalize
   * @returns The normalized value as a string, or undefined if the input is undefined
   */
  normalizeValue(value: string | string[] | undefined): string | undefined {
    if (value === undefined) {
      return undefined;
    }
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    return value.trim();
  },

  /**
   * Checks if a value is iterable.
   *
   * @param value - The value to check
   * @returns True if the value is iterable, false otherwise
   */
  isIterable(
    value: unknown,
  ): value is Iterable<[string, string | string[] | undefined]> {
    return (
      typeof value === "object" &&
      value !== null &&
      Symbol.iterator in value &&
      typeof value[Symbol.iterator] === "function"
    );
  },

  /**
   * Normalizes headers from any supported format to a consistent record structure.
   *
   * @param headers - Headers in any supported format
   * @returns A normalized record of headers
   */
  normalizeHeaders(headers: RawHeaders): Record<string, string | string[]> {
    // Handle string arrays (alternating key-value pairs)
    if (Array.isArray(headers)) {
      const result: Record<string, string | string[]> = {};

      for (let i = 0; i < headers.length; i += 2) {
        const key = headers[i];
        const value = headers[i + 1];

        if (key === undefined || value === undefined) {
          continue;
        }

        const normalizedKey = this.normalizeKey(key);
        const existing = result[normalizedKey];

        if (existing !== undefined) {
          result[normalizedKey] = Array.isArray(existing)
            ? [...existing, value]
            : [existing, value];
        } else {
          result[normalizedKey] = value;
        }
      }

      return result;
    }

    // Handle iterables (Maps, Headers, etc.)
    if (this.isIterable(headers)) {
      const result: Record<string, string | string[]> = {};

      for (const [key, value] of headers) {
        if (value === undefined) {
          continue;
        }

        const normalizedKey = this.normalizeKey(key);
        const existing = result[normalizedKey];

        if (Array.isArray(value)) {
          result[normalizedKey] = value;
        } else if (existing !== undefined) {
          result[normalizedKey] = Array.isArray(existing)
            ? [...existing, value]
            : [existing, value];
        } else {
          result[normalizedKey] = value;
        }
      }

      return result;
    }

    // Handle plain objects
    const result: Record<string, string | string[]> = {};

    if (headers && typeof headers === "object") {
      for (const key in headers) {
        if (Object.hasOwn(headers, key)) {
          const value = headers[key];
          if (value !== undefined) {
            result[this.normalizeKey(key)] = value;
          }
        }
      }
    }

    return result;
  },

  /**
   * Converts a record with possibly array values to a record with only string values.
   *
   * @param headers - Record with possibly array values
   * @returns Record with only string values
   */
  convertToStringRecord(
    headers: Record<string, string | string[]>,
  ): Record<string, string> {
    const result: Record<string, string> = {};

    for (const [key, value] of Object.entries(headers)) {
      const normalizedValue = this.normalizeValue(value);
      if (normalizedValue !== undefined) {
        result[this.normalizeKey(key)] = normalizedValue;
      }
    }

    return result;
  },
} as const;
