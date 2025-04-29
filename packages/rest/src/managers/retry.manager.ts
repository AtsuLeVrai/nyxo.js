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
    const delay = rateLimitResult.retryAfter || 1000;

    // Create rate limit information for logging
    const limitInfo = {
      bucketId: rateLimitResult.bucketHash || "unknown",
      scope: rateLimitResult.scope || "user",
      isGlobal: rateLimitResult.limitType === "global",
      retryAfter: delay,
      method,
      path,
    };

    // Emit retry event for tracking and monitoring
    this.#emitRetryEvent({
      requestId,
      method,
      path,
      error: new Error(
        rateLimitResult.reason ||
          `Rate limit exceeded for ${limitInfo.bucketId} (${limitInfo.scope})`,
      ),
      attempt: 1,
      delay,
      reason: "rate_limit",
    });

    // Wait for the specified time before allowing the request to proceed
    await sleep(delay);
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
    const attemptErrors: Error[] = []; // Track all errors for detailed reporting

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

        // Capture the error for later
        const currentError = new Error(
          response.reason || `HTTP error ${response.statusCode}`,
        );
        attemptErrors.push(currentError);

        // If max retries reached, return the last response
        if (attempts > this.#options.maxRetries) {
          // We'll return the response
          return response;
        }

        // Calculate delay with exponential backoff or based on retry-after headers
        const delay = this.#calculateDelay(attempts, response);

        // Emit retry event for tracking and monitoring
        this.#emitRetryEvent({
          requestId,
          method,
          path,
          error: currentError,
          attempt: attempts,
          delay,
          reason: this.#getRetryReason(response.statusCode),
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
          // All retries failed, throw comprehensive error
          throw new Error(
            `Request failed after ${attempts} attempts. Last error: ${currentError.message} [${method} ${path}]`,
          );
        }

        // Calculate exponential backoff delay for network errors
        const delay = this.#options.baseDelay * 2 ** (attempts - 1);

        // Emit retry event for tracking and monitoring
        this.#emitRetryEvent({
          requestId,
          method,
          path,
          error: currentError,
          attempt: attempts,
          delay,
          reason: "network_error",
        });

        // Wait before retry
        await sleep(delay);
      }
    }

    // If we completed all retries but still have an error status code
    if (lastResponse && lastResponse.statusCode >= 400) {
      // We don't throw here - the error will be handled by the rest.ts class
      // that will convert this to an appropriate error type based on status code
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
      delay: params.delay,
      reason: params.reason,
    };

    this.#rest.emit("retry", event);
  }
}
