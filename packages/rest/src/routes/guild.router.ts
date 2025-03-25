import type {
  BanEntity,
  ChannelEntity,
  GuildEntity,
  GuildMemberEntity,
  GuildOnboardingEntity,
  GuildWidgetEntity,
  GuildWidgetSettingsEntity,
  IntegrationEntity,
  InviteEntity,
  InviteMetadataEntity,
  MfaLevel,
  RoleEntity,
  Snowflake,
  VoiceRegionEntity,
  WelcomeScreenEntity,
} from "@nyxjs/core";
import type { Rest } from "../core/index.js";
import { FileHandler } from "../handlers/index.js";
import type {
  AddGuildMemberSchema,
  BeginGuildPruneSchema,
  BulkGuildBanResponseEntity,
  BulkGuildBanSchema,
  CreateGuildBanSchema,
  CreateGuildChannelSchema,
  CreateGuildRoleSchema,
  CreateGuildSchema,
  GetGuildBansQuerySchema,
  GetGuildPruneCountQuerySchema,
  ListActiveGuildThreadsEntity,
  ListGuildMembersQuerySchema,
  ModifyGuildChannelPositionsSchema,
  ModifyGuildMemberSchema,
  ModifyGuildOnboardingSchema,
  ModifyGuildRolePositionsSchema,
  ModifyGuildRoleSchema,
  ModifyGuildSchema,
  ModifyGuildWelcomeScreenSchema,
  ModifyGuildWidgetSettingsSchema,
  SearchGuildMembersQuerySchema,
  WidgetStyleOptions,
} from "../schemas/index.js";

/**
 * Router class for Guild-related endpoints in the Discord API
 * Provides methods to interact with guilds (servers), guild members,
 * roles, bans, and other guild-related resources.
 */
