import type { Rest } from "../../core/index.js";
import type { OAuth2Scope } from "../../enum/index.js";
import type { ApplicationEntity } from "../application/index.js";
import type { UserEntity } from "../user/index.js";

export interface AuthorizationResponse {
  application: Partial<ApplicationEntity>;
  scopes: OAuth2Scope[];
  expires: string;
  user?: UserEntity;
}

export class OAuth2Router {
  static readonly Routes = {
    currentApplicationEndpoint: () => "/oauth2/applications/@me",
    currentAuthorizationEndpoint: () => "/oauth2/@me",
  } as const satisfies Record<string, (...args: any[]) => string>;
  readonly #rest: Rest;
  constructor(rest: Rest) {
    this.#rest = rest;
  }
  fetchCurrentApplication(): Promise<ApplicationEntity> {
    return this.#rest.get(OAuth2Router.Routes.currentApplicationEndpoint());
  }
  fetchCurrentAuthorization(): Promise<AuthorizationResponse> {
    return this.#rest.get(OAuth2Router.Routes.currentAuthorizationEndpoint());
  }
}
