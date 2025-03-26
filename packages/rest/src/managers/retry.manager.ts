import { setTimeout } from "node:timers/promises";
import type { Dispatcher } from "undici";
import type { Rest } from "../core/index.js";
import { ApiError, RateLimitError } from "../errors/index.js";
import type { RetryOptions } from "../options/index.js";
import type { RetryEvent } from "../types/index.js";

/**
 * Retry-related constants
 */
const RETRY_CONSTANTS = {
  JITTER_FACTOR: 0.1, // ±10% jitter to prevent thundering herd
} as const;

/**
 * Possible reasons for retrying a request
 */
export enum RetryReason {
  RateLimited = "RATE_LIMITED",
  ServerError = "SERVER_ERROR",
  NetworkError = "NETWORK_ERROR",
  Timeout = "TIMEOUT",
  Unknown = "UNKNOWN",
}

/**
 * Context information for a retry operation
 */
export interface RetryContext {
  /** The HTTP method of the request */
  method: Dispatcher.HttpMethod;
  /** The API path being requested */
  path: string;
}

/**
 * Result of an error evaluation for retry
 */
export interface RetryDecision {
  /** Whether the operation should be retried */
  shouldRetry: boolean;
  /** Time in milliseconds to wait before retrying */
  timeout: number;
  /** The reason for retrying */
  reason?: RetryReason;
}

/**
 * State of the current retry operation
 */
export interface RetryState {
  /** Number of retry attempts so far */
  retryCount: number;
  /** Unique identifier for the request */
  requestId?: string;
  /** Time to wait before retrying from the last error */
  retryAfter?: number;
}

/**
 * Manages retry logic for failed API requests
 */
