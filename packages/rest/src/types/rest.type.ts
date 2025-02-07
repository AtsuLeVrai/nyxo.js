import type { Dispatcher } from "undici";
import type { FileInput } from "./file.type.js";
import type { RateLimitError } from "./rate-limit.type.js";

export interface JsonErrorField {
  code: string;
  message: string;
  path: string[];
}

/**
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#json-example-json-error-response}
 */
export interface JsonErrorEntity {
  code: number;
  message: string;
  errors?: Record<string, { _errors: JsonErrorField[] }>;
}

export interface RequestOptions extends Dispatcher.RequestOptions {
  files?: FileInput | FileInput[];
  reason?: string;
}

export interface RequestEvent {
  path: string;
  method: string;
  headers: Record<string, string>;
  statusCode: number;
  latency: number;
  timestamp: number;
}

export interface RestEvents {
  debug: (message: string, context?: Record<string, unknown>) => void;
  error: (error: Error | string, context?: Record<string, unknown>) => void;
  request: (request: RequestEvent) => void;
  rateLimited: (rateLimit: RateLimitError) => void;
}
