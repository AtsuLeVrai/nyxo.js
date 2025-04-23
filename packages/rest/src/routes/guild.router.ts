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
import type { Rest } from "../core/index.js";
import type { FileInput } from "../handlers/index.js";
import { FileHandler } from "../handlers/index.js";

/**
 * Interface for creating a new guild.
 * Used to define the initial configuration when creating a guild from scratch.
 *
 * @remarks
 * Creating guilds is typically restricted to bot accounts that are in fewer than 10 guilds.
 * This is a privileged operation and not available to most bots.
 *
 * The created guild will have the bot as the owner.
 * Default channels and roles will be created unless specified in the channels and roles arrays.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-json-params}
 */
export interface GuildCreateOptions {
  /**
   * Guild name (2-100 characters)
   *
   * The name of the new guild. Must be between 2 and 100 characters long.
   * This field is required.
   */
  name: string;

  /**
   * Voice region id for the guild (deprecated)
   *
   * The initial voice region for the guild.
   * This field is deprecated as Discord now uses automatic voice region selection.
   * Set to null to use automatic selection.
   */
  region?: string | null;

  /**
   * Base64 128x128 image for the guild icon
   *
   * The icon image for the guild. Should be a square image, ideally 128x128 pixels.
   * Accepts FileInput which will be transformed to a data URI automatically.
   * Supports PNG, JPG, and GIF formats.
   */
  icon?: FileInput;

  /**
   * Verification level required for the guild
   *
   * Controls the verification requirements for new members:
   * - 0: NONE (Unrestricted)
   * - 1: LOW (Verified email required)
   * - 2: MEDIUM (Registered on Discord for >5 minutes)
   * - 3: HIGH (Member of server for >10 minutes)
   * - 4: VERY_HIGH (Verified phone number required)
   */
  verification_level?: VerificationLevel;

  /**
   * Default message notification level
   *
   * Controls when members receive notifications for messages:
   * - 0: ALL_MESSAGES (Notify for all messages)
   * - 1: ONLY_MENTIONS (Only notify for @mentions)
   */
  default_message_notifications?: DefaultMessageNotificationLevel;

  /**
   * Explicit content filter level
   *
   * Controls scanning of media content:
   * - 0: DISABLED (Don't scan any messages)
   * - 1: MEMBERS_WITHOUT_ROLES (Scan from members without roles)
   * - 2: ALL_MEMBERS (Scan from all members)
   */
  explicit_content_filter?: ExplicitContentFilterLevel;

  /**
   * New guild roles
   *
   * Array of roles to create with the guild.
   * The first role is assumed to be the @everyone role.
   * Role IDs should be strings like "0", "1", etc. as placeholders.
   * Discord will assign actual IDs during creation.
   */
  roles?: RoleEntity[];

  /**
   * New guild's channels
   *
   * Array of channels to create with the guild.
   * Channel IDs should be strings like "0", "1", etc. as placeholders.
   * Discord will assign actual IDs during creation.
   * These IDs can be referenced in other fields like system_channel_id.
   */
  channels?: AnyChannelEntity[];

  /**
   * ID for afk channel
   *
   * The ID of the voice channel where AFK members will be moved.
   * Should be a reference to one of the voice channels in the channels array.
   */
  afk_channel_id?: Snowflake;

  /**
   * AFK timeout in seconds
   *
   * The time after which inactive members are moved to the AFK channel.
   * Valid values are 60 (1 min), 300 (5 min), 900 (15 min), 1800 (30 min), and 3600 (1 hour).
   */
  afk_timeout?: number;

  /**
   * ID of the channel where guild notices such as welcome messages and boost events are posted
   *
   * The ID of the text channel where system messages will be sent.
   * Should be a reference to one of the text channels in the channels array.
   */
  system_channel_id?: Snowflake;

  /**
   * System channel flags
   *
   * Bitfield controlling which system messages are sent to the system channel:
   * - 1 << 0: Suppress member join notifications
   * - 1 << 1: Suppress server boost notifications
   * - 1 << 2: Suppress server setup tips
   * - 1 << 3: Suppress join sticker reply buttons
   */
  system_channel_flags?: SystemChannelFlags;
}

/**
 * Interface for updating an existing guild's settings.
 * Used to modify various properties of a guild after it has been created.
 *
 * @remarks
 * Requires the MANAGE_GUILD permission.
 * Some fields require additional permissions or specific guild features to be enabled.
 * All fields are optional, allowing partial updates.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-json-params}
 */
export interface GuildUpdateOptions {
  /**
   * Guild name (2-100 characters)
   *
   * The new name for the guild. Must be between 2 and 100 characters long.
   */
  name?: string;

  /**
   * Voice region id for the guild (deprecated)
   *
   * The voice region for the guild.
   * This field is deprecated as Discord now uses automatic voice region selection.
   * Set to null to use automatic selection.
   */
  region?: string | null;

  /**
   * Verification level required for the guild
   *
   * Controls the verification requirements for new members:
   * - 0: NONE (Unrestricted)
   * - 1: LOW (Verified email required)
   * - 2: MEDIUM (Registered on Discord for >5 minutes)
   * - 3: HIGH (Member of server for >10 minutes)
   * - 4: VERY_HIGH (Verified phone number required)
   *
   * Set to null to remove verification requirements.
   */
  verification_level?: VerificationLevel | null;

  /**
   * Default message notification level
   *
   * Controls when members receive notifications for messages:
   * - 0: ALL_MESSAGES (Notify for all messages)
   * - 1: ONLY_MENTIONS (Only notify for @mentions)
   *
   * Set to null to reset to default (ALL_MESSAGES).
   */
  default_message_notifications?: DefaultMessageNotificationLevel | null;

  /**
   * Explicit content filter level
   *
   * Controls scanning of media content:
   * - 0: DISABLED (Don't scan any messages)
   * - 1: MEMBERS_WITHOUT_ROLES (Scan from members without roles)
   * - 2: ALL_MEMBERS (Scan from all members)
   *
   * Set to null to reset to default (DISABLED).
   */
  explicit_content_filter?: ExplicitContentFilterLevel | null;

  /**
   * ID for afk channel
   *
   * The ID of the voice channel where AFK members will be moved.
   * Set to null to remove the AFK channel.
   */
  afk_channel_id?: Snowflake | null;

  /**
   * AFK timeout in seconds
   *
   * The time after which inactive members are moved to the AFK channel.
   * Valid values are 60 (1 min), 300 (5 min), 900 (15 min), 1800 (30 min), and 3600 (1 hour).
   */
  afk_timeout?: number;

  /**
   * Base64 1024x1024 png/jpeg/gif image for the guild icon
   *
   * The icon image for the guild. Should be a square image, ideally 1024x1024 pixels.
   * Accepts FileInput which will be transformed to a data URI automatically.
   * Supports PNG, JPG, and GIF formats.
   * Set to null to remove the current icon.
   */
  icon?: FileInput | null;

  /**
   * User ID to transfer guild ownership to (must be owner)
   *
   * Transfers ownership of the guild to another user.
   * The bot must be the current owner of the guild to use this.
   * If the guild has 2FA enabled, the bot must also have 2FA enabled.
   */
  owner_id?: Snowflake;

  /**
   * Base64 16:9 png/jpeg image for the guild splash
   *
   * The splash image shown in the invitation screen.
   * Requires the INVITE_SPLASH guild feature.
   * Recommended size is 1920x1080 (16:9 aspect ratio).
   * Set to null to remove the current splash.
   */
  splash?: FileInput | null;

  /**
   * Base64 16:9 png/jpeg image for the guild discovery splash
   *
   * The splash image shown in Discord's server discovery screen.
   * Requires the guild to be in the server discovery.
   * Recommended size is 1920x1080 (16:9 aspect ratio).
   * Set to null to remove the current discovery splash.
   */
  discovery_splash?: FileInput | null;

  /**
   * Base64 16:9 png/jpeg image for the guild banner
   *
   * The banner image displayed at the top of the guild.
   * Requires the BANNER guild feature.
   * Recommended size is 960x540 (16:9 aspect ratio).
   * Set to null to remove the current banner.
   */
  banner?: FileInput | null;

  /**
   * ID of the channel where guild notices are posted
   *
   * The ID of the text channel where system messages will be sent.
   * Set to null to remove the system channel.
   */
  system_channel_id?: Snowflake | null;

  /**
   * System channel flags
   *
   * Bitfield controlling which system messages are sent to the system channel:
   * - 1 << 0: Suppress member join notifications
   * - 1 << 1: Suppress server boost notifications
   * - 1 << 2: Suppress server setup tips
   * - 1 << 3: Suppress join sticker reply buttons
   */
  system_channel_flags?: SystemChannelFlags;

  /**
   * ID of the channel where Community guilds display rules
   *
   * The ID of the text channel where server rules are displayed.
   * Required for Community guilds.
   * Set to null to remove the rules channel.
   */
  rules_channel_id?: Snowflake | null;

