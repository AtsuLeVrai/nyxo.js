import type { Readable } from "node:stream";
import type { FileInput } from "../handlers/index.js";

/**
 * Represents a single field error in a JSON API response.
 * Used to provide detailed information about validation failures or other field-specific errors.
 */
export interface JsonErrorField {
  /**
   * The error code identifying the type of error.
   * Usually a machine-readable string like "INVALID_FORMAT" or "REQUIRED_FIELD".
   */
  code: string;

  /**
   * Human-readable error message describing the issue.
   * Should be clear enough for end-users to understand the problem.
   */
  message: string;

  /**
   * Array representing the path to the field that caused the error.
   * Example: ["user", "email"] for a user's email field.
   */
  path: string[];
}

/**
 * Represents a standardized JSON error response from an API.
 * Follows a consistent format to make client-side error handling more predictable.
 */
export interface JsonErrorResponse {
  /**
   * The numeric error code (typically corresponds to HTTP status code).
   * Examples: 400 for bad request, 404 for not found, 500 for server error.
   */
  code: number;

  /**
   * The main error message providing a general description of the problem.
   * Should be concise but informative.
   */
  message: string;

  /**
   * Optional object containing field-specific errors.
   * Organized by field name with arrays of specific error details.
   */
  errors?: Record<string, { _errors: JsonErrorField[] }>;
}

/**
 * Supported HTTP methods for API requests.
 * Defines the standard methods that can be used when making HTTP requests.
 */
export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS";

/**
 * Configuration options for an HTTP request.
 * Contains all parameters needed to construct and send an API request.
 */
export interface HttpRequestOptions {
  /**
   * API path to request.
   * Should not include the base URL. Example: "/users/123".
   */
  path: string;

  /**
   * HTTP method to use for the request.
   * Determines how the request interacts with the server resource.
   */
  method: HttpMethod;

  /**
   * Request body data.
   * Can be a string, Buffer, or Readable stream.
   */
  body?: string | Buffer | Readable;

  /**
   * Request headers as key-value pairs.
   * Example: { "Content-Type": "application/json" }
   */
  headers?: Record<string, string>;

  /**
   * Query parameters to append to the URL.
   * Will be converted to a query string and appended to the path.
   */
  query?: object;

  /**
   * Files to upload with the request.
   * Can be a single file or an array of files.
   */
  files?: FileInput | FileInput[];

  /**
   * Audit log reason for the action.
   * Will be sent in the x-audit-log-reason header.
   */
  reason?: string;
}

/**
 * Structured response from an HTTP request with parsed data.
 * Provides a unified format for handling API responses.
 *
 * @template T - Type of the parsed response data
 */
export interface HttpResponse<T> {
  /**
   * HTTP status code returned by the server.
   * Standard codes as defined in the HTTP specification.
   */
  statusCode: number;

  /**
   * Normalized response headers as key-value pairs.
   * Header names are converted to lowercase.
   */
  headers: Record<string, string>;

  /**
   * Parsed response data.
   * Type depends on the generic parameter T.
   */
  data: T;

  /**
   * Reason for the response, if provided by the server.
   * May contain additional context about the response.
   */
  reason?: string;
}

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
 * Map of event names to their payload types.
 * Used for strongly-typed event handling.
 */
export interface RestEvents {
  /**
   * Emitted when an HTTP request completes successfully.
   * Contains response data, status code, and timing information.
   */
  request: [event: RequestEvent];

  /**
   * Emitted when a rate limit is encountered.
   * Contains information about the rate limit and when it will reset.
   */
  rateLimitHit: [event: RateLimitHitEvent];

  /**
   * Emitted when rate limit information is updated from a response.
   * Contains updated quota and reset timing information.
   */
  rateLimitUpdate: [event: RateLimitUpdateEvent];

  /**
   * Emitted when a rate limit bucket expires.
   * Contains bucket identification and lifespan information.
   */
  rateLimitExpire: [event: RateLimitExpireEvent];

  /**
   * Emitted when a request retry is attempted.
   * Contains error information, attempt count, and delay information.
   */
  retry: [event: RetryEvent];
}
