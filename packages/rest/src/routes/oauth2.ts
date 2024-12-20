import type {
  ApplicationEntity,
  Iso8601,
  OAuth2Scope,
  UserEntity,
} from "@nyxjs/core";
import { BaseRouter } from "./base.js";

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

export class OAuth2Router extends BaseRouter {
  static routes = {
    authorize: "https://discord.com/oauth2/authorize" as const,
    token: "/oauth2/token" as const,
    tokenRevoke: "/oauth2/token/revoke" as const,
    currentApplication: "/oauth2/applications/@me" as const,
    currentAuthorization: "/oauth2/@me" as const,
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/topics/oauth2#authorization-code-grant-access-token-exchange}
   */
  exchangeCode(options: TokenExchangeEntity): Promise<TokenResponseEntity> {
    return this.post(OAuth2Router.routes.token, {
      body: JSON.stringify(options),
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/topics/oauth2#authorization-code-grant-refresh-token-exchange}
   */
  refreshToken(options: TokenRefreshEntity): Promise<TokenResponseEntity> {
    return this.post(OAuth2Router.routes.token, {
      body: JSON.stringify(options),
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/topics/oauth2#authorization-code-grant-token-revocation}
   */
  revokeToken(options: TokenRevokeEntity): Promise<void> {
    return this.post(OAuth2Router.routes.tokenRevoke, {
      body: JSON.stringify(options),
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/topics/oauth2#client-credentials-grant}
   */
  getClientCredentials(
    options: ClientCredentialsEntity,
  ): Promise<ClientCredentialsResponseEntity> {
    return this.post(OAuth2Router.routes.token, {
      body: JSON.stringify(options),
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-bot-application-information}
   */
  getCurrentApplication(): Promise<ApplicationEntity> {
    return this.get(OAuth2Router.routes.currentApplication);
  }

  /**
   * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-authorization-information}
   */
  getCurrentAuthorization(): Promise<AuthorizationEntity> {
    return this.get(OAuth2Router.routes.currentAuthorization);
  }
}
