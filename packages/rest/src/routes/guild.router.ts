import type {
  AnyChannelEntity,
  AnyThreadChannelEntity,
  BanEntity,
  DefaultMessageNotificationLevel,
  ExplicitContentFilterLevel,
  GuildEntity,
  GuildFeature,
  GuildMemberEntity,
  GuildMemberFlags,
  GuildOnboardingEntity,
  GuildOnboardingMode,
  GuildOnboardingPromptEntity,
  GuildWidgetEntity,
  GuildWidgetSettingsEntity,
  IntegrationEntity,
  InviteWithMetadataEntity,
  MfaLevel,
  RoleEntity,
  Snowflake,
  SystemChannelFlags,
  ThreadMemberEntity,
  VerificationLevel,
  VoiceRegionEntity,
  WelcomeScreenChannelEntity,
  WelcomeScreenEntity,
} from "@nyxojs/core";
import { BaseRouter } from "../bases/index.js";
import type { FileInput } from "../handlers/index.js";

/**
 * Interface for creating a new guild.
 * Used to define the initial configuration when creating a guild from scratch.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-json-params}
 */
export interface GuildCreateOptions {
  /**
   * Guild name (2-100 characters)
   * This field is required.
   */
  name: string;

  /**
   * Voice region id for the guild (deprecated)
   * Set to null to use automatic selection.
   */
  region?: string | null;

  /**
   * Base64 128x128 image for the guild icon
   * Supports PNG, JPG, and GIF formats.
   */
  icon?: FileInput;

  /**
   * Verification level required for the guild
   * Controls the verification requirements for new members.
   */
  verification_level?: VerificationLevel;

  /**
   * Default message notification level
   * Controls when members receive notifications for messages.
   */
  default_message_notifications?: DefaultMessageNotificationLevel;

  /**
   * Explicit content filter level
   * Controls scanning of media content.
   */
  explicit_content_filter?: ExplicitContentFilterLevel;

  /**
   * New guild roles
   * Array of roles to create with the guild.
   */
  roles?: RoleEntity[];

  /**
   * New guild's channels
   * Array of channels to create with the guild.
   */
  channels?: AnyChannelEntity[];

  /**
   * ID for afk channel
   * The voice channel where AFK members will be moved.
   */
  afk_channel_id?: Snowflake;

  /**
   * AFK timeout in seconds
   * The time after which inactive members are moved to the AFK channel.
   */
  afk_timeout?: number;

  /**
   * ID of the channel where guild notices are posted
   * The text channel where system messages will be sent.
   */
  system_channel_id?: Snowflake;

  /**
   * System channel flags
   * Bitfield controlling which system messages are sent.
   */
  system_channel_flags?: SystemChannelFlags;
}

/**
 * Interface for updating an existing guild's settings.
 * Used to modify various properties of a guild after creation.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-json-params}
 */
export interface GuildUpdateOptions {
  /**
   * Guild name (2-100 characters)
   * The new name for the guild.
   */
  name?: string;

  /**
   * Voice region id for the guild (deprecated)
   * Set to null to use automatic selection.
   */
  region?: string | null;

  /**
   * Verification level required for the guild
   * Controls the verification requirements for new members.
   */
  verification_level?: VerificationLevel | null;

  /**
   * Default message notification level
   * Controls when members receive notifications for messages.
   */
  default_message_notifications?: DefaultMessageNotificationLevel | null;

  /**
   * Explicit content filter level
   * Controls scanning of media content.
   */
  explicit_content_filter?: ExplicitContentFilterLevel | null;

  /**
   * ID for afk channel
   * The voice channel where AFK members will be moved.
   */
  afk_channel_id?: Snowflake | null;

  /**
   * AFK timeout in seconds
   * The time after which inactive members are moved to the AFK channel.
   */
  afk_timeout?: number;

  /**
   * Base64 1024x1024 png/jpeg/gif image for the guild icon
   * The icon image for the guild.
   */
  icon?: FileInput | null;

  /**
   * User ID to transfer guild ownership to (must be owner)
   * Transfers ownership of the guild to another user.
   */
  owner_id?: Snowflake;

  /**
   * Base64 16:9 png/jpeg image for the guild splash
   * The splash image shown in the invitation screen.
   */
  splash?: FileInput | null;

  /**
   * Base64 16:9 png/jpeg image for the guild discovery splash
   * The splash image shown in Discord's server discovery screen.
   */
  discovery_splash?: FileInput | null;

  /**
   * Base64 16:9 png/jpeg image for the guild banner
   * The banner image displayed at the top of the guild.
   */
  banner?: FileInput | null;

  /**
   * ID of the channel where guild notices are posted
   * The text channel where system messages will be sent.
   */
  system_channel_id?: Snowflake | null;

  /**
   * System channel flags
   * Bitfield controlling which system messages are sent.
   */
  system_channel_flags?: SystemChannelFlags;

  /**
   * ID of the channel where Community guilds display rules
   * The text channel where server rules are displayed.
   */
  rules_channel_id?: Snowflake | null;

  /**
   * ID of the channel where admins and moderators receive notices
   * The text channel where Discord sends important updates for moderators.
   */
  public_updates_channel_id?: Snowflake | null;

  /**
   * Preferred locale of a Community guild
   * The preferred language for the guild.
   */
  preferred_locale?: string;

  /**
   * Enabled guild features
   * An array of guild feature strings to enable.
   */
  features?: GuildFeature[];

  /**
   * Description for the guild
   * The description of the guild shown in the discovery page.
   */
  description?: string | null;

  /**
   * Whether the guild's boost progress bar should be enabled
   * If true, the server boost progress bar will be shown.
   */
  premium_progress_bar_enabled?: boolean;

  /**
   * ID of the channel where admins and moderators receive safety alerts
   * The text channel where Discord sends safety-related alerts for moderators.
   */
  safety_alerts_channel_id?: Snowflake | null;
}

/**
 * Interface for updating guild channel positions.
 * Used to modify the order of channels in a guild.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-channel-positions}
 */
