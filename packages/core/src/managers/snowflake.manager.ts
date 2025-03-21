import { z } from "zod";
import { fromError } from "zod-validation-error";

/**
 * Constants for Discord Snowflake ID generation and parsing
 */
const DISCORD_EPOCH = 1420070400000; // Discord Epoch (January 1, 2015)
const MAX_INCREMENT = 4095; // Maximum increment value (12 bits)
const MAX_PROCESS_ID = 31; // Maximum process ID (5 bits)
const MAX_WORKER_ID = 31; // Maximum worker ID (5 bits)
const TIMESTAMP_SHIFT = 22n; // Bit shift for timestamp (64 - 42 = 22)
const WORKER_ID_SHIFT = 17n; // Bit shift for worker ID (22 - 5 = 17)
const PROCESS_ID_SHIFT = 12n; // Bit shift for process ID (17 - 5 = 12)

/**
 * Zod schema for validating Discord Snowflake IDs.
 * Snowflakes are string representations of 64-bit integers with specific bit structure.
 */
export const Snowflake = z
  .string()
  .min(1, "Snowflake cannot be empty")
  .regex(/^\d+$/, "Snowflake must contain only digits")
  .refine(
    (value) => value.length >= 17,
    "Snowflake must be at least 17 digits long",
  )
  .refine((value) => {
    try {
      const bigIntValue = BigInt(value);
      const timestamp = Number(bigIntValue >> TIMESTAMP_SHIFT) + DISCORD_EPOCH;

      // Vérifier que le timestamp n'est pas exactement égal à DISCORD_EPOCH
      if (timestamp === DISCORD_EPOCH) {
        return false;
      }

      // Vérifier que le timestamp est dans une plage raisonnable
      return timestamp > DISCORD_EPOCH && timestamp <= Date.now() + 3600000;
    } catch {
      return false;
    }
  }, "Invalid Snowflake format or timestamp");

/**
 * Type definition for a validated Snowflake ID
 */
export type Snowflake = z.infer<typeof Snowflake>;

/**
 * Zod schema for Snowflake generation options
 */
export const SnowflakeOptions = z
  .object({
    /**
     * Worker ID (5 bits, 0-31)
     * Used to differentiate between different servers/workers generating IDs
     */
    workerId: z.number().int().min(0).max(MAX_WORKER_ID).default(0),

    /**
     * Process ID (5 bits, 0-31)
     * Used to differentiate between different processes on the same worker
     */
    processId: z.number().int().min(0).max(MAX_PROCESS_ID).default(0),

    /**
     * Sequence/increment number (12 bits, 0-4095)
     * Used to differentiate between IDs generated in the same millisecond
     */
    increment: z.number().int().min(0).max(MAX_INCREMENT).default(0),

    /**
     * Custom epoch in milliseconds since Unix epoch
     * Defaults to Discord's epoch (January 1, 2015)
     */
    epoch: z.number().int().default(DISCORD_EPOCH),
  })
  .strict()
  .readonly();

/**
 * Type definition for Snowflake generation options
 */
export type SnowflakeOptions = z.infer<typeof SnowflakeOptions>;

/**
 * Zod schema for values that can be resolved to a Snowflake
 */
export const SnowflakeResolvable = z.union([
  z.string(), // String representation of a Snowflake
  z.number(), // Timestamp or raw number
  z.bigint(), // BigInt representation of a Snowflake
  z.date(), // Date object to generate a Snowflake from
]);

/**
 * Type definition for values that can be resolved to a Snowflake
 */
export type SnowflakeResolvable = z.infer<typeof SnowflakeResolvable>;

/**
 * Zod schema for a deconstructed Snowflake with its components
 */
export const SnowflakeEntity = z.object({
  /** Timestamp in milliseconds */
  timestamp: z.number(),
  /** Worker ID (0-31) */
  workerId: z.number(),
  /** Process ID (0-31) */
  processId: z.number(),
  /** Increment (0-4095) */
  increment: z.number(),
  /** Date object representation of the timestamp */
  date: z.date(),
});

/**
 * Type definition for a deconstructed Snowflake
 */
export type SnowflakeEntity = z.infer<typeof SnowflakeEntity>;

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
    options: z.input<typeof SnowflakeOptions> = {},
  ) {
    try {
      this.#options = SnowflakeOptions.parse(options);
    } catch (error) {
      throw new Error(`Invalid Snowflake options: ${fromError(error).message}`);
    }

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
    options: z.input<typeof SnowflakeOptions> = {},
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
    options: z.input<typeof SnowflakeOptions> = {},
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
    return Snowflake.safeParse(snowflake).success;
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
    options: z.input<typeof SnowflakeOptions> = {},
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
    return SnowflakeEntity.parse({
      timestamp: this.getTimestamp(),
      workerId: this.getWorkerId(),
      processId: this.getProcessId(),
      increment: this.getIncrement(),
      date: this.toDate(),
    });
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
    const parsedResolvable = SnowflakeResolvable.parse(snowflake);

    // Handle Date objects by generating a Snowflake from the timestamp
    if (parsedResolvable instanceof Date) {
      return this.#generate(parsedResolvable.getTime(), options);
    }

    // Handle BigInt values
    if (typeof parsedResolvable === "bigint") {
      const stringValue = parsedResolvable.toString();
      if (!Snowflake.safeParse(stringValue).success) {
        throw new Error("Invalid bigint snowflake value");
      }

      return stringValue as Snowflake;
    }

    // Handle number values (treat as timestamps)
    if (typeof parsedResolvable === "number") {
      if (parsedResolvable < 0 || !Number.isInteger(parsedResolvable)) {
        throw new Error("Invalid timestamp value");
      }

      return this.#generate(parsedResolvable, options);
    }

    // Handle string values
    const stringValue = String(parsedResolvable);
    if (!Snowflake.safeParse(stringValue).success) {
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
    return Snowflake.parse(snowflake);
  }
}
