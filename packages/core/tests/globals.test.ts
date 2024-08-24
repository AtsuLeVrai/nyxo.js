import { describe, expect, it } from "vitest";
import {
	bigHeader,
	bold,
	channelFormat,
	codeBlock,
	customEmojiFormat,
	evenSmallerHeader,
	GatewayOpcodes,
	italic,
	link,
	Locales,
	Oauth2Scopes,
	RestHttpResponseCodes,
	roleFormat,
	slashCommandFormat,
	smallHeader,
	spoiler,
	strikeThrough,
	TimestampStyles,
	underline,
	unixTimestampFormat,
	userFormat,
} from "../src";

describe("formats.ts", () => {
	it("should format user mentions correctly", () => {
		expect(userFormat("123456789")).toBe("<@123456789>");
	});

	it("should format channel mentions correctly", () => {
		expect(channelFormat("987654321")).toBe("<#987654321>");
	});

	it("should format role mentions correctly", () => {
		expect(roleFormat("456789123")).toBe("<@&456789123>");
	});

	it("should format slash commands correctly", () => {
		expect(slashCommandFormat("test", "123")).toBe("</test:123>");
		expect(slashCommandFormat("test", "123", "sub")).toBe("</test sub:123>");
		expect(slashCommandFormat("test", "123", "group", "sub")).toBe("</test group sub:123>");
	});

	it("should format custom emojis correctly", () => {
		expect(customEmojiFormat("smile", "789")).toBe("<:smile:789>");
		expect(customEmojiFormat("dance", "456", true)).toBe("<a:dance:456>");
	});

	it("should format timestamps correctly", () => {
		expect(unixTimestampFormat(1_609_459_200)).toBe("<t:1609459200>");
		expect(unixTimestampFormat(1_609_459_200, TimestampStyles.ShortDateTime)).toBe("<t:1609459200:f>");
	});

	it("should format text styles correctly", () => {
		expect(italic("test")).toBe("_test_");
		expect(bold("test")).toBe("**test**");
		expect(underline("test")).toBe("__test__");
		expect(strikeThrough("test")).toBe("~~test~~");
		expect(spoiler("test")).toBe("||test||");
	});

	it("should format headers correctly", () => {
		expect(bigHeader("test")).toBe("# test");
		expect(smallHeader("test")).toBe("## test");
		expect(evenSmallerHeader("test")).toBe("### test");
	});

	it("should format links correctly", () => {
		expect(link("https://example.com", "Example")).toBe("[Example](https://example.com)");
	});

	it("should format code blocks correctly", () => {
		expect(codeBlock("js", "console.log(\"test\")")).toBe("```js\nconsole.log(\"test\")\n```");
	});
});

describe("locales.ts", () => {
	it("should have correct locale values", () => {
		expect(Locales.EnglishUs).toBe("en-US");
		expect(Locales.French).toBe("fr");
		expect(Locales.German).toBe("de");
	});
});

describe("oauth2.ts", () => {
	it("should have correct OAuth2 scope values", () => {
		expect(Oauth2Scopes.Identify).toBe("identify");
		expect(Oauth2Scopes.Email).toBe("email");
		expect(Oauth2Scopes.Connections).toBe("connections");
	});
});

describe("opcodes.ts", () => {
	it("should have correct Gateway opcode values", () => {
		expect(GatewayOpcodes.Dispatch).toBe(0);
		expect(GatewayOpcodes.Heartbeat).toBe(1);
		expect(GatewayOpcodes.Identify).toBe(2);
	});

	it("should have correct REST HTTP response code values", () => {
		expect(RestHttpResponseCodes.Ok).toBe(200);
		expect(RestHttpResponseCodes.BadRequest).toBe(400);
		expect(RestHttpResponseCodes.Unauthorized).toBe(401);
	});
});
