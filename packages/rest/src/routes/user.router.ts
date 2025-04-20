import type {
  ApplicationRoleConnectionEntity,
  ConnectionEntity,
  DmChannelEntity,
  GuildEntity,
  GuildMemberEntity,
  Snowflake,
  UserEntity,
} from "@nyxjs/core";
import type { Rest } from "../core/index.js";
import { FileHandler, type FileInput } from "../handlers/index.js";

/**
 * Interface for modifying the current user's account settings.
 *
 * This interface defines the properties that can be updated for the current
 * authenticated user's profile. All parameters are optional, allowing partial updates.
 *
 * @remarks
 * All parameters to this endpoint are optional. When changing a username,
 * it may cause the user's discriminator to be randomized if the new username
 * is already taken with the current discriminator.
 *
 * Fires a User Update Gateway event when successful.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#modify-current-user-json-params}
 */
export interface ModifyCurrentUserSchema {
  /**
   * User's username.
   *
   * If changed, may cause the user's discriminator to be randomized.
   * Must be 2-32 characters long and follow Discord's username requirements.
   */
  username?: string;

  /**
   * User's avatar image.
   *
   * If passed, modifies the user's avatar.
   * Accepts file input (image data) which will be transformed to a data URI.
   * Pass null to remove the avatar (reverting to the default avatar).
   */
  avatar?: FileInput | null;

  /**
   * User's banner image.
   *
   * If passed, modifies the user's profile banner.
   * Accepts file input (image data) which will be transformed to a data URI.
   * Pass null to remove the banner.
   *
   * Note: This feature may require Discord Nitro for non-bot users.
   */
  banner?: FileInput | null;
}

/**
 * Interface for query parameters when getting the current user's guilds.
 *
 * These parameters allow for efficient pagination and filtering when retrieving
 * the list of guilds the current user is a member of.
 *
 * @remarks
 * This endpoint returns up to 200 guilds by default, which is the maximum number
 * of guilds a non-bot user can join. For OAuth2, this requires the `guilds` scope.
 *
 * Bots can be in more than 200 guilds, so pagination becomes important for them.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guilds-query-string-params}
 */
export interface GetCurrentUserGuildsQuerySchema {
  /**
   * Get guilds before this guild ID.
   *
   * Returns guilds with IDs less than this value (newer guilds).
   * Used for backward pagination (navigating to newer guilds).
   */
  before?: Snowflake;

  /**
   * Get guilds after this guild ID.
   *
   * Returns guilds with IDs greater than this value (older guilds).
   * Used for forward pagination (navigating to older guilds).
   */
  after?: Snowflake;

  /**
   * Maximum number of guilds to return (1-200).
   *
   * Controls how many guild objects are returned in a single request.
   * Defaults to 200 if not specified, which is the maximum allowed.
   */
  limit?: number;

  /**
   * Whether to include approximate member and presence counts in the response.
   *
   * When true, each guild object will include:
   * - approximate_member_count: Total number of members in the guild
   * - approximate_presence_count: Number of online members in the guild
   *
   * Defaults to false if not specified.
   */
  with_counts?: boolean;
}

/**
 * Interface for creating a new group DM channel with multiple users.
 *
 * This interface defines the parameters needed to create a new group DM
 * conversation with multiple users. This requires prior authorization from
 * users through the OAuth2 flow.
 *
 * @remarks
 * This endpoint was originally intended for use with the now-deprecated GameBridge SDK.
 * It is limited to 10 active group DMs per user.
 *
 * Fires a Channel Create Gateway event when successful.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#create-group-dm-json-params}
 */
export interface CreateGroupDmSchema {
  /**
   * Access tokens of users that have granted your app the `gdm.join` scope.
   *
   * These are OAuth2 tokens from users who have authorized your application
   * with the gdm.join scope, allowing you to add them to a group DM.
   * Must include at least 2 and no more than 10 users.
   */
  access_tokens: string[];

  /**
   * A dictionary mapping user IDs to their respective nicknames in the group DM.
   *
   * Keys are user IDs (Snowflakes), and values are the nicknames to assign
   * to each user in the context of this group DM.
   */
  nicks: Record<Snowflake, string>;
}

