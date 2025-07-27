/** Maximum value for 64-bit bitfield (2^64 - 1) */
const MAX_BIT_VALUE = (1n << 64n) - 1n;

/**
 * Value that can be used as a bitfield.
 * Accepts bigint, number, or string representations.
 *
 * @public
 */
export type BitFieldValue = bigint | number | string;

/**
 * Value that can be resolved to a bitfield.
 * Supports individual values, arrays, and custom types.
 *
 * @typeParam T - Custom type that resolves to bits
 *
 * @public
 */
export type BitFieldResolvable<T = unknown> =
  | BitFieldValue
  | T
  | BitField<T>
  | BitFieldResolvable<T>[];

/**
 * Utility class for managing bit flags with type safety.
 * Provides bitwise operations, transformations, and analysis.
 *
 * @typeParam T - Type of values used with this bitfield
 *
 * @example
 * ```typescript
 * enum Permissions {
 *   Read = 1n << 0n,
 *   Write = 1n << 1n,
 *   Execute = 1n << 2n
 * }
 *
 * const userPermissions = new BitField<Permissions>(Permissions.Read | Permissions.Write);
 * userPermissions.add(Permissions.Execute);
 * ```
 *
 * @public
 */
export class BitField<T> {
  /** Internal bitfield value as bigint */
  #bitfield: bigint;

  /**
   * Creates new BitField instance.
   *
   * @param bits - Initial values to set
   *
   * @example
   * ```typescript
   * const emptyField = new BitField();
   * const field = new BitField(1n << 3n);
   * const permField = new BitField(Permissions.Read, Permissions.Write);
   * ```
   *
   * @public
   */
  constructor(...bits: BitFieldResolvable<T>[]) {
    this.#bitfield = bits.length > 0 ? BitField.resolve<T>(...bits) : 0n;
  }

  /**
   * Creates new BitField from given values.
   *
   * @typeParam F - Type of values for the new bitfield
   * @param bits - Values to include
   * @returns New BitField instance
   *
   * @example
   * ```typescript
   * const permField = BitField.from(Permissions.Read, Permissions.Write);
   * const mixedField = BitField.from(1n, "4", Permissions.Execute);
   * ```
   *
   * @public
   */
  static from<F>(...bits: BitFieldResolvable<F>[]): BitField<F> {
    return new BitField<F>(...bits);
  }

  /**
   * Converts value to validated bigint.
   *
   * @param value - Value to convert
   * @returns Validated bigint value
   *
   * @throws {Error} When value is invalid or out of range
   *
   * @internal
   */
  static safeBigInt(value: unknown): bigint {
    if (typeof value === "bigint") {
      if (value < 0n || value > MAX_BIT_VALUE) {
        throw new Error(
          "BitField value must be a non-negative bigint within 64-bit range",
        );
      }
      return value;
    }

    if (typeof value === "number") {
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
      let bigintValue: bigint;
      try {
        bigintValue = BigInt(value);
      } catch {
        throw new Error(
          "BitField string must be convertible to a valid bigint",
        );
      }

      if (bigintValue < 0n || bigintValue > MAX_BIT_VALUE) {
        throw new Error("BitField value must be within 64-bit range");
      }

      return bigintValue;
    }

    throw new Error("Value must be a bigint, number, or string");
  }

  /**
   * Resolves input values to single bigint.
   *
   * @typeParam F - Type of values to resolve
   * @param bits - Values to resolve
   * @returns Combined bigint value
   *
   * @throws {Error} When any value cannot be resolved
   *
   * @example
   * ```typescript
   * const resolved = BitField.resolve(1n, 2, "4", Permissions.Read);
   * console.log(resolved.toString()); // "7"
   * ```
   *
   * @public
   */
  static resolve<F>(...bits: BitFieldResolvable<F>[]): bigint {
    return bits.reduce<bigint>((acc, bit) => {
      if (bit == null) {
        return acc;
      }

      if (bit instanceof BitField) {
        return acc | bit.valueOf();
      }

      if (Array.isArray(bit)) {
        return acc | BitField.resolve<F>(...bit);
      }

      try {
        return acc | BitField.safeBigInt(bit);
      } catch (error) {
        throw new Error(
          `Could not resolve ${String(bit)} to a BitField value: ${String(error)}`,
        );
      }
    }, 0n);
  }

