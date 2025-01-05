import type { ApplicationEntity } from "@nyxjs/core";
import type { Rest } from "../rest.js";
import type { AuthorizationEntity } from "../schemas/index.js";
import type { HttpResponse } from "../types/index.js";

// biome-ignore lint/style/useNamingConvention: This is a router class, not an entity class
export class OAuth2Router {
  static ROUTES = {
    currentApplication: "/oauth2/applications/@me" as const,
    currentAuthorization: "/oauth2/@me" as const,
  } as const;

  #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-bot-application-information}
   */
  getCurrentBotApplicationInformation(): Promise<
    HttpResponse<ApplicationEntity>
  > {
    return this.#rest.get(OAuth2Router.ROUTES.currentApplication);
  }

  /**
   * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-authorization-information}
   */
  getCurrentAuthorizationInformation(): Promise<
    HttpResponse<AuthorizationEntity>
  > {
    return this.#rest.get(OAuth2Router.ROUTES.currentAuthorization);
  }
}
