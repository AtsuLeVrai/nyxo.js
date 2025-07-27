import { sleep } from "@nyxojs/core";
import { z } from "zod";
import type { Rest } from "../core/index.js";
import type { HttpMethod, HttpResponse } from "../types/index.js";

/**
 * Configuration schema for intelligent retry behavior.
 * Defines retry policies optimized for Discord API patterns.
 *
 * @public
 */
export const RetryOptions = z.object({
  /**
   * Maximum number of retry attempts before failure.
   * Higher values increase resilience but also latency for permanent failures.
   *
   * @default 3
   */
  maxRetries: z.number().int().positive().default(3),

  /**
   * Base delay between retry attempts in milliseconds.
   * Used as foundation for exponential backoff calculations.
   *
   * @default 1000
   */
  baseDelay: z.number().int().positive().default(1000),

  /**
   * HTTP status codes that trigger retry attempts.
   * Includes only genuinely transient server error conditions.
   *
   * @default [500, 502, 503, 504]
   */
  retryStatusCodes: z.array(z.number()).default([500, 502, 503, 504]),
});

export type RetryOptions = z.infer<typeof RetryOptions>;

/**
 * Error classification system for optimal retry strategies.
 * Categorizes failures based on underlying causes to apply appropriate recovery patterns.
 *
 * @public
 */
export enum ErrorCategory {
  /**
   * Transient server-side failures that typically resolve quickly.
   * Includes HTTP 5xx errors from service restarts and temporary issues.
   */
  ServerError = "server_error",

  /**
   * Network connectivity and infrastructure failures.
   * Covers DNS resolution, timeouts, and connection issues.
   */
  NetworkError = "network_error",

  /**
   * Client-side errors that are typically permanent.
   * Represents HTTP 4xx errors indicating request problems.
   */
  ClientError = "client_error",

  /**
   * Unclassified errors requiring conservative handling.
   * Fallback category for unexpected error conditions.
   */
  UnknownError = "unknown_error",
}

/**
 * Advanced retry manager for Discord API failure recovery.
 * Provides intelligent retry logic with adaptive backoff strategies and error classification.
 *
 * @example
 * ```typescript
 * const retryManager = new RetryManager(restClient, {
 *   maxRetries: 3,
 *   baseDelay: 1000,
 *   retryStatusCodes: [500, 502, 503, 504]
 * });
 *
 * const response = await retryManager.processResponse(
 *   () => restClient.get('/users/@me'),
 *   'user-profile-req-123',
 *   'GET',
 *   '/users/@me'
 * );
 * ```
 *
 * @public
 */
export class RetryManager {
  /**
   * Reference to parent REST client for event emission.
   * Used for retry event coordination and monitoring.
   *
   * @readonly
   * @internal
   */
  readonly #rest: Rest;

  /**
   * Validated configuration options controlling retry behavior.
   * Contains attempt limits, timing parameters, and status code classifications.
   *
   * @readonly
   * @internal
   */
  readonly #options: RetryOptions;

  /**
   * Creates a new retry manager with validated configuration.
   * Initializes production-ready retry manager with sophisticated error handling.
   *
   * @param rest - REST client instance for event emission
   * @param options - Retry configuration controlling behavior and limits
   *
   * @public
   */
  constructor(rest: Rest, options: RetryOptions) {
    this.#rest = rest;
    this.#options = options;
  }

