export type BitFieldValue = bigint | number | string;

export type BitFieldResolvable<T = unknown> =
  | BitFieldValue
  | T
  | BitField<T>
  | BitFieldResolvable<T>[];

const MAX_BIT_VALUE = (1n << 64n) - 1n;

export class BitField<T> {
  #bitfield: bigint;
  constructor(...bits: BitFieldResolvable<T>[]) {
    this.#bitfield = bits.length > 0 ? BitField.resolve<T>(...bits) : 0n;
  }
  static from<F>(...bits: BitFieldResolvable<F>[]): BitField<F> {
    return new BitField<F>(...bits);
  }
  static safeBigInt(value: unknown): bigint {
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
    if (typeof value === "string") {
      let bigintValue: bigint;
      try {
        bigintValue = BigInt(value);
      } catch {
        throw new Error("BitField string must be convertible to a valid bigint");
      }
      if (bigintValue < 0n || bigintValue > MAX_BIT_VALUE) {
        throw new Error("BitField value must be within 64-bit range");
      }
      return bigintValue;
    }
    throw new Error("Value must be a bigint, number, or string");
  }
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
        throw new Error(`Could not resolve ${String(bit)} to a BitField value: ${String(error)}`);
      }
    }, 0n);
  }
  static isValid(value: unknown): value is BitFieldValue {
    if (value == null) {
      return false;
    }
    if (typeof value === "bigint") {
      return value >= 0n && value <= MAX_BIT_VALUE;
    }
    if (typeof value === "number") {
      return Number.isInteger(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER;
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
  static combine<F>(...bitfields: BitFieldResolvable<F>[]): BitField<F> {
    return new BitField<F>(
      bitfields.reduce<bigint>((acc, bf) => acc | BitField.resolve<F>(bf), 0n),
    );
  }
  static intersection<F>(...bitfields: BitFieldResolvable<F>[]): BitField<F> {
    if (bitfields.length === 0) {
      return new BitField<F>();
    }
    const first = BitField.resolve<F>(bitfields[0] ?? 0n);
    return new BitField<F>(
      bitfields.slice(1).reduce<bigint>((acc, bf) => acc & BitField.resolve<F>(bf), first),
    );
  }
  has(bits: BitFieldResolvable<T>): boolean {
    const bitsToCheck = BitField.resolve<T>(bits);
    return (this.#bitfield & bitsToCheck) === bitsToCheck;
  }
  hasAny(...bits: BitFieldResolvable<T>[]): boolean {
    const bitsToCheck = BitField.resolve<T>(...bits);
    return (this.#bitfield & bitsToCheck) !== 0n;
  }
  isEmpty(): boolean {
    return this.#bitfield === 0n;
  }
  equals(other: BitFieldResolvable<T>): boolean {
    return this.#bitfield === BitField.resolve<T>(other);
  }
  add(...bits: BitFieldResolvable<T>[]): this {
    this.#bitfield |= BitField.resolve<T>(...bits);
    return this;
  }
  remove(...bits: BitFieldResolvable<T>[]): this {
    this.#bitfield &= ~BitField.resolve<T>(...bits);
    return this;
  }
  toggle(...bits: BitFieldResolvable<T>[]): this {
    this.#bitfield ^= BitField.resolve<T>(...bits);
    return this;
  }
  clear(): this {
    this.#bitfield = 0n;
    return this;
  }
  clone(): BitField<T> {
    return new BitField<T>(this.#bitfield);
  }
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
  toString(radix = 10): string {
    return this.#bitfield.toString(radix);
  }
  valueOf(): bigint {
    return this.#bitfield;
  }
  *[Symbol.iterator](): Iterator<bigint> {
    yield* this.toArray();
  }
}
