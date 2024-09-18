export type BitfieldResolvable<T extends string> =
    | (T | bigint | `${bigint}`)[]
    | Bitfield<T>
    | T
    | bigint
    | `${bigint}`;

export class Bitfield<T extends string> {
    public static defaultBit = 0n;

    public static Flags: Record<string, bigint>;

    public constructor(public bitfield: bigint = Bitfield.defaultBit) {
        this.bitfield = bitfield;
    }

    public static resolve<S extends string>(bit: BitfieldResolvable<S>): bigint {
        if (typeof bit === "bigint") {
            return bit;
        }

        if (bit instanceof Bitfield) {
            return bit.bitfield;
        }

        if (Array.isArray(bit)) {
            return bit.map((part) => this.resolve(part)).reduce((prev, part) => prev | part, 0n);
        }

        if (typeof bit === "string") {
            if (typeof BigInt(bit) === "bigint") {
                return BigInt(bit);
            }

            return 1n << BigInt(Object.keys(this.Flags).indexOf(bit));
        }

        throw new TypeError("BITFIELD_INVALID");
    }

    public has(bit: BitfieldResolvable<T>): boolean {
        if (Array.isArray(bit)) {
            return bit.every((b) => this.has(b));
        }

        const bits = Bitfield.resolve(bit);
        return (this.bitfield & bits) === bits;
    }

    public add(...bits: BitfieldResolvable<T>[]): this {
        let total = 0n;
        for (const bit of bits) {
            total |= Bitfield.resolve(bit);
        }

        this.bitfield |= total;
        return this;
    }

    public remove(...bits: BitfieldResolvable<T>[]): this {
        let total = 0n;
        for (const bit of bits) {
            total |= Bitfield.resolve(bit);
        }

        this.bitfield &= ~total;
        return this;
    }

    public toArray(): T[] {
        return Object.keys(Bitfield.Flags).filter((bit) => this.has(bit as T)) as T[];
    }

    public toJSON(): Record<T, boolean> {
        const result = {} as Record<T, boolean>;
        for (const [flag, bit] of Object.entries(Bitfield.Flags)) {
            result[flag as T] = this.has(bit);
        }

        return result;
    }

    public valueOf(): bigint {
        return this.bitfield;
    }

    public *[Symbol.iterator](): Generator<T, void, unknown> {
        yield* this.toArray();
    }
}
