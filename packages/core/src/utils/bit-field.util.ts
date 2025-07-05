/** The maximum value a 64-bit bitfield can hold (2^64 - 1) */
const MAX_BIT_VALUE = (1n << 64n) - 1n;

/**
 * Represents a value that can be used as a bitfield.
 *
 * Can be a bigint, number, or string that represents a valid bit field.
 *
 * @remarks
 * - For bigint: Must be non-negative and within 64-bit range
 * - For number: Must be a non-negative integer within safe integer range
 * - For string: Must be convertible to a valid bigint
 *
 * @example
 * ```typescript
 * // All of these are valid BitField values
 * const field1: BitFieldValue = 42n;
 * const field2: BitFieldValue = 255;
 * const field3: BitFieldValue = "1024";
 * ```
 */
export type BitFieldValue = bigint | number | string;

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
 * @template T - The custom type that can be resolved to bits (e.g., an enum)
 *
 * @example
 * ```typescript
 * enum Permissions {
 *   Read = 1n << 0n,
 *   Write = 1n << 1n,
 *   Execute = 1n << 2n
 * }
 *
 * // All these are valid BitFieldResolvable<Permissions> values
 * const value1: BitFieldResolvable<Permissions> = Permissions.Read;
 * const value2: BitFieldResolvable<Permissions> = [Permissions.Read, Permissions.Write];
 * const value3: BitFieldResolvable<Permissions> = "1"; // Equivalent to Permissions.Read
 * ```
 */
export type BitFieldResolvable<T = unknown> =
  | BitFieldValue
  | T
  | BitField<T>
  | BitFieldResolvable<T>[];

/**
 * A utility class for managing bit flags with type safety.
 *
 * BitField provides methods for working with 64-bit bitfields using BigInt,
 * with support for bitwise operations, transformations, and analysis. It's designed
 * to work with enumerated flag values, such as permission systems or feature flags.
 *
 * @template T - The type of values to be used with this bitfield (typically an enum)
 *
 * @example
 * ```typescript
 * // Define permissions as an enum with bit flags
 * enum Permissions {
 *   Read = 1n << 0n,    // 1
 *   Write = 1n << 1n,   // 2
 *   Execute = 1n << 2n  // 4
 * }
 *
 * // Create a BitField with initial permissions
 * const userPermissions = new BitField<Permissions>(Permissions.Read | Permissions.Write);
 *
 * // Check if user has read permission
 * if (userPermissions.has(Permissions.Read)) {
 *   console.log('User has read permission');
 * }
 *
 * // Add execute permission
 * userPermissions.add(Permissions.Execute);
 *
 * // Check if user has all permissions
 * if (userPermissions.hasAll(Permissions.Read, Permissions.Write, Permissions.Execute)) {
 *   console.log('User has all permissions');
 * }
 * ```
 */
export class BitField<T> {
  /** The internal bitfield value as a bigint */
  #bitfield: bigint;

  /**
   * Creates a new BitField instance.
   *
   * @param bits - The initial value(s) to set in the bitfield
   *
   * @example
   * ```typescript
   * // Empty bitfield (all bits unset)
   * const emptyField = new BitField();
   *
   * // From a single value
   * const field = new BitField(1n << 3n);
   *
   * // From multiple values
   * const permField = new BitField(Permissions.Read, Permissions.Write);
   *
   * // From an array
   * const arrayField = new BitField([1n, 2n, 4n]);
   * ```
   */
  constructor(...bits: BitFieldResolvable<T>[]) {
    this.#bitfield = bits.length > 0 ? BitField.resolve<T>(...bits) : 0n;
  }

  /**
   * Creates a new BitField instance from the given value(s).
   *
   * @template F - The type of values to be used with the new bitfield
   * @param bits - The value(s) to include in the bitfield
   * @returns A new BitField instance
   *
   * @example
   * ```typescript
   * // Create a BitField from enum values
   * const permField = BitField.from(Permissions.Read, Permissions.Write);
   *
   * // Create a BitField from mixed types
   * const mixedField = BitField.from(1n, "4", Permissions.Execute);
   * ```
   */
  static from<F>(...bits: BitFieldResolvable<F>[]): BitField<F> {
    return new BitField<F>(...bits);
  }

