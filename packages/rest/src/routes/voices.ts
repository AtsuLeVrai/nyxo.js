import type { IsoO8601Timestamp, RestHttpResponseCodes, Snowflake } from "@nyxjs/core";
import type { RestRequestOptions } from "../globals/types";
import type { VoiceRegionStructure, VoiceStateStructure } from "../structures/voices";

/**
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-user-voice-state-json-params}
 */
export type ModifyUserVoiceStateJSONParams = {
	/**
	 * The id of the channel the user is currently in
	 */
	channel_id: Snowflake;
	/**
	 * Toggles the user's suppress state
	 */
	suppress?: boolean;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-current-user-voice-state-json-params}
 */
export type ModifyCurrentUserVoiceStateJSONParams = {
	/**
	 * The id of the channel the user is currently in
	 */
	channel_id?: Snowflake;
	/**
	 * Sets the user's request to speak
	 */
	request_to_speak_timestamp?: IsoO8601Timestamp;
	/**
	 * Toggles the user's suppress state
	 */
	suppress?: boolean;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-user-voice-state}
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-current-user-voice-state}
 */
function modifyUserVoiceState(guildId: Snowflake, userId: Snowflake | "@me", json: ModifyCurrentUserVoiceStateJSONParams | ModifyUserVoiceStateJSONParams): RestRequestOptions<RestHttpResponseCodes.NoContent> {
	return {
		method: "PATCH",
		path: `/guilds/${guildId}/voice-states/${userId}`,
		body: JSON.stringify(json),
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/voice#get-user-voice-state}
 * @see {@link https://discord.com/developers/docs/resources/voice#get-current-user-voice-state}
 */
function getUserVoiceState(guildId: Snowflake, userId: Snowflake | "@me"): RestRequestOptions<VoiceStateStructure> {
	return {
		method: "GET",
		path: `/guilds/${guildId}/voice-states/${userId}`,
	};
}

/**
 * @see {@link https://discord.com/developers/docs/resources/voice#list-voice-regions}
 */
function listVoiceRegions(): RestRequestOptions<VoiceRegionStructure[]> {
	return {
		method: "GET",
		path: "/voice/regions",
	};
}

export const VoiceRoutes = {
	modifyUserVoiceState,
	getUserVoiceState,
	listVoiceRegions,
};