export class GuildRouter {
  /**
   * Collection of route URLs for Guild-related endpoints in the Discord API
   */
  static readonly ROUTES = {
    /**
     * Base route for guilds operations
     * @see https://discord.com/developers/docs/resources/guild#get-guild
     */
    guilds: "/guilds" as const,

    /**
     * Route for specific guild operations
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild
     */
    guildBase: (guildId: Snowflake) => `/guilds/${guildId}` as const,

    /**
     * Route for retrieving guild preview
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/preview` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-preview
     */
    guildPreview: (guildId: Snowflake) => `/guilds/${guildId}/preview` as const,

    /**
     * Route for guild channels operations
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/channels` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-channels
     */
    guildChannels: (guildId: Snowflake) =>
      `/guilds/${guildId}/channels` as const,

    /**
     * Route for listing active threads in a guild
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/threads/active` route
     * @see https://discord.com/developers/docs/resources/guild#list-active-guild-threads
     */
    guildActiveThreads: (guildId: Snowflake) =>
      `/guilds/${guildId}/threads/active` as const,

    /**
     * Route for guild members operations
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/members` route
     * @see https://discord.com/developers/docs/resources/guild#list-guild-members
     */
    guildMembers: (guildId: Snowflake) => `/guilds/${guildId}/members` as const,

    /**
     * Route for searching guild members
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/members/search` route
     * @see https://discord.com/developers/docs/resources/guild#search-guild-members
     */
    guildMembersSearch: (guildId: Snowflake) =>
      `/guilds/${guildId}/members/search` as const,

    /**
     * Route for specific guild member operations
     * @param guildId - The ID of the guild
     * @param userId - The ID of the user
     * @returns `/guilds/{guild.id}/members/{user.id}` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-member
     */
    guildMember: (guildId: Snowflake, userId: Snowflake) =>
      `/guilds/${guildId}/members/${userId}` as const,

    /**
     * Route for operations on the current user's guild membership
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/members/@me` route
     * @see https://discord.com/developers/docs/resources/guild#modify-current-member
     */
    guildCurrentMember: (guildId: Snowflake) =>
      `/guilds/${guildId}/members/@me` as const,

    /**
     * Route for modifying the current user's nickname in a guild
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/members/@me/nick` route
     * @deprecated Use guildCurrentMember instead
     * @see https://discord.com/developers/docs/resources/guild#modify-current-user-nick
     */
    guildCurrentMemberNickname: (guildId: Snowflake) =>
      `/guilds/${guildId}/members/@me/nick` as const,

    /**
     * Route for managing roles assigned to a guild member
     * @param guildId - The ID of the guild
     * @param userId - The ID of the user
     * @param roleId - The ID of the role
     * @returns `/guilds/{guild.id}/members/{user.id}/roles/{role.id}` route
     * @see https://discord.com/developers/docs/resources/guild#add-guild-member-role
     */
    guildMemberRole: (
      guildId: Snowflake,
      userId: Snowflake,
      roleId: Snowflake,
    ) => `/guilds/${guildId}/members/${userId}/roles/${roleId}` as const,

    /**
     * Route for guild bans operations
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/bans` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-bans
     */
    guildBans: (guildId: Snowflake) => `/guilds/${guildId}/bans` as const,

    /**
     * Route for specific guild ban operations
     * @param guildId - The ID of the guild
     * @param userId - The ID of the banned user
     * @returns `/guilds/{guild.id}/bans/{user.id}` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-ban
     */
    guildBan: (guildId: Snowflake, userId: Snowflake) =>
      `/guilds/${guildId}/bans/${userId}` as const,

    /**
     * Route for bulk banning users
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/bulk-ban` route
     * @see https://discord.com/developers/docs/resources/guild#bulk-guild-ban
     */
    guildBulkBan: (guildId: Snowflake) =>
      `/guilds/${guildId}/bulk-ban` as const,

    /**
     * Route for guild roles operations
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/roles` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-roles
     */
    guildRoles: (guildId: Snowflake) => `/guilds/${guildId}/roles` as const,

    /**
     * Route for specific guild role operations
     * @param guildId - The ID of the guild
     * @param roleId - The ID of the role
     * @returns `/guilds/{guild.id}/roles/{role.id}` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-role
     */
    guildRole: (guildId: Snowflake, roleId: Snowflake) =>
      `/guilds/${guildId}/roles/${roleId}` as const,

    /**
     * Route for managing guild MFA level
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/mfa` route
     * @see https://discord.com/developers/docs/resources/guild#modify-guild-mfa-level
     */
    guildMfa: (guildId: Snowflake) => `/guilds/${guildId}/mfa` as const,

    /**
     * Route for guild prune operations
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/prune` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-prune-count
     */
    guildPrune: (guildId: Snowflake) => `/guilds/${guildId}/prune` as const,

    /**
     * Route for guild voice regions
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/regions` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-voice-regions
     */
    guildRegions: (guildId: Snowflake) => `/guilds/${guildId}/regions` as const,

    /**
     * Route for guild invites operations
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/invites` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-invites
     */
    guildInvites: (guildId: Snowflake) => `/guilds/${guildId}/invites` as const,

    /**
     * Route for guild integrations operations
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/integrations` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-integrations
     */
    guildIntegrations: (guildId: Snowflake) =>
      `/guilds/${guildId}/integrations` as const,

    /**
     * Route for specific guild integration operations
     * @param guildId - The ID of the guild
     * @param integrationId - The ID of the integration
     * @returns `/guilds/{guild.id}/integrations/{integration.id}` route
     * @see https://discord.com/developers/docs/resources/guild#delete-guild-integration
     */
    guildIntegration: (guildId: Snowflake, integrationId: Snowflake) =>
      `/guilds/${guildId}/integrations/${integrationId}` as const,

    /**
     * Route for guild widget settings operations
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/widget` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-widget-settings
     */
    guildWidgetSettings: (guildId: Snowflake) =>
      `/guilds/${guildId}/widget` as const,

    /**
     * Route for retrieving the guild widget JSON
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/widget.json` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-widget
     */
    guildWidget: (guildId: Snowflake) =>
      `/guilds/${guildId}/widget.json` as const,

    /**
     * Route for guild vanity URL operations
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/vanity-url` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-vanity-url
     */
    guildVanityUrl: (guildId: Snowflake) =>
      `/guilds/${guildId}/vanity-url` as const,

    /**
     * Route for retrieving guild widget image
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/widget.png` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-widget-image
     */
    guildWidgetImage: (guildId: Snowflake) =>
      `/guilds/${guildId}/widget.png` as const,

    /**
     * Route for guild welcome screen operations
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/welcome-screen` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-welcome-screen
     */
    guildWelcomeScreen: (guildId: Snowflake) =>
      `/guilds/${guildId}/welcome-screen` as const,

    /**
     * Route for guild onboarding operations
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/onboarding` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-onboarding
     */
    guildOnboarding: (guildId: Snowflake) =>
      `/guilds/${guildId}/onboarding` as const,
  } as const;

