import type { InviteEntity, InviteMetadataEntity } from "@nyxjs/core";
import type { Rest } from "../rest.js";
import { GetInviteQueryEntity } from "../schemas/index.js";
import type { HttpResponse } from "../types/index.js";

export class InviteRouter {
  static readonly ROUTES = {
    invite: (code: string) => `/invites/${code}` as const,
  } as const;

  #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/invite#get-invite}
   */
  getInvite(
    code: string,
    query: GetInviteQueryEntity = {},
  ): Promise<HttpResponse<InviteEntity & InviteMetadataEntity>> {
    const result = GetInviteQueryEntity.safeParse(query);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.#rest.get(InviteRouter.ROUTES.invite(code), {
      query: result.data,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/invite#delete-invite}
   */
  deleteInvite(
    code: string,
    reason?: string,
  ): Promise<HttpResponse<InviteEntity>> {
    return this.#rest.delete(InviteRouter.ROUTES.invite(code), {
      reason,
    });
  }
}
