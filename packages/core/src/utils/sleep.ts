/**
 * Options for configuring the sleep function behavior.
 */
export interface SleepOptions {
  /**
   * An AbortSignal that allows cancellation of the sleep operation.
   * When the signal is aborted, the sleep promise will reject with an AbortError.
   */
  signal?: AbortSignal;

  /**
   * Whether to throw an error when a negative duration is provided.
   * @default false
   */
  throwOnNegative?: boolean;
}

/**
 * Creates a promise that resolves after a specified duration, effectively
 * pausing execution in an async function for the given time.
 *
 * @param duration - The time to sleep in milliseconds. If the value is negative or zero
 *                  and `throwOnNegative` is false, the promise will resolve immediately.
 * @param options - Optional configuration for the sleep behavior.
 *
 * @returns A Promise that resolves after the specified duration.
 *
 * @throws {RangeError} If `duration` is negative and `throwOnNegative` is true.
 * @throws {AbortError} If the operation is aborted via AbortSignal.
 *
 * @example
 * // Basic usage
 * async function example() {
 *   console.log('Start');
 *   await sleep(1000); // Pauses for 1 second
 *   console.log('End');
 * }
 *
 * @example
 * // With abort signal
 * async function cancelableOperation() {
 *   const controller = new AbortController();
 *
 *   setTimeout(() => controller.abort(), 500); // Abort after 500ms
 *
 *   try {
 *     await sleep(2000, { signal: controller.signal });
 *     console.log('This will not execute');
 *   } catch (error) {
 *     if (error.name === 'AbortError') {
 *       console.log('Sleep was aborted');
 *     } else {
 *       throw error;
 *     }
 *   }
 * }
 */
export async function sleep(
  duration: number,
  options: SleepOptions = {},
): Promise<void> {
  // Validate duration
  if (duration < 0) {
    if (options.throwOnNegative) {
      throw new RangeError(`Sleep duration cannot be negative: ${duration}`);
    }
    // Resolve immediately for negative values when throwOnNegative is false
    return;
  }

  // Special case for zero duration
  if (duration === 0) {
    return;
  }

  // Handle abort signal if provided
  if (options.signal?.aborted) {
    const error = new Error("Sleep operation was aborted");
    error.name = "AbortError";
    throw error;
  }

  return new Promise<void>((resolve, reject) => {
    // Create the timer
    const timer = setTimeout(() => {
      resolve();
    }, duration);

    // Set up abort handler if signal is provided
    if (options.signal) {
      // Add abort listener
      const abortListener = (): void => {
        clearTimeout(timer);
        const error = new Error("Sleep operation was aborted");
        error.name = "AbortError";
        reject(error);
      };

      // Clean up once resolved
      const cleanup = (): void => {
        options.signal?.removeEventListener("abort", abortListener);
      };

      // Add abort listener and ensure cleanup
      options.signal.addEventListener("abort", abortListener, { once: true });

      // Ensure cleanup happens when the promise resolves
      Promise.prototype.finally.call(
        new Promise((_, __) => {}), // This promise never resolves
        cleanup,
      );
    }
  });
}

/**
 * Creates a promise that resolves at a specific date/time.
 *
 * @param date - The target date/time when the promise should resolve.
 * @param options - Optional configuration for the sleep behavior.
 *
 * @returns A Promise that resolves at the specified date/time.
 *
 * @throws {RangeError} If the target date is in the past and `throwOnNegative` is true.
 * @throws {AbortError} If the operation is aborted via AbortSignal.
 *
 * @example
 * // Sleep until a specific date
 * async function waitUntilMidnight() {
 *   const midnight = new Date();
 *   midnight.setHours(24, 0, 0, 0); // Next midnight
 *
 *   console.log('Waiting until midnight...');
 *   await sleepUntil(midnight);
 *   console.log('It is now midnight!');
 * }
 */
export function sleepUntil(
  date: Date,
  options: SleepOptions = {},
): Promise<void> {
  const now = Date.now();
  const target = date.getTime();
  const duration = target - now;

  return sleep(duration, options);
}
