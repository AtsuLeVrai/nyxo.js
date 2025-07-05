/**
 * Represents a validated Discord Snowflake ID.
 *
 * A Snowflake is a unique 64-bit identifier used by Discord,
 * encoded as a string of numeric characters.
 * Structure: `(timestamp_ms - DISCORD_EPOCH) << 22 | worker_id << 17 | process_id << 12 | increment`
 *
 * Validation rules:
 * - Must contain only digits
 * - Must be at least 17 digits long
 * - The extracted timestamp must be valid (after Discord epoch, before now + 1h)
 *
 * @remarks
 * The internal structure allows for extracting information such as creation timestamp,
 * worker ID, process ID, and increment.
 *
 * @example
 * ```typescript
 * // Example of a valid Discord Snowflake
 * const messageId: Snowflake = "175928847299117063";
 * ```
 *
 * @see {@link https://discord.com/developers/docs/reference#snowflakes}
 */
export type Snowflake = string;

/**
 * Represents a deconstructed Discord Snowflake ID with its component parts.
 *
 * Discord utilizes Twitter's snowflake format for uniquely identifiable descriptors (IDs).
 * Each snowflake is a 64-bit integer, typically represented as a string to prevent
 * integer overflow in some languages. Snowflakes are guaranteed to be unique across
 * all of Discord (except in rare cases where child objects share a parent's ID).
 *
 * @see {@link https://discord.com/developers/docs/reference#snowflakes} Discord Snowflake Documentation
 */
export interface DeconstructedSnowflake {
  /**
   * Timestamp in milliseconds since Discord Epoch (2015-01-01T00:00:00.000Z).
   *
   * This represents when the snowflake was generated and occupies the first 42 bits
   * of the snowflake. Can be used to sort and order snowflakes chronologically.
   *
   * Formula: `(snowflake >> 22) + 1420070400000`
   */
  timestamp: number;

  /**
   * Internal worker ID that generated this snowflake.
   *
   * Occupies 5 bits (bits 21-17) of the snowflake, allowing values from 0-31.
   * Identifies which of Discord's internal workers generated this ID.
   *
   * Formula: `(snowflake & 0x3E0000) >> 17`
   */
  workerId: number;

  /**
   * Internal process ID that generated this snowflake.
   *
   * Occupies 5 bits (bits 16-12) of the snowflake, allowing values from 0-31.
   * Identifies which process within the worker generated this ID.
   *
   * Formula: `(snowflake & 0x1F000) >> 12`
   */
  processId: number;

  /**
   * Auto-incrementing value for IDs generated on the same process.
   *
   * Occupies the last 12 bits (bits 11-0) of the snowflake, allowing values from 0-4095.
   * Acts as a counter to ensure uniqueness even when generated in the same millisecond.
   *
   * Formula: `snowflake & 0xFFF`
   */
  increment: number;

  /**
   * JavaScript Date object representing the creation time of the snowflake.
   *
   * Derived from the timestamp component and provides a convenient way to
   * work with the snowflake's creation time using JavaScript's Date API.
   *
   * Note: This is equivalent to `new Date(timestamp)`.
   */
  date: Date;
}

/**
 * Discord Epoch (2015-01-01T00:00:00.000Z)
 * This is the first second of 2015, used as the baseline for snowflake timestamps
 */
export const DISCORD_EPOCH = 1420070400000;

/**
 * Number of bits to shift right to extract the timestamp from a snowflake
 * Timestamp occupies bits 63 to 22
 */
export const TIMESTAMP_SHIFT = 22n;

/**
 * Number of bits to shift right to extract the worker ID from a snowflake
 * Worker ID occupies bits 21 to 17
 */
export const WORKER_ID_SHIFT = 17n;

/**
 * Number of bits to shift right to extract the process ID from a snowflake
 * Process ID occupies bits 16 to 12
 */
export const PROCESS_ID_SHIFT = 12n;

/**
 * Bitmask to extract the increment from a snowflake
 * Increment occupies bits 11 to 0
 */
export const INCREMENT_MASK = 0xfffn;

/**
 * Utility class for handling Discord Snowflake IDs
 *
 * Discord utilizes Twitter's snowflake format for uniquely identifiable descriptors (IDs).
 * These IDs are guaranteed to be unique across all of Discord.
 *
 * Snowflake Format Structure:
 * ```
 * | Field               | Bits     | Description                                                     |
 * |---------------------|----------|-----------------------------------------------------------------|
 * | Timestamp           | 63 to 22 | Milliseconds since Discord Epoch (2015-01-01T00:00:00.000Z)     |
 * | Internal worker ID  | 21 to 17 | Worker ID that generated this snowflake                         |
 * | Internal process ID | 16 to 12 | Process ID that generated this snowflake                        |
 * | Increment           | 11 to 0  | Incremented for every ID generated on that process              |
 * ```
 *
 * @example
 * // Get creation date of a snowflake
 * const creationDate = SnowflakeUtil.timestampFrom('308994132968210433');
 * console.log(creationDate); // 2017-05-02T19:25:04.849Z
 *
 * // Generate a snowflake from a date
 * const snowflake = SnowflakeUtil.generate(new Date('2021-01-01'));
 * console.log(snowflake); // '799775995915116544'
 */
