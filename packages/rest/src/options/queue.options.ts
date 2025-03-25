/**
 * Configuration options for the queue manager
 */
export interface QueueOptions {
  /**
   * Maximum number of concurrent requests allowed
   * @default 5
   * @minimum 1
   */
  readonly concurrency: number;

  /**
   * Whether to enable the queue mechanism
   * @default true
   */
  readonly enabled: boolean;

  /**
   * Maximum size of the queue before rejecting new requests
   * @default 1000
   * @minimum 1
   */
  readonly maxQueueSize: number;

  /**
   * Prioritize specific routes or methods (higher number = higher priority)
   * @default {}
   * @example
   * priorities: {
   *       "POST:/interactions": 10, // Highest priority for interactions
   *       "GET:/users": 2,          // Low priority for user fetches
   *     }
   */
  readonly priorities: Record<string, number>;

  /**
   * Timeout for queued requests in milliseconds (0 = no timeout)
   * @default 0
   * @minimum 0
   */
  readonly timeout: number;
}

/**
 * Default configuration options for the queue manager
 */
export const DEFAULT_QUEUE_OPTIONS: QueueOptions = {
  concurrency: 5,
  enabled: true,
  maxQueueSize: 1000,
  priorities: {},
  timeout: 0,
};

/**
 * Validates and merges queue manager options with default values
 *
 * @param options - User-provided options
 * @returns Validated options merged with defaults
 * @throws Error if validation fails
 */
export function validateQueueOptions(
  options: Partial<QueueOptions>,
): QueueOptions {
  const result = { ...DEFAULT_QUEUE_OPTIONS, ...options };

  if (
    typeof result.concurrency !== "number" ||
    result.concurrency < 1 ||
    !Number.isInteger(result.concurrency)
  ) {
    throw new Error("concurrency must be a positive integer");
  }

  if (typeof result.enabled !== "boolean") {
    throw new Error("enabled must be a boolean");
  }

  if (
    typeof result.maxQueueSize !== "number" ||
    result.maxQueueSize < 1 ||
    !Number.isInteger(result.maxQueueSize)
  ) {
    throw new Error("maxQueueSize must be a positive integer");
  }

  if (
    typeof result.timeout !== "number" ||
    result.timeout < 0 ||
    !Number.isInteger(result.timeout)
  ) {
    throw new Error("timeout must be a non-negative integer");
  }

  // Validate priorities if they exist
  if (result.priorities) {
    for (const [key, value] of Object.entries(result.priorities)) {
      if (typeof key !== "string") {
        throw new Error("priorities keys must be strings");
      }

      if (
        typeof value !== "number" ||
        value < 0 ||
        value > 10 ||
        !Number.isInteger(value)
      ) {
        throw new Error(
          `priority '${key}' must be an integer between 0 and 10`,
        );
      }
    }
  }

  return result;
}
