import type { Integer } from "../markdown/index.js";

/**
 * Represents Discord Gateway Intent bit flags.
 * Uses enum for better runtime performance and type safety.
 * @see {@link https://discord.com/developers/docs/topics/gateway#gateway-intents}
 */
export enum GatewayIntentBits {
    Guilds = 1 << 0,
    GuildMembers = 1 << 1,
    GuildModeration = 1 << 2,
    GuildExpressions = 1 << 3,
    GuildIntegrations = 1 << 4,
    GuildWebhooks = 1 << 5,
    GuildInvites = 1 << 6,
    GuildVoiceStates = 1 << 7,
    GuildPresences = 1 << 8,
    GuildMessages = 1 << 9,
    GuildMessageReactions = 1 << 10,
    GuildMessageTyping = 1 << 11,
    DirectMessages = 1 << 12,
    DirectMessageReactions = 1 << 13,
    DirectMessageTyping = 1 << 14,
    MessageContent = 1 << 15,
    GuildScheduledEvents = 1 << 16,
    AutoModerationConfiguration = 1 << 20,
    AutoModerationExecution = 1 << 21,
    GuildMessagePolls = 1 << 24,
    DirectMessagePolls = 1 << 25,
}

/**
 * Utility type for extracting intent names from the enum
 */
export type GatewayIntentNames = keyof typeof GatewayIntentBits;

/**
 * Represents a bitfield of combined gateway intents
 */
export type GatewayIntentBitField = Integer;

/**
 * Represents privileged intents that require special permissions
 */
export type PrivilegedIntents =
    | GatewayIntentBits.GuildMembers
    | GatewayIntentBits.GuildPresences
    | GatewayIntentBits.MessageContent;

/**
 * Represents a single intent that can be resolved
 */
export type SingleGatewayIntent = GatewayIntentNames | GatewayIntentBits | GatewayIntentBitField;

/**
 * Represents an array of intents that can be resolved
 */
export type GatewayIntentArray = readonly GatewayIntentNames[] | readonly GatewayIntentBits[];

/**
 * Represents all possible ways to specify gateway intents
 *
 * @remarks
 * This type allows for:
 * - Single intent name as string (e.g., 'Guilds')
 * - Array of intent names (e.g., ['Guilds', 'GuildMessages'])
 * - Single intent bit (e.g., GatewayIntentBits.Guilds)
 * - Array of intent bits (e.g., [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages])
 * - Pre-computed bitfield (e.g., 0b1111)
 *
 * @example
 * ```typescript
 * // Single intent name
 * const intent1: GatewayIntentResolvable = 'Guilds';
 *
 * // Array of intent names
 * const intent2: GatewayIntentResolvable = ['Guilds', 'GuildMessages'];
 *
 * // Single intent bit
 * const intent3: GatewayIntentResolvable = GatewayIntentBits.Guilds;
 *
 * // Array of intent bits
 * const intent4: GatewayIntentResolvable = [
 *   GatewayIntentBits.Guilds,
 *   GatewayIntentBits.GuildMessages
 * ];
 *
 * // Pre-computed bitfield
 * const intent5: GatewayIntentResolvable = 0b11 as GatewayIntentBitField;
 * ```
 */
export type GatewayIntentResolvable = SingleGatewayIntent | GatewayIntentArray;

/**
 * Provides utility functions for managing Discord Gateway Intents
 */