export interface ChannelPositionUpdateOptions {
  /**
   * Channel ID
   * The ID of the channel to move or modify.
   */
  id: Snowflake;

  /**
   * Sorting position of the channel
   * The new position of the channel in the guild's channel list.
   */
  position?: number | null;

  /**
   * Syncs the permission overwrites with the new parent, if moving to a new category
   * If true, the channel's permission overwrites will be replaced with the category's.
   */
  lock_permissions?: boolean;

  /**
   * The new parent ID for the channel that is moved
   * The ID of the category to move this channel under.
   */
  parent_id?: Snowflake | null;
}

/**
 * Type for a list of channel position updates to apply in a single operation.
 */
export type ChannelPositionsUpdateOptions = ChannelPositionUpdateOptions[];

/**
 * Interface for the response when listing active guild threads.
 * Contains information about active threads and the current user's memberships.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#list-active-guild-threads-response-body}
 */
export interface ActiveThreadsResponse {
  /**
   * The active threads
   * An array of thread channel objects for all active (non-archived) threads.
   */
  threads: AnyThreadChannelEntity[];

  /**
   * A thread member object for each returned thread the current user has joined
   * An array of thread member objects for the threads that the bot has joined.
   */
  members: ThreadMemberEntity[];
}

/**
 * Interface for query parameters when listing guild members.
 * Used to paginate through members in a guild.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#list-guild-members-query-string-params}
 */
export interface GuildMembersFetchParams {
  /**
   * Max number of members to return (1-1000)
   * Defaults to 1 if not specified.
   */
  limit?: number;

  /**
   * The highest user id in the previous page
   * Used for pagination to get members after this user ID.
   */
  after?: Snowflake;
}

/**
 * Interface for query parameters when searching guild members.
 * Used to find members based on username or nickname.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#search-guild-members-query-string-params}
 */
export interface GuildMembersSearchParams {
  /**
   * Query string to match username(s) and nickname(s) against
   * The string to search for at the beginning of usernames or nicknames.
   */
  query: string;

  /**
   * Max number of members to return (1-1000)
   * Maximum number of members to return in the search results.
   */
  limit: number;
}

/**
 * Interface for adding a member to a guild using OAuth2.
 * Used when you have a user's OAuth2 access token.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#add-guild-member-json-params}
 */
export interface GuildMemberAddOptions {
  /**
   * OAuth2 access token granted with the guilds.join scope
   * The OAuth2 access token of the user to add to the guild.
   */
  access_token: string;

  /**
   * Value to set user's nickname to
   * The nickname to give the user upon joining.
   */
  nick?: string;

  /**
   * Array of role IDs the member is assigned
   * The roles to give the user upon joining.
   */
  roles?: Snowflake[];

  /**
   * Whether the user is muted in voice channels
   * If true, the user will be muted in voice channels.
   */
  mute?: boolean;

  /**
   * Whether the user is deafened in voice channels
   * If true, the user will be deafened in voice channels.
   */
  deaf?: boolean;
}

/**
 * Interface for updating a guild member's attributes.
 * Used to modify various properties of a guild member.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-member-json-params}
 */
export interface GuildMemberUpdateOptions {
  /**
   * Value to set user's nickname to
   * The new nickname for the guild member.
   */
  nick?: string | null;

  /**
   * Array of role IDs the member is assigned
   * The complete list of role IDs the member should have.
   */
  roles?: Snowflake[];

  /**
   * Whether the user is muted in voice channels
   * If true, the user will be muted in all voice channels in the guild.
   */
  mute?: boolean;

  /**
   * Whether the user is deafened in voice channels
   * If true, the user will be deafened in all voice channels in the guild.
   */
  deaf?: boolean;

  /**
   * ID of channel to move user to (if they are connected to voice)
   * The ID of the voice channel to move the user to.
   */
  channel_id?: Snowflake | null;

  /**
   * When the user's timeout will expire (up to 28 days in the future)
   * ISO8601 datetime string for when the timeout should expire.
   */
  communication_disabled_until?: string;

  /**
   * Guild member flags
   * Bitfield of guild member flags.
   */
  flags?: GuildMemberFlags;
}

/**
 * Interface for query parameters when getting guild bans.
 * Used to paginate through a guild's ban list.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-bans-query-string-params}
 */
export interface GuildBansFetchParams {
  /**
   * Number of users to return (up to maximum 1000)
   * Controls how many ban objects to return per request.
   */
  limit?: number;

  /**
   * Consider only users before given user ID
   * Return ban objects for users with IDs lexicographically before this ID.
   */
  before?: Snowflake;

  /**
   * Consider only users after given user ID
   * Return ban objects for users with IDs lexicographically after this ID.
   */
  after?: Snowflake;
}

/**
 * Interface for creating a guild ban.
 * Used to ban a user from a guild and optionally delete their messages.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-ban-json-params}
 */
export interface GuildBanCreateOptions {
  /**
   * Number of days to delete messages for (0-7) (deprecated)
   * Delete all messages from this user for this number of days.
   */
  delete_message_days?: number;

  /**
   * Number of seconds to delete messages for (0-604800)
   * Delete all messages from this user sent in the last x seconds.
   */
  delete_message_seconds?: number;
}

/**
 * Interface for bulk guild ban operation.
 * Used to ban multiple users from a guild at once.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#bulk-guild-ban-json-params}
 */
export interface GuildBansBulkOptions {
  /**
   * List of user IDs to ban (max 200)
   * Array of user IDs to ban from the guild.
   */
  user_ids: Snowflake[];

  /**
   * Number of seconds to delete messages for (0-604800)
   * Delete all messages from these users sent in the last x seconds.
   */
  delete_message_seconds: number;
}

/**
 * Interface for bulk guild ban response.
 * Contains information about which users were successfully banned.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#bulk-guild-ban-bulk-ban-response}
 */