  /**
   * Checks if value is valid bitfield.
   *
   * @param value - Value to check
   * @returns Whether value can be used as bitfield
   *
   * @example
   * ```typescript
   * BitField.isValid(42n);      // true
   * BitField.isValid(123);      // true
   * BitField.isValid("256");    // true
   * BitField.isValid(-1n);      // false
   * ```
   *
   * @public
   */
  static isValid(value: unknown): value is BitFieldValue {
    if (value == null) {
      return false;
    }

    if (typeof value === "bigint") {
      return value >= 0n && value <= MAX_BIT_VALUE;
    }

    if (typeof value === "number") {
      return (
        Number.isInteger(value) &&
        value >= 0 &&
        value <= Number.MAX_SAFE_INTEGER
      );
    }

    if (typeof value === "string") {
      try {
        const bigintValue = BigInt(value);
        return bigintValue >= 0n && bigintValue <= MAX_BIT_VALUE;
      } catch {
        return false;
      }
    }

    if (Array.isArray(value)) {
      return value.every((item) => BitField.isValid(item));
    }

    return false;
  }

  /**
   * Combines multiple bitfields using bitwise OR.
   *
   * @typeParam F - Type of values to combine
   * @param bitfields - Bitfields to combine
   * @returns New BitField with combined bits
   *
   * @example
   * ```typescript
   * const field1 = new BitField(Permissions.Read);
   * const field2 = new BitField(Permissions.Write);
   * const combined = BitField.combine(field1, field2, Permissions.Execute);
   * ```
   *
   * @public
   */
  static combine<F>(...bitfields: BitFieldResolvable<F>[]): BitField<F> {
    return new BitField<F>(
      bitfields.reduce<bigint>((acc, bf) => acc | BitField.resolve<F>(bf), 0n),
    );
  }

  /**
   * Finds intersection using bitwise AND.
   *
   * @typeParam F - Type of values to intersect
   * @param bitfields - Bitfields to intersect
   * @returns New BitField with intersected bits
   *
   * @example
   * ```typescript
   * const field1 = new BitField(Permissions.Read | Permissions.Write);
   * const field2 = new BitField(Permissions.Write | Permissions.Execute);
   * const common = BitField.intersection(field1, field2);
   * ```
   *
   * @public
   */
  static intersection<F>(...bitfields: BitFieldResolvable<F>[]): BitField<F> {
    if (bitfields.length === 0) {
      return new BitField<F>();
    }

    const first = BitField.resolve<F>(bitfields[0] ?? 0n);
    return new BitField<F>(
      bitfields
        .slice(1)
        .reduce<bigint>((acc, bf) => acc & BitField.resolve<F>(bf), first),
    );
  }

