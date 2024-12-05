import type { InviteEntity, InviteMetadataEntity } from "@nyxjs/core";
import type { GetInviteQueryEntity } from "../types/index.js";
import { BaseRouter } from "./base.js";

export class InviteRouter extends BaseRouter {
  static routes = {
    base: "/invites",
    invite: (code: string): `/invites/${string}` => {
      return `/invites/${code}` as const;
    },
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/invite#get-invite}
   */
  getInvite(
    code: string,
    query?: GetInviteQueryEntity,
  ): Promise<InviteEntity & InviteMetadataEntity> {
    return this.get(InviteRouter.routes.invite(code), {
      query,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/invite#delete-invite}
   */
  deleteInvite(code: string, reason?: string): Promise<InviteEntity> {
    return this.delete(InviteRouter.routes.invite(code), {
      reason,
    });
  }
}
