import { sleep } from "@nyxojs/core";
import { z } from "zod";
import type { Rest } from "../core/index.js";
import type { HttpMethod, HttpResponse, RetryEvent } from "../types/index.js";

/**
 * Configuration options for the retry mechanism.
 * Defines how request retries are handled when temporary failures occur.
 */
export const RetryOptions = z.object({
  /**
   * Maximum number of retry attempts before giving up.
   * Determines how persistent the client should be when facing transient errors.
   * @default 3
   */
  maxRetries: z.number().int().min(0).default(3),

  /**
   * Base delay between retries in milliseconds.
   * Used as the starting point for exponential backoff calculations.
   * @default 1000
   */
  baseDelay: z.number().int().min(0).default(1000),

  /**
   * HTTP status codes that should trigger a retry attempt.
   * Typically includes server errors (5xx) and specific retryable client errors.
   * Rate limits (429) are explicitly excluded as they're handled by RateLimitManager.
   * @default [500, 502, 503, 504]
   */
  retryStatusCodes: z.array(z.number()).default([500, 502, 503, 504]),
});

export type RetryOptions = z.infer<typeof RetryOptions>;

/**
 * Classification of errors to determine retry strategies.
 * Different types of errors require different backoff algorithms.
 */
export enum ErrorCategory {
  /** Transient server errors like 500, 502, 503, 504 */
  ServerError = "server_error",

  /** Network-related errors like timeouts, connection resets */
  NetworkError = "network_error",

  /** Client errors that we know are not worth retrying */
  ClientError = "client_error",

  /** Unknown errors that we'll attempt to retry conservatively */
  UnknownError = "unknown_error",
}

/**
 * Manages retry logic for HTTP requests to the Discord API.
 *
 * Handles automatic retries for failed requests using configurable strategies:
 * - Implements exponential backoff for server errors
 * - Uses different retry strategies based on error type
 * - Tracks and emits events for retry attempts
 * - Collects error history for comprehensive failure reports
 *
 * Note: Rate limit handling is NOT managed here - it's the responsibility
 * of the RateLimitManager exclusively.
 */
export class RetryManager {
  /**
   * Reference to the REST client.
   * Used to emit events and access shared resources.
   */
  readonly #rest: Rest;

  /**
   * Configuration options for retry behavior.
   * Controls max attempts, delays, and which status codes trigger retries.
   */
  readonly #options: RetryOptions;

  /**
   * Creates a new retry manager.
   *
   * @param rest - REST client instance that will use this manager
   * @param options - Retry configuration options to customize behavior
   */
  constructor(rest: Rest, options: RetryOptions) {
    this.#rest = rest;
    this.#options = options;
  }

