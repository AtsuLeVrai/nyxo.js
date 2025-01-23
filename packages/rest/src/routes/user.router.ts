import type {
  ApplicationRoleConnectionEntity,
  ChannelEntity,
  ConnectionEntity,
  GuildEntity,
  GuildMemberEntity,
  Snowflake,
  UserEntity,
} from "@nyxjs/core";
import { fromZodError } from "zod-validation-error";
import type { Rest } from "../core/index.js";
import {
  CreateGroupDmSchema,
  GetCurrentUserGuildsQuerySchema,
  ModifyCurrentUserSchema,
  UpdateCurrentUserApplicationRoleConnectionSchema,
} from "../schemas/index.js";

export class UserRouter {
  static readonly ROUTES = {
    usersBase: "/users" as const,
    userCurrent: "/users/@me" as const,
    userCurrentGuilds: "/users/@me/guilds" as const,
    userCurrentChannels: "/users/@me/channels" as const,
    userCurrentConnections: "/users/@me/connections" as const,
    user: (userId: Snowflake) => `/users/${userId}` as const,
    userCurrentGuildMember: (guildId: Snowflake) =>
      `/users/@me/guilds/${guildId}/member` as const,
    userCurrentLeaveGuild: (guildId: Snowflake) =>
      `/users/@me/guilds/${guildId}` as const,
    userCurrentApplicationRoleConnection: (applicationId: Snowflake) =>
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
    return this.#rest.get(UserRouter.ROUTES.userCurrent);
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
  async modifyCurrentUser(
    options: ModifyCurrentUserSchema,
  ): Promise<UserEntity> {
    const result = await ModifyCurrentUserSchema.safeParseAsync(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.patch(UserRouter.ROUTES.userCurrent, {
      body: JSON.stringify(result.data),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guilds}
   */
  getCurrentUserGuilds(
    query: GetCurrentUserGuildsQuerySchema = {},
  ): Promise<GuildEntity[]> {
    const result = GetCurrentUserGuildsQuerySchema.safeParse(query);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.get(UserRouter.ROUTES.userCurrentGuilds, {
      query: result.data,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guild-member}
   */
  getCurrentUserGuildMember(guildId: Snowflake): Promise<GuildMemberEntity> {
    return this.#rest.get(UserRouter.ROUTES.userCurrentGuildMember(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#leave-guild}
   */
  leaveGuild(guildId: Snowflake): Promise<void> {
    return this.#rest.delete(UserRouter.ROUTES.userCurrentLeaveGuild(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#create-dm}
   */
  createDm(recipientId: Snowflake): Promise<ChannelEntity> {
    return this.#rest.post(UserRouter.ROUTES.userCurrentChannels, {
      body: JSON.stringify({ recipient_id: recipientId }),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#create-group-dm}
   */
  createGroupDm(options: CreateGroupDmSchema): Promise<ChannelEntity> {
    const result = CreateGroupDmSchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.post(UserRouter.ROUTES.userCurrentChannels, {
      body: JSON.stringify(result.data),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-connections}
   */
  getCurrentUserConnections(): Promise<ConnectionEntity[]> {
    return this.#rest.get(UserRouter.ROUTES.userCurrentConnections);
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-application-role-connection}
   */
  getCurrentUserApplicationRoleConnection(
    applicationId: Snowflake,
  ): Promise<ApplicationRoleConnectionEntity> {
    return this.#rest.get(
      UserRouter.ROUTES.userCurrentApplicationRoleConnection(applicationId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/user#update-current-user-application-role-connection}
   */
  updateCurrentUserApplicationRoleConnection(
    applicationId: Snowflake,
    connection: UpdateCurrentUserApplicationRoleConnectionSchema,
  ): Promise<ApplicationRoleConnectionEntity> {
    const result =
      UpdateCurrentUserApplicationRoleConnectionSchema.safeParse(connection);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.put(
      UserRouter.ROUTES.userCurrentApplicationRoleConnection(applicationId),
      {
        body: JSON.stringify(result.data),
      },
    );
  }
}
