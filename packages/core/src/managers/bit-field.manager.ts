export type BitFieldResolvable<T = unknown> =
  | bigint
  | number
  | BitFieldManager<T>
  | T;

const MAX_BIT_VALUE = (1n << 64n) - 1n;

function validateBigInt(value: bigint): bigint {
  if (value < 0n) {
    throw new TypeError("Bitfield value cannot be negative");
  }

  if (value > MAX_BIT_VALUE) {
    throw new TypeError("Bitfield value exceeds maximum safe integer");
  }

  return value;
}

export class BitFieldManager<T> {
  #bitfield: bigint;

  constructor(value: BitFieldResolvable<T> | BitFieldResolvable<T>[] = 0n) {
    this.#bitfield = BitFieldManager.resolve(value);
  }

  static from<F>(
    value: BitFieldResolvable<F> | BitFieldResolvable<F>[],
  ): BitFieldManager<F> {
    return new BitFieldManager(value);
  }

  static isValid(value: unknown): value is bigint {
    try {
      BitFieldManager.resolve(value);
      return true;
    } catch {
      return false;
    }
  }

  static combine<F>(...bitfields: BitFieldResolvable<F>[]): BitFieldManager<F> {
    return new BitFieldManager<F>(
      bitfields.reduce<bigint>(
        (acc, bf) => acc | BitFieldManager.resolve(bf),
        0n,
      ),
    );
  }

  static intersection<F>(
    ...bitfields: BitFieldResolvable<F>[]
  ): BitFieldManager<F> {
    return new BitFieldManager<F>(
      bitfields.reduce<bigint>(
        (acc, bf) => acc & BitFieldManager.resolve(bf),
        ~0n,
      ),
    );
  }

  static xor<F>(...bitfields: BitFieldResolvable<F>[]): BitFieldManager<F> {
    return new BitFieldManager<F>(
      bitfields.reduce<bigint>(
        (acc, bf) => acc ^ BitFieldManager.resolve(bf),
        0n,
      ),
    );
  }

  static deserialize<F>(value: string): BitFieldManager<F> {
    try {
      return new BitFieldManager<F>(BigInt(value));
    } catch (error) {
      throw new Error("Invalid serialized BitField", { cause: error });
    }
  }

  static resolve<F>(
    value: BitFieldResolvable<F> | BitFieldResolvable<F>[],
  ): bigint {
    if (value instanceof BitFieldManager) {
      return value.valueOf();
    }

    if (Array.isArray(value)) {
      return value.reduce<bigint>(
        (acc, val) => acc | BitFieldManager.resolve(val),
        0n,
      );
    }

    if (typeof value === "bigint") {
      return validateBigInt(value);
    }

    if (typeof value === "number") {
      if (!Number.isInteger(value) || value < 0) {
        throw new TypeError("Number must be a non-negative integer");
      }
      return validateBigInt(BigInt(value));
    }

    throw new TypeError(`Invalid type for bitfield value: ${typeof value}`);
  }

  has(val: T): boolean {
    const bit = BitFieldManager.resolve(val);
    return (this.#bitfield & bit) === bit;
  }

  hasAll(flags: T[]): boolean {
    const bits = BitFieldManager.resolve(flags);
    return (this.#bitfield & bits) === bits;
  }

  hasAny(flags: T[]): boolean {
    const bits = BitFieldManager.resolve(flags);
    return (this.#bitfield & bits) !== 0n;
  }

  hasExactly(...flags: T[]): boolean {
    const bits = BitFieldManager.resolve(flags);
    return this.#bitfield === bits;
  }

  missing(flags: T[]): bigint[] {
    const bits = BitFieldManager.resolve(flags);
    return BitFieldManager.from(bits & ~this.#bitfield).toArray();
  }

  isEmpty(): boolean {
    return this.#bitfield === 0n;
  }

  equals(other: BitFieldResolvable<T>): boolean {
    return this.#bitfield === BitFieldManager.resolve(other);
  }

  add(...flags: T[]): this {
    this.#bitfield = validateBigInt(
      this.#bitfield | BitFieldManager.resolve(flags),
    );
    return this;
  }

  remove(...flags: T[]): this {
    this.#bitfield = validateBigInt(
      this.#bitfield & ~BitFieldManager.resolve(flags),
    );
    return this;
  }

  toggle(...flags: T[]): this {
    this.#bitfield = validateBigInt(
      this.#bitfield ^ BitFieldManager.resolve(flags),
    );
    return this;
  }

  set(flags: T[]): this {
    this.#bitfield = BitFieldManager.resolve(flags);
    return this;
  }

  clear(): this {
    this.#bitfield = 0n;
    return this;
  }

  freeze(): BitFieldManager<T> {
    return new BitFieldManager<T>(this.#bitfield);
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

  toJson(): { bitfield: string; flags: string[] } {
    return {
      bitfield: this.serialize(),
      flags: this.toArray().map(String),
    };
  }

  count(): number {
    return this.getSetBitPositions().length;
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

  rotateLeft(n: number): BitFieldManager<T> {
    if (!Number.isInteger(n)) {
      throw new TypeError("Rotation amount must be an integer");
    }

    const normalizedN = n < 0 ? -n : n;
    const bits = BigInt(normalizedN % 64);
    const newValue =
      n < 0
        ? (this.#bitfield >> bits) | (this.#bitfield << (64n - bits))
        : (this.#bitfield << bits) | (this.#bitfield >> (64n - bits));

    return new BitFieldManager<T>(newValue);
  }

  rotateRight(n: number): BitFieldManager<T> {
    return this.rotateLeft(-n);
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
    return new BitFieldManager<T>(
      this.#bitfield & ~BitFieldManager.resolve(other),
    );
  }

  intersects(other: BitFieldResolvable<T>): boolean {
    return (this.#bitfield & BitFieldManager.resolve(other)) !== 0n;
  }

  isSubset(other: BitFieldResolvable<T>): other is BitFieldManager<T> {
    const otherBits = BitFieldManager.resolve(other);
    return (this.#bitfield & otherBits) === this.#bitfield;
  }

  isSuperset(other: BitFieldResolvable<T>): other is BitFieldManager<T> {
    const otherBits = BitFieldManager.resolve(other);
    return (this.#bitfield & otherBits) === otherBits;
  }

  hammingDistance(other: BitFieldResolvable<T>): number {
    const distance = this.#bitfield ^ BitFieldManager.resolve(other);
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
