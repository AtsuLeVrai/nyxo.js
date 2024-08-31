import type { IsoO8601Timestamp, Oauth2Scopes } from "@nyxjs/core";
import type { ApplicationStructure } from "../structures/applications";
import type { UserStructure } from "../structures/users";
import type { RestRequestOptions } from "../types/globals";

/**
 * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-authorization-information-response-structure}
 */
export type GetCurrentAuthorizationInformationResponse = {
	/**
	 * The current application
	 */
	application: Pick<
	ApplicationStructure,
	"bot_public" | "bot_require_code_grant" | "description" | "icon" | "id" | "name" | "verify_key"
	>;
	/**
	 * When the access token expires
	 */
	expires: IsoO8601Timestamp;
	/**
	 * The scopes the user has authorized the application for
	 */
	scopes: Oauth2Scopes[];
	/**
	 * The user who has authorized, if the user has authorized with the identify scope
	 */
	user?: UserStructure;
};

export const Oauth2Routes = {
	/**
	 * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-authorization-information}
	 */
	getCurrentAuthorizationInformation: (): RestRequestOptions<GetCurrentAuthorizationInformationResponse> => ({
		method: "GET",
		path: "/oauth2/@me",
	}),
	/**
	 * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-bot-application-information}
	 */
	getCurrentBotApplicationInformation: (): RestRequestOptions<ApplicationStructure> => ({
		method: "GET",
		path: "/oauth2/applications/@me",
	}),
};
