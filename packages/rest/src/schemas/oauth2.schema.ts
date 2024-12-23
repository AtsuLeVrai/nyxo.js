import type {
  ApplicationEntity,
  Iso8601,
  OAuth2Scope,
  UserEntity,
} from "@nyxjs/core";

/**
 * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-authorization-information-response-structure}
 */
export interface AuthorizationEntity {
  application: Partial<ApplicationEntity>;
  scopes: OAuth2Scope[];
  expires: Iso8601;
  user?: UserEntity;
}
