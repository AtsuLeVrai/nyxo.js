import type {
  ApplicationRoleConnectionEntity,
  ConnectionEntity,
  DmChannelEntity,
  GuildEntity,
  GuildMemberEntity,
  Snowflake,
  UserEntity,
} from "@nyxjs/core";
import { BaseRouter } from "../bases/index.js";
import { FileHandler } from "../handlers/index.js";
import type {
  CreateGroupDmSchema,
  GetCurrentUserGuildsQuerySchema,
  ModifyCurrentUserSchema,
  UpdateCurrentUserApplicationRoleConnectionSchema,
} from "../schemas/index.js";

/**
 * Router class for handling Discord User endpoints.
 *
 * Users in Discord are generally considered the base entity. Users can spawn across
 * the entire platform, be members of guilds, participate in text and voice chat, and much more.
 * Users are separated by a distinction of "bot" vs "normal." Bot users are automated
 * users that are "owned" by another user and don't have a limitation on the number
 * of guilds they can join.
 *
 * @see {@link https://discord.com/developers/docs/resources/user}
 */
export class UserRouter extends BaseRouter {
  /**
   * Collection of route patterns for user-related endpoints.
   */
  static readonly ROUTES = {
    /** Base route for users collection */
    usersBase: "/users" as const,

    /** Route for current user */
    userCurrent: "/users/@me" as const,

    /** Route for current user's guilds */
    userCurrentGuilds: "/users/@me/guilds" as const,

    /** Route for current user's channels */
    userCurrentChannels: "/users/@me/channels" as const,

    /** Route for current user's connections */
    userCurrentConnections: "/users/@me/connections" as const,

    /**
     * Route for a specific user.
     * @param userId - The ID of the user
     * @returns The endpoint path
     */
    user: (userId: Snowflake) => `/users/${userId}` as const,

    /**
     * Route for current user's guild member data in a specific guild.
     * @param guildId - The ID of the guild
     * @returns The endpoint path
     */
    userCurrentGuildMember: (guildId: Snowflake) =>
      `/users/@me/guilds/${guildId}/member` as const,

    /**
     * Route for leaving a guild.
     * @param guildId - The ID of the guild to leave
     * @returns The endpoint path
     */
    userCurrentLeaveGuild: (guildId: Snowflake) =>
      `/users/@me/guilds/${guildId}` as const,

    /**
     * Route for application role connections.
     * @param applicationId - The ID of the application
     * @returns The endpoint path
     */
    userCurrentApplicationRoleConnection: (applicationId: Snowflake) =>
      `/users/@me/applications/${applicationId}/role-connection` as const,
  } as const;

  /**
   * Gets the user object of the requester's account.
   *
   * For OAuth2, this requires the `identify` scope, which will return the object
   * without an email, and optionally the `email` scope, which returns the object
   * with an email if the user has one.
   *
   * @returns A promise resolving to the current user entity
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user}
   */
  getCurrentUser(): Promise<UserEntity> {
    return this.rest.get(UserRouter.ROUTES.userCurrent);
  }

  /**
   * Gets a user object for a given user ID.
   *
   * @param userId - The ID of the user to retrieve
   * @returns A promise resolving to the user entity
   * @see {@link https://discord.com/developers/docs/resources/user#get-user}
   */
  getUser(userId: Snowflake): Promise<UserEntity> {
    return this.rest.get(UserRouter.ROUTES.user(userId));
  }

  /**
   * Modifies the requester's user account settings.
   *
   * All parameters to this endpoint are optional.
   * Fires a User Update Gateway event when successful.
   *
   * @param options - Options for modifying the current user
   * @returns A promise resolving to the updated user entity
   * @throws Error if the options are invalid
   * @see {@link https://discord.com/developers/docs/resources/user#modify-current-user}
   */
  async modifyCurrentUser(
    options: ModifyCurrentUserSchema,
  ): Promise<UserEntity> {
    if (options.avatar) {
      options.avatar = await FileHandler.toDataUri(options.avatar);
    }

    if (options.banner) {
      options.banner = await FileHandler.toDataUri(options.banner);
    }

    return this.rest.patch(UserRouter.ROUTES.userCurrent, {
      body: JSON.stringify(options),
    });
  }

  /**
   * Gets a list of partial guild objects the current user is a member of.
   *
   * For OAuth2, this requires the `guilds` scope.
   * This endpoint returns 200 guilds by default, which is the maximum number
   * of guilds a non-bot user can join. Therefore, pagination is not needed
   * for integrations that need to get a list of the users' guilds.
   *
   * @param query - Query parameters for filtering and pagination
   * @returns A promise resolving to an array of partial guild entities
   * @throws Error if the query parameters are invalid
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guilds}
   */
  getCurrentUserGuilds(
    query: GetCurrentUserGuildsQuerySchema = {},
  ): Promise<GuildEntity[]> {
    return this.rest.get(UserRouter.ROUTES.userCurrentGuilds, {
      query,
    });
  }