export interface GuildBansBulkResponse {
  /**
   * List of user IDs that were successfully banned
   * Array of user IDs that were successfully banned from the guild.
   */
  banned_users: Snowflake[];

  /**
   * List of user IDs that were not banned
   * Array of user IDs that could not be banned from the guild.
   */
  failed_users: Snowflake[];
}

/**
 * Interface for creating a guild role.
 * Used to define a new role with specific permissions and display settings.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-role-json-params}
 */
export interface GuildRoleCreateOptions {
  /**
   * Name of the role (max 100 characters)
   * The name of the role. Maximum length is 100 characters.
   */
  name: string;

  /**
   * Bitwise value of the enabled/disabled permissions
   * String representation of the permissions bitfield.
   */
  permissions: string;

  /**
   * RGB color value
   * The color of the role, represented as an integer.
   */
  color: number;

  /**
   * Whether the role should be displayed separately in the sidebar
   * If true, members with this role are displayed separately in the member list.
   */
  hoist: boolean;

  /**
   * The role's icon image
   * Image file for the role's icon.
   */
  icon: FileInput | null;

  /**
   * The role's unicode emoji as a standard emoji
   * A standard emoji to display as the role's icon.
   */
  unicode_emoji?: string;

  /**
   * Whether the role should be mentionable
   * If true, anyone can mention this role in messages using @role-name.
   */
  mentionable: boolean;
}

/**
 * Interface for updating guild role positions.
 * Used to change the hierarchy of roles in a guild.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role-positions-json-params}
 */
export interface RolePositionUpdateOptions {
  /**
   * Role ID
   * The ID of the role to reposition.
   */
  id: Snowflake;

  /**
   * Sorting position of the role
   * The new position for the role.
   */
  position?: number | null;
}

/**
 * Type for a list of role position updates to apply in a single operation.
 */
export type RolePositionsUpdateOptions = RolePositionUpdateOptions[];

/**
 * Interface for updating a guild role.
 * Used to modify an existing role's properties.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role-json-params}
 */
export type GuildRoleUpdateOptions = Partial<GuildRoleCreateOptions> | null;

/**
 * Interface for query parameters when getting guild prune count.
 * Used to estimate how many members would be removed by a prune operation.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-prune-count-query-string-params}
 */
export interface GetGuildPruneCountQuerySchema {
  /**
   * Number of days to count prune for (1-30)
   * The number of days after which a user is considered inactive.
   */
  days?: number;

  /**
   * Comma-delimited array of role IDs to include
   * Comma-separated list of role IDs to include in the prune count.
   */
  include_roles?: string;
}

/**
 * Interface for beginning a guild prune operation.
 * Used to remove inactive members from a guild.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#begin-guild-prune-json-params}
 */
export interface GuildPruneOptions {
  /**
   * Number of days to prune (1-30)
   * The number of days after which a user is considered inactive.
   */
  days: number;

  /**
   * Whether 'pruned' is returned in the response
   * If true, the response will include the number of members pruned.
   */
  compute_prune_count: boolean;

  /**
   * Array of role IDs to include
   * Array of role IDs to include in the prune operation.
   */
  include_roles: Snowflake[];

  /**
   * @deprecated Reason for the prune (deprecated)
   */
  reason?: string;
}

/**
 * Widget style options for guild widget images.
 * Defines the visual style of the guild widget image.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-widget-image-widget-style-options}
 */
export type WidgetStyle =
  | "shield"
  | "banner1"
  | "banner2"
  | "banner3"
  | "banner4";

/**
 * Interface for updating guild widget settings.
 * Used to enable or disable the guild widget and set its invite channel.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-widget-json-params}
 */
export interface GuildWidgetUpdateOptions {
  /**
   * Whether the widget is enabled
   * If true, the guild widget will be enabled and accessible.
   */
  enabled: boolean;

  /**
   * The widget channel ID
   * The ID of the channel that will be used for invites from the widget.
   */
  channel_id: Snowflake | null;
}

/**
 * Interface for updating guild welcome screen.
 * Used to configure the welcome screen shown to new members.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-welcome-screen-json-params}
 */
export interface GuildWelcomeScreenUpdateOptions {
  /**
   * Whether the welcome screen is enabled
   * If true, new members will see the welcome screen when joining.
   */
  enabled?: boolean | null;

  /**
   * Channels shown in the welcome screen and their display options
   * Array of welcome screen channel objects to show in the welcome screen.
   */
  welcome_channels?: WelcomeScreenChannelEntity[] | null;

  /**
   * The server description to show in the welcome screen
   * A text description shown at the top of the welcome screen.
   */
  description?: string | null;
}

/**
 * Interface for updating guild onboarding.
 * Used to configure the onboarding process for new members.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-onboarding}
 */
export interface GuildOnboardingUpdateOptions {
  /**
   * Prompts shown during onboarding and in customize community
   * Array of onboarding prompt objects that define questions and options.
   */
  prompts: GuildOnboardingPromptEntity[];

  /**
   * Channel IDs that members get opted into automatically
   * Array of channel IDs that all new members will have access to.
   */
  default_channel_ids: Snowflake[];

  /**
   * Whether onboarding is enabled in the guild
   * If true, new members will go through the onboarding flow when joining.
   */
  enabled: boolean;

  /**
   * Current mode of onboarding
   * The complexity of the onboarding flow.
   */
  mode: GuildOnboardingMode;
}

/**
 * Router for Guild-related endpoints in the Discord API
 * Provides methods for managing guilds, members, roles, and related resources.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild}
 */
