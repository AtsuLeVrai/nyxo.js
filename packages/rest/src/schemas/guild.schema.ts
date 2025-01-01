import {
  type AnyThreadChannelEntity,
  ChannelSchema,
  DefaultMessageNotificationLevel,
  ExplicitContentFilterLevel,
  GuildFeature,
  GuildMemberFlags,
  GuildOnboardingMode,
  GuildOnboardingPromptSchema,
  RoleSchema,
  type Snowflake,
  SnowflakeSchema,
  SystemChannelFlags,
  type ThreadMemberEntity,
  VerificationLevel,
  WelcomeScreenChannelSchema,
} from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-json-params}
 */
export const CreateGuildSchema = z
  .object({
    name: z.string().min(2).max(100),
    region: z.string().nullish(),
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
    afk_channel_id: SnowflakeSchema.optional(),
    afk_timeout: z.number().optional(),
    system_channel_id: SnowflakeSchema.optional(),
    system_channel_flags: z.nativeEnum(SystemChannelFlags).optional(),
  })
  .strict();

export type CreateGuildEntity = z.infer<typeof CreateGuildSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-json-params}
 */
export const ModifyGuildSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    /** @deprecated */
    region: z.string().nullish(),
    verification_level: z.nativeEnum(VerificationLevel).nullish(),
    default_message_notifications: z
      .nativeEnum(DefaultMessageNotificationLevel)
      .nullish(),
    explicit_content_filter: z.nativeEnum(ExplicitContentFilterLevel).nullish(),
    afk_channel_id: SnowflakeSchema.nullish(),
    afk_timeout: z.number().optional(),
    icon: z
      .string()
      .regex(/^data:image\/(jpeg|png|gif);base64,/)
      .nullish(),
    owner_id: SnowflakeSchema.optional(),
    splash: z
      .string()
      .regex(/^data:image\/(jpeg|png|gif);base64,/)
      .nullish(),
    discovery_splash: z
      .string()
      .regex(/^data:image\/(jpeg|png|gif);base64,/)
      .nullish(),
    banner: z
      .string()
      .regex(/^data:image\/(jpeg|png|gif);base64,/)
      .nullish(),
    system_channel_id: SnowflakeSchema.nullish(),
    system_channel_flags: z.nativeEnum(SystemChannelFlags).optional(),
    rules_channel_id: SnowflakeSchema.nullish(),
    public_updates_channel_id: SnowflakeSchema.nullish(),
    preferred_locale: z.string().optional(),
    features: z.array(z.nativeEnum(GuildFeature)).optional(),
    description: z.string().nullish(),
    premium_progress_bar_enabled: z.boolean().optional(),
    safety_alerts_channel_id: SnowflakeSchema.nullish(),
  })
  .strict();

export type ModifyGuildEntity = z.infer<typeof ModifyGuildSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-channel-json-params}
 */
export const CreateGuildChannelSchema = ChannelSchema;

export type CreateGuildChannelEntity = z.infer<typeof CreateGuildChannelSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-channel-positions}
 */
export const ModifyGuildChannelPositionsSchema = z.array(
  z
    .object({
      id: SnowflakeSchema,
      position: z.number().nullish(),
      lock_permissions: z.boolean().optional(),
      parent_id: SnowflakeSchema.nullish(),
    })
    .strict(),
);

export type ModifyGuildChannelPositionsEntity = z.infer<
  typeof ModifyGuildChannelPositionsSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#list-active-guild-threads-response-body}
 */
export interface ListActiveGuildThreadsEntity {
  threads: AnyThreadChannelEntity[];
  members: ThreadMemberEntity[];
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#list-guild-members-query-string-params}
 */
export const ListGuildMembersQuerySchema = z
  .object({
    limit: z.number().min(1).max(1000).default(1).optional(),
    after: SnowflakeSchema.optional(),
  })
  .strict();

export type ListGuildMembersQueryEntity = z.infer<
  typeof ListGuildMembersQuerySchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#search-guild-members-query-string-params}
 */
export const SearchGuildMembersQuerySchema = z
  .object({
    query: z.string(),
    limit: z.number().min(1).max(1000).default(1).optional(),
  })
  .strict();

export type SearchGuildMembersQueryEntity = z.infer<
  typeof SearchGuildMembersQuerySchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#add-guild-member-json-params}
 */
export const AddGuildMemberSchema = z
  .object({
    access_token: z.string(),
    nick: z.string().optional(),
    roles: z.array(SnowflakeSchema).optional(),
    mute: z.boolean().optional(),
    deaf: z.boolean().optional(),
  })
  .strict();

export type AddGuildMemberEntity = z.infer<typeof AddGuildMemberSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-member-json-params}
 */
