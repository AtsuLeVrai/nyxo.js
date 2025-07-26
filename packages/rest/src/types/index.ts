import type { Readable } from "node:stream";
import type { FileInput } from "../handlers/index.js";

/**
 * Context object passed through the middleware pipeline.
 *
 * Contains the complete request state and allows middleware to inspect and modify
 * both the request configuration and response data as it flows through the system.
 *
 * @typeParam T - The expected response data type
 *
 * @example
 * ```typescript
 * const loggingMiddleware: Middleware = {
 *   name: "logger",
 *   beforeRequest: async (context) => {
 *     console.log(`${context.method} ${context.path}`);
 *     return context;
 *   }
 * };
 * ```
 *
 * @public
 */
export interface MiddlewareContext<T = unknown> {
  /**
   * Unique identifier for tracking this request through the pipeline.
   * Used for correlation in logs, metrics, and distributed tracing.
   *
   * @readonly
   */
  readonly requestId: string;

  /**
   * HTTP method for the request.
   * Can be modified by middleware to change request behavior.
   */
  method: HttpMethod;

  /**
   * API path being requested, without the base URL.
   * Can be modified by middleware for request transformation.
   */
  path: string;

  /**
   * Complete request configuration including headers, body, and files.
   * Middleware can modify any aspect of the request before execution.
   */
  request: HttpRequestOptions;

  /**
   * Response data after request completion.
   * Only available in afterResponse and onError middleware hooks.
   */
  response?: HttpResponse<T>;

  /**
   * Error that occurred during request processing.
   * Only available in onError middleware hooks.
   */
  error?: Error;

  /**
   * Timestamp when the request processing started.
   * Useful for calculating request duration in middleware.
   *
   * @readonly
   */
  readonly startTime: number;

  /**
   * Custom metadata that can be set by middleware.
   * Useful for passing data between middleware in the pipeline.
   */
  metadata: Record<string, unknown>;
}

/**
 * Function executed before the HTTP request is sent.
 *
 * Can inspect and modify the request context, including headers, body,
 * and other request parameters. Return the modified context to continue
 * or throw an error to abort the request.
 *
 * @param context - The current request context
 * @returns Promise resolving to the potentially modified context
 *
 * @example
 * ```typescript
 * const authMiddleware: BeforeRequestHook = async (context) => {
 *   // Add custom authentication header
 *   context.request.headers = {
 *     ...context.request.headers,
 *     'X-Custom-Auth': await getAuthToken()
 *   };
 *   return context;
 * };
 * ```
 *
 * @public
 */
export type BeforeRequestHook<T = unknown> = (
  context: MiddlewareContext<T>,
) => Promise<MiddlewareContext<T>>;

/**
 * Function executed after a successful HTTP response.
 *
 * Can inspect and modify the response data before it's returned to the caller.
 * Useful for response transformation, caching, or additional processing.
 *
 * @param context - The request context with response data
 * @returns Promise resolving to the potentially modified context
 *
 * @example
 * ```typescript
 * const cacheMiddleware: AfterResponseHook = async (context) => {
 *   if (context.method === 'GET' && context.response) {
 *     await cache.set(context.path, context.response.data);
 *   }
 *   return context;
 * };
 * ```
 *
 * @public
 */
export type AfterResponseHook<T = unknown> = (
  context: MiddlewareContext<T>,
) => Promise<MiddlewareContext<T>>;

/**
 * Function executed when an error occurs during request processing.
 *
 * Can inspect the error, potentially recover from it, or modify error handling.
 * Can either return a modified context to continue processing or rethrow/throw
 * a new error to halt execution.
 *
 * @param context - The request context with error information
 * @returns Promise resolving to the potentially modified context
 *
 * @example
 * ```typescript
 * const retryMiddleware: ErrorHook = async (context) => {
 *   if (context.error?.message.includes('network')) {
 *     context.metadata.retryCount = (context.metadata.retryCount as number || 0) + 1;
 *     if (context.metadata.retryCount < 3) {
 *       // Signal that request should be retried
 *       delete context.error;
 *     }
 *   }
 *   return context;
 * };
 * ```
 *
 * @public
 */
