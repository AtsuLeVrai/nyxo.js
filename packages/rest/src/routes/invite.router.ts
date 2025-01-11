import type { InviteEntity, InviteMetadataEntity } from "@nyxjs/core";
import { fromZodError } from "zod-validation-error";
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
      const validationError = fromZodError(result.error);
      throw new Error(validationError.message);
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
