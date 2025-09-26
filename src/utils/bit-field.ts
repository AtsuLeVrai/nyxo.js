/**
 * Valid bit value types that can be converted to bigint for bitfield operations.
 * Supports numbers, bigints, and numeric strings for flexible input handling.
 */
export type BitValue = number | bigint | string;

/**
 * Converts a bit value to a safe bigint within 64-bit range constraints.
 * Validates input ranges and throws errors for invalid values.
 *
 * @param value - Bit value to convert (number, bigint, or numeric string)
 * @returns Validated bigint value within safe range
 * @throws {Error} When value is negative or exceeds 64-bit range
 * @throws {Error} When number is not an integer or exceeds MAX_SAFE_INTEGER
 */
function safeBigInt(value: BitValue): bigint {
  const MAX_BIT_VALUE = (1n << 64n) - 1n;

  if (typeof value === "string") {
    const bigintValue = BigInt(value);
    if (bigintValue < 0n || bigintValue > MAX_BIT_VALUE) {
      throw new Error("BitField value must be a non-negative bigint within 64-bit range");
    }
    return bigintValue;
  }

  if (typeof value === "bigint") {
    if (value < 0n || value > MAX_BIT_VALUE) {
      throw new Error("BitField value must be a non-negative bigint within 64-bit range");
    }
    return value;
  }

  if (!Number.isInteger(value) || value < 0 || value > Number.MAX_SAFE_INTEGER) {
    throw new Error("BitField value must be a non-negative integer within safe integer range");
  }

  return BigInt(value);
}

/**
 * Resolves multiple bit values into a single combined bigint using bitwise OR operation.
 * Filters out null/undefined values and safely converts all inputs to bigint.
 *
 * @typeParam F - Bit value type constraint
 * @param bits - Variable number of bit values to combine
 * @returns Combined bigint result of all valid bit values
 * @throws {Error} When any bit value is invalid or out of range
 */
const resolve = <F extends BitValue>(...bits: F[]): bigint =>
  bits.reduce((acc, bit) => {
    if (bit == null) return acc;
    return acc | safeBigInt(bit);
  }, 0n);

/**
 * High-performance bitfield implementation with 64-bit support and type safety.
 * Provides comprehensive bit manipulation operations with automatic range validation.
 * All operations are performed using native bigint for optimal performance.
 *
 * @typeParam T - Bit value type constraint for type-safe operations
 */
export class BitField<T extends BitValue> {
  /**
   * @private
   * Internal bigint storage for the bitfield state.
   * Direct access bypasses validation - use public methods instead.
   */
  private bitfield: bigint;

  /**
   * Creates a new BitField instance with optional initial bit values.
   * Null and undefined values are automatically filtered out.
   *
   * @param bits - Variable number of initial bit values to set
   * @throws {Error} When any bit value is invalid or out of range
   */
  constructor(...bits: (T | undefined)[]) {
    this.bitfield = bits.length > 0 ? resolve(...bits.filter((bit): bit is T => bit != null)) : 0n;
  }

  /**
   * Creates a new BitField by combining multiple bit values using bitwise OR.
   * Static factory method for convenient bitfield creation.
   *
   * @typeParam F - Bit value type constraint
   * @param bitfields - Bit values to combine into new bitfield
   * @returns New BitField instance with combined bit values
   * @throws {Error} When any bit value is invalid or out of range
   */
  static combine<F extends BitValue>(...bitfields: F[]): BitField<F> {
    return new BitField(resolve(...bitfields)) as BitField<F>;
  }

  /**
   * Checks if all specified bits are set in the bitfield.
   * Uses bitwise AND to verify complete bit pattern match.
   *
   * @param bits - Bit value to check for presence
   * @returns True if all bits in the pattern are set, false otherwise
   * @throws {Error} When bit value is invalid or out of range
   */
  has(bits: T): boolean {
    const bitsToCheck = resolve(bits);
    return (this.bitfield & bitsToCheck) === bitsToCheck;
  }

