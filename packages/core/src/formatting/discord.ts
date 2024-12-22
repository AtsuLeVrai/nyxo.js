import type { Snowflake } from "../managers/index.js";

export type Integer = number;

export function isInteger(value: number): value is Integer {
  return Number.isSafeInteger(value);
}

export function toInteger(value: number): Integer {
  if (!isInteger(value)) {
    throw new Error("Value must be a safe integer");
  }
  return value as Integer;
}

export type Iso8601 = string;

export const ISO8601_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:?\d{2})$/;

export function isIso8601(value: string): value is Iso8601 {
  if (!ISO8601_REGEX.test(value)) {
    return false;
  }

  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

export function toIso8601(value: string): Iso8601 {
  if (!isIso8601(value)) {
    throw new Error("Value must be a valid ISO-8601 date string");
  }
  return value as Iso8601;
}

export function fromDate(date: Date): Iso8601 {
  return date.toISOString() as Iso8601;
}

export function parseIso8601(value: Iso8601): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid ISO-8601 date string");
  }
  return date;
}

/**
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-formats}
 */
export enum MessageFormat {
  UserMention = "<@%s>",
  /**
   * @deprecated Use {@link MessageFormat.UserMention} instead
   */
  UserMentionExclamation = "<@!%s>",
  ChannelMention = "<#%s>",
  RoleMention = "<@&%s>",
  StandardEmoji = "%s",
  CustomEmoji = "<:%s:%s>",
  CustomAnimatedEmoji = "<a:%s:%s>",
  UnixTimestamp = "<t:%s>",
  UnixTimestampStyled = "<t:%s:%s>",
  GuildNavigation = "<id:%s>",
}

/**
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-guild-navigation-types}
 */
export type GuildNavigationType =
  | "customize"
  | "browse"
  | "guide"
  | "linked-roles"
  | `linked-roles:${Snowflake}`;

/**
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-timestamp-styles}
 */
export enum TimestampStyle {
  ShortTime = "t",
  LongTime = "T",
  ShortDate = "d",
  LongDate = "D",
  ShortDateTime = "f",
  LongDateTime = "F",
  RelativeTime = "R",
}

export function formatUser(userId: Snowflake): `<@${Snowflake}>` {
  return `<@${userId}>`;
}

export function formatChannel(channelId: Snowflake): `<#${Snowflake}>` {
  return `<#${channelId}>`;
}

export function formatRole(roleId: Snowflake): `<@&${Snowflake}>` {
  return `<@&${roleId}>`;
}

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
    return `</${commandName} ${subCommandGroupName} ${subCommandName}:${commandId}>` as `</${string} ${string} ${string}:${Snowflake}`;
  }

  if (subCommandName) {
    return `</${commandName} ${subCommandName}:${commandId}>` as `</${string} ${string}:${Snowflake}`;
  }

  return `</${commandName}:${commandId}>` as `</${string}:${Snowflake}`;
}

export function formatCustomEmoji(
  emojiName: string,
  emojiId: Snowflake,
  animated?: boolean,
): `<:${string}:${Snowflake}` | `<a:${string}:${Snowflake}` {
  if (animated) {
    return `<a:${emojiName}:${emojiId}>` as `<a:${string}:${Snowflake}`;
  }

  return `<:${emojiName}:${emojiId}>` as `<:${string}:${Snowflake}`;
}

export function formatTimestamp(
  timestamp: number,
  style?: TimestampStyle,
): `<t:${number}>` | `<t:${number}:${TimestampStyle}>` {
  if (style) {
    return `<t:${timestamp}:${style}>`;
  }

  return `<t:${timestamp}>`;
}

export function formatGuildNavigation(
  id: Snowflake,
  type: GuildNavigationType,
): `<${Snowflake}:${GuildNavigationType}>` {
  return `<${id}:${type}>`;
}
