/**
 * Discord Bitfield Management System
 *
 * Provides a robust and type-safe way to handle Discord's bitfield-based flags,
 * such as permissions, intents, and other binary flag combinations.
 *
 * @module BitfieldManager
 * @version 1.0.0
 */

/**
 * BitfieldResolvable Type
 *
 * Represents values that can be resolved into a bitfield.
 * Supports various input formats for maximum flexibility.
 *
 * @typeParam T - The type of the individual flags (usually an enum)
 *
 * Supported formats:
 * 1. Array of flags/bigints/strings
 * 2. Single flag/bigint/string
 * 3. BitfieldManager instance
 *
 * @example
 * ```typescript
 * // Using with Permissions
 * type PermissionResolvable = BitfieldResolvable<typeof Permissions>;
 *
 * // Valid inputs
 * const inputs: PermissionResolvable[] = [
 *   [Permissions.ADMIN, Permissions.BAN_MEMBERS], // Flag array
 *   8n,                                          // BigInt
 *   "8",                                         // String
 *   new BitfieldManager([Permissions.ADMIN])     // BitfieldManager
 * ];
 * ```
 */
export type BitfieldResolvable<T> = (T | bigint | `${bigint}`)[] | BitfieldManager<T> | T | bigint | `${bigint}`;

/**
 * Bitfield Management Class
 *
 * Provides a comprehensive system for managing binary flags with type safety.
 * Useful for handling Discord's permission systems, intents, and other bitfield-based features.
 *
 * Features:
 * - Type-safe flag operations
 * - Chainable methods
 * - Flexible input formats
 * - Error validation
 *
 * @typeParam T - The type of the flags being managed (usually an enum)
 *
 * @example
 * ```typescript
 * // Managing permissions
 * const permissions = new BitfieldManager([
 *   Permissions.VIEW_CHANNEL,
 *   Permissions.SEND_MESSAGES
 * ]);
 *
 * // Checking permissions
 * if (permissions.has(Permissions.ADMIN)) {
 *   console.log('Has admin permissions');
 * }
 *
 * // Chaining operations
 * permissions
 *   .add(Permissions.BAN_MEMBERS)
 *   .remove(Permissions.SEND_MESSAGES)
 *   .toggle(Permissions.MANAGE_ROLES);
 * ```
 */
export class BitfieldManager<T> {
    /**
     * Internal bitfield value
     * Stored as BigInt to handle large flag combinations
     * @private
     */
    #bitfield: bigint;

    /**
     * Creates a new BitfieldManager instance.
     *
     * @param value - Initial bitfield value
     * @throws {TypeError} If value is neither bigint nor flag array
     *
     * @example
     * ```typescript
     * // Initialize with flags
     * const flags = new BitfieldManager([Flag.A, Flag.B]);
     *
     * // Initialize with BigInt
     * const value = new BitfieldManager(8n);
     *
     * // Initialize empty
     * const empty = new BitfieldManager();
     * ```
     */
    constructor(value: T[] | bigint = 0n) {
        if (typeof value === "bigint") {
            this.#bitfield = value;
        } else if (Array.isArray(value)) {
            this.#bitfield = value.reduce((acc, val) => acc | this.#resolve(val), 0n);
        } else {
            throw new TypeError("Initial value must be a bigint or an array of flags");
        }
    }

    /**
     * Creates a BitfieldManager from various input types.
     * Factory method providing flexible instantiation.
     *
     * @param value - Source value to create from
     * @returns New BitfieldManager instance
     *
     * @example
     * ```typescript
     * // From existing manager
     * const copy = BitfieldManager.from(existingManager);
     *
     * // From flag array
     * const fromArray = BitfieldManager.from([Flag.A, Flag.B]);
     *
     * // From BigInt
     * const fromBigInt = BitfieldManager.from(8n);
     * ```
     */
    static from<F>(value: BitfieldManager<F> | F[] | bigint): BitfieldManager<F> {
        if (value instanceof BitfieldManager) {
            return new BitfieldManager(value.valueOf());
        }
        return new BitfieldManager(value);
    }

    /**
     * Checks if specific flag is set.
     *
     * @param val - Flag to check
     * @returns True if flag is set
     *
     * @example
     * ```typescript
     * const perms = new BitfieldManager([Permissions.ADMIN]);
     *
     * if (perms.has(Permissions.ADMIN)) {
     *   console.log('Has admin permissions');
     * }
     * ```
     */
    has(val: T): boolean {
        const bit = this.#resolve(val);
        return (this.#bitfield & bit) === bit;
    }

    /**
     * Adds flags to the bitfield.
     *
     * @param flags - Flags to add
     * @returns This instance (chainable)
     *
     * @example
     * ```typescript
     * perms.add(
     *   Permissions.BAN_MEMBERS,
     *   Permissions.KICK_MEMBERS
     * );
     * ```
     */
    add(...flags: T[]): this {
        for (const flag of flags) {
            this.#bitfield |= this.#resolve(flag);
        }
        return this;
    }

    /**
     * Removes flags from the bitfield.
     *
     * @param flags - Flags to remove
     * @returns This instance (chainable)
     *
     * @example
     * ```typescript
     * perms.remove(
     *   Permissions.SEND_MESSAGES,
     *   Permissions.EMBED_LINKS
     * );
     * ```
     */
    remove(...flags: T[]): this {
        for (const flag of flags) {
            this.#bitfield &= ~this.#resolve(flag);
        }
        return this;
    }

    /**
     * Toggles flags in the bitfield.
     *
     * @param flags - Flags to toggle
     * @returns This instance (chainable)
     *
     * @example
     * ```typescript
     * perms.toggle(Permissions.MANAGE_ROLES);
     * // Turns flag on if off, off if on
     * ```
     */
    toggle(...flags: T[]): this {
        for (const flag of flags) {
            this.#bitfield ^= this.#resolve(flag);
        }
        return this;
    }

    /**
     * Gets raw bitfield value.
     *
     * @returns Bitfield as BigInt
     *
     * @example
     * ```typescript
     * const raw = perms.valueOf();
     * console.log(raw.toString(2)); // Binary representation
     * ```
     */
    valueOf(): bigint {
        return this.#bitfield;
    }

    /**
     * Resolves value to bitfield.
     * Internal utility for converting inputs to BigInt.
     *
     * @private
     * @param value - Value to resolve
     * @returns Resolved BigInt value
     * @throws {TypeError} For invalid inputs
     */
    #resolve(value: BitfieldResolvable<T> | BitfieldResolvable<T>[]): bigint {
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

    /**
     * Validates and converts string to BigInt.
     * Internal utility for string validation.
     *
     * @private
     * @param value - String to validate
     * @returns Validated BigInt
     * @throws {Error} For invalid BigInt strings
     */
    #assertValidBigInt(value: string): bigint {
        const trimmedValue = value.trim();

        if (trimmedValue.length === 0) {
            throw new Error("Empty string is not a valid BigInt");
        }

        if (!/^-?\d+$/.test(trimmedValue)) {
            throw new Error("Invalid BigInt format");
        }

        try {
            const result = BigInt(trimmedValue);
            if (result < 0n) {
                throw new Error("BigInt must be non-negative for bitfield operations");
            }
            return result;
        } catch (error) {
            throw new Error(`Failed to create BigInt: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
