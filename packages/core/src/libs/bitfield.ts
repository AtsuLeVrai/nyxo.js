/**
 * A type that represents a bitfield resolvable value.
 * It can be an array of strings, bigints, or template literals,
 * an instance of Bitfield, a string, a bigint, or a template literal.
 */
export type BitfieldResolvable<T> = (T | bigint | `${bigint}`)[] | Bitfield<T> | T | bigint | `${bigint}`;

/**
 * A class that represents a bitfield.
 */
export class Bitfield<T> {
    /**
     * The default bit value.
     */
    public static defaultBit = 0n;

    /**
     * A record of flag names to their corresponding bit values.
     */
    public static Flags: Record<string, bigint>;

    /**
     * Creates a new Bitfield instance.*
     */
    public constructor(public bitfield: bigint = Bitfield.defaultBit) {}

    /**
     * Resolves a bitfield resolvable value to a bigint.
     *
     * @param bit - The bitfield resolvable value.
     * @returns The resolved bigint value.
     * @throws If the bitfield resolvable value is invalid.
     */
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

    /**
     * Checks if the bitfield has all the bits in the given bitfield resolvable value.
     *
     * @param bit - The bitfield resolvable value.
     * @returns True if the bitfield has all the bits, false otherwise.
     */
    public has(bit: BitfieldResolvable<T>): boolean {
        if (Array.isArray(bit)) {
            return bit.every((b) => this.has(b));
        }

        const bits = Bitfield.resolve(bit as string);
        return (this.bitfield & bits) === bits;
    }

    /**
     * Adds the given bits to the bitfield.
     *
     * @param bits - The bits to add.
     * @returns The current Bitfield instance.
     */
    public add(...bits: BitfieldResolvable<T>[]): this {
        let total = 0n;
        for (const bit of bits) {
            total |= Bitfield.resolve(bit as string);
        }

        this.bitfield |= total;
        return this;
    }

    /**
     * Removes the given bits from the bitfield.
     *
     * @param bits - The bits to remove.
     * @returns The current Bitfield instance.
     */
    public remove(...bits: BitfieldResolvable<T>[]): this {
        let total = 0n;
        for (const bit of bits) {
            total |= Bitfield.resolve(bit as string);
        }

        this.bitfield &= ~total;
        return this;
    }

    /**
     * Converts the bitfield to an array of flag names.
     *
     * @returns An array of flag names.
     */
    public toArray(): T[] {
        return Object.keys(Bitfield.Flags).filter((bit) => this.has(bit as T)) as T[];
    }

    /**
     * Gets the value of the bitfield.
     *
     * @returns The value of the bitfield.
     */
    public valueOf(): bigint {
        return this.bitfield;
    }

    /**
     * An iterator for the bitfield.
     *
     * @returns A generator that yields the flag names.
     */
    public *[Symbol.iterator](): Generator<T, void, unknown> {
        yield* this.toArray();
    }
}