export type ErrorHook<T = unknown> = (
  context: MiddlewareContext<T>,
) => Promise<MiddlewareContext<T>>;

/**
 * Complete middleware definition with lifecycle hooks.
 *
 * Middleware provides a way to intercept and modify requests and responses
 * at various stages of the HTTP pipeline. Each middleware has a unique name
 * and can implement any combination of the available hooks.
 *
 * @example
 * ```typescript
 * const loggingMiddleware: Middleware = {
 *   name: "request-logger",
 *   beforeRequest: async (context) => {
 *     console.log(`→ ${context.method} ${context.path}`);
 *     context.metadata.startTime = Date.now();
 *     return context;
 *   },
 *   afterResponse: async (context) => {
 *     const duration = Date.now() - (context.metadata.startTime as number);
 *     console.log(`← ${context.response?.statusCode} (${duration}ms)`);
 *     return context;
 *   },
 *   onError: async (context) => {
 *     console.error(`✗ ${context.error?.message}`);
 *     return context;
 *   }
 * };
 * ```
 *
 * @public
 */
export interface Middleware<T = unknown> {
  /**
   * Unique identifier for this middleware.
   * Used for debugging, metrics, and middleware management.
   */
  readonly name: string;

  /**
   * Optional hook executed before the HTTP request is sent.
   * Can modify request parameters or abort the request.
   */
  beforeRequest?: BeforeRequestHook<T>;

  /**
   * Optional hook executed after a successful HTTP response.
   * Can modify response data or perform additional processing.
   */
  afterResponse?: AfterResponseHook<T>;

  /**
   * Optional hook executed when an error occurs.
   * Can handle errors, implement retry logic, or modify error responses.
   */
  onError?: ErrorHook<T>;
}

/**
 * Result of middleware execution indicating success or failure.
 *
 * @internal
 */
export interface MiddlewareResult<T = unknown> {
  /**
   * Whether the middleware execution succeeded.
   */
  success: boolean;

  /**
   * The resulting context after middleware execution.
   */
  context: MiddlewareContext<T>;

  /**
   * Error that occurred during middleware execution, if any.
   */
  error?: Error;
}

/**
 * Statistical distribution metrics for performance monitoring.
 *
 * Provides comprehensive statistical analysis of timing data including
 * percentiles, variance, and distribution characteristics for performance
 * optimization and SLA monitoring.
 *
 * @example
 * ```typescript
 * const latencyStats: DistributionMetrics = {
 *   count: 1000,
 *   min: 12,
 *   max: 2400,
 *   mean: 145.6,
 *   p50: 130,
 *   p95: 280,
 *   p99: 520,
 *   variance: 2840.5,
 *   stddev: 53.3
 * };
 * ```
 *
 * @public
 */
export interface DistributionMetrics {
  /**
   * Total number of measurements recorded.
   */
  count: number;

  /**
   * Minimum value observed.
   */
  min: number;

  /**
   * Maximum value observed.
   */
  max: number;

  /**
   * Arithmetic mean (average) of all values.
   */
  mean: number;

  /**
   * 50th percentile (median) value.
   * Half of all measurements are below this value.
   */
  p50: number;

  /**
   * 95th percentile value.
   * 95% of all measurements are below this value.
   * Common SLA monitoring threshold.
   */
  p95: number;

  /**
   * 99th percentile value.
   * 99% of all measurements are below this value.
   * Used for identifying outliers and worst-case performance.
   */
  p99: number;

  /**
   * Statistical variance of the distribution.
   * Measures spread of values around the mean.
   */
  variance: number;

  /**
   * Standard deviation of the distribution.
   * Square root of variance, in same units as original values.
   */
  stddev: number;
}

