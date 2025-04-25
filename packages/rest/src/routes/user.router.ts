import type {
  ApplicationRoleConnectionEntity,
  ConnectionEntity,
  DmChannelEntity,
  GuildEntity,
  GuildMemberEntity,
  Snowflake,
  UserEntity,
} from "@nyxojs/core";
import type { Rest } from "../core/index.js";
import { FileHandler, type FileInput } from "../handlers/index.js";

/**
 * Interface for modifying the current user's account settings.
 * All parameters are optional, allowing partial updates to the user profile.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#modify-current-user-json-params}
 */
export interface UserUpdateOptions {
  /**
   * User's username.
   * Must be between 2-32 characters and follow Discord's username requirements.
   * If changed, may cause the user's discriminator to be randomized.
   */
  username?: string;

  /**
   * User's avatar image.
   * Accepts various image formats which will be transformed to a data URI.
   * Set to null to remove the current avatar.
   */
  avatar?: FileInput | null;

  /**
   * User's banner image.
   * Accepts various image formats which will be transformed to a data URI.
   * Set to null to remove the current banner. May require Discord Nitro.
   */
  banner?: FileInput | null;
}

/**
 * Interface for query parameters when getting the current user's guilds.
 * These parameters allow for efficient pagination and filtering.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guilds-query-string-params}
 */
export interface UserGuildsFetchParams {
  /**
   * Get guilds before this guild ID.
   * Returns guilds with IDs less than this value (newer guilds).
   */
  before?: Snowflake;

  /**
   * Get guilds after this guild ID.
   * Returns guilds with IDs greater than this value (older guilds).
   */
  after?: Snowflake;

  /**
   * Maximum number of guilds to return (1-200).
   * The default is 200 if not specified.
   */
  limit?: number;

  /**
   * Whether to include approximate member and presence counts.
   * When true, adds member_count and presence_count fields to each guild.
   */
  with_counts?: boolean;
}

/**
 * Interface for creating a new group DM channel with multiple users.
 * Requires prior authorization from users through the OAuth2 flow.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#create-group-dm-json-params}
 */
export interface GroupDmCreateOptions {
  /**
   * Access tokens of users that have granted the gdm.join scope.
   * Must include tokens for at least 2 users, max 10 users total.
   */
  access_tokens: string[];

  /**
   * A dictionary mapping user IDs to their respective nicknames.
   * Optional but helps differentiate users in the conversation.
   */
  nicks: Record<Snowflake, string>;
}

/**
 * Interface for updating the current user's application role connection.
 * Used for linking external accounts with Discord's linked roles feature.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#update-current-user-application-role-connection-json-params}
 */
export interface UserRoleConnectionUpdateOptions {
  /**
   * The vanity name of the platform (max 50 characters).
   * A user-friendly display name for the external service.
   */
  platform_name?: string | null;

  /**
   * The username on the platform (max 100 characters).
   * The user's account name on the external service.
   */
  platform_username?: string | null;

  /**
   * Object mapping application role connection metadata keys to their values.
   * Both keys and values must be registered in the Developer Portal.
   */
  metadata?: Record<string, string>;
}

/**
 * Router for Discord User-related endpoints.
 * Provides methods to interact with user accounts, guilds, connections, and DMs.
 *
 * @see {@link https://discord.com/developers/docs/resources/user}
 */
export class UserRouter {
  /**
   * API route constants for user-related endpoints.
   * Defines the URL patterns for Discord's user-related API endpoints.
   */
  static readonly USER_ROUTES = {
    /** Base route for users collection */
    usersBaseEndpoint: "/users",

    /** Route for the currently authenticated user */
    currentUserEndpoint: "/users/@me",

    /** Route for listing guilds the current user belongs to */
    currentUserGuildsEndpoint: "/users/@me/guilds",

    /** Route for managing DM channels */
    currentUserChannelsEndpoint: "/users/@me/channels",

    /** Route for listing external account connections */
    currentUserConnectionsEndpoint: "/users/@me/connections",

    /**
     * Route for a specific user by ID
     * @param userId - The ID of the user
     */
    userByIdEndpoint: (userId: Snowflake) => `/users/${userId}` as const,

    /**
     * Route for current user's member data in a specific guild
     * @param guildId - The ID of the guild
     */
    currentUserGuildMemberEndpoint: (guildId: Snowflake) =>
      `/users/@me/guilds/${guildId}/member` as const,

    /**
     * Route for leaving a guild
     * @param guildId - The ID of the guild to leave
     */
    leaveGuildEndpoint: (guildId: Snowflake) =>
      `/users/@me/guilds/${guildId}` as const,

    /**
     * Route for application role connections
     * @param applicationId - The ID of the application
     */
    applicationRoleConnectionEndpoint: (applicationId: Snowflake) =>
      `/users/@me/applications/${applicationId}/role-connection` as const,
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new User Router instance.
   * @param rest - The REST client to use for Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches the user object of the requester's account.
   * Returns detailed information about the currently authenticated user.
   *
   * @returns A promise resolving to the current user entity
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user}
   */
  fetchCurrentUser(): Promise<UserEntity> {
    return this.#rest.get(UserRouter.USER_ROUTES.currentUserEndpoint);
  }

