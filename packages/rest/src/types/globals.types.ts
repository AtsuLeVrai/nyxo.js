import type { Dispatcher } from "undici";
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
  headers: Record<string, string>;
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
 * Base interface for all REST events
 */
export interface RestEventBase {
  /** Timestamp when the event occurred (ISO string) */
  timestamp: string;

  /** Unique identifier for this request */
  requestId: string;

  /** Unique identifier for correlating related events */
  correlationId?: string;
}

/**
 * Base interface for HTTP request-related events
 */
export interface HttpRequestEventBase extends RestEventBase {
  /** Request path */
  path: string;

  /** HTTP method used */
  method: Dispatcher.HttpMethod;

  /** Request headers */
  headers: Record<string, string>;
}

/**
 * Event emitted when an HTTP request is initiated
 */
export type RequestStartEvent = HttpRequestEventBase;

/**
 * Event emitted when an HTTP request completes
 */
export interface RequestCompleteEvent extends HttpRequestEventBase {
  /** HTTP status code received */
  statusCode: number;

  /** Response headers */
  responseHeaders: Record<string, string>;

  /** Request duration in milliseconds */
  duration: number;

  /** Size of the response in bytes */
  responseSize?: number;
}

/**
 * Event emitted when an HTTP request fails
 */
export interface RequestFailureEvent extends HttpRequestEventBase {
  /** Error object or message */
  error: Error;

  /** HTTP status code if available */
  statusCode?: number;

  /** Response headers if available */
  responseHeaders?: Record<string, string>;

  /** Request duration in milliseconds */
  duration: number;
}

/**
 * Base interface for rate limit related events
 */
export interface RateLimitEventBase extends RestEventBase {
  /** Rate limit bucket hash or identifier */
  bucketId: string;

  /** Route associated with this rate limit */
  route?: string;

  /** HTTP method associated with this rate limit */
  method?: Dispatcher.HttpMethod;

  /** Reason for the rate limit being hit */
  reason?: string;
}

/**
 * Event emitted when a rate limit is hit
 */
export interface RateLimitHitEvent extends RateLimitEventBase {
  /** Time in milliseconds until the rate limit resets */
  resetAfter: number;

  /** Global rate limit flag */
  global: boolean;

  /** Retry-After header value if present */
  retryAfter?: number;
}

/**
 * Event emitted when rate limit information is updated
 */
export interface RateLimitUpdateEvent extends RateLimitEventBase {
  /** Remaining requests in the current window */
  remaining: number;

  /** Total allowed requests in the current window */
  limit: number;

  /** Time in milliseconds until the rate limit resets */
  resetAfter: number;

  /** Full reset timestamp in ISO format */
  resetAt: string;
}

/**
 * Event emitted when a rate limit bucket expires
 */
export interface RateLimitExpireEvent extends RateLimitEventBase {
  /** Time in milliseconds the bucket was alive */
  lifespan: number;
}

/**
 * Event emitted when a request retry is attempted
 */
export interface RetryAttemptEvent extends RestEventBase {
  /** Original error that triggered the retry */
  error: Error;

  /** Current retry attempt number (1-based) */
  attemptNumber: number;

  /** Maximum number of attempts configured */
  maxAttempts: number;

  /** Delay in milliseconds before this retry attempt */
  delayMs: number;

  /** The path being requested */
  path: string;

  /** The HTTP method being used */
  method: Dispatcher.HttpMethod;

  /** Reason for the retry */
  reason: string;
}

/**
 * Event payload for queue state changes
 */
export interface QueueStateEvent {
  /**
   * Timestamp of the event
   */
  timestamp: string;

  /**
   * Number of items currently in the queue
   */
  queueSize: number;

  /**
   * Number of requests currently executing
   */
  running: number;

  /**
   * Maximum allowed concurrent requests
   */
  concurrency: number;
}

/**
 * Event payload for request processing events
 */
export interface QueueProcessEvent {
  /**
   * Timestamp of the event
   */
  timestamp: string;

  /**
   * Unique ID of the request
   */
  requestId: string;

  /**
   * Time spent in queue (ms)
   */
  queueTime: number;

  /**
   * API path for the request
   */
  path: string;

  /**
   * HTTP method for the request
   */
  method: Dispatcher.HttpMethod;

  /**
   * Priority level of the request
   */
  priority: number;
}

/**
 * Map of event names to their corresponding payload types
 */
export interface RestEvents {
  /** Emitted when a request is about to be sent */
  requestStart: [event: RequestStartEvent];

  /** Emitted when a request completes successfully */
  requestComplete: [event: RequestCompleteEvent];

  /** Emitted when a request fails */
  requestFailure: [event: RequestFailureEvent];

  /** Emitted when a rate limit is hit */
  rateLimitHit: [event: RateLimitHitEvent];

  /** Emitted when rate limit information is updated */
  rateLimitUpdate: [event: RateLimitUpdateEvent];

  /** Emitted when a rate limit bucket expires */
  rateLimitExpire: [event: RateLimitExpireEvent];

  /** Emitted when a request retry is attempted */
  retryAttempt: [event: RetryAttemptEvent];

  /** Emitted when an item is added to the queue */
  queueAdd: [event: QueueProcessEvent];

  /** Emitted when an item starts processing from the queue */
  queueProcess: [event: QueueProcessEvent];

  /** Emitted when an item is completed (successfully or with error) */
  queueComplete: [event: QueueProcessEvent & { success: boolean }];

  /** Emitted when an item times out in the queue */
  queueTimeout: [event: QueueProcessEvent];

  /** Emitted when queue state changes (size, running count) */
  queueState: [event: QueueStateEvent];

  /** Emitted when an item is rejected due to queue being full */
  queueReject: [event: QueueProcessEvent & { reason: string }];
}
