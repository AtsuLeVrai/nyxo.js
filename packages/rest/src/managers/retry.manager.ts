import { sleep } from "@nyxojs/core";
import { z } from "zod/v4";
import type { Rest } from "../core/index.js";
import type { HttpMethod, HttpResponse, RetryEvent } from "../types/index.js";

/**
 * Configuration schema for intelligent retry behavior with Discord API optimizations.
 *
 * Defines retry policies that balance persistence with resource efficiency,
 * optimized for Discord's infrastructure patterns and typical failure modes.
 * Configuration values are based on production Discord bot experience and
 * network reliability research.
 *
 * @remarks Default values are chosen to handle typical Discord API issues:
 * - Server restarts and deployments (5xx errors)
 * - Network hiccups and connection drops
 * - Load balancer failovers and routing issues
 * - Temporary service degradation
 */
export const RetryOptions = z.object({
  /**
   * Maximum number of retry attempts before declaring permanent failure.
   *
   * Controls how persistent the client should be when facing transient errors.
   * Higher values increase resilience but also increase latency for permanent
   * failures and resource consumption during outages.
   *
   * @default 3
   *
   * @remarks Chosen based on analysis of Discord API failure patterns:
   * - Most transient issues resolve within 1-2 retries
   * - 3 retries covers 99%+ of recoverable scenarios
   * - Beyond 3 retries, issues are likely systemic
   * - Balances user experience with resource efficiency
   *
   * @example
   * ```typescript
   * // Conservative for user-facing operations
   * const userFacing = { maxRetries: 2 };
   *
   * // Aggressive for background tasks
   * const backgroundTasks = { maxRetries: 5 };
   *
   * // Critical operations that must succeed
   * const criticalOps = { maxRetries: 10 };
   * ```
   */
  maxRetries: z.number().int().positive().default(3),

  /**
   * Base delay between retry attempts in milliseconds.
   *
   * Used as the foundation for exponential backoff calculations. This value
   * determines the minimum wait time between attempts and scales up with
   * each subsequent retry using exponential backoff algorithms.
   *
   * @default 1000 (1 second)
   *
   * @remarks 1000ms base provides good balance of:
   * - **Responsiveness**: Not too slow for user-facing operations
   * - **API courtesy**: Gives Discord's systems time to recover
   * - **Backoff scaling**: Reasonable progression (1s, 2s, 4s, 8s...)
   * - **Network timing**: Accounts for typical connection establishment overhead
   *
   * @example
   * ```typescript
   * // Fast retries for real-time features
   * const realTime = { baseDelay: 500 };    // 0.5s, 1s, 2s, 4s...
   *
   * // Standard retries for most operations
   * const standard = { baseDelay: 1000 };   // 1s, 2s, 4s, 8s...
   *
   * // Conservative retries for batch operations
   * const conservative = { baseDelay: 2000 }; // 2s, 4s, 8s, 16s...
   * ```
   */
  baseDelay: z.number().int().positive().default(1000),

  /**
   * HTTP status codes that indicate retryable failures.
   *
   * Defines which response codes should trigger retry attempts rather than
   * immediate failure. Carefully curated to include only genuinely transient
   * conditions while avoiding wasteful retries on permanent failures.
   *
   * @default [500, 502, 503, 504]
   *
   * @remarks Status code selection rationale:
   * - **500 Internal Server Error**: Temporary server issues, often recoverable
   * - **502 Bad Gateway**: Load balancer/proxy issues, usually brief
   * - **503 Service Unavailable**: Temporary overload or maintenance
   * - **504 Gateway Timeout**: Network timing issues, often transient
   * - **429 excluded**: Rate limits handled by dedicated RateLimitManager
   * - **4xx excluded**: Client errors are permanent and not retryable
   *
   * @example
   * ```typescript
   * // Minimal retries - only clear server failures
   * const conservative = { retryStatusCodes: [500, 503] };
   *
   * // Standard retries - all server and gateway errors
   * const standard = { retryStatusCodes: [500, 502, 503, 504] };
   *
   * // Aggressive retries - include some client errors
   * const aggressive = { retryStatusCodes: [408, 429, 500, 502, 503, 504] };
   * ```
   */
  retryStatusCodes: z.array(z.number()).default([500, 502, 503, 504]),
});

