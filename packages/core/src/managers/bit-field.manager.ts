/** The maximum value a 64-bit bitfield can hold (2^64 - 1) */
const MAX_BIT_VALUE = (1n << 64n) - 1n;

/**
 * Type definition for a BitField value.
 * Can be a bigint, number, or string that represents a valid bit field.
 * @validate BitField value must be a non-negative bigint within 64-bit range
 * @validate BitField value must be a non-negative integer within safe integer range
 * @validate BitField string must be convertible to a valid bigint
 */
export type BitField = bigint | number | string;

/**
 * Represents a value that can be resolved to a bitfield.
 *
 * This type can accept:
 * - A bigint value representing the bits directly
 * - A number value (must be a non-negative integer)
 * - A string that can be parsed as a bigint
 * - A type T that can be resolved to bits (typically an enum value)
 * - An array of any of the above
 *
 * @template T - The custom type that can be resolved to bits
 */
export type BitFieldResolvable<T = unknown> =
  | BitField
  | T
  | BitFieldResolvable<T>[];

/**
 * A utility class for managing bitfields with type safety.
 *
 * BitFieldManager provides methods for working with 64-bit bitfields using BigInt,
 * with support for bitwise operations, transformations, and analysis. It's designed
 * to work with enumerated flag values, such as permission systems or feature flags.
 *
 * @template T - The type of values to be used with this bitfield
 *
 * @example
 * ```typescript
 * enum Permissions {
 *   Read = 1n << 0n,
 *   Write = 1n << 1n,
 *   Execute = 1n << 2n
 * }
 *
 * const userPermissions = new BitFieldManager<Permissions>(Permissions.Read, Permissions.Write);
 *
 * if (userPermissions.has(Permissions.Read)) {
 *   console.log('User has read permission');
 * }
 * ```
 */
export class BitFieldManager<T> {
  /** The internal bitfield value as a bigint */
  #bitfield: bigint;

  /**
   * Creates a new BitFieldManager instance.
   *
   * @param values - The initial values to set in the bitfield
   */
  constructor(...values: BitFieldResolvable<T>[]) {
    this.#bitfield =
      values.length > 0 ? BitFieldManager.resolve<T>(...values) : 0n;
  }

  /**
   * Creates a new BitFieldManager from the given values.
   *
   * @template F - The type of values to be used with the new bitfield
   * @param values - The values to include in the bitfield
   * @returns A new BitFieldManager instance
   */
  static from<F>(...values: BitFieldResolvable<F>[]): BitFieldManager<F> {
    return new BitFieldManager<F>(...values);
  }