/**
 * Counter metric for tracking cumulative events.
 *
 * Monotonically increasing counter that tracks the total number
 * of occurrences of specific events over time.
 *
 * @example
 * ```typescript
 * const requestCounter: CounterMetric = {
 *   value: 15847,
 *   lastIncrement: 1703425200000
 * };
 * ```
 *
 * @public
 */
export interface CounterMetric {
  /**
   * Current counter value.
   */
  value: number;

  /**
   * Timestamp of the last increment operation.
   */
  lastIncrement: number;
}

/**
 * Histogram metric for tracking value distributions.
 *
 * Tracks the frequency distribution of values across predefined
 * buckets for detailed performance analysis and alerting.
 *
 * @example
 * ```typescript
 * const latencyHistogram: HistogramMetric = {
 *   buckets: new Map([
 *     [50, 120],   // 120 requests under 50ms
 *     [100, 340],  // 340 requests under 100ms
 *     [200, 480],  // 480 requests under 200ms
 *     [500, 495],  // 495 requests under 500ms
 *     [Infinity, 500] // 500 total requests
 *   ]),
 *   sum: 67450,
 *   count: 500
 * };
 * ```
 *
 * @public
 */
export interface HistogramMetric {
  /**
   * Map of bucket upper bounds to cumulative counts.
   * Keys represent the upper bound of each bucket.
   * Values represent the cumulative count of observations in that bucket.
   */
  buckets: Map<number, number>;

  /**
   * Sum of all observed values.
   * Used for calculating mean and other derived metrics.
   */
  sum: number;

  /**
   * Total number of observations.
   */
  count: number;
}

/**
 * Gauge metric for tracking instantaneous values.
 *
 * Represents a value that can increase or decrease over time,
 * such as active connections, memory usage, or queue depth.
 *
 * @example
 * ```typescript
 * const activeConnections: GaugeMetric = {
 *   value: 42,
 *   lastUpdate: 1703425200000
 * };
 * ```
 *
 * @public
 */
export interface GaugeMetric {
  /**
   * Current gauge value.
   */
  value: number;

  /**
   * Timestamp of the last update operation.
   */
  lastUpdate: number;
}

/**
 * Comprehensive HTTP request metrics.
 *
 * Aggregates detailed performance and reliability metrics for HTTP requests
 * including timing distributions, error rates, and status code breakdowns.
 *
 * @public
 */
export interface RequestMetrics {
  /**
   * Request latency distribution in milliseconds.
   * Includes percentiles and statistical measures for SLA monitoring.
   */
  latency: DistributionMetrics;

  /**
   * Response size distribution in bytes.
   * Tracks bandwidth usage and payload characteristics.
   */
  responseSize: DistributionMetrics;

  /**
   * Total number of requests executed.
   */
  requestCount: CounterMetric;

  /**
   * Total number of failed requests (4xx and 5xx responses).
   */
  errorCount: CounterMetric;

  /**
   * Number of requests that exceeded timeout thresholds.
   */
  timeoutCount: CounterMetric;

  /**
   * Number of requests that hit rate limits.
   */
  rateLimitCount: CounterMetric;

  /**
   * Breakdown of response counts by HTTP status code.
   * Maps status codes to occurrence counts.
   */
  statusCodes: Map<number, CounterMetric>;

  /**
   * Current number of active/in-flight requests.
   */
  activeRequests: GaugeMetric;

  /**
   * Latency histogram for detailed performance analysis.
   * Uses predefined buckets for efficient aggregation.
   */
  latencyHistogram: HistogramMetric;
}

/**
 * Rate limiting metrics and bucket state.
 *
 * Tracks rate limit utilization, violations, and bucket
 * health for capacity planning and compliance monitoring.
 *
 * @public
 */
export interface RateLimitMetrics {
  /**
   * Total number of rate limit violations encountered.
   */
  violations: CounterMetric;

  /**
   * Number of requests that were proactively delayed to prevent violations.
   */
  preventedViolations: CounterMetric;

