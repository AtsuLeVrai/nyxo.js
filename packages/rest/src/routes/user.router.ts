import type {
  ApplicationRoleConnectionEntity,
  ChannelEntity,
  ConnectionEntity,
  GuildEntity,
  GuildMemberEntity,
  Snowflake,
  UserEntity,
} from "@nyxjs/core";
import { BaseRouter } from "../base/index.js";
import {
  type CreateGroupDmEntity,
  CreateGroupDmSchema,
  type GetCurrentUserGuildsQueryEntity,
  GetCurrentUserGuildsQuerySchema,
  type ModifyCurrentUserEntity,
  ModifyCurrentUserSchema,
  type UpdateCurrentUserApplicationRoleConnectionEntity,
  UpdateCurrentUserApplicationRoleConnectionSchema,
} from "../schemas/index.js";

export class UserRouter extends BaseRouter {
  static readonly routes = {
    base: "/users",
    me: "/users/@me",
    guilds: "/users/@me/guilds",
    channels: "/users/@me/channels",
    connections: "/users/@me/connections",
    user: (userId: Snowflake): `/users/${Snowflake}` => {
      return `/users/${userId}`;
    },
    guildMember: (
      guildId: Snowflake,
    ): `/users/@me/guilds/${Snowflake}/member` => {
      return `/users/@me/guilds/${guildId}/member`;
    },
    leaveGuild: (guildId: Snowflake): `/users/@me/guilds/${Snowflake}` => {
      return `/users/@me/guilds/${guildId}`;
    },
    applicationRole: (
      applicationId: Snowflake,
    ): `/users/@me/applications/${Snowflake}/role-connection` => {
      return `/users/@me/applications/${applicationId}/role-connection`;
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
  modifyCurrentUser(options: ModifyCurrentUserEntity): Promise<UserEntity> {
    const result = ModifyCurrentUserSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.patch(UserRouter.routes.me, {
      body: JSON.stringify(result.data),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guilds}
   */
  getCurrentUserGuilds(
    query: GetCurrentUserGuildsQueryEntity = {},
  ): Promise<GuildEntity[]> {
    const result = GetCurrentUserGuildsQuerySchema.safeParse(query);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.get(UserRouter.routes.guilds, {
      query: result.data,
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
  createDm(recipientId: Snowflake): Promise<ChannelEntity> {
    return this.post(UserRouter.routes.channels, {
      body: JSON.stringify({ recipient_id: recipientId }),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#create-group-dm}
   */
  createGroupDm(options: CreateGroupDmEntity): Promise<ChannelEntity> {
    const result = CreateGroupDmSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.post(UserRouter.routes.channels, {
      body: JSON.stringify(result.data),
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
    connection: UpdateCurrentUserApplicationRoleConnectionEntity,
  ): Promise<ApplicationRoleConnectionEntity> {
    const result =
      UpdateCurrentUserApplicationRoleConnectionSchema.safeParse(connection);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.put(UserRouter.routes.applicationRole(applicationId), {
      body: JSON.stringify(result.data),
    });
  }
}
