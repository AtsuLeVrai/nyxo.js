import type { ApplicationStructure, Iso8601Timestamp, OAuth2Scopes, UserStructure } from "@nyxjs/core";
import { RestMethods, type RouteStructure } from "../types/index.js";

/**
 * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-authorization-information-response-structure|Get Current Authorization Information Response Structure}
 */
export type GetCurrentAuthorizationInformationResponse = {
    /**
     * The current application.
     *
     * @todo Verify if this is a partial application object.
     */
    application: Pick<
        ApplicationStructure,
        "bot_public" | "bot_require_code_grant" | "description" | "icon" | "id" | "name" | "verify_key"
    >;
    /**
     * When the access token expires.
     */
    expires: Iso8601Timestamp;
    /**
     * The scopes the user has authorized the application for.
     */
    scopes: OAuth2Scopes[];
    /**
     * The user who has authorized, if the user has authorized with the identify scope.
     */
    user?: UserStructure;
};

export class OAuth2Routes {
    /**
     * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-authorization-information|Get Current Authorization Information}
     */
    static getCurrentAuthorizationInformation(): RouteStructure<GetCurrentAuthorizationInformationResponse> {
        return {
            method: RestMethods.Get,
            path: "/oauth2/@me",
        };
    }

    /**
     * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-bot-application-information|Get Current Bot Application Information}
     */
    static getCurrentBotApplicationInformation(): RouteStructure<ApplicationStructure> {
        return {
            method: RestMethods.Get,
            path: "/oauth2/applications/@me",
        };
    }
}
