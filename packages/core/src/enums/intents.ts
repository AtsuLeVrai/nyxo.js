/**
 * Discord Gateway Intents Module
 *
 * This module provides comprehensive tooling for managing Discord Gateway Intents.
 * Gateway Intents are used to specify which events your bot will receive from Discord's gateway.
 *
 * @module Discord Gateway Intents
 * @version 1.0.0
 * @see {@link https://discord.com/developers/docs/topics/gateway#gateway-intents}
 */

import type { Integer } from "../markdown/index.js";

/**
 * Gateway Intent Bit Flags
 *
 * Represents the available Gateway Intents as bit flags.
 * Each intent corresponds to a specific set of events your bot can receive.
 *
 * @remarks
 * - Bits are calculated using left shift operation (1 << n)
 * - Some intents are privileged and require special approval from Discord
 * - Privileged intents: GuildMembers, GuildPresences, MessageContent
 *
 * @example
 * ```typescript
 * // Combining multiple intents
 * const intents = GatewayIntentBits.Guilds | GatewayIntentBits.GuildMessages;
 *
 * // Checking for privileged intents
 * const requiresPrivileged = GatewayIntents.isPrivileged(GatewayIntentBits.GuildMembers);
 * ```
 */
export enum GatewayIntentBits {
    /** Access to guild related events (creation, updates, deletes, role changes) */
    Guilds = 1 << 0,

    /** Access to guild member related events (joins, leaves, updates) - Privileged Intent */
    GuildMembers = 1 << 1,

    /** Access to guild moderation events (bans, unbans, timeouts) */
    GuildModeration = 1 << 2,

    /** Access to guild expression events (emoji, sticker updates) */
    GuildExpressions = 1 << 3,

    /** Access to guild integration events (bot joins, updates, removes) */
    GuildIntegrations = 1 << 4,

    /** Access to webhook related events (creates, updates, deletes) */
    GuildWebhooks = 1 << 5,

    /** Access to guild invite events (creates, deletes) */
    GuildInvites = 1 << 6,

    /** Access to voice state events (joins, leaves, moves) */
    GuildVoiceStates = 1 << 7,

    /** Access to presence updates (status, activities) - Privileged Intent */
    GuildPresences = 1 << 8,

    /** Access to guild message events (sends, updates, deletes) */
    GuildMessages = 1 << 9,

    /** Access to message reaction events in guilds */
    GuildMessageReactions = 1 << 10,

    /** Access to typing indicators in guilds */
    GuildMessageTyping = 1 << 11,

    /** Access to direct message events */
    DirectMessages = 1 << 12,

    /** Access to reaction events in DMs */
    DirectMessageReactions = 1 << 13,

    /** Access to typing indicators in DMs */
    DirectMessageTyping = 1 << 14,

    /** Access to message content - Privileged Intent */
    MessageContent = 1 << 15,

    /** Access to scheduled event related updates */
    GuildScheduledEvents = 1 << 16,

    /** Access to auto moderation configuration events */
    AutoModerationConfiguration = 1 << 20,

    /** Access to auto moderation execution events */
    AutoModerationExecution = 1 << 21,

    /** Access to polls in guild messages */
    GuildMessagePolls = 1 << 24,

    /** Access to polls in direct messages */
    DirectMessagePolls = 1 << 25,
}

/**
 * Gateway Intent Names Type
 * Utility type representing valid intent names as strings
 */
export type GatewayIntentNames = keyof typeof GatewayIntentBits;

/**
 * Gateway Intent Bitfield Type
 * Represents a combined bitfield of multiple intents
 */
export type GatewayIntentBitField = Integer;

/**
 * Privileged Intents Type
 * Represents intents that require special Discord approval
 */
export type PrivilegedIntents =
    | GatewayIntentBits.GuildMembers
    | GatewayIntentBits.GuildPresences
    | GatewayIntentBits.MessageContent;

/**
 * Single Gateway Intent Type
 * Represents all valid ways to specify a single intent
 */
export type SingleGatewayIntent = GatewayIntentNames | GatewayIntentBits | GatewayIntentBitField;

/**
 * Gateway Intent Array Type
 * Represents arrays of intent names or bits
 */
export type GatewayIntentArray = readonly GatewayIntentNames[] | readonly GatewayIntentBits[];

/**
 * Gateway Intent Resolvable Type
 *
 * Represents all possible ways to specify gateway intents in your application.
 * This type provides flexibility in how intents can be defined while maintaining type safety.
 *
 * @remarks
 * Supports the following formats:
 * - Single intent name as string
 * - Array of intent names
 * - Single intent bit
 * - Array of intent bits
 * - Pre-computed bitfield
 *
 * @example
 * ```typescript
 * // Using string intent name
 * const intent1: GatewayIntentResolvable = 'Guilds';
 *
 * // Using array of names
 * const intent2: GatewayIntentResolvable = ['Guilds', 'GuildMessages'];
 *
 * // Using single bit
 * const intent3: GatewayIntentResolvable = GatewayIntentBits.Guilds;
 *
 * // Using bit array
 * const intent4: GatewayIntentResolvable = [
 *   GatewayIntentBits.Guilds,
 *   GatewayIntentBits.GuildMessages
 * ];
 *
 * // Using pre-computed bitfield
 * const intent5: GatewayIntentResolvable = 0b11 as GatewayIntentBitField;
 * ```
 */
