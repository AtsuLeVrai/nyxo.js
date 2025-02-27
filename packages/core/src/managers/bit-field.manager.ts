export type BitFieldResolvable<T = unknown> =
  | bigint
  | number
  | string
  | BitFieldManager<T>
  | T;

const MAX_BIT_VALUE = (1n << 64n) - 1n;

function validateBigInt(value: bigint): bigint {
  if (value < 0n) {
    throw new RangeError("BitField values cannot be negative");
  }

  return value & MAX_BIT_VALUE;
}

function resolve<T>(...bits: BitFieldResolvable<T>[]): bigint {
  return bits.reduce<bigint>((acc, bit) => {
    if (bit == null) {
      return acc;
    }

    if (bit instanceof BitFieldManager) {
      return acc | bit.valueOf();
    }

    if (typeof bit === "bigint") {
      return acc | validateBigInt(bit);
    }

    if (typeof bit === "number") {
      if (!Number.isInteger(bit) || bit < 0 || bit > Number.MAX_SAFE_INTEGER) {
        throw new RangeError("Invalid number value for BitField resolution");
      }
      return acc | BigInt(bit);
    }

    if (typeof bit === "string") {
      try {
        const bigintValue = BigInt(bit);
        return acc | validateBigInt(bigintValue);
      } catch {
        throw new Error(
          `Could not resolve string "${bit}" to a BitField value`,
        );
      }
    }

    if (Array.isArray(bit)) {
      return acc | resolve(...bit);
    }

    throw new TypeError(`Could not resolve ${String(bit)} to a BitField value`);
  }, 0n);
}

export class BitFieldManager<T> {
  #bitfield: bigint;

  constructor(...values: BitFieldResolvable<T>[]) {
    this.#bitfield = values.length > 0 ? resolve(...values) : 0n;
  }

  static from<F>(...values: BitFieldResolvable<F>[]): BitFieldManager<F> {
    return new BitFieldManager(...values);
  }

  static isValidBitField(value: unknown): boolean {
    if (value instanceof BitFieldManager) {
      return true;
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
      return value.every((item) => BitFieldManager.isValidBitField(item));
    }

    return false;
  }

  static combine<F>(...bitfields: BitFieldResolvable<F>[]): BitFieldManager<F> {
    return new BitFieldManager<F>(
      bitfields.reduce<bigint>((acc, bf) => acc | resolve(bf), 0n),
    );
  }

  static intersection<F>(
    ...bitfields: BitFieldResolvable<F>[]
  ): BitFieldManager<F> {
    return new BitFieldManager<F>(
      bitfields.reduce<bigint>((acc, bf) => acc & resolve(bf), ~0n),
    );
  }

  static xor<F>(...bitfields: BitFieldResolvable<F>[]): BitFieldManager<F> {
    return new BitFieldManager<F>(
      bitfields.reduce<bigint>((acc, bf) => acc ^ resolve(bf), 0n),
    );
  }

  static deserialize<F>(value: string): BitFieldManager<F> {
    try {
      return new BitFieldManager<F>(BigInt(value));
    } catch (error) {
      throw new Error("Invalid serialized BitField", { cause: error });
    }
  }

