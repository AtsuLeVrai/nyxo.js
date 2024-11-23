import type {
  ApplicationRoleConnectionEntity,
  ChannelEntity,
  ConnectionEntity,
  GuildEntity,
  GuildMemberEntity,
  Snowflake,
  UserEntity,
} from "@nyxjs/core";
import type { Rest } from "../core/index.js";
import type { ImageData } from "../types/index.js";

interface GetGuildQuery {
  before?: Snowflake;
  after?: Snowflake;
  limit?: number;
  with_counts?: boolean;
}

interface ModifyUserOptions {
  username?: string;
  avatar?: ImageData | null;
  banner?: ImageData | null;
}

interface CreateDmOptions {
  recipient_id: Snowflake;
}

interface CreateGroupDmOptions {
  access_tokens: string[];
  nicks: Record<Snowflake, string>;
}

export class UserRoutes {
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

  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user}
   */
  getCurrentUser(): Promise<UserEntity> {
    return this.#rest.get(UserRoutes.routes.me);
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#get-user}
   */
  getUser(userId: Snowflake): Promise<UserEntity> {
    return this.#rest.get(UserRoutes.routes.user(userId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#modify-current-user}
   */
  modifyCurrentUser(options: ModifyUserOptions): Promise<UserEntity> {
    return this.#rest.patch(UserRoutes.routes.me, {
      body: JSON.stringify(options),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guilds}
   */
  getCurrentUserGuilds(query?: GetGuildQuery): Promise<GuildEntity[]> {
    return this.#rest.get(UserRoutes.routes.guilds, {
      query,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guild-member}
   */
  getCurrentUserGuildMember(guildId: Snowflake): Promise<GuildMemberEntity> {
    return this.#rest.get(UserRoutes.routes.guildMember(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#leave-guild}
   */
  leaveGuild(guildId: Snowflake): Promise<void> {
    return this.#rest.delete(UserRoutes.routes.leaveGuild(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#create-dm}
   */
  createDm(options: CreateDmOptions): Promise<ChannelEntity> {
    return this.#rest.post(UserRoutes.routes.channels, {
      body: JSON.stringify(options),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#create-group-dm}
   */
  createGroupDm(options: CreateGroupDmOptions): Promise<ChannelEntity> {
    return this.#rest.post(UserRoutes.routes.channels, {
      body: JSON.stringify(options),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-connections}
   */
  getCurrentUserConnections(): Promise<ConnectionEntity[]> {
    return this.#rest.get(UserRoutes.routes.connections);
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-application-role-connection}
   */
  getCurrentUserApplicationRoleConnection(
    applicationId: Snowflake,
  ): Promise<ApplicationRoleConnectionEntity> {
    return this.#rest.get(UserRoutes.routes.applicationRole(applicationId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#update-current-user-application-role-connection}
   */
  updateCurrentUserApplicationRoleConnection(
    applicationId: Snowflake,
    connection: Partial<ApplicationRoleConnectionEntity>,
  ): Promise<ApplicationRoleConnectionEntity> {
    return this.#rest.put(UserRoutes.routes.applicationRole(applicationId), {
      body: JSON.stringify(connection),
    });
  }
}
