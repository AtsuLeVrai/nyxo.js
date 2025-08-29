import { BaseRouter } from "../../bases/index.js";
import type { FileInput, RouteBuilder } from "../../core/index.js";
import type { DMChannelEntity, GroupDMChannelEntity } from "../channel/index.js";
import type { GuildEntity, GuildMemberEntity } from "../guild/index.js";
import type {
  ApplicationRoleConnectionEntity,
  ConnectionEntity,
  UserEntity,
} from "./user.entity.js";

/**
 * @description JSON parameters for modifying the current user's profile information.
 * @see {@link https://discord.com/developers/docs/resources/user#modify-current-user}
 */
export interface RESTModifyCurrentUserJSONParams extends Partial<Pick<UserEntity, "username">> {
  /** New avatar image file or null to remove */
  avatar?: FileInput | null;
  /** New banner image file or null to remove */
  banner?: FileInput | null;
}

/**
 * @description Query string parameters for fetching current user's guilds with pagination.
 * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guilds}
 */
export interface RESTGetCurrentUserGuildsQueryStringParams {
  /** Get guilds before this guild ID */
  before?: string;
  /** Get guilds after this guild ID */
  after?: string;
  /** Maximum number of guilds to return (1-200, default 200) */
  limit?: number;
  /** Whether to include approximate member and presence counts */
  with_counts?: boolean;
}

/**
 * @description JSON parameters for creating a group DM channel.
 * @see {@link https://discord.com/developers/docs/resources/user#create-group-dm}
 */
export interface RESTCreateGroupDMJSONParams {
  /** Access tokens of users to add to the group DM */
  access_tokens: string[];
  /** Mapping of user IDs to their nicknames in the group */
  nicks: Record<string, string>;
}

/**
 * @description REST API routes for Discord user operations.
 * @see {@link https://discord.com/developers/docs/resources/user}
 */
export const UserRoutes = {
  /** Route to get current user information */
  getCurrentUser: () => "/users/@me",
  /** Route to get specific user information */
  getUser: (userId: string) => `/users/${userId}` as const,
  /** Route to get current user's guilds */
  getCurrentUserGuilds: () => "/users/@me/guilds",
  /** Route to get current user's member object in specific guild */
  getCurrentUserGuildMember: (guildId: string) => `/users/@me/guilds/${guildId}/member` as const,
  /** Route to leave a guild */
  leaveGuild: (guildId: string) => `/users/@me/guilds/${guildId}` as const,
  /** Route to create DM or group DM channel */
  createDM: () => "/users/@me/channels",
  /** Route to get current user's connections */
  getCurrentUserConnections: () => "/users/@me/connections",
  /** Route to get/update current user's role connection for an application */
  getCurrentUserApplicationRoleConnection: (applicationId: string) =>
    `/users/@me/applications/${applicationId}/role-connection` as const,
} as const satisfies RouteBuilder;

/**
 * @description High-performance Discord user API router with zero-cache, always-fresh approach.
 * @see {@link https://discord.com/developers/docs/resources/user}
 */
export class UserRouter extends BaseRouter {
  /**
   * @description Retrieves current user's account information directly from Discord API.
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user}
   *
   * @returns Promise resolving to current user object
   * @throws {Error} When hitting Discord rate limits
   */
  getCurrentUser(): Promise<UserEntity> {
    return this.rest.get(UserRoutes.getCurrentUser());
  }

  /**
   * @description Fetches public information about a specific user directly from Discord API.
   * @see {@link https://discord.com/developers/docs/resources/user#get-user}
   *
   * @param userId - User snowflake ID to fetch
   * @returns Promise resolving to user object
   * @throws {Error} When user doesn't exist
   * @throws {Error} When hitting Discord rate limits
   */
  getUser(userId: string): Promise<UserEntity> {
    return this.rest.get(UserRoutes.getUser(userId));
  }

  /**
   * @description Updates current user's profile information with zero-cache design.
   * @see {@link https://discord.com/developers/docs/resources/user#modify-current-user}
   *
   * @param options - Profile modification parameters (username, avatar, banner)
   * @returns Promise resolving to updated user object
   * @throws {Error} When username is invalid or taken
   * @throws {Error} When hitting Discord rate limits
   */
  async modifyCurrentUser(options: RESTModifyCurrentUserJSONParams): Promise<UserEntity> {
    const processedOptions = await this.processFileOptions(options, ["avatar", "banner"]);
    return this.rest.patch(UserRoutes.getCurrentUser(), {
      body: JSON.stringify(processedOptions),
    });
  }

