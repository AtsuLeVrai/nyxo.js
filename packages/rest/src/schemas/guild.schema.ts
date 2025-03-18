import {
  AnyChannelEntity,
  type AnyThreadChannelEntity,
  DefaultMessageNotificationLevel,
  ExplicitContentFilterLevel,
  GuildFeature,
  GuildMemberFlags,
  GuildOnboardingMode,
  GuildOnboardingPromptEntity,
  RoleEntity,
  Snowflake,
  SystemChannelFlags,
  type ThreadMemberEntity,
  VerificationLevel,
  WelcomeScreenChannelEntity,
} from "@nyxjs/core";
import { z } from "zod";
import { FileHandler, type FileInput } from "../handlers/index.js";

/**
 * Schema for creating a new guild channel
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-channel-json-params}
 */
export const CreateGuildChannelSchema = AnyChannelEntity;

export type CreateGuildChannelSchema = z.input<typeof CreateGuildChannelSchema>;

/**
 * Schema for creating a new guild
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-json-params}
 */
export const CreateGuildSchema = z.object({
  /** Guild name (2-100 characters) */
  name: z.string().min(2).max(100),

  /** Voice region id for the guild (deprecated) */
  region: z.string().nullish(),

  /** Base64 128x128 image for the guild icon */
  icon: z
    .custom<FileInput>(FileHandler.isValidSingleInput)
    .transform(FileHandler.toDataUri)
    .optional(),

  /** Verification level required for the guild */
  verification_level: z.nativeEnum(VerificationLevel).optional(),

  /** Default message notification level */
  default_message_notifications: z
    .nativeEnum(DefaultMessageNotificationLevel)
    .optional(),

  /** Explicit content filter level */
  explicit_content_filter: z.nativeEnum(ExplicitContentFilterLevel).optional(),

  /** New guild roles */
  roles: RoleEntity.array().optional(),

  /** New guild's channels */
  channels: CreateGuildChannelSchema.array().optional(),

  /** ID for afk channel */
  afk_channel_id: Snowflake.optional(),

  /** AFK timeout in seconds */
  afk_timeout: z.number().optional(),

  /** ID of the channel where guild notices such as welcome messages and boost events are posted */
  system_channel_id: Snowflake.optional(),

  /** System channel flags */
  system_channel_flags: z.nativeEnum(SystemChannelFlags).optional(),
});

export type CreateGuildSchema = z.input<typeof CreateGuildSchema>;

/**
 * Schema for modifying an existing guild
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-json-params}
 */
export const ModifyGuildSchema = z.object({
  /** Guild name (2-100 characters) */
  name: z.string().min(2).max(100).optional(),

  /** Voice region id for the guild (deprecated) */
  region: z.string().nullish(),

  /** Verification level required for the guild */
  verification_level: z.nativeEnum(VerificationLevel).nullish(),

  /** Default message notification level */
  default_message_notifications: z
    .nativeEnum(DefaultMessageNotificationLevel)
    .nullish(),

  /** Explicit content filter level */
  explicit_content_filter: z.nativeEnum(ExplicitContentFilterLevel).nullish(),

  /** ID for afk channel */
  afk_channel_id: Snowflake.nullish(),

  /** AFK timeout in seconds */
  afk_timeout: z.number().optional(),

  /** Base64 1024x1024 png/jpeg/gif image for the guild icon */
  icon: z
    .custom<FileInput>(FileHandler.isValidSingleInput)
    .transform(FileHandler.toDataUri)
    .nullish(),

  /** User ID to transfer guild ownership to (must be owner) */
  owner_id: Snowflake.optional(),

  /** Base64 16:9 png/jpeg image for the guild splash */
  splash: z
    .custom<FileInput>(FileHandler.isValidSingleInput)
    .transform(FileHandler.toDataUri)
    .nullish(),

  /** Base64 16:9 png/jpeg image for the guild discovery splash */
  discovery_splash: z
    .custom<FileInput>(FileHandler.isValidSingleInput)
    .transform(FileHandler.toDataUri)
    .nullish(),

  /** Base64 16:9 png/jpeg image for the guild banner */
  banner: z
    .custom<FileInput>(FileHandler.isValidSingleInput)
    .transform(FileHandler.toDataUri)
    .nullish(),

  /** ID of the channel where guild notices are posted */
  system_channel_id: Snowflake.nullish(),

  /** System channel flags */
  system_channel_flags: z.nativeEnum(SystemChannelFlags).optional(),

  /** ID of the channel where Community guilds display rules */
  rules_channel_id: Snowflake.nullish(),

  /** ID of the channel where admins and moderators receive notices */
  public_updates_channel_id: Snowflake.nullish(),

  /** Preferred locale of a Community guild */
  preferred_locale: z.string().optional(),

  /** Enabled guild features */
  features: z.nativeEnum(GuildFeature).array().optional(),

  /** Description for the guild */
  description: z.string().nullish(),

  /** Whether the guild's boost progress bar should be enabled */
  premium_progress_bar_enabled: z.boolean().optional(),

  /** ID of the channel where admins and moderators receive safety alerts */
  safety_alerts_channel_id: Snowflake.nullish(),
});

