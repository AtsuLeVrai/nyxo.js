import { sleep } from "@nyxojs/core";
import { z } from "zod";
import type { Rest } from "../core/index.js";
import type { HttpMethod, HttpResponse, RetryEvent } from "../types/index.js";
import type { RateLimitResult } from "./rate-limit.manager.js";

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
   * Typically includes rate limits (429) and server errors (5xx).
   * @default [429, 500, 502, 503, 504]
   */
  retryStatusCodes: z.array(z.number()).default([429, 500, 502, 503, 504]),
});

export type RetryOptions = z.infer<typeof RetryOptions>;

/**
 * Manages retry logic for HTTP requests to the Discord API.
 *
 * Handles automatic retries for failed requests using configurable strategies:
 * - Respects rate limits by honoring retry-after headers
 * - Implements exponential backoff for server errors
 * - Tracks and emits events for retry attempts
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
   * Handles a rate limit result by waiting if necessary.
   * If the rate limit indicates the request can't proceed, waits for the specified time.
   *
   * @param rateLimitResult - Result from rate limit check containing retry information
   * @param requestId - Unique request ID for tracking and correlation
   * @param method - HTTP method of the rate-limited request
   * @param path - API path of the rate-limited request
   * @returns Promise that resolves when it's safe to retry the request
   */
  async handleRateLimit(
    rateLimitResult: RateLimitResult,
    requestId: string,
    method: HttpMethod,
    path: string,
  ): Promise<void> {
    if (rateLimitResult.canProceed) {
      return; // Nothing to do if we can proceed
    }

    // Calculate delay in milliseconds (retryAfter is already in ms now)
    const delayMs = rateLimitResult.retryAfter || 1000;

    // Create error message with context about the rate limit
    const error = new Error(
      rateLimitResult.reason ||
        `Rate limit exceeded for ${rateLimitResult.bucketHash || "unknown"} (${rateLimitResult.scope || "unknown"})`,
    );

    // Emit retry event for tracking and monitoring
    this.#emitRetryEvent({
      requestId,
      method,
      path,
      error,
      attempt: 1,
      delayMs,
      reason: "rate_limit",
    });

    // Wait for the specified time before allowing the request to proceed
    await sleep(delayMs);
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
   * @throws {Error} Error if all retry attempts fail with network errors
   */
  async processResponse<T>(
    makeRequest: () => Promise<HttpResponse<T>>,
    requestId: string,
    method: HttpMethod,
    path: string,
  ): Promise<HttpResponse<T>> {
    let attempts = 0;
    let lastResponse: HttpResponse<T> | null = null;

    while (attempts <= this.#options.maxRetries) {
      try {
        // Make the request
        const response = await makeRequest();
        lastResponse = response;

        // If success, return immediately
        if (response.statusCode < 400) {
          return response;
        }

        // Check if we should retry based on status code
        if (!this.#options.retryStatusCodes.includes(response.statusCode)) {
          return response; // Don't retry this status code
        }

        // Increment attempts
        attempts++;

        // If max retries reached, return the last response
        if (attempts > this.#options.maxRetries) {
          return response;
        }

        // Calculate delay with exponential backoff or based on retry-after headers
        const delayMs = this.#calculateDelay(attempts, response);

        // Emit retry event for tracking and monitoring
        this.#emitRetryEvent({
          requestId,
          method,
          path,
          error: new Error(
            response.reason || `HTTP error ${response.statusCode}`,
          ),
          attempt: attempts,
          delayMs,
          reason: this.#getRetryReason(response.statusCode),
        });

        // Wait before retry
        await sleep(delayMs);
      } catch (error) {
        // Handle unexpected errors (network issues, etc.)
        attempts++;

        if (attempts > this.#options.maxRetries) {
          throw error; // Re-throw if max retries reached
        }

        // Calculate exponential backoff delay for network errors
        const delayMs = this.#options.baseDelay * 2 ** (attempts - 1);

        // Emit retry event for tracking and monitoring
        this.#emitRetryEvent({
          requestId,
          method,
          path,
          error: error instanceof Error ? error : new Error(String(error)),
          attempt: attempts,
          delayMs,
          reason: "network_error",
        });

        // Wait before retry
        await sleep(delayMs);
      }
    }

    // This should never happen due to the returns above
    return lastResponse as HttpResponse<T>;
  }

  /**
   * Calculates the appropriate delay for a retry attempt.
   * Respects retry-after headers if present, otherwise uses exponential backoff.
   *
   * @param attempt - Current attempt number (1-based)
   * @param response - HTTP response if available, containing headers
   * @returns Delay in milliseconds to wait before the next retry
   * @private
   */
  #calculateDelay<T>(attempt: number, response?: HttpResponse<T>): number {
    // Check for retry-after header for rate limits
    if (response?.headers?.["retry-after"]) {
      const retryAfterSec = Number(response.headers["retry-after"]);
      if (!Number.isNaN(retryAfterSec)) {
        return retryAfterSec * 1000; // Convert to milliseconds
      }
    }

    // Otherwise use exponential backoff: baseDelay * 2^(attempt-1)
    // This gives increasingly longer delays for subsequent retries
    return this.#options.baseDelay * 2 ** (attempt - 1);
  }

  /**
   * Gets a descriptive categorized reason for a retry based on status code.
   * Used for event tracking and metrics.
   *
   * @param statusCode - HTTP status code from the response
   * @returns A string describing the reason category for the retry
   * @private
   */
  #getRetryReason(statusCode: number): string {
    if (statusCode === 429) {
      return "rate_limit";
    }

    if (statusCode >= 500 && statusCode < 600) {
      return "server_error";
    }

    return "unknown_error";
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
      delayMs: params.delayMs,
      reason: params.reason,
    };

    this.#rest.emit("retry", event);
  }
}