  /**
   * Gets a guild member object for the current user in a specific guild.
   *
   * Requires the `guilds.members.read` OAuth2 scope.
   *
   * @param guildId - The ID of the guild to get member data from
   * @returns A promise resolving to the guild member entity
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guild-member}
   */
  getCurrentUserGuildMember(guildId: Snowflake): Promise<GuildMemberEntity> {
    return this.rest.get(UserRouter.ROUTES.userCurrentGuildMember(guildId));
  }

  /**
   * Leaves a guild.
   *
   * Fires a Guild Delete Gateway event and a Guild Member Remove Gateway event.
   *
   * @param guildId - The ID of the guild to leave
   * @returns A promise that resolves when the guild is left
   * @see {@link https://discord.com/developers/docs/resources/user#leave-guild}
   */
  leaveGuild(guildId: Snowflake): Promise<void> {
    return this.rest.delete(UserRouter.ROUTES.userCurrentLeaveGuild(guildId));
  }

  /**
   * Creates a new DM channel with a user.
   *
   * Returns a DM channel object. If one already exists, it will be returned instead.
   *
   * Warning: You should not use this endpoint to DM everyone in a server about something.
   * DMs should generally be initiated by a user action. If you open a significant amount
   * of DMs too quickly, your bot may be rate limited or blocked from opening new ones.
   *
   * @param recipientId - The ID of the recipient to open a DM channel with
   * @returns A promise resolving to the DM channel entity
   * @see {@link https://discord.com/developers/docs/resources/user#create-dm}
   */
  createDm(recipientId: Snowflake): Promise<DmChannelEntity> {
    return this.rest.post(UserRouter.ROUTES.userCurrentChannels, {
      body: JSON.stringify({ recipient_id: recipientId }),
    });
  }

  /**
   * Creates a new group DM channel with multiple users.
   *
   * Returns a DM channel object. This endpoint was intended to be used with
   * the now-deprecated GameBridge SDK.
   *
   * Fires a Channel Create Gateway event.
   *
   * Warning: This endpoint is limited to 10 active group DMs.
   *
   * @param options - Options for creating the group DM
   * @returns A promise resolving to the group DM channel entity
   * @throws Error if the options are invalid
   * @see {@link https://discord.com/developers/docs/resources/user#create-group-dm}
   */
  createGroupDm(options: CreateGroupDmSchema): Promise<DmChannelEntity> {
    return this.rest.post(UserRouter.ROUTES.userCurrentChannels, {
      body: JSON.stringify(options),
    });
  }

  /**
   * Gets a list of connection objects for the current user.
   *
   * Requires the `connections` OAuth2 scope.
   *
   * @returns A promise resolving to an array of connection entities
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-connections}
   */
  getCurrentUserConnections(): Promise<ConnectionEntity[]> {
    return this.rest.get(UserRouter.ROUTES.userCurrentConnections);
  }

  /**
   * Gets the application role connection for the current user.
   *
   * Requires an OAuth2 access token with `role_connections.write` scope
   * for the application specified in the path.
   *
   * @param applicationId - The ID of the application to get the role connection for
   * @returns A promise resolving to the application role connection entity
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-application-role-connection}
   */
  getCurrentUserApplicationRoleConnection(
    applicationId: Snowflake,
  ): Promise<ApplicationRoleConnectionEntity> {
    return this.rest.get(
      UserRouter.ROUTES.userCurrentApplicationRoleConnection(applicationId),
    );
  }

  /**
   * Updates the application role connection for the current user.
   *
   * Requires an OAuth2 access token with `role_connections.write` scope
   * for the application specified in the path.
   *
   * @param applicationId - The ID of the application to update the role connection for
   * @param connection - The role connection data to update
   * @returns A promise resolving to the updated application role connection entity
   * @throws Error if the connection data is invalid
   * @see {@link https://discord.com/developers/docs/resources/user#update-current-user-application-role-connection}
   */
  updateCurrentUserApplicationRoleConnection(
    applicationId: Snowflake,
    connection: UpdateCurrentUserApplicationRoleConnectionSchema,
  ): Promise<ApplicationRoleConnectionEntity> {
    return this.rest.put(
      UserRouter.ROUTES.userCurrentApplicationRoleConnection(applicationId),
      {
        body: JSON.stringify(connection),
      },
    );
  }
}
