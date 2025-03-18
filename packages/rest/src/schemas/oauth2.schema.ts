import { ApplicationEntity, OAuth2Scope, UserEntity } from "@nyxjs/core";
import { z } from "zod";

/**
 * Represents OAuth2 authorization information returned by the API
 * Contains details about the application, granted scopes, expiration time, and optionally user information
 *
 * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-authorization-information-response-structure}
 */
export const AuthorizationEntity = z.object({
  /**
   * The application associated with this authorization
   * Partial application object with basic information
   */
  application: z.lazy(() => ApplicationEntity.partial()),

  /**
   * The scopes that the user has authorized the application for
   * Array of OAuth2 scope strings
   */
  scopes: z.nativeEnum(OAuth2Scope).array(),

  /**
   * When the access token expires
   * ISO8601 timestamp
   */
  expires: z.string(),

  /**
   * The user who has authorized, if the user has authorized with the 'identify' scope
   * Optional user object
   */
  user: z.lazy(() => UserEntity).optional(),
});

export type AuthorizationEntity = z.infer<typeof AuthorizationEntity>;