  /**
   * Current number of active rate limit buckets.
   */
  activeBuckets: GaugeMetric;

  /**
   * Distribution of bucket utilization percentages.
   * Tracks how close to limits buckets are operating.
   */
  bucketUtilization: DistributionMetrics;

  /**
   * Time spent waiting for rate limits to reset (milliseconds).
   */
  waitTime: DistributionMetrics;

  /**
   * Rate limit bucket statistics by bucket ID.
   * Maps bucket hashes to their individual metrics.
   */
  bucketStats: Map<
    string,
    {
      hits: CounterMetric;
      utilization: GaugeMetric;
      lastReset: number;
    }
  >;
}

/**
 * Retry operation metrics and patterns.
 *
 * Monitors retry behavior, success rates, and backoff
 * patterns for reliability optimization.
 *
 * @public
 */
export interface RetryMetrics {
  /**
   * Total number of retry attempts made.
   */
  attempts: CounterMetric;

  /**
   * Number of operations that succeeded after retrying.
   */
  successes: CounterMetric;

  /**
   * Number of operations that failed permanently after all retries.
   */
  failures: CounterMetric;

  /**
   * Distribution of retry counts per operation.
   * Tracks how many retries operations typically need.
   */
  retryDistribution: DistributionMetrics;

  /**
   * Time spent in retry delays (milliseconds).
   */
  delayTime: DistributionMetrics;

  /**
   * Retry reason breakdown.
   * Maps error types to retry attempt counts.
   */
  reasonStats: Map<string, CounterMetric>;
}

/**
 * Comprehensive REST client metrics aggregation.
 *
 * Top-level metrics container providing complete observability
 * into REST client behavior, performance, and reliability.
 *
 * @example
 * ```typescript
 * const metrics = await restClient.getMetrics();
 * console.log(`Total requests: ${metrics.requests.requestCount.value}`);
 * console.log(`P95 latency: ${metrics.requests.latency.p95}ms`);
 * console.log(`Error rate: ${metrics.requests.errorCount.value / metrics.requests.requestCount.value * 100}%`);
 * ```
 *
 * @public
 */
export interface RestMetrics {
  /**
   * HTTP request and response metrics.
   */
  requests: RequestMetrics;

  /**
   * Rate limiting behavior and compliance metrics.
   */
  rateLimits: RateLimitMetrics;

  /**
   * Retry operation metrics and patterns.
   */
  retries: RetryMetrics;

  /**
   * Middleware execution metrics (if middleware system is enabled).
   */
  middleware?: Map<
    string,
    {
      executions: CounterMetric;
      duration: DistributionMetrics;
      errors: CounterMetric;
    }
  >;

  /**
   * Timestamp when metrics collection started.
   */
  collectionStartTime: number;

  /**
   * Timestamp of the last metrics update.
   */
  lastUpdate: number;
}

/**
 * Event emitted when metrics are aggregated and updated.
 *
 * @public
 */
export interface MetricsUpdateEvent {
  /**
   * Timestamp when the update occurred.
   */
  timestamp: string;

  /**
   * Complete metrics snapshot.
   */
  metrics: RestMetrics;

  /**
   * Time taken to compute the update (milliseconds).
   */
  computationTime: number;
}

/**
 * Represents a single field error in a JSON API response.
 * Used to provide detailed information about validation failures or other field-specific errors.
 */
export interface JsonErrorField {
  /**
   * The error code identifying the type of error.
   * Usually a machine-readable string like "INVALID_FORMAT" or "REQUIRED_FIELD".
   */
  code: string;

  /**
   * Human-readable error message describing the issue.
   * Should be clear enough for end-users to understand the problem.
   */
  message: string;

  /**
   * Array representing the path to the field that caused the error.
   * Example: ["user", "email"] for a user's email field.
   */
  path: string[];
}

/**
 * Represents a standardized JSON error response from an API.
 * Follows a consistent format to make client-side error handling more predictable.
 */
