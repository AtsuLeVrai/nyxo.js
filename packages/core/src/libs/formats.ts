/**
 * Represents a unique identifier used by Discord
 */
export type Snowflake = string;

/**
 * Represents an integer value
 */
export type Integer = number;

/**
 * Represents a floating-point value
 */
export type Float = number;

/**
 * Represents a boolean value, including string and number representations
 */
export type Boolean = "False" | "True" | 0 | 1 | false | true;

/**
 * Represents a timestamp in ISO 8601 format
 */
export type IsoO8601Timestamp = string;

/**
 * Represents a Data URI schema
 */
export type DataUriSchema = string;

/**
 * Represents the types of guild navigation
 *
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-guild-navigation-types}
 */
export type GuildNavigationTypes = "browse" | "customize" | "guide";

/**
 * Enum representing different API versions
 *
 * @see {@link https://discord.com/developers/docs/reference#api-versioning-api-versions}
 */
export enum ApiVersions {
    V3 = 3,
    V4 = 4,
    V5 = 5,
    V6 = 6,
    V7 = 7,
    V8 = 8,
    V9 = 9,
    V10 = 10,
}

/**
 * Enum representing different timestamp styles
 *
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-timestamp-styles}
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
 * Enum representing different image formats
 *
 * @see {@link https://discord.com/developers/docs/reference#image-formatting-image-formats}
 */
export enum ImageFormats {
    GIF = "gif",
    JPEG = "jpeg",
    Lottie = "json",
    PNG = "png",
    WebP = "webp",
}

/**
 * Formats a user mention
 *
 * @param userId - The ID of the user to mention
 * @returns A formatted user mention string
 */
export function userFormat(userId: Snowflake): `<@${Snowflake}>` {
    return `<@${userId}>`;
}

/**
 * Formats a channel mention
 *
 * @param channelId - The ID of the channel to mention
 * @returns A formatted channel mention string
 */
export function channelFormat(channelId: Snowflake): `<#${Snowflake}>` {
    return `<#${channelId}>`;
}

/**
 * Formats a role mention
 *
 * @param roleId - The ID of the role to mention
 * @returns A formatted role mention string
 */
export function roleFormat(roleId: Snowflake): `<@&${Snowflake}>` {
    return `<@&${roleId}>`;
}

/**
 * Formats a slash command mention
 *
 * @param commandName - The name of the command
 * @param commandId - The ID of the command
 * @returns A formatted slash command mention string
 */
export function slashCommandFormat(commandName: string, commandId: Snowflake): `</${string}:${Snowflake}>`;
/**
 * Formats a slash command mention
 *
 * @param commandName - The name of the command
 * @param commandId - The ID of the command
 * @param subCommandName - Optional. The name of the subcommand
 * @returns A formatted slash command mention string
 */
export function slashCommandFormat(
    commandName: string,
    commandId: Snowflake,
    subCommandName: string
): `</${string} ${string}:${Snowflake}>`;
/**
 * Formats a slash command mention
 *
 * @param commandName - The name of the command
 * @param commandId - The ID of the command
 * @param subCommandName - Optional. The name of the subcommand
 * @param subCommandGroupName - Optional. The name of the subcommand group
 * @returns A formatted slash command mention string
 */
export function slashCommandFormat(
    commandName: string,
    commandId: Snowflake,
    subCommandGroupName: string,
    subCommandName: string
): `</${string} ${string} ${string}:${Snowflake}>`;
export function slashCommandFormat(
    commandName: string,
    commandId: Snowflake,
    subCommandGroupName?: string,
    subCommandName?: string
): string {
    if (subCommandGroupName && subCommandName) {
        return `</${commandName} ${subCommandGroupName} ${subCommandName}:${commandId}>`;
    }

    if (subCommandName) {
        return `</${commandName} ${subCommandName}:${commandId}>`;
    }

    return `</${commandName}:${commandId}>`;
}

/**
 * Formats a custom emoji
 *
 * @param emojiName - The name of the emoji
 * @param emojiId - The ID of the emoji
 * @returns A formatted custom emoji string
 */
export function customEmojiFormat(emojiName: string, emojiId: Snowflake): `<:${string}:${Snowflake}>`;
/**
 * Formats a custom emoji
 *
 * @param emojiName - The name of the emoji
 * @param emojiId - The ID of the emoji
 * @param animated - Optional. Whether the emoji is animated
 * @returns A formatted custom emoji string
 */
export function customEmojiFormat(emojiName: string, emojiId: Snowflake, animated: true): `<a:${string}:${Snowflake}>`;
export function customEmojiFormat(emojiName: string, emojiId: Snowflake, animated?: boolean): string {
    if (animated) {
        return `<a:${emojiName}:${emojiId}>`;
    }

    return `<:${emojiName}:${emojiId}>`;
}

/**
 * Formats a Unix timestamp
 *
 * @param timestamp - The Unix timestamp to format
 * @returns A formatted Unix timestamp string
 */
export function unixTimestampFormat(timestamp: number): `<t:${number}>`;
/**
 * Formats a Unix timestamp
 *
 * @param timestamp - The Unix timestamp to format
 * @param style - Optional. The style of the timestamp
 * @returns A formatted Unix timestamp string
 */
export function unixTimestampFormat(timestamp: number, style: TimestampStyles): `<t:${number}:${TimestampStyles}>`;
export function unixTimestampFormat(timestamp: number, style?: TimestampStyles): string {
    if (style) {
        return `<t:${timestamp}:${style}>`;
    }

    return `<t:${timestamp}>`;
}

/**
 * Formats a guild navigation link
 *
 * @param id - The ID of the guild
 * @param type - The type of guild navigation
 * @returns A formatted guild navigation string
 */
export function guildNavigationFormat(
    id: Snowflake,
    type: GuildNavigationTypes
): `<${Snowflake}:${GuildNavigationTypes}>` {
    return `<${id}:${type}>`;
}