export class GuildRouter extends BaseRouter {
  /**
   * Collection of API route constants for Discord Guild-related endpoints.
   */
  static readonly GUILD_ROUTES = {
    /**
     * Route for guild collection operations.
     */
    guildsEndpoint: "/guilds",

    /**
     * Route for specific guild operations.
     * @param guildId - The ID of the guild
     */
    guildBaseEndpoint: (guildId: Snowflake) => `/guilds/${guildId}` as const,

    /**
     * Route for retrieving guild preview.
     * @param guildId - The ID of the guild
     */
    guildPreviewEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/preview` as const,

    /**
     * Route for guild channels operations.
     * @param guildId - The ID of the guild
     */
    guildChannelsEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/channels` as const,

    /**
     * Route for listing active threads in a guild.
     * @param guildId - The ID of the guild
     */
    guildActiveThreadsEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/threads/active` as const,

    /**
     * Route for guild members operations.
     * @param guildId - The ID of the guild
     */
    guildMembersEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/members` as const,

    /**
     * Route for searching guild members.
     * @param guildId - The ID of the guild
     */
    guildMembersSearchEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/members/search` as const,

    /**
     * Route for specific guild member operations.
     * @param guildId - The ID of the guild
     * @param userId - The ID of the user
     */
    guildMemberEndpoint: (guildId: Snowflake, userId: Snowflake) =>
      `/guilds/${guildId}/members/${userId}` as const,

    /**
     * Route for operations on the current user's guild membership.
     * @param guildId - The ID of the guild
     */
    guildCurrentMemberEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/members/@me` as const,

    /**
     * Route for modifying the current user's nickname in a guild.
     * @param guildId - The ID of the guild
     * @deprecated Use guildCurrentMember instead
     */
    guildCurrentMemberNicknameEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/members/@me/nick` as const,

    /**
     * Route for managing roles assigned to a guild member.
     * @param guildId - The ID of the guild
     * @param userId - The ID of the user
     * @param roleId - The ID of the role
     */
    guildMemberRoleEndpoint: (
      guildId: Snowflake,
      userId: Snowflake,
      roleId: Snowflake,
    ) => `/guilds/${guildId}/members/${userId}/roles/${roleId}` as const,

    /**
     * Route for guild bans operations.
     * @param guildId - The ID of the guild
     */
    guildBansEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/bans` as const,

    /**
     * Route for specific guild ban operations.
     * @param guildId - The ID of the guild
     * @param userId - The ID of the banned user
     */
    guildBanEndpoint: (guildId: Snowflake, userId: Snowflake) =>
      `/guilds/${guildId}/bans/${userId}` as const,

    /**
     * Route for bulk banning users.
     * @param guildId - The ID of the guild
     */
    guildBulkBanEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/bulk-ban` as const,

    /**
     * Route for guild roles operations.
     * @param guildId - The ID of the guild
     */
    guildRolesEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/roles` as const,

    /**
     * Route for specific guild role operations.
     * @param guildId - The ID of the guild
     * @param roleId - The ID of the role
     */
    guildRoleEndpoint: (guildId: Snowflake, roleId: Snowflake) =>
      `/guilds/${guildId}/roles/${roleId}` as const,

    /**
     * Route for managing guild MFA level.
     * @param guildId - The ID of the guild
     */
    guildMfaEndpoint: (guildId: Snowflake) => `/guilds/${guildId}/mfa` as const,

    /**
     * Route for guild prune operations.
     * @param guildId - The ID of the guild
     */
    guildPruneEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/prune` as const,

    /**
     * Route for guild voice regions.
     * @param guildId - The ID of the guild
     */
    guildRegionsEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/regions` as const,

    /**
     * Route for guild invites operations.
     * @param guildId - The ID of the guild
     */
    guildInvitesEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/invites` as const,

    /**
     * Route for guild integrations operations.
     * @param guildId - The ID of the guild
     */
    guildIntegrationsEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/integrations` as const,

    /**
     * Route for specific guild integration operations.
     * @param guildId - The ID of the guild
     * @param integrationId - The ID of the integration
     */
    guildIntegrationEndpoint: (guildId: Snowflake, integrationId: Snowflake) =>
      `/guilds/${guildId}/integrations/${integrationId}` as const,

    /**
     * Route for guild widget settings operations.
     * @param guildId - The ID of the guild
     */
    guildWidgetSettingsEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/widget` as const,

    /**
     * Route for retrieving the guild widget JSON.
     * @param guildId - The ID of the guild
     */
    guildWidgetEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/widget.json` as const,

    /**
     * Route for guild vanity URL operations.
     * @param guildId - The ID of the guild
     */
    guildVanityUrlEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/vanity-url` as const,

    /**
     * Route for retrieving guild widget image.
     * @param guildId - The ID of the guild
     */
    guildWidgetImageEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/widget.png` as const,

    /**
     * Route for guild welcome screen operations.
     * @param guildId - The ID of the guild
     */
    guildWelcomeScreenEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/welcome-screen` as const,

    /**
     * Route for guild onboarding operations.
     * @param guildId - The ID of the guild
     */
    guildOnboardingEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/onboarding` as const,
  } as const;

  /**
   * Creates a new guild with the provided options
   * Only usable by bots in fewer than 10 guilds.
   *
   * @param options - Configuration for the new guild
   * @returns The newly created guild object
   * @see {@link https://discord.com/developers/docs/resources/guild#create-guild}
   */
  async createGuild(options: GuildCreateOptions): Promise<GuildEntity> {
    const fileFields: (keyof GuildCreateOptions)[] = ["icon"];
    const processedOptions = await this.prepareBodyWithFiles(
      options,
      fileFields,
    );

    return this.post(GuildRouter.GUILD_ROUTES.guildsEndpoint, processedOptions);
  }

  /**
   * Retrieves a guild by its ID
   * The bot must be a member of the guild.
   *
   * @param guildId - The ID of the guild to retrieve
   * @param withCounts - Whether to include approximate member and presence counts
   * @returns The guild object
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild}
   */
  fetchGuild(guildId: Snowflake, withCounts = false): Promise<GuildEntity> {
    return this.get(GuildRouter.GUILD_ROUTES.guildBaseEndpoint(guildId), {
      query: { with_counts: withCounts },
    });
  }