  /**
   * Checks if all specified bits are set.
   *
   * @param bits - Bits to check for
   * @returns True if all specified bits are set
   *
   * @example
   * ```typescript
   * const permissions = new BitField(Permissions.Read | Permissions.Write);
   * permissions.has(Permissions.Read);      // true
   * permissions.has(Permissions.Read | Permissions.Write);  // true
   * permissions.has(Permissions.Write | Permissions.Execute);  // false
   * ```
   *
   * @public
   */
  has(bits: BitFieldResolvable<T>): boolean {
    const bitsToCheck = BitField.resolve<T>(bits);
    return (this.#bitfield & bitsToCheck) === bitsToCheck;
  }

  /**
   * Checks if any of specified bits are set.
   *
   * @param bits - Bits to check for
   * @returns True if any specified bits are set
   *
   * @example
   * ```typescript
   * const permissions = new BitField(Permissions.Read);
   * permissions.hasAny(Permissions.Read, Permissions.Write);  // true
   * permissions.hasAny(Permissions.Write, Permissions.Execute);  // false
   * ```
   *
   * @public
   */
  hasAny(...bits: BitFieldResolvable<T>[]): boolean {
    const bitsToCheck = BitField.resolve<T>(...bits);
    return (this.#bitfield & bitsToCheck) !== 0n;
  }

  /**
   * Checks if bitfield is empty.
   *
   * @returns True if no bits are set
   *
   * @example
   * ```typescript
   * new BitField().isEmpty();  // true
   * new BitField(0).isEmpty(); // true
   * new BitField(1).isEmpty(); // false
   * ```
   *
   * @public
   */
  isEmpty(): boolean {
    return this.#bitfield === 0n;
  }

  /**
   * Checks if bitfield equals another.
   *
   * @param other - Bitfield to compare with
   * @returns True if bitfields are equal
   *
   * @example
   * ```typescript
   * const field1 = new BitField(Permissions.Read | Permissions.Write);
   * const field2 = new BitField(Permissions.Read | Permissions.Write);
   * field1.equals(field2);  // true
   * field1.equals(3n);      // true
   * ```
   *
   * @public
   */
  equals(other: BitFieldResolvable<T>): boolean {
    return this.#bitfield === BitField.resolve<T>(other);
  }

  /**
   * Adds bits to this bitfield.
   *
   * @param bits - Bits to add
   * @returns This instance for chaining
   *
   * @example
   * ```typescript
   * const permissions = new BitField(Permissions.Read);
   * permissions.add(Permissions.Write);
   * permissions.add(Permissions.Execute, Permissions.Admin);
   * ```
   *
   * @public
   */
  add(...bits: BitFieldResolvable<T>[]): this {
    this.#bitfield |= BitField.resolve<T>(...bits);
    return this;
  }

  /**
   * Removes bits from this bitfield.
   *
   * @param bits - Bits to remove
   * @returns This instance for chaining
   *
   * @example
   * ```typescript
   * const permissions = new BitField(Permissions.Read | Permissions.Write | Permissions.Execute);
   * permissions.remove(Permissions.Write);
   * permissions.remove(Permissions.Read, Permissions.Execute);
   * ```
   *
   * @public
   */
  remove(...bits: BitFieldResolvable<T>[]): this {
    this.#bitfield &= ~BitField.resolve<T>(...bits);
    return this;
  }

  /**
   * Toggles bits in this bitfield.
   *
   * @param bits - Bits to toggle
   * @returns This instance for chaining
   *
   * @example
   * ```typescript
   * const permissions = new BitField(Permissions.Read | Permissions.Write);
   * permissions.toggle(Permissions.Write | Permissions.Execute);
   * ```
   *
   * @public
   */
  toggle(...bits: BitFieldResolvable<T>[]): this {
    this.#bitfield ^= BitField.resolve<T>(...bits);
    return this;
  }

  /**
   * Clears all bits in this bitfield.
   *
   * @returns This instance for chaining
   *
   * @example
   * ```typescript
   * const permissions = new BitField(Permissions.Read | Permissions.Write);
   * permissions.clear();
   * console.log(permissions.isEmpty());  // true
   * ```
   *
   * @public
   */
  clear(): this {
    this.#bitfield = 0n;
    return this;
  }

  /**
   * Creates new BitField with same bits.
   *
   * @returns New BitField instance
   *
   * @example
   * ```typescript
   * const original = new BitField(Permissions.Read | Permissions.Write);
   * const copy = original.clone();
   * copy.add(Permissions.Execute);
   * console.log(original.has(Permissions.Execute));  // false
   * ```
   *
   * @public
   */
  clone(): BitField<T> {
    return new BitField<T>(this.#bitfield);
  }

  /**
   * Converts to array of powers of 2 representing set bits.
   *
   * @returns Array of bigint values for set bits
   *
   * @example
   * ```typescript
   * const field = new BitField(1n | 4n | 8n);
   * console.log(field.toArray());  // [1n, 4n, 8n]
   * ```
   *
   * @public
   */
  toArray(): bigint[] {
    const result: bigint[] = [];
    let value = this.#bitfield;
    let position = 0n;

    while (value > 0n) {
      if ((value & 1n) === 1n) {
        result.push(1n << position);
      }
      value >>= 1n;
      position++;
    }

    return result;
  }

  /**
   * Converts to string representation.
   *
   * @param radix - Radix for string representation
   * @returns String representation
   *
   * @example
   * ```typescript
   * const field = new BitField(10n);
   * console.log(field.toString());     // "10"
   * console.log(field.toString(16));   // "a"
   * console.log(field.toString(2));    // "1010"
   * ```
   *
   * @public
   */
  toString(radix = 10): string {
    return this.#bitfield.toString(radix);
  }

  /**
   * Returns raw bigint value.
   *
   * @returns Bigint value
   *
   * @public
   */
  valueOf(): bigint {
    return this.#bitfield;
  }

  /**
   * Makes BitField iterable, yielding each set bit.
   *
   * @example
   * ```typescript
   * const field = new BitField(1n | 4n | 8n);
   * for (const bit of field) {
   *   console.log(bit);  // 1n, 4n, 8n
   * }
   * const bits = [...field];  // [1n, 4n, 8n]
   * ```
   *
   * @public
   */
  *[Symbol.iterator](): Iterator<bigint> {
    yield* this.toArray();
  }
}