  /**
   * Safely converts a value to a bigint, with validation.
   *
   * @param value - The value to convert and validate
   * @returns The validated bigint value
   * @throws {Error} If the value is invalid or outside the acceptable range
   *
   * @internal
   */
  static safeBigInt(value: unknown): bigint {
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
   * Resolves a set of input values to a single bigint representing the combined bits.
   *
   * @template F - The type of values to resolve
   * @param bits - The values to resolve
   * @returns The resolved bigint value
   * @throws {Error} If any value cannot be resolved
   *
   * @example
   * ```typescript
   * // Resolve multiple values
   * const resolved = BitField.resolve(1n, 2, "4", Permissions.Read);
   * console.log(resolved.toString()); // "7"
   * ```
   */
  static resolve<F>(...bits: BitFieldResolvable<F>[]): bigint {
    return bits.reduce<bigint>((acc, bit) => {
      if (bit == null) {
        return acc;
      }

      // Handle BitField instances
      if (bit instanceof BitField) {
        return acc | bit.valueOf();
      }

      // Handle array values recursively
      if (Array.isArray(bit)) {
        return acc | BitField.resolve<F>(...bit);
      }

      // Handle all other types by converting to bigint
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
   * Checks if a value is a valid bitfield.
   *
   * @param value - The value to check
   * @returns Whether the value can be safely used as a bitfield
   *
   * @example
   * ```typescript
   * // Check various values
   * BitField.isValid(42n);      // true
   * BitField.isValid(123);      // true
   * BitField.isValid("256");    // true
   * BitField.isValid(-1n);      // false
   * BitField.isValid("hello");  // false
   * ```
   */
  static isValid(value: unknown): value is BitFieldValue {
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
      return value.every((item) => BitField.isValid(item));
    }

    return false;
  }

  /**
   * Combines multiple bitfields using a bitwise OR operation.
   *
   * @template F - The type of values to combine
   * @param bitfields - The bitfields to combine
   * @returns A new BitField with the combined bits
   *
   * @example
   * ```typescript
   * const field1 = new BitField(Permissions.Read);
   * const field2 = new BitField(Permissions.Write);
   *
   * // Combine the fields
   * const combined = BitField.combine(field1, field2, Permissions.Execute);
   * // Same as: field1 | field2 | Permissions.Execute
   * ```
   */
  static combine<F>(...bitfields: BitFieldResolvable<F>[]): BitField<F> {
    return new BitField<F>(
      bitfields.reduce<bigint>((acc, bf) => acc | BitField.resolve<F>(bf), 0n),
    );
  }

  /**
   * Finds the intersection of multiple bitfields using a bitwise AND operation.
   *
   * @template F - The type of values to intersect
   * @param bitfields - The bitfields to intersect
   * @returns A new BitField with the intersected bits
   *
   * @example
   * ```typescript
   * const field1 = new BitField(Permissions.Read | Permissions.Write);
   * const field2 = new BitField(Permissions.Write | Permissions.Execute);
   *
   * // Get the intersection (bits present in both fields)
   * const common = BitField.intersection(field1, field2);
   * // Result will have only Permissions.Write set
   * ```
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
   * Checks if this bitfield has all specified bits set.
   *
   * @param bits - The bit(s) to check for
   * @returns True if all specified bits are set
   *
   * @example
   * ```typescript
   * const permissions = new BitField(Permissions.Read | Permissions.Write);
   *
   * // Check for a single permission
   * permissions.has(Permissions.Read);      // true
   *
   * // Check for all of multiple permissions
   * permissions.has(Permissions.Read | Permissions.Write);  // true
   * permissions.has(Permissions.Write | Permissions.Execute);  // false
   * ```
   */
  has(bits: BitFieldResolvable<T>): boolean {
    const bitsToCheck = BitField.resolve<T>(bits);
    return (this.#bitfield & bitsToCheck) === bitsToCheck;
  }

  /**
   * Checks if this bitfield has any of the specified bits set.
   *
   * @param bits - The bit(s) to check for
   * @returns True if any of the specified bits are set
   *
   * @example
   * ```typescript
   * const permissions = new BitField(Permissions.Read);
   *
   * // Check if any of these bits are set
   * permissions.hasAny(Permissions.Read, Permissions.Write);  // true
   * permissions.hasAny(Permissions.Write, Permissions.Execute);  // false
   * ```
   */
  hasAny(...bits: BitFieldResolvable<T>[]): boolean {
    const bitsToCheck = BitField.resolve<T>(...bits);
    return (this.#bitfield & bitsToCheck) !== 0n;
  }

  /**
   * Checks if this bitfield is empty (has no bits set).
   *
   * @returns True if no bits are set
   *
   * @example
   * ```typescript
   * new BitField().isEmpty();  // true
   * new BitField(0).isEmpty(); // true
   * new BitField(1).isEmpty(); // false
   * ```
   */
  isEmpty(): boolean {
    return this.#bitfield === 0n;
  }

  /**
   * Checks if this bitfield is equal to another.
   *
   * @param other - The bitfield to compare with
   * @returns True if the bitfields are equal
   *
   * @example
   * ```typescript
   * const field1 = new BitField(Permissions.Read | Permissions.Write);
   * const field2 = new BitField(Permissions.Read | Permissions.Write);
   * const field3 = new BitField(Permissions.Execute);
   *
   * field1.equals(field2);  // true
   * field1.equals(field3);  // false
   * field1.equals(3n);      // true (3n equals Read | Write)
   * ```
   */
  equals(other: BitFieldResolvable<T>): boolean {
    return this.#bitfield === BitField.resolve<T>(other);
  }

  /**
   * Adds bits to this bitfield.
   *
   * @param bits - The bit(s) to add
   * @returns This instance for chaining
   *
   * @example
   * ```typescript
   * const permissions = new BitField(Permissions.Read);
   *
   * // Add write permission
   * permissions.add(Permissions.Write);
   *
   * // Add multiple permissions
   * permissions.add(Permissions.Execute, Permissions.Admin);
   * ```
   */
  add(...bits: BitFieldResolvable<T>[]): this {
    this.#bitfield |= BitField.resolve<T>(...bits);
    return this;
  }

  /**
   * Removes bits from this bitfield.
   *
   * @param bits - The bit(s) to remove
   * @returns This instance for chaining
   *
   * @example
   * ```typescript
   * const permissions = new BitField(Permissions.Read | Permissions.Write | Permissions.Execute);
   *
   * // Remove write permission
   * permissions.remove(Permissions.Write);
   *
   * // Remove multiple permissions
   * permissions.remove(Permissions.Read, Permissions.Execute);
   * ```
   */
  remove(...bits: BitFieldResolvable<T>[]): this {
    this.#bitfield &= ~BitField.resolve<T>(...bits);
    return this;
  }

  /**
   * Toggles bits in this bitfield.
   *
   * @param bits - The bit(s) to toggle
   * @returns This instance for chaining
   *
   * @example
   * ```typescript
   * const permissions = new BitField(Permissions.Read | Permissions.Write);
   *
   * // Toggle write and execute permissions
   * // (turns off Write, turns on Execute)
   * permissions.toggle(Permissions.Write | Permissions.Execute);
   * ```
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
   *
   * // Clear all permissions
   * permissions.clear();
   * console.log(permissions.isEmpty());  // true
   * ```
   */
  clear(): this {
    this.#bitfield = 0n;
    return this;
  }

  /**
   * Creates a new BitField with the same bits as this one.
   *
   * @returns A new BitField instance
   *
   * @example
   * ```typescript
   * const original = new BitField(Permissions.Read | Permissions.Write);
   * const copy = original.clone();
   *
   * // Modifying copy doesn't affect original
   * copy.add(Permissions.Execute);
   * console.log(original.has(Permissions.Execute));  // false
   * ```
   */
  clone(): BitField<T> {
    return new BitField<T>(this.#bitfield);
  }

  /**
   * Converts this bitfield to an array of powers of 2 representing the set bits.
   *
   * @returns An array of bigint values representing the set bits
   *
   * @example
   * ```typescript
   * const field = new BitField(1n | 4n | 8n);
   * console.log(field.toArray());  // [1n, 4n, 8n]
   * ```
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
   * Converts this bitfield to a string representation.
   *
   * @param radix - The radix to use for the string representation (default: 10)
   * @returns The string representation
   *
   * @example
   * ```typescript
   * const field = new BitField(10n);
   * console.log(field.toString());     // "10"
   * console.log(field.toString(16));   // "a"
   * console.log(field.toString(2));    // "1010"
   * ```
   */
  toString(radix = 10): string {
    return this.#bitfield.toString(radix);
  }

  /**
   * Returns the raw bigint value of this bitfield.
   *
   * @returns The bigint value
   *
   * @example
   * ```typescript
   * const field = new BitField(Permissions.Read | Permissions.Write);
   * const value = field.valueOf();  // Returns the raw bigint
   * console.log(value);  // 3n
   * ```
   */
  valueOf(): bigint {
    return this.#bitfield;
  }

  /**
   * Makes the BitField iterable, yielding each set bit as a power of 2.
   *
   * @example
   * ```typescript
   * const field = new BitField(1n | 4n | 8n);
   *
   * // Iterate over set bits
   * for (const bit of field) {
   *   console.log(bit);  // 1n, 4n, 8n
   * }
   *
   * // Use with spread operator
   * const bits = [...field];  // [1n, 4n, 8n]
   * ```
   */
  *[Symbol.iterator](): Iterator<bigint> {
    yield* this.toArray();
  }
}
