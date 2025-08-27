import { BaseRouter } from "../../bases/index.js";
import type { FileInput, RouteBuilder } from "../../core/index.js";
import type { DMChannelEntity, GroupDMChannelEntity } from "../channel/index.js";
import type { GuildEntity, GuildMemberEntity } from "../guild/index.js";
import type {
  ApplicationRoleConnectionEntity,
  ConnectionEntity,
  UserEntity,
} from "./user.entity.js";

export interface RESTModifyCurrentUserJSONParams extends Partial<Pick<UserEntity, "username">> {
  avatar?: FileInput | null;
  banner?: FileInput | null;
}

export interface RESTGetCurrentUserGuildsQueryStringParams {
  before?: string;
  after?: string;
  limit?: number;
  with_counts?: boolean;
}

export interface RESTCreateGroupDMJSONParams {
  access_tokens: string[];
  nicks: Record<string, string>;
}

export const UserRoutes = {
  getCurrentUser: () => "/user/@me",
  getUser: (userId: string) => `/users/${userId}` as const,
  getCurrentUserGuilds: () => "/user/@me/guilds",
  getCurrentUserGuildMember: (guildId: string) => `/users/@me/guilds/${guildId}/member` as const,
  leaveGuild: (guildId: string) => `/users/@me/guilds/${guildId}` as const,
  createDM: () => "/user/@me/channels",
  getCurrentUserConnections: () => "/user/@me/connections",
  getCurrentUserApplicationRoleConnection: (applicationId: string) =>
    `/users/@me/applications/${applicationId}/role-connection` as const,
} as const satisfies RouteBuilder;

export class UserRouter extends BaseRouter {
  getCurrentUser(): Promise<UserEntity> {
    return this.rest.get(UserRoutes.getCurrentUser());
  }

  getUser(userId: string): Promise<UserEntity> {
    return this.rest.get(UserRoutes.getUser(userId));
  }

  async modifyCurrentUser(options: RESTModifyCurrentUserJSONParams): Promise<UserEntity> {
    const processedOptions = await this.processFileOptions(options, ["avatar", "banner"]);
    return this.rest.patch(UserRoutes.getCurrentUser(), {
      body: JSON.stringify(processedOptions),
    });
  }

  getCurrentUserGuilds(
    query?: RESTGetCurrentUserGuildsQueryStringParams,
  ): Promise<Partial<GuildEntity>[]> {
    return this.rest.get(UserRoutes.getCurrentUserGuilds(), {
      query,
    });
  }

  getCurrentUserGuildMember(guildId: string): Promise<GuildMemberEntity> {
    return this.rest.get(UserRoutes.getCurrentUserGuildMember(guildId));
  }

  leaveGuild(guildId: string): Promise<void> {
    return this.rest.delete(UserRoutes.leaveGuild(guildId));
  }

  createDM(recipientId: string): Promise<DMChannelEntity> {
    return this.rest.post(UserRoutes.createDM(), {
      body: JSON.stringify({
        recipient_id: recipientId,
      }),
    });
  }

  createGroupDM(options: RESTCreateGroupDMJSONParams): Promise<GroupDMChannelEntity> {
    return this.rest.post(UserRoutes.createDM(), {
      body: JSON.stringify(options),
    });
  }

  getCurrentUserConnections(): Promise<ConnectionEntity[]> {
    return this.rest.get(UserRoutes.getCurrentUserConnections());
  }

  getCurrentUserApplicationRoleConnection(
    applicationId: string,
  ): Promise<ApplicationRoleConnectionEntity> {
    return this.rest.get(UserRoutes.getCurrentUserApplicationRoleConnection(applicationId));
  }

  updateCurrentUserApplicationRoleConnection(
    applicationId: string,
    connection: Partial<ApplicationRoleConnectionEntity>,
  ): Promise<ApplicationRoleConnectionEntity> {
    return this.rest.put(UserRoutes.getCurrentUserApplicationRoleConnection(applicationId), {
      body: JSON.stringify(connection),
    });
  }
}
