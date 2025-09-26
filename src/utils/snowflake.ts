/**
 * Comprehensive Discord Snowflake utilities with timestamp extraction and validation.
 * Discord Snowflakes are 64-bit integers containing timestamp, worker ID, process ID, and increment data.
 *
 * Snowflake format (64 bits total):
 * - 42 bits: Timestamp (milliseconds since Discord epoch)
 * - 5 bits: Internal worker ID
 * - 5 bits: Internal process ID
 * - 12 bits: Increment counter
 *
 * @see {@link https://discord.com/developers/docs/reference#snowflakes} for detailed Snowflake documentation
 * @see {@link https://en.wikipedia.org/wiki/Snowflake_ID} for general Snowflake ID concept
 */
export const Snowflake = {
  /**
   * Discord's epoch timestamp in milliseconds (January 1, 2015, 00:00:00 UTC).
   * Used as the base timestamp for all Discord Snowflake calculations.
   *
   * @see {@link https://discord.com/developers/docs/reference#snowflakes-snowflake-id-format-structure-left-to-right} for epoch documentation
   */
  DISCORD_EPOCH: 1420070400000n as const,

  /**
   * Validates if a string represents a valid Discord Snowflake ID format.
   * Checks for 17-20 digit numeric strings, which covers the valid Snowflake range.
   *
   * @param id - String to validate as potential Snowflake ID
   * @returns True if the string matches Snowflake format (17-20 digits)
   *
   * @example
   * ```typescript
   * Snowflake.isValid("123456789012345678"); // true
   * Snowflake.isValid("12345");             // false (too short)
   * Snowflake.isValid("not-a-number");      // false (not numeric)
   * ```
   */
  isValid: (id: string): boolean => /^\d{17,20}$/.test(id),

  /**
   * Extracts the creation timestamp from a Discord Snowflake ID.
   * Uses bitwise operations to extract the 42-bit timestamp and adds Discord epoch.
   *
   * @param id - Valid Discord Snowflake ID as string
   * @returns Unix timestamp in milliseconds when the Snowflake was created
   *
   * @see {@link toDate} for Date object conversion
   * @see {@link age} for age calculation from timestamp
   *
   * @example
   * ```typescript
   * const timestamp = Snowflake.toTimestamp("123456789012345678");
   * console.log(new Date(timestamp)); // Creation date
   * ```
   */
  toTimestamp: (id: string): number => Number((BigInt(id) >> 22n) + Snowflake.DISCORD_EPOCH),

  /**
   * Converts a Discord Snowflake ID to its creation Date object.
   * Convenience method that combines timestamp extraction with Date instantiation.
   *
   * @param id - Valid Discord Snowflake ID as string
   * @returns Date object representing when the Snowflake was created
   *
   * @see {@link toTimestamp} for raw timestamp extraction
   *
   * @example
   * ```typescript
   * const creationDate = Snowflake.toDate("123456789012345678");
   * console.log(creationDate.toISOString()); // ISO date string
   * ```
   */
  toDate: (id: string): Date => new Date(Snowflake.toTimestamp(id)),

  /**
   * Calculates the age of a Discord Snowflake ID in milliseconds.
   * Determines how much time has passed since the Snowflake was created.
   *
   * @param id - Valid Discord Snowflake ID as string
   * @returns Age in milliseconds since creation
   *
   * @see {@link isOlderThan} for age comparison with threshold
   *
   * @example
   * ```typescript
   * const ageMs = Snowflake.age("123456789012345678");
   * const ageMinutes = ageMs / (1000 * 60);
   * console.log(`Created ${ageMinutes} minutes ago`);
   * ```
   */
  age: (id: string): number => Date.now() - Snowflake.toTimestamp(id),

  /**
   * Checks if a Discord Snowflake ID is older than the specified time threshold.
   * Useful for filtering, cleanup operations, and time-based logic.
   *
   * @param id - Valid Discord Snowflake ID as string
   * @param ms - Threshold age in milliseconds for comparison
   * @returns True if the Snowflake is older than the threshold
   *
   * @see {@link age} for exact age calculation
   *
   * @example
   * ```typescript
   * const oneHour = 60 * 60 * 1000;
   * const isOld = Snowflake.isOlderThan("123456789012345678", oneHour);
   *
   * // Filter old messages
   * const oldMessages = messages.filter(msg =>
   *   Snowflake.isOlderThan(msg.id, 24 * 60 * 60 * 1000) // Older than 24h
   * );
   * ```
   */
  isOlderThan: (id: string, ms: number): boolean => Snowflake.age(id) > ms,

  /**
   * Compares two Discord Snowflake IDs by their creation timestamps.
   * Returns standard comparison result for sorting and ordering operations.
   *
   * @param a - First Snowflake ID for comparison
   * @param b - Second Snowflake ID for comparison
   * @returns Negative if a is older, positive if b is older, zero if same timestamp
   *
   * @example
   * ```typescript
   * // Sort Snowflakes by creation time (oldest first)
   * const sortedIds = snowflakeIds.sort(Snowflake.compare);
   *
   * // Find the newer of two IDs
   * const newer = Snowflake.compare(id1, id2) > 0 ? id1 : id2;
   * ```
   */
  compare: (a: string, b: string): number => Snowflake.toTimestamp(a) - Snowflake.toTimestamp(b),
} as const;
