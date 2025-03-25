import type {
  AnyChannelEntity,
  AnyThreadChannelEntity,
  DefaultMessageNotificationLevel,
  ExplicitContentFilterLevel,
  GuildFeature,
  GuildMemberFlags,
  GuildOnboardingMode,
  GuildOnboardingPromptEntity,
  RoleEntity,
  Snowflake,
  SystemChannelFlags,
  ThreadMemberEntity,
  VerificationLevel,
  WelcomeScreenChannelEntity,
} from "@nyxjs/core";
import type { FileInput } from "../handlers/index.js";

/**
 * Interface for creating a new guild channel
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-channel-json-params}
 */
export type CreateGuildChannelSchema = AnyChannelEntity;

/**
 * Interface for creating a new guild
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-json-params}
 */
export interface CreateGuildSchema {
  /**
   * Guild name (2-100 characters)
   *
   * @minLength 2
   * @maxLength 100
   */
  name: string;

  /**
   * Voice region id for the guild (deprecated)
   *
   * @nullable
   * @optional
   */
  region?: string | null;

  /**
   * Base64 128x128 image for the guild icon
   *
   * @transform Converted to data URI using FileHandler.toDataUri
   * @optional
   */
  icon?: FileInput;

  /**
   * Verification level required for the guild
   *
   * @optional
   */
  verification_level?: VerificationLevel;

  /**
   * Default message notification level
   *
   * @optional
   */
  default_message_notifications?: DefaultMessageNotificationLevel;

  /**
   * Explicit content filter level
   *
   * @optional
   */
  explicit_content_filter?: ExplicitContentFilterLevel;

  /**
   * New guild roles
   *
   * @optional
   */
  roles?: RoleEntity[];

  /**
   * New guild's channels
   *
   * @optional
   */
  channels?: CreateGuildChannelSchema[];

  /**
   * ID for afk channel
   *
   * @optional
   */
  afk_channel_id?: Snowflake;

  /**
   * AFK timeout in seconds
   *
   * @optional
   */
  afk_timeout?: number;

  /**
   * ID of the channel where guild notices such as welcome messages and boost events are posted
   *
   * @optional
   */
  system_channel_id?: Snowflake;

  /**
   * System channel flags
   *
   * @optional
   */
  system_channel_flags?: SystemChannelFlags;
}

/**
 * Interface for modifying an existing guild
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-json-params}
 */
export interface ModifyGuildSchema {
  /**
   * Guild name (2-100 characters)
   *
   * @minLength 2
   * @maxLength 100
   * @optional
   */
  name?: string;

  /**
   * Voice region id for the guild (deprecated)
   *
   * @nullable
   * @optional
   */
  region?: string | null;

  /**
   * Verification level required for the guild
   *
   * @nullable
   * @optional
   */
  verification_level?: VerificationLevel | null;

  /**
   * Default message notification level
   *
   * @nullable
   * @optional
   */
  default_message_notifications?: DefaultMessageNotificationLevel | null;

  /**
   * Explicit content filter level
   *
   * @nullable
   * @optional
   */
  explicit_content_filter?: ExplicitContentFilterLevel | null;

  /**
   * ID for afk channel
   *
   * @nullable
   * @optional
   */
  afk_channel_id?: Snowflake | null;

  /**
   * AFK timeout in seconds
   *
   * @optional
   */
  afk_timeout?: number;

  /**
   * Base64 1024x1024 png/jpeg/gif image for the guild icon
   *
   * @transform Converted to data URI using FileHandler.toDataUri
   * @nullable
   * @optional
   */
  icon?: FileInput | null;

  /**
   * User ID to transfer guild ownership to (must be owner)
   *
   * @optional
   */
  owner_id?: Snowflake;

  /**
   * Base64 16:9 png/jpeg image for the guild splash
   *
   * @transform Converted to data URI using FileHandler.toDataUri
   * @nullable
   * @optional
   */
  splash?: FileInput | null;

  /**
   * Base64 16:9 png/jpeg image for the guild discovery splash
   *
   * @transform Converted to data URI using FileHandler.toDataUri
   * @nullable
   * @optional
   */
  discovery_splash?: FileInput | null;

  /**
   * Base64 16:9 png/jpeg image for the guild banner
   *
   * @transform Converted to data URI using FileHandler.toDataUri
   * @nullable
   * @optional
   */
  banner?: FileInput | null;

  /**
   * ID of the channel where guild notices are posted
   *
   * @nullable
   * @optional
   */
  system_channel_id?: Snowflake | null;

  /**
   * System channel flags
   *
   * @optional
   */
  system_channel_flags?: SystemChannelFlags;

  /**
   * ID of the channel where Community guilds display rules
   *
   * @nullable
   * @optional
   */
  rules_channel_id?: Snowflake | null;

  /**
   * ID of the channel where admins and moderators receive notices
   *
   * @nullable
   * @optional
   */
  public_updates_channel_id?: Snowflake | null;

  /**
   * Preferred locale of a Community guild
   *
   * @optional
   */
  preferred_locale?: string;