  /**
   * Processes HTTP responses with intelligent retry logic.
   * Implements complete retry workflow including error classification and backoff calculation.
   *
   * @param makeRequest - Factory function that creates and executes the HTTP request
   * @param requestId - Unique identifier for request tracking
   * @param method - HTTP method used for the request
   * @param path - API path being requested
   * @returns Promise resolving to the final HTTP response after retries
   *
   * @throws {Error} If all retry attempts fail with complete failure history
   *
   * @example
   * ```typescript
   * const response = await retryManager.processResponse(
   *   () => rest.get('/users/@me'),
   *   'get-current-user-456',
   *   'GET',
   *   '/users/@me'
   * );
   * ```
   *
   * @public
   */
  async processResponse<T>(
    makeRequest: () => Promise<HttpResponse<T>>,
    requestId: string,
    method: HttpMethod,
    path: string,
  ): Promise<HttpResponse<T>> {
    let attempts = 0;
    let lastResponse: HttpResponse<T> | null = null;
    const attemptErrors: Error[] = [];

    while (attempts <= this.#options.maxRetries) {
      try {
        const response = await makeRequest();
        lastResponse = response;

        if (
          response.statusCode < 400 ||
          !this.#options.retryStatusCodes.includes(response.statusCode)
        ) {
          return response;
        }

        if (response.statusCode === 429) {
          return response;
        }

        attempts++;

        const currentError = new Error(
          response.reason || `HTTP error ${response.statusCode}`,
        );
        attemptErrors.push(currentError);

        if (attempts > this.#options.maxRetries) {
          return response;
        }

        const errorCategory = this.#categorizeError(response.statusCode);
        const delay = this.#calculateDelay(attempts, errorCategory);

        this.#rest.emit("retry", {
          requestId,
          method,
          path,
          delay,
          error: currentError,
          attempt: attempts,
          reason: errorCategory,
          timestamp: new Date().toISOString(),
          maxAttempts: this.#options.maxRetries,
        });

        await sleep(delay);
      } catch (error) {
        attempts++;

        const currentError =
          error instanceof Error ? error : new Error(String(error));
        attemptErrors.push(currentError);

        if (attempts > this.#options.maxRetries) {
          const errorSummary = this.#summarizeErrors(attemptErrors);
          throw new Error(
            `Request failed after ${attempts} attempts. [${method} ${path}]\n${errorSummary}`,
          );
        }

        const errorCategory = this.#categorizeNetworkError(currentError);
        const delay = this.#calculateDelay(attempts, errorCategory);

        this.#rest.emit("retry", {
          requestId,
          method,
          path,
          delay,
          error: currentError,
          attempt: attempts,
          reason: errorCategory,
          timestamp: new Date().toISOString(),
          maxAttempts: this.#options.maxRetries,
        });

        await sleep(delay);
      }
    }

    return lastResponse as HttpResponse<T>;
  }

  /**
   * Classifies HTTP response errors for optimal retry strategy.
   * Analyzes status codes to determine appropriate backoff algorithms.
   *
   * @param statusCode - HTTP status code from failed response
   * @returns Error category for retry strategy selection
   *
   * @internal
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
   * Classifies network and runtime errors for specialized retry handling.
   * Analyzes exception types to determine underlying network issues.
   *
   * @param error - Exception that occurred during request execution
   * @returns Error category optimized for specific network failure type
   *
   * @internal
   */
  #categorizeNetworkError(error: Error): ErrorCategory {
    if (error.name === "AbortError" || error.message.includes("timeout")) {
      return ErrorCategory.NetworkError;
    }

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
   * Calculates intelligent backoff delays using category-specific algorithms.
   * Implements exponential backoff with jitter and category modifications.
   *
   * @param attempt - Current attempt number (1-based indexing)
   * @param errorCategory - Classification of error for strategy selection
   * @returns Delay in milliseconds to wait before next retry attempt
   *
   * @internal
   */
  #calculateDelay(attempt: number, errorCategory: ErrorCategory): number {
    const baseBackoff = this.#options.baseDelay * 2 ** (attempt - 1);
    const jitter = baseBackoff * 0.5 * (Math.random() - 0.5);

    switch (errorCategory) {
      case ErrorCategory.ServerError:
        return baseBackoff + jitter;

      case ErrorCategory.NetworkError: {
        if (attempt <= 2) {
          return Math.min(1000, baseBackoff) + jitter;
        }
        return baseBackoff + jitter;
      }

      case ErrorCategory.ClientError:
        return baseBackoff * 2 + jitter;

      default:
        return baseBackoff * 1.5 + jitter;
    }
  }

  /**
   * Generates comprehensive error summaries for debugging.
   * Creates human-readable summaries of retry attempt failures.
   *
   * @param errors - Array of errors collected from each retry attempt
   * @returns Formatted string summarizing all failure attempts
   *
   * @internal
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
}
