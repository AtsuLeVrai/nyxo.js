import type { InviteEntity, InviteMetadataEntity } from "@nyxjs/core";
import type { z } from "zod";
import { fromZodError } from "zod-validation-error";
import type { Rest } from "../rest.js";
import { GetInviteQueryEntity } from "../schemas/index.js";

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
    query: z.input<typeof GetInviteQueryEntity> = {},
  ): Promise<InviteEntity & InviteMetadataEntity> {
    const result = GetInviteQueryEntity.safeParse(query);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.get(InviteRouter.ROUTES.invite(code), {
      query: result.data,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/invite#delete-invite}
   */
  deleteInvite(code: string, reason?: string): Promise<InviteEntity> {
    return this.#rest.delete(InviteRouter.ROUTES.invite(code), {
      reason,
    });
  }
}
