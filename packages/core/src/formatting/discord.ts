import type { Snowflake } from "../utils/index.js";

/**
 * Represents a branded type for safe integers.
 * Used to ensure type safety for numerical operations.
 */
export type Integer = number & { readonly __brand: unique symbol };

/**
 * Checks if a number is a safe integer.
 *
 * @param value - The number to check
 * @returns A type predicate indicating if the value is a safe integer
 */
export function isInteger(value: number): value is Integer {
  return Number.isSafeInteger(value);
}

/**
 * Converts a number to a safe integer.
 *
 * @param value - The number to convert
 * @returns The number as a safe integer
 * @throws {Error} If the value is not a safe integer
 */
export function toInteger(value: number): Integer {
  if (!isInteger(value)) {
    throw new Error("Value must be a safe integer");
  }
  return value as Integer;
}

/**
 * Represents a branded type for ISO-8601 date strings.
 * Ensures type safety for date string operations.
 */
export type Iso8601 = string & { readonly __brand: unique symbol };

/**
 * Regular expression for validating ISO-8601 date strings.
 * Matches format: YYYY-MM-DDThh:mm:ss.sssZ or ±hh:mm
 */
export const ISO8601_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:?\d{2})$/;

/**
 * Checks if a string is a valid ISO-8601 date format.
 *
 * @param value - The string to check
 * @returns A type predicate indicating if the string is a valid ISO-8601 date
 */
export function isIso8601(value: string): value is Iso8601 {
  if (!ISO8601_REGEX.test(value)) {
    return false;
  }

  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

/**
 * Converts a string to a validated ISO-8601 date string.
 *
 * @param value - The string to convert
 * @returns The validated ISO-8601 string
 * @throws {Error} If the string is not a valid ISO-8601 date format
 */
export function toIso8601(value: string): Iso8601 {
  if (!isIso8601(value)) {
    throw new Error("Value must be a valid ISO-8601 date string");
  }
  return value as Iso8601;
}

/**
 * Converts a Date object to an ISO-8601 string.
 *
 * @param date - The Date object to convert
 * @returns The ISO-8601 string representation
 */
export function fromDate(date: Date): Iso8601 {
  return date.toISOString() as Iso8601;
}

/**
 * Parses an ISO-8601 string to a Date object.
 *
 * @param value - The ISO-8601 string to parse
 * @returns The parsed Date object
 * @throws {Error} If the string cannot be parsed to a valid date
 */
export function parseIso8601(value: Iso8601): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid ISO-8601 date string");
  }
  return date;
}

/**
 * Formats for Discord message content formatting.
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-formats Discord Message Formatting Documentation}
 */
export enum MessageFormat {
  /** Format for user mentions: <@123456789> */
  UserMention = "<@%s>",

  /**
   * Legacy format for user mentions
   * @deprecated Use {@link MessageFormat.UserMention} instead
   */
  UserMentionExclamation = "<@!%s>",

  /** Format for channel mentions: <#123456789> */
  ChannelMention = "<#%s>",

  /** Format for role mentions: <@&123456789> */
  RoleMention = "<@&%s>",

  /** Format for standard Unicode emojis */
  StandardEmoji = "%s",

  /** Format for custom emojis: <:name:123456789> */
  CustomEmoji = "<:%s:%s>",

  /** Format for animated custom emojis: <a:name:123456789> */
  CustomAnimatedEmoji = "<a:%s:%s>",

  /** Format for Unix timestamps: <t:1234567890> */
  UnixTimestamp = "<t:%s>",

  /** Format for styled Unix timestamps: <t:1234567890:R> */
  UnixTimestampStyled = "<t:%s:%s>",

  /** Format for guild navigation: <id:type> */
  GuildNavigation = "<id:%s>",
}

/**
 * Valid types for guild navigation formatting.
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-guild-navigation-types}
 */
export type GuildNavigationType =
  | "customize"
  | "browse"
  | "guide"
  | "linked-roles"
  | `linked-roles:${Snowflake}`;

/**
 * Styles for timestamp formatting.
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-timestamp-styles}
 */
export enum TimestampStyle {
  /** Short time format (e.g., 16:20) */
  ShortTime = "t",
  /** Long time format (e.g., 16:20:30) */
  LongTime = "T",
  /** Short date format (e.g., 20/04/2021) */
  ShortDate = "d",
  /** Long date format (e.g., 20 April 2021) */
  LongDate = "D",
  /** Short date-time format (e.g., 20 April 2021 16:20) */
  ShortDateTime = "f",
  /** Long date-time format (e.g., Tuesday, 20 April 2021 16:20) */
  LongDateTime = "F",
  /** Relative time format (e.g., 2 months ago) */
  RelativeTime = "R",
}

