import type { InviteEntity, InviteMetadataEntity } from "@nyxjs/core";
import type { GetInviteQueryEntity } from "../types/index.js";
import { BaseRouter } from "./base.js";

export interface InviteRoutes {
  readonly invite: (code: string) => `/invites/${string}`;
}

export class InviteRouter extends BaseRouter {
  static readonly ROUTES: InviteRoutes = {
    invite: (code: string): `/invites/${string}` => `/invites/${code}` as const,
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/invite#get-invite}
   */
  getInvite(
    code: string,
    query?: GetInviteQueryEntity,
  ): Promise<InviteEntity & InviteMetadataEntity> {
    return this.get(InviteRouter.ROUTES.invite(code), {
      query,
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