  /**
   * Fetches a user object for a given user ID.
   * Retrieves information about any user on Discord.
   *
   * @param userId - The ID of the user to retrieve
   * @returns A promise resolving to the user entity
   * @see {@link https://discord.com/developers/docs/resources/user#get-user}
   */
  fetchUser(userId: Snowflake): Promise<UserEntity> {
    return this.#rest.get(UserRouter.USER_ROUTES.userByIdEndpoint(userId));
  }

  /**
   * Updates the requester's user account settings.
   * Allows modifying aspects of the current user's profile.
   *
   * @param options - Options for modifying the current user
   * @returns A promise resolving to the updated user entity
   * @see {@link https://discord.com/developers/docs/resources/user#modify-current-user}
   */
  async updateCurrentUser(options: UserUpdateOptions): Promise<UserEntity> {
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
   * Supports pagination and optional member count information.
   *
   * @param query - Query parameters for filtering and pagination
   * @returns A promise resolving to an array of partial guild entities
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guilds}
   */
  fetchCurrentGuilds(query?: UserGuildsFetchParams): Promise<GuildEntity[]> {
    return this.#rest.get(UserRouter.USER_ROUTES.currentUserGuildsEndpoint, {
      query,
    });
  }

  /**
   * Fetches a guild member object for the current user in a specific guild.
   * Retrieves roles, nickname, and other member-specific data.
   *
   * @param guildId - The ID of the guild to get member data from
   * @returns A promise resolving to the guild member entity
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guild-member}
   */
  fetchCurrentUserGuildMember(guildId: Snowflake): Promise<GuildMemberEntity> {
    return this.#rest.get(
      UserRouter.USER_ROUTES.currentUserGuildMemberEndpoint(guildId),
    );
  }

  /**
   * Leaves a guild.
   * For bots, this is equivalent to being kicked from the guild.
   *
   * @param guildId - The ID of the guild to leave
   * @returns A promise that resolves when the guild is left
   * @see {@link https://discord.com/developers/docs/resources/user#leave-guild}
   */
  leaveGuild(guildId: Snowflake): Promise<void> {
    return this.#rest.delete(
      UserRouter.USER_ROUTES.leaveGuildEndpoint(guildId),
    );
  }

  /**
   * Creates a new DM channel with a user.
   * Returns an existing DM channel if one already exists.
   *
   * @param recipientId - The ID of the recipient to open a DM with
   * @returns A promise resolving to the DM channel entity
   * @see {@link https://discord.com/developers/docs/resources/user#create-dm}
   */
  createDmChannel(recipientId: Snowflake): Promise<DmChannelEntity> {
    return this.#rest.post(UserRouter.USER_ROUTES.currentUserChannelsEndpoint, {
      body: JSON.stringify({ recipient_id: recipientId }),
    });
  }

  /**
   * Creates a new group DM channel with multiple users.
   * Requires OAuth2 access tokens with the gdm.join scope.
   *
   * @param options - Options for creating the group DM
   * @returns A promise resolving to the group DM channel entity
   * @see {@link https://discord.com/developers/docs/resources/user#create-group-dm}
   */
  createGroupDmChannel(
    options: GroupDmCreateOptions,
  ): Promise<DmChannelEntity> {
    return this.#rest.post(UserRouter.USER_ROUTES.currentUserChannelsEndpoint, {
      body: JSON.stringify(options),
    });
  }

  /**
   * Fetches a list of connection objects for the current user.
   * Shows the user's connected external accounts (Twitch, YouTube, etc).
   *
   * @returns A promise resolving to an array of connection entities
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-connections}
   */
  fetchCurrentConnections(): Promise<ConnectionEntity[]> {
    return this.#rest.get(
      UserRouter.USER_ROUTES.currentUserConnectionsEndpoint,
    );
  }

  /**
   * Fetches the application role connection for the current user.
   * Used for checking linked role metadata from external services.
   *
   * @param applicationId - The ID of the application
   * @returns A promise resolving to the application role connection entity
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-application-role-connection}
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
   * Sets metadata for linked roles from external platforms.
   *
   * @param applicationId - The ID of the application
   * @param connection - The role connection data to update
   * @returns A promise resolving to the updated application role connection entity
   * @see {@link https://discord.com/developers/docs/resources/user#update-current-user-application-role-connection}
   */
  updateApplicationRoleConnection(
    applicationId: Snowflake,
    connection: UserRoleConnectionUpdateOptions,
  ): Promise<ApplicationRoleConnectionEntity> {
    return this.#rest.put(
      UserRouter.USER_ROUTES.applicationRoleConnectionEndpoint(applicationId),
      {
        body: JSON.stringify(connection),
      },
    );
  }
}
