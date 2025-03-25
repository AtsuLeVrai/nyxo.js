import type { ApplicationEntity, OAuth2Scope, UserEntity } from "@nyxjs/core";

/**
 * Represents OAuth2 authorization information returned by the API
 * Contains details about the application, granted scopes, expiration time, and optionally user information
 *
 * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-authorization-information-response-structure}
 */
export interface AuthorizationEntity {
  /**
   * The application associated with this authorization
   * Partial application object with basic information
   */
  application: Partial<ApplicationEntity>;

  /**
   * The scopes that the user has authorized the application for
   * Array of OAuth2 scope strings
   */
  scopes: OAuth2Scope[];

  /**
   * When the access token expires
   * ISO8601 timestamp
   *
   * @format date-time
   */
  expires: string;

  /**
   * The user who has authorized, if the user has authorized with the 'identify' scope
   * Optional user object
   *
   * @optional
   */
  user?: UserEntity;
}
