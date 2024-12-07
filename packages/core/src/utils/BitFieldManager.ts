/**
 * Represents values that can be resolved to a BitField.
 *
 * @typeParam T - The type of flags managed by the BitField
 * @remarks
 * A BitFieldResolvable can be:
 * - An array of T, bigint, or string representations of bigint
 * - A BitFieldManager instance
 * - A single value of type T
 * - A bigint
 * - A string representation of a bigint
 */
export type BitFieldResolvable<T> =
  | (T | bigint | `${bigint}`)[]
  | BitFieldManager<T>
  | T
  | bigint
  | `${bigint}`;

/**
 * Manages a set of bits as flags, providing operations for bit manipulation.
 *
 * @remarks
 * BitFieldManager provides a type-safe way to handle bit flags operations.
 * It supports various operations like adding, removing, toggling flags,
 * and checking flag states.
 *
 * @typeParam T - The type of flags managed by the BitField
 *
 * @example
 * ```typescript
 * // Using with an enum
 * enum Permissions {
 *   READ = 1n << 0n,
 *   WRITE = 1n << 1n,
 *   EXECUTE = 1n << 2n
 * }
 *
 * const bitfield = new BitFieldManager<Permissions>(Permissions.READ | Permissions.WRITE);
 * console.log(bitfield.has(Permissions.READ)); // true
 * console.log(bitfield.has(Permissions.EXECUTE)); // false
 * ```
 */
export class BitFieldManager<T> {
  /**
   * Regular expression for validating bigint string format.
   * @readonly
   */
  static readonly BIGINT_REGEX = /^-?\d+$/;

  /**
   * The internal bitfield value stored as a bigint.
   * @private
   */
  readonly #bitfield: bigint;

  /**
   * Creates an instance of BitFieldManager.
   *
   * @param value - Initial value for the bitfield
   * @throws TypeError If the value is negative or invalid
   *
   * @example
   * ```typescript
   * const bitfield = new BitFieldManager(0n);
   * const fromBinary = new BitFieldManager('1010');
   * ```
   */
  constructor(value: BitFieldResolvable<T> = 0n) {
    this.#bitfield = this.#resolve(value);
  }

  /**
   * Creates a new BitFieldManager instance from a value.
   *
   * @typeParam F - The type of flags to manage
   * @param value - Value to create the BitField from
   * @returns A new BitFieldManager instance
   */
  static from<F>(value: BitFieldResolvable<F>): BitFieldManager<F> {
    return new BitFieldManager(value);
  }

