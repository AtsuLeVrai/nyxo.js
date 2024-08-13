export type Snowflake = string;
export type Integer = number;
export type Float = number;
export type IsoO8601Timestamp = string;
export type DataUriSchema = string;

/**
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-guild-navigation-types}
 */
export type GuildNavigationTypes = "browse" | "customize" | "guide";

/**
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
 * @see {@link https://discord.com/developers/docs/reference#image-formatting-image-formats}
 */
export enum ImageFormats {
	GIF = "gif",
	JPEG = "jpeg",
	Lottie = "json",
	PNG = "png",
	WebP = "webp",
}

export function userFormat(userId: Snowflake): `<@${Snowflake}>` {
	return `<@${userId}>`;
}

export function channelFormat(channelId: Snowflake): `<#${Snowflake}>` {
	return `<#${channelId}>`;
}

export function roleFormat(roleId: Snowflake): `<@&${Snowflake}>` {
	return `<@&${roleId}>`;
}

export function slashCommandFormat(
	commandName: string,
	commandId: Snowflake,
): `</${string}:${Snowflake}>`;
export function slashCommandFormat(
	commandName: string,
	commandId: Snowflake,
	subCommandName: string,
): `</${string} ${string}:${Snowflake}>`;
export function slashCommandFormat(
	commandName: string,
	commandId: Snowflake,
	subCommandGroupName: string,
	subCommandName: string,
): `</${string} ${string} ${string}:${Snowflake}>`;
export function slashCommandFormat(
	commandName: string,
	commandId: Snowflake,
	subCommandGroupName?: string,
	subCommandName?: string,
): string {
	if (subCommandGroupName && subCommandName) {
		return `</${commandName} ${subCommandGroupName} ${subCommandName}:${commandId}>`;
	}

	if (subCommandName) {
		return `</${commandName} ${subCommandName}:${commandId}>`;
	}

	return `</${commandName}:${commandId}>`;
}

export function customEmojiFormat(
	emojiName: string,
	emojiId: Snowflake,
): `<:${string}:${Snowflake}>`;
export function customEmojiFormat(
	emojiName: string,
	emojiId: Snowflake,
	animated: true,
): `<a:${string}:${Snowflake}>`;
export function customEmojiFormat(
	emojiName: string,
	emojiId: Snowflake,
	animated?: boolean,
): string {
	if (animated) {
		return `<a:${emojiName}:${emojiId}>`;
	}

	return `<:${emojiName}:${emojiId}>`;
}

export function unixTimestampFormat(timestamp: number): `<t:${number}>`;
export function unixTimestampFormat(
	timestamp: number,
	style: TimestampStyles,
): `<t:${number}:${TimestampStyles}>`;
export function unixTimestampFormat(
	timestamp: number,
	style?: TimestampStyles,
): string {
	if (style) {
		return `<t:${timestamp}:${style}>`;
	}

	return `<t:${timestamp}>`;
}

export function guildNavigationFormat(id: Snowflake, type: GuildNavigationTypes): `<${Snowflake}:${GuildNavigationTypes}>` {
	return `<${id}:${type}>`;
}

export function italic(text: string): `_${string}_` {
	return `_${text}_`;
}

export function bold(text: string): `**${string}**` {
	return `**${text}**`;
}

export function underline(text: string): `__${string}__` {
	return `__${text}__`;
}

export function strikeThrough(text: string): `~~${string}~~` {
	return `~~${text}~~`;
}

export function spoiler(text: string): `||${string}||` {
	return `||${text}||`;
}

export function bigHeader(text: string): `# ${string}` {
	return `# ${text}`;
}

export function smallHeader(text: string): `## ${string}` {
	return `## ${text}`;
}

export function evenSmallerHeader(text: string): `### ${string}` {
	return `### ${text}`;
}

export function subText(text: string): `-# ${string}` {
	return `-# ${text}`;
}

export function link(url: string, text: string): `[${string}](${string})` {
	return `[${text}](${url})`;
}

export function code(text: string): `\`${string}\`` {
	return `\`${text}\``;
}

export function codeBlock(language: string, text: string): `\`\`\`${string}\n${string}\n\`\`\`` {
	return `\`\`\`${language}\n${text}\n\`\`\``;
}

export function quote(text: string): `> ${string}` {
	return `> ${text}`;
}

export function blockQuote(text: string): `>>> ${string}` {
	return `>>> ${text}`;
}
