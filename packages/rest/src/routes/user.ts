import type {
  ApplicationRoleConnectionEntity,
  ChannelEntity,
  ConnectionEntity,
  GuildEntity,
  GuildMemberEntity,
  Integer,
  Snowflake,
  UserEntity,
} from "@nyxjs/core";
import type { ImageData } from "../types/index.js";
import { Router } from "./router.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guilds-query-string-params}
 */
export interface GetUserGuildQuery {
  before?: Snowflake;
  after?: Snowflake;
  limit?: Integer;
  with_counts?: boolean;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#modify-current-user-json-params}
 */
export interface ModifyUserOptions extends Pick<UserEntity, "username"> {
  avatar?: ImageData | null;
  banner?: ImageData | null;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#create-dm-json-params}
 */
export interface CreateDmOptions {
  recipient_id: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#create-group-dm-json-params}
 */
export interface CreateGroupDmOptions {
  access_tokens: string[];
  nicks: Record<Snowflake, string>;
}

export class UserRouter extends Router {
  static routes = {
    base: "/users",
    me: "/users/@me",
    guilds: "/users/@me/guilds",
    channels: "/users/@me/channels",
    connections: "/users/@me/connections",
    user: (userId: Snowflake): `/users/${Snowflake}` => {
      return `/users/${userId}` as const;
    },
    guildMember: (
      guildId: Snowflake,
    ): `/users/@me/guilds/${Snowflake}/member` => {
      return `/users/@me/guilds/${guildId}/member` as const;
    },
    leaveGuild: (guildId: Snowflake): `/users/@me/guilds/${Snowflake}` => {
      return `/users/@me/guilds/${guildId}` as const;
    },
    applicationRole: (
      applicationId: Snowflake,
    ): `/users/@me/applications/${Snowflake}/role-connection` => {
      return `/users/@me/applications/${applicationId}/role-connection` as const;
    },
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user}
   */
  getCurrentUser(): Promise<UserEntity> {
    return this.get(UserRouter.routes.me);
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#get-user}
   */
  getUser(userId: Snowflake): Promise<UserEntity> {
    return this.get(UserRouter.routes.user(userId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#modify-current-user}
   */
  modifyCurrentUser(options: ModifyUserOptions): Promise<UserEntity> {
    return this.patch(UserRouter.routes.me, {
      body: JSON.stringify(options),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guilds}
   */
  getCurrentUserGuilds(query?: GetUserGuildQuery): Promise<GuildEntity[]> {
    return this.get(UserRouter.routes.guilds, {
      query,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guild-member}
   */
  getCurrentUserGuildMember(guildId: Snowflake): Promise<GuildMemberEntity> {
    return this.get(UserRouter.routes.guildMember(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#leave-guild}
   */
  leaveGuild(guildId: Snowflake): Promise<void> {
    return this.delete(UserRouter.routes.leaveGuild(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#create-dm}
   */
  createDm(options: CreateDmOptions): Promise<ChannelEntity> {
    return this.post(UserRouter.routes.channels, {
      body: JSON.stringify(options),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#create-group-dm}
   */
  createGroupDm(options: CreateGroupDmOptions): Promise<ChannelEntity> {
    return this.post(UserRouter.routes.channels, {
      body: JSON.stringify(options),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-connections}
   */
  getCurrentUserConnections(): Promise<ConnectionEntity[]> {
    return this.get(UserRouter.routes.connections);
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-application-role-connection}
   */
  getCurrentUserApplicationRoleConnection(
    applicationId: Snowflake,
  ): Promise<ApplicationRoleConnectionEntity> {
    return this.get(UserRouter.routes.applicationRole(applicationId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#update-current-user-application-role-connection}
   */
  updateCurrentUserApplicationRoleConnection(
    applicationId: Snowflake,
    connection: Partial<ApplicationRoleConnectionEntity>,
  ): Promise<ApplicationRoleConnectionEntity> {
    return this.put(UserRouter.routes.applicationRole(applicationId), {
      body: JSON.stringify(connection),
    });
  }
}