  has(val: T): boolean {
    const bit = resolve(val);
    return (this.#bitfield & bit) === bit;
  }

  hasAll(...flags: T[]): boolean {
    const bits = resolve(...flags);
    return (this.#bitfield & bits) === bits;
  }

  hasAny(...flags: T[]): boolean {
    const bits = resolve(...flags);
    return (this.#bitfield & bits) !== 0n;
  }

  missing(...flags: T[]): bigint[] {
    const bits = resolve(...flags);
    return BitFieldManager.from(bits & ~this.#bitfield).toArray();
  }

  isEmpty(): boolean {
    return this.#bitfield === 0n;
  }

  equals(other: BitFieldResolvable<T>): boolean {
    return this.#bitfield === resolve(other);
  }

  add(...flags: T[]): this {
    this.#bitfield = validateBigInt(this.#bitfield | resolve(...flags));
    return this;
  }

  remove(...flags: T[]): this {
    this.#bitfield = validateBigInt(this.#bitfield & ~resolve(...flags));
    return this;
  }

  toggle(...flags: T[]): this {
    this.#bitfield = validateBigInt(this.#bitfield ^ resolve(...flags));
    return this;
  }

  set(...flags: T[]): this {
    this.#bitfield = validateBigInt(resolve(...flags));
    return this;
  }

  clear(): this {
    this.#bitfield = 0n;
    return this;
  }

  clone(): BitFieldManager<T> {
    return new BitFieldManager<T>(this.#bitfield);
  }

  toArray(): bigint[] {
    const result: bigint[] = [];
    let value = this.#bitfield;
    let position = 0n;

    while (value > 0n) {
      if (value & 1n) {
        result.push(1n << position);
      }
      value >>= 1n;
      position++;
    }

    return result;
  }

  toString(radix = 16): string {
    return this.#bitfield.toString(radix);
  }

  toBinaryString(): string {
    return this.toString(2);
  }

  toNumber(): number {
    return Number(this.#bitfield);
  }

  valueOf(): bigint {
    return this.#bitfield;
  }

  leadingZeros(): number {
    let count = 0;
    const value = this.#bitfield;

    for (let i = 63; i >= 0; i--) {
      if ((value & (1n << BigInt(i))) === 0n) {
        count++;
      } else {
        break;
      }
    }

    return count;
  }

  trailingZeros(): number {
    if (this.#bitfield === 0n) {
      return 64;
    }

    let count = 0;
    let value = this.#bitfield;

    while ((value & 1n) === 0n) {
      count++;
      value >>= 1n;
    }

    return count;
  }

  getMostSignificantBit(): bigint {
    return this.#bitfield === 0n ? 0n : 1n << BigInt(this.bitLength() - 1);
  }

  getLeastSignificantBit(): bigint {
    if (this.#bitfield === 0n) {
      return 0n;
    }

    return 1n << BigInt(this.trailingZeros());
  }

  bitLength(): number {
    return 64 - this.leadingZeros();
  }

  isBitSet(position: number): position is number {
    if (!Number.isInteger(position) || position < 0 || position >= 64) {
      throw new RangeError("Bit position must be between 0 and 63");
    }

    return (this.#bitfield & (1n << BigInt(position))) !== 0n;
  }

  serialize(): string {
    return this.#bitfield.toString();
  }

  difference(other: BitFieldResolvable<T>): BitFieldManager<T> {
    return new BitFieldManager<T>(this.#bitfield & ~resolve(other));
  }

  intersects(other: BitFieldResolvable<T>): boolean {
    return (this.#bitfield & resolve(other)) !== 0n;
  }

  isSubset(other: BitFieldResolvable<T>): boolean {
    const otherBits = resolve(other);
    return (this.#bitfield & otherBits) === this.#bitfield;
  }

  isSuperset(other: BitFieldResolvable<T>): boolean {
    const otherBits = resolve(other);
    return (this.#bitfield & otherBits) === otherBits;
  }

  hammingDistance(other: BitFieldResolvable<T>): number {
    const distance = this.#bitfield ^ resolve(other);
    return this.#getSetBitCount(distance);
  }

  mask(start: number, end: number): BitFieldManager<T> {
    if (
      !Number.isInteger(start) ||
      start < 0 ||
      start >= 64 ||
      !Number.isInteger(end) ||
      end < 0 ||
      end >= 64 ||
      start >= end
    ) {
      throw new RangeError("Invalid mask range. Must be 0 ≤ start < end < 64");
    }

    const mask = ((1n << BigInt(end - start)) - 1n) << BigInt(start);
    return new BitFieldManager<T>(this.#bitfield & mask);
  }

  setBit(position: number): this {
    if (!Number.isInteger(position) || position < 0 || position >= 64) {
      throw new RangeError("Bit position must be between 0 and 63");
    }

    this.#bitfield |= 1n << BigInt(position);
    return this;
  }

  clearBit(position: number): this {
    if (!Number.isInteger(position) || position < 0 || position >= 64) {
      throw new RangeError("Bit position must be between 0 and 63");
    }

    this.#bitfield &= ~(1n << BigInt(position));
    return this;
  }

  toggleBit(position: number): this {
    if (!Number.isInteger(position) || position < 0 || position >= 64) {
      throw new RangeError("Bit position must be between 0 and 63");
    }

    this.#bitfield ^= 1n << BigInt(position);
    return this;
  }

  getSetBitPositions(): number[] {
    const positions: number[] = [];
    let value = this.#bitfield;
    let position = 0;

    while (value > 0n) {
      if (value & 1n) {
        positions.push(position);
      }
      value >>= 1n;
      position++;
    }

    return positions;
  }

  swapBits(pos1: number, pos2: number): this {
    if (
      !Number.isInteger(pos1) ||
      pos1 < 0 ||
      pos1 >= 64 ||
      !Number.isInteger(pos2) ||
      pos2 < 0 ||
      pos2 >= 64
    ) {
      throw new RangeError("Bit positions must be between 0 and 63");
    }

    if (pos1 !== pos2) {
      const bit1 = (this.#bitfield >> BigInt(pos1)) & 1n;
      const bit2 = (this.#bitfield >> BigInt(pos2)) & 1n;
      if (bit1 !== bit2) {
        this.#bitfield ^= (1n << BigInt(pos1)) | (1n << BigInt(pos2));
      }
    }
    return this;
  }

  popCount(): number {
    return this.#getSetBitCount(this.#bitfield);
  }

  *[Symbol.iterator](): Iterator<bigint> {
    yield* this.toArray();
  }

  #getSetBitCount(value: bigint): number {
    let count = 0;
    let num = value;
    while (num > 0n) {
      count += Number(num & 1n);
      num >>= 1n;
    }
    return count;
  }
}
