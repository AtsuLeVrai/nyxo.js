import { setTimeout } from "node:timers/promises";
import type { Rest } from "../core/index.js";
import { ApiError, RateLimitError } from "../errors/index.js";
import type { RetryOptions } from "../options/index.js";
import {
  type HandleError,
  type RetryContext,
  RetryReason,
  type RetryState,
} from "../types/index.js";

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
        const retryDetails = this.#handleError(error, context);

        if (!retryDetails.shouldRetry) {
          throw error;
        }

        await setTimeout(retryDetails.timeout);
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
   * @private
   */
  #handleError(error: unknown, context: RetryContext): HandleError {
    // Check if we've exceeded maximum retries
    if (this.#state.retryCount >= this.#options.maxRetries) {
      return { shouldRetry: false, timeout: 0 };
    }

    // Check if this method is eligible for retries
    if (!this.#options.methods.includes(context.method)) {
      return { shouldRetry: false, timeout: 0 };
    }

    // Handle rate limit errors
    if (error instanceof RateLimitError) {
      const timeout = this.#calculateTimeout(error.retryAfter);
      this.#state.retryAfter = error.retryAfter;

      this.#emitRetryEvent(error, timeout, context, RetryReason.RateLimited);
      return {
        shouldRetry: true,
        timeout,
        reason: RetryReason.RateLimited,
      };
    }

    // Handle API errors
    if (error instanceof ApiError) {
      // Check if status code is eligible for retry
      if (!this.#options.statusCodes.includes(error.context.statusCode)) {
        return { shouldRetry: false, timeout: 0 };
      }

      // Handle retry-after header if present
      if (this.#options.retryAfter && error.context.headers?.["retry-after"]) {
        const retryAfter = Number(error.context.headers["retry-after"]) * 1000;
        const timeout = this.#calculateTimeout(retryAfter);
        const reason = RetryReason.ServerError;

        this.#emitRetryEvent(error, timeout, context, reason);
        return { shouldRetry: true, timeout, reason };
      }

      const timeout = this.#calculateTimeout();
      const reason = RetryReason.ServerError;

      this.#emitRetryEvent(error, timeout, context, reason);
      return { shouldRetry: true, timeout, reason };
    }

    // Handle network errors
    if (error instanceof Error) {
      const errorCode = this.#getErrorCode(error);
      if (this.#options.errorCodes.includes(errorCode)) {
        const timeout = this.#calculateTimeout();
        const reason = errorCode.includes("TIMEOUT")
          ? RetryReason.Timeout
          : RetryReason.NetworkError;

        this.#emitRetryEvent(error, timeout, context, reason);
        return { shouldRetry: true, timeout, reason };
      }
    }

    return { shouldRetry: false, timeout: 0 };
  }

  /**
   * Calculates the timeout before the next retry attempt
   *
   * @param baseTimeout - Base timeout in milliseconds (optional)
   * @returns Calculated timeout with exponential backoff and jitter
   * @private
   */
  #calculateTimeout(baseTimeout?: number): number {
    const base = baseTimeout ?? this.#options.minTimeout;
    const factor = this.#options.timeoutFactor ** this.#state.retryCount;
    const timeout = base * factor;

    // Add jitter (±10%) to prevent thundering herd problems
    const jitter = timeout * 0.1 * (Math.random() * 2 - 1);

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
   * @private
   */
  #getErrorCode(error: Error): string {
    const message = error.message.toUpperCase();
    return (
      this.#options.errorCodes.find((code) => message.includes(code)) ??
      RetryReason.Unknown
    );
  }

  /**
   * Emits a retry attempt event
   *
   * @param error - The error that triggered the retry
   * @param timeout - The timeout before the next attempt
   * @param context - Context information about the operation
   * @param reason - The categorized reason for the retry
   * @private
   */
  #emitRetryEvent(
    error: Error,
    timeout: number,
    context: RetryContext,
    reason: RetryReason,
  ): void {
    this.#rest.emit("retryAttempt", {
      timestamp: new Date().toISOString(),
      requestId: this.#state.requestId ?? "",
      error,
      attemptNumber: this.#state.retryCount + 1,
      maxAttempts: this.#options.maxRetries,
      delayMs: timeout,
      path: context.path,
      method: context.method,
      reason: reason.toString(),
    });
  }
}
