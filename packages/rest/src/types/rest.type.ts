import type { Dispatcher } from "undici";
import type { RestOptions } from "../options/index.js";
import type { FileInput } from "./file.type.js";
import type { RateLimitErrorContext } from "./rate-limit.type.js";

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

export interface ApiRequestEvent {
  path: string;
  method: string;
  headers: Record<string, string>;
  statusCode: number;
  latency: number;
  timestamp: number;
  requestId: string;
}

export interface ApiRequestRetryEvent {
  path: string;
  method: string;
  timestamp: number;
  retryAfter: number;
}

interface SessionCreatedEvent {
  sessionId: string;
  timestamp: number;
  options: Partial<RestOptions>;
}

interface SessionDestroyedEvent {
  sessionId: string;
  timestamp: number;
}

interface SessionUpdatedEvent {
  sessionId: string;
  timestamp: number;
  oldOptions: Partial<RestOptions>;
  newOptions: Partial<RestOptions>;
}

export interface RestEventHandlers {
  debug: (message: string, context?: Record<string, unknown>) => void;
  error: (error: Error | string, context?: Record<string, unknown>) => void;
  requestFinish: (request: ApiRequestEvent) => void;
  requestRetry: (request: ApiRequestRetryEvent) => void;
  rateLimited: (context: RateLimitErrorContext) => void;
  rateLimitExceeded: (bucket: string, resetAfter: number) => void;
  bucketExpired: (bucketHash: string) => void;
  bucketCreated: (bucketHash: string, route: string) => void;
  bucketUpdated: (
    bucketHash: string,
    remaining: number,
    resetAfter: number,
  ) => void;
  sessionCreated: (event: SessionCreatedEvent) => void;
  sessionDestroyed: (event: SessionDestroyedEvent) => void;
  sessionUpdated: (event: SessionUpdatedEvent) => void;
}