  /**
   * @description Fetches current user's guilds with pagination directly from Discord API.
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guilds}
   *
   * @param query - Optional pagination and filtering parameters
   * @returns Promise resolving to array of partial guild objects
   * @throws {Error} When hitting Discord rate limits
   */
  getCurrentUserGuilds(
    query?: RESTGetCurrentUserGuildsQueryStringParams,
  ): Promise<Partial<GuildEntity>[]> {
    return this.rest.get(UserRoutes.getCurrentUserGuilds(), {
      query,
    });
  }

  /**
   * @description Fetches current user's member object in specified guild directly from Discord API.
   * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guild-member}
   *
   * @param guildId - Guild snowflake ID to get member object from
   * @returns Promise resolving to guild member object
   * @throws {Error} When user is not a member of the guild
   * @throws {Error} When hitting Discord rate limits
   */
  getCurrentUserGuildMember(guildId: string): Promise<GuildMemberEntity> {
    return this.rest.get(UserRoutes.getCurrentUserGuildMember(guildId));
  }

  /**
   * @description Makes current user leave specified guild with direct API calls.
   * @see {@link https://discord.com/developers/docs/resources/user#leave-guild}
   *
   * @param guildId - Guild snowflake ID to leave
   * @returns Promise resolving when user has left the guild
   * @throws {Error} When user is not a member of the guild
   * @throws {Error} When hitting Discord rate limits
   */
  leaveGuild(guildId: string): Promise<void> {
    return this.rest.delete(UserRoutes.leaveGuild(guildId));
  }

  /**
   * @description Creates a DM channel with specified user directly via Discord API.
   * @see {@link https://discord.com/developers/docs/resources/user#create-dm}
   *
   * @param recipientId - User snowflake ID to create DM with
   * @returns Promise resolving to DM channel object
   * @throws {Error} When recipient ID is invalid
   * @throws {Error} When hitting Discord rate limits
   */
  createDM(recipientId: string): Promise<DMChannelEntity> {
    return this.rest.post(UserRoutes.createDM(), {
      body: JSON.stringify({
        recipient_id: recipientId,
      }),
    });
  }

  /**
   * @description Creates a group DM channel with multiple users via Discord API.
   * @see {@link https://discord.com/developers/docs/resources/user#create-group-dm}
   *
   * @param options - Group DM creation parameters (access tokens, nicknames)
   * @returns Promise resolving to group DM channel object
   * @throws {Error} When access tokens are invalid
   * @throws {Error} When hitting Discord rate limits
   */
  createGroupDM(options: RESTCreateGroupDMJSONParams): Promise<GroupDMChannelEntity> {
    return this.rest.post(UserRoutes.createDM(), {
      body: JSON.stringify(options),
    });
  }

  /**
   * @description Fetches current user's third-party connections directly from Discord API.
   * @see {@link https://discord.com/developers/docs/resources/user#get-user-connections}
   *
   * @returns Promise resolving to array of connection objects
   * @throws {Error} When hitting Discord rate limits
   */
  getCurrentUserConnections(): Promise<ConnectionEntity[]> {
    return this.rest.get(UserRoutes.getCurrentUserConnections());
  }

  /**
   * @description Fetches current user's role connection for specified application.
   * @see {@link https://discord.com/developers/docs/resources/user#get-user-application-role-connection}
   *
   * @param applicationId - Application snowflake ID to get role connection for
   * @returns Promise resolving to application role connection object
   * @throws {Error} When role connection doesn't exist
   * @throws {Error} When hitting Discord rate limits
   */
  getCurrentUserApplicationRoleConnection(
    applicationId: string,
  ): Promise<ApplicationRoleConnectionEntity> {
    return this.rest.get(UserRoutes.getCurrentUserApplicationRoleConnection(applicationId));
  }

  /**
   * @description Updates current user's role connection for specified application.
   * @see {@link https://discord.com/developers/docs/resources/user#update-user-application-role-connection}
   *
   * @param applicationId - Application snowflake ID to update role connection for
   * @param connection - Partial role connection data to update
   * @returns Promise resolving to updated application role connection object
   * @throws {Error} When connection data is invalid
   * @throws {Error} When hitting Discord rate limits
   */
  updateCurrentUserApplicationRoleConnection(
    applicationId: string,
    connection: Partial<ApplicationRoleConnectionEntity>,
  ): Promise<ApplicationRoleConnectionEntity> {
    return this.rest.put(UserRoutes.getCurrentUserApplicationRoleConnection(applicationId), {
      body: JSON.stringify(connection),
    });
  }
}
