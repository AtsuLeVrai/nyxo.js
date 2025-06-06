import type { ApplicationEntity, OAuth2Scope, UserEntity } from "@nyxojs/core";
import type { Rest } from "../core/index.js";

/**
 * Represents OAuth2 authorization information returned by the API.
 * Contains details about a current OAuth2 authorization.
 *
 * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-authorization-information-response-structure}
 */
export interface AuthorizationResponse {
  /**
   * The application associated with this authorization.
   * Contains basic information about the application.
   */
  application: Partial<ApplicationEntity>;

  /**
   * The scopes that the user has authorized the application for.
   * Array of OAuth2 scope strings (e.g., "identify", "guilds").
   */
  scopes: OAuth2Scope[];

  /**
   * When the access token expires.
   * ISO8601 timestamp for token expiration.
   */
  expires: string;

  /**
   * The user who has authorized the application.
   * Only included if the authorization includes the 'identify' scope.
   */
  user?: UserEntity;
}

/**
 * Router for Discord OAuth2-related endpoints.
 * Provides methods to interact with authorization and application information.
 *
 * @see {@link https://discord.com/developers/docs/topics/oauth2}
 */
export class OAuth2Router {
  /**
   * API route constants for OAuth2-related endpoints.
   */
  static readonly OAUTH2_ROUTES = {
    /**
     * Route for getting information about the current application.
     * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-bot-application-information}
     */
    currentApplicationEndpoint: "/oauth2/applications/@me",

    /**
     * Route for getting information about the current authorization.
     * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-authorization-information}
     */
    currentAuthorizationEndpoint: "/oauth2/@me",
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new instance of a router.
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches information about the current bot application.
   * Requires authentication with a bot token.
   *
   * @returns A Promise resolving to the application object for the bot
   * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-bot-application-information}
   */
  fetchCurrentApplication(): Promise<ApplicationEntity> {
    return this.#rest.get(
      OAuth2Router.OAUTH2_ROUTES.currentApplicationEndpoint,
    );
  }

  /**
   * Fetches information about the current OAuth2 authorization.
   * Requires authentication with a bearer token.
   *
   * @returns A Promise resolving to information about the current authorization
   * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-authorization-information}
   */
  fetchCurrentAuthorization(): Promise<AuthorizationResponse> {
    return this.#rest.get(
      OAuth2Router.OAUTH2_ROUTES.currentAuthorizationEndpoint,
    );
  }
}