/**
 * Interface for updating the current user's application role connection.
 *
 * This interface defines the properties that can be updated for a user's
 * connection to an application for linked roles functionality.
 *
 * @remarks
 * Updates and returns the application role connection for the user.
 * Requires an OAuth2 access token with `role_connections.write` scope for the application.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#update-current-user-application-role-connection-json-params}
 */
export interface UpdateCurrentUserApplicationRoleConnectionSchema {
  /**
   * The vanity name of the platform a bot has connected (max 50 characters).
   *
   * This is a user-friendly display name for the external platform
   * or service that this connection represents.
   */
  platform_name?: string | null;

  /**
   * The username on the platform a bot has connected (max 100 characters).
   *
   * This is the user's account name or identifier on the external platform
   * or service that this connection represents.
   */
  platform_username?: string | null;

  /**
   * Object mapping application role connection metadata keys to their string value.
   *
   * These key-value pairs represent attributes or achievements from the
   * external platform that can be used to qualify users for roles.
   * Both keys and values have a maximum length of 100 characters.
   */
  metadata?: Record<string, string>;
}

/**
 * Router for Discord User-related endpoints.
 *
 * This class provides methods to interact with Discord's user system,
 * allowing operations on the current user's account, retrieving user information,
 * managing connections, and handling direct message channels.
 *
 * @remarks
 * Users in Discord are generally considered the base entity. Users can span across
 * the entire platform, be members of guilds, participate in text and voice chat, and much more.
 *
 * Users are separated by a distinction of "bot" vs "normal." Bot users are automated
 * users that are "owned" by another user and don't have a limitation on the number
 * of guilds they can join. Regular users are limited to 200 guilds.
 *
 * @see {@link https://discord.com/developers/docs/resources/user}
 */
export class UserRouter {
  /**
   * API route constants for user-related endpoints.
   */
  static readonly USER_ROUTES = {
    /**
     * Base route for users collection.
     * Root endpoint for user operations.
     */
    usersBaseEndpoint: "/users",

    /**
     * Route for current user.
     * Used to get or modify the currently authenticated user.
     */
    currentUserEndpoint: "/users/@me",

    /**
     * Route for current user's guilds.
     * Used to list guilds the current user is a member of.
     */
    currentUserGuildsEndpoint: "/users/@me/guilds",

    /**
     * Route for current user's channels.
     * Used to list or create DM channels for the current user.
     */
    currentUserChannelsEndpoint: "/users/@me/channels",

    /**
     * Route for current user's connections.
     * Used to list external account connections for the current user.
     */
    currentUserConnectionsEndpoint: "/users/@me/connections",

    /**
     * Route for a specific user.
     * Used to get information about a specific user by ID.
     *
     * @param userId - The ID of the user
     * @returns The formatted API route string
     */
    userByIdEndpoint: (userId: Snowflake) => `/users/${userId}` as const,

    /**
     * Route for current user's guild member data in a specific guild.
     * Used to get the current user's member object for a guild.
     *
     * @param guildId - The ID of the guild
     * @returns The formatted API route string
     */
    currentUserGuildMemberEndpoint: (guildId: Snowflake) =>
      `/users/@me/guilds/${guildId}/member` as const,

    /**
     * Route for leaving a guild.
     * Used to remove the current user from a guild.
     *
     * @param guildId - The ID of the guild to leave
     * @returns The formatted API route string
     */
    leaveGuildEndpoint: (guildId: Snowflake) =>
      `/users/@me/guilds/${guildId}` as const,

    /**
     * Route for application role connections.
     * Used to manage linked role connections for applications.
     *
     * @param applicationId - The ID of the application
     * @returns The formatted API route string
     */
    applicationRoleConnectionEndpoint: (applicationId: Snowflake) =>
      `/users/@me/applications/${applicationId}/role-connection` as const,
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new User Router instance.
   *
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches the user object of the requester's account.
   *
   * This method retrieves detailed information about the currently authenticated user,
   * including their username, avatar, ID, and other profile details.
   *
   * @returns A promise resolving to the current user entity
   *
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user}
   *
   * @remarks
   * For OAuth2, this requires the `identify` scope, which will return the object
   * without an email, and optionally the `email` scope, which returns the object
   * with an email if the user has one.
   */
  fetchCurrentUser(): Promise<UserEntity> {
    return this.#rest.get(UserRouter.USER_ROUTES.currentUserEndpoint);
  }

