/**
 * Validated Discord Snowflake ID.
 * Unique 64-bit identifier encoded as numeric string.
 *
 * @public
 */
export type Snowflake = string;

/**
 * Deconstructed Discord Snowflake with component parts.
 * Breaks down the 64-bit structure into readable components.
 *
 * @public
 */
export interface DeconstructedSnowflake {
  /**
   * Timestamp in milliseconds since Discord Epoch.
   * Occupies first 42 bits of snowflake.
   */
  timestamp: number;

  /**
   * Internal worker ID that generated snowflake.
   * Occupies 5 bits, values 0-31.
   */
  workerId: number;

  /**
   * Internal process ID that generated snowflake.
   * Occupies 5 bits, values 0-31.
   */
  processId: number;

  /**
   * Auto-incrementing value for same process.
   * Occupies last 12 bits, values 0-4095.
   */
  increment: number;

  /**
   * JavaScript Date object for creation time.
   * Derived from timestamp component.
   */
  date: Date;
}

/** Discord Epoch (2015-01-01T00:00:00.000Z) */
export const DISCORD_EPOCH = 1420070400000;

/** Bits to shift right for timestamp extraction */
export const TIMESTAMP_SHIFT = 22n;

/** Bits to shift right for worker ID extraction */
export const WORKER_ID_SHIFT = 17n;

/** Bits to shift right for process ID extraction */
export const PROCESS_ID_SHIFT = 12n;

/** Bitmask for increment extraction */
export const INCREMENT_MASK = 0xfffn;

/**
 * Utility class for handling Discord Snowflake IDs.
 * Provides validation, parsing, and generation capabilities.
 *
 * @example
 * ```typescript
 * const creationDate = SnowflakeUtil.timestampFrom('308994132968210433');
 * const snowflake = SnowflakeUtil.generate(new Date('2021-01-01'));
 * ```
 *
 * @public
 */
