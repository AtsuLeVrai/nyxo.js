import {
  ChannelFlags,
  ChannelType,
  DefaultMessageNotificationLevel,
  type DefaultReactionEntity,
  ExplicitContentFilterLevel,
  ForumLayoutType,
  GuildFeature,
  GuildMemberFlags,
  GuildOnboardingMode,
  GuildOnboardingPromptType,
  type RoleEntity,
  RoleFlags,
  type RoleTagsEntity,
  type Snowflake,
  SnowflakeManager,
  SortOrderType,
  SystemChannelFlags,
  type ThreadChannelEntity,
  type ThreadMemberEntity,
  VerificationLevel,
  VideoQualityMode,
} from "@nyxjs/core";
import { z } from "zod";
import { ForumTagSchema, OverwriteSchema } from "./channel.schema.js";

const RoleTagsSchema: z.ZodType<RoleTagsEntity> = z
  .object({
    bot_id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
    integration_id: z
      .string()
      .regex(SnowflakeManager.SNOWFLAKE_REGEX)
      .optional(),
    premium_subscriber: z.null().optional(),
    subscription_listing_id: z
      .string()
      .regex(SnowflakeManager.SNOWFLAKE_REGEX)
      .optional(),
    available_for_purchase: z.null().optional(),
    guild_connections: z.null().optional(),
  })
  .strict();

const RoleSchema: z.ZodType<RoleEntity> = z.object({
  id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX),
  name: z.string(),
  color: z.number().int(),
  hoist: z.boolean(),
  icon: z.string().optional().nullable(),
  unicode_emoji: z.string().emoji().optional().nullable(),
  position: z.number().int(),
  permissions: z.string(),
  managed: z.boolean(),
  mentionable: z.boolean(),
  tags: RoleTagsSchema.optional(),
  flags: z.nativeEnum(RoleFlags),
});

const DefaultReactionSchema: z.ZodType<DefaultReactionEntity> = z
  .object({
    emoji_id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).nullable(),
    emoji_name: z.string().nullable(),
  })
  .strict();

const ChannelSchema = z
  .object({
    name: z.string().min(1).max(100),
    type: z.nativeEnum(ChannelType).optional(),
    topic: z.string().max(1024).optional(),
    bitrate: z.number().min(8000).optional(),
    user_limit: z.number().min(0).max(99).optional(),
    rate_limit_per_user: z.number().min(0).max(21600).optional(),
    position: z.number().optional(),
    permission_overwrites: z.array(OverwriteSchema).optional(),
    parent_id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
    nsfw: z.boolean().optional(),
    rtc_region: z.string().optional(),
    video_quality_mode: z.nativeEnum(VideoQualityMode).optional(),
    default_auto_archive_duration: z.number().optional(),
    flags: z.nativeEnum(ChannelFlags).optional(),
    available_tags: z.array(ForumTagSchema).max(20).optional(),
    default_reaction_emoji: DefaultReactionSchema.optional(),
    default_sort_order: z.nativeEnum(SortOrderType).optional().nullable(),
    default_forum_layout: z.nativeEnum(ForumLayoutType).optional(),
    default_thread_rate_limit_per_user: z.number().optional(),
  })
  .strict();

