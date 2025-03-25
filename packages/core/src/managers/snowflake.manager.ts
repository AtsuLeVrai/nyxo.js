/**
 * Constants for Discord Snowflake ID generation and parsing
 */
export const DISCORD_EPOCH = 1420070400000; // Discord Epoch (January 1, 2015)
export const MAX_INCREMENT = 4095; // Maximum increment value (12 bits)
export const MAX_PROCESS_ID = 31; // Maximum process ID (5 bits)
export const MAX_WORKER_ID = 31; // Maximum worker ID (5 bits)
export const TIMESTAMP_SHIFT = 22n; // Bit shift for timestamp (64 - 42 = 22)
export const WORKER_ID_SHIFT = 17n; // Bit shift for worker ID (22 - 5 = 17)
export const PROCESS_ID_SHIFT = 12n; // Bit shift for process ID (17 - 5 = 12)

/**
 * Type definition for a validated Snowflake ID
 * @minLength 1 Snowflake cannot be empty
 * @pattern ^\d+$ Snowflake must contain only digits
 * @validate Snowflake must be at least 17 digits long
 * @validate Invalid Snowflake format or timestamp
 */
export type Snowflake = string;

/**
 * Type definition for Snowflake generation options
 * @strict
 * @readonly
 */
export interface SnowflakeOptions {
  /**
   * Worker ID (5 bits, 0-31)
   * Used to differentiate between different servers/workers generating IDs
   * @minimum 0
   * @maximum 31
   * @default 0
   */
  workerId: number;

  /**
   * Process ID (5 bits, 0-31)
   * Used to differentiate between different processes on the same worker
   * @minimum 0
   * @maximum 31
   * @default 0
   */
  processId: number;

  /**
   * Sequence/increment number (12 bits, 0-4095)
   * Used to differentiate between IDs generated in the same millisecond
   * @minimum 0
   * @maximum 4095
   * @default 0
   */
  increment: number;

  /**
   * Custom epoch in milliseconds since Unix epoch
   * Defaults to Discord's epoch (January 1, 2015)
   * @default 1420070400000
   */
  epoch: number;
}

/**
 * Type definition for values that can be resolved to a Snowflake
 */
export type SnowflakeResolvable =
  | string // String representation of a Snowflake
  | number // Timestamp or raw number
  | bigint // BigInt representation of a Snowflake
  | Date; // Date object to generate a Snowflake from

/**
 * Type definition for a deconstructed Snowflake with its components
 */
export interface SnowflakeEntity {
  /** Timestamp in milliseconds */
  timestamp: number;

  /** Worker ID (0-31) */
  workerId: number;

  /** Process ID (0-31) */
  processId: number;

  /** Increment (0-4095) */
  increment: number;

  /** Date object representation of the timestamp */
  date: Date;
}

/**
 * Class for managing Discord Snowflake IDs.
 *
 * Snowflakes are unique identifiers used by Discord, consisting of:
 * - 41 bits for timestamp (milliseconds since Discord epoch)
 * - 5 bits for worker ID
 * - 5 bits for process ID
 * - 12 bits for increment
 *
 * This class provides methods to parse, validate, generate, and manipulate Snowflakes.
 *
 * @example
 * ```typescript
 * // Create from an existing Snowflake ID
 * const snowflake = new SnowflakeManager('175928847299117063');
 *
 * // Get the timestamp
 * const timestamp = snowflake.getTimestamp();
 *
 * // Create from a timestamp
 * const newSnowflake = SnowflakeManager.fromTimestamp(Date.now());
 * ```
 */
export class SnowflakeManager {
  /** The validated Snowflake ID */
  readonly #id: Snowflake;

  /** The options used for this Snowflake */
  readonly #options: SnowflakeOptions;

  /**
   * Creates a new SnowflakeManager instance.
   *
   * @param snowflake - A value that can be resolved to a Snowflake
   * @param options - Options for Snowflake generation
   * @throws {Error} If the snowflake is invalid or options are invalid
   */
  constructor(
    snowflake: SnowflakeResolvable,
    options: Partial<SnowflakeOptions> = {},
  ) {
    // Validate options and set defaults
    this.#options = this.#validateOptions(options);

    // Resolve and validate the snowflake ID
    this.#id = this.#resolveId(snowflake, this.#options);
  }

  /**
   * Creates a SnowflakeManager from a resolvable value.
   *
   * @param snowflake - A value that can be resolved to a Snowflake
   * @param options - Options for Snowflake generation
   * @returns A new SnowflakeManager instance
   */
  static from(
    snowflake: SnowflakeResolvable,
    options: Partial<SnowflakeOptions> = {},
  ): SnowflakeManager {
    return new SnowflakeManager(snowflake, options);
  }