export interface JsonErrorResponse {
  /**
   * The numeric error code (typically corresponds to HTTP status code).
   * Examples: 400 for bad request, 404 for not found, 500 for server error.
   */
  code: number;

  /**
   * The main error message providing a general description of the problem.
   * Should be concise but informative.
   */
  message: string;

  /**
   * Optional object containing field-specific errors.
   * Organized by field name with arrays of specific error details.
   */
  errors?: Record<string, { _errors: JsonErrorField[] }>;
}

/**
 * Supported HTTP methods for API requests.
 * Defines the standard methods that can be used when making HTTP requests.
 */
export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS";

/**
 * Configuration options for an HTTP request.
 * Contains all parameters needed to construct and send an API request.
 */
export interface HttpRequestOptions {
  /**
   * API path to request.
   * Should not include the base URL. Example: "/users/123".
   */
  path: string;

  /**
   * HTTP method to use for the request.
   * Determines how the request interacts with the server resource.
   */
  method: HttpMethod;

  /**
   * Request body data.
   * Can be a string, Buffer, or Readable stream.
   */
  body?: string | Buffer | Readable;

  /**
   * Request headers as key-value pairs.
   * Example: \{ "Content-Type": "application/json" \}
   */
  headers?: Record<string, string>;

  /**
   * Query parameters to append to the URL.
   * Will be converted to a query string and appended to the path.
   */
  query?: object;

  /**
   * Files to upload with the request.
   * Can be a single file or an array of files.
   */
  files?: FileInput | FileInput[];

  /**
   * Audit log reason for the action.
   * Will be sent in the x-audit-log-reason header.
   */
  reason?: string;
}

/**
 * Structured response from an HTTP request with parsed data.
 * Provides a unified format for handling API responses.
 *
 * @typeParam T - Type of the parsed response data
 */
export interface HttpResponse<T> {
  /**
   * HTTP status code returned by the server.
   * Standard codes as defined in the HTTP specification.
   */
  statusCode: number;

  /**
   * Normalized response headers as key-value pairs.
   * Header names are converted to lowercase.
   */
  headers: Record<string, string>;

  /**
   * Parsed response data.
   * Type depends on the generic parameter T.
   */
  data: T;

  /**
   * Reason for the response, if provided by the server.
   * May contain additional context about the response.
   */
  reason?: string;
}

/**
 * Base properties shared by all HTTP event types.
 * Provides common fields for event tracking and correlation.
 */
export interface BaseHttpEvent {
  /**
   * ISO timestamp when the event occurred.
   * Format: "YYYY-MM-DDTHH:mm:ss.sssZ"
   */
  timestamp: string;

  /**
   * Unique identifier for the related request.
   * Used to correlate different events for the same request.
   */
  requestId: string;
}

/**
 * Emitted when an HTTP request completes successfully.
 * Contains metrics and response information for successful requests.
 */
export interface RequestEvent extends BaseHttpEvent {
  /**
   * API path for this request.
   * Path component of the URL without the origin.
   */
  path: string;

  /**
   * HTTP method used for the request.
   * One of the supported HTTP methods.
   */
  method: HttpMethod;

  /**
   * HTTP status code received from the server.
   * Typically a 2xx code for success events.
   */
  statusCode: number;

  /**
   * Total request duration in milliseconds.
   * Measured from request start to response completion.
   */
  duration: number;

  /**
   * Size of response body in bytes, if available.
   * May be undefined if the size couldn't be determined.
   */
  responseSize?: number;
}

/**
 * Emitted when a request retry is attempted.
 * Contains information about the retry attempt and the error that triggered it.
 */
export interface RetryEvent extends BaseHttpEvent {
  /**
   * API path for this request.
   * Path component of the URL without the origin.
   */
  path: string;

  /**
   * HTTP method used for the request.
   * One of the supported HTTP methods.
   */
  method: HttpMethod;

  /**
   * The error that triggered the retry.
   * Contains details about what went wrong.
   */
  error: Error;

