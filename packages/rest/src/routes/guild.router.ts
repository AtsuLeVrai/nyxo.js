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
} from "@nyxjs/core";
import type { Rest } from "../core/index.js";
import type { FileInput } from "../handlers/index.js";
import { FileHandler } from "../handlers/index.js";

/**
 * Interface for creating a new guild channel within a guild creation request.
 *
 * @remarks
 * This is a simplified version of the channel entity used when creating a new guild.
 * The structure follows the standard channel entity format.
 *
 * @example
 * ```typescript
 * // Example text channel
 * const textChannel: CreateGuildChannelSchema = {
 *   id: "0", // Placeholder ID, will be assigned by Discord
 *   name: "general",
 *   type: 0, // GUILD_TEXT
 *   position: 0
 * };
 *
 * // Example voice channel
 * const voiceChannel: CreateGuildChannelSchema = {
 *   id: "1", // Placeholder ID, will be assigned by Discord
 *   name: "Voice Chat",
 *   type: 2, // GUILD_VOICE
 *   position: 1,
 *   bitrate: 64000,
 *   user_limit: 10
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-channel-json-params}
 */
export type CreateGuildChannelSchema = AnyChannelEntity;

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
 * @example
 * ```typescript
 * // Create a simple guild with basic settings
 * const simpleGuild: CreateGuildSchema = {
 *   name: "My New Server",
 *   icon: imageFileObject, // A FileInput object with image data
 *   verification_level: 1, // LOW
 *   default_message_notifications: 1 // ONLY_MENTIONS
 * };
 *
 * // Create a guild with custom roles and channels
 * const advancedGuild: CreateGuildSchema = {
 *   name: "Gaming Community",
 *   icon: imageFileObject,
 *   verification_level: 2, // MEDIUM
 *   explicit_content_filter: 2, // ALL_MEMBERS
 *   roles: [
 *     {
 *       id: "0", // Placeholder ID for the @everyone role
 *       name: "@everyone",
 *       permissions: "104324673", // Basic permissions for everyone
 *       position: 0,
 *       color: 0,
 *       hoist: false,
 *       mentionable: false
 *     },
 *     {
 *       id: "1", // Placeholder ID for a custom role
 *       name: "Moderators",
 *       permissions: "1071698660929", // Admin-like permissions
 *       position: 1,
 *       color: 0x00AAFF, // Blue color
 *       hoist: true,
 *       mentionable: true
 *     }
 *   ],
 *   channels: [
 *     {
 *       id: "0", // Placeholder ID
 *       name: "welcome",
 *       type: 0, // GUILD_TEXT
 *       position: 0
 *     },
 *     {
 *       id: "1", // Placeholder ID
 *       name: "general",
 *       type: 0, // GUILD_TEXT
 *       position: 1
 *     },
 *     {
 *       id: "2", // Placeholder ID
 *       name: "Voice Chat",
 *       type: 2, // GUILD_VOICE
 *       position: 2,
 *       bitrate: 64000
 *     }
 *   ],
 *   system_channel_id: "0", // References the "welcome" channel
 *   afk_timeout: 300 // 5 minutes
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-json-params}
 */
export interface CreateGuildSchema {
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
  channels?: CreateGuildChannelSchema[];

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
 * @example
 * ```typescript
 * // Update basic guild settings
 * const basicUpdate: UpdateGuildSchema = {
 *   name: "Updated Server Name",
 *   verification_level: 2, // MEDIUM
 *   default_message_notifications: 1 // ONLY_MENTIONS
 * };
 *
 * // Update guild appearance
 * const appearanceUpdate: UpdateGuildSchema = {
 *   icon: imageFileObject,
 *   banner: bannerFileObject,
 *   splash: splashFileObject,
 *   description: "A welcoming community for everyone"
 * };
 *
 * // Update guild channels
 * const channelUpdate: UpdateGuildSchema = {
 *   afk_channel_id: "123456789012345678",
 *   afk_timeout: 900, // 15 minutes
 *   system_channel_id: "876543210987654321",
 *   system_channel_flags: 6, // Suppress join notifications and boost notifications
 *   rules_channel_id: "111111111111111111",
 *   public_updates_channel_id: "222222222222222222"
 * };
 *
 * // Transfer ownership (must be guild owner)
 * const ownershipTransfer: UpdateGuildSchema = {
 *   owner_id: "333333333333333333" // New owner's user ID
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-json-params}
 */
