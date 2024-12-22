import type {
  InviteEntity,
  InviteMetadataEntity,
  Snowflake,
} from "@nyxjs/core";
import { BaseRouter } from "../base/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#get-invite-query-string-params}
 */
export interface GetInviteQueryEntity {
  with_counts?: boolean;
  with_expiration?: boolean;
  guild_scheduled_event_id?: Snowflake;
}

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