export const GatewayIntents = {
    /**
     * List of intents that require privileged access
     * @see {@link https://discord.com/developers/docs/topics/gateway#privileged-intents}
     */
    privilegedIntents: [
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ] as readonly PrivilegedIntents[],

    /**
     * Converts any valid intent input into a GatewayIntentBitField
     * @param resolvable - The intents to resolve
     * @returns A bitfield containing all resolved intents
     * @throws {Error} If the input is invalid or contains invalid intents
     *
     * @example
     * // Single intent name
     * resolve('Guilds') // Returns GatewayIntentBits.Guilds
     *
     * @example
     * // Array of intent names
     * resolve(['Guilds', 'GuildMessages'])
     *
     * @example
     * // Single intent bit or combined bits
     * resolve(GatewayIntentBits.Guilds | GatewayIntentBits.GuildMessages)
     *
     * @example
     * // Array of intent bits
     * resolve([GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages])
     */
    resolve(resolvable: GatewayIntentResolvable): GatewayIntentBitField {
        if (this.isGatewayIntentBitField(resolvable) || this.isGatewayIntentBit(resolvable)) {
            return resolvable as GatewayIntentBitField;
        }

        if (this.isGatewayIntentName(resolvable)) {
            const bit = GatewayIntentBits[resolvable];
            return bit as GatewayIntentBitField;
        }

        if (this.isGatewayIntentArray(resolvable)) {
            return resolvable.reduce<number>((bitfield, intent) => {
                if (this.isGatewayIntentBit(intent)) {
                    return bitfield | intent;
                }

                if (this.isGatewayIntentName(intent)) {
                    return bitfield | GatewayIntentBits[intent];
                }

                throw new RangeError(`Invalid intent value: ${intent}. Expected an intent name or bit.`);
            }, 0) as GatewayIntentBitField;
        }

        throw new TypeError(
            `Invalid intent resolvable: ${resolvable}. Expected an intent name, bit, bitfield, or array of intents.`,
        );
    },

    /**
     * Returns all available intents combined into a single bitfield
     * @returns Bitfield containing all intents
     */
    all(): GatewayIntentBitField {
        return Object.values(GatewayIntentBits)
            .filter((value): value is number => typeof value === "number")
            .reduce((acc, value) => acc | value, 0) as GatewayIntentBitField;
    },

    /**
     * Returns all privileged intents combined into a single bitfield
     * @returns Bitfield containing all privileged intents
     */
    privileged(): GatewayIntentBitField {
        return GatewayIntents.privilegedIntents.reduce((acc, value) => acc | value, 0) as GatewayIntentBitField;
    },

    /**
     * Checks if a given intent requires privileged access
     * @param intent - The intent to check
     * @returns True if the intent requires privileged access
     */
    isPrivileged(intent: GatewayIntentBits): boolean {
        return this.privilegedIntents.includes(intent as PrivilegedIntents);
    },

    isGatewayIntentName(value: unknown): value is GatewayIntentNames {
        return typeof value === "string" && value in GatewayIntentBits;
    },

    /**
     * Type guard to check if a value is a valid intent bit
     */
    isGatewayIntentBit(value: unknown): value is GatewayIntentBits {
        return typeof value === "number" && Object.values(GatewayIntentBits).includes(value);
    },

    /**
     * Type guard to check if a value is a valid intent bitfield
     */
    isGatewayIntentBitField(value: unknown): value is GatewayIntentBitField {
        if (typeof value !== "number") {
            return false;
        }
        return (value & GatewayIntents.all()) === value;
    },

    /**
     * Type guard to check if a value is a valid intent array
     */
    isGatewayIntentArray(value: unknown): value is GatewayIntentArray {
        return (
            Array.isArray(value) &&
            value.every((item) => this.isGatewayIntentName(item) || this.isGatewayIntentBit(item))
        );
    },

    /**
     * Checks if a bitfield contains a specific intent
     * @param bitfield - The bitfield to check
     * @param intent - The intent to look for
     * @returns True if the bitfield contains the intent
     */
    has(bitfield: GatewayIntentBitField, intent: GatewayIntentBits): boolean {
        return (bitfield & intent) === intent;
    },

    /**
     * Converts a bitfield back into an array of intent names
     * @param bitfield - The bitfield to convert
     * @returns Array of intent names present in the bitfield
     */
    toNames(bitfield: GatewayIntentBitField): GatewayIntentNames[] {
        return Object.entries(GatewayIntentBits)
            .filter(([_, value]) => typeof value === "number" && GatewayIntents.has(bitfield, value))
            .map(([key]) => key as GatewayIntentNames);
    },
};
