import { BaseRouter } from "../../bases/index.js";
import type { RouteBuilder } from "../../core/index.js";
import type { OAuth2Scope } from "../../enum/index.js";
import type { ApplicationEntity } from "../application/index.js";
import type { UserEntity } from "../user/index.js";

/**
 * @description Response structure for Discord OAuth2 current authorization information endpoint.
 * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-authorization-information}
 */
export interface RESTGetCurrentAuthorizationInformationResponseEntity {
  /**
   * @description Partial application object containing basic information about the current application.
   */
  application: Partial<ApplicationEntity>;

  /**
   * @description Array of OAuth2 scopes the user has authorized for the application.
   */
  scopes: OAuth2Scope[];

  /**
   * @description ISO8601 timestamp indicating when the access token expires.
   */
  expires: string;

  /**
   * @description User object containing information about the authorizing user (only present with identify scope).
   */
  user?: UserEntity;
}

/**
 * @description Discord OAuth2 API endpoint routes for bot application and authorization management.
 * @see {@link https://discord.com/developers/docs/topics/oauth2}
 */
export const OAuth2Routes = {
  getCurrentBotApplicationInformation: () => "/oauth2/applications/@me" as const,
  getCurrentAuthorizationInformation: () => "/oauth2/@me" as const,
} as const satisfies RouteBuilder;

/**
 * @description Discord OAuth2 router providing access to bot application information and current authorization details.
 * @see {@link https://discord.com/developers/docs/topics/oauth2}
 */
export class OAuth2Router extends BaseRouter {
  /**
   * @description Retrieves the bot's application information directly from Discord API.
   * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-bot-application-information}
   *
   * @returns Promise resolving to the bot's application object
   * @throws {Error} When using invalid bot token
   * @throws {Error} When hitting Discord API rate limits
   */
  getCurrentBotApplicationInformation(): Promise<ApplicationEntity> {
    return this.rest.get(OAuth2Routes.getCurrentBotApplicationInformation());
  }

  /**
   * @description Retrieves information about the current OAuth2 authorization with zero-cache approach.
   * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-authorization-information}
   *
   * @returns Promise resolving to current authorization information including scopes and expiration
   * @throws {Error} When using invalid bearer token
   * @throws {Error} When hitting Discord API rate limits
   */
  getCurrentAuthorizationInformation(): Promise<RESTGetCurrentAuthorizationInformationResponseEntity> {
    return this.rest.get(OAuth2Routes.getCurrentAuthorizationInformation());
  }
}
