import type { ApplicationEntity } from "@nyxjs/core";
import type {
  AuthorizationEntity,
  ClientCredentialsEntity,
  ClientCredentialsResponseEntity,
  TokenExchangeEntity,
  TokenRefreshEntity,
  TokenResponseEntity,
  TokenRevokeEntity,
} from "../types/index.js";
import { BaseRouter } from "./base.js";

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
