/**
 * Represents a numeric unique identifier based on Twitter's Snowflake format.
 * @remarks
 * A snowflake is essentially a 64-bit unique identifier that contains:
 * - Timestamp (42 bits)
 * - Worker ID (5 bits)
 * - Process ID (5 bits)
 * - Increment (12 bits)
 *
 * @see {@link https://discord.com/developers/docs/reference#snowflakes}
 */
export type Snowflake = string;

/**
 * Represents values that can be converted into a Snowflake identifier.
 */
export type SnowflakeResolvable =
  | string
  | number
  | bigint
  | Date
  | SnowflakeManager;

/**
 * Represents the deconstructed components of a Snowflake identifier.
 */
export interface SnowflakeEntity {
  /** The Unix timestamp in milliseconds */
  timestamp: number;
  /** The worker ID (0-31) */
  workerId: number;
  /** The process ID (0-31) */
  processId: number;
  /** The increment value (0-4095) */
  increment: number;
  /** The timestamp as a JavaScript Date object */
  date: Date;
}

/**
 * Configuration options for Snowflake generation.
 */
export interface SnowflakeOptions {
  /** Worker identifier. Must be between 0 and 31. */
  workerId?: number;
  /** Process identifier. Must be between 0 and 31. */
  processId?: number;
  /** Increment value. Must be between 0 and 4095. */
  increment?: number;
  /** Custom epoch timestamp in milliseconds. Defaults to Discord epoch (2015-01-01). */
  epoch?: number;
}

/**
 * Manages the creation, validation, and manipulation of Snowflake IDs.
 *
 * @remarks
 * The SnowflakeManager class provides utilities for working with Discord-style Snowflake IDs.
 * These IDs are 64-bit integers typically used for unique identification of resources while
 * also encoding timestamp information.
 *
 * @example
 * ```typescript
 * // Create a snowflake from a timestamp
 * const snowflake = SnowflakeManager.fromTimestamp(Date.now());
 *
 * // Validate a snowflake
 * const isValid = SnowflakeManager.isValid('123456789012345678');
 *
 * // Get timestamp from a snowflake
 * const timestamp = snowflake.getTimestamp();
 * ```
 */
export class SnowflakeManager {
  /**
   * Discord epoch (2015-01-01). Used as the default epoch for timestamp calculations.
   * @readonly
   */
  static readonly DISCORD_EPOCH = 1420070400000;

  /**
   * Regular expression for validating snowflake format.
   * @readonly
   */
  static readonly SNOWFLAKE_REGEX = /^\d+$/;

  /**
   * Maximum value for the increment component (12 bits).
   * @readonly
   */
  static readonly MAX_INCREMENT = 4095;

  /**
   * Maximum value for the process ID component (5 bits).
   * @readonly
   */
  static readonly MAX_PROCESS_ID = 31;

  /**
   * Maximum value for the worker ID component (5 bits).
   * @readonly
   */
  static readonly MAX_WORKER_ID = 31;

  /**
   * The internal snowflake identifier string.
   * This value is immutable and is used as the base for all operations.
   * @private
   */
  readonly #id: string;

  /**
   * The epoch timestamp in milliseconds used for snowflake generation.
   * Defaults to Discord's epoch (2015-01-01).
   * @private
   */
  readonly #epoch: number;

  /**
   * Creates a new SnowflakeManager instance.
   *
   * @param snowflake - The snowflake value to manage
   * @param options - Configuration options for snowflake generation
   * @throws Error when the provided snowflake is invalid
   *
   * @example
   * ```typescript
   * const manager = new SnowflakeManager('123456789012345678');
   * const customManager = new SnowflakeManager(Date.now(), { workerId: 1, processId: 1 });
   * ```
   */
  constructor(snowflake: SnowflakeResolvable, options: SnowflakeOptions = {}) {
    this.#epoch = options.epoch ?? SnowflakeManager.DISCORD_EPOCH;
    this.#id = this.#resolveId(snowflake, options);
  }