  /**
   * Checks if any of the specified bits are set in the bitfield.
   * Returns true if at least one bit from the pattern matches.
   *
   * @param bits - Variable number of bit values to check
   * @returns True if any specified bits are set, false if none match
   * @throws {Error} When any bit value is invalid or out of range
   */
  hasAny(...bits: T[]): boolean {
    const bitsToCheck = resolve(...bits);
    return (this.bitfield & bitsToCheck) !== 0n;
  }

  /**
   * Compares bitfield value for exact equality with another bit value.
   * Performs strict comparison of underlying bigint values.
   *
   * @param other - Bit value to compare against
   * @returns True if bitfield exactly equals the compared value
   * @throws {Error} When comparison value is invalid or out of range
   */
  equals(other: T): boolean {
    return this.bitfield === resolve(other);
  }

  /**
   * Adds specified bits to the bitfield using bitwise OR operation.
   * Existing bits remain unchanged, new bits are set to 1.
   *
   * @param bits - Variable number of bit values to add
   * @returns Reference to this instance for method chaining
   * @throws {Error} When any bit value is invalid or out of range
   */
  add(...bits: T[]): this {
    this.bitfield |= resolve(...bits);
    return this;
  }

  /**
   * Removes specified bits from the bitfield using bitwise AND NOT operation.
   * Only specified bits are cleared, other bits remain unchanged.
   *
   * @param bits - Variable number of bit values to remove
   * @returns Reference to this instance for method chaining
   * @throws {Error} When any bit value is invalid or out of range
   */
  remove(...bits: T[]): this {
    this.bitfield &= ~resolve(...bits);
    return this;
  }

  /**
   * Toggles specified bits in the bitfield using bitwise XOR operation.
   * Set bits become unset, unset bits become set.
   *
   * @param bits - Variable number of bit values to toggle
   * @returns Reference to this instance for method chaining
   * @throws {Error} When any bit value is invalid or out of range
   */
  toggle(...bits: T[]): this {
    this.bitfield ^= resolve(...bits);
    return this;
  }

  /**
   * Creates a deep copy of the current bitfield instance.
   * New instance is independent and modifications won't affect original.
   *
   * @returns New BitField instance with identical bit pattern
   */
  clone(): BitField<T> {
    return new BitField(this.bitfield) as BitField<T>;
  }

  /**
   * Converts bitfield to string representation in specified radix.
   * Useful for debugging and serialization purposes.
   *
   * @param radix - Numeric base for string conversion (default: 10)
   * @returns String representation of bitfield value
   */
  toString(radix = 10): string {
    return this.bitfield.toString(radix);
  }

  /**
   * Returns the primitive bigint value of the bitfield.
   * Enables automatic type conversion in numeric contexts.
   *
   * @returns Internal bigint representation
   */
  valueOf(): bigint {
    return this.bitfield;
  }

  /**
   * Converts bitfield to 64-bit binary string representation.
   * Zero-padded to full 64-bit width for consistent formatting.
   *
   * @returns 64-character binary string (0s and 1s)
   */
  toBinary(): string {
    return this.bitfield.toString(2).padStart(64, "0");
  }

  /**
   * Extracts all set bit positions as an array of bigint values.
   * Each element represents a power of 2 corresponding to set bits.
   *
   * @returns Array of bigint values representing individual set bits
   */
  toArray(): bigint[] {
    const result: bigint[] = [];
    let bit = 1n;
    while (bit <= this.bitfield) {
      if (this.bitfield & bit) result.push(bit);
      bit <<= 1n;
    }
    return result;
  }

  /**
   * Provides detailed string representation for debugging and inspection.
   * Includes both decimal value and binary representation.
   *
   * @returns Formatted debug string with value and binary pattern
   */
  inspect(): string {
    return `BitField(${this.bitfield}n) [${this.toBinary()}]`;
  }

  /**
   * Checks if the bitfield contains no set bits (all zeros).
   * Efficient test for empty state without iteration.
   *
   * @returns True if bitfield is empty (value is 0), false otherwise
   */
  isEmpty(): boolean {
    return this.bitfield === 0n;
  }

  /**
   * Counts the number of set bits in the bitfield (population count).
   * Uses string manipulation for reliable bit counting across all platforms.
   *
   * @returns Number of bits set to 1 in the bitfield
   */
  count(): number {
    return this.toBinary().split("1").length - 1;
  }
}