  /**
   * Processes an HTTP response and retries if necessary.
   * Implements the retry strategy based on configuration and response status.
   *
   * @param makeRequest - Function that makes the HTTP request and returns a promise
   * @param requestId - Unique request ID for tracking and correlation
   * @param method - HTTP method used for the request
   * @param path - API path being requested
   * @returns Promise resolving to the final HTTP response after all retry attempts
   * @throws {Error} Error if all retry attempts fail
   */
  async processResponse<T>(
    makeRequest: () => Promise<HttpResponse<T>>,
    requestId: string,
    method: HttpMethod,
    path: string,
  ): Promise<HttpResponse<T>> {
    let attempts = 0;
    let lastResponse: HttpResponse<T> | null = null;
    const attemptErrors: Error[] = []; // Track all errors for detailed reporting

    while (attempts <= this.#options.maxRetries) {
      try {
        // Make the request
        const response = await makeRequest();
        lastResponse = response;

        // If success or non-retryable status code, return immediately
        if (
          response.statusCode < 400 ||
          !this.#options.retryStatusCodes.includes(response.statusCode)
        ) {
          return response;
        }

        // Explicitly exclude rate limit errors - these are handled by RateLimitManager
        if (response.statusCode === 429) {
          return response;
        }

        // Increment attempts
        attempts++;

        // Capture the error for later
        const currentError = new Error(
          response.reason || `HTTP error ${response.statusCode}`,
        );
        attemptErrors.push(currentError);

        // If max retries reached, return the last response
        if (attempts > this.#options.maxRetries) {
          return response;
        }

        // Calculate delay based on error category
        const errorCategory = this.#categorizeError(response.statusCode);
        const delay = this.#calculateDelay(attempts, errorCategory);

        // Emit retry event for tracking and monitoring
        this.#emitRetryEvent({
          requestId,
          method,
          path,
          error: currentError,
          attempt: attempts,
          delay,
          reason: errorCategory,
        });

        // Wait before retry
        await sleep(delay);
      } catch (error) {
        // Handle unexpected errors (network issues, etc.)
        attempts++;

        // Capture this error
        const currentError =
          error instanceof Error ? error : new Error(String(error));
        attemptErrors.push(currentError);

        if (attempts > this.#options.maxRetries) {
          // All retries failed, throw comprehensive error with error history
          const errorSummary = this.#summarizeErrors(attemptErrors);
          throw new Error(
            `Request failed after ${attempts} attempts. [${method} ${path}]\n${errorSummary}`,
          );
        }

        // Categorize network error and calculate appropriate backoff
        const errorCategory = this.#categorizeNetworkError(currentError);
        const delay = this.#calculateDelay(attempts, errorCategory);

        // Emit retry event for tracking and monitoring
        this.#emitRetryEvent({
          requestId,
          method,
          path,
          error: currentError,
          attempt: attempts,
          delay,
          reason: errorCategory,
        });

        // Wait before retry
        await sleep(delay);
      }
    }

    // If we completed all retries but still have a response
    return lastResponse as HttpResponse<T>;
  }

  /**
   * Categorizes an error based on HTTP status code.
   * Used to determine the appropriate retry strategy.
   *
   * @param statusCode - HTTP status code from the response
   * @returns Categorization of the error
   * @private
   */
  #categorizeError(statusCode: number): ErrorCategory {
    if (statusCode >= 500 && statusCode < 600) {
      return ErrorCategory.ServerError;
    }

    if (statusCode >= 400 && statusCode < 500) {
      return ErrorCategory.ClientError;
    }

    return ErrorCategory.UnknownError;
  }

  /**
   * Categorizes a network error based on its properties.
   * Different network errors require different retry strategies.
   *
   * @param error - Error that occurred during the request
   * @returns Categorization of the error
   * @private
   */
  #categorizeNetworkError(error: Error): ErrorCategory {
    // Check for timeout errors
    if (error.name === "AbortError" || error.message.includes("timeout")) {
      return ErrorCategory.NetworkError;
    }

    // Check for common network error messages
    const networkErrorPatterns = [
      "ECONNRESET",
      "ECONNREFUSED",
      "ENOTFOUND",
      "ETIMEDOUT",
      "network",
      "connection",
      "socket",
    ];

    for (const pattern of networkErrorPatterns) {
      if (error.message.toLowerCase().includes(pattern.toLowerCase())) {
        return ErrorCategory.NetworkError;
      }
    }

    return ErrorCategory.UnknownError;
  }

  /**
   * Calculates the appropriate delay for a retry attempt.
   * Uses different strategies based on error category.
   *
   * @param attempt - Current attempt number (1-based)
   * @param errorCategory - Classification of the error
   * @returns Delay in milliseconds to wait before the next retry
   * @private
   */
  #calculateDelay(attempt: number, errorCategory: ErrorCategory): number {
    // Base exponential backoff formula: baseDelay * 2^(attempt-1)
    const baseBackoff = this.#options.baseDelay * 2 ** (attempt - 1);

    // Add jitter to prevent retry storms (±25% randomization)
    const jitter = baseBackoff * 0.5 * (Math.random() - 0.5);

    switch (errorCategory) {
      case ErrorCategory.ServerError:
        // Server errors: full exponential backoff with jitter
        // These are worth retrying aggressively
        return baseBackoff + jitter;

      case ErrorCategory.NetworkError:
        // Network errors: more aggressive retries for first attempts
        // For early attempts, use shorter delays to recover from transient issues quickly
        if (attempt <= 2) {
          return Math.min(1000, baseBackoff) + jitter;
        }
        return baseBackoff + jitter;

      case ErrorCategory.ClientError:
        // Client errors: rarely worth retrying, longer delays
        // Most client errors won't be resolved by retrying, so use longer delays
        return baseBackoff * 2 + jitter;

      default:
        // Unknown errors: conservative strategy with increased delays
        return baseBackoff * 1.5 + jitter;
    }
  }

  /**
   * Creates a summary of errors encountered during retry attempts.
   * Provides rich context about what went wrong across multiple attempts.
   *
   * @param errors - Array of errors from retry attempts
   * @returns Formatted error summary string
   * @private
   */
  #summarizeErrors(errors: Error[]): string {
    if (errors.length === 0) {
      return "No errors recorded";
    }

    if (errors.length === 1) {
      return `Error: ${(errors[0] as Error).message}`;
    }

    return errors
      .map((error, index) => `Attempt ${index + 1}: ${error.message}`)
      .join("\n");
  }

  /**
   * Emits a retry event with detailed information.
   * Used for tracking, monitoring, and debugging retry patterns.
   *
   * @param params - Event parameters containing retry details
   * @private
   */
  #emitRetryEvent(params: Omit<RetryEvent, "timestamp" | "maxAttempts">): void {
    const event: RetryEvent = {
      timestamp: new Date().toISOString(),
      requestId: params.requestId,
      method: params.method,
      path: params.path,
      error: params.error,
      attempt: params.attempt,
      maxAttempts: this.#options.maxRetries,
      delay: params.delay,
      reason: params.reason,
    };

    this.#rest.emit("retry", event);
  }
}
