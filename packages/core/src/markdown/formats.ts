import type { Snowflake } from "../types";

/**
 * Enum for different image formats.
 *
 * @see {@link https://discord.com/developers/docs/reference#image-formatting-image-formats|Image Formats}
 */
export enum ImageFormats {
    GIF = "gif",
    JPEG = "jpeg",
    Lottie = "json",
    PNG = "png",
    WebP = "webp",
}

/**
 * Represents the types of guild navigation.
 *
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-guild-navigation-types|Guild Navigation Types}
 */
export type GuildNavigationTypes = "browse" | "customize" | "guide" | "linked-roles" | `linked-roles:${Snowflake}`;

/**
 * Enum for different timestamp styles.
 *
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-timestamp-styles|Timestamp Styles}
 */
export enum TimestampStyles {
    LongDate = "D",
    LongDateTime = "F",
    LongTime = "T",
    RelativeTime = "R",
    ShortDate = "d",
    ShortDateTime = "f",
    ShortTime = "t",
}

/**
 * Formats a user mention.
 *
 * @param userId - The ID of the user.
 * @returns The formatted user mention.
 */
export function formatUser(userId: Snowflake): `<@${Snowflake}>` {
    return `<@${userId}>`;
}

/**
 * Formats a channel mention.
 *
 * @param channelId - The ID of the channel.
 * @returns The formatted channel mention.
 */
export function formatChannel(channelId: Snowflake): `<#${Snowflake}>` {
    return `<#${channelId}>`;
}

/**
 * Formats a role mention.
 *
 * @param roleId - The ID of the role.
 * @returns The formatted role mention.
 */
export function formatRole(roleId: Snowflake): `<@&${Snowflake}>` {
    return `<@&${roleId}>`;
}

/**
 * Formats a slash command mention.
 *
 * @param name - The name of the command.
 * @param commandId - The ID of the command.
 * @returns The formatted slash command mention.
 */
export function formatSlashCommand(name: string, commandId: Snowflake): `</${string}:${Snowflake}>`;

/**
 * Formats a slash command mention with a subcommand.
 *
 * @param name - The name of the command.
 * @param subCommand - The name of the subcommand.
 * @param commandId - The ID of the command.
 * @returns The formatted slash command mention.
 */
export function formatSlashCommand(
    name: string,
    subCommand: string,
    commandId: Snowflake
): `</${string} ${string}:${Snowflake}>`;

/**
 * Formats a slash command mention with a subcommand and subgroup.
 *
 * @param name - The name of the command.
 * @param subGroupCommand - The name of the subgroup command.
 * @param subCommand - The name of the subcommand.
 * @param commandId - The ID of the command.
 * @returns The formatted slash command mention.
 */
export function formatSlashCommand(
    name: string,
    subGroupCommand: string,
    subCommand: string,
    commandId: Snowflake
): `</${string} ${string} ${string}:${Snowflake}>`;

/**
 * Formats a slash command mention.
 *
 * @param name - The name of the command.
 * @param subCommandOrGroup - The name of the subcommand or subgroup.
 * @param subCommand - The name of the subcommand.
 * @param commandId - The ID of the command.
 * @returns The formatted slash command mention.
 */
export function formatSlashCommand(
    name: string,
    subCommandOrGroup?: string,
    subCommand?: string,
    commandId?: Snowflake
):
    | `</${string} ${string} ${string}:${Snowflake}>`
    | `</${string} ${string}:${Snowflake}>`
    | `</${string}:${Snowflake}>` {
    if (subCommandOrGroup) {
        if (subCommand) {
            return `</${name} ${subCommand}:${commandId}>`;
        } else {
            return `</${name} ${subCommandOrGroup} ${subCommand}:${commandId}>`;
        }
    } else {
        return `</${name}:${commandId}>`;
    }
}

/**
 * Formats a custom emoji.
 *
 * @param name - The name of the emoji.
 * @param emojiId - The ID of the emoji.
 * @returns The formatted custom emoji.
 */
export function formatCustomEmoji(name: string, emojiId: Snowflake): `<:${string}:${Snowflake}>`;

/**
 * Formats an animated custom emoji.
 *
 * @param name - The name of the emoji.
 * @param emojiId - The ID of the emoji.
 * @param animated - Whether the emoji is animated.
 * @returns The formatted animated custom emoji.
 */
export function formatCustomEmoji(name: string, emojiId: Snowflake, animated: true): `<a:${string}:${Snowflake}>`;

/**
 * Formats a custom emoji.
 *
 * @param name - The name of the emoji.
 * @param emojiId - The ID of the emoji.
 * @param animated - Whether the emoji is animated.
 * @returns The formatted custom emoji.
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
 *
 * @param timestamp - The Unix timestamp.
 * @returns The formatted Unix timestamp.
 */
export function formatUnixTimestamp(timestamp: number): `<t:${number}>`;

/**
 * Formats a Unix timestamp with a style.
 *
 * @param timestamp - The Unix timestamp.
 * @param style - The style of the timestamp.
 * @returns The formatted Unix timestamp with style.
 */
export function formatUnixTimestamp(timestamp: number, style: TimestampStyles): `<t:${number}:${TimestampStyles}>`;

/**
 * Formats a Unix timestamp.
 *
 * @param timestamp - The Unix timestamp.
 * @param style - The style of the timestamp.
 * @returns The formatted Unix timestamp.
 */
export function formatUnixTimestamp(
    timestamp: number,
    style?: TimestampStyles
): `<t:${number}:${TimestampStyles}>` | `<t:${number}>` {
    return style ? `<t:${timestamp}:${style}>` : `<t:${timestamp}>`;
}

/**
 * Formats a guild navigation.
 *
 * @param guildId - The ID of the guild.
 * @param type - The type of guild navigation.
 * @returns The formatted guild navigation.
 */
export function formatGuildNavigation(
    guildId: Snowflake,
    type: GuildNavigationTypes
): `<${Snowflake}:${GuildNavigationTypes}>` {
    return `<${guildId}:${type}>`;
}