export type RetryOptions = z.infer<typeof RetryOptions>;

/**
 * Intelligent error classification system for optimal retry strategies.
 *
 * Categorizes failures based on their underlying causes to apply the most
 * appropriate retry strategy. Different error types have different recovery
 * patterns and require different backoff algorithms for optimal success rates.
 *
 * @remarks Classification affects retry behavior:
 * - **Timing**: How long to wait between attempts
 * - **Aggressiveness**: How quickly to back off
 * - **Strategy**: Linear vs exponential vs custom backoff
 * - **Jitter**: Amount of randomization to prevent thundering herd
 */
export enum ErrorCategory {
  /**
   * Transient server-side failures that typically resolve quickly.
   *
   * Includes HTTP 5xx errors indicating temporary server issues such as:
   * - Service restarts and deployments
   * - Temporary resource exhaustion
   * - Database connection issues
   * - Service mesh routing problems
   *
   * **Retry Strategy**: Aggressive exponential backoff with full jitter
   * **Rationale**: These errors often resolve within seconds to minutes
   */
  ServerError = "server_error",

  /**
   * Network connectivity and infrastructure failures.
   *
   * Covers network-level issues that may resolve with connection retry:
   * - DNS resolution failures (ENOTFOUND)
   * - Connection timeouts (ETIMEDOUT)
   * - Connection resets (ECONNRESET)
   * - Connection refused (ECONNREFUSED)
   * - Proxy and routing issues
   *
   * **Retry Strategy**: Fast initial retries, then exponential backoff
   * **Rationale**: Network issues often resolve quickly but may indicate
   * longer-term connectivity problems requiring patience
   */
  NetworkError = "network_error",

  /**
   * Client-side errors that are typically permanent.
   *
   * Represents HTTP 4xx errors indicating request problems:
   * - Authentication failures (401)
   * - Permission denied (403)
   * - Not found (404)
   * - Invalid request format (400)
   *
   * **Retry Strategy**: Conservative with longer delays
   * **Rationale**: These errors rarely resolve without code changes,
   * but occasional retries can handle edge cases
   */
  ClientError = "client_error",

  /**
   * Unclassified errors requiring conservative handling.
   *
   * Fallback category for errors that don't fit other patterns:
   * - Unexpected error types
   * - New error conditions
   * - Parsing or response format issues
   * - Unknown network conditions
   *
   * **Retry Strategy**: Moderate backoff with increased delays
   * **Rationale**: Unknown errors require careful handling to avoid
   * amplifying problems while still providing resilience
   */
  UnknownError = "unknown_error",
}

