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
 * Types of request events
 */
export type RequestEventType = "start" | "complete" | "failure";

/**
 * Base interface for request events
 */
export interface RequestEventBase extends HttpRequestEventBase {
  /** Type of request event */
  type: RequestEventType;
}

/**
 * Event emitted when a request is started
 */
export interface RequestStartEvent extends RequestEventBase {
  type: "start";
}

/**
 * Event emitted when a request completes successfully
 */
export interface RequestCompleteEvent extends RequestEventBase {
  type: "complete";

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
 * Event emitted when a request fails
 */
export interface RequestFailureEvent extends RequestEventBase {
  type: "failure";

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
 * Union type for all request events
 */
export type RequestEvent =
  | RequestStartEvent
  | RequestCompleteEvent
  | RequestFailureEvent;

/**
 * Types of rate limit events
 */
export type RateLimitEventType = "hit" | "update" | "expire";

/**
 * Base interface for rate limit events
 */
export interface RateLimitEventBase extends RestEventBase {
  /** Type of rate limit event */
  type: RateLimitEventType;

  /** Rate limit bucket hash or identifier */
  bucketId: string;
}

/**
 * Event emitted when a rate limit is hit
 */
export interface RateLimitHitEvent extends RateLimitEventBase {
  type: "hit";

  /** Time in milliseconds until the rate limit resets */
  resetAfter: number;

  /** Global rate limit flag */
  global: boolean;

  /** Retry-After header value if present */
  retryAfter?: number;

  /** Route associated with this rate limit */
  route?: string;

  /** HTTP method associated with this rate limit */
  method?: Dispatcher.HttpMethod;

  /** Reason for the rate limit being hit */
  reason?: string;
}

/**
 * Event emitted when rate limit information is updated
 */
export interface RateLimitUpdateEvent extends RateLimitEventBase {
  type: "update";

  /** Remaining requests in the current window */
  remaining: number;

  /** Total allowed requests in the current window */
  limit: number;

  /** Time in milliseconds until the rate limit resets */
  resetAfter: number;

  /** Full reset timestamp in ISO format */
  resetAt: string;

  /** Route associated with this rate limit */
  route?: string;
}

/**
 * Event emitted when a rate limit bucket expires
 */
export interface RateLimitExpireEvent extends RateLimitEventBase {
  type: "expire";

  /** Time in milliseconds the bucket was alive */
  lifespan: number;
}

/**
 * Union type for all rate limit events
 */
export type RateLimitEvent =
  | RateLimitHitEvent
  | RateLimitUpdateEvent
  | RateLimitExpireEvent;

/**
 * Types of queue events
 */
export type QueueEventType =
  | "add"
  | "process"
  | "complete"
  | "timeout"
  | "reject"
  | "stateChange";

/**
 * Base interface for queue events
 */
export interface QueueEventBase extends RestEventBase {
  /** Type of queue event */
  type: QueueEventType;
}

/**
 * Base interface for queue processing events
 */
export interface QueueProcessingEventBase extends QueueEventBase {
  /** Time spent in queue (ms) */
  queueTime: number;

  /** API path for the request */
  path: string;

  /** HTTP method for the request */
  method: Dispatcher.HttpMethod;

  /** Priority level of the request */
  priority: number;
}

/**
 * Event emitted when an item is added to the queue
 */
export interface QueueAddEvent extends QueueProcessingEventBase {
  type: "add";
}

/**
 * Event emitted when an item starts processing from the queue
 */
export interface QueueProcessEvent extends QueueProcessingEventBase {
  type: "process";
}

/**
 * Event emitted when an item is completed
 */
export interface QueueCompleteEvent extends QueueProcessingEventBase {
  type: "complete";

  /** Whether the request completed successfully */
  success: boolean;
}

/**
 * Event emitted when an item times out in the queue
 */
export interface QueueTimeoutEvent extends QueueProcessingEventBase {
  type: "timeout";
}

/**
 * Event emitted when an item is rejected due to queue being full
 */
export interface QueueRejectEvent extends QueueProcessingEventBase {
  type: "reject";
  /** Reason for rejection */
  reason: string;
}

/**
 * Event emitted when queue state changes
 */
export interface QueueStateChangeEvent extends QueueEventBase {
  type: "stateChange";

  /** Number of items currently in the queue */
  queueSize: number;

  /** Number of requests currently executing */
  running: number;

  /** Maximum allowed concurrent requests */
  concurrency: number;

  /** What triggered the state change */
  trigger?: "add" | "process" | "complete" | "timeout" | "reject" | "clear";
}

/**
 * Union type for all queue events
 */
export type QueueEvent =
  | QueueAddEvent
  | QueueProcessEvent
  | QueueCompleteEvent
  | QueueTimeoutEvent
  | QueueRejectEvent
  | QueueStateChangeEvent;

/**
 * Event emitted when a request retry is attempted
 */
export interface RetryEvent extends RestEventBase {
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
 * Map of event names to their corresponding payload types
 */
export interface RestEvents {
  /** Unified event for the complete HTTP request lifecycle */
  request: [event: RequestEvent];

  /** Unified event for all rate limit related operations */
  rateLimit: [event: RateLimitEvent];

  /** Unified event for all queue operations */
  queue: [event: QueueEvent];

  /** Event for retry attempts */
  retry: [event: RetryEvent];
}
