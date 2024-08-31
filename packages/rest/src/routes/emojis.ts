import type { DataUriSchema, RestHttpResponseCodes, Snowflake } from "@nyxjs/core";
import type { EmojiStructure } from "../structures/emojis";
import type { RestRequestOptions } from "../types/globals";

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

export const EmojiRoutes = {
	/**
	 * @see {@link https://discord.com/developers/docs/resources/emoji#delete-application-emoji}
	 */
	deleteApplicationEmoji: (
		applicationId: Snowflake,
		emojiId: Snowflake,
	): RestRequestOptions<RestHttpResponseCodes.NoContent> => ({
		method: "DELETE",
		path: `/applications/${applicationId}/emojis/${emojiId}`,
	}),
	/**
	 * @see {@link https://discord.com/developers/docs/resources/emoji#modify-application-emoji}
	 */
	modifyApplicationEmoji: (
		applicationId: Snowflake,
		emojiId: Snowflake,
		json: ModifyApplicationEmojiJsonParams,
	): RestRequestOptions<EmojiStructure> => ({
		method: "PATCH",
		path: `/applications/${applicationId}/emojis/${emojiId}`,
		body: JSON.stringify(json),
	}),
	/**
	 * @see {@link https://discord.com/developers/docs/resources/emoji#create-application-emoji}
	 */
	createApplicationEmoji: (
		applicationId: Snowflake,
		json: CreateApplicationEmojiJsonParams,
	): RestRequestOptions<EmojiStructure | RestHttpResponseCodes.BadRequest> => ({
		method: "POST",
		path: `/applications/${applicationId}/emojis`,
		body: JSON.stringify(json),
	}),
	/**
	 * @see {@link https://discord.com/developers/docs/resources/emoji#get-application-emoji}
	 */
	getApplicationEmoji: (applicationId: Snowflake, emojiId: Snowflake): RestRequestOptions<EmojiStructure> => ({
		method: "GET",
		path: `/applications/${applicationId}/emojis/${emojiId}`,
	}),
	/**
	 * @see {@link https://discord.com/developers/docs/resources/emoji#list-application-emojis}
	 */
	listApplicationEmojis: (applicationId: Snowflake): RestRequestOptions<{ items: EmojiStructure[]; }> => ({
		method: "GET",
		path: `/applications/${applicationId}/emojis`,
	}),
	/**
	 * @see {@link https://discord.com/developers/docs/resources/emoji#delete-guild-emoji}
	 */
	deleteGuildEmoji: (
		guildId: Snowflake,
		emojiId: Snowflake,
		reason?: string,
	): RestRequestOptions<RestHttpResponseCodes.NoContent> => ({
		method: "DELETE",
		path: `/guilds/${guildId}/emojis/${emojiId}`,
		headers: { ...reason && { "X-Audit-Log-Reason": reason } },
	}),
	/**
	 * @see {@link https://discord.com/developers/docs/resources/emoji#modify-guild-emoji}
	 */
	modifyGuildEmoji: (
		guildId: Snowflake,
		emojiId: Snowflake,
		json: ModifyGuildEmojiJsonParams,
		reason?: string,
	): RestRequestOptions<EmojiStructure> => ({
		method: "PATCH",
		path: `/guilds/${guildId}/emojis/${emojiId}`,
		body: JSON.stringify(json),
		headers: { ...reason && { "X-Audit-Log-Reason": reason } },
	}),
	/**
	 * @see {@link https://discord.com/developers/docs/resources/emoji#create-guild-emoji}
	 */
	createGuildEmoji: (
		guildId: Snowflake,
		json: CreateGuildEmojiJsonParams,
		reason?: string,
	): RestRequestOptions<EmojiStructure> => ({
		method: "POST",
		path: `/guilds/${guildId}/emojis`,
		body: JSON.stringify(json),
		headers: { ...reason && { "X-Audit-Log-Reason": reason } },
	}),
	/**
	 * @see {@link https://discord.com/developers/docs/resources/emoji#get-guild-emoji}
	 */
	getGuildEmoji: (guildId: Snowflake, emojiId: Snowflake): RestRequestOptions<EmojiStructure> => ({
		method: "GET",
		path: `/guilds/${guildId}/emojis/${emojiId}`,
	}),
	/**
	 * @see {@link https://discord.com/developers/docs/resources/emoji#list-guild-emojis}
	 */
	listGuildEmojis: (guildId: Snowflake): RestRequestOptions<EmojiStructure[]> => ({
		method: "GET",
		path: `/guilds/${guildId}/emojis`,
	}),
};