  /**
   * Creates a SnowflakeManager instance from a timestamp.
   *
   * @param timestamp - Unix timestamp in milliseconds or Date object
   * @param options - Configuration options for snowflake generation
   * @returns A new SnowflakeManager instance
   *
   * @example
   * ```typescript
   * const snowflake = SnowflakeManager.fromTimestamp(new Date());
   * ```
   */
  static fromTimestamp(
    timestamp: number | Date,
    options: SnowflakeOptions = {},
  ): SnowflakeManager {
    const time = timestamp instanceof Date ? timestamp.getTime() : timestamp;
    return new SnowflakeManager(time, options);
  }

  /**
   * Resolves a SnowflakeResolvable value into a SnowflakeManager instance.
   *
   * @param resolvable - Value to resolve into a SnowflakeManager
   * @returns A new SnowflakeManager instance
   */
  static resolve(resolvable: SnowflakeResolvable): SnowflakeManager {
    return resolvable instanceof SnowflakeManager
      ? resolvable
      : new SnowflakeManager(resolvable);
  }

  /**
   * Validates a snowflake string against the specified epoch.
   *
   * @param snowflake - The snowflake string to validate
   * @param epoch - Custom epoch timestamp (defaults to Discord epoch)
   * @returns Whether the snowflake is valid
   */
  static isValid(
    snowflake: string,
    epoch: number = SnowflakeManager.DISCORD_EPOCH,
  ): boolean {
    try {
      if (!SnowflakeManager.SNOWFLAKE_REGEX.test(snowflake)) {
        return false;
      }
      const timestamp = Number(BigInt(snowflake) >> 22n) + epoch;
      return timestamp >= epoch && timestamp <= Date.now();
    } catch {
      return false;
    }
  }

  /**
   * Creates a SnowflakeManager instance with minimum values for a given timestamp.
   *
   * @param timestamp - Target timestamp (defaults to current time)
   * @returns A new SnowflakeManager instance with minimum values
   */
  static min(timestamp: number | Date = Date.now()): SnowflakeManager {
    return SnowflakeManager.fromTimestamp(timestamp, {
      workerId: 0,
      processId: 0,
      increment: 0,
    });
  }

  /**
   * Creates a SnowflakeManager instance with maximum values for a given timestamp.
   *
   * @param timestamp - Target timestamp (defaults to current time)
   * @returns A new SnowflakeManager instance with maximum values
   */
  static max(timestamp: number | Date = Date.now()): SnowflakeManager {
    return SnowflakeManager.fromTimestamp(timestamp, {
      workerId: SnowflakeManager.MAX_WORKER_ID,
      processId: SnowflakeManager.MAX_PROCESS_ID,
      increment: SnowflakeManager.MAX_INCREMENT,
    });
  }

  /**
   * Converts the snowflake to its string representation.
   * @returns The snowflake as a string
   */
  toString(): Snowflake {
    return this.#id;
  }

