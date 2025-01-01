import type { ApplicationEntity, OAuth2Scope, UserEntity } from "@nyxjs/core";

/**
 * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-authorization-information-response-structure}
 */
export interface AuthorizationEntity {
  application: Partial<ApplicationEntity>;
  scopes: OAuth2Scope[];
  expires: string;
  user?: UserEntity;
}
