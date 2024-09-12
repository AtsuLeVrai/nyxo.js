import type { ApplicationStructure, IsoO8601Timestamp, Oauth2Scopes, UserStructure } from "@nyxjs/core";
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

export class Oauth2Routes {
    /**
     * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-authorization-information}
     */
    public static getCurrentAuthorizationInformation(): RestRequestOptions<GetCurrentAuthorizationInformationResponse> {
        return {
            method: "GET",
            path: "/oauth2/@me",
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-bot-application-information}
     */
    public static getCurrentBotApplicationInformation(): RestRequestOptions<ApplicationStructure> {
        return {
            method: "GET",
            path: "/oauth2/applications/@me",
        };
    }
}