  /**
   * Retrieves a preview of a guild
   * For non-members, the guild must be discoverable.
   *
   * @param guildId - The ID of the guild to preview
   * @returns The guild preview object
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-preview}
   */
  fetchPreview(guildId: Snowflake): Promise<GuildEntity> {
    return this.get(GuildRouter.GUILD_ROUTES.guildPreviewEndpoint(guildId));
  }

  /**
   * Modifies an existing guild
   * Requires the MANAGE_GUILD permission.
   *
   * @param guildId - The ID of the guild to modify
   * @param options - New properties for the guild
   * @param reason - Reason for the modification (for audit logs)
   * @returns The updated guild object
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild}
   */
  async updateGuild(
    guildId: Snowflake,
    options: GuildUpdateOptions,
    reason?: string,
  ): Promise<GuildEntity> {
    const fileFields: (keyof GuildUpdateOptions)[] = [
      "icon",
      "splash",
      "discovery_splash",
      "banner",
    ];
    const processedOptions = await this.prepareBodyWithFiles(
      options,
      fileFields,
    );

    return this.patch(
      GuildRouter.GUILD_ROUTES.guildBaseEndpoint(guildId),
      processedOptions,
      { reason },
    );
  }

  /**
   * Deletes a guild permanently
   * The user must be the owner of the guild.
   *
   * @param guildId - The ID of the guild to delete
   * @returns A Promise that resolves when the guild is deleted
   * @see {@link https://discord.com/developers/docs/resources/guild#delete-guild}
   */
  deleteGuild(guildId: Snowflake): Promise<void> {
    return this.delete(GuildRouter.GUILD_ROUTES.guildBaseEndpoint(guildId));
  }

  /**
   * Retrieves a list of channels in a guild
   * Does not include threads.
   *
   * @param guildId - The ID of the guild to get channels for
   * @returns An array of channel objects
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-channels}
   */
  fetchChannels(guildId: Snowflake): Promise<AnyChannelEntity[]> {
    return this.get(GuildRouter.GUILD_ROUTES.guildChannelsEndpoint(guildId));
  }

  /**
   * Creates a new channel in a guild
   * Requires the MANAGE_CHANNELS permission.
   *
   * @param guildId - The ID of the guild to create a channel in
   * @param options - Configuration for the new channel
   * @param reason - Reason for creating the channel (for audit logs)
   * @returns The newly created channel object
   * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-channel}
   */
  createGuildChannel(
    guildId: Snowflake,
    options: AnyChannelEntity,
    reason?: string,
  ): Promise<AnyChannelEntity> {
    return this.post(
      GuildRouter.GUILD_ROUTES.guildChannelsEndpoint(guildId),
      options,
      { reason },
    );
  }

  /**
   * Modifies the positions of a set of channels in a guild
   * Requires the MANAGE_CHANNELS permission.
   *
   * @param guildId - The ID of the guild to modify channel positions in
   * @param options - Array of position modifications
   * @returns A Promise that resolves when the positions are updated
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-channel-positions}
   */
  updateGuildChannelPositions(
    guildId: Snowflake,
    options: ChannelPositionsUpdateOptions,
  ): Promise<void> {
    return this.patch(
      GuildRouter.GUILD_ROUTES.guildChannelsEndpoint(guildId),
      options,
    );
  }

  /**
   * Lists all active threads in a guild
   * Returns both public and private threads the user can access.
   *
   * @param guildId - The ID of the guild to list active threads for
   * @returns Object containing arrays of threads and thread members
   * @see {@link https://discord.com/developers/docs/resources/guild#list-active-guild-threads}
   */
  fetchActiveGuildThreads(
    guildId: Snowflake,
  ): Promise<ActiveThreadsResponse[]> {
    return this.get(
      GuildRouter.GUILD_ROUTES.guildActiveThreadsEndpoint(guildId),
    );
  }

  /**
   * Retrieves a member of a guild by user ID
   * Returns information about a specific guild member.
   *
   * @param guildId - The ID of the guild
   * @param userId - The ID of the user
   * @returns The guild member object
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-member}
   */
  fetchGuildMember(
    guildId: Snowflake,
    userId: Snowflake,
  ): Promise<GuildMemberEntity> {
    return this.get(
      GuildRouter.GUILD_ROUTES.guildMemberEndpoint(guildId, userId),
    );
  }

  /**
   * Lists members of a guild
   * Requires the GUILD_MEMBERS privileged intent.
   *
   * @param guildId - The ID of the guild to list members for
   * @param query - Query parameters for pagination
   * @returns Array of guild member objects
   * @see {@link https://discord.com/developers/docs/resources/guild#list-guild-members}
   */
  fetchGuildMembers(
    guildId: Snowflake,
    query: GuildMembersFetchParams,
  ): Promise<GuildMemberEntity[]> {
    return this.get(GuildRouter.GUILD_ROUTES.guildMembersEndpoint(guildId), {
      query,
    });
  }

  /**
   * Searches for guild members whose username or nickname starts with the provided string
   * Finds members based on name prefix search.
   *
   * @param guildId - The ID of the guild to search in
   * @param query - Search parameters including the query string
   * @returns Array of matching guild member objects
   * @see {@link https://discord.com/developers/docs/resources/guild#search-guild-members}
   */
  searchGuildMembers(
    guildId: Snowflake,
    query: GuildMembersSearchParams,
  ): Promise<GuildMemberEntity[]> {
    return this.get(
      GuildRouter.GUILD_ROUTES.guildMembersSearchEndpoint(guildId),
      { query },
    );
  }

  /**
   * Adds a user to a guild using an OAuth2 access token
   * Requires the CREATE_INSTANT_INVITE permission.
   *
   * @param guildId - The ID of the guild to add the member to
   * @param userId - The ID of the user to add
   * @param options - Configuration including OAuth2 access token and initial settings
   * @returns The guild member object or null if already a member
   * @see {@link https://discord.com/developers/docs/resources/guild#add-guild-member}
   */
  addGuildMember(
    guildId: Snowflake,
    userId: Snowflake,
    options: GuildMemberAddOptions,
  ): Promise<GuildMemberEntity> {
    return this.put(
      GuildRouter.GUILD_ROUTES.guildMemberEndpoint(guildId, userId),
      options,
    );
  }