export const ModifyGuildMemberSchema = z
  .object({
    nick: z.string().nullish(),
    roles: z.array(SnowflakeSchema).optional(),
    mute: z.boolean().optional(),
    deaf: z.boolean().optional(),
    channel_id: SnowflakeSchema.nullish(),
    communication_disabled_until: z.string().datetime().optional(),
    flags: z.nativeEnum(GuildMemberFlags).optional(),
  })
  .strict();

export type ModifyGuildMemberEntity = z.infer<typeof ModifyGuildMemberSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-bans-query-string-params}
 */
export const GetGuildBansQuerySchema = z
  .object({
    limit: z.number().min(1).max(1000).default(1000).optional(),
    before: SnowflakeSchema.optional(),
    after: SnowflakeSchema.optional(),
  })
  .strict();

export type GetGuildBansQueryEntity = z.infer<typeof GetGuildBansQuerySchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-ban-json-params}
 */
export const CreateGuildBanSchema = z
  .object({
    /** @deprecated */
    delete_message_days: z.number().min(0).max(7).optional(),
    delete_message_seconds: z.number().min(0).max(604800).optional(),
  })
  .strict();

export type CreateGuildBanEntity = z.infer<typeof CreateGuildBanSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#bulk-guild-ban-json-params}
 */
export const BulkGuildBanSchema = z
  .object({
    user_ids: z.array(SnowflakeSchema).max(200),
    delete_message_seconds: z.number().min(0).max(604800).default(0).optional(),
  })
  .strict();

export type BulkGuildBanEntity = z.infer<typeof BulkGuildBanSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#bulk-guild-ban-bulk-ban-response}
 */
export interface BulkGuildBanResponseEntity {
  banned_users: Snowflake[];
  failed_users: Snowflake[];
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-role-json-params}
 */
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

export type CreateGuildRoleEntity = z.infer<typeof CreateGuildRoleSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role-positions-json-params}
 */
export const ModifyGuildRolePositionsSchema = z.array(
  z
    .object({
      id: SnowflakeSchema,
      position: z.number().int().nullish(),
    })
    .strict(),
);

export type ModifyGuildRolePositionsEntity = z.infer<
  typeof ModifyGuildRolePositionsSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role-json-params}
 */
export const ModifyGuildRoleSchema = CreateGuildRoleSchema.partial().nullable();

export type ModifyGuildRoleEntity = z.infer<typeof ModifyGuildRoleSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-prune-count-query-string-params}
 */
export const GetGuildPruneCountQuerySchema = z
  .object({
    days: z.number().min(1).max(30).default(7).optional(),
    include_roles: z.string().optional(),
  })
  .strict();

export type GetGuildPruneCountQueryEntity = z.infer<
  typeof GetGuildPruneCountQuerySchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#begin-guild-prune-json-params}
 */
export const BeginGuildPruneSchema = z
  .object({
    days: z.number().min(1).max(30).default(7),
    compute_prune_count: z.boolean().default(true),
    include_roles: z.array(SnowflakeSchema),
    /** @deprecated */
    reason: z.string().optional(),
  })
  .strict();

export type BeginGuildPruneEntity = z.infer<typeof BeginGuildPruneSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-widget-image-widget-style-options}
 */
export type WidgetStyleOptions =
  | "shield"
  | "banner1"
  | "banner2"
  | "banner3"
  | "banner4";

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-widget-json-params}
 */
export const ModifyGuildWidgetSettingsSchema = z
  .object({
    enabled: z.boolean(),
    channel_id: SnowflakeSchema.nullable(),
  })
  .strict();

export type ModifyGuildWidgetSettingsEntity = z.infer<
  typeof ModifyGuildWidgetSettingsSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-welcome-screen-json-params}
 */
export const ModifyGuildWelcomeScreenSchema = z
  .object({
    enabled: z.boolean().nullish(),
    welcome_channels: z.array(WelcomeScreenChannelSchema).nullish(),
    description: z.string().nullish(),
  })
  .strict();

export type ModifyGuildWelcomeScreenEntity = z.infer<
  typeof ModifyGuildWelcomeScreenSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-onboarding}
 */
export const ModifyGuildOnboardingSchema = z
  .object({
    prompts: z.array(GuildOnboardingPromptSchema),
    default_channel_ids: z.array(SnowflakeSchema),
    enabled: z.boolean(),
    mode: z.nativeEnum(GuildOnboardingMode),
  })
  .strict();

export type ModifyGuildOnboardingEntity = z.infer<
  typeof ModifyGuildOnboardingSchema
>;
