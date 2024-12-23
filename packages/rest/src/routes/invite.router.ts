import type { InviteEntity, InviteMetadataEntity } from "@nyxjs/core";
import { BaseRouter } from "../base/index.js";
import {
  type GetInviteQueryEntity,
  GetInviteQuerySchema,
} from "../schemas/index.js";

export class InviteRouter extends BaseRouter {
  static readonly ROUTES = {
    invite: (code: string) => `/invites/${code}` as const,
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/invite#get-invite}
   */
  getInvite(
    code: string,
    query: GetInviteQueryEntity = {},
  ): Promise<InviteEntity & InviteMetadataEntity> {
    const result = GetInviteQuerySchema.safeParse(query);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.get(InviteRouter.ROUTES.invite(code), {
      query: result.data,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/invite#delete-invite}
   */
  deleteInvite(code: string, reason?: string): Promise<InviteEntity> {
    return this.delete(InviteRouter.ROUTES.invite(code), {
      reason,
    });
  }
}
