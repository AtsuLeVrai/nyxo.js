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
