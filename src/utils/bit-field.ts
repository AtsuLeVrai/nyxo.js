export type BitValue = number | bigint | string;

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

const resolve = <F extends BitValue>(...bits: F[]): bigint =>
  bits.reduce((acc, bit) => {
    if (bit == null) return acc;
    return acc | safeBigInt(bit);
  }, 0n);

export class BitField<T extends BitValue> {
  private bitfield: bigint;

  constructor(...bits: (T | undefined)[]) {
    this.bitfield = bits.length > 0 ? resolve(...bits.filter((bit): bit is T => bit != null)) : 0n;
  }

  static combine<F extends BitValue>(...bitfields: F[]): BitField<F> {
    return new BitField(resolve(...bitfields)) as BitField<F>;
  }

  has(bits: T): boolean {
    const bitsToCheck = resolve(bits);
    return (this.bitfield & bitsToCheck) === bitsToCheck;
  }

  hasAny(...bits: T[]): boolean {
    const bitsToCheck = resolve(...bits);
    return (this.bitfield & bitsToCheck) !== 0n;
  }

  equals(other: T): boolean {
    return this.bitfield === resolve(other);
  }

  add(...bits: T[]): this {
    this.bitfield |= resolve(...bits);
    return this;
  }

  remove(...bits: T[]): this {
    this.bitfield &= ~resolve(...bits);
    return this;
  }

  toggle(...bits: T[]): this {
    this.bitfield ^= resolve(...bits);
    return this;
  }

  clone(): BitField<T> {
    return new BitField(this.bitfield) as BitField<T>;
  }

  toString(radix = 10): string {
    return this.bitfield.toString(radix);
  }

  valueOf(): bigint {
    return this.bitfield;
  }

  toBinary(): string {
    return this.bitfield.toString(2).padStart(64, "0");
  }

  toArray(): bigint[] {
    const result: bigint[] = [];
    let bit = 1n;
    while (bit <= this.bitfield) {
      if (this.bitfield & bit) result.push(bit);
      bit <<= 1n;
    }
    return result;
  }

  inspect(): string {
    return `BitField(${this.bitfield}n) [${this.toBinary()}]`;
  }

  isEmpty(): boolean {
    return this.bitfield === 0n;
  }

  count(): number {
    return this.toBinary().split("1").length - 1;
  }
}
