import { Buffer } from "node:buffer";
import { createReadStream } from "node:fs";
import type { Readable } from "node:stream";
import type { RestHttpResponseCodes, Snowflake } from "@nyxjs/core";
import { FormData } from "undici";
import type { StickerPackStructure, StickerStructure } from "../structures/stickers";
import type { RestRequestOptions } from "../types/globals";

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#delete-guild-sticker}
 */
function deleteGuildSticker(guildId: Snowflake, stickerId: Snowflake, reason?: string): RestRequestOptions<RestHttpResponseCodes.NoContent> {
	return {
		method: "DELETE",
		path: `/guilds/${guildId}/stickers/${stickerId}`,
		headers: { ...reason && { "X-Audit-Log-Reason": reason } },
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#modify-guild-sticker-json-params}
 */
export type ModifyGuildStickerJsonParams = {
	/**
	 * Description of the sticker
	 */
	description?: string;
	/**
	 * Name of the sticker
	 */
	name?: string;
	/**
	 * Autocomplete/suggestion tags for the sticker
	 */
	tags?: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#modify-guild-sticker}
 */
function modifyGuildSticker(guildId: Snowflake, stickerId: Snowflake, json: ModifyGuildStickerJsonParams, reason?: string): RestRequestOptions<StickerStructure> {
	return {
		method: "PATCH",
		path: `/guilds/${guildId}/stickers/${stickerId}`,
		body: JSON.stringify(json),
		headers: { ...reason && { "X-Audit-Log-Reason": reason } },
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#create-guild-sticker-form-params}
 */
export type CreateGuildStickerFormParams = {
	/**
	 * Description of the sticker
	 */
	description: string;
	/**
	 * The sticker file to upload, must be a PNG, APNG, GIF, or Lottie JSON file, max 512 KiB
	 */
	file: Buffer | Readable | string;
	/**
	 * Name of the sticker
	 */
	name: string;
	/**
	 * Autocomplete/suggestion tags for the sticker
	 */
	tags: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#create-guild-sticker}
 */
function createGuildSticker(guildId: Snowflake, form: CreateGuildStickerFormParams, reason?: string): RestRequestOptions<StickerStructure> {
	const formData = new FormData();
	formData.append("name", form.name);
	formData.append("description", form.description);
	formData.append("tags", form.tags);

	if (typeof form.file === "string") {
		formData.append("file", createReadStream(form.file));
	} else if (Buffer.isBuffer(form.file)) {
		formData.append("file", new Blob([form.file]));
	} else {
		formData.append("file", form.file);
	}

	return {
		method: "POST",
		path: `/guilds/${guildId}/stickers`,
		body: formData,
		headers: { ...reason && { "X-Audit-Log-Reason": reason } },
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#get-guild-sticker}
 */
function getGuildSticker(guildId: Snowflake, stickerId: string): RestRequestOptions<StickerStructure> {
	return {
		method: "GET",
		path: `/guilds/${guildId}/stickers/${stickerId}`,
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#list-guild-stickers}
 */
function listGuildStickers(guildId: Snowflake): RestRequestOptions<StickerStructure[]> {
	return {
		method: "GET",
		path: `/guilds/${guildId}/stickers`,
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#get-sticker-pack}
 */
function getStickerPack(stickerPackId: Snowflake): RestRequestOptions<StickerPackStructure> {
	return {
		method: "GET",
		path: `/sticker-packs/${stickerPackId}`,
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
function listStickerPacks(): RestRequestOptions<ListStickerPacksResponse> {
	return {
		method: "GET",
		path: "/sticker-packs",
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#get-sticker}
 */
function getSticker(stickerId: Snowflake): RestRequestOptions<StickerStructure> {
	return {
		method: "GET",
		path: `/stickers/${stickerId}`,
	};
}

export const StickerRoutes = {
	deleteGuildSticker,
	modifyGuildSticker,
	createGuildSticker,
	getGuildSticker,
	listGuildStickers,
	getStickerPack,
	listStickerPacks,
	getSticker,
};
