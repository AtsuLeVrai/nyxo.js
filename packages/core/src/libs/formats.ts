import type { Snowflake } from "./types";

/**
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-guild-navigation-types|Guild Navigation Types}
 * Represents the types of guild navigation.
 */
export type GuildNavigationTypes = "customize" | "browse" | "guide" | "linked-roles" | `linked-roles:${Snowflake}`;

/**
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-timestamp-styles|Timestamp Styles}
 * Enum for different timestamp styles.
 */
export enum TimestampStyles {
    ShortTime = "t",
    LongTime = "T",
    ShortDate = "d",
    LongDate = "D",
    ShortDateTime = "f",
    LongDateTime = "F",
    RelativeTime = "R",
}

/**
 * Formats a user mention.
 * @param {Snowflake} userId - The ID of the user.
 * @returns {`<@${Snowflake}>`} The formatted user mention.
 */
export function formatUser(userId: Snowflake): `<@${Snowflake}>` {
    return `<@${userId}>`;
}

/**
 * Formats a channel mention.
 * @param {Snowflake} channelId - The ID of the channel.
 * @returns {`<#${Snowflake}>`} The formatted channel mention.
 */
export function formatChannel(channelId: Snowflake): `<#${Snowflake}>` {
    return `<#${channelId}>`;
}

/**
 * Formats a role mention.
 * @param {Snowflake} roleId - The ID of the role.
 * @returns {`<@&${Snowflake}>`} The formatted role mention.
 */
export function formatRole(roleId: Snowflake): `<@&${Snowflake}>` {
    return `<@&${roleId}>`;
}

/**
 * Formats a slash command mention.
 * @param {string} name - The name of the command.
 * @param {Snowflake} commandId - The ID of the command.
 * @returns {`</${string}:${Snowflake}>`} The formatted slash command mention.
 */
export function formatSlashCommand(name: string, commandId: Snowflake): `</${string}:${Snowflake}>`;

/**
 * Formats a slash command mention with a subcommand.
 * @param {string} name - The name of the command.
 * @param {string} subCommand - The name of the subcommand.
 * @param {Snowflake} commandId - The ID of the command.
 * @returns {`</${string} ${string}:${Snowflake}>`} The formatted slash command mention.
 */
export function formatSlashCommand(
    name: string,
    subCommand: string,
    commandId: Snowflake
): `</${string} ${string}:${Snowflake}>`;

/**
 * Formats a slash command mention with a subcommand and subgroup.
 * @param {string} name - The name of the command.
 * @param {string} subGroupCommand - The name of the subgroup command.
 * @param {string} subCommand - The name of the subcommand.
 * @param {Snowflake} commandId - The ID of the command.
 * @returns {`</${string} ${string} ${string}:${Snowflake}>`} The formatted slash command mention.
 */
export function formatSlashCommand(
    name: string,
    subGroupCommand: string,
    subCommand: string,
    commandId: Snowflake
): `</${string} ${string} ${string}:${Snowflake}>`;

/**
 * Formats a slash command mention.
 * @param {string} name - The name of the command.
 * @param {string} [subCommandOrGroup] - The name of the subcommand or subgroup.
 * @param {string} [subCommand] - The name of the subcommand.
 * @param {Snowflake} [commandId] - The ID of the command.
 * @returns {`</${string}:${Snowflake}>` | `</${string} ${string}:${Snowflake}>` | `</${string} ${string} ${string}:${Snowflake}>`} The formatted slash command mention.
 */
export function formatSlashCommand(
    name: string,
    subCommandOrGroup?: string,
    subCommand?: string,
    commandId?: Snowflake
):
    | `</${string}:${Snowflake}>`
    | `</${string} ${string}:${Snowflake}>`
    | `</${string} ${string} ${string}:${Snowflake}>` {
    if (subCommandOrGroup === undefined) {
        return `</${name}:${commandId}>`;
    } else if (subCommand !== undefined) {
        return `</${name} ${subCommand}:${commandId}>`;
    } else {
        return `</${name} ${subCommandOrGroup} ${subCommand}:${commandId}>`;
    }
}

/**
 * Formats a custom emoji.
 * @param {string} name - The name of the emoji.
 * @param {Snowflake} emojiId - The ID of the emoji.
 * @returns {`<:${string}:${Snowflake}>`} The formatted custom emoji.
 */
export function formatCustomEmoji(name: string, emojiId: Snowflake): `<:${string}:${Snowflake}>`;

/**
 * Formats an animated custom emoji.
 * @param {string} name - The name of the emoji.
 * @param {Snowflake} emojiId - The ID of the emoji.
 * @param {true} animated - Whether the emoji is animated.
 * @returns {`<a:${string}:${Snowflake}>`} The formatted animated custom emoji.
 */
export function formatCustomEmoji(name: string, emojiId: Snowflake, animated: true): `<a:${string}:${Snowflake}>`;

/**
 * Formats a custom emoji.
 * @param {string} name - The name of the emoji.
 * @param {Snowflake} emojiId - The ID of the emoji.
 * @param {boolean} [animated] - Whether the emoji is animated.
 * @returns {`<:${string}:${Snowflake}>` | `<a:${string}:${Snowflake}>`} The formatted custom emoji.
 */
export function formatCustomEmoji(
    name: string,
    emojiId: Snowflake,
    animated?: boolean
): `<:${string}:${Snowflake}>` | `<a:${string}:${Snowflake}>` {
    return animated ? `<a:${name}:${emojiId}>` : `<:${name}:${emojiId}>`;
}

/**
 * Formats a Unix timestamp.
 * @param {number} timestamp - The Unix timestamp.
 * @returns {`<t:${number}>`} The formatted Unix timestamp.
 */
export function formatUnixTimestamp(timestamp: number): `<t:${number}>`;

/**
 * Formats a Unix timestamp with a style.
 * @param {number} timestamp - The Unix timestamp.
 * @param {TimestampStyles} style - The style of the timestamp.
 * @returns {`<t:${number}:${TimestampStyles}>`} The formatted Unix timestamp with style.
 */
export function formatUnixTimestamp(timestamp: number, style: TimestampStyles): `<t:${number}:${TimestampStyles}>`;

/**
 * Formats a Unix timestamp.
 * @param {number} timestamp - The Unix timestamp.
 * @param {TimestampStyles} [style] - The style of the timestamp.
 * @returns {`<t:${number}>` | `<t:${number}:${TimestampStyles}>`} The formatted Unix timestamp.
 */
export function formatUnixTimestamp(
    timestamp: number,
    style?: TimestampStyles
): `<t:${number}>` | `<t:${number}:${TimestampStyles}>` {
    return style ? `<t:${timestamp}:${style}>` : `<t:${timestamp}>`;
}

/**
 * Formats a guild navigation.
 * @param {Snowflake} guildId - The ID of the guild.
 * @param {GuildNavigationTypes} type - The type of guild navigation.
 * @returns {`<${Snowflake}:${GuildNavigationTypes}>`} The formatted guild navigation.
 */
export function formatGuildNavigation(
    guildId: Snowflake,
    type: GuildNavigationTypes
): `<${Snowflake}:${GuildNavigationTypes}>` {
    return `<${guildId}:${type}>`;
}