  /**
   * ID of the channel where admins and moderators receive notices
   *
   * The ID of the text channel where Discord sends important updates for moderators.
   * Required for Community guilds.
   * Set to null to remove the public updates channel.
   */
  public_updates_channel_id?: Snowflake | null;

  /**
   * Preferred locale of a Community guild
   *
   * The preferred language for the guild, in IETF BCP 47 language tag format.
   * Only applies to Community guilds.
   * Example values: "en-US", "en-GB", "bg", "zh-CN", "de", "es-ES"
   */
  preferred_locale?: string;

  /**
   * Enabled guild features
   *
   * An array of guild feature strings to enable.
   * Most features require verification, partnership, or certain boost levels.
   * Features that the guild already has will remain even if not specified here.
   */
  features?: GuildFeature[];

  /**
   * Description for the guild
   *
   * The description of the guild shown in the discovery page.
   * Only available for guilds with the COMMUNITY feature.
   * Set to null to remove the description.
   */
  description?: string | null;

  /**
   * Whether the guild's boost progress bar should be enabled
   *
   * If true, the server boost progress bar will be shown in the guild.
   * If false, the progress bar will be hidden.
   */
  premium_progress_bar_enabled?: boolean;

  /**
   * ID of the channel where admins and moderators receive safety alerts
   *
   * The ID of the text channel where Discord sends safety-related alerts for moderators.
   * Set to null to remove the safety alerts channel.
   */
  safety_alerts_channel_id?: Snowflake | null;
}

/**
 * Interface for updating guild channel positions.
 * Used to modify the order of channels in a guild and optionally move them between categories.
 *
 * @remarks
 * Requires the MANAGE_CHANNELS permission.
 * Only the specified fields will be updated; other fields remain unchanged.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-channel-positions}
 */
export interface ChannelPositionUpdateOptions {
  /**
   * Channel ID
   *
   * The ID of the channel to move or modify.
   */
  id: Snowflake;

  /**
   * Sorting position of the channel
   *
   * The new position of the channel in the guild's channel list.
   * Positions are 0-indexed (0 is at the top).
   * Channels are sorted by position within their category.
   * Set to null to leave the position unchanged.
   */
  position?: number | null;

  /**
   * Syncs the permission overwrites with the new parent, if moving to a new category
   *
   * If true and the channel is being moved to a category (using parent_id),
   * the channel's permission overwrites will be replaced with the category's.
   * If false, the channel keeps its current permission overwrites.
   */
  lock_permissions?: boolean;

  /**
   * The new parent ID for the channel that is moved
   *
   * The ID of the category to move this channel under.
   * Set to null to remove the channel from its current category.
   */
  parent_id?: Snowflake | null;
}

/**
 * Type for a list of channel position updates to apply in a single operation.
 *
 */
export type ChannelPositionsUpdateOptions = ChannelPositionUpdateOptions[];

/**
 * Interface for the response when listing active guild threads.
 * Contains information about active threads in a guild and the current user's memberships.
 *
 * @remarks
 * This is the response structure from fetchActiveGuildThreads().
 * Active threads are those that have not been archived.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#list-active-guild-threads-response-body}
 */
export interface ActiveThreadsResponse {
  /**
   * The active threads
   *
   * An array of thread channel objects for all active (non-archived) threads in the guild
   * that the current bot has permission to view.
   */
  threads: AnyThreadChannelEntity[];

  /**
   * A thread member object for each returned thread the current user has joined
   *
   * An array of thread member objects for the threads that the current bot has joined.
   * This array may be smaller than the threads array if the bot hasn't joined all threads.
   */
  members: ThreadMemberEntity[];
}

/**
 * Interface for query parameters when listing guild members.
 * Used to paginate through a large list of members in a guild.
 *
 * @remarks
 * Requires the GUILD_MEMBERS privileged intent.
 * Results are paginated and sorted by user ID.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#list-guild-members-query-string-params}
 */
export interface GuildMembersFetchParams {
  /**
   * Max number of members to return (1-1000)
   *
   * Controls how many guild members to return per request.
   * Minimum value is 1, maximum value is 1000.
   * Defaults to 1 if not specified.
   */
  limit?: number;

  /**
   * The highest user id in the previous page
   *
   * Used for pagination. Return members after this user ID.
   * Should be the user ID of the last member from the previous request.
   * Members are sorted by user ID in ascending order.
   */
  after?: Snowflake;
}

/**
 * Interface for query parameters when searching guild members.
 * Used to find guild members based on username or nickname.
 *
 * @remarks
 * Unlike ListGuildMembers, this endpoint doesn't require the GUILD_MEMBERS intent.
 * The search is prefix-based and case-insensitive.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#search-guild-members-query-string-params}
 */
export interface GuildMembersSearchParams {
  /**
   * Query string to match username(s) and nickname(s) against
   *
   * The string to search for at the beginning of usernames or nicknames.
   * Minimum length is 1 character. Search is not case-sensitive.
   */
  query: string;

  /**
   * Max number of members to return (1-1000)
   *
   * Maximum number of members to return in the search results.
   * Minimum value is 1, maximum value is 1000.
   * Defaults to 1 if not specified.
   */
  limit: number;
}

/**
 * Interface for adding a member to a guild using OAuth2.
 * Used to add a user to a guild when you have their OAuth2 access token.
 *
 * @remarks
 * Requires the bot to have the CREATE_INSTANT_INVITE permission.
 * The access token must have the guilds.join scope.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#add-guild-member-json-params}
 */
export interface GuildMemberAddOptions {
  /**
   * OAuth2 access token granted with the guilds.join scope
   *
   * The OAuth2 access token of the user to add to the guild.
   * Must have the guilds.join scope.
   */
  access_token: string;

  /**
   * Value to set user's nickname to
   *
   * The nickname to give the user upon joining.
   * Requires the MANAGE_NICKNAMES permission.
   */
  nick?: string;

  /**
   * Array of role IDs the member is assigned
   *
   * The roles to give the user upon joining.
   * Requires the MANAGE_ROLES permission.
   */
  roles?: Snowflake[];

  /**
   * Whether the user is muted in voice channels
   *
   * If true, the user will be muted in voice channels.
   * Requires the MUTE_MEMBERS permission.
   */
  mute?: boolean;

  /**
   * Whether the user is deafened in voice channels
   *
   * If true, the user will be deafened in voice channels.
   * Requires the DEAFEN_MEMBERS permission.
   */
  deaf?: boolean;
}

/**
 * Interface for updating a guild member's attributes.
 * Used to modify various properties of a guild member, such as roles, nickname, or voice state.
 *
 * @remarks
 * Different operations require different permissions:
 * - nick: MANAGE_NICKNAMES
 * - roles: MANAGE_ROLES
 * - mute, deaf: MUTE_MEMBERS, DEAFEN_MEMBERS
 * - channel_id: MOVE_MEMBERS
 * - communication_disabled_until: MODERATE_MEMBERS
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-member-json-params}
 */
export interface GuildMemberUpdateOptions {
  /**
   * Value to set user's nickname to
   *
   * The new nickname for the guild member.
   * Set to null to remove the nickname.
   * Requires the MANAGE_NICKNAMES permission.
   */
  nick?: string | null;

  /**
   * Array of role IDs the member is assigned
   *
   * The complete list of role IDs the member should have.
   * This replaces all current roles, so include all roles you want the member to have.
   * Requires the MANAGE_ROLES permission.
   */
  roles?: Snowflake[];

  /**
   * Whether the user is muted in voice channels
   *
   * If true, the user will be muted in all voice channels in the guild.
   * Requires the MUTE_MEMBERS permission.
   */
  mute?: boolean;

  /**
   * Whether the user is deafened in voice channels
   *
   * If true, the user will be deafened in all voice channels in the guild.
   * Requires the DEAFEN_MEMBERS permission.
   */
  deaf?: boolean;

  /**
   * ID of channel to move user to (if they are connected to voice)
   *
   * The ID of the voice channel to move the user to.
   * The user must already be connected to a voice channel.
   * Set to null to disconnect the user from voice.
   * Requires the MOVE_MEMBERS permission.
   */
  channel_id?: Snowflake | null;

  /**
   * When the user's timeout will expire (up to 28 days in the future)
   *
   * ISO8601 datetime string for when the timeout should expire.
   * Maximum duration is 28 days from the current time.
   * Set to null to remove the timeout.
   * Requires the MODERATE_MEMBERS permission.
   */
  communication_disabled_until?: string;

  /**
   * Guild member flags
   *
   * Bitfield of guild member flags:
   * - 1 << 0: DID_REJOIN (Member has rejoined the guild)
   * - 1 << 1: COMPLETED_ONBOARDING (Member has completed onboarding)
   * - 1 << 2: BYPASSES_VERIFICATION (Member bypasses guild verification requirements)
   * - 1 << 3: STARTED_ONBOARDING (Member has started onboarding)
   */
  flags?: GuildMemberFlags;
}

/**
 * Interface for query parameters when getting guild bans.
 * Used to paginate through a guild's ban list.
 *
 * @remarks
 * Requires the BAN_MEMBERS permission.
 * Results are sorted by user ID.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-bans-query-string-params}
 */
