import type {
  InviteEntity,
  InviteMetadataEntity,
  Snowflake,
} from "@nyxjs/core";
import { Router } from "./router.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#get-invite-query-string-params}
 */
export interface GetInviteQuery {
  with_counts?: boolean;
  with_expiration?: boolean;
  guild_scheduled_event_id?: Snowflake;
}

export class InviteRouter extends Router {
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
    query?: GetInviteQuery,
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
