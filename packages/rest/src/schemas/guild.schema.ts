import {
  type AnyThreadChannelEntity,
  ChannelEntity,
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

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-json-params}
 */
export const CreateGuildEntity = z
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
    roles: z.array(RoleEntity).optional(),
    channels: z.array(ChannelEntity.partial()).optional(),
    afk_channel_id: Snowflake.optional(),
    afk_timeout: z.number().optional(),
    system_channel_id: Snowflake.optional(),
    system_channel_flags: z.nativeEnum(SystemChannelFlags).optional(),
  })
  .strict();

export type CreateGuildEntity = z.infer<typeof CreateGuildEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-json-params}
 */
export const ModifyGuildEntity = z
  .object({
    name: z.string().min(2).max(100).optional(),
    /** @deprecated */
    region: z.string().nullish(),
    verification_level: z.nativeEnum(VerificationLevel).nullish(),
    default_message_notifications: z
      .nativeEnum(DefaultMessageNotificationLevel)
      .nullish(),
    explicit_content_filter: z.nativeEnum(ExplicitContentFilterLevel).nullish(),
    afk_channel_id: Snowflake.nullish(),
    afk_timeout: z.number().optional(),
    icon: z
      .string()
      .regex(/^data:image\/(jpeg|png|gif);base64,/)
      .nullish(),
    owner_id: Snowflake.optional(),
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
    system_channel_id: Snowflake.nullish(),
    system_channel_flags: z.nativeEnum(SystemChannelFlags).optional(),
    rules_channel_id: Snowflake.nullish(),
    public_updates_channel_id: Snowflake.nullish(),
    preferred_locale: z.string().optional(),
    features: z.array(z.nativeEnum(GuildFeature)).optional(),
    description: z.string().nullish(),
    premium_progress_bar_enabled: z.boolean().optional(),
    safety_alerts_channel_id: Snowflake.nullish(),
  })
  .strict();

export type ModifyGuildEntity = z.infer<typeof ModifyGuildEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-channel-json-params}
 */
export const CreateGuildChannelEntity = ChannelEntity;

export type CreateGuildChannelEntity = z.infer<typeof CreateGuildChannelEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-channel-positions}
 */
export const ModifyGuildChannelPositionsEntity = z.array(
  z
    .object({
      id: Snowflake,
      position: z.number().nullish(),
      lock_permissions: z.boolean().optional(),
      parent_id: Snowflake.nullish(),
    })
    .strict(),
);

export type ModifyGuildChannelPositionsEntity = z.infer<
  typeof ModifyGuildChannelPositionsEntity
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
export const ListGuildMembersQueryEntity = z
  .object({
    limit: z.number().min(1).max(1000).optional().default(1),
    after: Snowflake.optional(),
  })
  .strict();

export type ListGuildMembersQueryEntity = z.infer<
  typeof ListGuildMembersQueryEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#search-guild-members-query-string-params}
 */
export const SearchGuildMembersQueryEntity = z
  .object({
    query: z.string(),
    limit: z.number().min(1).max(1000).optional().default(1),
  })
  .strict();

export type SearchGuildMembersQueryEntity = z.infer<
  typeof SearchGuildMembersQueryEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#add-guild-member-json-params}
 */
export const AddGuildMemberEntity = z
  .object({
    access_token: z.string(),
    nick: z.string().optional(),
    roles: z.array(Snowflake).optional(),
    mute: z.boolean().optional(),
    deaf: z.boolean().optional(),
  })
  .strict();

export type AddGuildMemberEntity = z.infer<typeof AddGuildMemberEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-member-json-params}
 */
export const ModifyGuildMemberEntity = z
  .object({
    nick: z.string().nullish(),
    roles: z.array(Snowflake).optional(),
    mute: z.boolean().optional(),
    deaf: z.boolean().optional(),
    channel_id: Snowflake.nullish(),
    communication_disabled_until: z.string().datetime().optional(),
    flags: z.nativeEnum(GuildMemberFlags).optional(),
  })
  .strict();

export type ModifyGuildMemberEntity = z.infer<typeof ModifyGuildMemberEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-bans-query-string-params}
 */
