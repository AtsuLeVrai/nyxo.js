import type { Rest } from "../../core/index.js";
import type { InviteEntity, InviteMetadataEntity } from "./invite.entity.js";

export interface InviteFetchParams {
  with_counts?: boolean;
  with_expiration?: boolean;
  guild_scheduled_event_id?: string;
}

export class InviteRouter {
  static readonly Routes = {
    inviteByCodeEndpoint: (code: string) => `/invites/${code}` as const,
  } as const satisfies Record<string, (...args: any[]) => string>;
  readonly #rest: Rest;
  constructor(rest: Rest) {
    this.#rest = rest;
  }
  fetchInvite(code: string, query?: InviteFetchParams): Promise<InviteMetadataEntity> {
    return this.#rest.get(InviteRouter.Routes.inviteByCodeEndpoint(code), {
      query,
    });
  }
  deleteInvite(code: string, reason?: string): Promise<InviteEntity> {
    return this.#rest.delete(InviteRouter.Routes.inviteByCodeEndpoint(code), {
      reason,
    });
  }
}