export interface GuildBansFetchParams {
  /**
   * Number of users to return (up to maximum 1000)
   *
   * Controls how many ban objects to return per request.
   * Maximum value is 1000.
   * Defaults to 1000 if not specified.
   */
  limit?: number;

  /**
   * Consider only users before given user ID
   *
   * Return ban objects for users with IDs lexicographically before this ID.
   * Used for pagination to get previous pages.
   */
  before?: Snowflake;

  /**
   * Consider only users after given user ID
   *
   * Return ban objects for users with IDs lexicographically after this ID.
   * Used for pagination to get next pages.
   */
  after?: Snowflake;
}

/**
 * Interface for creating a guild ban.
 * Used to ban a user from a guild and optionally delete their recent messages.
 *
 * @remarks
 * Requires the BAN_MEMBERS permission.
 * The bot's highest role must be higher than the target user's highest role.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-ban-json-params}
 */
export interface GuildBanCreateOptions {
  /**
   * Number of days to delete messages for (0-7) (deprecated)
   *
   * Delete all messages from this user for this number of days.
   * Must be between 0 and 7 inclusive.
   * This field is deprecated, use delete_message_seconds instead.
   */
  delete_message_days?: number;

  /**
   * Number of seconds to delete messages for (0-604800)
   *
   * Delete all messages from this user sent in the last x seconds.
   * Must be between 0 and 604800 (7 days) inclusive.
   * This is the newer and more flexible replacement for delete_message_days.
   */
  delete_message_seconds?: number;
}

/**
 * Interface for bulk guild ban operation.
 * Used to ban multiple users from a guild at once.
 *
 * @remarks
 * Requires both the BAN_MEMBERS and MANAGE_GUILD permissions.
 * Limited to 200 users per request.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#bulk-guild-ban-json-params}
 */
export interface GuildBansBulkOptions {
  /**
   * List of user IDs to ban (max 200)
   *
   * Array of user IDs to ban from the guild.
   * Maximum of 200 IDs per request.
   */
  user_ids: Snowflake[];

  /**
   * Number of seconds to delete messages for (0-604800)
   *
   * Delete all messages from these users sent in the last x seconds.
   * Must be between 0 and 604800 (7 days) inclusive.
   * Defaults to 0 if not specified.
   */
  delete_message_seconds: number;
}

/**
 * Interface for bulk guild ban response.
 * Contains information about which users were successfully banned.
 *
 * @remarks
 * This is the response structure from the bulkGuildBan() method.
 * Users might fail to be banned if they have higher roles than the bot.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#bulk-guild-ban-bulk-ban-response}
 */
export interface GuildBansBulkResponse {
  /**
   * List of user IDs that were successfully banned
   *
   * Array of user IDs that were successfully banned from the guild.
   */
  banned_users: Snowflake[];

  /**
   * List of user IDs that were not banned
   *
   * Array of user IDs that could not be banned from the guild.
   * Common reasons include missing permissions or role hierarchy issues.
   */
  failed_users: Snowflake[];
}

/**
 * Interface for creating a guild role.
 * Used to define a new role with specific permissions and display settings.
 *
 * @remarks
 * Requires the MANAGE_ROLES permission.
 * The maximum number of roles per guild is 250 (excluding the @everyone role).
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-role-json-params}
 */
export interface GuildRoleCreateOptions {
  /**
   * Name of the role (max 100 characters)
   *
   * The name of the role. Maximum length is 100 characters.
   * Defaults to "new role" if not specified.
   */
  name: string;

  /**
   * Bitwise value of the enabled/disabled permissions
   *
   * String representation of the permissions bitfield.
   * Use "0" for no permissions, "8" for Administrator, etc.
   */
  permissions: string;

  /**
   * RGB color value
   *
   * The color of the role, represented as an integer.
   * Can use hexadecimal (e.g., 0xFF0000 for red) or decimal values.
   * Defaults to 0 (no color) if not specified.
   */
  color: number;

  /**
   * Whether the role should be displayed separately in the sidebar
   *
   * If true, members with this role are displayed separately in the member list.
   * Defaults to false if not specified.
   */
  hoist: boolean;

  /**
   * The role's icon image
   *
   * Image file for the role's icon.
   * Accepts FileInput which will be transformed to a data URI automatically.
   * Only available for guilds with the ROLE_ICONS feature.
   * Set to null to remove the current icon.
   */
  icon: FileInput | null;

  /**
   * The role's unicode emoji as a standard emoji
   *
   * A standard emoji to display as the role's icon.
   * Cannot be used together with a custom icon.
   * Must be a valid Unicode emoji.
   */
  unicode_emoji?: string;

  /**
   * Whether the role should be mentionable
   *
   * If true, anyone can mention this role in messages using @role-name.
   * If false, the role cannot be mentioned by regular members.
   * Defaults to false if not specified.
   */
  mentionable: boolean;
}

/**
 * Interface for updating guild role positions.
 * Used to change the hierarchy of roles in a guild.
 *
 * @remarks
 * Requires the MANAGE_ROLES permission.
 * The position affects the role's display order and permission hierarchy.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role-positions-json-params}
 */
export interface RolePositionUpdateOptions {
  /**
   * Role ID
   *
   * The ID of the role to reposition.
   */
  id: Snowflake;

  /**
   * Sorting position of the role
   *
   * The new position for the role.
   * Positions are 0-indexed, with 0 reserved for the @everyone role.
   * Role positions are sorted in descending order (highest value = highest position).
   * Set to null to leave the position unchanged.
   */
  position?: number | null;
}

/**
 * Type for a list of role position updates to apply in a single operation.
 *
 */
export type RolePositionsUpdateOptions = RolePositionUpdateOptions[];

/**
 * Interface for updating a guild role.
 * Used to modify an existing role's properties.
 *
 * @remarks
 * Requires the MANAGE_ROLES permission.
 * All properties are optional, allowing partial updates.
 * Can be null to reset all properties to default values.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role-json-params}
 */
export type GuildRoleUpdateOptions = Partial<GuildRoleCreateOptions> | null;

/**
 * Interface for query parameters when getting guild prune count.
 * Used to estimate how many members would be removed by a prune operation.
 *
 * @remarks
 * Requires the MANAGE_GUILD permission.
 * This is a preview endpoint that doesn't actually remove any members.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-prune-count-query-string-params}
 */
export interface GetGuildPruneCountQuerySchema {
  /**
   * Number of days to count prune for (1-30)
   *
   * The number of days after which a user is considered inactive.
   * Must be between 1 and 30 inclusive.
   * Defaults to 7 if not specified.
   */
  days?: number;

  /**
   * Comma-delimited array of role IDs to include
   *
   * Comma-separated list of role IDs to include in the prune count.
   * By default, prune count only considers members without roles.
   * If specified, prune count will consider members with these roles.
   */
  include_roles?: string;
}

/**
 * Interface for beginning a guild prune operation.
 * Used to remove inactive members from a guild.
 *
 * @remarks
 * Requires the MANAGE_GUILD and KICK_MEMBERS permissions.
 * This operation will actually remove members, unlike the prune count endpoint.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#begin-guild-prune-json-params}
 */
export interface GuildPruneOptions {
  /**
   * Number of days to prune (1-30)
   *
   * The number of days after which a user is considered inactive.
   * Must be between 1 and 30 inclusive.
   * Defaults to 7 if not specified.
   */
  days: number;

  /**
   * Whether 'pruned' is returned in the response
   *
   * If true, the response will include the number of members pruned.
   * If false, the response will not include the count (faster for large guilds).
   * Defaults to true if not specified.
   */
  compute_prune_count: boolean;

  /**
   * Array of role IDs to include
   *
   * Array of role IDs to include in the prune operation.
   * By default, prune only affects members without roles.
   * If specified, prune will also affect members with these roles.
   */
  include_roles: Snowflake[];

  /**
   * @deprecated Reason for the prune (deprecated)
   *
   * This field is deprecated and should not be used.
   * Use the reason parameter in the method call instead.
   */
  reason?: string;
}

/**
 * Widget style options for guild widget images.
 * Defines the visual style of the guild widget image.
 *
 * @remarks
 * Used with the fetchGuildWidgetImage method to specify the widget appearance.
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
 * @remarks
 * Requires the MANAGE_GUILD permission.
 * The widget provides a way for non-members to see information about the guild.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-widget-json-params}
 */
export interface GuildWidgetUpdateOptions {
  /**
   * Whether the widget is enabled
   *
   * If true, the guild widget will be enabled and accessible.
   * If false, the guild widget will be disabled.
   */
  enabled: boolean;

  /**
   * The widget channel ID
   *
   * The ID of the channel that will be used for invites from the widget.
   * Set to null to use the first available channel.
   */
  channel_id: Snowflake | null;
}

/**
 * Interface for updating guild welcome screen.
 * Used to configure the welcome screen shown to new members in Community guilds.
 *
 * @remarks
 * Requires the MANAGE_GUILD permission.
 * Only available for Community guilds.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-welcome-screen-json-params}
 */