  /**
   * Fetches a user object for a given user ID.
   *
   * This method retrieves information about any user on Discord by their ID,
   * including their username, avatar, and discriminator.
   *
   * @param userId - The ID of the user to retrieve
   * @returns A promise resolving to the user entity
   * @throws {Error} Will throw an error if the user doesn't exist
   *
   * @see {@link https://discord.com/developers/docs/resources/user#get-user}
   */
  fetchUser(userId: Snowflake): Promise<UserEntity> {
    return this.#rest.get(UserRouter.USER_ROUTES.userByIdEndpoint(userId));
  }

  /**
   * Updates the requester's user account settings.
   *
   * This method allows modifying various aspects of the current user's profile,
   * such as their username, avatar, and banner.
   *
   * @param options - Options for modifying the current user
   * @returns A promise resolving to the updated user entity
   * @throws {Error} Error if the options are invalid or you lack permissions
   *
   * @see {@link https://discord.com/developers/docs/resources/user#modify-current-user}
   *
   * @remarks
   * All parameters to this endpoint are optional.
   * Fires a User Update Gateway event when successful.
   */
  async updateCurrentUser(
    options: ModifyCurrentUserSchema,
  ): Promise<UserEntity> {
    if (options.avatar) {
      options.avatar = await FileHandler.toDataUri(options.avatar);
    }

    if (options.banner) {
      options.banner = await FileHandler.toDataUri(options.banner);
    }

    return this.#rest.patch(UserRouter.USER_ROUTES.currentUserEndpoint, {
      body: JSON.stringify(options),
    });
  }

  /**
   * Fetches a list of partial guild objects the current user is a member of.
   *
   * This method retrieves information about the guilds (servers) that the current
   * user has joined, with optional member count information.
   *
   * @param query - Query parameters for filtering and pagination
   * @returns A promise resolving to an array of partial guild entities
   * @throws {Error} Error if the query parameters are invalid or you lack permissions
   *
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guilds}
   *
   * @remarks
   * For OAuth2, this requires the `guilds` scope.
   * This endpoint returns 200 guilds by default, which is the maximum number
   * of guilds a non-bot user can join. Therefore, pagination is not needed
   * for integrations that need to get a list of the users' guilds.
   *
   * For bots in more than 200 guilds, pagination is necessary.
   */
  fetchCurrentUserGuilds(
    query?: GetCurrentUserGuildsQuerySchema,
  ): Promise<GuildEntity[]> {
    return this.#rest.get(UserRouter.USER_ROUTES.currentUserGuildsEndpoint, {
      query,
    });
  }

  /**
   * Fetches a guild member object for the current user in a specific guild.
   *
   * This method retrieves detailed information about the current user's membership
   * in a specific guild, including roles, nickname, and join date.
   *
   * @param guildId - The ID of the guild to get member data from
   * @returns A promise resolving to the guild member entity
   * @throws {Error} Will throw an error if the user is not in the guild or you lack permissions
   *
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guild-member}
   *
   * @remarks
   * Requires the `guilds.members.read` OAuth2 scope.
   */
  fetchCurrentUserGuildMember(guildId: Snowflake): Promise<GuildMemberEntity> {
    return this.#rest.get(
      UserRouter.USER_ROUTES.currentUserGuildMemberEndpoint(guildId),
    );
  }

  /**
   * Leaves a guild.
   *
   * This method removes the current user from a guild they are a member of.
   * For bots, this is equivalent to the bot being kicked from the guild.
   *
   * @param guildId - The ID of the guild to leave
   * @returns A promise that resolves when the guild is left
   * @throws {Error} Will throw an error if the user is not in the guild
   *
   * @see {@link https://discord.com/developers/docs/resources/user#leave-guild}
   *
   * @remarks
   * Fires a Guild Delete Gateway event and a Guild Member Remove Gateway event.
   */
  leaveGuild(guildId: Snowflake): Promise<void> {
    return this.#rest.delete(
      UserRouter.USER_ROUTES.leaveGuildEndpoint(guildId),
    );
  }

  /**
   * Creates a new DM channel with a user.
   *
   * This method establishes a direct message channel between the current user and
   * another user, or returns an existing DM channel if one already exists.
   *
   * @param recipientId - The ID of the recipient to open a DM channel with
   * @returns A promise resolving to the DM channel entity
   * @throws {Error} Will throw an error if the DM cannot be created
   *
   * @see {@link https://discord.com/developers/docs/resources/user#create-dm}
   *
   * @remarks
   * Warning: You should not use this endpoint to DM everyone in a server about something.
   * DMs should generally be initiated by a user action. If you open a significant amount
   * of DMs too quickly, your bot may be rate limited or blocked from opening new ones.
   */
  createDmChannel(recipientId: Snowflake): Promise<DmChannelEntity> {
    return this.#rest.post(UserRouter.USER_ROUTES.currentUserChannelsEndpoint, {
      body: JSON.stringify({ recipient_id: recipientId }),
    });
  }

  /**
   * Creates a new group DM channel with multiple users.
   *
   * This method establishes a group direct message conversation with multiple users,
   * requiring OAuth2 access tokens from those users.
   *
   * @param options - Options for creating the group DM
   * @returns A promise resolving to the group DM channel entity
   * @throws {Error} Error if the options are invalid or you lack permissions
   *
   * @see {@link https://discord.com/developers/docs/resources/user#create-group-dm}
   *
   * @remarks
   * This endpoint was intended to be used with the now-deprecated GameBridge SDK.
   * It is limited to 10 active group DMs.
   * Fires a Channel Create Gateway event.
   */
  createGroupDmChannel(options: CreateGroupDmSchema): Promise<DmChannelEntity> {
    return this.#rest.post(UserRouter.USER_ROUTES.currentUserChannelsEndpoint, {
      body: JSON.stringify(options),
    });
  }

  /**
   * Fetches a list of connection objects for the current user.
   *
   * This method retrieves information about the current user's connected external
   * accounts, such as Twitch, YouTube, or Steam.
   *
   * @returns A promise resolving to an array of connection entities
   * @throws {Error} Will throw an error if you lack permissions
   *
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-connections}
   *
   * @remarks
   * Requires the `connections` OAuth2 scope.
   */
  fetchCurrentUserConnections(): Promise<ConnectionEntity[]> {
    return this.#rest.get(
      UserRouter.USER_ROUTES.currentUserConnectionsEndpoint,
    );
  }

  /**
   * Fetches the application role connection for the current user.
   *
   * This method retrieves information about how the current user's account is
   * connected to an application for the purpose of linked roles, including
   * any metadata set by the application.
   *
   * @param applicationId - The ID of the application to get the role connection for
   * @returns A promise resolving to the application role connection entity
   * @throws {Error} Will throw an error if you lack permissions
   *
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-application-role-connection}
   *
   * @remarks
   * Requires an OAuth2 access token with `role_connections.write` scope
   * for the application specified in the path.
   */
  fetchApplicationRoleConnection(
    applicationId: Snowflake,
  ): Promise<ApplicationRoleConnectionEntity> {
    return this.#rest.get(
      UserRouter.USER_ROUTES.applicationRoleConnectionEndpoint(applicationId),
    );
  }

  /**
   * Updates the application role connection for the current user.
   *
   * This method updates metadata about how the current user's account is
   * connected to an application for the purpose of linked roles.
   *
   * @param applicationId - The ID of the application to update the role connection for
   * @param connection - The role connection data to update
   * @returns A promise resolving to the updated application role connection entity
   * @throws {Error} Error if the connection data is invalid or you lack permissions
   *
   * @see {@link https://discord.com/developers/docs/resources/user#update-current-user-application-role-connection}
   *
   * @remarks
   * Requires an OAuth2 access token with `role_connections.write` scope
   * for the application specified in the path.
   */
  updateApplicationRoleConnection(
    applicationId: Snowflake,
    connection: UpdateCurrentUserApplicationRoleConnectionSchema,
  ): Promise<ApplicationRoleConnectionEntity> {
    return this.#rest.put(
      UserRouter.USER_ROUTES.applicationRoleConnectionEndpoint(applicationId),
      {
        body: JSON.stringify(connection),
      },
    );
  }
}
