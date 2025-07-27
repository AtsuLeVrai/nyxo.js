/**
 * Creates promise that resolves after specified duration.
 * Pauses execution in async function for given time.
 *
 * @param duration - Time to sleep in milliseconds
 * @returns Promise resolving after duration
 *
 * @example
 * ```typescript
 * await sleep(1000); // Wait 1 second
 * console.log('This runs after 1 second');
 * ```
 *
 * @public
 */
export async function sleep(duration: number): Promise<void> {
  if (duration <= 0) {
    return;
  }

  return new Promise<void>((resolve) => setTimeout(resolve, duration));
}

/**
 * Creates promise that resolves at specific date/time.
 * If date is in past, resolves immediately.
 *
 * @param date - Target date/time for resolution
 * @returns Promise resolving at specified time
 *
 * @example
 * ```typescript
 * const targetDate = new Date('2024-01-01T00:00:00Z');
 * await sleepUntil(targetDate);
 * console.log('Happy New Year!');
 * ```
 *
 * @public
 */
export function sleepUntil(date: Date): Promise<void> {
  const now = Date.now();
  const target = date.getTime();
  const duration = target - now;

  return sleep(duration);
}