  /**
   * Modifies attributes of a guild member
   * Different actions require different permissions.
   *
   * @param guildId - The ID of the guild
   * @param userId - The ID of the user to modify
   * @param options - New attributes for the guild member
   * @param reason - Reason for the modification (for audit logs)
   * @returns The updated guild member object
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-member}
   */
  updateGuildMember(
    guildId: Snowflake,
    userId: Snowflake,
    options: GuildMemberUpdateOptions,
    reason?: string,
  ): Promise<GuildMemberEntity> {
    return this.patch(
      GuildRouter.GUILD_ROUTES.guildMemberEndpoint(guildId, userId),
      options,
      { reason },
    );
  }

  /**
   * Modifies the current user's attributes in a guild
   * Currently only supports modifying the nickname.
   *
   * @param guildId - The ID of the guild
   * @param nickname - New nickname for the current user (or null to remove)
   * @param reason - Reason for the modification (for audit logs)
   * @returns The updated guild member object
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-current-member}
   */
  updateCurrentMember(
    guildId: Snowflake,
    nickname?: string | null,
    reason?: string,
  ): Promise<GuildMemberEntity> {
    return this.patch(
      GuildRouter.GUILD_ROUTES.guildCurrentMemberEndpoint(guildId),
      { nick: nickname },
      { reason },
    );
  }

  /**
   * Modifies the current user's nickname in a guild
   * Requires the CHANGE_NICKNAME permission.
   *
   * @param guildId - The ID of the guild
   * @param nickname - New nickname for the current user (or null to remove)
   * @param reason - Reason for the modification (for audit logs)
   * @returns The updated guild member object
   * @deprecated Use updateCurrentMember instead
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-current-user-nick}
   */
  updateNickname(
    guildId: Snowflake,
    nickname?: string | null,
    reason?: string,
  ): Promise<GuildMemberEntity> {
    return this.patch(
      GuildRouter.GUILD_ROUTES.guildCurrentMemberNicknameEndpoint(guildId),
      { nick: nickname },
      { reason },
    );
  }

  /**
   * Adds a role to a guild member
   * Requires the MANAGE_ROLES permission.
   *
   * @param guildId - The ID of the guild
   * @param userId - The ID of the user
   * @param roleId - The ID of the role to add
   * @param reason - Reason for adding the role (for audit logs)
   * @returns A Promise that resolves when the role is added
   * @see {@link https://discord.com/developers/docs/resources/guild#add-guild-member-role}
   */
  addRoleToMember(
    guildId: Snowflake,
    userId: Snowflake,
    roleId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.put(
      GuildRouter.GUILD_ROUTES.guildMemberRoleEndpoint(guildId, userId, roleId),
      undefined,
      { reason },
    );
  }

  /**
   * Removes a role from a guild member
   * Requires the MANAGE_ROLES permission.
   *
   * @param guildId - The ID of the guild
   * @param userId - The ID of the user
   * @param roleId - The ID of the role to remove
   * @param reason - Reason for removing the role (for audit logs)
   * @returns A Promise that resolves when the role is removed
   * @see {@link https://discord.com/developers/docs/resources/guild#remove-guild-member-role}
   */
  removeRoleFromMember(
    guildId: Snowflake,
    userId: Snowflake,
    roleId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.delete(
      GuildRouter.GUILD_ROUTES.guildMemberRoleEndpoint(guildId, userId, roleId),
      { reason },
    );
  }

  /**
   * Removes a member from a guild (kicks them)
   * Requires the KICK_MEMBERS permission.
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
    return this.delete(
      GuildRouter.GUILD_ROUTES.guildMemberEndpoint(guildId, userId),
      { reason },
    );
  }

  /**
   * Retrieves a list of bans for a guild
   * Requires the BAN_MEMBERS permission.
   *
   * @param guildId - The ID of the guild
   * @param query - Query parameters for filtering and pagination
   * @returns Array of ban objects
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-bans}
   */
  fetchGuildBans(
    guildId: Snowflake,
    query?: GuildBansFetchParams,
  ): Promise<BanEntity[]> {
    return this.get(GuildRouter.GUILD_ROUTES.guildBansEndpoint(guildId), {
      query,
    });
  }

  /**
   * Retrieves information about a ban for a user
   * Requires the BAN_MEMBERS permission.
   *
   * @param guildId - The ID of the guild
   * @param userId - The ID of the banned user
   * @returns The ban object or 404 if not found
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-ban}
   */
  fetchGuildBan(guildId: Snowflake, userId: Snowflake): Promise<BanEntity> {
    return this.get(GuildRouter.GUILD_ROUTES.guildBanEndpoint(guildId, userId));
  }

  /**
   * Creates a ban for a user
   * Requires the BAN_MEMBERS permission.
   *
   * @param guildId - The ID of the guild
   * @param userId - The ID of the user to ban
   * @param options - Ban options including message deletion duration
   * @param reason - Reason for the ban (for audit logs)
   * @returns A Promise that resolves when the ban is created
   * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-ban}
   */
  createGuildBan(
    guildId: Snowflake,
    userId: Snowflake,
    options: GuildBanCreateOptions,
    reason?: string,
  ): Promise<void> {
    return this.put(
      GuildRouter.GUILD_ROUTES.guildBanEndpoint(guildId, userId),
      options,
      { reason },
    );
  }