  /**
   * Current retry attempt (1-based).
   * Increments with each retry of the same request.
   */
  attempt: number;

  /**
   * Maximum configured retry attempts.
   * The upper limit for retry attempts.
   */
  maxAttempts: number;

  /**
   * Delay in milliseconds before this retry.
   * Often uses exponential backoff between attempts.
   */
  delay: number;

  /**
   * Categorized reason for the retry.
   * Explains why a retry was needed (e.g., "network", "server", "timeout").
   */
  reason: string;
}

/**
 * Emitted when a rate limit is encountered during a request.
 * Contains information about the rate limit and when it will reset.
 */
export interface RateLimitHitEvent extends BaseHttpEvent {
  /**
   * The bucket identifier for this rate limit.
   * Used to track rate limits for specific endpoints.
   */
  bucketId: string;

  /**
   * Time in milliseconds until the rate limit resets.
   * Indicates how long to wait before retrying.
   */
  resetAfter: number;

  /**
   * Whether this is a global rate limit affecting all requests.
   * False indicates a route-specific rate limit.
   */
  global: boolean;

  /**
   * The affected route if available.
   * May be undefined for global rate limits.
   */
  route?: string;

  /**
   * The affected HTTP method if available.
   * May be undefined for global rate limits.
   */
  method?: HttpMethod | "GLOBAL";
}

/**
 * Emitted when rate limit bucket information is updated.
 * Used for tracking and managing rate limit consumption.
 */
export interface RateLimitUpdateEvent extends BaseHttpEvent {
  /**
   * The bucket identifier for this rate limit.
   * Used to track rate limits for specific endpoints.
   */
  bucketId: string;

  /**
   * Remaining requests allowed in this rate limit window.
   * Decrements with each request to the same bucket.
   */
  remaining: number;

  /**
   * Total allowed requests in this rate limit window.
   * The maximum number of requests permitted in the window.
   */
  limit: number;

  /**
   * Time in milliseconds until the rate limit resets.
   * Countdown until the window refreshes.
   */
  resetAfter: number;

  /**
   * ISO timestamp when the rate limit will reset.
   * Absolute time when the window refreshes.
   */
  resetAt: string;

  /**
   * The affected route if available.
   * The API endpoint this bucket applies to.
   */
  route?: string;
}

/**
 * Emitted when a rate limit bucket expires.
 * Only emitted at verbose logging level.
 * Useful for debugging and monitoring rate limit behavior.
 */
export interface RateLimitExpireEvent extends BaseHttpEvent {
  /**
   * The bucket identifier for this rate limit.
   * Used to track rate limits for specific endpoints.
   */
  bucketId: string;

  /**
   * How long this bucket existed in milliseconds.
   * Total lifespan of the rate limit bucket.
   */
  lifespan: number;
}

/**
 * Map of event names to their payload types.
 * Used for strongly-typed event handling.
 */
export interface RestEvents {
  /**
   * Emitted when an HTTP request completes successfully.
   * Contains response data, status code, and timing information.
   */
  request: [event: RequestEvent];

  /**
   * Emitted when a rate limit is encountered.
   * Contains information about the rate limit and when it will reset.
   */
  rateLimitHit: [event: RateLimitHitEvent];

  /**
   * Emitted when rate limit information is updated from a response.
   * Contains updated quota and reset timing information.
   */
  rateLimitUpdate: [event: RateLimitUpdateEvent];

  /**
   * Emitted when a rate limit bucket expires.
   * Contains bucket identification and lifespan information.
   */
  rateLimitExpire: [event: RateLimitExpireEvent];

  /**
   * Emitted when a request retry is attempted.
   * Contains error information, attempt count, and delay information.
   */
  retry: [event: RetryEvent];

  /**
   * Emitted when metrics are aggregated and updated.
   * Contains complete metrics snapshot and computation timing.
   */
  metricsUpdate: [event: MetricsUpdateEvent];
}