  /**
   * Converts the snowflake to its BigInt representation.
   * @returns The snowflake as a BigInt
   */
  toBigInt(): bigint {
    return BigInt(this.#id);
  }

  /**
   * Converts the snowflake's timestamp to a Date object.
   * @returns The snowflake's timestamp as a Date
   */
  toDate(): Date {
    return new Date(this.getTimestamp());
  }

  /**
   * Extracts the timestamp from the snowflake.
   * @returns Unix timestamp in milliseconds
   */
  getTimestamp(): number {
    return Number(this.toBigInt() >> 22n) + this.#epoch;
  }

  /**
   * Extracts the worker ID from the snowflake.
   * @returns Worker ID (0-31)
   */
  getWorkerId(): number {
    return Number((this.toBigInt() & 0x3e0000n) >> 17n);
  }

  /**
   * Extracts the process ID from the snowflake.
   * @returns Process ID (0-31)
   */
  getProcessId(): number {
    return Number((this.toBigInt() & 0x1f000n) >> 12n);
  }

  /**
   * Extracts the increment value from the snowflake.
   * @returns Increment value (0-4095)
   */
  getIncrement(): number {
    return Number(this.toBigInt() & 0xfffn);
  }

  /**
   * Deconstructs the snowflake into its component parts.
   * @returns Object containing all snowflake components
   */
  deconstruct(): SnowflakeEntity {
    return {
      timestamp: this.getTimestamp(),
      workerId: this.getWorkerId(),
      processId: this.getProcessId(),
      increment: this.getIncrement(),
      date: this.toDate(),
    };
  }

  /**
   * Compares this snowflake with another.
   *
   * @param other - Snowflake to compare against
   * @returns
   * - 1 if this snowflake is newer
   * - -1 if this snowflake is older
   * - 0 if they are equal
   */
  compare(other: SnowflakeResolvable): number {
    const thisId = this.toBigInt();
    const otherId = SnowflakeManager.resolve(other).toBigInt();
    if (thisId === otherId) {
      return 0;
    }
    return thisId > otherId ? 1 : -1;
  }

  /**
   * Checks if this snowflake is newer than another.
   *
   * @param other - Snowflake to compare against
   * @returns true if this snowflake is newer
   */
  isNewerThan(other: SnowflakeResolvable): boolean {
    return this.compare(other) > 0;
  }

  /**
   * Checks if this snowflake is older than another.
   *
   * @param other - Snowflake to compare against
   * @returns true if this snowflake is older
   */
  isOlderThan(other: SnowflakeResolvable): boolean {
    return this.compare(other) < 0;
  }

  /**
   * Checks if this snowflake equals another.
   *
   * @param other - Snowflake to compare against
   * @returns true if the snowflakes are equal
   */
  equals(other: SnowflakeResolvable): boolean {
    return this.compare(other) === 0;
  }

  /**
   * @internal
   * Resolves various input types into a valid snowflake string.
   */
  #resolveId(
    snowflake: SnowflakeResolvable,
    options: SnowflakeOptions,
  ): Snowflake {
    if (snowflake instanceof SnowflakeManager) {
      return snowflake.toString();
    }

    if (snowflake instanceof Date) {
      return this.#generate(snowflake.getTime(), options);
    }

    if (typeof snowflake === "bigint") {
      return snowflake.toString();
    }

    const stringValue = String(snowflake);
    if (!SnowflakeManager.isValid(stringValue, this.#epoch)) {
      throw new Error("Invalid snowflake provided");
    }

    return stringValue;
  }

  /**
   * @internal
   * Generates a new snowflake string from components.
   */
  #generate(
    timestamp: number = Date.now(),
    options: SnowflakeOptions = {},
  ): Snowflake {
    const { workerId = 0, processId = 0, increment = 0 } = options;

    this.#validateComponents(workerId, processId, increment);

    const timestampBits = BigInt(timestamp - this.#epoch) << 22n;
    const workerBits = BigInt(workerId) << 17n;
    const processBits = BigInt(processId) << 12n;
    const incrementBits = BigInt(increment);

    return (
      timestampBits |
      workerBits |
      processBits |
      incrementBits
    ).toString();
  }

  /**
   * @internal
   * Validates snowflake component values.
   * @throws Error if any component is out of valid range
   */
  #validateComponents(
    workerId: number,
    processId: number,
    increment: number,
  ): void {
    if (workerId < 0 || workerId > SnowflakeManager.MAX_WORKER_ID) {
      throw new Error(
        `Worker ID must be between 0 and ${SnowflakeManager.MAX_WORKER_ID}`,
      );
    }
    if (processId < 0 || processId > SnowflakeManager.MAX_PROCESS_ID) {
      throw new Error(
        `Process ID must be between 0 and ${SnowflakeManager.MAX_PROCESS_ID}`,
      );
    }
    if (increment < 0 || increment > SnowflakeManager.MAX_INCREMENT) {
      throw new Error(
        `Increment must be between 0 and ${SnowflakeManager.MAX_INCREMENT}`,
      );
    }
  }
}