export type GatewayIntentResolvable = SingleGatewayIntent | GatewayIntentArray;

/**
 * Gateway Intents Utility Object
 *
 * Provides utility functions for working with Discord Gateway Intents.
 * Includes methods for resolving, combining, and validating intents.
 */
export const GatewayIntents = {
    /**
     * List of intents that require privileged access from Discord
     * These intents need special approval and additional bot verification
     *
     * @see {@link https://discord.com/developers/docs/topics/gateway#privileged-intents}
     */
    privilegedIntents: [
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ] as readonly PrivilegedIntents[],

    /**
     * Resolves any valid intent input into a GatewayIntentBitField
     *
     * @param resolvable - The intent(s) to resolve
     * @returns A bitfield containing all resolved intents
     * @throws {Error} If input is invalid or contains invalid intents
     *
     * @example
     * ```typescript
     * // Resolve single intent name
     * const bits1 = GatewayIntents.resolve('Guilds');
     *
     * // Resolve multiple intent names
     * const bits2 = GatewayIntents.resolve(['Guilds', 'GuildMessages']);
     *
     * // Resolve combined bits
     * const bits3 = GatewayIntents.resolve(
     *   GatewayIntentBits.Guilds | GatewayIntentBits.GuildMessages
     * );
     * ```
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
     * Returns a bitfield containing all available intents combined
     *
     * @returns Bitfield with all intents enabled
     * @remarks Use with caution as this includes privileged intents
     */
    all(): GatewayIntentBitField {
        return Object.values(GatewayIntentBits)
            .filter((value): value is number => typeof value === "number")
            .reduce((acc, value) => acc | value, 0) as GatewayIntentBitField;
    },

    /**
     * Returns a bitfield containing only privileged intents
     *
     * @returns Bitfield with all privileged intents
     * @remarks These intents require special Discord approval
     */
    privileged(): GatewayIntentBitField {
        return GatewayIntents.privilegedIntents.reduce((acc, value) => acc | value, 0) as GatewayIntentBitField;
    },

    /**
     * Checks if a given intent requires privileged access
     *
     * @param intent - The intent to check
     * @returns True if the intent requires privileged access
     */
    isPrivileged(intent: GatewayIntentBits): boolean {
        return this.privilegedIntents.includes(intent as PrivilegedIntents);
    },

    /**
     * Type guard for gateway intent names
     *
     * @param value - Value to check
     * @returns True if value is a valid intent name
     */
    isGatewayIntentName(value: unknown): value is GatewayIntentNames {
        return typeof value === "string" && value in GatewayIntentBits;
    },

    /**
     * Type guard for gateway intent bits
     *
     * @param value - Value to check
     * @returns True if value is a valid intent bit
     */
    isGatewayIntentBit(value: unknown): value is GatewayIntentBits {
        return typeof value === "number" && Object.values(GatewayIntentBits).includes(value);
    },

    /**
     * Type guard for gateway intent bitfields
     *
     * @param value - Value to check
     * @returns True if value is a valid intent bitfield
     */
    isGatewayIntentBitField(value: unknown): value is GatewayIntentBitField {
        if (typeof value !== "number") {
            return false;
        }
        return (value & GatewayIntents.all()) === value;
    },

    /**
     * Type guard for gateway intent arrays
     *
     * @param value - Value to check
     * @returns True if value is a valid intent array
     */
    isGatewayIntentArray(value: unknown): value is GatewayIntentArray {
        return (
            Array.isArray(value) &&
            value.every((item) => this.isGatewayIntentName(item) || this.isGatewayIntentBit(item))
        );
    },

    /**
     * Checks if a bitfield contains a specific intent
     *
     * @param bitfield - The bitfield to check
     * @param intent - The intent to look for
     * @returns True if the bitfield contains the intent
     *
     * @example
     * ```typescript
     * const intents = GatewayIntentBits.Guilds | GatewayIntentBits.GuildMessages;
     * const hasGuilds = GatewayIntents.has(intents, GatewayIntentBits.Guilds); // true
     * ```
     */
    has(bitfield: GatewayIntentBitField, intent: GatewayIntentBits): boolean {
        return (bitfield & intent) === intent;
    },

    /**
     * Converts a bitfield into an array of intent names
     *
     * @param bitfield - The bitfield to convert
     * @returns Array of intent names present in the bitfield
     *
     * @example
     * ```typescript
     * const intents = GatewayIntentBits.Guilds | GatewayIntentBits.GuildMessages;
     * const names = GatewayIntents.toNames(intents); // ['Guilds', 'GuildMessages']
     * ```
     */
    toNames(bitfield: GatewayIntentBitField): GatewayIntentNames[] {
        return Object.entries(GatewayIntentBits)
            .filter(([_, value]) => typeof value === "number" && GatewayIntents.has(bitfield, value))
            .map(([key]) => key as GatewayIntentNames);
    },
};
