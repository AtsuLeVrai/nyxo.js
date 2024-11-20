export type BitFieldResolvable<T> =
  | (T | bigint | `${bigint}`)[]
  | BitFieldManager<T>
  | T
  | bigint
  | `${bigint}`;

export class BitFieldManager<T> {
  static BIGINT_REGEX = /^-?\d+$/;
  #bitfield: bigint;

  constructor(value: T[] | bigint = 0n) {
    if (typeof value === "bigint") {
      this.#bitfield = value;
    } else if (Array.isArray(value)) {
      this.#bitfield = value.reduce((acc, val) => acc | this.#resolve(val), 0n);
    } else {
      throw new TypeError("Initial value must be a bigint or an array of flags");
    }
  }

  static from<F>(value: BitFieldManager<F> | F[] | bigint): BitFieldManager<F> {
    if (value instanceof BitFieldManager) {
      return new BitFieldManager(value.valueOf());
    }
    return new BitFieldManager(value);
  }

  has(val: T): boolean {
    const bit = this.#resolve(val);
    return (this.#bitfield & bit) === bit;
  }

  hasAll(flags: T[]): boolean {
    return flags.every((flag) => this.has(flag));
  }

  hasAny(flags: T[]): boolean {
    return flags.some((flag) => this.has(flag));
  }

  add(...flags: T[]): this {
    for (const flag of flags) {
      this.#bitfield |= this.#resolve(flag);
    }
    return this;
  }

  remove(...flags: T[]): this {
    for (const flag of flags) {
      this.#bitfield &= ~this.#resolve(flag);
    }
    return this;
  }

  toggle(...flags: T[]): this {
    for (const flag of flags) {
      this.#bitfield ^= this.#resolve(flag);
    }
    return this;
  }

  valueOf(): bigint {
    return this.#bitfield;
  }

  #resolve(value: BitFieldResolvable<T> | BitFieldResolvable<T>[]): bigint {
    if (Array.isArray(value)) {
      return value.reduce<bigint>((acc, val) => acc | this.#resolve(val), 0n);
    }

    if (typeof value === "bigint") {
      if (value < 0n) {
        throw new TypeError("Bitfield value cannot be negative");
      }

      return value;
    }

    if (typeof value === "number") {
      if (!Number.isInteger(value) || value < 0) {
        throw new TypeError("Number must be a non-negative integer");
      }

      return BigInt(value);
    }

    if (typeof value === "string") {
      return this.#assertValidBigInt(value);
    }

    throw new TypeError("Invalid type for bitfield value");
  }

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
      if (result < 0n) {
        throw new Error("BigInt must be non-negative for bitfield operations");
      }
      return result;
    } catch (error) {
      throw new Error(
        `Failed to create BigInt: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
