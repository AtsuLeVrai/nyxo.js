import twemoji from "twemoji";

export type Snowflake = string;
export type Integer = number;
export type ISO8601 = string;
export type Boolean = "False" | "True" | 0 | 1 | false | true;
export type DataURIScheme = string;

/**
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
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-guild-navigation-types}
 */
export type GuildNavigationTypes = "browse" | "customize" | "guide";

/**
 * @see {@link https://discord.com/developers/docs/reference#message-formatting}
 */
export function formatUser(userId: Snowflake): `<@${Snowflake}>` {
	return `<@${userId}>`;
}

export function formatChannel(channelId: Snowflake): `<#${Snowflake}>` {
	return `<#${channelId}>`;
}

export function formatRole(roleId: Snowflake): `<@&${Snowflake}>` {
	return `<@&${roleId}>`;
}

export function formatSlashCommand(commandName: string, commandId: Snowflake): `</${string}:${Snowflake}>`;
export function formatSlashCommand(commandName: string, commandId: Snowflake, subCommandName: string): `</${string} ${string}:${Snowflake}>`;
export function formatSlashCommand(commandName: string, commandId: Snowflake, subCommandGroupName: string, subCommandName: string): `</${string} ${string} ${string}:${Snowflake}>`;
export function formatSlashCommand(commandName: string, commandId: Snowflake, subCommandGroupName?: string, subCommandName?: string): string {
	if (subCommandGroupName && subCommandName) {
		return `</${commandName} ${subCommandGroupName} ${subCommandName}:${commandId}>`;
	} else if (subCommandName) {
		return `</${commandName} ${subCommandName}:${commandId}>`;
	} else {
		return `</${commandName}:${commandId}>`;
	}
}

export function formatStandardEmoji(text: string): string {
	// TODO: Verify that this is the correct way to parse standard emojis
	return twemoji.parse(text);
}

export function formatCustomEmoji(emojiName: string, emojiId: Snowflake): `<:${string}:${Snowflake}>`;
export function formatCustomEmoji(emojiName: string, emojiId: Snowflake, animated: true): `<a:${string}:${Snowflake}>`;
export function formatCustomEmoji(emojiName: string, emojiId: Snowflake, animated?: boolean): string {
	if (animated) {
		return `<a:${emojiName}:${emojiId}>`;
	} else {
		return `<:${emojiName}:${emojiId}>`;
	}
}

export function formatUnixTimestamp(timestamp: number): `<t:${number}>`;
export function formatUnixTimestamp(timestamp: number, style: TimestampStyles): `<t:${number}:${TimestampStyles}>`;
export function formatUnixTimestamp(timestamp: number, style?: TimestampStyles): string {
	if (style) {
		return `<t:${timestamp}:${style}>`;
	} else {
		return `<t:${timestamp}>`;
	}
}

export function formatGuildNavigation(guildId: Snowflake, guildType: GuildNavigationTypes): `<${Snowflake}:${GuildNavigationTypes}>` {
	return `<${guildId}:${guildType}>`;
}

export function italics(text: string): `_${string}_` {
	return `_${text}_`;
}

export function bold(text: string): `**${string}**` {
	return `**${text}**`;
}

export function underline(text: string): `__${string}__` {
	return `__${text}__`;
}

export function strikethrough(text: string): `~~${string}~~` {
	return `~~${text}~~`;
}

export function code(text: string): `\`${string}\`` {
	return `\`${text}\``;
}

export function codeBlock(language: string, text: string): `\`\`\`${string}\n${string}\n\`\`\`` {
	return `\`\`\`${language}\n${text}\n\`\`\``;
}

export function spoiler(text: string): `||${string}||` {
	return `||${text}||`;
}

export function quote(text: string): `> ${string}` {
	return `> ${text}`;
}

export function quoteBlock(text: string): `>>> ${string}` {
	return `>>> ${text}`;
}

export function bigHeader(text: string): `# ${string}` {
	return `# ${text}`;
}

export function smallHeader(text: string): `## ${string}` {
	return `## ${text}`;
}

export function boldHeader(text: string): `### ${string}` {
	return `### ${text}`;
}