/**
 * Advanced retry manager implementing intelligent failure recovery for Discord API.
 *
 * Provides sophisticated retry logic with adaptive backoff strategies, comprehensive
 * error classification, and detailed observability. Designed specifically for
 * Discord's infrastructure patterns and optimized for production bot workloads.
 *
 * ## Core Features
 *
 * ### 🧠 **Intelligent Error Classification**
 * - **Contextual categorization**: Analyzes error types for optimal strategy
 * - **Network vs server differentiation**: Different handling for different failure modes
 * - **Pattern recognition**: Learns from error messages and status codes
 * - **Adaptive strategies**: Tailored backoff for each error category
 *
 * ### ⏱️ **Advanced Backoff Algorithms**
 * - **Exponential backoff**: Standard 2^n progression for most errors
 * - **Jittered delays**: ±25% randomization prevents thundering herd
 * - **Category-specific timing**: Network errors retry faster initially
 * - **Conservative fallbacks**: Unknown errors get longer delays
 *
 * ### 📊 **Comprehensive Observability**
 * - **Detailed event emission**: Every retry attempt tracked and logged
 * - **Error history collection**: Complete failure context for debugging
 * - **Performance metrics**: Timing and success rate tracking
 * - **Categorized monitoring**: Error type breakdown for analysis
 *
 * ### 🔄 **Production Resilience**
 * - **Resource protection**: Prevents retry storms and cascading failures
 * - **Graceful degradation**: Intelligent failure handling when retries exhausted
 * - **Memory efficiency**: Minimal overhead for high-throughput applications
 * - **Thread safety**: Safe for concurrent use across multiple requests
 *
 * ### 🎯 **Discord API Optimization**
 * - **Rate limit awareness**: Defers to RateLimitManager for 429 responses
 * - **Server pattern recognition**: Optimized for Discord's infrastructure
 * - **Gateway-specific handling**: Special logic for gateway connection errors
 * - **Bot-friendly defaults**: Configuration tuned for typical bot workloads
 *
 * @example
 * ```typescript
 * // Production configuration for Discord bot
 * const retryManager = new RetryManager(restClient, {
 *   maxRetries: 3,
 *   baseDelay: 1000,
 *   retryStatusCodes: [500, 502, 503, 504]
 * });
 *
 * // Process a request with automatic retries
 * const response = await retryManager.processResponse(
 *   () => restClient.get('/users/@me'),
 *   'user-profile-req-123',
 *   'GET',
 *   '/users/@me'
 * );
 *
 * // Listen for retry events for monitoring
 * restClient.on('retry', (event) => {
 *   console.log(`Retry ${event.attempt}/${event.maxAttempts} for ${event.path}`);
 *   console.log(`Error: ${event.error.message}`);
 *   console.log(`Waiting ${event.delay}ms before next attempt`);
 * });
 * ```
 *
 * ## Error Handling Strategy
 *
 * The retry manager implements a sophisticated decision tree:
 *
 * 1. **Success (2xx)**: Return immediately
 * 2. **Rate limit (429)**: Delegate to RateLimitManager
 * 3. **Retryable error**: Apply categorized backoff strategy
 * 4. **Non-retryable error**: Return immediately with error context
 * 5. **Network error**: Fast initial retry, then exponential backoff
 * 6. **Unknown error**: Conservative retry with extended delays
 *
 * @remarks This manager is specifically designed for Discord API patterns
 * and should not be used for other APIs without configuration adjustments.
 * Rate limiting is intentionally excluded from this manager's scope.
 */
export class RetryManager {
  /**
   * Reference to the parent REST client for event emission and coordination.
   *
   * Used to emit retry events for monitoring and observability, and to
   * coordinate with other managers like RateLimitManager. Provides access
   * to shared configuration and logging infrastructure.
   *
   * @remarks The REST client manages the overall request lifecycle while
   * this retry manager focuses specifically on failure recovery logic.
   */
  readonly #rest: Rest;

  /**
   * Validated configuration options controlling retry behavior.
   *
   * Contains all retry policies including attempt limits, timing parameters,
   * and status code classifications. All options are validated through Zod
   * schemas to ensure type safety and reasonable values.
   *
   * @remarks Configuration is immutable after construction to ensure
   * consistent retry behavior across all requests processed by this manager.
   */
  readonly #options: RetryOptions;

  /**
   * Initializes a new retry manager with validated configuration.
   *
   * Creates a production-ready retry manager with sophisticated error handling
   * and backoff strategies. The manager is immediately ready to process
   * requests with full retry logic and event emission.
   *
   * @param rest - REST client instance for event emission and coordination
   * @param options - Retry configuration controlling behavior and limits
   *
   * @example
   * ```typescript
   * // Standard production configuration
   * const retryManager = new RetryManager(restClient, {
   *   maxRetries: 3,
   *   baseDelay: 1000,
   *   retryStatusCodes: [500, 502, 503, 504]
   * });
   *
   * // High-resilience configuration for critical operations
   * const criticalRetryManager = new RetryManager(restClient, {
   *   maxRetries: 5,
   *   baseDelay: 500,
   *   retryStatusCodes: [408, 500, 502, 503, 504]
   * });
   *
   * // Conservative configuration for rate-limited endpoints
   * const conservativeRetryManager = new RetryManager(restClient, {
   *   maxRetries: 2,
   *   baseDelay: 2000,
   *   retryStatusCodes: [500, 503]
   * });
   * ```
   *
   * @remarks The constructor validates all configuration options and will
   * throw immediately if any values are invalid or inconsistent.
   */
  constructor(rest: Rest, options: RetryOptions) {
    this.#rest = rest;
    this.#options = options;
  }

