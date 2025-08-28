/**
 * @description Maximum allowed value for Discord bitfield operations (64-bit unsigned integer limit).
 */
const MAX_BIT_VALUE = (1n << 64n) - 1n;

/**
 * @description Safely converts number or bigint values to bigint with Discord-compatible range validation.
 *
 * @param value - Number or bigint to convert
 * @returns Validated bigint within Discord's acceptable range
 * @throws {Error} When value is negative, exceeds safe limits, or non-integer number
 */
function safeBigInt(value: bigint | number): bigint {
  if (typeof value === "bigint") {
    if (value < 0n || value > MAX_BIT_VALUE) {
      throw new Error("BitField value must be a non-negative bigint within 64-bit range");
    }
    return value;
  }

  if (typeof value === "number") {
    if (!Number.isInteger(value) || value < 0 || value > Number.MAX_SAFE_INTEGER) {
      throw new Error("BitField value must be a non-negative integer within safe integer range");
    }
    return BigInt(value);
  }

  throw new Error("Value must be a bigint or number");
}

/**
 * @description Resolves multiple bitfield values into a single combined bigint using bitwise OR operations.
 *
 * @param bits - Array of number or bigint values to combine
 * @returns Combined bitfield value as bigint
 */
const resolve = <F extends number | bigint>(...bits: F[]): bigint =>
  bits.reduce((acc, bit) => {
    if (bit == null) return acc;

    return acc | safeBigInt(bit);
  }, 0n);

/**
 * @description High-performance bitfield implementation for Discord permissions, intents, and flags with zero-cache design.
 * @see {@link https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags}
 */
export class BitField<T extends number | bigint> {
  #bitfield: bigint;

  /**
   * @description Creates new BitField instance with combined bit values.
   *
   * @param bits - Array of bit values to combine (undefined values are ignored)
   */
  constructor(...bits: (T | undefined)[]) {
    this.#bitfield = bits.length > 0 ? resolve(...bits.filter((bit): bit is T => bit != null)) : 0n;
  }

  /**
   * @description Combines multiple bit values into a new BitField instance.
   *
   * @param bitfields - Bit values to combine
   * @returns New BitField with combined values
   */
  static combine<F extends number | bigint>(...bitfields: F[]): BitField<F> {
    return new BitField(resolve(...bitfields)) as BitField<F>;
  }

  /**
   * @description Checks if this BitField contains all specified bits.
   *
   * @param bits - Bit value(s) to check for
   * @returns True if all specified bits are present
   */
  has(bits: T): boolean {
    const bitsToCheck = resolve(bits);
    return (this.#bitfield & bitsToCheck) === bitsToCheck;
  }

  /**
   * @description Checks if this BitField contains any of the specified bits.
   *
   * @param bits - Bit values to check for
   * @returns True if any specified bits are present
   */
  hasAny(...bits: T[]): boolean {
    const bitsToCheck = resolve(...bits);
    return (this.#bitfield & bitsToCheck) !== 0n;
  }

  /**
   * @description Checks if this BitField exactly equals another bit value.
   *
   * @param other - Bit value to compare against
   * @returns True if values are identical
   */
  equals(other: T): boolean {
    return this.#bitfield === resolve(other);
  }

  /**
   * @description Adds specified bits to this BitField (mutating operation).
   *
   * @param bits - Bit values to add
   * @returns This BitField instance for chaining
   */
  add(...bits: T[]): this {
    this.#bitfield |= resolve(...bits);
    return this;
  }

  /**
   * @description Removes specified bits from this BitField (mutating operation).
   *
   * @param bits - Bit values to remove
   * @returns This BitField instance for chaining
   */
  remove(...bits: T[]): this {
    this.#bitfield &= ~resolve(...bits);
    return this;
  }

  /**
   * @description Toggles specified bits in this BitField (mutating operation).
   *
   * @param bits - Bit values to toggle
   * @returns This BitField instance for chaining
   */
  toggle(...bits: T[]): this {
    this.#bitfield ^= resolve(...bits);
    return this;
  }

  /**
   * @description Creates a copy of this BitField with identical bit values.
   *
   * @returns New BitField instance with same values
   */
  clone(): BitField<T> {
    return new BitField(this.#bitfield) as BitField<T>;
  }

  /**
   * @description Converts BitField value to string representation.
   *
   * @param radix - Numeric base for string conversion (default: 10)
   * @returns String representation of the bitfield value
   */
  toString(radix = 10): string {
    return this.#bitfield.toString(radix);
  }

  /**
   * @description Returns the raw bigint value of this BitField.
   *
   * @returns Raw bitfield value as bigint
   */
  valueOf(): bigint {
    return this.#bitfield;
  }
}
