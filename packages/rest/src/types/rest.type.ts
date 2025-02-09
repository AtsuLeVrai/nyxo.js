import type { Dispatcher } from "undici";
import type { FileInput } from "./file.type.js";
import type { RetryAttempt } from "./retry.type.js";

export interface JsonErrorField {
  code: string;
  message: string;
  path: string[];
}

/** @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#json} */
export interface JsonErrorResponse {
  code: number;
  message: string;
  errors?: Record<string, { _errors: JsonErrorField[] }>;
}

export interface ApiRequestOptions extends Dispatcher.RequestOptions {
  files?: FileInput | FileInput[];
  reason?: string;
}

export interface ApiRequest {
  path: string;
  method: string;
  headers: Record<string, string>;
  statusCode: number;
  latency: number;
  timestamp: number;
}

export interface RestEventHandlers {
  debug: (message: string, context?: Record<string, unknown>) => void;
  error: (error: Error | string, context?: Record<string, unknown>) => void;
  requestFinish: (request: ApiRequest) => void;
  retryAttempt: (retry: RetryAttempt) => void;
  rateLimitExceeded: (bucket: string, resetAfter: number) => void;
  bucketExpired: (bucketHash: string) => void;
  bucketCreated: (bucketHash: string, route: string) => void;
  bucketUpdated: (
    bucketHash: string,
    remaining: number,
    resetAfter: number,
  ) => void;
}
