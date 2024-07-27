import type { RESTMakeRequestOptions } from "../globals/rest";
import type { GetCurrentAuthorizationInformationResponse } from "../pipes/oauth2";
import type { ApplicationStructure } from "../structures/applications";

/**
 * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-authorization-information}
 */
export function getCurrentAuthorizationInformation(): RESTMakeRequestOptions<GetCurrentAuthorizationInformationResponse> {
	return {
		method: "GET",
		path: "/oauth2/@me",
	};
}

/**
 * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-bot-application-information}
 */
export function getCurrentBotApplicationInformation(): RESTMakeRequestOptions<ApplicationStructure> {
	return {
		method: "GET",
		path: "/oauth2/applications/@me",
	};
}
