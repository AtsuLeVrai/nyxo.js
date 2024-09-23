/**
 * Represents a value that can be resolved to a bitfield.
 * It can be an array of T, bigint, or string representations of bigint,
 * an instance of BitfieldManager, a single T, a bigint, or a string representation of a bigint.
 */
export type BitfieldResolvable<T> = (T | bigint | `${bigint}`)[] | BitfieldManager<T> | T | bigint | `${bigint}`;

/**
 * Symbol used as a key for the internal bitfield value.
 */
const bitfield = Symbol("bitfield");

/**
 * Symbol used as a key for the static flags map.
 */
const flags = Symbol("flags");

/**
 * A class that manages bitfields with type-safe flag operations.
 */
export class BitfieldManager<T> {
    /**
     * A map of flag names to their corresponding bit values.
     */
    private static readonly [flags]: Map<string, bigint> = new Map();

    /**
     * The internal bitfield value.
     */
    private [bitfield]: bigint;

    /**
     * Creates a new BitfieldManager instance.
     *
     * @param initialValue - The initial value of the bitfield. Can be an array of flags or a bigint.
     * @throws TypeError If the initial value is neither a bigint nor an array of flags.
     */
    public constructor(initialValue: T[] | bigint = 0n) {
        if (typeof initialValue === "bigint") {
            this[bitfield] = initialValue;
        } else if (Array.isArray(initialValue)) {
            this[bitfield] = initialValue.reduce((acc, flag) => acc | this.getBit(flag), 0n);
        } else {
            throw new TypeError("Initial value must be a bigint or an array of flags");
        }
    }

    /**
     * Defines a set of flags for use with BitfieldManager instances.
     *
     * @param newFlags - An array of flag names to be defined.
     * @throws Error If a flag is already defined.
     */
    public static defineFlags<F extends string>(newFlags: F[]): void {
        for (const [index, flag] of newFlags.entries()) {
            if (this[flags].has(flag)) {
                throw new Error(`Flag ${flag} is already defined`);
            }

            this[flags].set(flag, 1n << BigInt(index));
        }
    }

    /**
     * Creates a new BitfieldManager instance from various input types.
     *
     * @param value - The value to create the BitfieldManager from.
     * @returns A new BitfieldManager instance.
     */
    public static from<F>(value: BitfieldManager<F> | F[] | bigint): BitfieldManager<F> {
        if (value instanceof BitfieldManager) {
            return new BitfieldManager(value.valueOf());
        }

        return new BitfieldManager(value);
    }

    /**
     * Checks if the bitfield has a specific flag set.
     *
     * @param flag - The flag to check for.
     * @returns True if the flag is set, false otherwise.
     */
    public has(flag: T): boolean {
        const bit = this.getBit(flag);
        return (this[bitfield] & bit) === bit;
    }

    /**
     * Adds one or more flags to the bitfield.
     *
     * @param flags - The flags to add.
     * @returns The BitfieldManager instance for chaining.
     */
    public add(...flags: T[]): this {
        this[bitfield] |= flags.reduce((acc, flag) => acc | this.getBit(flag), 0n);
        return this;
    }

    /**
     * Removes one or more flags from the bitfield.
     *
     * @param flags - The flags to remove.
     * @returns The BitfieldManager instance for chaining.
     */
    public remove(...flags: T[]): this {
        this[bitfield] &= ~flags.reduce((acc, flag) => acc | this.getBit(flag), 0n);
        return this;
    }

    /**
     * Toggles one or more flags in the bitfield.
     *
     * @param flags - The flags to toggle.
     * @returns The BitfieldManager instance for chaining.
     */
    public toggle(...flags: T[]): this {
        this[bitfield] ^= flags.reduce((acc, flag) => acc | this.getBit(flag), 0n);
        return this;
    }

    /**
     * Clears all flags in the bitfield.
     *
     * @returns The BitfieldManager instance for chaining.
     */
    public clear(): this {
        this[bitfield] = 0n;
        return this;
    }

    /**
     * Converts the bitfield to an array of set flags.
     *
     * @returns An array of flag names that are set in the bitfield.
     */
    public toArray(): T[] {
        return Array.from(BitfieldManager[flags].entries())
            .filter(([, bit]) => (this[bitfield] & bit) === bit)
            .map(([flag]) => flag as T);
    }

    /**
     * Gets the raw bigint value of the bitfield.
     *
     * @returns The bigint value of the bitfield.
     */
    public valueOf(): bigint {
        return this[bitfield];
    }

    /**
     * Converts the bitfield to a string representation.
     *
     * @returns A string representation of the bitfield's bigint value.
     */
    public toString(): string {
        return this[bitfield].toString();
    }

    /**
     * Implements the iterable protocol for the bitfield.
     */
    public *[Symbol.iterator](): Generator<T, void, unknown> {
        yield* this.toArray();
    }

    /**
     * Gets the bit value for a given flag.
     *
     * @param flag - The flag to get the bit value for.
     * @returns The bigint bit value for the flag.
     * @throws Error If the flag is not defined.
     */
    private getBit(flag: T): bigint {
        const bit = BitfieldManager[flags].get(flag as string);
        if (bit === undefined) {
            throw new Error(`Unknown flag: ${flag}`);
        }

        return bit;
    }
}
