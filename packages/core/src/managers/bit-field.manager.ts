export type BitFieldResolvable<T = unknown> =
  | bigint
  | number
  | BitFieldManager<T>
  | T;

const MAX_BIT_VALUE = (1n << 64n) - 1n;

export class BitFieldManager<T> {
  #bitfield: bigint;

  constructor(value: BitFieldResolvable<T> | BitFieldResolvable<T>[] = 0n) {
    this.#bitfield = this.#resolve(value);
  }

  static from<F>(
    value: BitFieldResolvable<F> | BitFieldResolvable<F>[],
  ): BitFieldManager<F> {
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

  static intersection<F>(
    ...bitfields: BitFieldResolvable<F>[]
  ): BitFieldManager<F> {
    return new BitFieldManager<F>(
      bitfields.reduce<bigint>(
        (acc, bf) => acc & new BitFieldManager(bf).valueOf(),
        ~0n,
      ),
    );
  }

  static xor<F>(...bitfields: BitFieldResolvable<F>[]): BitFieldManager<F> {
    return new BitFieldManager<F>(
      bitfields.reduce<bigint>(
        (acc, bf) => acc ^ new BitFieldManager(bf).valueOf(),
        0n,
      ),
    );
  }

  static deserialize<F>(value: string): BitFieldManager<F> {
    try {
      return new BitFieldManager<F>(BigInt(value));
    } catch {
      throw new Error("Invalid serialized BitField");
    }
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

  hasExactly(...flags: T[]): boolean {
    const bits = this.#resolve(flags);
    return this.#bitfield === bits;
  }

  missing(flags: T[]): bigint[] {
    const bits = this.#resolve(flags);
    return BitFieldManager.from(bits & ~this.#bitfield).toArray();
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

  set(flags: T[]): this {
    this.#setBitfield(this.#resolve(flags));
    return this;
  }

  clear(): this {
    this.#setBitfield(0n);
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
      flags: this.toArray().map((bit) => bit.toString()),
    };
  }

  count(): number {
    let count = 0;
    let value = this.#bitfield;

    while (value > 0n) {
      count += Number(value & 1n);
      value >>= 1n;
    }

    return count;
  }

  toString(radix = 16): string {
    return this.#bitfield.toString(radix);
  }

  toBinaryString(): string {
    return this.#bitfield.toString(2);
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

    if (n < 0) {
      return this.rotateRight(-n);
    }

    const bits = BigInt(n);
    const newValue =
      (this.#bitfield << bits) | (this.#bitfield >> (64n - bits));

    return new BitFieldManager<T>(newValue);
  }

  rotateRight(n: number): BitFieldManager<T> {
    if (n < 0) {
      return this.rotateLeft(-n);
    }
    const bits = BigInt(n);
    const newValue =
      (this.#bitfield >> bits) | (this.#bitfield << (64n - bits));

    return new BitFieldManager<T>(newValue);
  }

  leadingZeros(): number {
    let count = 0;
    let value = this.#bitfield;

    while (value > 0n) {
      value >>= 1n;
      count++;
    }

    return 64 - count;
  }

  trailingZeros(): number {
    if (this.#bitfield === 0n) {
      return 64;
    }

    return Number((this.#bitfield & -this.#bitfield).toString(2).length - 1);
  }

  getMostSignificantBit(): bigint {
    if (this.#bitfield === 0n) {
      return 0n;
    }

    return 1n << BigInt(64 - this.leadingZeros() - 1);
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
    const otherBits = this.#resolve(other);
    return new BitFieldManager<T>(this.#bitfield & ~otherBits);
  }

  intersects(other: BitFieldResolvable<T>): boolean {
    const otherBits = this.#resolve(other);
    return (this.#bitfield & otherBits) !== 0n;
  }

  isSubset(other: BitFieldResolvable<T>): other is BitFieldManager<T> {
    const otherBits = this.#resolve(other);
    return (this.#bitfield & otherBits) === this.#bitfield;
  }

  isSuperset(other: BitFieldResolvable<T>): other is BitFieldManager<T> {
    const otherBits = this.#resolve(other);
    return (this.#bitfield & otherBits) === otherBits;
  }

  hammingDistance(other: BitFieldResolvable<T>): number {
    const otherBits = this.#resolve(other);
    let distance = this.#bitfield ^ otherBits;
    let count = 0;

    while (distance > 0n) {
      if (distance & 1n) {
        count++;
      }
      distance >>= 1n;
    }

    return count;
  }

  mask(start: number, end: number): BitFieldManager<T> {
    if (!Number.isInteger(start) || start < 0 || start >= 64) {
      throw new RangeError("Start position must be between 0 and 63");
    }
    if (!Number.isInteger(end) || end < 0 || end >= 64) {
      throw new RangeError("End position must be between 0 and 63");
    }
    if (start >= end) {
      throw new RangeError("Start position must be less than end position");
    }

    const mask = ((1n << BigInt(end - start)) - 1n) << BigInt(start);
    return new BitFieldManager<T>(this.#bitfield & mask);
  }

  setBit(position: number): this {
    if (!Number.isInteger(position) || position < 0 || position >= 64) {
      throw new RangeError("Bit position must be between 0 and 63");
    }

    this.#setBitfield(this.#bitfield | (1n << BigInt(position)));
    return this;
  }

  clearBit(position: number): this {
    if (!Number.isInteger(position) || position < 0 || position >= 64) {
      throw new RangeError("Bit position must be between 0 and 63");
    }

    this.#setBitfield(this.#bitfield & ~(1n << BigInt(position)));
    return this;
  }

  toggleBit(position: number): this {
    if (!Number.isInteger(position) || position < 0 || position >= 64) {
      throw new RangeError("Bit position must be between 0 and 63");
    }

    this.#setBitfield(this.#bitfield ^ (1n << BigInt(position)));
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

    if (pos1 === pos2) {
      return this;
    }

    const bit1 = (this.#bitfield >> BigInt(pos1)) & 1n;
    const bit2 = (this.#bitfield >> BigInt(pos2)) & 1n;

    if (bit1 !== bit2) {
      const mask = (1n << BigInt(pos1)) | (1n << BigInt(pos2));
      this.#setBitfield(this.#bitfield ^ mask);
    }

    return this;
  }

  *[Symbol.iterator](): Iterator<bigint> {
    yield* this.toArray();
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

    throw new TypeError(`Invalid type for bitfield value: ${typeof value}`);
  }

  #validateBigInt(value: bigint): bigint {
    if (value < 0n) {
      throw new TypeError("Bitfield value cannot be negative");
    }

    if (value > MAX_BIT_VALUE) {
      throw new TypeError("Bitfield value exceeds maximum safe integer");
    }

    return value;
  }

  #setBitfield(value: bigint): void {
    this.#bitfield = this.#validateBigInt(value);
  }
}