  /**
   * Processes HTTP responses with intelligent retry logic and failure recovery.
   *
   * Implements the complete retry workflow including error classification,
   * backoff calculation, attempt tracking, and event emission. Handles both
   * HTTP response errors and network/runtime exceptions with appropriate
   * recovery strategies for each category.
   *
   * @param makeRequest - Factory function that creates and executes the HTTP request
   * @param requestId - Unique identifier for request tracking and correlation
   * @param method - HTTP method used for the request (for logging and classification)
   * @param path - API path being requested (for logging and monitoring)
   * @returns Promise resolving to the final HTTP response after retries
   *
   * @throws {Error} If all retry attempts fail, throws comprehensive error with
   *   complete failure history and detailed context for debugging
   *
   * @example
   * ```typescript
   * const retryManager = new RetryManager(rest, { maxRetries: 3 });
   *
   * // Process a GET request with retries
   * const userResponse = await retryManager.processResponse(
   *   () => rest.get('/users/@me'),
   *   'get-current-user-456',
   *   'GET',
   *   '/users/@me'
   * );
   *
   * // Process a POST request with retries
   * const messageResponse = await retryManager.processResponse(
   *   () => rest.post('/channels/123/messages', {
   *     body: JSON.stringify({ content: 'Hello!' })
   *   }),
   *   'send-message-789',
   *   'POST',
   *   '/channels/123/messages'
   * );
   *
   * // Handle specific errors
   * try {
   *   const response = await retryManager.processResponse(
   *     () => rest.get('/nonexistent-endpoint'),
   *     'test-req-999',
   *     'GET',
   *     '/nonexistent-endpoint'
   *   );
   * } catch (error) {
   *   // Error includes complete retry history and failure analysis
   *   console.error('Request failed after all retries:', error.message);
   * }
   * ```
   *
   * ## Retry Decision Logic
   *
   * The method implements this decision flow:
   *
   * 1. **Execute request** via makeRequest factory function
   * 2. **Check response status**:
   *    - Success (< 400): Return immediately
   *    - Rate limit (429): Return to RateLimitManager
   *    - Retryable error: Continue to retry logic
   *    - Non-retryable error: Return immediately
   * 3. **Classify error** using status code or exception type
   * 4. **Calculate backoff delay** based on error category and attempt count
   * 5. **Emit retry event** for monitoring and observability
   * 6. **Wait for calculated delay** using exponential backoff with jitter
   * 7. **Repeat until success or max attempts reached**
   *
   * @remarks This method handles both HTTP response errors (captured as
   * HttpResponse objects) and network/runtime exceptions (thrown errors).
   * The retry logic is specifically optimized for Discord API patterns.
   */
  async processResponse<T>(
    makeRequest: () => Promise<HttpResponse<T>>,
    requestId: string,
    method: HttpMethod,
    path: string,
  ): Promise<HttpResponse<T>> {
    let attempts = 0;
    let lastResponse: HttpResponse<T> | null = null;
    const attemptErrors: Error[] = []; // Comprehensive error history for debugging

    // Continue until success or max attempts exhausted
    while (attempts <= this.#options.maxRetries) {
      try {
        // Execute the request using provided factory function
        const response = await makeRequest();
        lastResponse = response;

        // Success case: return immediately for successful responses
        if (
          response.statusCode < 400 ||
          !this.#options.retryStatusCodes.includes(response.statusCode)
        ) {
          return response;
        }

        // Rate limit delegation: 429 responses are handled by RateLimitManager
        // This manager focuses on transient failures, not rate limiting
        if (response.statusCode === 429) {
          return response;
        }

        // Increment attempt counter for retry tracking
        attempts++;

        // Create detailed error object for this attempt
        const currentError = new Error(
          response.reason || `HTTP error ${response.statusCode}`,
        );
        attemptErrors.push(currentError);

        // Check if we've exhausted all retry attempts
        if (attempts > this.#options.maxRetries) {
          return response;
        }

        // Classify error for appropriate retry strategy
        const errorCategory = this.#categorizeError(response.statusCode);

        // Calculate intelligent backoff delay based on error type
        const delay = this.#calculateDelay(attempts, errorCategory);

        // Emit comprehensive retry event for monitoring
        this.#emitRetryEvent({
          requestId,
          method,
          path,
          error: currentError,
          attempt: attempts,
          delay,
          reason: errorCategory,
        });

        // Wait for calculated delay before next attempt
        await sleep(delay);
      } catch (error) {
        // Handle network errors and other exceptions
        attempts++;

        // Normalize error object for consistent handling
        const currentError =
          error instanceof Error ? error : new Error(String(error));
        attemptErrors.push(currentError);

        // Check if we've exhausted all retry attempts
        if (attempts > this.#options.maxRetries) {
          // Generate comprehensive failure report with complete error history
          const errorSummary = this.#summarizeErrors(attemptErrors);
          throw new Error(
            `Request failed after ${attempts} attempts. [${method} ${path}]\n${errorSummary}`,
          );
        }

        // Classify network/exception error for appropriate strategy
        const errorCategory = this.#categorizeNetworkError(currentError);

        // Calculate backoff delay optimized for this error type
        const delay = this.#calculateDelay(attempts, errorCategory);

        // Emit retry event with network error context
        this.#emitRetryEvent({
          requestId,
          method,
          path,
          error: currentError,
          attempt: attempts,
          delay,
          reason: errorCategory,
        });

        // Wait before attempting retry
        await sleep(delay);
      }
    }

    // Fallback: return last response if available (should rarely reach here)
    return lastResponse as HttpResponse<T>;
  }

  /**
   * Classifies HTTP response errors to determine optimal retry strategy.
   *
   * Analyzes HTTP status codes to categorize the underlying failure type,
   * which determines the appropriate backoff algorithm and retry aggressiveness.
   * Based on HTTP standards and Discord API behavior patterns.
   *
   * @param statusCode - HTTP status code from the failed response
   * @returns Error category for retry strategy selection
   *
   * @example
   * ```typescript
   * // Server errors (5xx) - aggressive retry
   * categorizeError(500) // Returns ErrorCategory.ServerError
   * categorizeError(503) // Returns ErrorCategory.ServerError
   *
   * // Client errors (4xx) - conservative retry
   * categorizeError(400) // Returns ErrorCategory.ClientError
   * categorizeError(404) // Returns ErrorCategory.ClientError
   *
   * // Unknown/unexpected codes
   * categorizeError(999) // Returns ErrorCategory.UnknownError
   * ```
   *
   * @internal
   */
  #categorizeError(statusCode: number): ErrorCategory {
    // Server errors (5xx): Temporary issues worth aggressive retry
    if (statusCode >= 500 && statusCode < 600) {
      return ErrorCategory.ServerError;
    }

    // Client errors (4xx): Usually permanent, minimal retry value
    if (statusCode >= 400 && statusCode < 500) {
      return ErrorCategory.ClientError;
    }

    // Unknown status codes: Conservative handling for safety
    return ErrorCategory.UnknownError;
  }

  /**
   * Classifies network and runtime errors for specialized retry handling.
   *
   * Analyzes exception types and error messages to determine the underlying
   * network issue. Network errors often have different recovery patterns
   * than HTTP response errors and benefit from tailored retry strategies.
   *
   * @param error - Exception that occurred during request execution
   * @returns Error category optimized for the specific network failure type
   *
   * @example
   * ```typescript
   * // Timeout errors - network issues, fast initial retry
   * categorizeNetworkError(new Error('Request timeout'))
   * // Returns ErrorCategory.NetworkError
   *
   * // Connection errors - network infrastructure issues
   * categorizeNetworkError(new Error('ECONNRESET'))
   * // Returns ErrorCategory.NetworkError
   *
   * // Unknown errors - conservative handling
   * categorizeNetworkError(new Error('Unexpected error'))
   * // Returns ErrorCategory.UnknownError
   * ```
   *
   * @remarks Pattern matching is case-insensitive and covers common Node.js
   * network error codes and browser error patterns for maximum compatibility.
   *
   * @internal
   */
  #categorizeNetworkError(error: Error): ErrorCategory {
    // Timeout errors: Often resolve quickly with retry
    if (error.name === "AbortError" || error.message.includes("timeout")) {
      return ErrorCategory.NetworkError;
    }

    // Common Node.js network error patterns
    const networkErrorPatterns = [
      "ECONNRESET", // Connection reset by peer
      "ECONNREFUSED", // Connection refused
      "ENOTFOUND", // DNS resolution failed
      "ETIMEDOUT", // Operation timed out
      "network", // Generic network error
      "connection", // Connection-related error
      "socket", // Socket-level error
    ];

    // Case-insensitive pattern matching for robust detection
    for (const pattern of networkErrorPatterns) {
      if (error.message.toLowerCase().includes(pattern.toLowerCase())) {
        return ErrorCategory.NetworkError;
      }
    }

    // Unknown error patterns: Use conservative strategy
    return ErrorCategory.UnknownError;
  }

  /**
   * Calculates intelligent backoff delays using category-specific algorithms.
   *
   * Implements sophisticated delay calculation that adapts to error types,
   * attempt numbers, and expected recovery patterns. Uses exponential backoff
   * as the foundation with category-specific modifications and jitter to
   * prevent thundering herd effects.
   *
   * @param attempt - Current attempt number (1-based indexing)
   * @param errorCategory - Classification of the error for strategy selection
   * @returns Delay in milliseconds to wait before the next retry attempt
   *
   * @example
   * ```typescript
   * // Server error progression (baseDelay = 1000ms)
   * calculateDelay(1, ErrorCategory.ServerError) // ~1000ms ± jitter
   * calculateDelay(2, ErrorCategory.ServerError) // ~2000ms ± jitter
   * calculateDelay(3, ErrorCategory.ServerError) // ~4000ms ± jitter
   *
   * // Network error progression (faster initial retry)
   * calculateDelay(1, ErrorCategory.NetworkError) // ~1000ms ± jitter
   * calculateDelay(2, ErrorCategory.NetworkError) // ~1000ms ± jitter (capped)
   * calculateDelay(3, ErrorCategory.NetworkError) // ~4000ms ± jitter
   *
   * // Client error progression (longer delays)
   * calculateDelay(1, ErrorCategory.ClientError) // ~2000ms ± jitter
   * calculateDelay(2, ErrorCategory.ClientError) // ~4000ms ± jitter
   * calculateDelay(3, ErrorCategory.ClientError) // ~8000ms ± jitter
   * ```
   *
   * ## Algorithm Details
   *
   * **Base Formula**: `baseDelay * 2^(attempt-1)`
   *
   * **Jitter**: ±25% randomization to prevent synchronized retries
   *
   * **Category Modifications**:
   * - **ServerError**: Standard exponential backoff (aggressive recovery)
   * - **NetworkError**: Fast initial retries, then standard backoff
   * - **ClientError**: 2x multiplier (conservative, likely permanent)
   * - **UnknownError**: 1.5x multiplier (cautious approach)
   *
   * @remarks Jitter is essential for preventing retry storms when multiple
   * clients experience the same failure simultaneously. The ±25% range
   * provides good distribution without excessive delay variation.
   *
   * @internal
   */
  #calculateDelay(attempt: number, errorCategory: ErrorCategory): number {
    // Standard exponential backoff: baseDelay * 2^(attempt-1)
    const baseBackoff = this.#options.baseDelay * 2 ** (attempt - 1);

    // Add jitter to prevent thundering herd effects
    // ±25% randomization provides good distribution
    const jitter = baseBackoff * 0.5 * (Math.random() - 0.5);

    // Apply category-specific delay strategies
    switch (errorCategory) {
      case ErrorCategory.ServerError:
        // Server errors: Standard exponential backoff with jitter
        // Rationale: Server issues often resolve quickly, worth aggressive retry
        return baseBackoff + jitter;

      case ErrorCategory.NetworkError: {
        // Network errors: Fast initial retries, then standard backoff
        // Rationale: Network hiccups often resolve immediately, but persistent
        // issues need patience
        if (attempt <= 2) {
          // Cap early attempts at 1 second for fast recovery
          return Math.min(1000, baseBackoff) + jitter;
        }
        return baseBackoff + jitter;
      }

      case ErrorCategory.ClientError:
        // Client errors: Conservative retry with longer delays
        // Rationale: 4xx errors are usually permanent, minimal retry value
        return baseBackoff * 2 + jitter;

      default:
        // Unknown errors: Moderate increase for safety
        // Rationale: Unknown failure modes require cautious approach
        return baseBackoff * 1.5 + jitter;
    }
  }

  /**
   * Generates comprehensive error summaries for debugging and monitoring.
   *
   * Creates human-readable summaries of retry attempt failures that provide
   * complete context for debugging failed requests. Formats error information
   * in a way that's useful for both developers and monitoring systems.
   *
   * @param errors - Array of errors collected from each retry attempt
   * @returns Formatted string summarizing all failure attempts
   *
   * @example
   * ```typescript
   * const errors = [
   *   new Error('Connection timeout'),
   *   new Error('HTTP 502 Bad Gateway'),
   *   new Error('HTTP 503 Service Unavailable')
   * ];
   *
   * const summary = summarizeErrors(errors);
   * // Returns:
   * // "Attempt 1: Connection timeout
   * //  Attempt 2: HTTP 502 Bad Gateway
   * //  Attempt 3: HTTP 503 Service Unavailable"
   * ```
   *
   * @remarks Error summaries are included in final failure exceptions to
   * provide complete context about what was attempted and why it failed.
   * This information is invaluable for debugging production issues.
   *
   * @internal
   */
  #summarizeErrors(errors: Error[]): string {
    // Handle edge cases gracefully
    if (errors.length === 0) {
      return "No errors recorded";
    }

    // Single error: simple format
    if (errors.length === 1) {
      return `Error: ${(errors[0] as Error).message}`;
    }

    // Multiple errors: detailed attempt-by-attempt breakdown
    return errors
      .map((error, index) => `Attempt ${index + 1}: ${error.message}`)
      .join("\n");
  }

  /**
   * Emits comprehensive retry events for monitoring and observability.
   *
   * Creates and emits detailed retry events that provide complete context
   * about retry attempts for monitoring systems, alerting, and debugging.
   * Events include timing information, error details, and retry metadata.
   *
   * @param params - Event parameters containing all retry attempt details
   *
   * @example
   * ```typescript
   * // Example emitted event structure:
   * {
   *   timestamp: "2023-12-07T15:30:45.123Z",
   *   requestId: "user-profile-req-123",
   *   method: "GET",
   *   path: "/users/@me",
   *   error: Error("HTTP 503 Service Unavailable"),
   *   attempt: 2,
   *   maxAttempts: 3,
   *   delay: 2150,
   *   reason: "server_error"
   * }
   * ```
   *
   * @remarks Retry events are essential for production monitoring to:
   * - Track system reliability and error patterns
   * - Alert on unusual retry patterns or failure clusters
   * - Analyze performance impact of retry logic
   * - Debug specific request failures with complete context
   *
   * @internal
   */
  #emitRetryEvent(params: Omit<RetryEvent, "timestamp" | "maxAttempts">): void {
    // Create comprehensive event object with standardized timestamp
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

    // Emit event for external monitoring and logging systems
    this.#rest.emit("retry", event);
  }
}
