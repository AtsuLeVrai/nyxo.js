import { BaseRouter } from "../../bases/index.js";
import type { RouteBuilder } from "../../core/index.js";
import type { InviteEntity, InviteWithMetadataEntity } from "./invite.entity.js";

export interface RESTGetInviteQueryStringParams {
  with_counts?: boolean;
  with_expiration?: boolean;
  guild_scheduled_event_id?: string;
}

export interface RESTPostChannelInviteJSONParams {
  max_age?: number;
  max_uses?: number;
  temporary?: boolean;
  unique?: boolean;
  target_type?: number;
  target_user_id?: string;
  target_application_id?: string;
}

export const InviteRoutes = {
  invite: (code: string) => `/invites/${code}` as const,
  channelInvites: (channelId: string) => `/channels/${channelId}/invites` as const,
  guildInvites: (guildId: string) => `/guilds/${guildId}/invites` as const,
} as const satisfies RouteBuilder;

export class InviteRouter extends BaseRouter {
  getInvite(code: string, params?: RESTGetInviteQueryStringParams): Promise<InviteEntity> {
    return this.rest.get(InviteRoutes.invite(code), { query: params });
  }

  deleteInvite(code: string, reason?: string): Promise<InviteEntity> {
    return this.rest.delete(InviteRoutes.invite(code), { reason });
  }

  getChannelInvites(channelId: string): Promise<InviteWithMetadataEntity[]> {
    return this.rest.get(InviteRoutes.channelInvites(channelId));
  }

  createChannelInvite(
    channelId: string,
    options?: RESTPostChannelInviteJSONParams,
    reason?: string,
  ): Promise<InviteEntity> {
    return this.rest.post(InviteRoutes.channelInvites(channelId), {
      body: JSON.stringify(options || {}),
      reason,
    });
  }

  getGuildInvites(guildId: string): Promise<InviteWithMetadataEntity[]> {
    return this.rest.get(InviteRoutes.guildInvites(guildId));
  }
}
