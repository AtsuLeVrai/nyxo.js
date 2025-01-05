import type {
  ApplicationRoleConnectionEntity,
  ChannelEntity,
  ConnectionEntity,
  GuildEntity,
  GuildMemberEntity,
  Snowflake,
  UserEntity,
} from "@nyxjs/core";
import type { Rest } from "../rest.js";
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

export class UserRouter {
  static readonly ROUTES = {
    base: "/users" as const,
    me: "/users/@me" as const,
    guilds: "/users/@me/guilds" as const,
    channels: "/users/@me/channels" as const,
    connections: "/users/@me/connections" as const,
    user: (userId: Snowflake) => `/users/${userId}` as const,
    guildMember: (guildId: Snowflake) =>
      `/users/@me/guilds/${guildId}/member` as const,
    leaveGuild: (guildId: Snowflake) => `/users/@me/guilds/${guildId}` as const,
    applicationRole: (applicationId: Snowflake) =>
      `/users/@me/applications/${applicationId}/role-connection` as const,
  } as const;

  #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user}
   */
  getCurrentUser(): Promise<UserEntity> {
    return this.#rest.get(UserRouter.ROUTES.me);
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#get-user}
   */
  getUser(userId: Snowflake): Promise<UserEntity> {
    return this.#rest.get(UserRouter.ROUTES.user(userId));
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

    return this.#rest.patch(UserRouter.ROUTES.me, {
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

    return this.#rest.get(UserRouter.ROUTES.guilds, {
      query: result.data,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guild-member}
   */
  getCurrentUserGuildMember(guildId: Snowflake): Promise<GuildMemberEntity> {
    return this.#rest.get(UserRouter.ROUTES.guildMember(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#leave-guild}
   */
  leaveGuild(guildId: Snowflake): Promise<void> {
    return this.#rest.delete(UserRouter.ROUTES.leaveGuild(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#create-dm}
   */
  createDm(recipientId: Snowflake): Promise<ChannelEntity> {
    return this.#rest.post(UserRouter.ROUTES.channels, {
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

    return this.#rest.post(UserRouter.ROUTES.channels, {
      body: JSON.stringify(result.data),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-connections}
   */
  getCurrentUserConnections(): Promise<ConnectionEntity[]> {
    return this.#rest.get(UserRouter.ROUTES.connections);
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-application-role-connection}
   */
  getCurrentUserApplicationRoleConnection(
    applicationId: Snowflake,
  ): Promise<ApplicationRoleConnectionEntity> {
    return this.#rest.get(UserRouter.ROUTES.applicationRole(applicationId));
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

    return this.#rest.put(UserRouter.ROUTES.applicationRole(applicationId), {
      body: JSON.stringify(result.data),
    });
  }
}