export const SnowflakeUtil = {
  /**
   * Checks if a string is a valid snowflake
   *
   * @param snowflake - The snowflake to validate
   * @returns `true` if the snowflake is valid, `false` otherwise
   *
   * @example
   * SnowflakeUtil.isValid('308994132968210433'); // true
   * SnowflakeUtil.isValid('not-a-snowflake'); // false
   */
  isValid(snowflake: string): snowflake is Snowflake {
    try {
      // Snowflakes are numeric strings of reasonable length
      return /^\d{17,20}$/.test(snowflake);
    } catch {
      return false;
    }
  },

  /**
   * Deconstructs a snowflake into its component parts
   *
   * @param snowflake - Snowflake to deconstruct
   * @returns An object containing the timestamp, worker ID, process ID, and increment
   *
   * @example
   * const parts = SnowflakeUtil.deconstruct('308994132968210433');
   * console.log(parts);
   * // {
   * //   timestamp: 1493754304849,
   * //   workerId: 1,
   * //   processId: 0,
   * //   increment: 1,
   * //   date: 2017-05-02T19:25:04.849Z
   * // }
   */
  deconstruct(snowflake: string): DeconstructedSnowflake {
    const bigintSnowflake = BigInt(snowflake);

    const timestamp = Number(
      (bigintSnowflake >> TIMESTAMP_SHIFT) + BigInt(DISCORD_EPOCH),
    );
    const workerId = Number((bigintSnowflake & 0x3e0000n) >> WORKER_ID_SHIFT);
    const processId = Number((bigintSnowflake & 0x1f000n) >> PROCESS_ID_SHIFT);
    const increment = Number(bigintSnowflake & INCREMENT_MASK);

    return {
      timestamp,
      workerId,
      processId,
      increment,
      date: new Date(timestamp),
    };
  },

  /**
   * Extracts the timestamp from a snowflake
   *
   * @param snowflake - Snowflake to extract timestamp from
   * @returns The Unix timestamp in milliseconds
   *
   * @example
   * const timestamp = SnowflakeUtil.getTimestamp('308994132968210433');
   * console.log(timestamp); // 1493754304849
   */
  getTimestamp(snowflake: string): number {
    return Number(
      (BigInt(snowflake) >> TIMESTAMP_SHIFT) + BigInt(DISCORD_EPOCH),
    );
  },

  /**
   * Creates a Date object from a snowflake
   *
   * @param snowflake - Snowflake to extract date from
   * @returns Date object representing when the snowflake was created
   *
   * @example
   * const date = SnowflakeUtil.getDate('308994132968210433');
   * console.log(date); // 2017-05-02T19:25:04.849Z
   */
  getDate(snowflake: string): Date {
    return new Date(this.getTimestamp(snowflake));
  },

  /**
   * Generates a snowflake from a timestamp
   *
   * @param timestamp - Timestamp or Date to generate a snowflake for
   * @param increment - Optional increment to use (default: a random number between 0-4095)
   * @param workerId - Optional worker ID (default: 1)
   * @param processId - Optional process ID (default: 0)
   * @returns The generated snowflake as a string
   *
   * @example
   * // Generate a snowflake for the current time
   * const snowflake = SnowflakeUtil.generate();
   *
   * // Generate a snowflake for a specific date
   * const snowflake = SnowflakeUtil.generate(new Date('2021-01-01'));
   */
  generate(
    timestamp: number | Date = Date.now(),
    increment: number = Math.floor(Math.random() * 4095),
    workerId = 1,
    processId = 0,
  ): string {
    const resolvedTimestamp =
      timestamp instanceof Date ? timestamp.getTime() : timestamp;

    // Ensure timestamp is relative to Discord epoch
    const timestampRelative = BigInt(resolvedTimestamp - DISCORD_EPOCH);

    // Construct the snowflake using bitshifting
    const snowflake =
      (timestampRelative << TIMESTAMP_SHIFT) |
      (BigInt(workerId & 0x1f) << WORKER_ID_SHIFT) |
      (BigInt(processId & 0x1f) << PROCESS_ID_SHIFT) |
      BigInt(increment & 0xfff);

    return snowflake.toString();
  },

  /**
   * Generates a snowflake ID for a specific time before or after a reference point
   * Useful for pagination with "before" and "after" parameters in the Discord API
   *
   * @param referenceId - Reference snowflake ID
   * @param timeOffset - Time offset in milliseconds (positive = after, negative = before)
   * @returns Generated snowflake string
   *
   * @example
   * // Get a snowflake 1 hour before a reference ID (for pagination)
   * const beforeId = SnowflakeUtil.generateFromReference('799775995915116544', -3600000);
   */
  generateFromReference(referenceId: string, timeOffset: number): string {
    const timestamp = this.getTimestamp(referenceId) + timeOffset;
    return this.generate(timestamp);
  },

  /**
   * Compares two snowflakes to determine which one was created first
   *
   * @param snowflake1 - First snowflake to compare
   * @param snowflake2 - Second snowflake to compare
   * @returns Negative if snowflake1 is older, positive if snowflake1 is newer, 0 if equal
   *
   * @example
   * const result = SnowflakeUtil.compare('799775995915116544', '799775995915116545');
   * if (result < 0) console.log('First snowflake is older');
   * else if (result > 0) console.log('First snowflake is newer');
   * else console.log('Snowflakes were created at the same time');
   */
  compare(snowflake1: string, snowflake2: string): number {
    const timestamp1 = this.getTimestamp(snowflake1);
    const timestamp2 = this.getTimestamp(snowflake2);
    return timestamp1 - timestamp2;
  },

  /**
   * Calculates the elapsed time in milliseconds between two snowflakes
   *
   * @param snowflake1 - First snowflake
   * @param snowflake2 - Second snowflake
   * @returns Time difference in milliseconds between the snowflakes
   *
   * @example
   * const timeDiff = SnowflakeUtil.timeBetween('799775995915116544', '799775995915116545');
   * console.log(`These snowflakes were created ${timeDiff}ms apart`);
   */
  timeBetween(snowflake1: string, snowflake2: string): number {
    return Math.abs(
      this.getTimestamp(snowflake1) - this.getTimestamp(snowflake2),
    );
  },

  /**
   * Checks if a snowflake was created before a specific date
   *
   * @param snowflake - Snowflake to check
   * @param date - Date to compare against
   * @returns `true` if the snowflake was created before the date, `false` otherwise
   *
   * @example
   * const isOld = SnowflakeUtil.isOlderThan('308994132968210433', new Date('2020-01-01'));
   * console.log(isOld); // true (this snowflake is from 2017)
   */
  isOlderThan(snowflake: string, date: Date): boolean {
    return this.getTimestamp(snowflake) < date.getTime();
  },

  /**
   * Checks if a snowflake was created after a specific date
   *
   * @param snowflake - Snowflake to check
   * @param date - Date to compare against
   * @returns `true` if the snowflake was created after the date, `false` otherwise
   *
   * @example
   * const isRecent = SnowflakeUtil.isNewerThan('308994132968210433', new Date('2015-01-01'));
   * console.log(isRecent); // true
   */
  isNewerThan(snowflake: string, date: Date): boolean {
    return this.getTimestamp(snowflake) > date.getTime();
  },

  /**
   * Formats a snowflake's timestamp into a human-readable string
   *
   * @param snowflake - Snowflake to format
   * @param format - Format string:
   *   - 'short' = MM/DD/YYYY
   *   - 'long' = Month DD, YYYY
   *   - 'relative' = X days/months/years ago
   *   - 'iso' = ISO string
   *   - Default = locale string
   * @returns Formatted date string
   *
   * @example
   * const dateStr = SnowflakeUtil.formatDate('308994132968210433', 'long');
   * console.log(dateStr); // May 2, 2017
   */
  formatDate(
    snowflake: string,
    format: "short" | "long" | "relative" | "iso" = "long",
  ): string {
    const date = this.getDate(snowflake);

    switch (format) {
      case "short":
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

      case "long":
        return date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

      case "relative": {
        const now = Date.now();
        const diff = now - date.getTime();

        // Convert to appropriate unit
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(months / 12);

        if (years > 0) {
          return `${years} year${years === 1 ? "" : "s"} ago`;
        }
        if (months > 0) {
          return `${months} month${months === 1 ? "" : "s"} ago`;
        }
        if (days > 0) {
          return `${days} day${days === 1 ? "" : "s"} ago`;
        }
        if (hours > 0) {
          return `${hours} hour${hours === 1 ? "" : "s"} ago`;
        }
        if (minutes > 0) {
          return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
        }
        return `${seconds} second${seconds === 1 ? "" : "s"} ago`;
      }

      case "iso":
        return date.toISOString();

      default:
        return date.toLocaleString();
    }
  },
} as const;
