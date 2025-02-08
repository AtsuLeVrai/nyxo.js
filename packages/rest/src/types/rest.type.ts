import type { Dispatcher } from "undici";
import type { FileInput } from "./file.type.js";
import type { RateLimitErrorContext } from "./rate-limit.type.js";

/**
 * Represents a field in a JSON error response
 */
export interface JsonErrorField {
  /** Error code identifier */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Path to the field that caused the error */
  path: string[];
}

/**
 * Represents a complete JSON error response from the Discord API
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#json}
 */
export interface JsonErrorResponse {
  /** Discord error code */
  code: number;
  /** Human-readable error message */
  message: string;
  /** Detailed error information by field */
  errors?: Record<string, { _errors: JsonErrorField[] }>;
}

/**
 * Extended request options for Discord API requests
 */
export interface ApiRequestOptions extends Dispatcher.RequestOptions {
  /** Files to be uploaded with the request */
  files?: FileInput | FileInput[];
  /** Audit log reason for the request */
  reason?: string;
}

/**
 * Represents a Discord API request event for logging/monitoring
 */
export interface ApiRequestEvent {
  /** API endpoint path */
  path: string;
  /** HTTP method used */
  method: string;
  /** Request headers */
  headers: Record<string, string>;
  /** Response status code */
  statusCode: number;
  /** Request latency in milliseconds */
  latency: number;
  /** Request timestamp in milliseconds */
  timestamp: number;
  /** Unique request identifier */
  requestId: string;
}

/**
 * Event handlers for REST client events
 */
export interface RestEventHandlers {
  /** Handles debug messages */
  debug: (message: string, context?: Record<string, unknown>) => void;
  /** Handles errors */
  error: (error: Error | string, context?: Record<string, unknown>) => void;
  /** Handles request events */
  request: (request: ApiRequestEvent) => void;
  /** Handles rate limit events */
  rateLimited: (rateLimit: RateLimitErrorContext) => void;
}