  /**
   * Enabled guild features
   *
   * @optional
   */
  features?: GuildFeature[];

  /**
   * Description for the guild
   *
   * @nullable
   * @optional
   */
  description?: string | null;

  /**
   * Whether the guild's boost progress bar should be enabled
   *
   * @optional
   */
  premium_progress_bar_enabled?: boolean;

  /**
   * ID of the channel where admins and moderators receive safety alerts
   *
   * @nullable
   * @optional
   */
  safety_alerts_channel_id?: Snowflake | null;
}

/**
 * Interface for modifying guild channel positions
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-channel-positions}
 */
export interface ModifyGuildChannelPositionsItem {
  /** Channel ID */
  id: Snowflake;

  /**
   * Sorting position of the channel
   *
   * @nullable
   * @optional
   */
  position?: number | null;

  /**
   * Syncs the permission overwrites with the new parent, if moving to a new category
   *
   * @optional
   */
  lock_permissions?: boolean;

  /**
   * The new parent ID for the channel that is moved
   *
   * @nullable
   * @optional
   */
  parent_id?: Snowflake | null;
}

export type ModifyGuildChannelPositionsSchema =
  ModifyGuildChannelPositionsItem[];

/**
 * Interface for the response when listing active guild threads
 * @see {@link https://discord.com/developers/docs/resources/guild#list-active-guild-threads-response-body}
 */
export interface ListActiveGuildThreadsEntity {
  /** The active threads */
  threads: AnyThreadChannelEntity[];

  /** A thread member object for each returned thread the current user has joined */
  members: ThreadMemberEntity[];
}

/**
 * Interface for query parameters when listing guild members
 * @see {@link https://discord.com/developers/docs/resources/guild#list-guild-members-query-string-params}
 */
export interface ListGuildMembersQuerySchema {
  /**
   * Max number of members to return (1-1000)
   *
   * @minimum 1
   * @maximum 1000
   * @default 1
   */
  limit?: number;

  /**
   * The highest user id in the previous page
   *
   * @optional
   */
  after?: Snowflake;
}

/**
 * Interface for query parameters when searching guild members
 * @see {@link https://discord.com/developers/docs/resources/guild#search-guild-members-query-string-params}
 */
export interface SearchGuildMembersQuerySchema {
  /** Query string to match username(s) and nickname(s) against */
  query: string;

  /**
   * Max number of members to return (1-1000)
   *
   * @minimum 1
   * @maximum 1000
   * @default 1
   */
  limit: number;
}

/**
 * Interface for adding a member to a guild
 * @see {@link https://discord.com/developers/docs/resources/guild#add-guild-member-json-params}
 */
export interface AddGuildMemberSchema {
  /** OAuth2 access token granted with the guilds.join scope */
  access_token: string;

  /**
   * Value to set user's nickname to
   *
   * @optional
   */
  nick?: string;

  /**
   * Array of role IDs the member is assigned
   *
   * @optional
   */
  roles?: Snowflake[];

  /**
   * Whether the user is muted in voice channels
   *
   * @optional
   */
  mute?: boolean;

  /**
   * Whether the user is deafened in voice channels
   *
   * @optional
   */
  deaf?: boolean;
}

/**
 * Interface for modifying a guild member
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-member-json-params}
 */
export interface ModifyGuildMemberSchema {
  /**
   * Value to set user's nickname to
   *
   * @nullable
   * @optional
   */
  nick?: string | null;

  /**
   * Array of role IDs the member is assigned
   *
   * @optional
   */
  roles?: Snowflake[];

  /**
   * Whether the user is muted in voice channels
   *
   * @optional
   */
  mute?: boolean;

  /**
   * Whether the user is deafened in voice channels
   *
   * @optional
   */
  deaf?: boolean;

  /**
   * ID of channel to move user to (if they are connected to voice)
   *
   * @nullable
   * @optional
   */
  channel_id?: Snowflake | null;

  /**
   * When the user's timeout will expire (up to 28 days in the future)
   *
   * @format datetime
   * @optional
   */
  communication_disabled_until?: string;

  /**
   * Guild member flags
   *
   * @optional
   */
  flags?: GuildMemberFlags;
}

/**
 * Interface for query parameters when getting guild bans
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-bans-query-string-params}
 */
export interface GetGuildBansQuerySchema {
  /**
   * Number of users to return (up to maximum 1000)
   *
   * @minimum 1
   * @maximum 1000
   * @default 1000
   */
  limit?: number;

  /**
   * Consider only users before given user ID
   *
   * @optional
   */
  before?: Snowflake;

  /**
   * Consider only users after given user ID
   *
   * @optional
   */
  after?: Snowflake;
}

/**
 * Interface for creating a guild ban
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-ban-json-params}
 */
export interface CreateGuildBanSchema {
  /**
   * Number of days to delete messages for (0-7) (deprecated)
   *
   * @minimum 0
   * @maximum 7
   * @optional
   */
  delete_message_days?: number;

  /**
   * Number of seconds to delete messages for (0-604800)
   *
   * @minimum 0
   * @maximum 604800
   * @optional
   */
  delete_message_seconds?: number;
}

