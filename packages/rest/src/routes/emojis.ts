import type { EmojiStructure, Snowflake } from "@lunajs/core";
import type { RestRequestOptions } from "../globals/rest";

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#list-guild-emojis}
 */
export function listGuildEmojis(guildId: Snowflake): RestRequestOptions<EmojiStructure[]> {
	return {
		method: "GET",
		path: `/guilds/${guildId}/emojis`,
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
 * @see {@link https://discord.com/developers/docs/resources/emoji#create-guild-emoji-json-params}
 */
export type CreateGuildEmojiJSON = {
	/**
	 * Image data, the 128x128 emoji image
	 */
	image: string;
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
export function createGuildEmoji(guildId: Snowflake, reason: string, json: CreateGuildEmojiJSON): RestRequestOptions<EmojiStructure> {
	return {
		method: "POST",
		path: `/guilds/${guildId}/emojis`,
		body: JSON.stringify(json),
		headers: { "X-Audit-Log-Reason": reason },
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#modify-guild-emoji-json-params}
 */
export type ModifyGuildEmojiJSON = {
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
export function modifyGuildEmoji(guildId: Snowflake, emojiId: Snowflake, reason: string, json: ModifyGuildEmojiJSON): RestRequestOptions<EmojiStructure> {
	return {
		method: "PATCH",
		path: `/guilds/${guildId}/emojis/${emojiId}`,
		body: JSON.stringify(json),
		headers: { "X-Audit-Log-Reason": reason },
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#delete-guild-emoji}
 */
export function deleteGuildEmoji(guildId: Snowflake, emojiId: Snowflake, reason: string): RestRequestOptions<void> {
	return {
		method: "DELETE",
		path: `/guilds/${guildId}/emojis/${emojiId}`,
		headers: { "X-Audit-Log-Reason": reason },
	};
}
