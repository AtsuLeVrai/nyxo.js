/**
 * @description Creates asynchronous delay for rate limiting and timing control. Returns immediately if duration is zero or negative.
 *
 * @param duration - Delay duration in milliseconds
 * @returns Promise that resolves after specified duration
 */
export function sleep(duration: number): Promise<void> {
  if (duration <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => setTimeout(resolve, duration));
}