  /**
   * Checks if a value can be resolved to a valid bitfield.
   *
   * @param value - Value to check
   * @returns Whether the value is valid for a bitfield
   */
  static isValid(value: unknown): value is bigint {
    try {
      new BitFieldManager(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Combines multiple bitfields into a single BitFieldManager.
   *
   * @typeParam F - The type of flags to manage
   * @param bitfields - Bitfields to combine
   * @returns A new BitFieldManager with combined flags
   *
   * @example
   * ```typescript
   * const combined = BitFieldManager.combine(flags1, flags2, flags3);
   * ```
   */
  static combine<F>(...bitfields: BitFieldResolvable<F>[]): BitFieldManager<F> {
    return new BitFieldManager<F>(
      bitfields.reduce<bigint>(
        (acc, bf) => acc | new BitFieldManager(bf).valueOf(),
        0n,
      ),
    );
  }

  /**
   * Checks if a specific flag is set.
   *
   * @param val - Flag to check
   * @returns Whether the flag is set
   */
  has(val: T): boolean {
    const bit = this.#resolve(val);
    return (this.#bitfield & bit) === bit;
  }

  /**
   * Checks if all specified flags are set.
   *
   * @param flags - Flags to check
   * @returns Whether all flags are set
   */
  hasAll(flags: T[]): boolean {
    const bits = this.#resolve(flags);
    return (this.#bitfield & bits) === bits;
  }

  /**
   * Checks if any of the specified flags are set.
   *
   * @param flags - Flags to check
   * @returns Whether any of the flags are set
   */
  hasAny(flags: T[]): boolean {
    const bits = this.#resolve(flags);
    return (this.#bitfield & bits) !== 0n;
  }

  /**
   * Checks if the bitfield is empty (no flags set).
   * @returns Whether the bitfield is empty
   */
  isEmpty(): boolean {
    return this.#bitfield === 0n;
  }

  /**
   * Checks if this bitfield equals another.
   *
   * @param other - Bitfield to compare against
   * @returns Whether the bitfields are equal
   */
  equals(other: BitFieldResolvable<T>): boolean {
    return this.#bitfield === this.#resolve(other);
  }

  /**
   * Adds specified flags to the bitfield.
   *
   * @param flags - Flags to add
   * @returns This BitFieldManager instance
   */
  add(...flags: T[]): this {
    this.#setBitfield(this.#bitfield | this.#resolve(flags));
    return this;
  }

  /**
   * Removes specified flags from the bitfield.
   *
   * @param flags - Flags to remove
   * @returns This BitFieldManager instance
   */
  remove(...flags: T[]): this {
    this.#setBitfield(this.#bitfield & ~this.#resolve(flags));
    return this;
  }

  /**
   * Toggles specified flags in the bitfield.
   *
   * @param flags - Flags to toggle
   * @returns This BitFieldManager instance
   */
  toggle(...flags: T[]): this {
    this.#setBitfield(this.#bitfield ^ this.#resolve(flags));
    return this;
  }

  /**
   * Clears all flags in the bitfield.
   * @returns This BitFieldManager instance
   */
  clear(): this {
    this.#setBitfield(0n);
    return this;
  }

  /**
   * Creates a copy of this BitFieldManager.
   * @returns A new BitFieldManager with the same flags
   */
  clone(): BitFieldManager<T> {
    return new BitFieldManager<T>(this.#bitfield);
  }

  /**
   * Converts the bitfield to an array of individual bits.
   * @returns Array of set bits as BigInts
   */
  toArray(): bigint[] {
    const result: bigint[] = [];
    let currentBit = 1n;
    let value = this.#bitfield;

    while (value > 0n) {
      if ((value & currentBit) === currentBit) {
        result.push(currentBit);
      }
      currentBit <<= 1n;
      value &= ~currentBit;
    }

    return result;
  }

  /**
   * Counts the number of flags set in the bitfield.
   * @returns Number of set flags
   */
  count(): number {
    return this.toArray().length;
  }

  /**
   * Converts the bitfield to a string representation.
   *
   * @param radix - Base for string conversion (default: 16)
   * @returns String representation of the bitfield
   */
  toString(radix = 16): string {
    return this.#bitfield.toString(radix);
  }

  /**
   * Converts the bitfield to a binary string.
   * @returns Binary string representation
   */
  toBinaryString(): string {
    return this.#bitfield.toString(2);
  }

  /**
   * Gets the raw bigint value of the bitfield.
   * @returns The underlying bigint value
   */
  valueOf(): bigint {
    return this.#bitfield;
  }

  /**
   * @internal
   * Resolves a value or array of values to a bigint.
   *
   * @throws TypeError If the value is invalid or negative
   */
  #resolve(value: BitFieldResolvable<T> | BitFieldResolvable<T>[]): bigint {
    if (value instanceof BitFieldManager) {
      return value.valueOf();
    }

    if (Array.isArray(value)) {
      return value.reduce<bigint>((acc, val) => acc | this.#resolve(val), 0n);
    }

    if (typeof value === "bigint") {
      return this.#validateBigInt(value);
    }

    if (typeof value === "number") {
      if (!Number.isInteger(value) || value < 0) {
        throw new TypeError("Number must be a non-negative integer");
      }
      return this.#validateBigInt(BigInt(value));
    }

    if (typeof value === "string") {
      return this.#assertValidBigInt(value);
    }

    throw new TypeError(`Invalid type for bitfield value: ${typeof value}`);
  }

  /**
   * @internal
   * Validates a bigint value.
   *
   * @throws TypeError If the value is negative
   */
  #validateBigInt(value: bigint): bigint {
    if (value < 0n) {
      throw new TypeError("Bitfield value cannot be negative");
    }
    return value;
  }

  /**
   * @internal
   * Validates and converts a string to a bigint.
   *
   * @throws Error If the string is empty or invalid
   * @throws TypeError If the resulting value is negative
   */
  #assertValidBigInt(value: string): bigint {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      throw new Error("Empty string is not a valid BigInt");
    }

    if (!BitFieldManager.BIGINT_REGEX.test(trimmedValue)) {
      throw new Error("Invalid BigInt format");
    }

    try {
      const result = BigInt(trimmedValue);
      return this.#validateBigInt(result);
    } catch (error) {
      throw new Error(
        `Failed to create BigInt: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * @internal
   * Sets the internal bitfield value.
   *
   * @throws TypeError If the value is negative
   */
  #setBitfield(value: bigint): void {
    Object.defineProperty(this, "#bitfield", {
      value: this.#validateBigInt(value),
      writable: true,
      configurable: false,
    });
  }
}