export interface GuildWelcomeScreenUpdateOptions {
  /**
   * Whether the welcome screen is enabled
   *
   * If true, new members will see the welcome screen when joining.
   * If false, the welcome screen will be disabled.
   * Set to null to leave the current setting unchanged.
   */
  enabled?: boolean | null;

  /**
   * Channels shown in the welcome screen and their display options
   *
   * Array of welcome screen channel objects to show in the welcome screen.
   * Maximum of 5 channels can be shown.
   * Set to null to remove all welcome channels.
   */
  welcome_channels?: WelcomeScreenChannelEntity[] | null;

  /**
   * The server description to show in the welcome screen
   *
   * A text description shown at the top of the welcome screen.
   * Maximum length is 140 characters.
   * Set to null to remove the description.
   */
  description?: string | null;
}

/**
 * Interface for updating guild onboarding.
 * Used to configure the onboarding process for new members.
 *
 * @remarks
 * Requires both the MANAGE_GUILD and MANAGE_ROLES permissions.
 * Only available for Community guilds.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-onboarding}
 */
export interface GuildOnboardingUpdateOptions {
  /**
   * Prompts shown during onboarding and in customize community
   *
   * Array of onboarding prompt objects that define questions and options shown during onboarding.
   * Each prompt can assign roles and grant access to channels based on the user's selections.
   */
  prompts: GuildOnboardingPromptEntity[];

  /**
   * Channel IDs that members get opted into automatically
   *
   * Array of channel IDs that all new members will automatically have access to.
   * These channels are shown to the user during onboarding.
   */
  default_channel_ids: Snowflake[];

  /**
   * Whether onboarding is enabled in the guild
   *
   * If true, new members will go through the onboarding flow when joining.
   * If false, new members will not see onboarding.
   */
  enabled: boolean;

  /**
   * Current mode of onboarding
   *
   * The complexity of the onboarding flow:
   * - 0: DEFAULT (Simple onboarding with just rules acceptance)
   * - 1: ADVANCED (Full onboarding with prompts and customization)
   */
  mode: GuildOnboardingMode;
}

/**
 * Router for Guild-related endpoints in the Discord API
 *
 * This class contains static methods for constructing API routes
 * related to guilds, such as creating, updating, and deleting guilds,
 * as well as managing guild members, roles, and channels.
 *
 * @remarks
 * This class is designed to be used with the Discord API and
 * provides a convenient way to build the necessary
 * URLs for making requests.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild}
 */
export class GuildRouter {
  /**
   * Collection of API route constants for Discord Guild-related endpoints.
   *
   * These routes provide access to Discord's guild management functionality,
   * including servers, members, roles, bans, and related resources.
   *
   * Each endpoint function takes the necessary parameters (such as guild IDs, user IDs, etc.)
   * and returns the properly formatted API route string to use with REST methods.
   *
   * @remarks
   * All route constants follow the pattern described in Discord's official API documentation.
   * Routes with parameters use functions that accept those parameters and return the formatted route.
   *
   * @see {@link https://discord.com/developers/docs/resources/guild}
   */
  static readonly GUILD_ROUTES = {
    /**
     * Route for guild collection operations.
     *
     * Used for:
     * - POST: Create a new guild
     *
     * @returns `/guilds` route
     * @see https://discord.com/developers/docs/resources/guild#create-guild
     */
    guildsEndpoint: "/guilds",

    /**
     * Route for specific guild operations.
     *
     * Used for:
     * - GET: Fetch a guild by ID
     * - PATCH: Update a guild's settings
     * - DELETE: Delete a guild
     *
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild
     */
    guildBaseEndpoint: (guildId: Snowflake) => `/guilds/${guildId}` as const,

    /**
     * Route for retrieving guild preview.
     *
     * Used for:
     * - GET: Get a public preview of a guild without joining
     *
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/preview` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-preview
     */
    guildPreviewEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/preview` as const,

    /**
     * Route for guild channels operations.
     *
     * Used for:
     * - GET: List all channels in a guild
     * - POST: Create a new channel in a guild
     * - PATCH: Modify channel positions
     *
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/channels` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-channels
     */
    guildChannelsEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/channels` as const,

    /**
     * Route for listing active threads in a guild.
     *
     * Used for:
     * - GET: List all active threads in a guild
     *
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/threads/active` route
     * @see https://discord.com/developers/docs/resources/guild#list-active-guild-threads
     */
    guildActiveThreadsEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/threads/active` as const,

    /**
     * Route for guild members operations.
     *
     * Used for:
     * - GET: List members in a guild
     *
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/members` route
     * @see https://discord.com/developers/docs/resources/guild#list-guild-members
     */
    guildMembersEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/members` as const,

    /**
     * Route for searching guild members.
     *
     * Used for:
     * - GET: Search for guild members by name/nickname
     *
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/members/search` route
     * @see https://discord.com/developers/docs/resources/guild#search-guild-members
     */
    guildMembersSearchEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/members/search` as const,

    /**
     * Route for specific guild member operations.
     *
     * Used for:
     * - GET: Get a specific member
     * - PUT: Add a new member to the guild (OAuth2)
     * - PATCH: Update a guild member
     * - DELETE: Remove a member from the guild (kick)
     *
     * @param guildId - The ID of the guild
     * @param userId - The ID of the user
     * @returns `/guilds/{guild.id}/members/{user.id}` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-member
     */
    guildMemberEndpoint: (guildId: Snowflake, userId: Snowflake) =>
      `/guilds/${guildId}/members/${userId}` as const,

    /**
     * Route for operations on the current user's guild membership.
     *
     * Used for:
     * - PATCH: Update the current user's guild membership
     *
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/members/@me` route
     * @see https://discord.com/developers/docs/resources/guild#modify-current-member
     */
    guildCurrentMemberEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/members/@me` as const,

    /**
     * Route for modifying the current user's nickname in a guild.
     *
     * Used for:
     * - PATCH: Update the current user's nickname
     *
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/members/@me/nick` route
     * @deprecated Use guildCurrentMember instead
     * @see https://discord.com/developers/docs/resources/guild#modify-current-user-nick
     */
    guildCurrentMemberNicknameEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/members/@me/nick` as const,

    /**
     * Route for managing roles assigned to a guild member.
     *
     * Used for:
     * - PUT: Add a role to a guild member
     * - DELETE: Remove a role from a guild member
     *
     * @param guildId - The ID of the guild
     * @param userId - The ID of the user
     * @param roleId - The ID of the role
     * @returns `/guilds/{guild.id}/members/{user.id}/roles/{role.id}` route
     * @see https://discord.com/developers/docs/resources/guild#add-guild-member-role
     */
    guildMemberRoleEndpoint: (
      guildId: Snowflake,
      userId: Snowflake,
      roleId: Snowflake,
    ) => `/guilds/${guildId}/members/${userId}/roles/${roleId}` as const,

    /**
     * Route for guild bans operations.
     *
     * Used for:
     * - GET: List all bans in a guild
     *
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/bans` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-bans
     */
    guildBansEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/bans` as const,

    /**
     * Route for specific guild ban operations.
     *
     * Used for:
     * - GET: Get details of a specific ban
     * - PUT: Ban a user from the guild
     * - DELETE: Remove a ban (unban a user)
     *
     * @param guildId - The ID of the guild
     * @param userId - The ID of the banned user
     * @returns `/guilds/{guild.id}/bans/{user.id}` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-ban
     */
    guildBanEndpoint: (guildId: Snowflake, userId: Snowflake) =>
      `/guilds/${guildId}/bans/${userId}` as const,

    /**
     * Route for bulk banning users.
     *
     * Used for:
     * - PUT: Ban multiple users at once
     *
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/bulk-ban` route
     * @see https://discord.com/developers/docs/resources/guild#bulk-guild-ban
     */
    guildBulkBanEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/bulk-ban` as const,

    /**
     * Route for guild roles operations.
     *
     * Used for:
     * - GET: List all roles in a guild
     * - POST: Create a new role
     * - PATCH: Modify role positions
     *
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/roles` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-roles
     */
    guildRolesEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/roles` as const,

    /**
     * Route for specific guild role operations.
     *
     * Used for:
     * - GET: Get a specific role
     * - PATCH: Update a role
     * - DELETE: Delete a role
     *
     * @param guildId - The ID of the guild
     * @param roleId - The ID of the role
     * @returns `/guilds/{guild.id}/roles/{role.id}` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-role
     */
    guildRoleEndpoint: (guildId: Snowflake, roleId: Snowflake) =>
      `/guilds/${guildId}/roles/${roleId}` as const,

    /**
     * Route for managing guild MFA level.
     *
     * Used for:
     * - POST: Update the guild's MFA level requirement
     *
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/mfa` route
     * @see https://discord.com/developers/docs/resources/guild#modify-guild-mfa-level
     */
    guildMfaEndpoint: (guildId: Snowflake) => `/guilds/${guildId}/mfa` as const,

    /**
     * Route for guild prune operations.
     *
     * Used for:
     * - GET: Get count of members that would be removed by prune
     * - POST: Begin prune operation to remove inactive members
     *
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/prune` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-prune-count
     */
    guildPruneEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/prune` as const,

    /**
     * Route for guild voice regions.
     *
     * Used for:
     * - GET: List available voice regions for the guild
     *
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/regions` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-voice-regions
     */
    guildRegionsEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/regions` as const,

    /**
     * Route for guild invites operations.
     *
     * Used for:
     * - GET: List all invites for the guild
     *
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/invites` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-invites
     */
    guildInvitesEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/invites` as const,

    /**
     * Route for guild integrations operations.
     *
     * Used for:
     * - GET: List all integrations for the guild
     *
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/integrations` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-integrations
     */
    guildIntegrationsEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/integrations` as const,

    /**
     * Route for specific guild integration operations.
     *
     * Used for:
     * - DELETE: Delete an integration from the guild
     *
     * @param guildId - The ID of the guild
     * @param integrationId - The ID of the integration
     * @returns `/guilds/{guild.id}/integrations/{integration.id}` route
     * @see https://discord.com/developers/docs/resources/guild#delete-guild-integration
     */
    guildIntegrationEndpoint: (guildId: Snowflake, integrationId: Snowflake) =>
      `/guilds/${guildId}/integrations/${integrationId}` as const,

    /**
     * Route for guild widget settings operations.
     *
     * Used for:
     * - GET: Get the guild widget settings
     * - PATCH: Update the guild widget settings
     *
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/widget` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-widget-settings
     */
    guildWidgetSettingsEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/widget` as const,

    /**
     * Route for retrieving the guild widget JSON.
     *
     * Used for:
     * - GET: Get the guild widget data in JSON format
     *
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/widget.json` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-widget
     */
    guildWidgetEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/widget.json` as const,

    /**
     * Route for guild vanity URL operations.
     *
     * Used for:
     * - GET: Get information about the guild's vanity URL
     *
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/vanity-url` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-vanity-url
     */
    guildVanityUrlEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/vanity-url` as const,

    /**
     * Route for retrieving guild widget image.
     *
     * Used for:
     * - GET: Get the guild widget as a PNG image
     *
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/widget.png` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-widget-image
     */
    guildWidgetImageEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/widget.png` as const,

    /**
     * Route for guild welcome screen operations.
     *
     * Used for:
     * - GET: Get the guild's welcome screen
     * - PATCH: Update the guild's welcome screen
     *
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/welcome-screen` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-welcome-screen
     */
    guildWelcomeScreenEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/welcome-screen` as const,

    /**
     * Route for guild onboarding operations.
     *
     * Used for:
     * - GET: Get the guild's onboarding configuration
     * - PUT: Update the guild's onboarding configuration
     *
     * @param guildId - The ID of the guild
     * @returns `/guilds/{guild.id}/onboarding` route
     * @see https://discord.com/developers/docs/resources/guild#get-guild-onboarding
     */
    guildOnboardingEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/onboarding` as const,
  } as const;

