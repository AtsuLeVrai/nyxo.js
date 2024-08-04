import type { RESTMakeRequestOptions } from "../globals/rest";
import type { VoiceRegionStructure } from "../structures/voices";

/**
 * @see {@link https://discord.com/developers/docs/resources/voice#list-voice-regions}
 */
export function listVoiceRegions(): RESTMakeRequestOptions<
	VoiceRegionStructure[]
> {
	return {
		method: "GET",
		path: "/voice/regions",
	};
}