export class RetryManager {
  /** Current retry state */
  #state: RetryState = {
    retryCount: 0,
  };

  /** Reference to the Rest client */
  readonly #rest: Rest;

  /** Configuration options for retries */
  readonly #options: RetryOptions;

  /**
   * Creates a new retry manager
   *
   * @param rest - The Rest client instance
   * @param options - Configuration options for retries
   */
  constructor(rest: Rest, options: RetryOptions) {
    this.#rest = rest;
    this.#options = options;
  }

  /**
   * Current state of the retry operation
   */
  get state(): RetryState {
    return this.#state;
  }

  /**
   * Executes an operation with automatic retries
   *
   * @param operation - The async operation to execute
   * @param context - Context information about the operation
   * @param requestId - Unique ID for the operation
   * @returns The result of the operation
   * @throws If the operation fails after all retry attempts
   */
  async execute<T>(
    operation: () => Promise<T>,
    context: RetryContext,
    requestId: string,
  ): Promise<T> {
    // Reset state at the beginning of a new execution
    this.#state = {
      retryCount: 0,
      requestId,
    };

    while (true) {
      try {
        return await operation();
      } catch (error) {
        const decision = this.evaluateError(error, context);

        if (!decision.shouldRetry) {
          throw error;
        }

        await setTimeout(decision.timeout);
        this.#state.retryCount++;
      }
    }
  }

  /**
   * Determines whether to retry after an error
   *
   * @param error - The error that occurred
   * @param context - Context information about the operation
   * @returns Decision about retrying
   */
  evaluateError(error: unknown, context: RetryContext): RetryDecision {
    // Check if we've exceeded maximum retries
    if (this.#state.retryCount >= this.#options.maxRetries) {
      return { shouldRetry: false, timeout: 0 };
    }

    // Check if this method is eligible for retries
    if (!this.#options.methods.has(context.method)) {
      return { shouldRetry: false, timeout: 0 };
    }

    // Handle rate limit errors
    if (error instanceof RateLimitError) {
      return this.#handleRateLimitError(error, context);
    }

    // Handle API errors
    if (error instanceof ApiError) {
      return this.#handleApiError(error, context);
    }

    // Handle network errors
    if (error instanceof Error) {
      return this.#handleNetworkError(error, context);
    }

    return { shouldRetry: false, timeout: 0 };
  }

  /**
   * Calculates the timeout before the next retry attempt
   *
   * @param baseTimeout - Base timeout in milliseconds (optional)
   * @returns Calculated timeout with exponential backoff and jitter
   */
  calculateTimeout(baseTimeout?: number): number {
    const base = baseTimeout ?? this.#options.minTimeout;
    const factor = this.#options.timeoutFactor ** this.#state.retryCount;
    const timeout = base * factor;

    // Add jitter to prevent thundering herd problems
    const jitter =
      timeout * RETRY_CONSTANTS.JITTER_FACTOR * (Math.random() * 2 - 1);

    return Math.min(
      Math.max(timeout + jitter, this.#options.minTimeout),
      this.#options.maxTimeout,
    );
  }

  /**
   * Extracts an error code from an Error object
   *
   * @param error - The error to extract a code from
   * @returns A normalized error code string
   */
  getErrorCode(error: Error): string {
    const message = error.message.toUpperCase();

    for (const code of this.#options.errorCodes) {
      if (message.includes(code)) {
        return code;
      }
    }

    return RetryReason.Unknown;
  }

  /**
   * Creates the retry event object
   *
   * @param error - The error that triggered the retry
   * @param timeout - The timeout before the next attempt
   * @param context - Context information about the operation
   * @param reason - The categorized reason for the retry
   * @returns The retry event object
   */
  #createRetryEvent(
    error: Error,
    timeout: number,
    context: RetryContext,
    reason: RetryReason,
  ): RetryEvent {
    return {
      timestamp: new Date().toISOString(),
      requestId: this.#state.requestId ?? "",
      error,
      attemptNumber: this.#state.retryCount + 1,
      maxAttempts: this.#options.maxRetries,
      delayMs: timeout,
      path: context.path,
      method: context.method,
      reason: reason.toString(),
    };
  }

  /**
   * Handles a rate limit error
   *
   * @param error - The rate limit error
   * @param context - The retry context
   * @returns Retry decision
   * @private
   */
  #handleRateLimitError(
    error: RateLimitError,
    context: RetryContext,
  ): RetryDecision {
    const timeout = this.calculateTimeout(error.retryAfter * 1000);
    this.#state.retryAfter = error.retryAfter;

    this.#rest.emit(
      "retry",
      this.#createRetryEvent(error, timeout, context, RetryReason.RateLimited),
    );

    return {
      shouldRetry: true,
      timeout,
      reason: RetryReason.RateLimited,
    };
  }

  /**
   * Handles an API error
   *
   * @param error - The API error
   * @param context - The retry context
   * @returns Retry decision
   * @private
   */
  #handleApiError(error: ApiError, context: RetryContext): RetryDecision {
    // Check if status code is eligible for retry
    if (!this.#options.statusCodes.has(error.statusCode)) {
      return { shouldRetry: false, timeout: 0 };
    }

    const timeout = this.calculateTimeout();
    const reason = RetryReason.ServerError;

    this.#rest.emit(
      "retry",
      this.#createRetryEvent(error, timeout, context, reason),
    );

    return {
      shouldRetry: true,
      timeout,
      reason,
    };
  }

  /**
   * Handles a network error
   *
   * @param error - The network error
   * @param context - The retry context
   * @returns Retry decision
   * @private
   */
  #handleNetworkError(error: Error, context: RetryContext): RetryDecision {
    const errorCode = this.getErrorCode(error);

    if (!this.#options.errorCodes.has(errorCode)) {
      return { shouldRetry: false, timeout: 0 };
    }

    const timeout = this.calculateTimeout();
    const reason = errorCode.includes("TIMEOUT")
      ? RetryReason.Timeout
      : RetryReason.NetworkError;

    this.#rest.emit(
      "retry",
      this.#createRetryEvent(error, timeout, context, reason),
    );

    return {
      shouldRetry: true,
      timeout,
      reason,
    };
  }
}
