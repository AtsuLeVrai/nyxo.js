import type { ISO8601, Oauth2Scopes } from "@nyxjs/core";
import type { RESTMakeRequestOptions } from "../globals/rest";
import type { ApplicationStructure } from "../structures/applications";
import type { UserStructure } from "../structures/users";

/**
 * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-authorization-information-response-structure}
 */
export type GetCurrentAuthorizationInformationResponse = {
	/**
	 * The current application
	 */
	application: Pick<ApplicationStructure, "bot_public" | "bot_require_code_grant" | "description" | "icon" | "id" | "name" | "verify_key">;
	/**
	 * When the access token expires
	 */
	expires: ISO8601;
	/**
	 * The scopes the user has authorized the application for
	 */
	scopes: Oauth2Scopes[];
	/**
	 * The user who has authorized, if the user has authorized with the identify scope
	 */
	user?: UserStructure;
};

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
