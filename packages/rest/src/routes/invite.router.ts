import type { InviteEntity, InviteMetadataEntity } from "@nyxjs/core";
import { fromZodError } from "zod-validation-error";
import type { Rest } from "../core/index.js";
import { GetInviteQuerySchema } from "../schemas/index.js";

export class InviteRouter {
  static readonly ROUTES = {
    inviteBase: (code: string) => `/invites/${code}` as const,
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
    query: GetInviteQuerySchema = {},
  ): Promise<InviteEntity & InviteMetadataEntity> {
    const result = GetInviteQuerySchema.safeParse(query);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.get(InviteRouter.ROUTES.inviteBase(code), {
      query: result.data,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/invite#delete-invite}
   */
  deleteInvite(code: string, reason?: string): Promise<InviteEntity> {
    return this.#rest.delete(InviteRouter.ROUTES.inviteBase(code), {
      reason,
    });
  }
}
