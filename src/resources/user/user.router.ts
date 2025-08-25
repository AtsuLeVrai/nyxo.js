import type { FileInput, Rest } from "../../core/index.js";
import type { DmChannelEntity } from "../channel/index.js";
import type { GuildEntity, GuildMemberEntity } from "../guild/index.js";
import type {
  ApplicationRoleConnectionEntity,
  ConnectionEntity,
  UserEntity,
} from "./user.entity.js";

export interface UserUpdateOptions {
  username?: string;
  avatar?: FileInput | null;
  banner?: FileInput | null;
}

export interface UserGuildsFetchParams {
  before?: string;
  after?: string;
  limit?: number;
  with_counts?: boolean;
}

export interface GroupDmCreateOptions {
  access_tokens: string[];
  nicks: Record<string, string>;
}

export interface UserRoleConnectionUpdateOptions {
  platform_name?: string | null;
  platform_username?: string | null;
  metadata?: Record<string, string>;
}

export class UserRouter {
  static readonly Routes = {
    usersBaseEndpoint: () => "/user",
    currentUserEndpoint: () => "/user/@me",
    currentUserGuildsEndpoint: () => "/user/@me/guilds",
    currentUserChannelsEndpoint: () => "/user/@me/channels",
    currentUserConnectionsEndpoint: () => "/user/@me/connections",
    userByIdEndpoint: (userId: string) => `/users/${userId}` as const,
    currentUserGuildMemberEndpoint: (guildId: string) =>
      `/users/@me/guilds/${guildId}/member` as const,
    leaveGuildEndpoint: (guildId: string) => `/users/@me/guilds/${guildId}` as const,
    applicationRoleConnectionEndpoint: (applicationId: string) =>
      `/users/@me/applications/${applicationId}/role-connection` as const,
  } as const satisfies Record<string, (...args: any[]) => string>;
  readonly #rest: Rest;
  constructor(rest: Rest) {
    this.#rest = rest;
  }
  fetchCurrentUser(): Promise<UserEntity> {
    return this.#rest.get(UserRouter.Routes.currentUserEndpoint());
  }
  fetchUser(userId: string): Promise<UserEntity> {
    return this.#rest.get(UserRouter.Routes.userByIdEndpoint(userId));
  }
  async updateCurrentUser(options: UserUpdateOptions): Promise<UserEntity> {
    const processedOptions = { ...options };
    if (processedOptions.avatar) {
      processedOptions.avatar = await this.#rest.toDataUri(processedOptions.avatar);
    }
    if (processedOptions.banner) {
      processedOptions.banner = await this.#rest.toDataUri(processedOptions.banner);
    }
    return this.#rest.patch(UserRouter.Routes.currentUserEndpoint(), {
      body: JSON.stringify(processedOptions),
    });
  }
  fetchCurrentGuilds(query?: UserGuildsFetchParams): Promise<GuildEntity[]> {
    return this.#rest.get(UserRouter.Routes.currentUserGuildsEndpoint(), {
      query,
    });
  }
  fetchCurrentUserGuildMember(guildId: string): Promise<GuildMemberEntity> {
    return this.#rest.get(UserRouter.Routes.currentUserGuildMemberEndpoint(guildId));
  }
  leaveGuild(guildId: string): Promise<void> {
    return this.#rest.delete(UserRouter.Routes.leaveGuildEndpoint(guildId));
  }
  createDmChannel(recipientId: string): Promise<DmChannelEntity> {
    return this.#rest.post(UserRouter.Routes.currentUserChannelsEndpoint(), {
      body: JSON.stringify({
        recipient_id: recipientId,
      }),
    });
  }
  createGroupDmChannel(options: GroupDmCreateOptions): Promise<DmChannelEntity> {
    return this.#rest.post(UserRouter.Routes.currentUserChannelsEndpoint(), {
      body: JSON.stringify(options),
    });
  }
  fetchCurrentConnections(): Promise<ConnectionEntity[]> {
    return this.#rest.get(UserRouter.Routes.currentUserConnectionsEndpoint());
  }
  fetchApplicationRoleConnection(applicationId: string): Promise<ApplicationRoleConnectionEntity> {
    return this.#rest.get(UserRouter.Routes.applicationRoleConnectionEndpoint(applicationId));
  }
  updateApplicationRoleConnection(
    applicationId: string,
    connection: UserRoleConnectionUpdateOptions,
  ): Promise<ApplicationRoleConnectionEntity> {
    return this.#rest.put(UserRouter.Routes.applicationRoleConnectionEndpoint(applicationId), {
      body: JSON.stringify(connection),
    });
  }
}
