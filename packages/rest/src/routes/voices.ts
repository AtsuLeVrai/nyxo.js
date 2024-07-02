import type { VoiceRegionStructure } from "@lunajs/core";
import type { RestRequestOptions } from "../globals/rest";

/**
 * @see {@link https://discord.com/developers/docs/resources/voice#list-voice-regions}
 */
export function listVoiceRegions(): RestRequestOptions<VoiceRegionStructure[]> {
	return {
		method: "GET",
		path: "/voice/regions",
	};
}
