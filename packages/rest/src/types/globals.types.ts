import type { Dispatcher } from "undici";
import type { IncomingHttpHeaders } from "undici/types/header.js";
import type { FileInput } from "../handlers/index.js";

/**
 * Response from an HTTP request with parsed data
 */
export interface HttpResponse<T = unknown> {
  /** Parsed response data */
  data: T;

  /** HTTP status code */
  statusCode: number;

  /** Normalized response headers */
  headers: IncomingHttpHeaders;
}

/**
 * Prepared request data ready to be sent
 */
export interface ParsedRequest {
  /** Fully constructed URL */
  url: URL;

  /** Request options for undici */
  options: Dispatcher.RequestOptions;
}

/**
 * Extended request options for Discord API
 */
export interface ApiRequestOptions extends Dispatcher.RequestOptions {
  /** Files to upload with the request */
  files?: FileInput | FileInput[];

  /** Audit log reason for the action (goes into x-audit-log-reason header) */
  reason?: string;
}

/**
 * Base properties shared by all events
 */
export interface EventBase {
  /** ISO timestamp when the event occurred */
  timestamp: string;

  /** Unique identifier for the related request */
  requestId: string;
}

/**
 * HTTP request-related base properties
 */
export interface HttpEventBase extends EventBase {
  /** API path for this request */
  path: string;

  /** HTTP method used */
  method: Dispatcher.HttpMethod;
}

/**
 * Event emitted when a request begins
 */
export interface RequestStartEvent extends HttpEventBase {
  /** Request headers */
  headers: IncomingHttpHeaders;
}

/**
 * Event emitted when a request completes successfully
 */
export interface RequestSuccessEvent extends HttpEventBase {
  /** HTTP status code received */
  statusCode: number;

  /** Response headers */
  headers: IncomingHttpHeaders;

  /** Total request duration in milliseconds */
  duration: number;

  /** Size of response body in bytes */
  responseSize?: number;
}

/**
 * Event emitted when a request fails
 */
export interface RequestFailureEvent extends HttpEventBase {
  /** The error that occurred */
  error: Error;

  /** HTTP status code if received */
  statusCode?: number;

  /** Response headers if received */
  headers?: IncomingHttpHeaders;

  /** Request duration in milliseconds */
  duration: number;
}

/**
 * Event emitted when a rate limit is encountered
 */
export interface RateLimitHitEvent extends EventBase {
  /** The bucket identifier */
  bucketId: string;

  /** Time in seconds until the rate limit resets */
  resetAfter: number;

  /** Whether this is a global rate limit */
  global: boolean;

  /** The affected route if available */
  route?: string;

  /** The affected HTTP method if available */
  method?: Dispatcher.HttpMethod;

  /** Human-readable reason for the rate limit */
  reason?: string;
}

/**
 * Event emitted when rate limit bucket information is updated
 */
export interface RateLimitUpdateEvent extends EventBase {
  /** The bucket identifier */
  bucketId: string;

  /** Remaining requests allowed in this window */
  remaining: number;

  /** Total allowed requests in this window */
  limit: number;

  /** Time in seconds until the rate limit resets */
  resetAfter: number;

  /** ISO timestamp when the rate limit will reset */
  resetAt: string;

  /** The affected route if available */
  route?: string;
}

/**
 * Event emitted when a rate limit bucket expires
 * Only emitted at verbose level
 */
export interface RateLimitExpireEvent extends EventBase {
  /** The bucket identifier */
  bucketId: string;

  /** How long this bucket existed in milliseconds */
  lifespan: number;
}

/**
 * Event emitted when a request retry is attempted
 */
export interface RetryEvent extends HttpEventBase {
  /** The error that triggered the retry */
  error: Error;

  /** Current retry attempt (1-based) */
  attempt: number;

  /** Maximum configured retry attempts */
  maxAttempts: number;

  /** Delay in milliseconds before this retry */
  delayMs: number;

  /** Categorized reason for the retry */
  reason: string;
}

/**
 * Map of event names to their payload types
 */
export interface RestEvents {
  /** Request lifecycle events */
  requestStart: [event: RequestStartEvent];
  requestSuccess: [event: RequestSuccessEvent];
  requestFailure: [event: RequestFailureEvent];

  /** Rate limit events */
  rateLimitHit: [event: RateLimitHitEvent];
  rateLimitUpdate: [event: RateLimitUpdateEvent];
  rateLimitExpire: [event: RateLimitExpireEvent];

  /** Retry events */
  retry: [event: RetryEvent];
}
