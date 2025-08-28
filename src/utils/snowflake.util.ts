/**
 * @description Base timestamp for Discord snowflake calculations (January 1, 2015, 00:00:00 UTC). All Discord snowflakes are calculated relative to this epoch using bitwise operations.
 * @see {@link https://discord.com/developers/docs/reference#snowflakes}
 */
export const DISCORD_EPOCH = 1420070400000n as const;

/**
 * @description Essential utilities for working with Discord snowflake identifiers. Snowflakes are unique 64-bit identifiers used throughout Discord API for all entities.
 * @see {@link https://discord.com/developers/docs/reference#snowflakes}
 */
export const SnowflakeUtil = {
  /**
   * @description Checks if string matches valid Discord snowflake pattern (17-20 digits).
   * @param id - String to validate as Discord snowflake
   * @returns True if valid snowflake format
   */
  isValid: (id: string): boolean => /^\d{17,20}$/.test(id),

  /**
   * @description Converts Discord snowflake to Unix timestamp in milliseconds using bitwise operations.
   * @see {@link https://discord.com/developers/docs/reference#convert-snowflake-to-datetime}
   * @param id - Discord snowflake ID
   * @returns Unix timestamp when the snowflake was created
   * @throws {Error} When ID cannot be converted to BigInt
   */
  toTimestamp: (id: string): number => Number((BigInt(id) >> 22n) + DISCORD_EPOCH),

  /**
   * @description Creates Date instance from Discord snowflake creation timestamp.
   * @param id - Discord snowflake ID
   * @returns Date object representing snowflake creation time
   * @throws {Error} When ID cannot be converted to BigInt
   */
  toDate: (id: string): Date => new Date(SnowflakeUtil.toTimestamp(id)),

  /**
   * @description Returns how many milliseconds have passed since snowflake creation.
   * @param id - Discord snowflake ID
   * @returns Age in milliseconds from creation to current time
   * @throws {Error} When ID cannot be converted to BigInt
   */
  age: (id: string): number => Date.now() - SnowflakeUtil.toTimestamp(id),

  /**
   * @description Determines if snowflake was created more than given milliseconds ago.
   * @param id - Discord snowflake ID
   * @param ms - Milliseconds threshold to check against
   * @returns True if snowflake is older than the threshold
   * @throws {Error} When ID cannot be converted to BigInt
   */
  isOlderThan: (id: string, ms: number): boolean => SnowflakeUtil.age(id) > ms,

  /**
   * @description Compares timestamps of two Discord snowflakes chronologically.
   * @param a - First Discord snowflake ID
   * @param b - Second Discord snowflake ID
   * @returns Negative if an is older, positive if an is newer, zero if same time
   * @throws {Error} When either ID cannot be converted to BigInt
   */
  compare: (a: string, b: string): number =>
    SnowflakeUtil.toTimestamp(a) - SnowflakeUtil.toTimestamp(b),
} as const;