  /**
   * The REST client used for making API requests to Discord.
   *
   * This private property stores the Rest instance passed to the constructor.
   * It's used by all methods to send HTTP requests to Discord's API endpoints.
   */
  readonly #rest: Rest;

  /**
   * Creates a new GuildRouter instance.
   *
   * @param rest - The REST client to use for making Discord API requests
   *
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Creates a new guild with the provided options
   *
   * @param options - Configuration for the new guild
   * @returns The newly created guild object
   * @throws {Error} Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#create-guild}
   *
   * @remarks
   * This endpoint can be used only by bots in fewer than 10 guilds.
   * There are rate limits on guild creation.
   */
  async createGuild(options: GuildCreateOptions): Promise<GuildEntity> {
    if (options.icon) {
      options.icon = await FileHandler.toDataUri(options.icon);
    }

    return this.#rest.post(GuildRouter.GUILD_ROUTES.guildsEndpoint, {
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
   *
   * @remarks
   * The bot must be a member of the guild to retrieve it.
   * Setting withCounts to true includes approximate_member_count and approximate_presence_count fields.
   */
  fetchGuild(guildId: Snowflake, withCounts = false): Promise<GuildEntity> {
    return this.#rest.get(GuildRouter.GUILD_ROUTES.guildBaseEndpoint(guildId), {
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
   *
   * @remarks
   * This endpoint does not require the bot to be a member of the guild.
   * The guild must have the DISCOVERABLE feature enabled to be previewed by non-members.
   */
  fetchPreview(guildId: Snowflake): Promise<GuildEntity> {
    return this.#rest.get(
      GuildRouter.GUILD_ROUTES.guildPreviewEndpoint(guildId),
    );
  }

  /**
   * Modifies an existing guild
   *
   * @param guildId - The ID of the guild to modify
   * @param options - New properties for the guild
   * @param reason - Reason for the modification (for audit logs)
   * @returns The updated guild object
   * @throws {Error} Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild}
   *
   * @remarks
   * Requires the MANAGE_GUILD permission.
   * To update the guild icon, banner, or splash, you need the respective feature to be enabled in your guild.
   * When transferring guild ownership (using owner_id), you must have 2FA enabled if the server has it enabled.
   * Fires a Guild Update Gateway event.
   */
  async updateGuild(
    guildId: Snowflake,
    options: GuildUpdateOptions,
    reason?: string,
  ): Promise<GuildEntity> {
    if (options.icon) {
      options.icon = await FileHandler.toDataUri(options.icon);
    }

    return this.#rest.patch(
      GuildRouter.GUILD_ROUTES.guildBaseEndpoint(guildId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Deletes a guild permanently
   * The user must be the owner of the guild
   *
   * @param guildId - The ID of the guild to delete
   * @returns A Promise that resolves when the guild is deleted
   * @see {@link https://discord.com/developers/docs/resources/guild#delete-guild}
   *
   * @remarks
   * This action can only be performed by the guild owner.
   * Bots cannot own guilds, so this endpoint is primarily useful in user-authorized apps.
   * This action is permanent and cannot be undone.
   * Fires a Guild Delete Gateway event.
   */
  deleteGuild(guildId: Snowflake): Promise<void> {
    return this.#rest.delete(
      GuildRouter.GUILD_ROUTES.guildBaseEndpoint(guildId),
    );
  }

  /**
   * Retrieves a list of channels in a guild
   * Does not include threads
   *
   * @param guildId - The ID of the guild to get channels for
   * @returns An array of channel objects
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-channels}
   *
   * @remarks
   * This endpoint returns all channels in the guild, but does not include threads.
   * Channels are returned in the same order as they appear in the Discord client.
   * The bot must have access to the channels to see them in the response.
   */
  fetchChannels(guildId: Snowflake): Promise<AnyChannelEntity[]> {
    return this.#rest.get(
      GuildRouter.GUILD_ROUTES.guildChannelsEndpoint(guildId),
    );
  }

  /**
   * Creates a new channel in a guild
   * Requires the MANAGE_CHANNELS permission
   *
   * @param guildId - The ID of the guild to create a channel in
   * @param options - Configuration for the new channel
   * @param reason - Reason for creating the channel (for audit logs)
   * @returns The newly created channel object
   * @throws {Error} Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-channel}
   *
   * @remarks
   * Requires the MANAGE_CHANNELS permission.
   * The maximum number of channels in a guild is 500 (including categories).
   * Channel names must be between 1-100 characters.
   * Forum and media channels have additional constraints on available tags.
   * Fires a Channel Create Gateway event.
   */
  createGuildChannel(
    guildId: Snowflake,
    options: AnyChannelEntity,
    reason?: string,
  ): Promise<AnyChannelEntity> {
    return this.#rest.post(
      GuildRouter.GUILD_ROUTES.guildChannelsEndpoint(guildId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Modifies the positions of a set of channels in a guild
   * Requires the MANAGE_CHANNELS permission
   *
   * @param guildId - The ID of the guild to modify channel positions in
   * @param options - Array of position modifications
   * @returns A Promise that resolves when the positions are updated
   * @throws {Error} Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-channel-positions}
   *
   * @remarks
   * Requires the MANAGE_CHANNELS permission.
   * Only channels of the same type can be reordered relative to each other.
   * The position value uses a 0-based index.
   * If modifying channel positions in a category, all channels must belong to the same category.
   * Fires multiple Channel Update Gateway events.
   */
  updateGuildChannelPositions(
    guildId: Snowflake,
    options: ChannelPositionsUpdateOptions,
  ): Promise<void> {
    return this.#rest.patch(
      GuildRouter.GUILD_ROUTES.guildChannelsEndpoint(guildId),
      {
        body: JSON.stringify(options),
      },
    );
  }

  /**
   * Lists all active threads in a guild
   * Returns both public and private threads
   *
   * @param guildId - The ID of the guild to list active threads for
   * @returns Object containing arrays of threads and thread members
   * @see {@link https://discord.com/developers/docs/resources/guild#list-active-guild-threads}
   *
   * @remarks
   * Returns all active threads in the guild that the current user can access, including public and private threads.
   * The response includes thread members for threads that the current user has joined.
   * A thread is active if it hasn't been archived.
   */
  fetchActiveGuildThreads(
    guildId: Snowflake,
  ): Promise<ActiveThreadsResponse[]> {
    return this.#rest.get(
      GuildRouter.GUILD_ROUTES.guildActiveThreadsEndpoint(guildId),
    );
  }

  /**
   * Retrieves a member of a guild by user ID
   *
   * @param guildId - The ID of the guild
   * @param userId - The ID of the user
   * @returns The guild member object
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-member}
   *
   * @remarks
   * Returns a 404 response if the user is not a member of the guild.
   * The bot must have access to the guild and member to retrieve this information.
   */
  fetchGuildMember(
    guildId: Snowflake,
    userId: Snowflake,
  ): Promise<GuildMemberEntity> {
    return this.#rest.get(
      GuildRouter.GUILD_ROUTES.guildMemberEndpoint(guildId, userId),
    );
  }