export const CreateGuildSchema = z
  .object({
    name: z.string().min(2).max(100),
    region: z.string().optional().nullable(),
    icon: z
      .string()
      .regex(/^data:image\/(jpeg|png|gif);base64,/)
      .optional(),
    verification_level: z.nativeEnum(VerificationLevel).optional(),
    default_message_notifications: z
      .nativeEnum(DefaultMessageNotificationLevel)
      .optional(),
    explicit_content_filter: z
      .nativeEnum(ExplicitContentFilterLevel)
      .optional(),
    roles: z.array(RoleSchema).optional(),
    channels: z.array(ChannelSchema.partial()).optional(),
    afk_channel_id: z
      .string()
      .regex(SnowflakeManager.SNOWFLAKE_REGEX)
      .optional(),
    afk_timeout: z.number().optional(),
    system_channel_id: z
      .string()
      .regex(SnowflakeManager.SNOWFLAKE_REGEX)
      .optional(),
    system_channel_flags: z.nativeEnum(SystemChannelFlags).optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-json-params}
 */
export type CreateGuildEntity = z.infer<typeof CreateGuildSchema>;

export const ModifyGuildSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    /** @deprecated */
    region: z.string().optional().nullable(),
    verification_level: z.nativeEnum(VerificationLevel).optional().nullable(),
    default_message_notifications: z
      .nativeEnum(DefaultMessageNotificationLevel)
      .optional()
      .nullable(),
    explicit_content_filter: z
      .nativeEnum(ExplicitContentFilterLevel)
      .optional()
      .nullable(),
    afk_channel_id: z
      .string()
      .regex(SnowflakeManager.SNOWFLAKE_REGEX)
      .optional()
      .nullable(),
    afk_timeout: z.number().optional(),
    icon: z
      .string()
      .regex(/^data:image\/(jpeg|png|gif);base64,/)
      .optional()
      .nullable(),
    owner_id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
    splash: z
      .string()
      .regex(/^data:image\/(jpeg|png|gif);base64,/)
      .optional()
      .nullable(),
    discovery_splash: z
      .string()
      .regex(/^data:image\/(jpeg|png|gif);base64,/)
      .optional()
      .nullable(),
    banner: z
      .string()
      .regex(/^data:image\/(jpeg|png|gif);base64,/)
      .optional()
      .nullable(),
    system_channel_id: z
      .string()
      .regex(SnowflakeManager.SNOWFLAKE_REGEX)
      .optional()
      .nullable(),
    system_channel_flags: z.nativeEnum(SystemChannelFlags).optional(),
    rules_channel_id: z
      .string()
      .regex(SnowflakeManager.SNOWFLAKE_REGEX)
      .optional()
      .nullable(),
    public_updates_channel_id: z
      .string()
      .regex(SnowflakeManager.SNOWFLAKE_REGEX)
      .optional()
      .nullable(),
    preferred_locale: z.string().optional(),
    features: z.array(z.nativeEnum(GuildFeature)).optional(),
    description: z.string().optional().nullable(),
    premium_progress_bar_enabled: z.boolean().optional(),
    safety_alerts_channel_id: z
      .string()
      .regex(SnowflakeManager.SNOWFLAKE_REGEX)
      .optional()
      .nullable(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-json-params}
 */
export type ModifyGuildEntity = z.infer<typeof ModifyGuildSchema>;

export const CreateGuildChannelSchema = ChannelSchema;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-channel-json-params}
 */
export type CreateGuildChannelEntity = z.infer<typeof CreateGuildChannelSchema>;

export const ModifyGuildChannelPositionsSchema = z.array(
  z
    .object({
      id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX),
      position: z.number().optional().nullable(),
      lock_permissions: z.boolean().optional(),
      parent_id: z
        .string()
        .regex(SnowflakeManager.SNOWFLAKE_REGEX)
        .optional()
        .nullable(),
    })
    .strict(),
);

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-channel-positions}
 */
export type ModifyGuildChannelPositionsEntity = z.infer<
  typeof ModifyGuildChannelPositionsSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#list-active-guild-threads-response-body}
 */
export interface ListActiveGuildThreadsEntity {
  threads: ThreadChannelEntity[];
  members: ThreadMemberEntity[];
}