  /**
   * Removes a ban for a user
   * Requires the BAN_MEMBERS permission.
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
    return this.delete(
      GuildRouter.GUILD_ROUTES.guildBanEndpoint(guildId, userId),
      { reason },
    );
  }

  /**
   * Bans multiple users from a guild at once
   * Requires both the BAN_MEMBERS and MANAGE_GUILD permissions.
   *
   * @param guildId - The ID of the guild
   * @param options - Bulk ban options including user IDs and message deletion duration
   * @param reason - Reason for the bans (for audit logs)
   * @returns Object with lists of successfully banned and failed user IDs
   * @see {@link https://discord.com/developers/docs/resources/guild#bulk-guild-ban}
   */
  banUsers(
    guildId: Snowflake,
    options: GuildBansBulkOptions,
    reason?: string,
  ): Promise<GuildBansBulkResponse> {
    return this.put(
      GuildRouter.GUILD_ROUTES.guildBulkBanEndpoint(guildId),
      options,
      { reason },
    );
  }

  /**
   * Retrieves a list of all roles in a guild
   * Returns roles in ascending order by ID.
   *
   * @param guildId - The ID of the guild
   * @returns Array of role objects
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-roles}
   */
  fetchGuildRoles(guildId: Snowflake): Promise<RoleEntity[]> {
    return this.get(GuildRouter.GUILD_ROUTES.guildRolesEndpoint(guildId));
  }

  /**
   * Retrieves a specific role by ID
   * Returns information about a single role.
   *
   * @param guildId - The ID of the guild
   * @param roleId - The ID of the role
   * @returns The role object
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-role}
   */
  fetchGuildRole(guildId: Snowflake, roleId: Snowflake): Promise<RoleEntity> {
    return this.get(
      GuildRouter.GUILD_ROUTES.guildRoleEndpoint(guildId, roleId),
    );
  }

  /**
   * Creates a new role for the guild
   * Requires the MANAGE_ROLES permission.
   *
   * @param guildId - The ID of the guild
   * @param options - Configuration for the new role
   * @param reason - Reason for creating the role (for audit logs)
   * @returns The newly created role object
   * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-role}
   */
  async createGuildRole(
    guildId: Snowflake,
    options: GuildRoleCreateOptions,
    reason?: string,
  ): Promise<RoleEntity> {
    const fileFields: (keyof GuildRoleCreateOptions)[] = ["icon"];
    const processedOptions = await this.prepareBodyWithFiles(
      options,
      fileFields,
    );

    return this.post(
      GuildRouter.GUILD_ROUTES.guildRolesEndpoint(guildId),
      processedOptions,
      { reason },
    );
  }

  /**
   * Modifies the positions of roles in a guild
   * Requires the MANAGE_ROLES permission.
   *
   * @param guildId - The ID of the guild
   * @param options - Array of position modifications
   * @returns Array of all guild role objects with updated positions
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role-positions}
   */
  updateGuildRolePositions(
    guildId: Snowflake,
    options: RolePositionsUpdateOptions,
  ): Promise<RoleEntity[]> {
    return this.patch(
      GuildRouter.GUILD_ROUTES.guildRolesEndpoint(guildId),
      options,
    );
  }

  /**
   * Modifies a role in a guild
   * Requires the MANAGE_ROLES permission.
   *
   * @param guildId - The ID of the guild
   * @param roleId - The ID of the role to modify
   * @param options - New properties for the role
   * @param reason - Reason for modifying the role (for audit logs)
   * @returns The updated role object
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role}
   */
  updateGuildRole(
    guildId: Snowflake,
    roleId: Snowflake,
    options: GuildRoleUpdateOptions,
    reason?: string,
  ): Promise<RoleEntity> {
    return this.patch(
      GuildRouter.GUILD_ROUTES.guildRoleEndpoint(guildId, roleId),
      options,
      { reason },
    );
  }

  /**
   * Modifies a guild's MFA level
   * Requires guild ownership.
   *
   * @param guildId - The ID of the guild
   * @param level - The new MFA level
   * @param reason - Reason for changing the MFA level (for audit logs)
   * @returns The updated MFA level
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-mfa-level}
   */
  updateGuildMfaLevel(
    guildId: Snowflake,
    level: MfaLevel,
    reason?: string,
  ): Promise<number> {
    return this.post(
      GuildRouter.GUILD_ROUTES.guildMfaEndpoint(guildId),
      { level },
      { reason },
    );
  }

  /**
   * Deletes a role from a guild
   * Requires the MANAGE_ROLES permission.
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
    return this.delete(
      GuildRouter.GUILD_ROUTES.guildRoleEndpoint(guildId, roleId),
      { reason },
    );
  }

  /**
   * Gets the number of members that would be removed in a prune operation
   * Requires the MANAGE_GUILD and KICK_MEMBERS permissions.
   *
   * @param guildId - The ID of the guild
   * @param query - Query parameters including days of inactivity and roles to include
   * @returns Object with the pruned count
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-prune-count}
   */
  fetchGuildPruneCount(
    guildId: Snowflake,
    query?: GetGuildPruneCountQuerySchema,
  ): Promise<{ pruned: number }> {
    return this.get(GuildRouter.GUILD_ROUTES.guildPruneEndpoint(guildId), {
      query,
    });
  }

  /**
   * Begins a prune operation
   * Requires the MANAGE_GUILD and KICK_MEMBERS permissions.
   *
   * @param guildId - The ID of the guild
   * @param options - Prune options including days of inactivity and roles to include
   * @param reason - Reason for the prune (for audit logs)
   * @returns Object with the number of members pruned (null if compute_prune_count is false)
   * @see {@link https://discord.com/developers/docs/resources/guild#begin-guild-prune}
   */
  pruneGuildMembers(
    guildId: Snowflake,
    options: GuildPruneOptions,
    reason?: string,
  ): Promise<{ pruned: number | null }> {
    return this.post(
      GuildRouter.GUILD_ROUTES.guildPruneEndpoint(guildId),
      options,
      { reason },
    );
  }

  /**
   * Gets a list of voice regions for the guild
   * Returns region options including optimal region for the guild.
   *
   * @param guildId - The ID of the guild
   * @returns Array of voice region objects
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-voice-regions}
   */
  fetchGuildVoiceRegions(guildId: Snowflake): Promise<VoiceRegionEntity[]> {
    return this.get(GuildRouter.GUILD_ROUTES.guildRegionsEndpoint(guildId));
  }

