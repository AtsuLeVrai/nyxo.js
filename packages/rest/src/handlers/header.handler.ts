import type { IncomingHttpHeaders } from "node:http";

export type RawHeaders =
  | string[]
  | IncomingHttpHeaders
  | Iterable<[string, string | string[] | undefined]>
  | Record<string, string | string[] | undefined>
  | null
  | undefined;

export interface ParsedHeaders {
  headers: Record<string, string>;
  rawHeaders: Record<string, string | string[]>;
}

export const HeaderHandler = {
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

  getValue(headers: RawHeaders, key: string): string | undefined {
    return this.parse(headers).headers[this.normalizeKey(key)];
  },

  getNumber(headers: RawHeaders, key: string): number | undefined {
    const value = this.getValue(headers, key);
    if (!value) {
      return undefined;
    }

    const num = Number(value);
    return Number.isNaN(num) ? undefined : num;
  },

  has(headers: RawHeaders, key: string): boolean {
    return this.normalizeKey(key) in this.parse(headers).headers;
  },

  normalizeKey(key: string): string {
    return key.toLowerCase().trim();
  },

  normalizeValue(value: string | string[] | undefined): string | undefined {
    if (value === undefined) {
      return undefined;
    }
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    return value.trim();
  },

  isIterable(
    value: unknown,
  ): value is Iterable<[string, string | string[] | undefined]> {
    return (
      typeof value === "object" && value !== null && Symbol.iterator in value
    );
  },

  fromArray(headers: string[]): Record<string, string | string[]> {
    const result: Record<string, string | string[]> = {};

    for (let i = 0; i < headers.length; i += 2) {
      const key = headers[i];
      const value = headers[i + 1];

      if (key === undefined || value === undefined) {
        continue;
      }

      const normalizedKey = this.normalizeKey(key);
      const existing = result[normalizedKey];

      if (existing) {
        result[normalizedKey] = Array.isArray(existing)
          ? [...existing, value]
          : [existing, value];
      } else {
        result[normalizedKey] = value;
      }
    }

    return result;
  },

  fromIterable(
    headers: Iterable<[string, string | string[] | undefined]>,
  ): Record<string, string | string[]> {
    const result: Record<string, string | string[]> = {};

    for (const [key, value] of headers) {
      if (value === undefined) {
        continue;
      }

      const normalizedKey = this.normalizeKey(key);
      const existing = result[normalizedKey];

      if (Array.isArray(value)) {
        result[normalizedKey] = value;
      } else if (existing) {
        result[normalizedKey] = Array.isArray(existing)
          ? [...existing, value]
          : [existing, value];
      } else {
        result[normalizedKey] = value;
      }
    }

    return result;
  },

  normalizeHeaders(headers: RawHeaders): Record<string, string | string[]> {
    if (Array.isArray(headers)) {
      return this.fromArray(headers);
    }

    if (this.isIterable(headers)) {
      return this.fromIterable(headers);
    }

    return headers as Record<string, string | string[]>;
  },

  convertToStringRecord(
    headers: Record<string, string | string[]>,
  ): Record<string, string> {
    return Object.entries(headers).reduce<Record<string, string>>(
      (acc, [key, value]) => {
        const normalizedValue = this.normalizeValue(value);
        if (normalizedValue !== undefined) {
          acc[this.normalizeKey(key)] = normalizedValue;
        }
        return acc;
      },
      {},
    );
  },
} as const;