  /**
   * Creates a SnowflakeManager from a timestamp.
   *
   * @param timestamp - Timestamp in milliseconds or Date object
   * @param options - Options for Snowflake generation
   * @returns A new SnowflakeManager instance
   */
  static fromTimestamp(
    timestamp: number | Date,
    options: Partial<SnowflakeOptions> = {},
  ): SnowflakeManager {
    const time = timestamp instanceof Date ? timestamp.getTime() : timestamp;
    return new SnowflakeManager(time, options);
  }

  /**
   * Checks if a string is a valid Snowflake.
   *
   * @param snowflake - The string to validate
   * @returns True if the string is a valid Snowflake
   */
  static isValid(snowflake: string): snowflake is Snowflake {
    if (!(snowflake && /^\d+$/.test(snowflake)) || snowflake.length < 17) {
      return false;
    }

    try {
      const bigIntValue = BigInt(snowflake);
      const timestamp = Number(bigIntValue >> TIMESTAMP_SHIFT) + DISCORD_EPOCH;

      // Check if timestamp is exactly equal to DISCORD_EPOCH
      if (timestamp === DISCORD_EPOCH) {
        return false;
      }

      // Check if timestamp is within a reasonable range
      return timestamp > DISCORD_EPOCH && timestamp <= Date.now() + 3600000;
    } catch {
      return false;
    }
  }

  /**
   * Resolves a value to a Snowflake string.
   *
   * @param resolvable - A value that can be resolved to a Snowflake
   * @param options - Options for Snowflake generation
   * @returns The resolved Snowflake string
   */
  static resolve(
    resolvable: SnowflakeResolvable,
    options: Partial<SnowflakeOptions> = {},
  ): Snowflake {
    return new SnowflakeManager(resolvable, options).toString();
  }

  /**
   * Converts the Snowflake to its string representation.
   *
   * @returns The Snowflake as a string
   */
  toString(): Snowflake {
    return this.#id;
  }

  /**
   * Converts the Snowflake to its BigInt representation.
   *
   * @returns The Snowflake as a BigInt
   */
  toBigInt(): bigint {
    return BigInt(this.#id);
  }

  /**
   * Converts the Snowflake to a Date object.
   *
   * @returns Date object representing the Snowflake's timestamp
   */
  toDate(): Date {
    return new Date(this.getTimestamp());
  }

  /**
   * Extracts the timestamp from the Snowflake.
   *
   * @returns Timestamp in milliseconds
   */
  getTimestamp(): number {
    return Number(this.toBigInt() >> TIMESTAMP_SHIFT) + this.#options.epoch;
  }

  /**
   * Extracts the worker ID from the Snowflake.
   *
   * @returns Worker ID (0-31)
   */
  getWorkerId(): number {
    return Number((this.toBigInt() & 0x3e0000n) >> WORKER_ID_SHIFT);
  }

  /**
   * Extracts the process ID from the Snowflake.
   *
   * @returns Process ID (0-31)
   */
  getProcessId(): number {
    return Number((this.toBigInt() & 0x1f000n) >> PROCESS_ID_SHIFT);
  }

  /**
   * Extracts the increment value from the Snowflake.
   *
   * @returns Increment value (0-4095)
   */
  getIncrement(): number {
    return Number(this.toBigInt() & 0xfffn);
  }

  /**
   * Deconstructs the Snowflake into its component parts.
   *
   * @returns Object containing the Snowflake's components
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
   * Compares this Snowflake with another.
   *
   * @param other - Snowflake to compare with
   * @returns 1 if this Snowflake is newer, -1 if older, 0 if equal
   */
  compare(other: SnowflakeResolvable | SnowflakeManager): number {
    const thisId = this.toBigInt();

    // Determine how to get the BigInt from 'other'
    let otherId: bigint;

    if (other instanceof SnowflakeManager) {
      // If other is already a SnowflakeManager, just get its BigInt value
      otherId = other.toBigInt();
    } else {
      // Otherwise, create a new SnowflakeManager and get the BigInt
      otherId = new SnowflakeManager(other).toBigInt();
    }

    if (thisId === otherId) {
      return 0;
    }

    return thisId > otherId ? 1 : -1;
  }

  /**
   * Checks if this Snowflake is newer than another.
   *
   * @param other - Snowflake to compare with
   * @returns True if this Snowflake is newer
   */
  isNewerThan(other: SnowflakeResolvable): boolean {
    return this.compare(other) > 0;
  }

  /**
   * Checks if this Snowflake is older than another.
   *
   * @param other - Snowflake to compare with
   * @returns True if this Snowflake is older
   */
  isOlderThan(other: SnowflakeResolvable): boolean {
    return this.compare(other) < 0;
  }

  /**
   * Checks if this Snowflake is equal to another.
   *
   * @param other - Snowflake to compare with
   * @returns True if the Snowflakes are equal
   */
  equals(other: SnowflakeResolvable): boolean {
    return this.compare(other) === 0;
  }

  /**
   * Validates the provided options and sets defaults
   *
   * @param options - Partial options to validate
   * @returns Complete validated options with defaults
   * @private
   */
  #validateOptions(options: Partial<SnowflakeOptions>): SnowflakeOptions {
    // Default options
    const validatedOptions: SnowflakeOptions = {
      workerId: options.workerId ?? 0,
      processId: options.processId ?? 0,
      increment: options.increment ?? 0,
      epoch: options.epoch ?? DISCORD_EPOCH,
    };

    // Validate ranges
    if (
      validatedOptions.workerId < 0 ||
      validatedOptions.workerId > MAX_WORKER_ID
    ) {
      throw new Error(
        `Invalid worker ID: must be between 0 and ${MAX_WORKER_ID}`,
      );
    }

    if (
      validatedOptions.processId < 0 ||
      validatedOptions.processId > MAX_PROCESS_ID
    ) {
      throw new Error(
        `Invalid process ID: must be between 0 and ${MAX_PROCESS_ID}`,
      );
    }

    if (
      validatedOptions.increment < 0 ||
      validatedOptions.increment > MAX_INCREMENT
    ) {
      throw new Error(
        `Invalid increment: must be between 0 and ${MAX_INCREMENT}`,
      );
    }

    return validatedOptions;
  }

