export type Snowflake = string;
export type Integer = number;
export type Iso8601 = `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`;
export type ImageData = `data:image/${"jpeg" | "png" | "gif"};base64,${string}`;

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
): `</${string}:${Snowflake}>`;
export function formatSlashCommand(
  commandName: string,
  commandId: Snowflake,
  subCommandName: string,
): `</${string} ${string}:${Snowflake}>`;
export function formatSlashCommand(
  commandName: string,
  commandId: Snowflake,
  subCommandGroupName: string,
  subCommandName: string,
): `</${string} ${string} ${string}:${Snowflake}>`;
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

export function formatCustomEmoji(
  emojiName: string,
  emojiId: Snowflake,
): `<:${string}:${Snowflake}>`;
export function formatCustomEmoji(
  emojiName: string,
  emojiId: Snowflake,
  animated: true,
): `<a:${string}:${Snowflake}>`;
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

export function formatTimestamp(timestamp: number): `<t:${number}>`;
export function formatTimestamp(
  timestamp: number,
  style: TimestampStyle,
): `<t:${number}:${TimestampStyle}>`;
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
