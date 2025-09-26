/**
 * Creates an asynchronous delay for the specified duration using Promise-based timing.
 * Useful for rate limiting, animations, polling intervals, and controlled async flow.
 *
 * Handles edge cases gracefully: non-positive durations resolve immediately,
 * avoiding unnecessary timer allocation and providing predictable behavior.
 *
 * @param duration - Delay duration in milliseconds (non-positive values resolve immediately)
 * @returns Promise that resolves after the specified duration with no value
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/setTimeout} for setTimeout documentation
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise} for Promise documentation
 */
export function sleep(duration: number): Promise<void> {
  // Handle non-positive durations immediately
  if (duration <= 0) {
    return Promise.resolve();
  }

  // Create Promise-based delay using setTimeout
  return new Promise((resolve) => setTimeout(resolve, duration));
}