export const ListGuildMembersQuerySchema = z
  .object({
    limit: z.number().min(1).max(1000).default(1).optional(),
    after: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#list-guild-members-query-string-params}
 */
export type ListGuildMembersQueryEntity = z.infer<
  typeof ListGuildMembersQuerySchema
>;

export const SearchGuildMembersQuerySchema = z
  .object({
    query: z.string(),
    limit: z.number().min(1).max(1000).default(1).optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#search-guild-members-query-string-params}
 */
export type SearchGuildMembersQueryEntity = z.infer<
  typeof SearchGuildMembersQuerySchema
>;

export const AddGuildMemberSchema = z
  .object({
    access_token: z.string(),
    nick: z.string().optional(),
    roles: z
      .array(z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX))
      .optional(),
    mute: z.boolean().optional(),
    deaf: z.boolean().optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#add-guild-member-json-params}
 */
export type AddGuildMemberEntity = z.infer<typeof AddGuildMemberSchema>;

export const ModifyGuildMemberSchema = z
  .object({
    nick: z.string().nullable().optional(),
    roles: z
      .array(z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX))
      .optional(),
    mute: z.boolean().optional(),
    deaf: z.boolean().optional(),
    channel_id: z
      .string()
      .regex(SnowflakeManager.SNOWFLAKE_REGEX)
      .nullable()
      .optional(),
    communication_disabled_until: z.string().datetime().optional(),
    flags: z.nativeEnum(GuildMemberFlags).optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-member-json-params}
 */
export type ModifyGuildMemberEntity = z.infer<typeof ModifyGuildMemberSchema>;

export const GetGuildBansQuerySchema = z
  .object({
    limit: z.number().min(1).max(1000).default(1000).optional(),
    before: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
    after: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-bans-query-string-params}
 */
export type GetGuildBansQueryEntity = z.infer<typeof GetGuildBansQuerySchema>;

export const CreateGuildBanSchema = z
  .object({
    /** @deprecated */
    delete_message_days: z.number().min(0).max(7).optional(),
    delete_message_seconds: z.number().min(0).max(604800).optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-ban-json-params}
 */
export type CreateGuildBanEntity = z.infer<typeof CreateGuildBanSchema>;

export const BulkGuildBanSchema = z
  .object({
    user_ids: z
      .array(z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX))
      .max(200),
    delete_message_seconds: z.number().min(0).max(604800).default(0).optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#bulk-guild-ban-json-params}
 */
export type BulkGuildBanEntity = z.infer<typeof BulkGuildBanSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#bulk-guild-ban-bulk-ban-response}
 */
export interface BulkGuildBanResponseEntity {
  banned_users: Snowflake[];
  failed_users: Snowflake[];
}

export const CreateGuildRoleSchema = z
  .object({
    name: z.string().max(100).default("new role"),
    permissions: z.string(),
    color: z.number().int().default(0),
    hoist: z.boolean().default(false),
    icon: z
      .string()
      .regex(/^data:image\/(jpeg|png|gif);base64,/)
      .nullable(),
    unicode_emoji: z.string().emoji().optional(),
    mentionable: z.boolean().default(false),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-role-json-params}
 */
export type CreateGuildRoleEntity = z.infer<typeof CreateGuildRoleSchema>;

export const ModifyGuildRolePositionsSchema = z.array(
  z
    .object({
      id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX),
      position: z.number().int().optional().nullable(),
    })
    .strict(),
);

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role-positions-json-params}
 */
export type ModifyGuildRolePositionsEntity = z.infer<
  typeof ModifyGuildRolePositionsSchema
>;

export const ModifyGuildRoleSchema = CreateGuildRoleSchema.partial().nullable();

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role-json-params}
 */
export type ModifyGuildRoleEntity = z.infer<typeof ModifyGuildRoleSchema>;

export const GetGuildPruneCountQuerySchema = z
  .object({
    days: z.number().min(1).max(30).default(7).optional(),
    include_roles: z.string().optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-prune-count-query-string-params}
 */
export type GetGuildPruneCountQueryEntity = z.infer<
  typeof GetGuildPruneCountQuerySchema
>;

export const BeginGuildPruneSchema = z
  .object({
    days: z.number().min(1).max(30).default(7),
    compute_prune_count: z.boolean().default(true),
    include_roles: z.array(z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX)),
    /** @deprecated */
    reason: z.string().optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#begin-guild-prune-json-params}
 */
export type BeginGuildPruneEntity = z.infer<typeof BeginGuildPruneSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-widget-image-widget-style-options}
 */
export enum WidgetStyleOptions {
  Shield = "shield",
  Banner1 = "banner1",
  Banner2 = "banner2",
  Banner3 = "banner3",
  Banner4 = "banner4",
}

export const ModifyGuildWidgetSettingsSchema = z
  .object({
    enabled: z.boolean(),
    channel_id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).nullable(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-widget-json-params}
 */
export type ModifyGuildWidgetSettingsEntity = z.infer<
  typeof ModifyGuildWidgetSettingsSchema
>;

const WelcomeScreenChannelSchema = z
  .object({
    channel_id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX),
    description: z.string(),
    emoji_id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).nullable(),
    emoji_name: z.string().nullable(),
  })
  .strict();

export const ModifyGuildWelcomeScreenSchema = z
  .object({
    enabled: z.boolean().optional().nullable(),
    welcome_channels: z.array(WelcomeScreenChannelSchema).optional().nullable(),
    description: z.string().optional().nullable(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-welcome-screen-json-params}
 */
export type ModifyGuildWelcomeScreenEntity = z.infer<
  typeof ModifyGuildWelcomeScreenSchema
>;

const OnboardingPromptOptionSchema = z
  .object({
    id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX),
    channel_ids: z.array(z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX)),
    role_ids: z.array(z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX)),
    emoji_id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).nullable(),
    emoji_name: z.string().nullable(),
    emoji_animated: z.boolean().optional(),
    title: z.string(),
    description: z.string().nullable(),
  })
  .strict();

const OnboardingPromptSchema = z
  .object({
    id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX),
    type: z.nativeEnum(GuildOnboardingPromptType),
    options: z.array(OnboardingPromptOptionSchema),
    title: z.string(),
    single_select: z.boolean(),
    required: z.boolean(),
    in_onboarding: z.boolean(),
  })
  .strict();

export const ModifyGuildOnboardingSchema = z
  .object({
    prompts: z.array(OnboardingPromptSchema),
    default_channel_ids: z.array(
      z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX),
    ),
    enabled: z.boolean(),
    mode: z.nativeEnum(GuildOnboardingMode),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-onboarding}
 */
export type ModifyGuildOnboardingEntity = z.infer<
  typeof ModifyGuildOnboardingSchema
>;
