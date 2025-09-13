import { BaseRouter } from "../bases/index.js";
import type { RouteBuilder } from "../core/index.js";
import type { OAuth2Scope } from "../enum/index.js";

export interface RESTGetCurrentAuthorizationInformationResponseEntity {
  application: Partial<ApplicationEntity>;
  scopes: OAuth2Scope[];
  expires: string;
  user?: UserEntity;
}

export const OAuth2Routes = {
  getCurrentBotApplicationInformation: () => "/oauth2/applications/@me" as const,
  getCurrentAuthorizationInformation: () => "/oauth2/@me" as const,
} as const satisfies RouteBuilder;

export class OAuth2Router extends BaseRouter {
  getCurrentBotApplicationInformation(): Promise<ApplicationEntity> {
    return this.rest.get(OAuth2Routes.getCurrentBotApplicationInformation());
  }

  getCurrentAuthorizationInformation(): Promise<RESTGetCurrentAuthorizationInformationResponseEntity> {
    return this.rest.get(OAuth2Routes.getCurrentAuthorizationInformation());
  }
}