  /**
   * Lists members of a guild
   * Requires the GUILD_MEMBERS privileged intent
   *
   * @param guildId - The ID of the guild to list members for
   * @param query - Query parameters for pagination
   * @returns Array of guild member objects
   * @throws {Error} Error if validation of query parameters fails
   * @see {@link https://discord.com/developers/docs/resources/guild#list-guild-members}
   *
   * @remarks
   * Requires the GUILD_MEMBERS privileged intent to be enabled in your bot settings.
   * Returns paginated results, sorted by user ID in ascending order.
   * You can use the `after` parameter with the last user ID from the previous request to paginate.
   * The maximum `limit` is 1000 members per request.
   */
  fetchGuildMembers(
    guildId: Snowflake,
    query: GuildMembersFetchParams,
  ): Promise<GuildMemberEntity[]> {
    return this.#rest.get(
      GuildRouter.GUILD_ROUTES.guildMembersEndpoint(guildId),
      {
        query,
      },
    );
  }

  /**
   * Searches for guild members whose username or nickname starts with the provided string
   *
   * @param guildId - The ID of the guild to search in
   * @param query - Search parameters including the query string
   * @returns Array of matching guild member objects
   * @throws {Error} Error if validation of query parameters fails
   * @see {@link https://discord.com/developers/docs/resources/guild#search-guild-members}
   *
   * @remarks
   * The search is prefix-based, matching usernames and nicknames that start with the query string.
   * The search is case-insensitive.
   * Unlike fetchGuildMembers, this method doesn't require the GUILD_MEMBERS privileged intent.
   */
  searchGuildMembers(
    guildId: Snowflake,
    query: GuildMembersSearchParams,
  ): Promise<GuildMemberEntity[]> {
    return this.#rest.get(
      GuildRouter.GUILD_ROUTES.guildMembersSearchEndpoint(guildId),
      {
        query,
      },
    );
  }

  /**
   * Adds a user to a guild using an OAuth2 access token
   * The bot must be a member of the guild with CREATE_INSTANT_INVITE permission
   *
   * @param guildId - The ID of the guild to add the member to
   * @param userId - The ID of the user to add
   * @param options - Configuration including OAuth2 access token and initial member settings
   * @returns The guild member object or null if already a member
   * @throws {Error} Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#add-guild-member}
   *
   * @remarks
   * Requires an OAuth2 access token with the `guilds.join` scope.
   * The bot must have the CREATE_INSTANT_INVITE permission in the guild.
   * Returns 201 with the guild member if user wasn't already a member.
   * Returns 204 with no body if the user was already a member.
   * Fires a Guild Member Add Gateway event.
   */
  addGuildMember(
    guildId: Snowflake,
    userId: Snowflake,
    options: GuildMemberAddOptions,
  ): Promise<GuildMemberEntity> {
    return this.#rest.put(
      GuildRouter.GUILD_ROUTES.guildMemberEndpoint(guildId, userId),
      {
        body: JSON.stringify(options),
      },
    );
  }

  /**
   * Modifies attributes of a guild member
   *
   * @param guildId - The ID of the guild
   * @param userId - The ID of the user to modify
   * @param options - New attributes for the guild member
   * @param reason - Reason for the modification (for audit logs)
   * @returns The updated guild member object
   * @throws {Error} Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-member}
   *
   * @remarks
   * Different operations require different permissions:
   * - nick: MANAGE_NICKNAMES
   * - roles: MANAGE_ROLES
   * - mute, deaf: MUTE_MEMBERS, DEAFEN_MEMBERS
   * - channel_id: MOVE_MEMBERS
   * - communication_disabled_until: MODERATE_MEMBERS
   *
   * Timeouts can be set up to 28 days in the future.
   * To remove a timeout, set communication_disabled_until to null.
   * Fires a Guild Member Update Gateway event.
   */
  updateGuildMember(
    guildId: Snowflake,
    userId: Snowflake,
    options: GuildMemberUpdateOptions,
    reason?: string,
  ): Promise<GuildMemberEntity> {
    return this.#rest.patch(
      GuildRouter.GUILD_ROUTES.guildMemberEndpoint(guildId, userId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
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
   *
   * @remarks
   * The bot needs the CHANGE_NICKNAME permission to update its own nickname.
   * Fires a Guild Member Update Gateway event.
   */
  updateCurrentMember(
    guildId: Snowflake,
    nickname?: string | null,
    reason?: string,
  ): Promise<GuildMemberEntity> {
    return this.#rest.patch(
      GuildRouter.GUILD_ROUTES.guildCurrentMemberEndpoint(guildId),
      {
        body: JSON.stringify({ nick: nickname }),
        reason,
      },
    );
  }

  /**
   * Modifies the current user's nickname in a guild
   *
   * @param guildId - The ID of the guild
   * @param nickname - New nickname for the current user (or null to remove)
   * @param reason - Reason for the modification (for audit logs)
   * @returns The updated guild member object
   * @deprecated Use updateCurrentMember instead
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-current-user-nick}
   *
   * @remarks
   * This method is deprecated. Use updateCurrentMember instead.
   * Requires the CHANGE_NICKNAME permission.
   * Fires a Guild Member Update Gateway event.
   */
  updateNickname(
    guildId: Snowflake,
    nickname?: string | null,
    reason?: string,
  ): Promise<GuildMemberEntity> {
    return this.#rest.patch(
      GuildRouter.GUILD_ROUTES.guildCurrentMemberNicknameEndpoint(guildId),
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
   *
   * @remarks
   * Requires the MANAGE_ROLES permission.
   * The bot's highest role must be higher than the role being assigned.
   * Fires a Guild Member Update Gateway event.
   */
  addRoleToMember(
    guildId: Snowflake,
    userId: Snowflake,
    roleId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.#rest.put(
      GuildRouter.GUILD_ROUTES.guildMemberRoleEndpoint(guildId, userId, roleId),
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
   *
   * @remarks
   * Requires the MANAGE_ROLES permission.
   * The bot's highest role must be higher than the role being removed.
   * Fires a Guild Member Update Gateway event.
   */
  removeRoleFromMember(
    guildId: Snowflake,
    userId: Snowflake,
    roleId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.#rest.delete(
      GuildRouter.GUILD_ROUTES.guildMemberRoleEndpoint(guildId, userId, roleId),
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
   *
   * @remarks
   * Requires the KICK_MEMBERS permission.
   * The bot must have a higher role than the target user.
   * Fires a Guild Member Remove Gateway event.
   * Kicked users can rejoin the guild if they have an invite.
   */
  removeGuildMember(
    guildId: Snowflake,
    userId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.#rest.delete(
      GuildRouter.GUILD_ROUTES.guildMemberEndpoint(guildId, userId),
      {
        reason,
      },
    );
  }

  /**
   * Retrieves a list of bans for a guild
   * Requires the BAN_MEMBERS permission
   *
   * @param guildId - The ID of the guild
   * @param query - Query parameters for filtering and pagination
   * @returns Array of ban objects
   * @throws {Error} Error if validation of query parameters fails
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-bans}
   *
   * @remarks
   * Requires the BAN_MEMBERS permission.
   * Returns paginated results in ascending order by user ID.
   * Use the `before` and `after` parameters for pagination.
   * The maximum `limit` is 1000 bans per request.
   */
  fetchGuildBans(
    guildId: Snowflake,
    query?: GuildBansFetchParams,
  ): Promise<BanEntity[]> {
    return this.#rest.get(GuildRouter.GUILD_ROUTES.guildBansEndpoint(guildId), {
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
   *
   * @remarks
   * Requires the BAN_MEMBERS permission.
   * Returns a 404 if the user is not banned from the guild.
   */
  fetchGuildBan(guildId: Snowflake, userId: Snowflake): Promise<BanEntity> {
    return this.#rest.get(
      GuildRouter.GUILD_ROUTES.guildBanEndpoint(guildId, userId),
    );
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
   * @throws {Error} Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-ban}
   *
   * @remarks
   * Requires the BAN_MEMBERS permission.
   * The bot must have a higher role than the target user.
   * `delete_message_days` is deprecated, use `delete_message_seconds` instead.
   * `delete_message_seconds` can be up to 604800 seconds (7 days).
   * Fires a Guild Ban Add Gateway event.
   */
  createGuildBan(
    guildId: Snowflake,
    userId: Snowflake,
    options: GuildBanCreateOptions,
    reason?: string,
  ): Promise<void> {
    return this.#rest.put(
      GuildRouter.GUILD_ROUTES.guildBanEndpoint(guildId, userId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
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
   *
   * @remarks
   * Requires the BAN_MEMBERS permission.
   * Fires a Guild Ban Remove Gateway event.
   * Returns a 404 if the user is not banned.
   */
  removeGuildBan(
    guildId: Snowflake,
    userId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.#rest.delete(
      GuildRouter.GUILD_ROUTES.guildBanEndpoint(guildId, userId),
      {
        reason,
      },
    );
  }

  /**
   * Bans multiple users from a guild at once
   * Requires both the BAN_MEMBERS and MANAGE_GUILD permissions
   *
   * @param guildId - The ID of the guild
   * @param options - Bulk ban options including user IDs and message deletion duration
   * @param reason - Reason for the bans (for audit logs)
   * @returns Object with lists of successfully banned and failed user IDs
   * @throws {Error} Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#bulk-guild-ban}
   *
   * @remarks
   * Requires both the BAN_MEMBERS and MANAGE_GUILD permissions.
   * Can ban up to 200 users in a single request.
   * The `failed_users` array contains IDs that couldn't be banned (e.g., due to role hierarchy).
   * Fires multiple Guild Ban Add Gateway events.
   */
  banUsers(
    guildId: Snowflake,
    options: GuildBansBulkOptions,
    reason?: string,
  ): Promise<GuildBansBulkResponse> {
    return this.#rest.put(
      GuildRouter.GUILD_ROUTES.guildBulkBanEndpoint(guildId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Retrieves a list of all roles in a guild
   *
   * @param guildId - The ID of the guild
   * @returns Array of role objects
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-roles}
   *
   * @remarks
   * Roles are returned in ascending order by ID, not by position in the hierarchy.
   * The @everyone role is always included and has the same ID as the guild.
   */
  fetchGuildRoles(guildId: Snowflake): Promise<RoleEntity[]> {
    return this.#rest.get(GuildRouter.GUILD_ROUTES.guildRolesEndpoint(guildId));
  }

  /**
   * Retrieves a specific role by ID
   *
   * @param guildId - The ID of the guild
   * @param roleId - The ID of the role
   * @returns The role object
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-role}
   *
   * @remarks
   * Returns a 404 if the role doesn't exist in the guild.
   */
  fetchGuildRole(guildId: Snowflake, roleId: Snowflake): Promise<RoleEntity> {
    return this.#rest.get(
      GuildRouter.GUILD_ROUTES.guildRoleEndpoint(guildId, roleId),
    );
  }

  /**
   * Creates a new role for the guild
   * Requires the MANAGE_ROLES permission
   *
   * @param guildId - The ID of the guild
   * @param options - Configuration for the new role
   * @param reason - Reason for creating the role (for audit logs)
   * @returns The newly created role object
   * @throws {Error} Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-role}
   *
   * @remarks
   * Requires the MANAGE_ROLES permission.
   * The position of the new role will be below the bot's highest role.
   * The maximum number of roles per guild is 250.
   * Fires a Guild Role Create Gateway event.
   */
  async createGuildRole(
    guildId: Snowflake,
    options: GuildRoleCreateOptions,
    reason?: string,
  ): Promise<RoleEntity> {
    if (options.icon) {
      options.icon = await FileHandler.toDataUri(options.icon);
    }

    return this.#rest.post(
      GuildRouter.GUILD_ROUTES.guildRolesEndpoint(guildId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Modifies the positions of roles in a guild
   * Requires the MANAGE_ROLES permission
   *
   * @param guildId - The ID of the guild
   * @param options - Array of position modifications
   * @returns Array of all guild role objects with updated positions
   * @throws {Error} Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role-positions}
   *
   * @remarks
   * Requires the MANAGE_ROLES permission.
   * The bot's highest role determines the highest position it can move roles to.
   * Omitting the position field will automatically calculate a position.
   * Moving roles above the bot's highest role will result in a 403 error.
   * Fires multiple Guild Role Update Gateway events.
   */
  updateGuildRolePositions(
    guildId: Snowflake,
    options: RolePositionsUpdateOptions,
  ): Promise<RoleEntity[]> {
    return this.#rest.patch(
      GuildRouter.GUILD_ROUTES.guildRolesEndpoint(guildId),
      {
        body: JSON.stringify(options),
      },
    );
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
   * @throws {Error} Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role}
   *
   * @remarks
   * Requires the MANAGE_ROLES permission.
   * The bot's highest role must be higher than the role being modified.
   * Cannot modify roles with higher position than the bot's highest role.
   * Fires a Guild Role Update Gateway event.
   */
  updateGuildRole(
    guildId: Snowflake,
    roleId: Snowflake,
    options: GuildRoleUpdateOptions,
    reason?: string,
  ): Promise<RoleEntity> {
    return this.#rest.patch(
      GuildRouter.GUILD_ROUTES.guildRoleEndpoint(guildId, roleId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
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
   *
   * @remarks
   * Requires the bot to be the guild owner.
   * MFA levels:
   * - 0: NONE (No MFA required for moderator actions)
   * - 1: ELEVATED (Moderators need 2FA enabled to perform moderation actions)
   * The bot must have MFA enabled to set the guild to level 1.
   */
  updateGuildMfaLevel(
    guildId: Snowflake,
    level: MfaLevel,
    reason?: string,
  ): Promise<number> {
    return this.#rest.post(GuildRouter.GUILD_ROUTES.guildMfaEndpoint(guildId), {
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
   *
   * @remarks
   * Requires the MANAGE_ROLES permission.
   * The bot's highest role must be higher than the role being deleted.
   * Cannot delete roles with higher position than the bot's highest role.
   * Cannot delete the @everyone role.
   * Fires a Guild Role Delete Gateway event.
   */
  deleteGuildRole(
    guildId: Snowflake,
    roleId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.#rest.delete(
      GuildRouter.GUILD_ROUTES.guildRoleEndpoint(guildId, roleId),
      {
        reason,
      },
    );
  }

  /**
   * Gets the number of members that would be removed in a prune operation
   * Requires the MANAGE_GUILD and KICK_MEMBERS permissions
   *
   * @param guildId - The ID of the guild
   * @param query - Query parameters including days of inactivity and roles to include
   * @returns Object with the pruned count
   * @throws {Error} Error if validation of query parameters fails
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-prune-count}
   *
   * @remarks
   * Requires both the MANAGE_GUILD and KICK_MEMBERS permissions.
   * A member is considered inactive if they have not been seen in the guild for the specified number of days.
   * "Seen" means having sent a message, added a reaction, used a voice channel, or updated their presence.
   * The default inactive period is 7 days if not specified.
   * The maximum inactive period that can be specified is 30 days.
   */
  fetchGuildPruneCount(
    guildId: Snowflake,
    query?: GetGuildPruneCountQuerySchema,
  ): Promise<{ pruned: number }> {
    return this.#rest.get(
      GuildRouter.GUILD_ROUTES.guildPruneEndpoint(guildId),
      {
        query,
      },
    );
  }

  /**
   * Begins a prune operation
   * Requires the MANAGE_GUILD and KICK_MEMBERS permissions
   *
   * @param guildId - The ID of the guild
   * @param options - Prune options including days of inactivity and roles to include
   * @param reason - Reason for the prune (for audit logs)
   * @returns Object with the number of members pruned (null if compute_prune_count is false)
   * @throws {Error} Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#begin-guild-prune}
   *
   * @remarks
   * Requires both the MANAGE_GUILD and KICK_MEMBERS permissions.
   * Setting compute_prune_count to false makes the operation faster for very large guilds.
   * A member is considered inactive if they have not been seen in the guild for the specified number of days.
   * The maximum inactive period that can be specified is 30 days.
   * Fires multiple Guild Member Remove Gateway events.
   */
  pruneGuildMembers(
    guildId: Snowflake,
    options: GuildPruneOptions,
    reason?: string,
  ): Promise<{ pruned: number | null }> {
    return this.#rest.post(
      GuildRouter.GUILD_ROUTES.guildPruneEndpoint(guildId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Gets a list of voice regions for the guild
   *
   * @param guildId - The ID of the guild
   * @returns Array of voice region objects
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-voice-regions}
   *
   * @remarks
   * The regions returned are based on the guild's geographic location (for automatic server selection).
   * Some regions may be marked as deprecated, which means they may be removed in the future.
   * Custom regions may be available for certain guilds with special privileges.
   * The optimal flag indicates the best region for the guild based on Discord's system.
   */
  fetchGuildVoiceRegions(guildId: Snowflake): Promise<VoiceRegionEntity[]> {
    return this.#rest.get(
      GuildRouter.GUILD_ROUTES.guildRegionsEndpoint(guildId),
    );
  }

  /**
   * Gets a list of invites for the guild
   * Requires the MANAGE_GUILD permission
   *
   * @param guildId - The ID of the guild
   * @returns Array of invite objects with metadata
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-invites}
   *
   * @remarks
   * Requires the MANAGE_GUILD permission.
   * Returns all active invites for the guild, including details about who created them.
   * Each invite includes metadata about usage, expiration, and the target channel.
   */
  fetchGuildInvites(guildId: Snowflake): Promise<InviteWithMetadataEntity[]> {
    return this.#rest.get(
      GuildRouter.GUILD_ROUTES.guildInvitesEndpoint(guildId),
    );
  }

  /**
   * Gets a list of integrations for the guild
   * Requires the MANAGE_GUILD permission
   *
   * @param guildId - The ID of the guild
   * @returns Array of integration objects
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-integrations}
   *
   * @remarks
   * Requires the MANAGE_GUILD permission.
   * Returns all integrations that have been set up for the guild.
   * Common integration types include "twitch", "youtube", "discord", etc.
   * Some information may be limited based on the type of integration.
   */
  fetchGuildIntegrations(guildId: Snowflake): Promise<IntegrationEntity[]> {
    return this.#rest.get(
      GuildRouter.GUILD_ROUTES.guildIntegrationsEndpoint(guildId),
    );
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
   *
   * @remarks
   * Requires the MANAGE_GUILD permission.
   * Fires a Guild Integrations Update Gateway event.
   * Deleting an integration will remove any associated webhooks and disable any functionality dependent on the integration.
   */
  deleteGuildIntegration(
    guildId: Snowflake,
    integrationId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.#rest.delete(
      GuildRouter.GUILD_ROUTES.guildIntegrationEndpoint(guildId, integrationId),
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
   *
   * @remarks
   * Requires the MANAGE_GUILD permission.
   * The widget settings determine whether the guild is publicly visible in the guild embed.
   * If enabled, the widget can display information about online members and the invite channel.
   */
  fetchGuildWidgetSettings(
    guildId: Snowflake,
  ): Promise<GuildWidgetSettingsEntity> {
    return this.#rest.get(
      GuildRouter.GUILD_ROUTES.guildWidgetSettingsEndpoint(guildId),
    );
  }

  /**
   * Modifies the guild's widget settings
   * Requires the MANAGE_GUILD permission
   *
   * @param guildId - The ID of the guild
   * @param options - New widget settings
   * @param reason - Reason for modifying the widget (for audit logs)
   * @returns The updated guild widget settings object
   * @throws {Error} Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-widget}
   *
   * @remarks
   * Requires the MANAGE_GUILD permission.
   * When enabled, the widget provides a web embeddable way to display information about the guild.
   * The channel_id determines which channel new users will be invited to when using the widget.
   * Setting channel_id to null will use the first valid invite channel.
   */
  updateGuildWidget(
    guildId: Snowflake,
    options: GuildWidgetUpdateOptions,
    reason?: string,
  ): Promise<GuildWidgetSettingsEntity> {
    return this.#rest.patch(
      GuildRouter.GUILD_ROUTES.guildWidgetSettingsEndpoint(guildId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Gets the widget for the guild
   *
   * @param guildId - The ID of the guild
   * @returns The guild widget object
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-widget}
   *
   * @remarks
   * Returns a 404 if the widget is disabled.
   * The widget contains information that is publicly available to anyone who can access the guild's widget URL.
   * This includes limited information about online members, channels, and an instant invite.
   * The amount of information depends on the guild's widget settings.
   */
  fetchGuildWidget(guildId: Snowflake): Promise<GuildWidgetEntity> {
    return this.#rest.get(
      GuildRouter.GUILD_ROUTES.guildWidgetEndpoint(guildId),
    );
  }

  /**
   * Gets the vanity URL for the guild
   * Requires the MANAGE_GUILD permission
   *
   * @param guildId - The ID of the guild
   * @returns Partial invite object with code and usage count
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-vanity-url}
   *
   * @remarks
   * Requires the MANAGE_GUILD permission.
   * Returns a 403 if the guild does not have the VANITY_URL feature.
   * Vanity URLs are custom invitation links in the format discord.gg/example.
   * This feature is available to Community servers and servers with the VERIFIED or PARTNERED features.
   */
  fetchGuildVanityUrl(
    guildId: Snowflake,
  ): Promise<Pick<InviteWithMetadataEntity, "code" | "uses">> {
    return this.#rest.get(
      GuildRouter.GUILD_ROUTES.guildVanityUrlEndpoint(guildId),
    );
  }

  /**
   * Gets a PNG image widget for the guild
   *
   * @param guildId - The ID of the guild
   * @param style - Style of the widget image
   * @returns Buffer containing the PNG image data
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-widget-image}
   *
   * @remarks
   * Returns a PNG image of the guild's widget.
   * Available styles:
   * - "shield": A small badge showing the guild's online member count
   * - "banner1": A large banner with the guild's icon, name, and online count
   * - "banner2": A less tall banner with the guild's icon, name, and online count
   * - "banner3": A slightly taller banner with the guild's icon, name, and online count
   * - "banner4": A tall banner with the guild's icon, name, and online count
   *
   * The widget must be enabled for the guild to get this image.
   */
  fetchGuildWidgetImage(
    guildId: Snowflake,
    style: WidgetStyle = "shield",
  ): Promise<Buffer> {
    return this.#rest.get(
      GuildRouter.GUILD_ROUTES.guildWidgetImageEndpoint(guildId),
      {
        query: { style },
      },
    );
  }

  /**
   * Gets the welcome screen for the guild
   * If the welcome screen is not enabled, requires the MANAGE_GUILD permission
   *
   * @param guildId - The ID of the guild
   * @returns The welcome screen object
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-welcome-screen}
   *
   * @remarks
   * If the welcome screen is disabled, requires the MANAGE_GUILD permission.
   * The welcome screen is shown to new members in Community servers.
   * It can contain a description and highlighted channels to help new members navigate the server.
   */
  fetchGuildWelcomeScreen(guildId: Snowflake): Promise<WelcomeScreenEntity> {
    return this.#rest.get(
      GuildRouter.GUILD_ROUTES.guildWelcomeScreenEndpoint(guildId),
    );
  }

  /**
   * Modifies the guild's welcome screen
   * Requires the MANAGE_GUILD permission
   *
   * @param guildId - The ID of the guild
   * @param options - New properties for the welcome screen
   * @param reason - Reason for modifying the welcome screen (for audit logs)
   * @returns The updated welcome screen object
   * @throws {Error} Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-welcome-screen}
   *
   * @remarks
   * Requires the MANAGE_GUILD permission.
   * The welcome screen is shown to new members in Community servers.
   * Can specify up to 5 channels to be featured in the welcome screen.
   * Each channel can have a custom description and emoji.
   */
  updateGuildWelcomeScreen(
    guildId: Snowflake,
    options: GuildWelcomeScreenUpdateOptions,
    reason?: string,
  ): Promise<WelcomeScreenEntity> {
    return this.#rest.patch(
      GuildRouter.GUILD_ROUTES.guildWelcomeScreenEndpoint(guildId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Gets the onboarding configuration for the guild
   *
   * @param guildId - The ID of the guild
   * @returns The guild onboarding object
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-onboarding}
   *
   * @remarks
   * The onboarding configuration defines the new member onboarding flow for Community servers.
   * It can include prompts for selecting interests, rules acknowledgment, and channel opt-ins.
   * This endpoint returns the full configuration, including all prompts and options.
   */
  fetchGuildOnboarding(guildId: Snowflake): Promise<GuildOnboardingEntity> {
    return this.#rest.get(
      GuildRouter.GUILD_ROUTES.guildOnboardingEndpoint(guildId),
    );
  }

  /**
   * Modifies the onboarding configuration of the guild
   * Requires the MANAGE_GUILD and MANAGE_ROLES permissions
   *
   * @param guildId - The ID of the guild
   * @param options - New onboarding configuration
   * @param reason - Reason for modifying the onboarding (for audit logs)
   * @returns The updated guild onboarding object
   * @throws {Error} Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-onboarding}
   *
   * @remarks
   * Requires both the MANAGE_GUILD and MANAGE_ROLES permissions.
   * The onboarding configuration defines how new members experience joining the server.
   * The mode can be DEFAULT (0) or ADVANCED (1).
   * Prompts can be of type MULTIPLE_CHOICE (0) or DROPDOWN (1).
   * Each option can grant access to specific channels and roles.
   * When creating new prompts or options, use placeholder IDs like "0", "1", etc.
   */
  updateGuildOnboarding(
    guildId: Snowflake,
    options: GuildOnboardingUpdateOptions,
    reason?: string,
  ): Promise<GuildOnboardingEntity> {
    return this.#rest.put(
      GuildRouter.GUILD_ROUTES.guildOnboardingEndpoint(guildId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }
}
