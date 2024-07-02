import type { Buffer } from "node:buffer";
import type { Snowflake, StickerPackStructure, StickerStructure } from "@lunajs/core";
import { FormData } from "undici";
import type { RestRequestOptions } from "../globals/rest";

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#get-sticker}
 */
export function getSticker(stickerId: Snowflake): RestRequestOptions<StickerStructure> {
	return {
		method: "GET",
		path: `/stickers/${stickerId}`,
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#list-sticker-packs-response-structure}
 */
export type ListStickerPacksResponse = {
	/**
	 * Array of sticker pack objects
	 */
	sticker_packs: StickerPackStructure[];
};

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#list-sticker-packs}
 */
export function listStickerPacks(): RestRequestOptions<ListStickerPacksResponse> {
	return {
		method: "GET",
		path: "/sticker-packs",
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#list-guild-stickers}
 */
export function listGuildStickers(guildId: Snowflake): RestRequestOptions<StickerStructure[]> {
	return {
		method: "GET",
		path: `/guilds/${guildId}/stickers`,
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#get-guild-sticker}
 */
export function getGuildSticker(guildId: Snowflake, stickerId: Snowflake): RestRequestOptions<StickerStructure> {
	return {
		method: "GET",
		path: `/guilds/${guildId}/stickers/${stickerId}`,
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#create-guild-sticker-form-params}
 */
export type CreateGuildStickerForm = {
	/**
	 * Description of the sticker (empty or 2-100 characters)
	 */
	description: string;
	/**
	 * The sticker file to upload, must be a PNG, APNG, GIF, or Lottie JSON file, max 512 KiB
	 */
	file: Buffer;
	/**
	 * Name of the sticker (2-30 characters)
	 */
	name: string;
	/**
	 * Autocomplete/suggestion tags for the sticker (max 200 characters)
	 */
	tags: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#create-guild-sticker}
 */
export function createGuildSticker(guildId: Snowflake, reason: string, json: CreateGuildStickerForm): RestRequestOptions<StickerStructure> {
	const form = new FormData();
	form.append("description", json.description);
	form.append("name", json.name);
	form.append("tags", json.tags);
	form.append("file", json.file, "sticker.png");

	return {
		method: "POST",
		path: `/guilds/${guildId}/stickers`,
		body: form,
		headers: {
			"X-Audit-Log-Reason": reason,
			"Content-Type": "multipart/form-data",
		},
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#modify-guild-sticker-json-params}
 */
export type ModifyGuildStickerJSON = {
	/**
	 * Description of the sticker (empty or 2-100 characters)
	 */
	description?: string;
	/**
	 * Name of the sticker (2-30 characters)
	 */
	name?: string;
	/**
	 * Autocomplete/suggestion tags for the sticker (max 200 characters)
	 */
	tags?: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#modify-guild-sticker}
 */
export function modifyGuildSticker(guildId: Snowflake, stickerId: Snowflake, reason: string, json: ModifyGuildStickerJSON): RestRequestOptions<StickerStructure> {
	return {
		method: "PATCH",
		path: `/guilds/${guildId}/stickers/${stickerId}`,
		body: JSON.stringify(json),
		headers: { "X-Audit-Log-Reason": reason },
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#delete-guild-sticker}
 */
export function deleteGuildSticker(guildId: Snowflake, stickerId: Snowflake, reason: string): RestRequestOptions<void> {
	return {
		method: "DELETE",
		path: `/guilds/${guildId}/stickers/${stickerId}`,
		headers: { "X-Audit-Log-Reason": reason },
	};
}