export const GetGuildBansQueryEntity = z
  .object({
    limit: z.number().min(1).max(1000).optional().default(1000),
    before: Snowflake.optional(),
    after: Snowflake.optional(),
  })
  .strict();

export type GetGuildBansQueryEntity = z.infer<typeof GetGuildBansQueryEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-ban-json-params}
 */
export const CreateGuildBanEntity = z
  .object({
    /** @deprecated */
    delete_message_days: z.number().min(0).max(7).optional(),
    delete_message_seconds: z.number().min(0).max(604800).optional(),
  })
  .strict();

export type CreateGuildBanEntity = z.infer<typeof CreateGuildBanEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#bulk-guild-ban-json-params}
 */
export const BulkGuildBanEntity = z
  .object({
    user_ids: z.array(Snowflake).max(200),
    delete_message_seconds: z.number().min(0).max(604800).optional().default(0),
  })
  .strict();

export type BulkGuildBanEntity = z.infer<typeof BulkGuildBanEntity>;

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
export const CreateGuildRoleEntity = z
  .object({
    name: z.string().max(100).optional().default("new role"),
    permissions: z.string(),
    color: z.number().int().optional().default(0),
    hoist: z.boolean().optional().default(false),
    icon: z
      .string()
      .regex(/^data:image\/(jpeg|png|gif);base64,/)
      .nullable(),
    unicode_emoji: z.string().emoji().optional(),
    mentionable: z.boolean().optional().default(false),
  })
  .strict();

export type CreateGuildRoleEntity = z.infer<typeof CreateGuildRoleEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role-positions-json-params}
 */
export const ModifyGuildRolePositionsEntity = z.array(
  z
    .object({
      id: Snowflake,
      position: z.number().int().nullish(),
    })
    .strict(),
);

export type ModifyGuildRolePositionsEntity = z.infer<
  typeof ModifyGuildRolePositionsEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role-json-params}
 */
export const ModifyGuildRoleEntity = CreateGuildRoleEntity.partial().nullable();

export type ModifyGuildRoleEntity = z.infer<typeof ModifyGuildRoleEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-prune-count-query-string-params}
 */
export const GetGuildPruneCountQueryEntity = z
  .object({
    days: z.number().min(1).max(30).optional().default(7),
    include_roles: z.string().optional(),
  })
  .strict();

export type GetGuildPruneCountQueryEntity = z.infer<
  typeof GetGuildPruneCountQueryEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#begin-guild-prune-json-params}
 */
export const BeginGuildPruneEntity = z
  .object({
    days: z.number().min(1).max(30).optional().default(7),
    compute_prune_count: z.boolean().optional().default(true),
    include_roles: z.array(Snowflake),
    /** @deprecated */
    reason: z.string().optional(),
  })
  .strict();

export type BeginGuildPruneEntity = z.infer<typeof BeginGuildPruneEntity>;

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
export const ModifyGuildWidgetSettingsEntity = z
  .object({
    enabled: z.boolean(),
    channel_id: Snowflake.nullable(),
  })
  .strict();

export type ModifyGuildWidgetSettingsEntity = z.infer<
  typeof ModifyGuildWidgetSettingsEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-welcome-screen-json-params}
 */
export const ModifyGuildWelcomeScreenEntity = z
  .object({
    enabled: z.boolean().nullish(),
    welcome_channels: z.array(WelcomeScreenChannelEntity).nullish(),
    description: z.string().nullish(),
  })
  .strict();

export type ModifyGuildWelcomeScreenEntity = z.infer<
  typeof ModifyGuildWelcomeScreenEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-onboarding}
 */
export const ModifyGuildOnboardingEntity = z
  .object({
    prompts: z.array(GuildOnboardingPromptEntity),
    default_channel_ids: z.array(Snowflake),
    enabled: z.boolean(),
    mode: z.nativeEnum(GuildOnboardingMode),
  })
  .strict();

export type ModifyGuildOnboardingEntity = z.infer<
  typeof ModifyGuildOnboardingEntity
>;
