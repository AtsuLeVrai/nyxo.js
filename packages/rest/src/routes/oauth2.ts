import type {
  ApplicationEntity,
  Iso8601,
  OAuth2Scope,
  UserEntity,
} from "@nyxjs/core";
import type { Rest } from "../core/index.js";

interface TokenExchange {
  grant_type: "authorization_code";
  code: string;
  redirect_uri: string;
}

interface TokenRefresh {
  grant_type: "refresh_token";
  refresh_token: string;
}

interface TokenRevoke {
  token: string;
  token_type_hint?: "access_token" | "refresh_token";
}

interface ClientCredentials {
  grant_type: "client_credentials";
  scope?: string;
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

export class OAuth2Routes {
  static routes = {
    authorize: "https://discord.com/oauth2/authorize" as const,
    token: "/oauth2/token" as const,
    tokenRevoke: "/oauth2/token/revoke" as const,
    currentApplication: "/oauth2/applications/@me" as const,
    currentAuthorization: "/oauth2/@me" as const,
  } as const;

  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

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
    return this.#rest.post(OAuth2Routes.routes.token, {
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
    return this.#rest.post(OAuth2Routes.routes.token, {
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
    return this.#rest.post(OAuth2Routes.routes.tokenRevoke, {
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
    return this.#rest.post(OAuth2Routes.routes.token, {
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
    return this.#rest.get(OAuth2Routes.routes.currentApplication);
  }

  /**
   * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-authorization-information}
   */
  getCurrentAuthorization(): Promise<AuthorizationEntity> {
    return this.#rest.get(OAuth2Routes.routes.currentAuthorization);
  }
}
