import type { HttpMethod } from "./http.types.js";

/**
 * Base properties shared by all HTTP event types.
 * Provides common fields for event tracking and correlation.
 */
export interface BaseHttpEvent {
  /**
   * ISO timestamp when the event occurred.
   * Format: "YYYY-MM-DDTHH:mm:ss.sssZ"
   */
  timestamp: string;

  /**
   * Unique identifier for the related request.
   * Used to correlate different events for the same request.
   */
  requestId: string;
}

/**
 * Emitted when an HTTP request begins.
 * Used for logging and monitoring the start of request lifecycle.
 */
export interface RequestStartEvent extends BaseHttpEvent {
  /**
   * API path for this request.
   * Path component of the URL without the origin.
   */
  path: string;

  /**
   * HTTP method used for the request.
   * One of the supported HTTP methods.
   */
  method: HttpMethod;
}

/**
 * Emitted when an HTTP request completes successfully.
 * Contains metrics and response information for successful requests.
 */
export interface RequestEvent extends BaseHttpEvent {
  /**
   * API path for this request.
   * Path component of the URL without the origin.
   */
  path: string;

  /**
   * HTTP method used for the request.
   * One of the supported HTTP methods.
   */
  method: HttpMethod;

  /**
   * HTTP status code received from the server.
   * Typically a 2xx code for success events.
   */
  statusCode: number;

  /**
   * Total request duration in milliseconds.
   * Measured from request start to response completion.
   */
  duration: number;

  /**
   * Size of response body in bytes, if available.
   * May be undefined if the size couldn't be determined.
   */
  responseSize?: number;
}

/**
 * Emitted when a request retry is attempted.
 * Contains information about the retry attempt and the error that triggered it.
 */
export interface RetryEvent extends BaseHttpEvent {
  /**
   * API path for this request.
   * Path component of the URL without the origin.
   */
  path: string;

  /**
   * HTTP method used for the request.
   * One of the supported HTTP methods.
   */
  method: HttpMethod;

  /**
   * The error that triggered the retry.
   * Contains details about what went wrong.
   */
  error: Error;

  /**
   * Current retry attempt (1-based).
   * Increments with each retry of the same request.
   */
  attempt: number;

  /**
   * Maximum configured retry attempts.
   * The upper limit for retry attempts.
   */
  maxAttempts: number;

  /**
   * Delay in milliseconds before this retry.
   * Often uses exponential backoff between attempts.
   */
  delay: number;

  /**
   * Categorized reason for the retry.
   * Explains why a retry was needed (e.g., "network", "server", "timeout").
   */
  reason: string;
}

/**
 * Emitted when a rate limit is encountered during a request.
 * Contains information about the rate limit and when it will reset.
 */
export interface RateLimitHitEvent extends BaseHttpEvent {
  /**
   * The bucket identifier for this rate limit.
   * Used to track rate limits for specific endpoints.
   */
  bucketId: string;

  /**
   * Time in milliseconds until the rate limit resets.
   * Indicates how long to wait before retrying.
   */
  resetAfter: number;

  /**
   * Whether this is a global rate limit affecting all requests.
   * False indicates a route-specific rate limit.
   */
  global: boolean;

  /**
   * The affected route if available.
   * May be undefined for global rate limits.
   */
  route?: string;

  /**
   * The affected HTTP method if available.
   * May be undefined for global rate limits.
   */
  method?: HttpMethod | "GLOBAL";
}

/**
 * Emitted when rate limit bucket information is updated.
 * Used for tracking and managing rate limit consumption.
 */
export interface RateLimitUpdateEvent extends BaseHttpEvent {
  /**
   * The bucket identifier for this rate limit.
   * Used to track rate limits for specific endpoints.
   */
  bucketId: string;

  /**
   * Remaining requests allowed in this rate limit window.
   * Decrements with each request to the same bucket.
   */
  remaining: number;

  /**
   * Total allowed requests in this rate limit window.
   * The maximum number of requests permitted in the window.
   */
  limit: number;

  /**
   * Time in milliseconds until the rate limit resets.
   * Countdown until the window refreshes.
   */
  resetAfter: number;

  /**
   * ISO timestamp when the rate limit will reset.
   * Absolute time when the window refreshes.
   */
  resetAt: string;

  /**
   * The affected route if available.
   * The API endpoint this bucket applies to.
   */
  route?: string;
}

/**
 * Emitted when a rate limit bucket expires.
 * Only emitted at verbose logging level.
 * Useful for debugging and monitoring rate limit behavior.
 */
export interface RateLimitExpireEvent extends BaseHttpEvent {
  /**
   * The bucket identifier for this rate limit.
   * Used to track rate limits for specific endpoints.
   */
  bucketId: string;

  /**
   * How long this bucket existed in milliseconds.
   * Total lifespan of the rate limit bucket.
   */
  lifespan: number;
}
