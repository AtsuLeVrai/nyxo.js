import type { DataUriSchema, RestHttpResponseCodes, Snowflake } from "@nyxjs/core";
import type { RestRequestOptions } from "../globals/rest";
import type { EmojiStructure } from "../structures/emojis";

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#delete-application-emoji}
 */
export function deleteApplicationEmoji(applicationId: Snowflake, emojiId: Snowflake): RestRequestOptions<RestHttpResponseCodes.NoContent> {
	return {
		method: "DELETE",
		path: `/applications/${applicationId}/emojis/${emojiId}`,
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#modify-application-emoji-json-params}
 */
export type ModifyApplicationEmojiJsonParams = {
	/**
	 * Name of the emoji
	 */
	name?: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#modify-application-emoji}
 */
export function modifyApplicationEmoji(applicationId: Snowflake, emojiId: Snowflake, json: ModifyApplicationEmojiJsonParams): RestRequestOptions<EmojiStructure> {
	return {
		method: "PATCH",
		path: `/applications/${applicationId}/emojis/${emojiId}`,
		body: JSON.stringify(json),
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#create-application-emoji-json-params}
 */
export type CreateApplicationEmojiJsonParams = {
	/**
	 * The 128x128 emoji image
	 */
	image: DataUriSchema;
	/**
	 * Name of the emoji
	 */
	name: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#create-application-emoji}
 */
export function createApplicationEmoji(applicationId: Snowflake, json: CreateApplicationEmojiJsonParams): RestRequestOptions<EmojiStructure | RestHttpResponseCodes.BadRequest> {
	return {
		method: "POST",
		path: `/applications/${applicationId}/emojis`,
		body: JSON.stringify(json),
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#get-application-emoji}
 */
export function getApplicationEmoji(applicationId: Snowflake, emojiId: Snowflake): RestRequestOptions<EmojiStructure> {
	return {
		method: "GET",
		path: `/applications/${applicationId}/emojis/${emojiId}`,
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#list-application-emojis}
 */
export function listApplicationEmojis(applicationId: Snowflake): RestRequestOptions<{ items: EmojiStructure[]; }> {
	return {
		method: "GET",
		path: `/applications/${applicationId}/emojis`,
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#delete-guild-emoji}
 */
export function deleteGuildEmoji(guildId: Snowflake, emojiId: Snowflake, reason?: string): RestRequestOptions<RestHttpResponseCodes.NoContent> {
	return {
		method: "DELETE",
		path: `/guilds/${guildId}/emojis/${emojiId}`,
		headers: { ...reason && { "X-Audit-Log-Reason": reason } },
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#modify-guild-emoji-json-params}
 */
export type ModifyGuildEmojiJsonParams = {
	/**
	 * Name of the emoji
	 */
	name?: string;
	/**
	 * Roles allowed to use this emoji
	 */
	roles?: Snowflake[] | null;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#modify-guild-emoji}
 */
export function modifyGuildEmoji(guildId: Snowflake, emojiId: Snowflake, json: ModifyGuildEmojiJsonParams, reason?: string): RestRequestOptions<EmojiStructure> {
	return {
		method: "PATCH",
		path: `/guilds/${guildId}/emojis/${emojiId}`,
		body: JSON.stringify(json),
		headers: { ...reason && { "X-Audit-Log-Reason": reason } },
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#create-guild-emoji-json-params}
 */
export type CreateGuildEmojiJsonParams = {
	/**
	 * The 128x128 emoji image
	 */
	image: DataUriSchema;
	/**
	 * Name of the emoji
	 */
	name: string;
	/**
	 * Roles allowed to use this emoji
	 */
	roles?: Snowflake[];
};

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#create-guild-emoji}
 */
export function createGuildEmoji(guildId: Snowflake, json: CreateGuildEmojiJsonParams, reason?: string): RestRequestOptions<EmojiStructure> {
	return {
		method: "POST",
		path: `/guilds/${guildId}/emojis`,
		body: JSON.stringify(json),
		headers: { ...reason && { "X-Audit-Log-Reason": reason } },
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#get-guild-emoji}
 */
export function getGuildEmoji(guildId: Snowflake, emojiId: Snowflake): RestRequestOptions<EmojiStructure> {
	return {
		method: "GET",
		path: `/guilds/${guildId}/emojis/${emojiId}`,
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#list-guild-emojis}
 */
export function listGuildEmojis(guildId: Snowflake): RestRequestOptions<EmojiStructure[]> {
	return {
		method: "GET",
		path: `/guilds/${guildId}/emojis`,
	};
}
