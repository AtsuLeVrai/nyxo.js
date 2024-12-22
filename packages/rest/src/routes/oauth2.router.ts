import type {
  ApplicationEntity,
  Iso8601,
  OAuth2Scope,
  UserEntity,
} from "@nyxjs/core";
import { BaseRouter } from "../base/index.js";

/**
 * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-authorization-information-response-structure}
 */
export interface AuthorizationEntity {
  application: Partial<ApplicationEntity>;
  scopes: OAuth2Scope[];
  expires: Iso8601;
  user?: UserEntity;
}

// biome-ignore lint/style/useNamingConvention: This is a router class, not an entity class
export class OAuth2Router extends BaseRouter {
  static ROUTES = {
    currentApplication: "/oauth2/applications/@me" as const,
    currentAuthorization: "/oauth2/@me" as const,
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-bot-application-information}
   */
  getCurrentApplication(): Promise<ApplicationEntity> {
    return this.get(OAuth2Router.ROUTES.currentApplication);
  }

  /**
   * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-authorization-information}
   */
  getCurrentAuthorization(): Promise<AuthorizationEntity> {
    return this.get(OAuth2Router.ROUTES.currentAuthorization);
  }
}
