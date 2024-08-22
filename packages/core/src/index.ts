/**
 * ./globals - Types
 */
export type { Snowflake, IsoO8601Timestamp, DataUriSchema, Float, Integer, GuildNavigationTypes, Boolean } from "./globals/formats";
export type { BotAuthParameters } from "./globals/oauth2";

/**
 * ./globals - Globals
 */
export { ApiVersions, TimestampStyles, ImageFormats } from "./globals/formats";
export { Locales } from "./globals/locales";
export { Oauth2Scopes, Oauth2Urls } from "./globals/oauth2";
export {
	GatewayCloseCodes,
	GatewayOpcodes,
	RestJsonErrorCodes,
	RpcCloseCodes,
	RpcErrorCodes,
	RestHttpResponseCodes,
	VoiceOpcodes,
} from "./globals/opcodes";
export {
	bigHeader,
	bold,
	blockQuote,
	codeBlock,
	channelFormat,
	customEmojiFormat,
	code,
	evenSmallerHeader,
	guildNavigationFormat,
	italic,
	link,
	quote,
	roleFormat,
	slashCommandFormat,
	smallHeader,
	spoiler,
	strikeThrough,
	subText,
	underline,
	unixTimestampFormat,
	userFormat,
} from "./globals/formats";

/**
 * The current version that you are currently using.
 *
 * Note to developers: This needs to explicitly be `string` so it is not typed as a "const string" that gets injected by esbuild
 */
// eslint-disable-next-line @typescript-eslint/no-inferrable-types
export const version: string = "[VI]{{inject}}[/VI]";
