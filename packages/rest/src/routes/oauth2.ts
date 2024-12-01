import type {
  ApplicationEntity,
  Iso8601,
  OAuth2Scope,
  UserEntity,
} from "@nyxjs/core";
import { Router } from "./router.js";

/**
 * @see {@link https://discord.com/developers/docs/topics/oauth2#authorization-code-grant-redirect-url-example}
 */
export interface TokenExchange {
  grant_type: "authorization_code";
  code: string;
  redirect_uri: string;
}

/**
 * @see {@link https://discord.com/developers/docs/topics/oauth2#authorization-code-grant-access-token-response}
 */
export interface TokenRefresh {
  grant_type: "refresh_token";
  refresh_token: string;
}

/**
 * @see {@link https://discord.com/developers/docs/topics/oauth2#authorization-code-grant-token-revocation-example}
 */
export interface TokenRevoke {
  token: string;
  token_type_hint?: "access_token" | "refresh_token";
}

/**
 * @see {@link https://discord.com/developers/docs/topics/oauth2#client-credentials-grant}
 */
export interface ClientCredentials {
  grant_type: "client_credentials";
  scope?: OAuth2Scope;
}

/**
 * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-authorization-information-response-structure}
 */
interface AuthorizationEntity {
  application: ApplicationEntity;
  scopes: OAuth2Scope[];
  expires: Iso8601;
  user?: UserEntity;
}

export class OAuth2Router extends Router {
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
  exchangeCode(options: TokenExchange): Promise<{
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
  }> {
    return this.post(OAuth2Router.routes.token, {
      body: JSON.stringify(options),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/topics/oauth2#authorization-code-grant-refresh-token-exchange}
   */
  refreshToken(options: TokenRefresh): Promise<{
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
  }> {
    return this.post(OAuth2Router.routes.token, {
      body: JSON.stringify(options),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/topics/oauth2#authorization-code-grant-token-revocation}
   */
  revokeToken(options: TokenRevoke): Promise<void> {
    return this.post(OAuth2Router.routes.tokenRevoke, {
      body: JSON.stringify(options),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/topics/oauth2#client-credentials-grant}
   */
  getClientCredentials(options: ClientCredentials): Promise<{
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
  }> {
    return this.post(OAuth2Router.routes.token, {
      body: JSON.stringify(options),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
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
