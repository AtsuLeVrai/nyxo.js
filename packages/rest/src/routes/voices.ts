import type { RestHttpResponseCodes, Snowflake } from "@nyxjs/core";
import type { VoiceRegionStructure, VoiceStateStructure } from "../structures/voices";
import type { RestRequestOptions } from "../types/globals";

/**
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-user-voice-state-json-params}
 */
export type ModifyUserVoiceStateJSONParams = Pick<VoiceStateStructure, "channel_id" | "suppress">;

/**
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-current-user-voice-state-json-params}
 */
export type ModifyCurrentUserVoiceStateJSONParams = Partial<
Pick<VoiceStateStructure, "channel_id" | "request_to_speak_timestamp" | "suppress">
>;

export const VoiceRoutes = {
	/**
	 * @see {@link https://discord.com/developers/docs/resources/voice#modify-user-voice-state}
	 * @see {@link https://discord.com/developers/docs/resources/voice#modify-current-user-voice-state}
	 */
	modifyUserVoiceState: (
		guildId: Snowflake,
		userId: Snowflake | "@me",
		json: ModifyCurrentUserVoiceStateJSONParams | ModifyUserVoiceStateJSONParams,
	): RestRequestOptions<RestHttpResponseCodes.NoContent> => ({
		method: "PATCH",
		path: `/guilds/${guildId}/voice-states/${userId}`,
		body: JSON.stringify(json),
	}),
	/**
	 * @see {@link https://discord.com/developers/docs/resources/voice#get-user-voice-state}
	 * @see {@link https://discord.com/developers/docs/resources/voice#get-current-user-voice-state}
	 */
	getUserVoiceState: (guildId: Snowflake, userId: Snowflake | "@me"): RestRequestOptions<VoiceStateStructure> => ({
		method: "GET",
		path: `/guilds/${guildId}/voice-states/${userId}`,
	}),
	/**
	 * @see {@link https://discord.com/developers/docs/resources/voice#list-voice-regions}
	 */
	listVoiceRegions: (): RestRequestOptions<VoiceRegionStructure[]> => ({
		method: "GET",
		path: "/voice/regions",
	}),
};