  /**
   * Gets a list of invites for the guild
   * Requires the MANAGE_GUILD permission.
   *
   * @param guildId - The ID of the guild
   * @returns Array of invite objects with metadata
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-invites}
   */
  fetchGuildInvites(guildId: Snowflake): Promise<InviteWithMetadataEntity[]> {
    return this.get(GuildRouter.GUILD_ROUTES.guildInvitesEndpoint(guildId));
  }

  /**
   * Gets a list of integrations for the guild
   * Requires the MANAGE_GUILD permission.
   *
   * @param guildId - The ID of the guild
   * @returns Array of integration objects
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-integrations}
   */
  fetchGuildIntegrations(guildId: Snowflake): Promise<IntegrationEntity[]> {
    return this.get(
      GuildRouter.GUILD_ROUTES.guildIntegrationsEndpoint(guildId),
    );
  }

  /**
   * Deletes an integration from a guild
   * Requires the MANAGE_GUILD permission.
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
    return this.delete(
      GuildRouter.GUILD_ROUTES.guildIntegrationEndpoint(guildId, integrationId),
      { reason },
    );
  }

  /**
   * Gets the widget settings for the guild
   * Requires the MANAGE_GUILD permission.
   *
   * @param guildId - The ID of the guild
   * @returns The guild widget settings object
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-widget-settings}
   */
  fetchGuildWidgetSettings(
    guildId: Snowflake,
  ): Promise<GuildWidgetSettingsEntity> {
    return this.get(
      GuildRouter.GUILD_ROUTES.guildWidgetSettingsEndpoint(guildId),
    );
  }

  /**
   * Modifies the guild's widget settings
   * Requires the MANAGE_GUILD permission.
   *
   * @param guildId - The ID of the guild
   * @param options - New widget settings
   * @param reason - Reason for modifying the widget (for audit logs)
   * @returns The updated guild widget settings object
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-widget}
   */
  updateGuildWidget(
    guildId: Snowflake,
    options: GuildWidgetUpdateOptions,
    reason?: string,
  ): Promise<GuildWidgetSettingsEntity> {
    return this.patch(
      GuildRouter.GUILD_ROUTES.guildWidgetSettingsEndpoint(guildId),
      options,
      { reason },
    );
  }

  /**
   * Gets the widget for the guild
   * Returns public guild information for embedding.
   *
   * @param guildId - The ID of the guild
   * @returns The guild widget object
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-widget}
   */
  fetchGuildWidget(guildId: Snowflake): Promise<GuildWidgetEntity> {
    return this.get(GuildRouter.GUILD_ROUTES.guildWidgetEndpoint(guildId));
  }

  /**
   * Gets the vanity URL for the guild
   * Requires the MANAGE_GUILD permission.
   *
   * @param guildId - The ID of the guild
   * @returns Partial invite object with code and usage count
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-vanity-url}
   */
  fetchGuildVanityUrl(
    guildId: Snowflake,
  ): Promise<Pick<InviteWithMetadataEntity, "code" | "uses">> {
    return this.get(GuildRouter.GUILD_ROUTES.guildVanityUrlEndpoint(guildId));
  }

  /**
   * Gets a PNG image widget for the guild
   * Returns an image showing the guild's online member count.
   *
   * @param guildId - The ID of the guild
   * @param style - Style of the widget image
   * @returns Buffer containing the PNG image data
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-widget-image}
   */
  fetchGuildWidgetImage(
    guildId: Snowflake,
    style: WidgetStyle = "shield",
  ): Promise<Buffer> {
    return this.get(
      GuildRouter.GUILD_ROUTES.guildWidgetImageEndpoint(guildId),
      { query: { style } },
    );
  }

  /**
   * Gets the welcome screen for the guild
   * Requires MANAGE_GUILD permission if the welcome screen is disabled.
   *
   * @param guildId - The ID of the guild
   * @returns The welcome screen object
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-welcome-screen}
   */
  fetchGuildWelcomeScreen(guildId: Snowflake): Promise<WelcomeScreenEntity> {
    return this.get(
      GuildRouter.GUILD_ROUTES.guildWelcomeScreenEndpoint(guildId),
    );
  }

  /**
   * Modifies the guild's welcome screen
   * Requires the MANAGE_GUILD permission.
   *
   * @param guildId - The ID of the guild
   * @param options - New properties for the welcome screen
   * @param reason - Reason for modifying the welcome screen (for audit logs)
   * @returns The updated welcome screen object
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-welcome-screen}
   */
  updateGuildWelcomeScreen(
    guildId: Snowflake,
    options: GuildWelcomeScreenUpdateOptions,
    reason?: string,
  ): Promise<WelcomeScreenEntity> {
    return this.patch(
      GuildRouter.GUILD_ROUTES.guildWelcomeScreenEndpoint(guildId),
      options,
      { reason },
    );
  }

  /**
   * Gets the onboarding configuration for the guild
   * Returns the guild's new member onboarding settings.
   *
   * @param guildId - The ID of the guild
   * @returns The guild onboarding object
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-onboarding}
   */
  fetchGuildOnboarding(guildId: Snowflake): Promise<GuildOnboardingEntity> {
    return this.get(GuildRouter.GUILD_ROUTES.guildOnboardingEndpoint(guildId));
  }

  /**
   * Modifies the onboarding configuration of the guild
   * Requires the MANAGE_GUILD and MANAGE_ROLES permissions.
   *
   * @param guildId - The ID of the guild
   * @param options - New onboarding configuration
   * @param reason - Reason for modifying the onboarding (for audit logs)
   * @returns The updated guild onboarding object
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-onboarding}
   */
  updateGuildOnboarding(
    guildId: Snowflake,
    options: GuildOnboardingUpdateOptions,
    reason?: string,
  ): Promise<GuildOnboardingEntity> {
    return this.put(
      GuildRouter.GUILD_ROUTES.guildOnboardingEndpoint(guildId),
      options,
      { reason },
    );
  }
}