  /** The REST client used for making API requests */
  readonly #rest: Rest;

  /**
   * Create a new GuildRouter instance
   * @param rest - The REST client used to make requests to the Discord API
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Creates a new guild with the provided options
   *
   * @param options - Configuration for the new guild
   * @returns The newly created guild object
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#create-guild}
   */
  async createGuild(options: CreateGuildSchema): Promise<GuildEntity> {
    if (options.icon) {
      options.icon = await FileHandler.toDataUri(options.icon);
    }

    return this.#rest.post(GuildRouter.ROUTES.guilds, {
      body: JSON.stringify(options),
    });
  }

  /**
   * Retrieves a guild by its ID
   *
   * @param guildId - The ID of the guild to retrieve
   * @param withCounts - Whether to include approximate member and presence counts
   * @returns The guild object
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild}
   */
  getGuild(guildId: Snowflake, withCounts = false): Promise<GuildEntity> {
    return this.#rest.get(GuildRouter.ROUTES.guildBase(guildId), {
      query: { with_counts: withCounts },
    });
  }

  /**
   * Retrieves a preview of a guild
   * If the user is not in the guild, the guild must be discoverable
   *
   * @param guildId - The ID of the guild to preview
   * @returns The guild preview object
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-preview}
   */
  getPreview(guildId: Snowflake): Promise<GuildEntity> {
    return this.#rest.get(GuildRouter.ROUTES.guildPreview(guildId));
  }

  /**
   * Modifies an existing guild
   *
   * @param guildId - The ID of the guild to modify
   * @param options - New properties for the guild
   * @param reason - Reason for the modification (for audit logs)
   * @returns The updated guild object
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild}
   */
  async modifyGuild(
    guildId: Snowflake,
    options: ModifyGuildSchema,
    reason?: string,
  ): Promise<GuildEntity> {
    if (options.icon) {
      options.icon = await FileHandler.toDataUri(options.icon);
    }

    return this.#rest.patch(GuildRouter.ROUTES.guildBase(guildId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * Deletes a guild permanently
   * The user must be the owner of the guild
   *
   * @param guildId - The ID of the guild to delete
   * @returns A Promise that resolves when the guild is deleted
   * @see {@link https://discord.com/developers/docs/resources/guild#delete-guild}
   */
  deleteGuild(guildId: Snowflake): Promise<void> {
    return this.#rest.delete(GuildRouter.ROUTES.guildBase(guildId));
  }

  /**
   * Retrieves a list of channels in a guild
   * Does not include threads
   *
   * @param guildId - The ID of the guild to get channels for
   * @returns An array of channel objects
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-channels}
   */
  getChannels(guildId: Snowflake): Promise<ChannelEntity[]> {
    return this.#rest.get(GuildRouter.ROUTES.guildChannels(guildId));
  }

  /**
   * Creates a new channel in a guild
   * Requires the MANAGE_CHANNELS permission
   *
   * @param guildId - The ID of the guild to create a channel in
   * @param options - Configuration for the new channel
   * @param reason - Reason for creating the channel (for audit logs)
   * @returns The newly created channel object
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-channel}
   */
  createGuildChannel(
    guildId: Snowflake,
    options: CreateGuildChannelSchema,
    reason?: string,
  ): Promise<ChannelEntity> {
    return this.#rest.post(GuildRouter.ROUTES.guildChannels(guildId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * Modifies the positions of a set of channels in a guild
   * Requires the MANAGE_CHANNELS permission
   *
   * @param guildId - The ID of the guild to modify channel positions in
   * @param options - Array of position modifications
   * @returns A Promise that resolves when the positions are updated
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-channel-positions}
   */
  modifyGuildChannelPositions(
    guildId: Snowflake,
    options: ModifyGuildChannelPositionsSchema,
  ): Promise<void> {
    return this.#rest.patch(GuildRouter.ROUTES.guildChannels(guildId), {
      body: JSON.stringify(options),
    });
  }

  /**
   * Lists all active threads in a guild
   * Returns both public and private threads
   *
   * @param guildId - The ID of the guild to list active threads for
   * @returns Object containing arrays of threads and thread members
   * @see {@link https://discord.com/developers/docs/resources/guild#list-active-guild-threads}
   */
  listActiveGuildThreads(
    guildId: Snowflake,
  ): Promise<ListActiveGuildThreadsEntity[]> {
    return this.#rest.get(GuildRouter.ROUTES.guildActiveThreads(guildId));
  }

  /**
   * Retrieves a member of a guild by user ID
   *
   * @param guildId - The ID of the guild
   * @param userId - The ID of the user
   * @returns The guild member object
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-member}
   */
  getGuildMember(
    guildId: Snowflake,
    userId: Snowflake,
  ): Promise<GuildMemberEntity> {
    return this.#rest.get(GuildRouter.ROUTES.guildMember(guildId, userId));
  }

  /**
   * Lists members of a guild
   * Requires the GUILD_MEMBERS privileged intent
   *
   * @param guildId - The ID of the guild to list members for
   * @param query - Query parameters for pagination
   * @returns Array of guild member objects
   * @throws Error if validation of query parameters fails
   * @see {@link https://discord.com/developers/docs/resources/guild#list-guild-members}
   */
  listGuildMembers(
    guildId: Snowflake,
    query: ListGuildMembersQuerySchema = {},
  ): Promise<GuildMemberEntity[]> {
    return this.#rest.get(GuildRouter.ROUTES.guildMembers(guildId), {
      query,
    });
  }

  /**
   * Searches for guild members whose username or nickname starts with the provided string
   *
   * @param guildId - The ID of the guild to search in
   * @param query - Search parameters including the query string
   * @returns Array of matching guild member objects
   * @throws Error if validation of query parameters fails
   * @see {@link https://discord.com/developers/docs/resources/guild#search-guild-members}
   */
  searchGuildMembers(
    guildId: Snowflake,
    query: SearchGuildMembersQuerySchema,
  ): Promise<GuildMemberEntity[]> {
    return this.#rest.get(GuildRouter.ROUTES.guildMembersSearch(guildId), {
      query,
    });
  }

  /**
   * Adds a user to a guild using an OAuth2 access token
   * The bot must be a member of the guild with CREATE_INSTANT_INVITE permission
   *
   * @param guildId - The ID of the guild to add the member to
   * @param userId - The ID of the user to add
   * @param options - Configuration including OAuth2 access token and initial member settings
   * @returns The guild member object or null if already a member
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#add-guild-member}
   */
  addGuildMember(
    guildId: Snowflake,
    userId: Snowflake,
    options: AddGuildMemberSchema,
  ): Promise<GuildMemberEntity> {
    return this.#rest.put(GuildRouter.ROUTES.guildMember(guildId, userId), {
      body: JSON.stringify(options),
    });
  }

  /**
   * Modifies attributes of a guild member
   *
   * @param guildId - The ID of the guild
   * @param userId - The ID of the user to modify
   * @param options - New attributes for the guild member
   * @param reason - Reason for the modification (for audit logs)
   * @returns The updated guild member object
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-member}
   */
  modifyGuildMember(
    guildId: Snowflake,
    userId: Snowflake,
    options: ModifyGuildMemberSchema,
    reason?: string,
  ): Promise<GuildMemberEntity> {
    return this.#rest.patch(GuildRouter.ROUTES.guildMember(guildId, userId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * Modifies the current user's attributes in a guild
   * Currently only supports modifying the nickname
   *
   * @param guildId - The ID of the guild
   * @param nickname - New nickname for the current user (or null to remove)
   * @param reason - Reason for the modification (for audit logs)
   * @returns The updated guild member object
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-current-member}
   */
  modifyCurrentMember(
    guildId: Snowflake,
    nickname?: string | null,
    reason?: string,
  ): Promise<GuildMemberEntity> {
    return this.#rest.patch(GuildRouter.ROUTES.guildCurrentMember(guildId), {
      body: JSON.stringify({ nick: nickname }),
      reason,
    });
  }

  /**
   * Modifies the current user's nickname in a guild
   *
   * @param guildId - The ID of the guild
   * @param nickname - New nickname for the current user (or null to remove)
   * @param reason - Reason for the modification (for audit logs)
   * @returns The updated guild member object
   * @deprecated Use modifyCurrentMember instead
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-current-user-nick}
   */
  modifyCurrentUserNick(
    guildId: Snowflake,
    nickname?: string | null,
    reason?: string,
  ): Promise<GuildMemberEntity> {
    return this.#rest.patch(
      GuildRouter.ROUTES.guildCurrentMemberNickname(guildId),
      {
        body: JSON.stringify({ nick: nickname }),
        reason,
      },
    );
  }

  /**
   * Adds a role to a guild member
   * Requires the MANAGE_ROLES permission
   *
   * @param guildId - The ID of the guild
   * @param userId - The ID of the user
   * @param roleId - The ID of the role to add
   * @param reason - Reason for adding the role (for audit logs)
   * @returns A Promise that resolves when the role is added
   * @see {@link https://discord.com/developers/docs/resources/guild#add-guild-member-role}
   */
  addGuildMemberRole(
    guildId: Snowflake,
    userId: Snowflake,
    roleId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.#rest.put(
      GuildRouter.ROUTES.guildMemberRole(guildId, userId, roleId),
      { reason },
    );
  }

  /**
   * Removes a role from a guild member
   * Requires the MANAGE_ROLES permission
   *
   * @param guildId - The ID of the guild
   * @param userId - The ID of the user
   * @param roleId - The ID of the role to remove
   * @param reason - Reason for removing the role (for audit logs)
   * @returns A Promise that resolves when the role is removed
   * @see {@link https://discord.com/developers/docs/resources/guild#remove-guild-member-role}
   */
  removeGuildMemberRole(
    guildId: Snowflake,
    userId: Snowflake,
    roleId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.#rest.delete(
      GuildRouter.ROUTES.guildMemberRole(guildId, userId, roleId),
      { reason },
    );
  }

  /**
   * Removes a member from a guild (kicks them)
   * Requires the KICK_MEMBERS permission
   *
   * @param guildId - The ID of the guild
   * @param userId - The ID of the user to remove
   * @param reason - Reason for removing the member (for audit logs)
   * @returns A Promise that resolves when the member is removed
   * @see {@link https://discord.com/developers/docs/resources/guild#remove-guild-member}
   */
  removeGuildMember(
    guildId: Snowflake,
    userId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.#rest.delete(GuildRouter.ROUTES.guildMember(guildId, userId), {
      reason,
    });
  }

  /**
   * Retrieves a list of bans for a guild
   * Requires the BAN_MEMBERS permission
   *
   * @param guildId - The ID of the guild
   * @param query - Query parameters for filtering and pagination
   * @returns Array of ban objects
   * @throws Error if validation of query parameters fails
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-bans}
   */
  getGuildBans(
    guildId: Snowflake,
    query: GetGuildBansQuerySchema = {},
  ): Promise<BanEntity[]> {
    return this.#rest.get(GuildRouter.ROUTES.guildBans(guildId), {
      query,
    });
  }

  /**
   * Retrieves information about a ban for a user
   * Requires the BAN_MEMBERS permission
   *
   * @param guildId - The ID of the guild
   * @param userId - The ID of the banned user
   * @returns The ban object or 404 if not found
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-ban}
   */
  getGuildBan(guildId: Snowflake, userId: Snowflake): Promise<BanEntity> {
    return this.#rest.get(GuildRouter.ROUTES.guildBan(guildId, userId));
  }

  /**
   * Creates a ban for a user
   * Requires the BAN_MEMBERS permission
   *
   * @param guildId - The ID of the guild
   * @param userId - The ID of the user to ban
   * @param options - Ban options including message deletion duration
   * @param reason - Reason for the ban (for audit logs)
   * @returns A Promise that resolves when the ban is created
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-ban}
   */
  createGuildBan(
    guildId: Snowflake,
    userId: Snowflake,
    options: CreateGuildBanSchema,
    reason?: string,
  ): Promise<void> {
    return this.#rest.put(GuildRouter.ROUTES.guildBan(guildId, userId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * Removes a ban for a user
   * Requires the BAN_MEMBERS permission
   *
   * @param guildId - The ID of the guild
   * @param userId - The ID of the banned user
   * @param reason - Reason for removing the ban (for audit logs)
   * @returns A Promise that resolves when the ban is removed
   * @see {@link https://discord.com/developers/docs/resources/guild#remove-guild-ban}
   */
  removeGuildBan(
    guildId: Snowflake,
    userId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.#rest.delete(GuildRouter.ROUTES.guildBan(guildId, userId), {
      reason,
    });
  }

  /**
   * Bans multiple users from a guild at once
   * Requires both the BAN_MEMBERS and MANAGE_GUILD permissions
   *
   * @param guildId - The ID of the guild
   * @param options - Bulk ban options including user IDs and message deletion duration
   * @param reason - Reason for the bans (for audit logs)
   * @returns Object with lists of successfully banned and failed user IDs
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#bulk-guild-ban}
   */
  bulkGuildBan(
    guildId: Snowflake,
    options: BulkGuildBanSchema,
    reason?: string,
  ): Promise<BulkGuildBanResponseEntity> {
    return this.#rest.put(GuildRouter.ROUTES.guildBulkBan(guildId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * Retrieves a list of all roles in a guild
   *
   * @param guildId - The ID of the guild
   * @returns Array of role objects
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-roles}
   */
  getGuildRoles(guildId: Snowflake): Promise<RoleEntity[]> {
    return this.#rest.get(GuildRouter.ROUTES.guildRoles(guildId));
  }

  /**
   * Retrieves a specific role by ID
   *
   * @param guildId - The ID of the guild
   * @param roleId - The ID of the role
   * @returns The role object
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-role}
   */
  getGuildRole(guildId: Snowflake, roleId: Snowflake): Promise<RoleEntity> {
    return this.#rest.get(GuildRouter.ROUTES.guildRole(guildId, roleId));
  }

  /**
   * Creates a new role for the guild
   * Requires the MANAGE_ROLES permission
   *
   * @param guildId - The ID of the guild
   * @param options - Configuration for the new role
   * @param reason - Reason for creating the role (for audit logs)
   * @returns The newly created role object
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-role}
   */
  async createGuildRole(
    guildId: Snowflake,
    options: CreateGuildRoleSchema,
    reason?: string,
  ): Promise<RoleEntity> {
    if (options.icon) {
      options.icon = await FileHandler.toDataUri(options.icon);
    }

    return this.#rest.post(GuildRouter.ROUTES.guildRoles(guildId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * Modifies the positions of roles in a guild
   * Requires the MANAGE_ROLES permission
   *
   * @param guildId - The ID of the guild
   * @param options - Array of position modifications
   * @returns Array of all guild role objects with updated positions
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role-positions}
   */
  modifyGuildRolePositions(
    guildId: Snowflake,
    options: ModifyGuildRolePositionsSchema,
  ): Promise<RoleEntity[]> {
    return this.#rest.patch(GuildRouter.ROUTES.guildRoles(guildId), {
      body: JSON.stringify(options),
    });
  }

  /**
   * Modifies a role in a guild
   * Requires the MANAGE_ROLES permission
   *
   * @param guildId - The ID of the guild
   * @param roleId - The ID of the role to modify
   * @param options - New properties for the role
   * @param reason - Reason for modifying the role (for audit logs)
   * @returns The updated role object
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role}
   */
  modifyGuildRole(
    guildId: Snowflake,
    roleId: Snowflake,
    options: ModifyGuildRoleSchema,
    reason?: string,
  ): Promise<RoleEntity> {
    return this.#rest.patch(GuildRouter.ROUTES.guildRole(guildId, roleId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * Modifies a guild's MFA level
   * Requires guild ownership
   *
   * @param guildId - The ID of the guild
   * @param level - The new MFA level
   * @param reason - Reason for changing the MFA level (for audit logs)
   * @returns The updated MFA level
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-mfa-level}
   */
  modifyGuildMfaLevel(
    guildId: Snowflake,
    level: MfaLevel,
    reason?: string,
  ): Promise<number> {
    return this.#rest.post(GuildRouter.ROUTES.guildMfa(guildId), {
      body: JSON.stringify({ level }),
      reason,
    });
  }

  /**
   * Deletes a role from a guild
   * Requires the MANAGE_ROLES permission
   *
   * @param guildId - The ID of the guild
   * @param roleId - The ID of the role to delete
   * @param reason - Reason for deleting the role (for audit logs)
   * @returns A Promise that resolves when the role is deleted
   * @see {@link https://discord.com/developers/docs/resources/guild#delete-guild-role}
   */
  deleteGuildRole(
    guildId: Snowflake,
    roleId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.#rest.delete(GuildRouter.ROUTES.guildRole(guildId, roleId), {
      reason,
    });
  }

  /**
   * Gets the number of members that would be removed in a prune operation
   * Requires the MANAGE_GUILD and KICK_MEMBERS permissions
   *
   * @param guildId - The ID of the guild
   * @param query - Query parameters including days of inactivity and roles to include
   * @returns Object with the pruned count
   * @throws Error if validation of query parameters fails
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-prune-count}
   */
  getGuildPruneCount(
    guildId: Snowflake,
    query: GetGuildPruneCountQuerySchema = {},
  ): Promise<{ pruned: number }> {
    return this.#rest.get(GuildRouter.ROUTES.guildPrune(guildId), {
      query,
    });
  }

  /**
   * Begins a prune operation
   * Requires the MANAGE_GUILD and KICK_MEMBERS permissions
   *
   * @param guildId - The ID of the guild
   * @param options - Prune options including days of inactivity and roles to include
   * @param reason - Reason for the prune (for audit logs)
   * @returns Object with the number of members pruned (null if compute_prune_count is false)
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#begin-guild-prune}
   */
  beginGuildPrune(
    guildId: Snowflake,
    options: BeginGuildPruneSchema,
    reason?: string,
  ): Promise<{ pruned: number | null }> {
    return this.#rest.post(GuildRouter.ROUTES.guildPrune(guildId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * Gets a list of voice regions for the guild
   *
   * @param guildId - The ID of the guild
   * @returns Array of voice region objects
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-voice-regions}
   */
  getGuildVoiceRegions(guildId: Snowflake): Promise<VoiceRegionEntity[]> {
    return this.#rest.get(GuildRouter.ROUTES.guildRegions(guildId));
  }

  /**
   * Gets a list of invites for the guild
   * Requires the MANAGE_GUILD permission
   *
   * @param guildId - The ID of the guild
   * @returns Array of invite objects with metadata
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-invites}
   */
  getGuildInvites(
    guildId: Snowflake,
  ): Promise<(InviteEntity & InviteMetadataEntity)[]> {
    return this.#rest.get(GuildRouter.ROUTES.guildInvites(guildId));
  }

  /**
   * Gets a list of integrations for the guild
   * Requires the MANAGE_GUILD permission
   *
   * @param guildId - The ID of the guild
   * @returns Array of integration objects
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-integrations}
   */
  getGuildIntegrations(guildId: Snowflake): Promise<IntegrationEntity[]> {
    return this.#rest.get(GuildRouter.ROUTES.guildIntegrations(guildId));
  }

  /**
   * Deletes an integration from a guild
   * Requires the MANAGE_GUILD permission
   *
   * @param guildId - The ID of the guild
   * @param integrationId - The ID of the integration
   * @param reason - Reason for deleting the integration (for audit logs)
   * @returns A Promise that resolves when the integration is deleted
   * @see {@link https://discord.com/developers/docs/resources/guild#delete-guild-integration}
   */
  deleteGuildIntegration(
    guildId: Snowflake,
    integrationId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.#rest.delete(
      GuildRouter.ROUTES.guildIntegration(guildId, integrationId),
      { reason },
    );
  }

  /**
   * Gets the widget settings for the guild
   * Requires the MANAGE_GUILD permission
   *
   * @param guildId - The ID of the guild
   * @returns The guild widget settings object
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-widget-settings}
   */
  getGuildWidgetSettings(
    guildId: Snowflake,
  ): Promise<GuildWidgetSettingsEntity> {
    return this.#rest.get(GuildRouter.ROUTES.guildWidgetSettings(guildId));
  }

  /**
   * Modifies the guild's widget settings
   * Requires the MANAGE_GUILD permission
   *
   * @param guildId - The ID of the guild
   * @param options - New widget settings
   * @param reason - Reason for modifying the widget (for audit logs)
   * @returns The updated guild widget settings object
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-widget}
   */
  modifyGuildWidget(
    guildId: Snowflake,
    options: ModifyGuildWidgetSettingsSchema,
    reason?: string,
  ): Promise<GuildWidgetSettingsEntity> {
    return this.#rest.patch(GuildRouter.ROUTES.guildWidgetSettings(guildId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * Gets the widget for the guild
   *
   * @param guildId - The ID of the guild
   * @returns The guild widget object
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-widget}
   */
  getGuildWidget(guildId: Snowflake): Promise<GuildWidgetEntity> {
    return this.#rest.get(GuildRouter.ROUTES.guildWidget(guildId));
  }

  /**
   * Gets the vanity URL for the guild
   * Requires the MANAGE_GUILD permission
   *
   * @param guildId - The ID of the guild
   * @returns Partial invite object with code and usage count
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-vanity-url}
   */
  getGuildVanityUrl(
    guildId: Snowflake,
  ): Promise<Pick<InviteEntity & InviteMetadataEntity, "code" | "uses">> {
    return this.#rest.get(GuildRouter.ROUTES.guildVanityUrl(guildId));
  }

  /**
   * Gets a PNG image widget for the guild
   *
   * @param guildId - The ID of the guild
   * @param style - Style of the widget image
   * @returns Buffer containing the PNG image data
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-widget-image}
   */
  getGuildWidgetImage(
    guildId: Snowflake,
    style: WidgetStyleOptions = "shield",
  ): Promise<Buffer> {
    return this.#rest.get(GuildRouter.ROUTES.guildWidgetImage(guildId), {
      query: { style },
    });
  }

  /**
   * Gets the welcome screen for the guild
   * If the welcome screen is not enabled, requires the MANAGE_GUILD permission
   *
   * @param guildId - The ID of the guild
   * @returns The welcome screen object
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-welcome-screen}
   */
  getGuildWelcomeScreen(guildId: Snowflake): Promise<WelcomeScreenEntity> {
    return this.#rest.get(GuildRouter.ROUTES.guildWelcomeScreen(guildId));
  }

  /**
   * Modifies the guild's welcome screen
   * Requires the MANAGE_GUILD permission
   *
   * @param guildId - The ID of the guild
   * @param options - New properties for the welcome screen
   * @param reason - Reason for modifying the welcome screen (for audit logs)
   * @returns The updated welcome screen object
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-welcome-screen}
   */
  modifyGuildWelcomeScreen(
    guildId: Snowflake,
    options: ModifyGuildWelcomeScreenSchema,
    reason?: string,
  ): Promise<WelcomeScreenEntity> {
    return this.#rest.patch(GuildRouter.ROUTES.guildWelcomeScreen(guildId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * Gets the onboarding configuration for the guild
   *
   * @param guildId - The ID of the guild
   * @returns The guild onboarding object
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-onboarding}
   */
  getGuildOnboarding(guildId: Snowflake): Promise<GuildOnboardingEntity> {
    return this.#rest.get(GuildRouter.ROUTES.guildOnboarding(guildId));
  }

  /**
   * Modifies the onboarding configuration of the guild
   * Requires the MANAGE_GUILD and MANAGE_ROLES permissions
   *
   * @param guildId - The ID of the guild
   * @param options - New onboarding configuration
   * @param reason - Reason for modifying the onboarding (for audit logs)
   * @returns The updated guild onboarding object
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-onboarding}
   */
  modifyGuildOnboarding(
    guildId: Snowflake,
    options: ModifyGuildOnboardingSchema,
    reason?: string,
  ): Promise<GuildOnboardingEntity> {
    return this.#rest.put(GuildRouter.ROUTES.guildOnboarding(guildId), {
      body: JSON.stringify(options),
      reason,
    });
  }
}
