import type { ApplicationEntity, OAuth2Scope, UserEntity } from "@nyxojs/core";
import type { Rest } from "../core/index.js";

/**
 * Represents OAuth2 authorization information returned by the API.
 *
 * Contains comprehensive details about a current OAuth2 authorization,
 * including the application data, granted scopes, token expiration time,
 * and optionally information about the authorized user.
 *
 * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-authorization-information-response-structure}
 */
export interface Authorization {
  /**
   * The application associated with this authorization.
   *
   * Contains a partial application object with basic information about
   * the application that the token was issued for. This includes fields
   * like id, name, icon, and description.
   */
  application: Partial<ApplicationEntity>;

  /**
   * The scopes that the user has authorized the application for.
   *
   * Array of OAuth2 scope strings (e.g., "identify", "guilds", "email").
   * These scopes define what actions and data the application is permitted
   * to access on behalf of the user.
   */
  scopes: OAuth2Scope[];

  /**
   * When the access token expires.
   *
   * ISO8601 timestamp indicating when the current access token will expire.
   * After this time, the token must be refreshed using a refresh token.
   */
  expires: string;

  /**
   * The user who has authorized the application.
   *
   * Only included if the authorization includes the 'identify' scope.
   * Contains information about the user who granted the authorization.
   */
  user?: UserEntity;
}

/**
 * Router for Discord OAuth2-related endpoints.
 *
 * This class provides methods to interact with Discord's OAuth2 system,
 * which powers third-party application authorization and token-based authentication.
 * It allows retrieving information about the current application and user authorizations.
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
     *
     * This endpoint returns the bot's application object, including
     * details about the application's identity, settings, and team.
     *
     * @returns The formatted API route string
     * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-bot-application-information}
     */
    currentApplicationEndpoint: "/oauth2/applications/@me",

    /**
     * Route for getting information about the current authorization.
     *
     * This endpoint returns details about the authorized scopes,
     * application data, and possibly user information for the current token.
     *
     * @returns The formatted API route string
     * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-authorization-information}
     */
    currentAuthorizationEndpoint: "/oauth2/@me",
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new OAuth2 Router instance.
   *
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches information about the current bot application.
   *
   * This method retrieves detailed information about the application associated
   * with the current bot token, including its name, description, icon, team
   * ownership, and other application-specific settings.
   *
   * @returns A Promise resolving to the application object for the bot
   * @throws {Error} Will throw an error if not authenticated with a bot token
   *
   * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-bot-application-information}
   *
   * @note This endpoint requires authentication with a bot token.
   */
  fetchCurrentApplication(): Promise<ApplicationEntity> {
    return this.#rest.get(
      OAuth2Router.OAUTH2_ROUTES.currentApplicationEndpoint,
    );
  }

  /**
   * Fetches information about the current OAuth2 authorization.
   *
   * This method retrieves detailed information about the current authorization,
   * including which application it's for, what scopes have been granted,
   * when the token expires, and optionally information about the user who
   * granted the authorization.
   *
   * @returns A Promise resolving to information about the current authorization
   * @throws {Error} Will throw an error if not authenticated with a bearer token
   *
   * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-authorization-information}
   *
   * @note This endpoint requires authentication with a bearer token.
   */
  fetchCurrentAuthorization(): Promise<Authorization> {
    return this.#rest.get(
      OAuth2Router.OAUTH2_ROUTES.currentAuthorizationEndpoint,
    );
  }
}
