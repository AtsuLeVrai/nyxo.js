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