export type ModifyGuildSchema = z.input<typeof ModifyGuildSchema>;

/**
 * Schema for modifying guild channel positions
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-channel-positions}
 */
export const ModifyGuildChannelPositionsSchema = z
  .object({
    /** Channel ID */
    id: Snowflake,

    /** Sorting position of the channel */
    position: z.number().nullish(),

    /** Syncs the permission overwrites with the new parent, if moving to a new category */
    lock_permissions: z.boolean().optional(),

    /** The new parent ID for the channel that is moved */
    parent_id: Snowflake.nullish(),
  })
  .array();

export type ModifyGuildChannelPositionsSchema = z.input<
  typeof ModifyGuildChannelPositionsSchema
>;

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
 * Schema for query parameters when listing guild members
 * @see {@link https://discord.com/developers/docs/resources/guild#list-guild-members-query-string-params}
 */
export const ListGuildMembersQuerySchema = z.object({
  /** Max number of members to return (1-1000) */
  limit: z.number().min(1).max(1000).default(1),

  /** The highest user id in the previous page */
  after: Snowflake.optional(),
});

export type ListGuildMembersQuerySchema = z.input<
  typeof ListGuildMembersQuerySchema
>;

/**
 * Schema for query parameters when searching guild members
 * @see {@link https://discord.com/developers/docs/resources/guild#search-guild-members-query-string-params}
 */
export const SearchGuildMembersQuerySchema = z.object({
  /** Query string to match username(s) and nickname(s) against */
  query: z.string(),

  /** Max number of members to return (1-1000) */
  limit: z.number().min(1).max(1000).default(1),
});

export type SearchGuildMembersQuerySchema = z.input<
  typeof SearchGuildMembersQuerySchema
>;

/**
 * Schema for adding a member to a guild
 * @see {@link https://discord.com/developers/docs/resources/guild#add-guild-member-json-params}
 */
export const AddGuildMemberSchema = z.object({
  /** OAuth2 access token granted with the guilds.join scope */
  access_token: z.string(),

  /** Value to set user's nickname to */
  nick: z.string().optional(),

  /** Array of role IDs the member is assigned */
  roles: Snowflake.array().optional(),

  /** Whether the user is muted in voice channels */
  mute: z.boolean().optional(),

  /** Whether the user is deafened in voice channels */
  deaf: z.boolean().optional(),
});

export type AddGuildMemberSchema = z.input<typeof AddGuildMemberSchema>;

/**
 * Schema for modifying a guild member
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-member-json-params}
 */
export const ModifyGuildMemberSchema = z.object({
  /** Value to set user's nickname to */
  nick: z.string().nullish(),

  /** Array of role IDs the member is assigned */
  roles: Snowflake.array().optional(),

  /** Whether the user is muted in voice channels */
  mute: z.boolean().optional(),

  /** Whether the user is deafened in voice channels */
  deaf: z.boolean().optional(),

  /** ID of channel to move user to (if they are connected to voice) */
  channel_id: Snowflake.nullish(),

  /** When the user's timeout will expire (up to 28 days in the future) */
  communication_disabled_until: z.string().datetime().optional(),

  /** Guild member flags */
  flags: z.nativeEnum(GuildMemberFlags).optional(),
});

export type ModifyGuildMemberSchema = z.input<typeof ModifyGuildMemberSchema>;

/**
 * Schema for query parameters when getting guild bans
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-bans-query-string-params}
 */
export const GetGuildBansQuerySchema = z.object({
  /** Number of users to return (up to maximum 1000) */
  limit: z.number().min(1).max(1000).default(1000),

  /** Consider only users before given user ID */
  before: Snowflake.optional(),

  /** Consider only users after given user ID */
  after: Snowflake.optional(),
});

export type GetGuildBansQuerySchema = z.input<typeof GetGuildBansQuerySchema>;

/**
 * Schema for creating a guild ban
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-ban-json-params}
 */
export const CreateGuildBanSchema = z.object({
  /** Number of days to delete messages for (0-7) (deprecated) */
  delete_message_days: z.number().min(0).max(7).optional(),

  /** Number of seconds to delete messages for (0-604800) */
  delete_message_seconds: z.number().min(0).max(604800).optional(),
});

export type CreateGuildBanSchema = z.input<typeof CreateGuildBanSchema>;

/**
 * Schema for bulk guild ban
 * @see {@link https://discord.com/developers/docs/resources/guild#bulk-guild-ban-json-params}
 */
export const BulkGuildBanSchema = z.object({
  /** List of user IDs to ban (max 200) */
  user_ids: Snowflake.array().max(200),

  /** Number of seconds to delete messages for (0-604800) */
  delete_message_seconds: z.number().min(0).max(604800).default(0),
});

export type BulkGuildBanSchema = z.input<typeof BulkGuildBanSchema>;

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
 * Schema for creating a guild role
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-role-json-params}
 */