/**
 * Interface for bulk guild ban
 * @see {@link https://discord.com/developers/docs/resources/guild#bulk-guild-ban-json-params}
 */
export interface BulkGuildBanSchema {
  /**
   * List of user IDs to ban (max 200)
   *
   * @maxItems 200
   */
  user_ids: Snowflake[];

  /**
   * Number of seconds to delete messages for (0-604800)
   *
   * @minimum 0
   * @maximum 604800
   * @default 0
   */
  delete_message_seconds: number;
}

/**
 * Interface for bulk guild ban response
 * @see {@link https://discord.com/developers/docs/resources/guild#bulk-guild-ban-bulk-ban-response}
 */
export interface BulkGuildBanResponseEntity {
  /** List of user IDs that were successfully banned */
  banned_users: Snowflake[];

  /** List of user IDs that were not banned */
  failed_users: Snowflake[];
}

/**
 * Interface for creating a guild role
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-role-json-params}
 */
export interface CreateGuildRoleSchema {
  /**
   * Name of the role (max 100 characters)
   *
   * @maxLength 100
   * @default "new role"
   */
  name: string;

  /** Bitwise value of the enabled/disabled permissions */
  permissions: string;

  /**
   * RGB color value
   *
   * @integer
   * @default 0
   */
  color: number;

  /**
   * Whether the role should be displayed separately in the sidebar
   *
   * @default false
   */
  hoist: boolean;

  /**
   * The role's icon image
   *
   * @transform Converted to data URI using FileHandler.toDataUri
   * @nullable
   */
  icon: FileInput | null;

  /**
   * The role's unicode emoji as a standard emoji
   *
   * @optional
   * @format emoji
   */
  unicode_emoji?: string;

  /**
   * Whether the role should be mentionable
   *
   * @default false
   */
  mentionable: boolean;
}

/**
 * Interface for modifying guild role positions
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role-positions-json-params}
 */
export interface ModifyGuildRolePositionsItem {
  /** Role ID */
  id: Snowflake;

  /**
   * Sorting position of the role
   *
   * @integer
   * @nullable
   * @optional
   */
  position?: number | null;
}

export type ModifyGuildRolePositionsSchema = ModifyGuildRolePositionsItem[];

/**
 * Interface for modifying a guild role
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role-json-params}
 */
export type ModifyGuildRoleSchema = Partial<CreateGuildRoleSchema> | null;

/**
 * Interface for query parameters when getting guild prune count
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-prune-count-query-string-params}
 */
export interface GetGuildPruneCountQuerySchema {
  /**
   * Number of days to count prune for (1-30)
   *
   * @minimum 1
   * @maximum 30
   * @default 7
   */
  days?: number;

  /**
   * Comma-delimited array of role IDs to include
   *
   * @optional
   */
  include_roles?: string;
}

/**
 * Interface for beginning a guild prune operation
 * @see {@link https://discord.com/developers/docs/resources/guild#begin-guild-prune-json-params}
 */
export interface BeginGuildPruneSchema {
  /**
   * Number of days to prune (1-30)
   *
   * @minimum 1
   * @maximum 30
   * @default 7
   */
  days: number;

  /**
   * Whether 'pruned' is returned in the response
   *
   * @default true
   */
  compute_prune_count: boolean;

  /** Array of role IDs to include */
  include_roles: Snowflake[];

  /**
   * @deprecated Reason for the prune (deprecated)
   *
   * @optional
   */
  reason?: string;
}

/**
 * Widget style options for guild widget images
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-widget-image-widget-style-options}
 */
export type WidgetStyleOptions =
  | "shield"
  | "banner1"
  | "banner2"
  | "banner3"
  | "banner4";

/**
 * Interface for modifying guild widget settings
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-widget-json-params}
 */
export interface ModifyGuildWidgetSettingsSchema {
  /** Whether the widget is enabled */
  enabled: boolean;

  /** The widget channel ID */
  channel_id: Snowflake | null;
}

/**
 * Interface for modifying guild welcome screen
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-welcome-screen-json-params}
 */
export interface ModifyGuildWelcomeScreenSchema {
  /**
   * Whether the welcome screen is enabled
   *
   * @nullable
   * @optional
   */
  enabled?: boolean | null;

  /**
   * Channels shown in the welcome screen and their display options
   *
   * @nullable
   * @optional
   */
  welcome_channels?: WelcomeScreenChannelEntity[] | null;

  /**
   * The server description to show in the welcome screen
   *
   * @nullable
   * @optional
   */
  description?: string | null;
}

/**
 * Interface for modifying guild onboarding
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-onboarding}
 */
export interface ModifyGuildOnboardingSchema {
  /** Prompts shown during onboarding and in customize community */
  prompts: GuildOnboardingPromptEntity[];

  /** Channel IDs that members get opted into automatically */
  default_channel_ids: Snowflake[];

  /** Whether onboarding is enabled in the guild */
  enabled: boolean;

  /** Current mode of onboarding */
  mode: GuildOnboardingMode;
}
