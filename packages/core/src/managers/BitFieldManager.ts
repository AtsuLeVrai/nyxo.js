export type BitFieldResolvable<T> =
  | (T | bigint | `${bigint}`)[]
  | BitFieldManager<T>
  | T
  | bigint
  | `${bigint}`;

export class BitFieldManager<T> {
  static readonly BIGINT_REGEX = /^-?\d+$/;

  readonly #bitfield: bigint;

  constructor(value: BitFieldResolvable<T> = 0n) {
    this.#bitfield = this.#resolve(value);
  }

  static from<F>(value: BitFieldResolvable<F>): BitFieldManager<F> {
    return new BitFieldManager(value);
  }

  static isValid(value: unknown): value is bigint {
    try {
      new BitFieldManager(value);
      return true;
    } catch {
      return false;
    }
  }

  static combine<F>(...bitfields: BitFieldResolvable<F>[]): BitFieldManager<F> {
    return new BitFieldManager<F>(
      bitfields.reduce<bigint>(
        (acc, bf) => acc | new BitFieldManager(bf).valueOf(),
        0n,
      ),
    );
  }

  has(val: T): boolean {
    const bit = this.#resolve(val);
    return (this.#bitfield & bit) === bit;
  }

  hasAll(flags: T[]): boolean {
    const bits = this.#resolve(flags);
    return (this.#bitfield & bits) === bits;
  }

  hasAny(flags: T[]): boolean {
    const bits = this.#resolve(flags);
    return (this.#bitfield & bits) !== 0n;
  }

  isEmpty(): boolean {
    return this.#bitfield === 0n;
  }

  equals(other: BitFieldResolvable<T>): boolean {
    return this.#bitfield === this.#resolve(other);
  }

  add(...flags: T[]): this {
    this.#setBitfield(this.#bitfield | this.#resolve(flags));
    return this;
  }

  remove(...flags: T[]): this {
    this.#setBitfield(this.#bitfield & ~this.#resolve(flags));
    return this;
  }

  toggle(...flags: T[]): this {
    this.#setBitfield(this.#bitfield ^ this.#resolve(flags));
    return this;
  }

  clear(): this {
    this.#setBitfield(0n);
    return this;
  }

  clone(): BitFieldManager<T> {
    return new BitFieldManager<T>(this.#bitfield);
  }

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

  count(): number {
    return this.toArray().length;
  }

  toString(radix = 16): string {
    return this.#bitfield.toString(radix);
  }

  toBinaryString(): string {
    return this.#bitfield.toString(2);
  }

  valueOf(): bigint {
    return this.#bitfield;
  }

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

  #validateBigInt(value: bigint): bigint {
    if (value < 0n) {
      throw new TypeError("Bitfield value cannot be negative");
    }
    return value;
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
      return this.#validateBigInt(result);
    } catch (error) {
      throw new Error(
        `Failed to create BigInt: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  #setBitfield(value: bigint): void {
    Object.defineProperty(this, "#bitfield", {
      value: this.#validateBigInt(value),
      writable: true,
      configurable: false,
    });
  }
}
