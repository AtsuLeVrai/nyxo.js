import type { ApplicationEntity } from "@nyxjs/core";
import type { Rest } from "../core/index.js";
import type { AuthorizationEntity } from "../schemas/index.js";

/**
 * Router class for Discord OAuth2-related endpoints
 * Provides methods to retrieve information about the current application and authorization
 *
 * @see {@link https://discord.com/developers/docs/topics/oauth2}
 */
// biome-ignore lint/style/useNamingConvention: This is a router class, not an entity class
export class OAuth2Router {
  /**
   * Collection of route URLs for OAuth2-related endpoints
   */
  static readonly ROUTES = {
    /**
     * Route for getting information about the current application
     * Returns the bot's application object
     * @returns `/oauth2/applications/@me` route
     * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-bot-application-information}
     */
    oauth2CurrentApplication: "/oauth2/applications/@me" as const,

    /**
     * Route for getting information about the current authorization
     * Returns details about the authorized scopes, application, and possibly user
     * @returns `/oauth2/@me` route
     * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-authorization-information}
     */
    oauth2CurrentAuthorization: "/oauth2/@me" as const,
  } as const;

  /** The REST client used for making API requests */
  readonly #rest: Rest;

  /**
   * Creates a new OAuth2Router instance
   * @param rest - The REST client used to make requests to the Discord API
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Retrieves information about the current bot application
   * This endpoint requires authentication with a bot token
   * Returns details about the application such as id, name, icon, description, and other app-specific information
   *
   * @returns The application object for the bot
   * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-bot-application-information}
   */
  getCurrentBotApplicationInformation(): Promise<ApplicationEntity> {
    return this.#rest.get(OAuth2Router.ROUTES.oauth2CurrentApplication);
  }

  /**
   * Retrieves information about the current authorization
   * This endpoint requires authentication with a bearer token
   * Returns details about the authorized scopes, application, and user (if the identify scope was authorized)
   *
   * @returns Information about the current authorization
   * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-authorization-information}
   */
  getCurrentAuthorizationInformation(): Promise<AuthorizationEntity> {
    return this.#rest.get(OAuth2Router.ROUTES.oauth2CurrentAuthorization);
  }
}