export const SnowflakeUtil = {
  /**
   * Checks if string is valid snowflake.
   *
   * @param snowflake - Snowflake to validate
   * @returns True if snowflake is valid
   *
   * @example
   * ```typescript
   * SnowflakeUtil.isValid('308994132968210433'); // true
   * SnowflakeUtil.isValid('not-a-snowflake'); // false
   * ```
   *
   * @public
   */
  isValid(snowflake: string): snowflake is Snowflake {
    try {
      return /^\d{17,20}$/.test(snowflake);
    } catch {
      return false;
    }
  },

  /**
   * Deconstructs snowflake into component parts.
   *
   * @param snowflake - Snowflake to deconstruct
   * @returns Object with timestamp, worker ID, process ID, and increment
   *
   * @example
   * ```typescript
   * const parts = SnowflakeUtil.deconstruct('308994132968210433');
   * console.log(parts.timestamp); // 1493754304849
   * ```
   *
   * @public
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
   * Extracts timestamp from snowflake.
   *
   * @param snowflake - Snowflake to extract timestamp from
   * @returns Unix timestamp in milliseconds
   *
   * @example
   * ```typescript
   * const timestamp = SnowflakeUtil.getTimestamp('308994132968210433');
   * console.log(timestamp); // 1493754304849
   * ```
   *
   * @public
   */
  getTimestamp(snowflake: string): number {
    return Number(
      (BigInt(snowflake) >> TIMESTAMP_SHIFT) + BigInt(DISCORD_EPOCH),
    );
  },

  /**
   * Creates Date object from snowflake.
   *
   * @param snowflake - Snowflake to extract date from
   * @returns Date representing creation time
   *
   * @example
   * ```typescript
   * const date = SnowflakeUtil.getDate('308994132968210433');
   * console.log(date); // 2017-05-02T19:25:04.849Z
   * ```
   *
   * @public
   */
  getDate(snowflake: string): Date {
    return new Date(this.getTimestamp(snowflake));
  },

  /**
   * Generates snowflake from timestamp.
   *
   * @param timestamp - Timestamp or Date for snowflake
   * @param increment - Optional increment value
   * @param workerId - Optional worker ID
   * @param processId - Optional process ID
   * @returns Generated snowflake string
   *
   * @example
   * ```typescript
   * const snowflake = SnowflakeUtil.generate();
   * const specificSnowflake = SnowflakeUtil.generate(new Date('2021-01-01'));
   * ```
   *
   * @public
   */
  generate(
    timestamp: number | Date = Date.now(),
    increment: number = Math.floor(Math.random() * 4095),
    workerId = 1,
    processId = 0,
  ): string {
    const resolvedTimestamp =
      timestamp instanceof Date ? timestamp.getTime() : timestamp;

    const timestampRelative = BigInt(resolvedTimestamp - DISCORD_EPOCH);

    const snowflake =
      (timestampRelative << TIMESTAMP_SHIFT) |
      (BigInt(workerId & 0x1f) << WORKER_ID_SHIFT) |
      (BigInt(processId & 0x1f) << PROCESS_ID_SHIFT) |
      BigInt(increment & 0xfff);

    return snowflake.toString();
  },

  /**
   * Generates snowflake relative to reference point.
   *
   * @param referenceId - Reference snowflake ID
   * @param timeOffset - Time offset in milliseconds
   * @returns Generated snowflake string
   *
   * @example
   * ```typescript
   * const beforeId = SnowflakeUtil.generateFromReference('799775995915116544', -3600000);
   * ```
   *
   * @public
   */
  generateFromReference(referenceId: string, timeOffset: number): string {
    const timestamp = this.getTimestamp(referenceId) + timeOffset;
    return this.generate(timestamp);
  },

  /**
   * Compares two snowflakes chronologically.
   *
   * @param snowflake1 - First snowflake
   * @param snowflake2 - Second snowflake
   * @returns Negative if first is older, positive if newer, zero if equal
   *
   * @example
   * ```typescript
   * const result = SnowflakeUtil.compare('799775995915116544', '799775995915116545');
   * if (result < 0) console.log('First snowflake is older');
   * ```
   *
   * @public
   */
  compare(snowflake1: string, snowflake2: string): number {
    const timestamp1 = this.getTimestamp(snowflake1);
    const timestamp2 = this.getTimestamp(snowflake2);
    return timestamp1 - timestamp2;
  },

  /**
   * Calculates elapsed time between two snowflakes.
   *
   * @param snowflake1 - First snowflake
   * @param snowflake2 - Second snowflake
   * @returns Time difference in milliseconds
   *
   * @example
   * ```typescript
   * const timeDiff = SnowflakeUtil.timeBetween('799775995915116544', '799775995915116545');
   * console.log(`${timeDiff}ms apart`);
   * ```
   *
   * @public
   */
  timeBetween(snowflake1: string, snowflake2: string): number {
    return Math.abs(
      this.getTimestamp(snowflake1) - this.getTimestamp(snowflake2),
    );
  },

  /**
   * Checks if snowflake was created before specific date.
   *
   * @param snowflake - Snowflake to check
   * @param date - Date to compare against
   * @returns True if snowflake is older than date
   *
   * @example
   * ```typescript
   * const isOld = SnowflakeUtil.isOlderThan('308994132968210433', new Date('2020-01-01'));
   * console.log(isOld); // true
   * ```
   *
   * @public
   */
  isOlderThan(snowflake: string, date: Date): boolean {
    return this.getTimestamp(snowflake) < date.getTime();
  },

  /**
   * Checks if snowflake was created after specific date.
   *
   * @param snowflake - Snowflake to check
   * @param date - Date to compare against
   * @returns True if snowflake is newer than date
   *
   * @example
   * ```typescript
   * const isRecent = SnowflakeUtil.isNewerThan('308994132968210433', new Date('2015-01-01'));
   * console.log(isRecent); // true
   * ```
   *
   * @public
   */
  isNewerThan(snowflake: string, date: Date): boolean {
    return this.getTimestamp(snowflake) > date.getTime();
  },

  /**
   * Formats snowflake timestamp to human-readable string.
   *
   * @param snowflake - Snowflake to format
   * @param format - Format type
   * @returns Formatted date string
   *
   * @example
   * ```typescript
   * const dateStr = SnowflakeUtil.formatDate('308994132968210433', 'long');
   * console.log(dateStr); // "May 2, 2017"
   * ```
   *
   * @public
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