export const CreateGuildRoleSchema = z.object({
  /** Name of the role (max 100 characters) */
  name: z.string().max(100).default("new role"),

  /** Bitwise value of the enabled/disabled permissions */
  permissions: z.string(),

  /** RGB color value */
  color: z.number().int().default(0),

  /** Whether the role should be displayed separately in the sidebar */
  hoist: z.boolean().default(false),

  /** The role's icon image */
  icon: z
    .custom<FileInput>(FileHandler.isValidSingleInput)
    .transform(FileHandler.toDataUri)
    .nullable(),

  /** The role's unicode emoji as a standard emoji */
  unicode_emoji: z.string().emoji().optional(),

  /** Whether the role should be mentionable */
  mentionable: z.boolean().default(false),
});

export type CreateGuildRoleSchema = z.input<typeof CreateGuildRoleSchema>;

/**
 * Schema for modifying guild role positions
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role-positions-json-params}
 */
export const ModifyGuildRolePositionsSchema = z
  .object({
    /** Role ID */
    id: Snowflake,

    /** Sorting position of the role */
    position: z.number().int().nullish(),
  })
  .array();

export type ModifyGuildRolePositionsSchema = z.input<
  typeof ModifyGuildRolePositionsSchema
>;

/**
 * Schema for modifying a guild role
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role-json-params}
 */
export const ModifyGuildRoleSchema = CreateGuildRoleSchema.partial().nullable();

export type ModifyGuildRoleSchema = z.input<typeof ModifyGuildRoleSchema>;

/**
 * Schema for query parameters when getting guild prune count
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-prune-count-query-string-params}
 */
export const GetGuildPruneCountQuerySchema = z.object({
  /** Number of days to count prune for (1-30) */
  days: z.number().min(1).max(30).default(7),

  /** Comma-delimited array of role IDs to include */
  include_roles: z.string().optional(),
});

export type GetGuildPruneCountQuerySchema = z.input<
  typeof GetGuildPruneCountQuerySchema
>;

/**
 * Schema for beginning a guild prune operation
 * @see {@link https://discord.com/developers/docs/resources/guild#begin-guild-prune-json-params}
 */
export const BeginGuildPruneSchema = z.object({
  /** Number of days to prune (1-30) */
  days: z.number().min(1).max(30).default(7),

  /** Whether 'pruned' is returned in the response */
  compute_prune_count: z.boolean().default(true),

  /** Array of role IDs to include */
  include_roles: Snowflake.array(),

  /** @deprecated Reason for the prune (deprecated) */
  reason: z.string().optional(),
});

export type BeginGuildPruneSchema = z.input<typeof BeginGuildPruneSchema>;

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
 * Schema for modifying guild widget settings
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-widget-json-params}
 */
export const ModifyGuildWidgetSettingsSchema = z.object({
  /** Whether the widget is enabled */
  enabled: z.boolean(),

  /** The widget channel ID */
  channel_id: Snowflake.nullable(),
});

export type ModifyGuildWidgetSettingsSchema = z.input<
  typeof ModifyGuildWidgetSettingsSchema
>;

/**
 * Schema for modifying guild welcome screen
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-welcome-screen-json-params}
 */
export const ModifyGuildWelcomeScreenSchema = z.object({
  /** Whether the welcome screen is enabled */
  enabled: z.boolean().nullish(),

  /** Channels shown in the welcome screen and their display options */
  welcome_channels: WelcomeScreenChannelEntity.array().nullish(),

  /** The server description to show in the welcome screen */
  description: z.string().nullish(),
});

export type ModifyGuildWelcomeScreenSchema = z.input<
  typeof ModifyGuildWelcomeScreenSchema
>;

/**
 * Schema for modifying guild onboarding
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-onboarding}
 */
export const ModifyGuildOnboardingSchema = z.object({
  /** Prompts shown during onboarding and in customize community */
  prompts: GuildOnboardingPromptEntity.array(),

  /** Channel IDs that members get opted into automatically */
  default_channel_ids: Snowflake.array(),

  /** Whether onboarding is enabled in the guild */
  enabled: z.boolean(),

  /** Current mode of onboarding */
  mode: z.nativeEnum(GuildOnboardingMode),
});

export type ModifyGuildOnboardingSchema = z.input<
  typeof ModifyGuildOnboardingSchema
>;