export interface UpdateGuildSchema {
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
 * @example
 * ```typescript
 * // Simple reordering of channels
 * const channelPositionUpdates: UpdateGuildChannelPositionsItem[] = [
 *   {
 *     id: "111111111111111111", // First channel ID
 *     position: 0 // Move to position 0 (top of the list)
 *   },
 *   {
 *     id: "222222222222222222", // Second channel ID
 *     position: 1 // Move to position 1
 *   }
 * ];
 *
 * // Move a channel to a category and sync permissions
 * const categoryMoveUpdate: UpdateGuildChannelPositionsItem[] = [
 *   {
 *     id: "333333333333333333", // Channel ID to move
 *     parent_id: "444444444444444444", // Category ID to move to
 *     lock_permissions: true // Sync permissions with the category
 *   }
 * ];
 *
 * // Move a channel out of a category
 * const removeCategoryUpdate: UpdateGuildChannelPositionsItem[] = [
 *   {
 *     id: "555555555555555555", // Channel ID to move
 *     parent_id: null // Remove from any category
 *   }
 * ];
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-channel-positions}
 */
export interface UpdateGuildChannelPositionsItem {
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
 * @example
 * ```typescript
 * // Update multiple channel positions at once
 * const channelUpdates: UpdateGuildChannelPositionsSchema = [
 *   {
 *     id: "111111111111111111",
 *     position: 0
 *   },
 *   {
 *     id: "222222222222222222",
 *     position: 1
 *   },
 *   {
 *     id: "333333333333333333",
 *     position: 2,
 *     parent_id: "444444444444444444",
 *     lock_permissions: true
 *   }
 * ];
 * ```
 */
export type UpdateGuildChannelPositionsSchema =
  UpdateGuildChannelPositionsItem[];

/**
 * Interface for the response when listing active guild threads.
 * Contains information about active threads in a guild and the current user's memberships.
 *
 * @remarks
 * This is the response structure from fetchActiveGuildThreads().
 * Active threads are those that have not been archived.
 *
 * @example
 * ```typescript
 * // Example response structure
 * const activeThreadsResponse: ListActiveGuildThreadsEntity = {
 *   threads: [
 *     {
 *       id: "111111111111111111",
 *       name: "Discussion Thread",
 *       type: 11, // PUBLIC_THREAD
 *       parent_id: "222222222222222222",
 *       // Other thread properties...
 *     },
 *     // More thread objects...
 *   ],
 *   members: [
 *     {
 *       id: "111111111111111111", // Thread ID
 *       user_id: "333333333333333333", // Current user's ID
 *       join_timestamp: "2023-01-15T12:00:00.000Z",
 *       flags: 0
 *     },
 *     // More thread member objects for threads the user has joined...
 *   ]
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#list-active-guild-threads-response-body}
 */
export interface ListActiveGuildThreadsEntity {
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
 * @example
 * ```typescript
 * // Get the first 10 members
 * const firstPageQuery: ListGuildMembersQuerySchema = {
 *   limit: 10
 * };
 *
 * // Get the next page after a specific user ID
 * const nextPageQuery: ListGuildMembersQuerySchema = {
 *   limit: 10,
 *   after: "123456789012345678" // User ID from previous page
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#list-guild-members-query-string-params}
 */
export interface ListGuildMembersQuerySchema {
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
 * @example
 * ```typescript
 * // Search for members with names starting with "Alex"
 * const searchQuery: SearchGuildMembersQuerySchema = {
 *   query: "Alex",
 *   limit: 10
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#search-guild-members-query-string-params}
 */
export interface SearchGuildMembersQuerySchema {
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
 * @example
 * ```typescript
 * // Add a user to a guild with default settings
 * const addMemberOptions: AddGuildMemberSchema = {
 *   access_token: "user_oauth2_access_token_with_guilds_join_scope"
 * };
 *
 * // Add a user with specific roles and settings
 * const addMemberWithRoles: AddGuildMemberSchema = {
 *   access_token: "user_oauth2_access_token_with_guilds_join_scope",
 *   nick: "New Member",
 *   roles: ["111111111111111111", "222222222222222222"],
 *   mute: false,
 *   deaf: false
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#add-guild-member-json-params}
 */
export interface AddGuildMemberSchema {
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
 * @example
 * ```typescript
 * // Update a member's nickname and roles
 * const memberUpdate: UpdateGuildMemberSchema = {
 *   nick: "New Nickname",
 *   roles: ["111111111111111111", "222222222222222222"]
 * };
 *
 * // Move a member to a voice channel
 * const moveToVoiceChannel: UpdateGuildMemberSchema = {
 *   channel_id: "333333333333333333" // Voice channel ID
 * };
 *
 * // Timeout a member for 1 hour
 * const timeoutMember: UpdateGuildMemberSchema = {
 *   // ISO8601 timestamp 1 hour in the future
 *   communication_disabled_until: new Date(Date.now() + 3600000).toISOString()
 * };
 *
 * // Remove a timeout
 * const removeTimeout: UpdateGuildMemberSchema = {
 *   communication_disabled_until: null
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-member-json-params}
 */
export interface UpdateGuildMemberSchema {
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
 * @example
 * ```typescript
 * // Get first 100 bans
 * const firstPageQuery: GetGuildBansQuerySchema = {
 *   limit: 100
 * };
 *
 * // Get bans before a specific user ID
 * const previousPageQuery: GetGuildBansQuerySchema = {
 *   limit: 100,
 *   before: "123456789012345678"
 * };
 *
 * // Get bans after a specific user ID
 * const nextPageQuery: GetGuildBansQuerySchema = {
 *   limit: 100,
 *   after: "987654321987654321"
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-bans-query-string-params}
 */
export interface GetGuildBansQuerySchema {
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
 * @example
 * ```typescript
 * // Ban a user without deleting messages
 * const simpleBan: CreateGuildBanSchema = {};
 *
 * // Ban a user and delete 7 days of messages
 * const banWithMessageDeletion: CreateGuildBanSchema = {
 *   delete_message_seconds: 7 * 24 * 60 * 60 // 7 days in seconds
 * };
 *
 * // Ban a user and delete 1 day of messages (using deprecated parameter)
 * const deprecatedBan: CreateGuildBanSchema = {
 *   delete_message_days: 1
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-ban-json-params}
 */
export interface CreateGuildBanSchema {
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
 * @example
 * ```typescript
 * // Ban multiple users without deleting messages
 * const bulkBan: BulkGuildBanSchema = {
 *   user_ids: [
 *     "111111111111111111",
 *     "222222222222222222",
 *     "333333333333333333"
 *   ],
 *   delete_message_seconds: 0
 * };
 *
 * // Ban multiple users and delete 1 day of messages
 * const bulkBanWithMessageDeletion: BulkGuildBanSchema = {
 *   user_ids: [
 *     "444444444444444444",
 *     "555555555555555555"
 *   ],
 *   delete_message_seconds: 86400 // 1 day in seconds
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#bulk-guild-ban-json-params}
 */
export interface BulkGuildBanSchema {
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
 * @example
 * ```typescript
 * // Example response structure
 * const bulkBanResponse: BulkGuildBanResponseEntity = {
 *   banned_users: ["111111111111111111", "222222222222222222"],
 *   failed_users: ["333333333333333333"]
 * };
 *
 * console.log(`Successfully banned ${bulkBanResponse.banned_users.length} users`);
 * console.log(`Failed to ban ${bulkBanResponse.failed_users.length} users`);
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#bulk-guild-ban-bulk-ban-response}
 */
export interface BulkGuildBanResponseEntity {
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
 * @example
 * ```typescript
 * // Create a basic role
 * const basicRole: CreateGuildRoleSchema = {
 *   name: "Member",
 *   permissions: "104324673", // Basic permissions
 *   color: 0x00FF00, // Green color
 *   hoist: false,
 *   mentionable: true
 * };
 *
 * // Create a moderator role with an emoji
 * const moderatorRole: CreateGuildRoleSchema = {
 *   name: "Moderator",
 *   permissions: "1099511627775", // All permissions
 *   color: 0xFF0000, // Red color
 *   hoist: true, // Displayed separately in member list
 *   unicode_emoji: "🛡️", // Shield emoji
 *   mentionable: true
 * };
 *
 * // Create a role with a custom icon
 * const iconRole: CreateGuildRoleSchema = {
 *   name: "VIP",
 *   permissions: "104324673",
 *   color: 0xFFD700, // Gold color
 *   hoist: true,
 *   icon: imageFileObject, // A FileInput object with the icon image
 *   mentionable: true
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-role-json-params}
 */
export interface CreateGuildRoleSchema {
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
 * @example
 * ```typescript
 * // Move a role to the top of the list
 * const moveToTop: UpdateGuildRolePositionsItem = {
 *   id: "111111111111111111", // Role ID
 *   position: 1 // Position 1 is just below the @everyone role
 * };
 *
 * // Move multiple roles
 * const rolePositionUpdates: UpdateGuildRolePositionsItem[] = [
 *   {
 *     id: "222222222222222222",
 *     position: 3
 *   },
 *   {
 *     id: "333333333333333333",
 *     position: 2
 *   }
 * ];
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role-positions-json-params}
 */
export interface UpdateGuildRolePositionsItem {
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
 * @example
 * ```typescript
 * // Update multiple role positions at once
 * const roleUpdates: UpdateGuildRolePositionsSchema = [
 *   {
 *     id: "111111111111111111",
 *     position: 3
 *   },
 *   {
 *     id: "222222222222222222",
 *     position: 2
 *   },
 *   {
 *     id: "333333333333333333",
 *     position: 1
 *   }
 * ];
 * ```
 */
export type UpdateGuildRolePositionsSchema = UpdateGuildRolePositionsItem[];

/**
 * Interface for updating a guild role.
 * Used to modify an existing role's properties.
 *
 * @remarks
 * Requires the MANAGE_ROLES permission.
 * All properties are optional, allowing partial updates.
 * Can be null to reset all properties to default values.
 *
 * @example
 * ```typescript
 * // Update a role's name and color
 * const nameColorUpdate: UpdateGuildRoleSchema = {
 *   name: "Super Moderator",
 *   color: 0x9B59B6 // Purple color
 * };
 *
 * // Update a role's permissions
 * const permissionUpdate: UpdateGuildRoleSchema = {
 *   permissions: "1071698660929" // Custom permission set
 * };
 *
 * // Update a role's display properties
 * const displayUpdate: UpdateGuildRoleSchema = {
 *   hoist: true,
 *   mentionable: true,
 *   unicode_emoji: "🔰" // Beginner symbol emoji
 * };
 *
 * // Reset a role to default values
 * const resetRole: UpdateGuildRoleSchema = null;
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role-json-params}
 */
export type UpdateGuildRoleSchema = Partial<CreateGuildRoleSchema> | null;

/**
 * Interface for query parameters when getting guild prune count.
 * Used to estimate how many members would be removed by a prune operation.
 *
 * @remarks
 * Requires the MANAGE_GUILD permission.
 * This is a preview endpoint that doesn't actually remove any members.
 *
 * @example
 * ```typescript
 * // Get count of inactive members for the default period (7 days)
 * const defaultPruneQuery: GetGuildPruneCountQuerySchema = {};
 *
 * // Get count of members inactive for 30 days
 * const longerPruneQuery: GetGuildPruneCountQuerySchema = {
 *   days: 30
 * };
 *
 * // Get count of members with specific roles
 * const roleSpecificQuery: GetGuildPruneCountQuerySchema = {
 *   days: 14,
 *   include_roles: "111111111111111111,222222222222222222"
 * };
 * ```
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
 * @example
 * ```typescript
 * // Prune members inactive for 7 days
 * const defaultPrune: BeginGuildPruneSchema = {
 *   days: 7,
 *   compute_prune_count: true,
 *   include_roles: []
 * };
 *
 * // Prune members inactive for 30 days without counting
 * const fastPrune: BeginGuildPruneSchema = {
 *   days: 30,
 *   compute_prune_count: false, // Don't compute count (faster for large guilds)
 *   include_roles: []
 * };
 *
 * // Prune members with specific roles
 * const rolePrune: BeginGuildPruneSchema = {
 *   days: 14,
 *   compute_prune_count: true,
 *   include_roles: ["111111111111111111", "222222222222222222"]
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#begin-guild-prune-json-params}
 */
export interface BeginGuildPruneSchema {
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
 * @example
 * ```typescript
 * // Get a shield-style widget image
 * const shieldWidget = await guildRouter.fetchGuildWidgetImage(
 *   "123456789012345678",
 *   "shield"
 * );
 *
 * // Get a banner-style widget image
 * const bannerWidget = await guildRouter.fetchGuildWidgetImage(
 *   "123456789012345678",
 *   "banner1"
 * );
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-widget-image-widget-style-options}
 */
export type WidgetStyleOptions =
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
 * @example
 * ```typescript
 * // Enable the widget with a specific channel
 * const enableWidget: UpdateGuildWidgetSettingsSchema = {
 *   enabled: true,
 *   channel_id: "123456789012345678" // Channel ID for invites
 * };
 *
 * // Enable the widget without a specific channel
 * const enableWidgetNoChannel: UpdateGuildWidgetSettingsSchema = {
 *   enabled: true,
 *   channel_id: null
 * };
 *
 * // Disable the widget
 * const disableWidget: UpdateGuildWidgetSettingsSchema = {
 *   enabled: false,
 *   channel_id: null
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-widget-json-params}
 */
export interface UpdateGuildWidgetSettingsSchema {
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
 * @example
 * ```typescript
 * // Enable welcome screen with description and channels
 * const welcomeScreen: UpdateGuildWelcomeScreenSchema = {
 *   enabled: true,
 *   description: "Welcome to our community! Check out these channels to get started:",
 *   welcome_channels: [
 *     {
 *       channel_id: "111111111111111111",
 *       description: "Read our rules and guidelines",
 *       emoji_id: null,
 *       emoji_name: "📜"
 *     },
 *     {
 *       channel_id: "222222222222222222",
 *       description: "Introduce yourself to the community",
 *       emoji_id: null,
 *       emoji_name: "👋"
 *     }
 *   ]
 * };
 *
 * // Disable welcome screen
 * const disableWelcome: UpdateGuildWelcomeScreenSchema = {
 *   enabled: false
 * };
 *
 * // Update just the description
 * const updateDescription: UpdateGuildWelcomeScreenSchema = {
 *   description: "Welcome to our new and improved community!"
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-welcome-screen-json-params}
 */
export interface UpdateGuildWelcomeScreenSchema {
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
 * @example
 * ```typescript
 * // Configure onboarding with prompts
 * const onboardingConfig: UpdateGuildOnboardingSchema = {
 *   enabled: true,
 *   mode: 1, // ADVANCED mode
 *   prompts: [
 *     {
 *       id: "0", // Placeholder ID for new prompt
 *       type: 0, // MULTIPLE_CHOICE
 *       title: "What brings you to our server?",
 *       options: [
 *         {
 *           id: "0", // Placeholder ID for new option
 *           title: "Just browsing",
 *           channel_ids: ["111111111111111111"],
 *           role_ids: []
 *         },
 *         {
 *           id: "1", // Placeholder ID for new option
 *           title: "Looking to participate",
 *           channel_ids: ["111111111111111111", "222222222222222222"],
 *           role_ids: ["333333333333333333"]
 *         }
 *       ]
 *     }
 *   ],
 *   default_channel_ids: ["111111111111111111"]
 * };
 *
 * // Disable onboarding
 * const disableOnboarding: UpdateGuildOnboardingSchema = {
 *   enabled: false,
 *   mode: 0, // DEFAULT mode
 *   prompts: [],
 *   default_channel_ids: []
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-onboarding}
 */
export interface UpdateGuildOnboardingSchema {
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
   * @example
   * ```typescript
   * import { Rest } from "../core/index.js";
   *
   * // Create a REST client
   * const rest = new Rest({ token: "your-bot-token" });
   *
   * // Initialize the guild router
   * const guildRouter = new GuildRouter(rest);
   *
   * // Now you can use the router to interact with guild endpoints
   * const guild = await guildRouter.fetchGuild("123456789012345678");
   * ```
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
   *
   * @example
   * ```typescript
   * // Create a simple guild with default settings
   * try {
   *   const newGuild = await guildRouter.createGuild({
   *     name: "My Awesome Server",
   *   });
   *
   *   console.log(`Created guild with ID: ${newGuild.id}`);
   * } catch (error) {
   *   console.error("Failed to create guild:", error);
   * }
   *
   * // Create a guild with custom settings
   * try {
   *   // First, prepare an icon (could be from a local file)
   *   const iconFile = await FileHandler.fromLocalFile("./path/to/icon.png");
   *
   *   const newGuild = await guildRouter.createGuild({
   *     name: "Gaming Community",
   *     icon: iconFile,
   *     verification_level: 1, // LOW
   *     default_message_notifications: 1, // ONLY_MENTIONS
   *     explicit_content_filter: 2, // ALL_MEMBERS
   *     roles: [
   *       {
   *         id: "0",
   *         name: "Admin",
   *         permissions: "8", // Administrator
   *         color: 0xFF0000, // Red
   *         hoist: true,
   *         mentionable: true
   *       }
   *     ],
   *     channels: [
   *       {
   *         id: "0",
   *         name: "welcome",
   *         type: 0 // GUILD_TEXT
   *       },
   *       {
   *         id: "1",
   *         name: "General",
   *         type: 2 // GUILD_VOICE
   *       }
   *     ]
   *   });
   *
   *   console.log(`Created custom guild with ID: ${newGuild.id}`);
   * } catch (error) {
   *   console.error("Failed to create custom guild:", error);
   * }
   * ```
   *
   * @remarks
   * This endpoint can be used only by bots in fewer than 10 guilds.
   * There are rate limits on guild creation.
   */
  async createGuild(options: CreateGuildSchema): Promise<GuildEntity> {
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
   * @example
   * ```typescript
   * // Fetch a guild without member counts
   * try {
   *   const guild = await guildRouter.fetchGuild("123456789012345678");
   *
   *   console.log(`Guild name: ${guild.name}`);
   *   console.log(`Guild owner: ${guild.owner_id}`);
   *   console.log(`Region: ${guild.region}`);
   * } catch (error) {
   *   console.error("Failed to fetch guild:", error);
   * }
   *
   * // Fetch a guild with approximate member counts
   * try {
   *   const guild = await guildRouter.fetchGuild("123456789012345678", true);
   *
   *   console.log(`Guild name: ${guild.name}`);
   *   console.log(`Total members: ${guild.approximate_member_count}`);
   *   console.log(`Online members: ${guild.approximate_presence_count}`);
   *   console.log(`Verification level: ${
   *     guild.verification_level === 0 ? "None" :
   *     guild.verification_level === 1 ? "Low" :
   *     guild.verification_level === 2 ? "Medium" :
   *     guild.verification_level === 3 ? "High" :
   *     "Very High"
   *   }`);
   * } catch (error) {
   *   console.error("Failed to fetch guild with counts:", error);
   * }
   * ```
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
   * @example
   * ```typescript
   * // Fetch a preview of a discoverable guild
   * try {
   *   const preview = await guildRouter.fetchPreview("123456789012345678");
   *
   *   console.log(`Guild name: ${preview.name}`);
   *   console.log(`Description: ${preview.description}`);
   *   console.log(`Emojis: ${preview.emojis.length}`);
   *   console.log(`Features: ${preview.features.join(", ")}`);
   *   console.log(`Approximate member count: ${preview.approximate_member_count}`);
   *   console.log(`Approximate online members: ${preview.approximate_presence_count}`);
   * } catch (error) {
   *   console.error("Failed to fetch guild preview:", error);
   * }
   * ```
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
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild}
   *
   * @example
   * ```typescript
   * // Update basic guild settings
   * try {
   *   const updatedGuild = await guildRouter.updateGuild(
   *     "123456789012345678",
   *     {
   *       name: "Updated Server Name",
   *       verification_level: 2, // MEDIUM
   *       default_message_notifications: 1, // ONLY_MENTIONS
   *     },
   *     "Updating server settings for improved security"
   *   );
   *
   *   console.log(`Guild updated: ${updatedGuild.name}`);
   * } catch (error) {
   *   console.error("Failed to update guild:", error);
   * }
   *
   * // Update guild icon
   * try {
   *   // Prepare a new icon
   *   const newIcon = await FileHandler.fromLocalFile("./path/to/new_icon.png");
   *
   *   const updatedGuild = await guildRouter.updateGuild(
   *     "123456789012345678",
   *     {
   *       icon: newIcon,
   *       description: "An awesome community for gaming enthusiasts!",
   *       premium_progress_bar_enabled: true
   *     },
   *     "Refreshing server branding"
   *   );
   *
   *   console.log(`Guild updated with new icon and description`);
   * } catch (error) {
   *   console.error("Failed to update guild icon:", error);
   * }
   * ```
   *
   * @remarks
   * Requires the MANAGE_GUILD permission.
   * To update the guild icon, banner, or splash, you need the respective feature to be enabled in your guild.
   * When transferring guild ownership (using owner_id), you must have 2FA enabled if the server has it enabled.
   * Fires a Guild Update Gateway event.
   */
  async updateGuild(
    guildId: Snowflake,
    options: UpdateGuildSchema,
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
   * @example
   * ```typescript
   * // Delete a guild
   * try {
   *   await guildRouter.deleteGuild("123456789012345678");
   *   console.log("Guild has been deleted successfully");
   * } catch (error) {
   *   console.error("Failed to delete guild:", error);
   *
   *   if (error.status === 403) {
   *     console.error("The bot is not the owner of this guild");
   *   }
   * }
   * ```
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
   * @example
   * ```typescript
   * // Fetch all channels in a guild
   * try {
   *   const channels = await guildRouter.fetchChannels("123456789012345678");
   *
   *   console.log(`Guild has ${channels.length} channels`);
   *
   *   // Group channels by type
   *   const textChannels = channels.filter(c => c.type === 0);
   *   const voiceChannels = channels.filter(c => c.type === 2);
   *   const categories = channels.filter(c => c.type === 4);
   *   const announcements = channels.filter(c => c.type === 5);
   *   const forums = channels.filter(c => c.type === 15);
   *
   *   console.log(`Text channels: ${textChannels.length}`);
   *   console.log(`Voice channels: ${voiceChannels.length}`);
   *   console.log(`Categories: ${categories.length}`);
   *   console.log(`Announcement channels: ${announcements.length}`);
   *   console.log(`Forum channels: ${forums.length}`);
   *
   *   // Display text channels
   *   console.log("Text Channels:");
   *   textChannels.forEach(channel => {
   *     console.log(`- #${channel.name} (ID: ${channel.id})`);
   *   });
   * } catch (error) {
   *   console.error("Failed to fetch guild channels:", error);
   * }
   * ```
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
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-channel}
   *
   * @example
   * ```typescript
   * // Create a basic text channel
   * try {
   *   const newChannel = await guildRouter.createGuildChannel(
   *     "123456789012345678",
   *     {
   *       name: "general-chat",
   *       type: 0, // GUILD_TEXT
   *     },
   *     "Creating main discussion channel"
   *   );
   *
   *   console.log(`Created channel #${newChannel.name} with ID: ${newChannel.id}`);
   * } catch (error) {
   *   console.error("Failed to create channel:", error);
   * }
   *
   * // Create a voice channel with options
   * try {
   *   const newChannel = await guildRouter.createGuildChannel(
   *     "123456789012345678",
   *     {
   *       name: "Gaming Voice",
   *       type: 2, // GUILD_VOICE
   *       bitrate: 64000, // 64kbps
   *       user_limit: 10, // Max 10 users
   *       parent_id: "987654321987654321", // Category ID
   *       permission_overwrites: [
   *         {
   *           id: "123456789012345678", // Role or user ID
   *           type: 0, // 0 for role, 1 for member
   *           allow: "66560", // Connect and Speak permissions
   *           deny: "0"
   *         }
   *       ]
   *     },
   *     "Creating gaming voice channel"
   *   );
   *
   *   console.log(`Created voice channel ${newChannel.name} with ID: ${newChannel.id}`);
   * } catch (error) {
   *   console.error("Failed to create voice channel:", error);
   * }
   * ```
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
    options: CreateGuildChannelSchema,
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
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-channel-positions}
   *
   * @example
   * ```typescript
   * // Reorder channels in a guild
   * try {
   *   await guildRouter.updateGuildChannelPositions(
   *     "123456789012345678",
   *     [
   *       {
   *         id: "111111111111111111", // Channel to move
   *         position: 1 // New position (0-based index)
   *       },
   *       {
   *         id: "222222222222222222", // Another channel to move
   *         position: 2
   *       }
   *     ]
   *   );
   *
   *   console.log("Channel positions updated successfully");
   * } catch (error) {
   *   console.error("Failed to update channel positions:", error);
   * }
   *
   * // Move a channel to a different category
   * try {
   *   await guildRouter.updateGuildChannelPositions(
   *     "123456789012345678",
   *     [
   *       {
   *         id: "111111111111111111", // Channel to move
   *         parent_id: "333333333333333333", // Target category ID
   *         lock_permissions: true // Sync permissions with the new parent
   *       }
   *     ]
   *   );
   *
   *   console.log("Channel moved to new category successfully");
   * } catch (error) {
   *   console.error("Failed to move channel to category:", error);
   * }
   * ```
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
    options: UpdateGuildChannelPositionsSchema,
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
   * @example
   * ```typescript
   * // Fetch all active threads in a guild
   * try {
   *   const response = await guildRouter.fetchActiveGuildThreads("123456789012345678");
   *
   *   console.log(`Guild has ${response.threads.length} active threads`);
   *
   *   // Group threads by type
   *   const publicThreads = response.threads.filter(t => t.type === 11); // PUBLIC_THREAD
   *   const privateThreads = response.threads.filter(t => t.type === 12); // PRIVATE_THREAD
   *   const announcementThreads = response.threads.filter(t => t.type === 10); // ANNOUNCEMENT_THREAD
   *
   *   console.log(`Public threads: ${publicThreads.length}`);
   *   console.log(`Private threads: ${privateThreads.length}`);
   *   console.log(`Announcement threads: ${announcementThreads.length}`);
   *
   *   // List the threads the current user has joined
   *   console.log(`The bot has joined ${response.members.length} threads`);
   *
   *   // Display information about threads
   *   response.threads.forEach(thread => {
   *     const lastActivity = new Date(thread.last_message_id).toLocaleString();
   *     console.log(`- #${thread.name} (${thread.message_count} messages, last activity: ${lastActivity})`);
   *   });
   * } catch (error) {
   *   console.error("Failed to fetch active guild threads:", error);
   * }
   * ```
   *
   * @remarks
   * Returns all active threads in the guild that the current user can access, including public and private threads.
   * The response includes thread members for threads that the current user has joined.
   * A thread is active if it hasn't been archived.
   */
  fetchActiveGuildThreads(
    guildId: Snowflake,
  ): Promise<ListActiveGuildThreadsEntity[]> {
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
   * @example
   * ```typescript
   * // Fetch a member from a guild
   * try {
   *   const member = await guildRouter.fetchGuildMember(
   *     "123456789012345678", // Guild ID
   *     "987654321987654321"  // User ID
   *   );
   *
   *   console.log(`Member: ${member.user.username}`);
   *   console.log(`Joined at: ${new Date(member.joined_at).toLocaleString()}`);
   *   console.log(`Nickname: ${member.nick || "None"}`);
   *
   *   // Check roles
   *   console.log(`Has ${member.roles.length} roles`);
   *
   *   // Check if the member is pending (membership screening)
   *   if (member.pending) {
   *     console.log("User has not completed membership screening yet");
   *   }
   *
   *   // Check timeout status
   *   if (member.communication_disabled_until) {
   *     const timeoutEnd = new Date(member.communication_disabled_until);
   *     console.log(`User is timed out until: ${timeoutEnd.toLocaleString()}`);
   *   }
   * } catch (error) {
   *   console.error("Failed to fetch guild member:", error);
   *
   *   if (error.status === 404) {
   *     console.log("User is not a member of this guild");
   *   }
   * }
   * ```
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
   * @throws Error if validation of query parameters fails
   * @see {@link https://discord.com/developers/docs/resources/guild#list-guild-members}
   *
   * @example
   * ```typescript
   * // Fetch first 10 members from a guild
   * try {
   *   const members = await guildRouter.fetchGuildMembers(
   *     "123456789012345678",
   *     { limit: 10 }
   *   );
   *
   *   console.log(`Fetched ${members.length} members`);
   *
   *   members.forEach(member => {
   *     console.log(`- ${member.user.username}${member.nick ? ` (${member.nick})` : ""}`);
   *   });
   * } catch (error) {
   *   console.error("Failed to fetch guild members:", error);
   * }
   *
   * // Paginate through members
   * try {
   *   // Get first batch
   *   const firstBatch = await guildRouter.fetchGuildMembers(
   *     "123456789012345678",
   *     { limit: 100 }
   *   );
   *
   *   console.log(`Fetched first ${firstBatch.length} members`);
   *
   *   // Get next batch if there are more
   *   if (firstBatch.length === 100) {
   *     const lastUserId = firstBatch[firstBatch.length - 1].user.id;
   *
   *     // Fetch next batch starting after the last user from previous batch
   *     const nextBatch = await guildRouter.fetchGuildMembers(
   *       "123456789012345678",
   *       { limit: 100, after: lastUserId }
   *     );
   *
   *     console.log(`Fetched next ${nextBatch.length} members`);
   *   }
   * } catch (error) {
   *   console.error("Failed to paginate guild members:", error);
   * }
   * ```
   *
   * @remarks
   * Requires the GUILD_MEMBERS privileged intent to be enabled in your bot settings.
   * Returns paginated results, sorted by user ID in ascending order.
   * You can use the `after` parameter with the last user ID from the previous request to paginate.
   * The maximum `limit` is 1000 members per request.
   */
  fetchGuildMembers(
    guildId: Snowflake,
    query: ListGuildMembersQuerySchema = {},
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
   * @throws Error if validation of query parameters fails
   * @see {@link https://discord.com/developers/docs/resources/guild#search-guild-members}
   *
   * @example
   * ```typescript
   * // Search for members by query
   * try {
   *   const members = await guildRouter.searchGuildMembers(
   *     "123456789012345678",
   *     {
   *       query: "alex", // Will match names starting with "alex"
   *       limit: 10
   *     }
   *   );
   *
   *   console.log(`Found ${members.length} members matching "alex"`);
   *
   *   members.forEach(member => {
   *     console.log(`- ${member.user.username}#${member.user.discriminator}`);
   *     if (member.nick) {
   *       console.log(`  Nickname: ${member.nick}`);
   *     }
   *   });
   * } catch (error) {
   *   console.error("Failed to search guild members:", error);
   * }
   * ```
   *
   * @remarks
   * The search is prefix-based, matching usernames and nicknames that start with the query string.
   * The search is case-insensitive.
   * Unlike fetchGuildMembers, this method doesn't require the GUILD_MEMBERS privileged intent.
   */
  searchGuildMembers(
    guildId: Snowflake,
    query: SearchGuildMembersQuerySchema,
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
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#add-guild-member}
   *
   * @example
   * ```typescript
   * // Add a user to a guild using OAuth2 access token
   * try {
   *   const member = await guildRouter.addGuildMember(
   *     "123456789012345678", // Guild ID
   *     "987654321987654321", // User ID
   *     {
   *       access_token: "user_oauth2_access_token_with_guilds_join_scope",
   *       nick: "New Member",
   *       roles: ["111111111111111111", "222222222222222222"],
   *       mute: false,
   *       deaf: false
   *     }
   *   );
   *
   *   if (member) {
   *     console.log(`User ${member.user.username} added to the guild successfully`);
   *   } else {
   *     console.log("User was already a member of the guild");
   *   }
   * } catch (error) {
   *   console.error("Failed to add guild member:", error);
   *
   *   if (error.status === 403) {
   *     console.error("Missing permissions or invalid access token");
   *   }
   * }
   * ```
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
    options: AddGuildMemberSchema,
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
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-member}
   *
   * @example
   * ```typescript
   * // Update a member's nickname and roles
   * try {
   *   const updatedMember = await guildRouter.updateGuildMember(
   *     "123456789012345678", // Guild ID
   *     "987654321987654321", // User ID
   *     {
   *       nick: "New Nickname",
   *       roles: ["111111111111111111", "222222222222222222"],
   *     },
   *     "Updating member status"
   *   );
   *
   *   console.log(`Updated ${updatedMember.user.username}'s guild settings`);
   *   console.log(`New nickname: ${updatedMember.nick}`);
   *   console.log(`Roles: ${updatedMember.roles.join(", ")}`);
   * } catch (error) {
   *   console.error("Failed to update guild member:", error);
   * }
   *
   * // Apply a timeout to a member
   * try {
   *   // Create a date 1 hour in the future
   *   const timeoutUntil = new Date();
   *   timeoutUntil.setHours(timeoutUntil.getHours() + 1);
   *
   *   const updatedMember = await guildRouter.updateGuildMember(
   *     "123456789012345678", // Guild ID
   *     "987654321987654321", // User ID
   *     {
   *       communication_disabled_until: timeoutUntil.toISOString(),
   *     },
   *     "Timeout for rule violation"
   *   );
   *
   *   console.log(`Applied timeout to ${updatedMember.user.username} until ${timeoutUntil.toLocaleString()}`);
   * } catch (error) {
   *   console.error("Failed to timeout guild member:", error);
   * }
   * ```
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
    options: UpdateGuildMemberSchema,
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
   * @example
   * ```typescript
   * // Update the bot's nickname
   * try {
   *   const updatedMember = await guildRouter.updateCurrentMember(
   *     "123456789012345678",
   *     "Awesome Bot",
   *     "Setting a more appropriate nickname"
   *   );
   *
   *   console.log(`Bot nickname updated to: ${updatedMember.nick}`);
   * } catch (error) {
   *   console.error("Failed to update bot nickname:", error);
   * }
   *
   * // Remove the bot's nickname
   * try {
   *   const updatedMember = await guildRouter.updateCurrentMember(
   *     "123456789012345678",
   *     null,
   *     "Removing nickname to use default name"
   *   );
   *
   *   console.log("Bot nickname removed");
   * } catch (error) {
   *   console.error("Failed to remove bot nickname:", error);
   * }
   * ```
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
   * @example
   * ```typescript
   * // Update the bot's nickname (deprecated method)
   * try {
   *   const updatedMember = await guildRouter.updateCurrentUserNick(
   *     "123456789012345678",
   *     "Helper Bot",
   *     "Changing nickname for clarity"
   *   );
   *
   *   console.log(`Bot nickname updated to: ${updatedMember.nick}`);
   *
   *   // Better to use the non-deprecated method
   *   console.log("Note: This method is deprecated. Consider using updateCurrentMember instead");
   * } catch (error) {
   *   console.error("Failed to update bot nickname:", error);
   * }
   * ```
   *
   * @remarks
   * This method is deprecated. Use updateCurrentMember instead.
   * Requires the CHANGE_NICKNAME permission.
   * Fires a Guild Member Update Gateway event.
   */
  updateCurrentUserNick(
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
   * @example
   * ```typescript
   * // Add a role to a guild member
   * try {
   *   await guildRouter.addGuildMemberRole(
   *     "123456789012345678", // Guild ID
   *     "987654321987654321", // User ID
   *     "111111111111111111", // Role ID
   *     "Granting Moderator role for helping with server events"
   *   );
   *
   *   console.log("Role added successfully");
   * } catch (error) {
   *   console.error("Failed to add role to member:", error);
   *
   *   if (error.status === 403) {
   *     console.error("Missing permissions or role hierarchy prevents this action");
   *   }
   * }
   * ```
   *
   * @remarks
   * Requires the MANAGE_ROLES permission.
   * The bot's highest role must be higher than the role being assigned.
   * Fires a Guild Member Update Gateway event.
   */
  addGuildMemberRole(
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
   * @example
   * ```typescript
   * // Remove a role from a guild member
   * try {
   *   await guildRouter.removeGuildMemberRole(
   *     "123456789012345678", // Guild ID
   *     "987654321987654321", // User ID
   *     "111111111111111111", // Role ID
   *     "Removing temporary event role after event conclusion"
   *   );
   *
   *   console.log("Role removed successfully");
   * } catch (error) {
   *   console.error("Failed to remove role from member:", error);
   *
   *   if (error.status === 404) {
   *     console.error("Member does not have this role");
   *   }
   * }
   * ```
   *
   * @remarks
   * Requires the MANAGE_ROLES permission.
   * The bot's highest role must be higher than the role being removed.
   * Fires a Guild Member Update Gateway event.
   */
  removeGuildMemberRole(
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
   * @example
   * ```typescript
   * // Kick a member from a guild
   * try {
   *   await guildRouter.removeGuildMember(
   *     "123456789012345678", // Guild ID
   *     "987654321987654321", // User ID
   *     "Violated server rules after multiple warnings"
   *   );
   *
   *   console.log("Member kicked successfully");
   * } catch (error) {
   *   console.error("Failed to kick member:", error);
   *
   *   if (error.status === 403) {
   *     console.error("Missing permissions or member has higher role hierarchy");
   *   }
   * }
   * ```
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
   * @throws Error if validation of query parameters fails
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-bans}
   *
   * @example
   * ```typescript
   * // Fetch bans with default settings (up to 1000 bans)
   * try {
   *   const bans = await guildRouter.fetchGuildBans("123456789012345678");
   *
   *   console.log(`Guild has ${bans.length} banned users`);
   *
   *   bans.forEach(ban => {
   *     console.log(`- ${ban.user.username} (ID: ${ban.user.id})`);
   *     console.log(`  Reason: ${ban.reason || "No reason provided"}`);
   *   });
   * } catch (error) {
   *   console.error("Failed to fetch guild bans:", error);
   * }
   *
   * // Fetch a smaller batch of bans with pagination
   * try {
   *   const firstBatch = await guildRouter.fetchGuildBans(
   *     "123456789012345678",
   *     { limit: 50 }
   *   );
   *
   *   console.log(`Fetched first ${firstBatch.length} bans`);
   *
   *   // If there are more bans, fetch the next batch
   *   if (firstBatch.length === 50) {
   *     const lastBanId = firstBatch[firstBatch.length - 1].user.id;
   *
   *     // Get bans after the last ban from previous batch
   *     const nextBatch = await guildRouter.fetchGuildBans(
   *       "123456789012345678",
   *       { limit: 50, after: lastBanId }
   *     );
   *
   *     console.log(`Fetched next ${nextBatch.length} bans`);
   *   }
   * } catch (error) {
   *   console.error("Failed to paginate guild bans:", error);
   * }
   * ```
   *
   * @remarks
   * Requires the BAN_MEMBERS permission.
   * Returns paginated results in ascending order by user ID.
   * Use the `before` and `after` parameters for pagination.
   * The maximum `limit` is 1000 bans per request.
   */
  fetchGuildBans(
    guildId: Snowflake,
    query: GetGuildBansQuerySchema = {},
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
   * @example
   * ```typescript
   * // Check if a user is banned
   * try {
   *   const ban = await guildRouter.fetchGuildBan(
   *     "123456789012345678", // Guild ID
   *     "987654321987654321"  // User ID
   *   );
   *
   *   console.log(`User ${ban.user.username} is banned`);
   *   console.log(`Ban reason: ${ban.reason || "No reason provided"}`);
   * } catch (error) {
   *   if (error.status === 404) {
   *     console.log("User is not banned from this guild");
   *   } else {
   *     console.error("Failed to fetch ban information:", error);
   *   }
   * }
   * ```
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
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-ban}
   *
   * @example
   * ```typescript
   * // Ban a user without deleting messages
   * try {
   *   await guildRouter.createGuildBan(
   *     "123456789012345678", // Guild ID
   *     "987654321987654321", // User ID
   *     {},
   *     "Repeated violations of server rules"
   *   );
   *
   *   console.log("User banned successfully");
   * } catch (error) {
   *   console.error("Failed to ban user:", error);
   * }
   *
   * // Ban a user and delete 7 days of messages
   * try {
   *   await guildRouter.createGuildBan(
   *     "123456789012345678", // Guild ID
   *     "987654321987654321", // User ID
   *     {
   *       delete_message_seconds: 7 * 24 * 60 * 60 // 7 days in seconds
   *     },
   *     "Spamming in multiple channels"
   *   );
   *
   *   console.log("User banned and messages deleted");
   * } catch (error) {
   *   console.error("Failed to ban user:", error);
   * }
   * ```
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
    options: CreateGuildBanSchema,
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
   * @example
   * ```typescript
   * // Unban a user
   * try {
   *   await guildRouter.removeGuildBan(
   *     "123456789012345678", // Guild ID
   *     "987654321987654321", // User ID
   *     "Ban appeal approved after review"
   *   );
   *
   *   console.log("User unbanned successfully");
   * } catch (error) {
   *   console.error("Failed to unban user:", error);
   *
   *   if (error.status === 404) {
   *     console.log("User is not banned from this guild");
   *   }
   * }
   * ```
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
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#bulk-guild-ban}
   *
   * @example
   * ```typescript
   * // Ban multiple users at once
   * try {
   *   const result = await guildRouter.bulkGuildBan(
   *     "123456789012345678", // Guild ID
   *     {
   *       user_ids: [
   *         "111111111111111111",
   *         "222222222222222222",
   *         "333333333333333333"
   *       ],
   *       delete_message_seconds: 24 * 60 * 60 // Delete 1 day of messages
   *     },
   *     "Participating in raid attempt"
   *   );
   *
   *   console.log(`Successfully banned ${result.banned_users.length} users`);
   *
   *   if (result.failed_users.length > 0) {
   *     console.log(`Failed to ban ${result.failed_users.length} users`);
   *     console.log("Failed IDs:", result.failed_users.join(", "));
   *   }
   * } catch (error) {
   *   console.error("Failed to perform bulk ban:", error);
   * }
   * ```
   *
   * @remarks
   * Requires both the BAN_MEMBERS and MANAGE_GUILD permissions.
   * Can ban up to 200 users in a single request.
   * The `failed_users` array contains IDs that couldn't be banned (e.g., due to role hierarchy).
   * Fires multiple Guild Ban Add Gateway events.
   */
  bulkGuildBan(
    guildId: Snowflake,
    options: BulkGuildBanSchema,
    reason?: string,
  ): Promise<BulkGuildBanResponseEntity> {
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
   * @example
   * ```typescript
   * // Fetch all roles in a guild
   * try {
   *   const roles = await guildRouter.fetchGuildRoles("123456789012345678");
   *
   *   console.log(`Guild has ${roles.length} roles`);
   *
   *   // Sort roles by position (highest first)
   *   const sortedRoles = [...roles].sort((a, b) => b.position - a.position);
   *
   *   console.log("Roles by hierarchy:");
   *   sortedRoles.forEach(role => {
   *     // Convert decimal color to hex
   *     const colorHex = role.color ? `#${role.color.toString(16).padStart(6, '0')}` : "No color";
   *
   *     console.log(`- ${role.name} (Position: ${role.position}, Color: ${colorHex})`);
   *
   *     if (role.hoist) {
   *       console.log("  Displayed separately in member list");
   *     }
   *
   *     if (role.mentionable) {
   *       console.log("  Can be mentioned by anyone");
   *     }
   *   });
   *
   *   // Find specific roles
   *   const adminRole = roles.find(r => r.permissions.includes('ADMINISTRATOR'));
   *   if (adminRole) {
   *     console.log(`Admin role: ${adminRole.name} (ID: ${adminRole.id})`);
   *   }
   * } catch (error) {
   *   console.error("Failed to fetch guild roles:", error);
   * }
   * ```
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
   * @example
   * ```typescript
   * // Fetch a specific role
   * try {
   *   const role = await guildRouter.fetchGuildRole(
   *     "123456789012345678", // Guild ID
   *     "987654321987654321"  // Role ID
   *   );
   *
   *   console.log(`Role: ${role.name}`);
   *
   *   // Convert decimal color to hex
   *   const colorHex = role.color ? `#${role.color.toString(16).padStart(6, '0')}` : "No color";
   *   console.log(`Color: ${colorHex}`);
   *   console.log(`Position: ${role.position}`);
   *
   *   // Check permissions
   *   console.log(`Permissions: ${role.permissions}`);
   *
   *   const hasAdmin = BigInt(role.permissions) & BigInt(0x8) // ADMINISTRATOR = 0x8
   *   if (hasAdmin) {
   *     console.log("Role has Administrator permission");
   *   }
   * } catch (error) {
   *   console.error("Failed to fetch role:", error);
   *
   *   if (error.status === 404) {
   *     console.log("Role not found in this guild");
   *   }
   * }
   * ```
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
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-role}
   *
   * @example
   * ```typescript
   * // Create a basic role
   * try {
   *   const newRole = await guildRouter.createGuildRole(
   *     "123456789012345678",
   *     {
   *       name: "VIP Member",
   *       permissions: "0", // No special permissions
   *       color: 0xFFC0CB, // Pink color
   *       hoist: true, // Display separately in member list
   *       mentionable: true
   *     },
   *     "Creating VIP role for special members"
   *   );
   *
   *   console.log(`Created role ${newRole.name} with ID: ${newRole.id}`);
   * } catch (error) {
   *   console.error("Failed to create role:", error);
   * }
   *
   * // Create a role with custom emoji and permissions
   * try {
   *   const newRole = await guildRouter.createGuildRole(
   *     "123456789012345678",
   *     {
   *       name: "Moderator",
   *       permissions: "2099200", // Kick, Ban, Manage Messages permissions
   *       color: 0x00FFFF, // Cyan color
   *       hoist: true,
   *       unicode_emoji: "🛡️", // Shield emoji
   *       mentionable: false
   *     },
   *     "Creating moderator role with required permissions"
   *   );
   *
   *   console.log(`Created moderator role with ID: ${newRole.id}`);
   * } catch (error) {
   *   console.error("Failed to create moderator role:", error);
   * }
   * ```
   *
   * @remarks
   * Requires the MANAGE_ROLES permission.
   * The position of the new role will be below the bot's highest role.
   * The maximum number of roles per guild is 250.
   * Fires a Guild Role Create Gateway event.
   */
  async createGuildRole(
    guildId: Snowflake,
    options: CreateGuildRoleSchema,
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
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role-positions}
   *
   * @example
   * ```typescript
   * // Reorder roles in a guild
   * try {
   *   const updatedRoles = await guildRouter.updateGuildRolePositions(
   *     "123456789012345678",
   *     [
   *       {
   *         id: "111111111111111111", // Role to move
   *         position: 3 // New position (1 is directly above @everyone)
   *       },
   *       {
   *         id: "222222222222222222", // Another role to move
   *         position: 2
   *       }
   *     ]
   *   );
   *
   *   console.log("Roles reordered successfully");
   *   console.log("Updated role positions:");
   *
   *   // Display updated role hierarchy
   *   updatedRoles.sort((a, b) => b.position - a.position).forEach(role => {
   *     console.log(`- ${role.name}: position ${role.position}`);
   *   });
   * } catch (error) {
   *   console.error("Failed to update role positions:", error);
   * }
   * ```
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
    options: UpdateGuildRolePositionsSchema,
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
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role}
   *
   * @example
   * ```typescript
   * // Update a role's appearance
   * try {
   *   const updatedRole = await guildRouter.updateGuildRole(
   *     "123456789012345678", // Guild ID
   *     "987654321987654321", // Role ID
   *     {
   *       name: "Elite Member",
   *       color: 0xFFD700, // Gold color
   *       hoist: true,
   *       mentionable: true
   *     },
   *     "Updating role appearance for better visibility"
   *   );
   *
   *   console.log(`Updated role: ${updatedRole.name}`);
   *   console.log(`New color: #${updatedRole.color.toString(16).padStart(6, '0')}`);
   * } catch (error) {
   *   console.error("Failed to update role:", error);
   * }
   *
   * // Update a role's permissions
   * try {
   *   const updatedRole = await guildRouter.updateGuildRole(
   *     "123456789012345678", // Guild ID
   *     "987654321987654321", // Role ID
   *     {
   *       permissions: "16796753" // Updated permission set
   *     },
   *     "Adjusting role permissions for new server policy"
   *   );
   *
   *   console.log(`Updated permissions for role: ${updatedRole.name}`);
   * } catch (error) {
   *   console.error("Failed to update role permissions:", error);
   * }
   * ```
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
    options: UpdateGuildRoleSchema,
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
   * @example
   * ```typescript
   * // Enable MFA requirement for moderation
   * try {
   *   const newLevel = await guildRouter.updateGuildMfaLevel(
   *     "123456789012345678",
   *     1, // ELEVATED (require MFA)
   *     "Increasing security for moderation actions"
   *   );
   *
   *   console.log(`MFA level updated to: ${newLevel === 1 ? "ELEVATED" : "NONE"}`);
   *   if (newLevel === 1) {
   *     console.log("Server moderators now require 2FA to perform moderation actions");
   *   }
   * } catch (error) {
   *   console.error("Failed to update MFA level:", error);
   *
   *   if (error.status === 403) {
   *     console.error("Bot must be the guild owner to modify MFA level");
   *   }
   * }
   *
   * // Disable MFA requirement
   * try {
   *   const newLevel = await guildRouter.updateGuildMfaLevel(
   *     "123456789012345678",
   *     0, // NONE (no MFA required)
   *     "Removing MFA requirement for ease of moderation"
   *   );
   *
   *   console.log(`MFA level updated to: ${newLevel === 1 ? "ELEVATED" : "NONE"}`);
   * } catch (error) {
   *   console.error("Failed to update MFA level:", error);
   * }
   * ```
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
   * @example
   * ```typescript
   * // Delete a role from a guild
   * try {
   *   await guildRouter.deleteGuildRole(
   *     "123456789012345678", // Guild ID
   *     "987654321987654321", // Role ID
   *     "Removing outdated role after server restructuring"
   *   );
   *
   *   console.log("Role deleted successfully");
   * } catch (error) {
   *   console.error("Failed to delete role:", error);
   *
   *   if (error.status === 403) {
   *     console.error("Missing permissions or role hierarchy prevents this action");
   *   }
   * }
   * ```
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
   * @throws Error if validation of query parameters fails
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-prune-count}
   *
   * @example
   * ```typescript
   * // Get count of members who would be pruned
   * try {
   *   const pruneCount = await guildRouter.fetchGuildPruneCount(
   *     "123456789012345678",
   *     { days: 30 } // Members inactive for 30 days
   *   );
   *
   *   console.log(`${pruneCount.pruned} members would be pruned`);
   * } catch (error) {
   *   console.error("Failed to get prune count:", error);
   * }
   *
   * // Get count with specific roles included
   * try {
   *   const pruneCount = await guildRouter.fetchGuildPruneCount(
   *     "123456789012345678",
   *     {
   *       days: 14, // Members inactive for 14 days
   *       include_roles: "111111111111111111,222222222222222222" // Only consider these roles
   *     }
   *   );
   *
   *   console.log(`${pruneCount.pruned} members with specified roles would be pruned`);
   * } catch (error) {
   *   console.error("Failed to get prune count with roles:", error);
   * }
   * ```
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
    query: GetGuildPruneCountQuerySchema = {},
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
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#begin-guild-prune}
   *
   * @example
   * ```typescript
   * // Prune inactive members with default settings
   * try {
   *   const result = await guildRouter.beginGuildPrune(
   *     "123456789012345678",
   *     {
   *       days: 7, // Prune members inactive for 7 days
   *       compute_prune_count: true, // Return the count of pruned members
   *       include_roles: []
   *     },
   *     "Routine cleanup of inactive members"
   *   );
   *
   *   console.log(`Pruned ${result.pruned} inactive members`);
   * } catch (error) {
   *   console.error("Failed to prune members:", error);
   * }
   *
   * // Prune without computing the count (faster for large guilds)
   * try {
   *   const result = await guildRouter.beginGuildPrune(
   *     "123456789012345678",
   *     {
   *       days: 30, // Prune members inactive for 30 days
   *       compute_prune_count: false, // Don't compute count for faster operation
   *       include_roles: []
   *     },
   *     "Major cleanup of long-term inactive members"
   *   );
   *
   *   console.log("Prune operation completed successfully");
   * } catch (error) {
   *   console.error("Failed to prune members:", error);
   * }
   * ```
   *
   * @remarks
   * Requires both the MANAGE_GUILD and KICK_MEMBERS permissions.
   * Setting compute_prune_count to false makes the operation faster for very large guilds.
   * A member is considered inactive if they have not been seen in the guild for the specified number of days.
   * The maximum inactive period that can be specified is 30 days.
   * Fires multiple Guild Member Remove Gateway events.
   */
  beginGuildPrune(
    guildId: Snowflake,
    options: BeginGuildPruneSchema,
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
   * @example
   * ```typescript
   * // Fetch voice regions available for a guild
   * try {
   *   const regions = await guildRouter.fetchGuildVoiceRegions("123456789012345678");
   *
   *   console.log(`Guild has ${regions.length} available voice regions`);
   *
   *   // Display available regions
   *   regions.forEach(region => {
   *     console.log(`- ${region.name} (${region.id})`);
   *
   *     if (region.optimal) {
   *       console.log("  ✓ Optimal region for this guild");
   *     }
   *
   *     if (region.deprecated) {
   *       console.log("  ⚠️ Deprecated region");
   *     }
   *
   *     if (region.custom) {
   *       console.log("  ✨ Custom region for this guild");
   *     }
   *   });
   *
   *   // Find optimal region
   *   const optimalRegion = regions.find(r => r.optimal);
   *   if (optimalRegion) {
   *     console.log(`Optimal region: ${optimalRegion.name} (${optimalRegion.id})`);
   *   }
   * } catch (error) {
   *   console.error("Failed to fetch voice regions:", error);
   * }
   * ```
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
   * @example
   * ```typescript
   * // Fetch all invites for a guild
   * try {
   *   const invites = await guildRouter.fetchGuildInvites("123456789012345678");
   *
   *   console.log(`Guild has ${invites.length} active invites`);
   *
   *   // Display information about each invite
   *   invites.forEach(invite => {
   *     console.log(`- Code: ${invite.code}`);
   *     console.log(`  Channel: #${invite.channel.name} (${invite.channel.id})`);
   *     console.log(`  Created by: ${invite.inviter?.username || "Unknown"}`);
   *
   *     // Check expiration
   *     if (invite.max_age === 0) {
   *       console.log("  Permanent invite");
   *     } else {
   *       const expiresAt = new Date(invite.created_at);
   *       expiresAt.setSeconds(expiresAt.getSeconds() + invite.max_age);
   *       console.log(`  Expires: ${expiresAt.toLocaleString()}`);
   *     }
   *
   *     // Usage information
   *     console.log(`  Uses: ${invite.uses}/${invite.max_uses === 0 ? "∞" : invite.max_uses}`);
   *
   *     if (invite.temporary) {
   *       console.log("  ⚠️ Grants temporary membership");
   *     }
   *   });
   *
   *   // Find invite with the most uses
   *   const mostUsed = invites.reduce((prev, current) =>
   *     (prev.uses > current.uses) ? prev : current
   *   );
   *   console.log(`Most used invite: ${mostUsed.code} (${mostUsed.uses} uses)`);
   * } catch (error) {
   *   console.error("Failed to fetch guild invites:", error);
   * }
   * ```
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
   * @example
   * ```typescript
   * // Fetch all integrations for a guild
   * try {
   *   const integrations = await guildRouter.fetchGuildIntegrations("123456789012345678");
   *
   *   console.log(`Guild has ${integrations.length} integrations`);
   *
   *   // Group integrations by type
   *   const integrationsByType = integrations.reduce((groups, integration) => {
   *     const type = integration.type;
   *     if (!groups[type]) {
   *       groups[type] = [];
   *     }
   *     groups[type].push(integration);
   *     return groups;
   *   }, {});
   *
   *   // Display integration types
   *   Object.entries(integrationsByType).forEach(([type, typeIntegrations]) => {
   *     console.log(`${type} integrations: ${typeIntegrations.length}`);
   *
   *     typeIntegrations.forEach(integration => {
   *       console.log(`- ${integration.name} (ID: ${integration.id})`);
   *       console.log(`  Account: ${integration.account.name}`);
   *
   *       if (integration.enabled) {
   *         console.log("  Status: Enabled");
   *       } else {
   *         console.log("  Status: Disabled");
   *       }
   *     });
   *   });
   * } catch (error) {
   *   console.error("Failed to fetch guild integrations:", error);
   * }
   * ```
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
   * @example
   * ```typescript
   * // Delete an integration from a guild
   * try {
   *   await guildRouter.deleteGuildIntegration(
   *     "123456789012345678", // Guild ID
   *     "987654321987654321", // Integration ID
   *     "Removing unused integration"
   *   );
   *
   *   console.log("Integration deleted successfully");
   * } catch (error) {
   *   console.error("Failed to delete integration:", error);
   *
   *   if (error.status === 404) {
   *     console.log("Integration not found");
   *   }
   * }
   * ```
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
   * @example
   * ```typescript
   * // Fetch widget settings for a guild
   * try {
   *   const widgetSettings = await guildRouter.fetchGuildWidgetSettings("123456789012345678");
   *
   *   if (widgetSettings.enabled) {
   *     console.log("Guild widget is enabled");
   *
   *     if (widgetSettings.channel_id) {
   *       console.log(`Widget channel ID: ${widgetSettings.channel_id}`);
   *     } else {
   *       console.log("No specific channel set for the widget");
   *     }
   *   } else {
   *     console.log("Guild widget is disabled");
   *   }
   * } catch (error) {
   *   console.error("Failed to fetch widget settings:", error);
   * }
   * ```
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
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-widget}
   *
   * @example
   * ```typescript
   * // Enable the guild widget
   * try {
   *   const updatedSettings = await guildRouter.updateGuildWidget(
   *     "123456789012345678",
   *     {
   *       enabled: true,
   *       channel_id: "111111111111111111" // Channel for invite link
   *     },
   *     "Enabling widget for community promotion"
   *   );
   *
   *   console.log("Guild widget enabled successfully");
   *   console.log(`Invite channel set to ID: ${updatedSettings.channel_id}`);
   * } catch (error) {
   *   console.error("Failed to update widget settings:", error);
   * }
   *
   * // Disable the guild widget
   * try {
   *   const updatedSettings = await guildRouter.updateGuildWidget(
   *     "123456789012345678",
   *     {
   *       enabled: false,
   *       channel_id: null
   *     },
   *     "Disabling widget for privacy"
   *   );
   *
   *   console.log("Guild widget disabled successfully");
   * } catch (error) {
   *   console.error("Failed to disable widget:", error);
   * }
   * ```
   *
   * @remarks
   * Requires the MANAGE_GUILD permission.
   * When enabled, the widget provides a web embeddable way to display information about the guild.
   * The channel_id determines which channel new users will be invited to when using the widget.
   * Setting channel_id to null will use the first valid invite channel.
   */
  updateGuildWidget(
    guildId: Snowflake,
    options: UpdateGuildWidgetSettingsSchema,
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
   * @example
   * ```typescript
   * // Fetch the guild widget
   * try {
   *   const widget = await guildRouter.fetchGuildWidget("123456789012345678");
   *
   *   console.log(`Guild name: ${widget.name}`);
   *   console.log(`Invite URL: ${widget.instant_invite || "No instant invite set"}`);
   *   console.log(`Online members: ${widget.presence_count}`);
   *
   *   // List channels visible in the widget
   *   console.log("Channels visible in widget:");
   *   widget.channels.forEach(channel => {
   *     console.log(`- ${channel.name} (ID: ${channel.id})`);
   *   });
   *
   *   // List some online members visible in the widget
   *   if (widget.members.length > 0) {
   *     console.log("Some online members visible in widget:");
   *     widget.members.slice(0, 5).forEach(member => {
   *       console.log(`- ${member.username} (Status: ${member.status})`);
   *     });
   *
   *     if (widget.members.length > 5) {
   *       console.log(`And ${widget.members.length - 5} more members...`);
   *     }
   *   }
   * } catch (error) {
   *   console.error("Failed to fetch guild widget:", error);
   *
   *   if (error.status === 404) {
   *     console.log("Widget is disabled for this guild");
   *   }
   * }
   * ```
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
   * @example
   * ```typescript
   * // Fetch the guild's vanity URL
   * try {
   *   const vanityUrl = await guildRouter.fetchGuildVanityUrl("123456789012345678");
   *
   *   if (vanityUrl.code) {
   *     console.log(`Vanity URL: discord.gg/${vanityUrl.code}`);
   *     console.log(`Times used: ${vanityUrl.uses}`);
   *   } else {
   *     console.log("Guild does not have a vanity URL set");
   *   }
   * } catch (error) {
   *   console.error("Failed to fetch vanity URL:", error);
   *
   *   if (error.status === 403) {
   *     console.log("Guild does not have the VANITY_URL feature");
   *   }
   * }
   * ```
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
   * @example
   * ```typescript
   * // Get a guild widget image with default style
   * try {
   *   const imageBuffer = await guildRouter.fetchGuildWidgetImage("123456789012345678");
   *
   *   console.log(`Received widget image (${imageBuffer.length} bytes)`);
   *
   *   // Example: Save the image to a file (requires fs module)
   *   const fs = require('fs');
   *   fs.writeFileSync('guild-widget.png', imageBuffer);
   *   console.log("Widget image saved to guild-widget.png");
   * } catch (error) {
   *   console.error("Failed to fetch widget image:", error);
   * }
   *
   * // Get a guild widget image with banner style
   * try {
   *   const imageBuffer = await guildRouter.fetchGuildWidgetImage(
   *     "123456789012345678",
   *     "banner3" // Use banner3 style
   *   );
   *
   *   console.log(`Received banner widget image (${imageBuffer.length} bytes)`);
   * } catch (error) {
   *   console.error("Failed to fetch banner widget image:", error);
   * }
   * ```
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
    style: WidgetStyleOptions = "shield",
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
   * @example
   * ```typescript
   * // Fetch the guild's welcome screen
   * try {
   *   const welcomeScreen = await guildRouter.fetchGuildWelcomeScreen("123456789012345678");
   *
   *   if (welcomeScreen.enabled) {
   *     console.log("Welcome screen is enabled");
   *     console.log(`Description: ${welcomeScreen.description || "No description set"}`);
   *
   *     // Display welcome screen channels
   *     console.log("Welcome channels:");
   *     welcomeScreen.welcome_channels.forEach(channel => {
   *       console.log(`- ${channel.emoji_name || channel.emoji_id || "📌"} ${channel.channel.name}`);
   *       console.log(`  Description: ${channel.description}`);
   *     });
   *   } else {
   *     console.log("Welcome screen is disabled for this guild");
   *   }
   * } catch (error) {
   *   console.error("Failed to fetch welcome screen:", error);
   * }
   * ```
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
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-welcome-screen}
   *
   * @example
   * ```typescript
   * // Enable and update the welcome screen
   * try {
   *   const updatedScreen = await guildRouter.updateGuildWelcomeScreen(
   *     "123456789012345678",
   *     {
   *       enabled: true,
   *       description: "Welcome to our community! Check out these channels to get started:",
   *       welcome_channels: [
   *         {
   *           channel_id: "111111111111111111",
   *           description: "Server rules and guidelines",
   *           emoji_name: "📜"
   *         },
   *         {
   *           channel_id: "222222222222222222",
   *           description: "Introduce yourself to the community",
   *           emoji_name: "👋"
   *         },
   *         {
   *           channel_id: "333333333333333333",
   *           description: "Get help and support",
   *           emoji_name: "❓"
   *         }
   *       ]
   *     },
   *     "Improving new member onboarding experience"
   *   );
   *
   *   console.log("Welcome screen updated successfully");
   *   console.log(`Configured ${updatedScreen.welcome_channels.length} welcome channels`);
   * } catch (error) {
   *   console.error("Failed to update welcome screen:", error);
   * }
   *
   * // Disable the welcome screen
   * try {
   *   await guildRouter.updateGuildWelcomeScreen(
   *     "123456789012345678",
   *     {
   *       enabled: false
   *     },
   *     "Temporarily disabling welcome screen"
   *   );
   *
   *   console.log("Welcome screen disabled successfully");
   * } catch (error) {
   *   console.error("Failed to disable welcome screen:", error);
   * }
   * ```
   *
   * @remarks
   * Requires the MANAGE_GUILD permission.
   * The welcome screen is shown to new members in Community servers.
   * Can specify up to 5 channels to be featured in the welcome screen.
   * Each channel can have a custom description and emoji.
   */
  updateGuildWelcomeScreen(
    guildId: Snowflake,
    options: UpdateGuildWelcomeScreenSchema,
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
   * @example
   * ```typescript
   * // Fetch the guild's onboarding configuration
   * try {
   *   const onboarding = await guildRouter.fetchGuildOnboarding("123456789012345678");
   *
   *   if (onboarding.enabled) {
   *     console.log("Guild onboarding is enabled");
   *     console.log(`Mode: ${onboarding.mode === 0 ? "DEFAULT" : "ADVANCED"}`);
   *
   *     // Display default channels
   *     console.log("Default channels users are opted into:");
   *     onboarding.default_channel_ids.forEach(channelId => {
   *       console.log(`- Channel ID: ${channelId}`);
   *     });
   *
   *     // Display onboarding prompts
   *     console.log("Onboarding prompts:");
   *     onboarding.prompts.forEach(prompt => {
   *       console.log(`- ${prompt.title} (ID: ${prompt.id})`);
   *       console.log(`  Type: ${prompt.type === 0 ? "MULTIPLE_CHOICE" : "DROPDOWN"}`);
   *       console.log(`  Options: ${prompt.options.length}`);
   *
   *       // Display some options for each prompt
   *       prompt.options.forEach(option => {
   *         console.log(`  • ${option.title} (ID: ${option.id})`);
   *
   *         if (option.channel_ids.length > 0) {
   *           console.log(`    Channels: ${option.channel_ids.join(", ")}`);
   *         }
   *
   *         if (option.role_ids.length > 0) {
   *           console.log(`    Roles: ${option.role_ids.join(", ")}`);
   *         }
   *       });
   *     });
   *   } else {
   *     console.log("Guild onboarding is disabled");
   *   }
   * } catch (error) {
   *   console.error("Failed to fetch onboarding configuration:", error);
   * }
   * ```
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
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-onboarding}
   *
   * @example
   * ```typescript
   * // Update guild onboarding with a basic configuration
   * try {
   *   const updatedOnboarding = await guildRouter.updateGuildOnboarding(
   *     "123456789012345678",
   *     {
   *       enabled: true,
   *       mode: 0, // DEFAULT mode
   *       default_channel_ids: ["111111111111111111", "222222222222222222"],
   *       prompts: [
   *         {
   *           id: "0", // Using placeholder ID for new prompt
   *           type: 0, // MULTIPLE_CHOICE
   *           title: "What brings you to our server?",
   *           options: [
   *             {
   *               id: "0", // Using placeholder ID for new option
   *               title: "Just browsing",
   *               channel_ids: ["111111111111111111"],
   *               role_ids: []
   *             },
   *             {
   *               id: "1", // Using placeholder ID for new option
   *               title: "Looking to participate actively",
   *               channel_ids: ["111111111111111111", "222222222222222222"],
   *               role_ids: ["333333333333333333"]
   *             }
   *           ]
   *         }
   *       ]
   *     },
   *     "Setting up new member onboarding flow"
   *   );
   *
   *   console.log("Guild onboarding updated successfully");
   *   console.log(`Configured ${updatedOnboarding.prompts.length} onboarding prompts`);
   * } catch (error) {
   *   console.error("Failed to update onboarding:", error);
   * }
   * ```
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
    options: UpdateGuildOnboardingSchema,
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