/**
 * Formats a user ID into a Discord user mention.
 *
 * @param userId - The ID of the user to mention
 * @returns Formatted user mention string
 *
 * @example
 * ```typescript
 * formatUser('123456789') // Returns: <@123456789>
 * ```
 */
export function formatUser(userId: Snowflake): `<@${Snowflake}>` {
  return `<@${userId}>`;
}

/**
 * Formats a channel ID into a Discord channel mention.
 *
 * @param channelId - The ID of the channel to mention
 * @returns Formatted channel mention string
 *
 * @example
 * ```typescript
 * formatChannel('123456789') // Returns: <#123456789>
 * ```
 */
export function formatChannel(channelId: Snowflake): `<#${Snowflake}>` {
  return `<#${channelId}>`;
}

/**
 * Formats a role ID into a Discord role mention.
 *
 * @param roleId - The ID of the role to mention
 * @returns Formatted role mention string
 *
 * @example
 * ```typescript
 * formatRole('123456789') // Returns: <@&123456789>
 * ```
 */
export function formatRole(roleId: Snowflake): `<@&${Snowflake}>` {
  return `<@&${roleId}>`;
}

/**
 * Formats a slash command into a Discord application command mention.
 *
 * @param commandName - The name of the command
 * @param commandId - The ID of the command
 * @param subCommandGroupName - Optional subcommand group name
 * @param subCommandName - Optional subcommand name
 * @returns Formatted command mention string
 *
 * @example
 * ```typescript
 * formatSlashCommand('ping', '123456789') // Returns: </ping:123456789>
 * formatSlashCommand('settings', '123456789', 'user') // Returns: </settings user:123456789>
 * formatSlashCommand('config', '123456789', 'server', 'timezone') // Returns: </config server timezone:123456789>
 * ```
 */
export function formatSlashCommand(
  commandName: string,
  commandId: Snowflake,
  subCommandGroupName?: string,
  subCommandName?: string,
):
  | `</${string}:${Snowflake}`
  | `</${string} ${string}:${Snowflake}`
  | `</${string} ${string} ${string}:${Snowflake}` {
  if (subCommandGroupName && subCommandName) {
    return `</${commandName} ${subCommandGroupName} ${subCommandName}:${commandId}>`;
  }

  if (subCommandName) {
    return `</${commandName} ${subCommandName}:${commandId}>`;
  }

  return `</${commandName}:${commandId}>`;
}

/**
 * Formats an emoji into a Discord custom emoji mention.
 *
 * @param emojiName - The name of the emoji
 * @param emojiId - The ID of the emoji
 * @param animated - Whether the emoji is animated
 * @returns Formatted emoji string
 *
 * @example
 * ```typescript
 * formatCustomEmoji('wave', '123456789') // Returns: <:wave:123456789>
 * formatCustomEmoji('wave', '123456789', true) // Returns: <a:wave:123456789>
 * ```
 */
export function formatCustomEmoji(
  emojiName: string,
  emojiId: Snowflake,
  animated?: boolean,
): `<:${string}:${Snowflake}` | `<a:${string}:${Snowflake}` {
  if (animated) {
    return `<a:${emojiName}:${emojiId}>`;
  }

  return `<:${emojiName}:${emojiId}>`;
}

/**
 * Formats a Unix timestamp into a Discord timestamp mention.
 *
 * @param timestamp - The Unix timestamp
 * @param style - Optional timestamp style
 * @returns Formatted timestamp string
 *
 * @example
 * ```typescript
 * formatTimestamp(1234567890) // Returns: <t:1234567890>
 * formatTimestamp(1234567890, TimestampStyle.RelativeTime) // Returns: <t:1234567890:R>
 * ```
 */
export function formatTimestamp(
  timestamp: number,
  style?: TimestampStyle,
): `<t:${number}>` | `<t:${number}:${TimestampStyle}>` {
  if (style) {
    return `<t:${timestamp}:${style}>`;
  }

  return `<t:${timestamp}>`;
}

/**
 * Formats a guild navigation link.
 *
 * @param id - The guild ID
 * @param type - The navigation type
 * @returns Formatted guild navigation string
 *
 * @example
 * ```typescript
 * formatGuildNavigation('123456789', 'customize') // Returns: <123456789:customize>
 * ```
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-guild-navigation-types}
 */
export function formatGuildNavigation(
  id: Snowflake,
  type: GuildNavigationType,
): `<${Snowflake}:${GuildNavigationType}>` {
  return `<${id}:${type}>`;
}