  /**
   * Safely validates and converts a value to a bigint
   *
   * @param value - The value to validate and convert
   * @returns The validated bigint value
   * @throws {Error} If the value is invalid
   */
  static safeBigInt(value: unknown): bigint {
    try {
      if (typeof value === "bigint") {
        // Validate bigint range
        if (value < 0n || value > MAX_BIT_VALUE) {
          throw new Error(
            "BitField value must be a non-negative bigint within 64-bit range",
          );
        }
        return value;
      }

      if (typeof value === "number") {
        // Validate number range and type
        if (
          !Number.isInteger(value) ||
          value < 0 ||
          value > Number.MAX_SAFE_INTEGER
        ) {
          throw new Error(
            "BitField value must be a non-negative integer within safe integer range",
          );
        }
        return BigInt(value);
      }

      if (typeof value === "string") {
        try {
          const bigintValue = BigInt(value);
          if (bigintValue < 0n || bigintValue > MAX_BIT_VALUE) {
            throw new Error("BitField value must be within 64-bit range");
          }
          return bigintValue;
        } catch {
          throw new Error(
            "BitField string must be convertible to a valid bigint",
          );
        }
      }

      throw new Error("Value must be a bigint, number, or string");
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Invalid BitField: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Resolves a set of input values to a single bigint representing the combined bits.
   *
   * @template F - The type of values to resolve
   * @param bits - The values to resolve
   * @returns The resolved bigint value
   * @throws {RangeError|TypeError} If any value cannot be resolved
   */
  static resolve<F>(...bits: BitFieldResolvable<F>[]): bigint {
    return bits.reduce<bigint>((acc, bit) => {
      if (bit == null) {
        return acc;
      }

      // Handle bigint values
      if (typeof bit === "bigint") {
        return acc | BitFieldManager.safeBigInt(bit);
      }

      // Handle number values
      if (typeof bit === "number") {
        try {
          if (
            !Number.isInteger(bit) ||
            bit < 0 ||
            bit > Number.MAX_SAFE_INTEGER
          ) {
            throw new RangeError(
              "Invalid number value for BitField resolution",
            );
          }
          return acc | BigInt(bit);
        } catch (_error) {
          throw new RangeError("Invalid number value for BitField resolution");
        }
      }

      // Handle string values (parsing to bigint)
      if (typeof bit === "string") {
        try {
          return acc | BitFieldManager.safeBigInt(bit);
        } catch {
          throw new Error(
            `Could not resolve string "${bit}" to a BitField value`,
          );
        }
      }

      // Handle array values recursively
      if (Array.isArray(bit)) {
        return acc | BitFieldManager.resolve<F>(...bit);
      }

      // Handle any other value (likely a custom flag type)
      try {
        // Try to use the value directly, assuming it can be converted to a bigint somehow
        return (
          acc | BitFieldManager.safeBigInt(BigInt(bit as unknown as number))
        );
      } catch {
        throw new TypeError(
          `Could not resolve ${String(bit)} to a BitField value`,
        );
      }
    }, 0n);
  }

  /**
   * Checks if a value is a valid bitfield.
   *
   * @param value - The value to check
   * @returns Whether the value can be safely used as a bitfield
   */
  static isValidBitField(value: unknown): value is BitField {
    if (value == null) {
      return false;
    }

    // Check if value is a bigint within range
    if (typeof value === "bigint") {
      return value >= 0n && value <= MAX_BIT_VALUE;
    }

    // Check if value is a valid number
    if (typeof value === "number") {
      return (
        Number.isInteger(value) &&
        value >= 0 &&
        value <= Number.MAX_SAFE_INTEGER
      );
    }

    // Check if value is a string that can be parsed as a valid bigint
    if (typeof value === "string") {
      try {
        const bigintValue = BigInt(value);
        return bigintValue >= 0n && bigintValue <= MAX_BIT_VALUE;
      } catch {
        return false;
      }
    }

    // Check if value is an array of valid bitfields
    if (Array.isArray(value)) {
      return value.every((item) => BitFieldManager.isValidBitField(item));
    }

    return false;
  }

  /**
   * Combines multiple bitfields using a bitwise OR operation.
   *
   * @template F - The type of values to combine
   * @param bitfields - The bitfields to combine
   * @returns A new BitFieldManager with the combined bits
   */
  static combine<F>(...bitfields: BitFieldResolvable<F>[]): BitFieldManager<F> {
    return new BitFieldManager<F>(
      bitfields.reduce<bigint>(
        (acc, bf) => acc | BitFieldManager.resolve<F>(bf),
        0n,
      ),
    );
  }

  /**
   * Finds the intersection of multiple bitfields using a bitwise AND operation.
   *
   * @template F - The type of values to intersect
   * @param bitfields - The bitfields to intersect
   * @returns A new BitFieldManager with the intersected bits
   */
  static intersection<F>(
    ...bitfields: BitFieldResolvable<F>[]
  ): BitFieldManager<F> {
    if (bitfields.length === 0) {
      return new BitFieldManager<F>();
    }

    const first = BitFieldManager.resolve<F>(bitfields[0] ?? 0n);
    return new BitFieldManager<F>(
      bitfields
        .slice(1)
        .reduce<bigint>(
          (acc, bf) => acc & BitFieldManager.resolve<F>(bf),
          first,
        ),
    );
  }

  /**
   * Performs XOR operation on multiple bitfields.
   *
   * @template F - The type of values to XOR
   * @param bitfields - The bitfields to XOR
   * @returns A new BitFieldManager with the XORed bits
   */
  static xor<F>(...bitfields: BitFieldResolvable<F>[]): BitFieldManager<F> {
    return new BitFieldManager<F>(
      bitfields.reduce<bigint>(
        (acc, bf) => acc ^ BitFieldManager.resolve<F>(bf),
        0n,
      ),
    );
  }

  /**
   * Checks if this bitfield has a specific bit or set of bits.
   *
   * @param val - The bit(s) to check for
   * @returns True if all specified bits are set
   */
  has(val: BitFieldResolvable<T>): boolean {
    const bit = BitFieldManager.resolve<T>(val);
    return (this.#bitfield & bit) === bit;
  }

  /**
   * Checks if this bitfield has all of the specified bits.
   *
   * @param flags - The bits to check for
   * @returns True if all specified bits are set
   */
  hasAll(...flags: BitFieldResolvable<T>[]): boolean {
    const bits = BitFieldManager.resolve<T>(...flags);
    return (this.#bitfield & bits) === bits;
  }

  /**
   * Checks if this bitfield has any of the specified bits.
   *
   * @param flags - The bits to check for
   * @returns True if any of the specified bits are set
   */
  hasAny(...flags: BitFieldResolvable<T>[]): boolean {
    const bits = BitFieldManager.resolve<T>(...flags);
    return (this.#bitfield & bits) !== 0n;
  }

  /**
   * Returns the bits that are in the flags but not in this bitfield.
   *
   * @param flags - The bits to check against
   * @returns An array of bigint values representing the missing bits
   */
  missing(...flags: BitFieldResolvable<T>[]): bigint[] {
    const bits = BitFieldManager.resolve<T>(...flags);
    return BitFieldManager.from(bits & ~this.#bitfield).toArray();
  }

  /**
   * Checks if this bitfield is empty (has no bits set).
   *
   * @returns True if no bits are set
   */
  isEmpty(): boolean {
    return this.#bitfield === 0n;
  }

  /**
   * Checks if this bitfield is equal to another.
   *
   * @param other - The bitfield to compare with
   * @returns True if the bitfields are equal
   */
  equals(other: BitFieldResolvable<T>): boolean {
    return this.#bitfield === BitFieldManager.resolve<T>(other);
  }

  /**
   * Adds bits to this bitfield.
   *
   * @param flags - The bits to add
   * @returns This instance for chaining
   */
  add(...flags: BitFieldResolvable<T>[]): this {
    const newValue = this.#bitfield | BitFieldManager.resolve<T>(...flags);
    if (newValue < 0n || newValue > MAX_BIT_VALUE) {
      throw new Error("BitField value must be within 64-bit range");
    }
    this.#bitfield = newValue;
    return this;
  }

  /**
   * Removes bits from this bitfield.
   *
   * @param flags - The bits to remove
   * @returns This instance for chaining
   */
  remove(...flags: BitFieldResolvable<T>[]): this {
    const newValue = this.#bitfield & ~BitFieldManager.resolve<T>(...flags);
    if (newValue < 0n || newValue > MAX_BIT_VALUE) {
      throw new Error("BitField value must be within 64-bit range");
    }
    this.#bitfield = newValue;
    return this;
  }

  /**
   * Toggles bits in this bitfield.
   *
   * @param flags - The bits to toggle
   * @returns This instance for chaining
   */
  toggle(...flags: BitFieldResolvable<T>[]): this {
    const newValue = this.#bitfield ^ BitFieldManager.resolve<T>(...flags);
    if (newValue < 0n || newValue > MAX_BIT_VALUE) {
      throw new Error("BitField value must be within 64-bit range");
    }
    this.#bitfield = newValue;
    return this;
  }

  /**
   * Sets this bitfield to the specified value.
   *
   * @param flags - The bits to set
   * @returns This instance for chaining
   */
  set(...flags: BitFieldResolvable<T>[]): this {
    const newValue = BitFieldManager.resolve<T>(...flags);
    if (newValue < 0n || newValue > MAX_BIT_VALUE) {
      throw new Error("BitField value must be within 64-bit range");
    }
    this.#bitfield = newValue;
    return this;
  }

  /**
   * Clears all bits in this bitfield.
   *
   * @returns This instance for chaining
   */
  clear(): this {
    this.#bitfield = 0n;
    return this;
  }

  /**
   * Creates a new BitFieldManager with the same bits as this one.
   *
   * @returns A new BitFieldManager instance
   */
  clone(): BitFieldManager<T> {
    return new BitFieldManager<T>(this.#bitfield);
  }

  /**
   * Converts this bitfield to an array of powers of 2 representing the set bits.
   *
   * @returns An array of bigint values representing the set bits
   */
  toArray(): bigint[] {
    const result: bigint[] = [];
    let value = this.#bitfield;
    let position = 0n;

    while (value > 0n) {
      if (value && 1n) {
        result.push(1n << position);
      }
      value >>= 1n;
      position++;
    }

    return result;
  }

  /**
   * Converts this bitfield to a string representation.
   *
   * @param radix - The radix to use for the string representation (default: 16)
   * @returns The string representation
   */
  toString(radix = 16): string {
    return this.#bitfield.toString(radix);
  }

  /**
   * Converts this bitfield to a number.
   *
   * @returns The number representation
   * @throws If the value exceeds Number.MAX_SAFE_INTEGER
   */
  toNumber(): number {
    if (this.#bitfield > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new RangeError("BitField value exceeds Number.MAX_SAFE_INTEGER");
    }
    return Number(this.#bitfield);
  }

  /**
   * Returns the raw bigint value of this bitfield.
   *
   * @returns The bigint value
   */
  valueOf(): bigint {
    return this.#bitfield;
  }

  /**
   * Checks if a specific bit position is set.
   *
   * @param position - The bit position to check (0-63)
   * @returns True if the bit is set
   * @throws {RangeError} If the position is out of range
   */
  isBitSet(position: number): boolean {
    if (!Number.isInteger(position) || position < 0 || position >= 64) {
      throw new RangeError("Bit position must be between 0 and 63");
    }

    return (this.#bitfield & (1n << BigInt(position))) !== 0n;
  }

  /**
   * Returns a new BitFieldManager with the bits that are in this bitfield but not in the other.
   *
   * @param other - The bitfield to subtract
   * @returns A new BitFieldManager with the difference
   */
  difference(other: BitFieldResolvable<T>): BitFieldManager<T> {
    return new BitFieldManager<T>(
      this.#bitfield & ~BitFieldManager.resolve<T>(other),
    );
  }

  /**
   * Checks if this bitfield has any bits in common with another.
   *
   * @param other - The bitfield to check against
   * @returns True if there are any common bits
   */
  intersects(other: BitFieldResolvable<T>): boolean {
    return (this.#bitfield & BitFieldManager.resolve<T>(other)) !== 0n;
  }

  /**
   * Checks if this bitfield is a subset of another.
   *
   * @param other - The bitfield to check against
   * @returns True if this bitfield is a subset of the other
   */
  isSubset(other: BitFieldResolvable<T>): boolean {
    const otherBits = BitFieldManager.resolve<T>(other);
    return (this.#bitfield & otherBits) === this.#bitfield;
  }

  /**
   * Checks if this bitfield is a superset of another.
   *
   * @param other - The bitfield to check against
   * @returns True if this bitfield is a superset of the other
   */
  isSuperset(other: BitFieldResolvable<T>): boolean {
    const otherBits = BitFieldManager.resolve<T>(other);
    return (this.#bitfield & otherBits) === otherBits;
  }

  /**
   * Sets a specific bit position.
   *
   * @param position - The bit position to set (0-63)
   * @returns This instance for chaining
   * @throws {RangeError} If the position is out of range
   */
  setBit(position: number): this {
    if (!Number.isInteger(position) || position < 0 || position >= 64) {
      throw new RangeError("Bit position must be between 0 and 63");
    }

    const newValue = this.#bitfield | (1n << BigInt(position));
    if (newValue < 0n || newValue > MAX_BIT_VALUE) {
      throw new Error("BitField value must be within 64-bit range");
    }
    this.#bitfield = newValue;
    return this;
  }

  /**
   * Clears a specific bit position.
   *
   * @param position - The bit position to clear (0-63)
   * @returns This instance for chaining
   * @throws {RangeError} If the position is out of range
   */
  clearBit(position: number): this {
    if (!Number.isInteger(position) || position < 0 || position >= 64) {
      throw new RangeError("Bit position must be between 0 and 63");
    }

    const newValue = this.#bitfield & ~(1n << BigInt(position));
    if (newValue < 0n || newValue > MAX_BIT_VALUE) {
      throw new Error("BitField value must be within 64-bit range");
    }
    this.#bitfield = newValue;
    return this;
  }

  /**
   * Toggles a specific bit position.
   *
   * @param position - The bit position to toggle (0-63)
   * @returns This instance for chaining
   * @throws {RangeError} If the position is out of range
   */
  toggleBit(position: number): this {
    if (!Number.isInteger(position) || position < 0 || position >= 64) {
      throw new RangeError("Bit position must be between 0 and 63");
    }

    const newValue = this.#bitfield ^ (1n << BigInt(position));
    if (newValue < 0n || newValue > MAX_BIT_VALUE) {
      throw new Error("BitField value must be within 64-bit range");
    }
    this.#bitfield = newValue;
    return this;
  }

  /**
   * Returns an array of position indices where bits are set.
   *
   * @returns An array of bit positions
   */
  getSetBitPositions(): number[] {
    const positions: number[] = [];
    let value = this.#bitfield;
    let position = 0;

    while (value > 0n) {
      if (value && 1n) {
        positions.push(position);
      }
      value >>= 1n;
      position++;
    }

    return positions;
  }

  /**
   * Counts the number of bits set (population count).
   *
   * @returns The number of set bits
   */
  popCount(): number {
    return this.#getSetBitCount(this.#bitfield);
  }

  /**
   * Makes the BitFieldManager iterable, yielding each set bit as a power of 2.
   */
  *[Symbol.iterator](): Iterator<bigint> {
    yield* this.toArray();
  }

  /**
   * Counts the number of bits set in a bigint value.
   *
   * @param value - The value to count bits in
   * @returns The number of set bits
   */
  #getSetBitCount(value: bigint): number {
    let count = 0;
    let num = value;

    // Brian Kernighan's algorithm for counting set bits
    while (num > 0n) {
      num &= num - 1n; // Clear the least significant bit set
      count++;
    }

    return count;
  }
}
