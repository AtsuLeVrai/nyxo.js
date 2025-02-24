import type { Dispatcher } from "undici";

/**
 * Enum for categorizing retry reasons
 */
export enum RetryReason {
  RateLimited = "rate_limited",
  ServerError = "server_error",
  NetworkError = "network_error",
  Timeout = "timeout",
  Unknown = "unknown",
}

/**
 * Interface for internal retry decision
 */
export interface HandleError {
  /** Whether the operation should be retried */
  shouldRetry: boolean;

  /** Time in milliseconds to wait before retrying */
  timeout: number;

  /** The reason for the retry */
  reason?: RetryReason;
}

/**
 * Context information for the retry operation
 */
export interface RetryContext {
  /** HTTP method being used */
  method: Dispatcher.HttpMethod;

  /** API path being requested */
  path: string;
}

/**
 * Current state of a retry operation
 */
export interface RetryState {
  /** Number of retry attempts made so far */
  retryCount: number;

  /** Time in seconds to wait before the next attempt (for rate limits) */
  retryAfter?: number;

  /** Timestamp when the current timeout will expire */
  timeoutAt?: number;

  /** Last error encountered */
  error?: Error;

  /** Unique ID for the current operation */
  requestId?: string;
}
