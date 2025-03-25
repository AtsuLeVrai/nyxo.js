/**
 * Configuration options for the retry mechanism
 *
 * Controls how failed requests are retried, including timeouts,
 * eligible HTTP methods, status codes, and network error types.
 */
export interface RetryOptions {
  /**
   * Maximum number of retry attempts before giving up
   * @default 5
   * @minimum 0
   */
  readonly maxRetries: number;

  /**
   * Maximum timeout in milliseconds between retry attempts
   * @default 30000
   * @minimum 0
   */
  readonly maxTimeout: number;

  /**
   * Minimum timeout in milliseconds between retry attempts
   * @default 500
   * @minimum 0
   */
  readonly minTimeout: number;

  /**
   * Exponential backoff factor applied to timeouts between retries
   * Each retry's timeout is multiplied by this factor
   * @default 2
   * @minimum 1
   */
  readonly timeoutFactor: number;

  /**
   * Whether to respect the retry-after header from Discord
   * @default true
   */
  readonly retryAfter: boolean;

  /**
   * HTTP methods that are eligible for retry
   * @default ["GET", "PUT", "HEAD", "OPTIONS", "DELETE"]
   */
  readonly methods: Set<string>;

  /**
   * HTTP status codes that trigger a retry
   * @default [429, 500, 502, 503, 504]
   */
  readonly statusCodes: Set<number>;

  /**
   * Network error codes that trigger a retry
   * @default ["ECONNRESET", "ECONNREFUSED", "ENOTFOUND", "ENETDOWN", "ENETUNREACH", "EHOSTDOWN", "UND_ERR_SOCKET"]
   */
  readonly errorCodes: Set<string>;
}

/**
 * Default configuration options for the retry mechanism
 */
export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 5,
  maxTimeout: 30000,
  minTimeout: 500,
  timeoutFactor: 2,
  retryAfter: true,
  methods: new Set(["GET", "PUT", "HEAD", "OPTIONS", "DELETE"]),
  statusCodes: new Set([429, 500, 502, 503, 504]),
  errorCodes: new Set([
    "ECONNRESET",
    "ECONNREFUSED",
    "ENOTFOUND",
    "ENETDOWN",
    "ENETUNREACH",
    "EHOSTDOWN",
    "UND_ERR_SOCKET",
  ]),
};

/**
 * Validates and merges retry mechanism options with default values
 *
 * @param options - User-provided options
 * @returns Validated options merged with defaults
 * @throws Error if validation fails
 */
export function validateRetryOptions(
  options: Partial<RetryOptions>,
): RetryOptions {
  const mergedOptions: RetryOptions = {
    ...DEFAULT_RETRY_OPTIONS,
    ...options,
    // For Set types, we need to handle them specially
    methods: options.methods || DEFAULT_RETRY_OPTIONS.methods,
    statusCodes: options.statusCodes || DEFAULT_RETRY_OPTIONS.statusCodes,
    errorCodes: options.errorCodes || DEFAULT_RETRY_OPTIONS.errorCodes,
  };

  if (
    typeof mergedOptions.maxRetries !== "number" ||
    mergedOptions.maxRetries < 0 ||
    !Number.isInteger(mergedOptions.maxRetries)
  ) {
    throw new Error("maxRetries must be a non-negative integer");
  }

  if (
    typeof mergedOptions.maxTimeout !== "number" ||
    mergedOptions.maxTimeout < 0 ||
    !Number.isInteger(mergedOptions.maxTimeout)
  ) {
    throw new Error("maxTimeout must be a non-negative integer");
  }

  if (
    typeof mergedOptions.minTimeout !== "number" ||
    mergedOptions.minTimeout < 0 ||
    !Number.isInteger(mergedOptions.minTimeout)
  ) {
    throw new Error("minTimeout must be a non-negative integer");
  }

  if (
    typeof mergedOptions.timeoutFactor !== "number" ||
    mergedOptions.timeoutFactor < 1
  ) {
    throw new Error(
      "timeoutFactor must be a number greater than or equal to 1",
    );
  }

  if (typeof mergedOptions.retryAfter !== "boolean") {
    throw new Error("retryAfter must be a boolean");
  }

  if (!(mergedOptions.methods instanceof Set)) {
    throw new Error("methods must be a Set of strings");
  }

  if (!(mergedOptions.statusCodes instanceof Set)) {
    throw new Error("statusCodes must be a Set of numbers");
  }

  if (!(mergedOptions.errorCodes instanceof Set)) {
    throw new Error("errorCodes must be a Set of strings");
  }

  return mergedOptions;
}
