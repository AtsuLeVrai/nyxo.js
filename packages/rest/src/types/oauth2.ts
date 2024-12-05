import type {
  ApplicationEntity,
  Iso8601,
  OAuth2Scope,
  UserEntity,
} from "@nyxjs/core";

/**
 * @see {@link https://discord.com/developers/docs/topics/oauth2#authorization-code-grant-redirect-url-example}
 */
export interface TokenExchangeEntity {
  grant_type: "authorization_code";
  code: string;
  redirect_uri: string;
}

/**
 * @see {@link https://discord.com/developers/docs/topics/oauth2#authorization-code-grant-access-token-response}
 */
export interface TokenRefreshEntity {
  grant_type: "refresh_token";
  refresh_token: string;
}

/**
 * @see {@link https://discord.com/developers/docs/topics/oauth2#authorization-code-grant-token-revocation-example}
 */
export interface TokenRevokeEntity {
  token: string;
  token_type_hint?: "access_token" | "refresh_token";
}

/**
 * @see {@link https://discord.com/developers/docs/topics/oauth2#client-credentials-grant}
 */
export interface ClientCredentialsEntity {
  grant_type: "client_credentials";
  scope?: OAuth2Scope;
}

/**
 * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-authorization-information-response-structure}
 */
export interface AuthorizationEntity {
  application: ApplicationEntity;
  scopes: OAuth2Scope[];
  expires: Iso8601;
  user?: UserEntity;
}

export interface TokenResponseEntity {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface ClientCredentialsResponseEntity {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}
