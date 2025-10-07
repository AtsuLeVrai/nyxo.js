import type { Rest } from "../../rest/index.js";
import type { FileInput, SetNonNullable } from "../../utils/index.js";
import type { DMChannelEntity } from "../channel.js";
import type { GuildEntity, GuildMemberEntity } from "../guild.js";
import type {
  ApplicationRoleConnectionObject,
  ConnectionObject,
  UserObject,
} from "./user.types.js";

export interface ModifyCurrentUserJSONParams extends Partial<Pick<UserObject, "username">> {
  readonly avatar?: FileInput | null;

  readonly banner?: FileInput | null;
}

export interface GetCurrentUserGuildsQueryStringParams {
  readonly before?: string;

  readonly after?: string;

  readonly limit?: number;

  readonly with_counts?: boolean;
}

export interface CreateDMJSONParams {
  readonly recipient_id: string;
}

export interface CreateGroupDMJSONParams {
  readonly access_tokens: string[];

  readonly nicks: Record<string, string>;
}

export type UpdateCurrentUserApplicationRoleConnectionJSONParams = Partial<
  SetNonNullable<ApplicationRoleConnectionObject>
>;

export class UserAPI {
  private readonly rest: Rest;

  constructor(rest: Rest) {
    this.rest = rest;
  }

  static user(userId: string): `/users/${string}` {
    return `/users/${userId}` as const;
  }

  static currentUser(): "/users/@me" {
    return "/users/@me";
  }

  static currentUserGuilds(): "/users/@me/guilds" {
    return "/users/@me/guilds";
  }

  static currentUserGuildMember(guildId: string): `/users/@me/guilds/${string}/member` {
    return `/users/@me/guilds/${guildId}/member` as const;
  }

  static leaveGuild(guildId: string): `/users/@me/guilds/${string}` {
    return `/users/@me/guilds/${guildId}` as const;
  }

  static userChannels(): "/users/@me/channels" {
    return "/users/@me/channels";
  }

  static currentUserConnections(): "/users/@me/connections" {
    return "/users/@me/connections";
  }

  static currentUserApplicationRoleConnection(
    applicationId: string,
  ): `/users/@me/applications/${string}/role-connection` {
    return `/users/@me/applications/${applicationId}/role-connection` as const;
  }

  getUser(userId: string): Promise<UserObject> {
    return this.rest.get(UserAPI.user(userId));
  }

  getCurrentUser(): Promise<UserObject> {
    return this.rest.get(UserAPI.currentUser());
  }

  modifyCurrentUser(params: ModifyCurrentUserJSONParams): Promise<UserObject> {
    return this.rest.patch(UserAPI.currentUser(), { body: params });
  }

  getCurrentUserGuilds(
    query?: GetCurrentUserGuildsQueryStringParams,
  ): Promise<Partial<GuildEntity>[]> {
    return this.rest.get(UserAPI.currentUserGuilds(), { query });
  }

  getCurrentUserGuildMember(guildId: string): Promise<GuildMemberEntity> {
    return this.rest.get(UserAPI.currentUserGuildMember(guildId));
  }

  async leaveGuild(guildId: string): Promise<void> {
    await this.rest.delete(UserAPI.leaveGuild(guildId));
  }

  createDM(params: CreateDMJSONParams): Promise<DMChannelEntity> {
    return this.rest.post(UserAPI.userChannels(), { body: params });
  }

  createGroupDM(params: CreateGroupDMJSONParams): Promise<DMChannelEntity> {
    return this.rest.post(UserAPI.userChannels(), { body: params });
  }

  getCurrentUserConnections(): Promise<ConnectionObject[]> {
    return this.rest.get(UserAPI.currentUserConnections());
  }

  getCurrentUserApplicationRoleConnection(
    applicationId: string,
  ): Promise<ApplicationRoleConnectionObject> {
    return this.rest.get(UserAPI.currentUserApplicationRoleConnection(applicationId));
  }

  updateCurrentUserApplicationRoleConnection(
    applicationId: string,
    params: UpdateCurrentUserApplicationRoleConnectionJSONParams,
  ): Promise<ApplicationRoleConnectionObject> {
    return this.rest.put(UserAPI.currentUserApplicationRoleConnection(applicationId), {
      body: params,
    });
  }
}
