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
  static readonly routes = {
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
  static readonly USERNAME_MIN_LENGTH = 2;
  static readonly USERNAME_MAX_LENGTH = 32;
  static readonly NICKNAME_MIN_LENGTH = 1;
  static readonly NICKNAME_MAX_LENGTH = 32;
  static readonly GROUP_DM_MAX = 10;
  static readonly GUILDS_LIMIT_DEFAULT = 200;
  static readonly GUILDS_LIMIT_MAX = 200;
  static readonly PLATFORM_NAME_MAX_LENGTH = 50;
  static readonly PLATFORM_USERNAME_MAX_LENGTH = 100;
  static readonly METADATA_VALUE_MAX_LENGTH = 100;

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
    if (options.username) {
      const username = options.username.trim();
      if (
        username.length < UserRouter.USERNAME_MIN_LENGTH ||
        username.length > UserRouter.USERNAME_MAX_LENGTH
      ) {
        throw new Error(
          `Username must be between ${UserRouter.USERNAME_MIN_LENGTH} and ${UserRouter.USERNAME_MAX_LENGTH} characters`,
        );
      }

      if (
        username.includes("@") ||
        username.includes("#") ||
        username.includes(":") ||
        username.includes("```") ||
        username.toLowerCase().includes("discord") ||
        username.toLowerCase() === "everyone" ||
        username.toLowerCase() === "here"
      ) {
        throw new Error("Username contains forbidden characters or words");
      }
    }

    return this.patch(UserRouter.routes.me, {
      body: JSON.stringify(options),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guilds}
   */
  getCurrentUserGuilds(query?: GetUserGuildQuery): Promise<GuildEntity[]> {
    if (
      query?.limit &&
      (query.limit < 1 || query.limit > UserRouter.GUILDS_LIMIT_MAX)
    ) {
      throw new Error(
        `Limit must be between 1 and ${UserRouter.GUILDS_LIMIT_MAX}`,
      );
    }

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
    // Group DM limit is enforced by Discord but we add the validation here too
    if (options.access_tokens.length > UserRouter.GROUP_DM_MAX) {
      throw new Error(
        `Cannot create group DM with more than ${UserRouter.GROUP_DM_MAX} users`,
      );
    }

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
    if (
      connection.platform_name &&
      connection.platform_name.length > UserRouter.PLATFORM_NAME_MAX_LENGTH
    ) {
      throw new Error(
        `Platform name cannot exceed ${UserRouter.PLATFORM_NAME_MAX_LENGTH} characters`,
      );
    }

    if (
      connection.platform_username &&
      connection.platform_username.length >
        UserRouter.PLATFORM_USERNAME_MAX_LENGTH
    ) {
      throw new Error(
        `Platform username cannot exceed ${UserRouter.PLATFORM_USERNAME_MAX_LENGTH} characters`,
      );
    }

    if (connection.metadata) {
      for (const [key, value] of Object.entries(connection.metadata)) {
        if (String(value).length > UserRouter.METADATA_VALUE_MAX_LENGTH) {
          throw new Error(
            `Metadata value for key '${key}' cannot exceed ${UserRouter.METADATA_VALUE_MAX_LENGTH} characters`,
          );
        }
      }
    }

    return this.put(UserRouter.routes.applicationRole(applicationId), {
      body: JSON.stringify(connection),
    });
  }
}