  /**
   * Resolves a value to a Snowflake ID.
   *
   * @param snowflake - Value to resolve
   * @param options - Options for Snowflake generation
   * @returns Resolved Snowflake ID
   * @throws {Error} If the value cannot be resolved to a valid Snowflake
   * @private
   */
  #resolveId(
    snowflake: SnowflakeResolvable,
    options: SnowflakeOptions,
  ): Snowflake {
    // Handle Date objects by generating a Snowflake from the timestamp
    if (snowflake instanceof Date) {
      return this.#generate(snowflake.getTime(), options);
    }

    // Handle BigInt values
    if (typeof snowflake === "bigint") {
      const stringValue = snowflake.toString();
      if (!SnowflakeManager.isValid(stringValue)) {
        throw new Error("Invalid bigint snowflake value");
      }

      return stringValue as Snowflake;
    }

    // Handle number values (treat as timestamps)
    if (typeof snowflake === "number") {
      if (snowflake < 0 || !Number.isInteger(snowflake)) {
        throw new Error("Invalid timestamp value");
      }

      return this.#generate(snowflake, options);
    }

    // Handle string values
    const stringValue = String(snowflake);
    if (!SnowflakeManager.isValid(stringValue)) {
      throw new Error("Invalid snowflake provided");
    }

    return stringValue as Snowflake;
  }

  /**
   * Generates a Snowflake ID from a timestamp and options.
   *
   * @param timestamp - Timestamp in milliseconds
   * @param options - Options for Snowflake generation
   * @returns Generated Snowflake ID
   * @throws {Error} If the timestamp is before the epoch
   * @private
   */
  #generate(timestamp: number, options: SnowflakeOptions): Snowflake {
    if (timestamp < options.epoch) {
      throw new Error("Timestamp cannot be before epoch");
    }

    // Calculate the relative timestamp (milliseconds since epoch)
    const relativeTimestamp = timestamp - options.epoch;

    // Construct the Snowflake by combining its components
    const timestampBits = BigInt(relativeTimestamp) << TIMESTAMP_SHIFT;
    const workerBits = BigInt(options.workerId) << WORKER_ID_SHIFT;
    const processBits = BigInt(options.processId) << PROCESS_ID_SHIFT;
    const incrementBits = BigInt(options.increment);

    // Combine all bits with bitwise OR
    const snowflake = (
      timestampBits |
      workerBits |
      processBits |
      incrementBits
    ).toString();

    // Validate the generated Snowflake
    if (!SnowflakeManager.isValid(snowflake)) {
      throw new Error("Generated invalid snowflake");
    }

    return snowflake as Snowflake;
  }
}
