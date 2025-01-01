import { z } from "zod";
import { LocaleKeySchema, OAuth2Scope } from "../enums/index.js";
import { SnowflakeSchema } from "../managers/index.js";
import {
  GuildStageVoiceChannelSchema,
  GuildVoiceChannelSchema,
} from "./channel.entity.js";
import { EmojiSchema } from "./emoji.entity.js";
import { RoleSchema } from "./role.entity.js";
import { StickerSchema } from "./sticker.entity.js";
import { AvatarDecorationDataSchema, UserSchema } from "./user.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-prompt-types}
 */
export const GuildOnboardingPromptType = {
  multipleChoice: 0,
  dropdown: 1,
} as const;

export type GuildOnboardingPromptType =
  (typeof GuildOnboardingPromptType)[keyof typeof GuildOnboardingPromptType];

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-onboarding-mode}
 */
export const GuildOnboardingMode = {
  default: 0,
  advanced: 1,
} as const;

export type GuildOnboardingMode =
  (typeof GuildOnboardingMode)[keyof typeof GuildOnboardingMode];

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-prompt-option-structure}
 */
export const GuildOnboardingPromptOptionSchema = z
  .object({
    id: SnowflakeSchema,
    channel_ids: z.array(SnowflakeSchema),
    role_ids: z.array(SnowflakeSchema),
    emoji: EmojiSchema.optional(),
    emoji_id: SnowflakeSchema.optional(),
    emoji_name: z.string().optional(),
    emoji_animated: z.boolean().optional(),
    title: z.string(),
    description: z.string().nullable(),
  })
  .strict();

export type GuildOnboardingPromptOptionEntity = z.infer<
  typeof GuildOnboardingPromptOptionSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-onboarding-prompt-structure}
 */
export const GuildOnboardingPromptSchema = z
  .object({
    id: SnowflakeSchema,
    type: z.nativeEnum(GuildOnboardingPromptType),
    options: z.array(GuildOnboardingPromptOptionSchema),
    title: z.string(),
    single_select: z.boolean(),
    required: z.boolean(),
    in_onboarding: z.boolean(),
  })
  .strict();

export type GuildOnboardingPromptEntity = z.infer<
  typeof GuildOnboardingPromptSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-guild-onboarding-structure}
 */
export const GuildOnboardingSchema = z
  .object({
    guild_id: SnowflakeSchema,
    prompts: z.array(GuildOnboardingPromptSchema),
    default_channel_ids: z.array(SnowflakeSchema),
    enabled: z.boolean(),
    mode: z.nativeEnum(GuildOnboardingMode),
  })
  .strict();

export type GuildOnboardingEntity = z.infer<typeof GuildOnboardingSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#welcome-screen-object-welcome-screen-channel-structure}
 */
export const WelcomeScreenChannelSchema = z
  .object({
    channel_id: SnowflakeSchema,
    description: z.string(),
    emoji_id: SnowflakeSchema.nullable(),
    emoji_name: z.string().nullable(),
  })
  .strict();

export type WelcomeScreenChannelEntity = z.infer<
  typeof WelcomeScreenChannelSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#welcome-screen-object-welcome-screen-structure}
 */
export const WelcomeScreenSchema = z
  .object({
    description: z.string().nullable(),
    welcome_channels: z.array(WelcomeScreenChannelSchema),
  })
  .strict();

export type WelcomeScreenEntity = z.infer<typeof WelcomeScreenSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#ban-object-ban-structure}
 */
export const BanSchema = z
  .object({
    reason: z.string().nullable(),
    user: UserSchema,
  })
  .strict();

export type BanEntity = z.infer<typeof BanSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#integration-application-object-integration-application-structure}
 */
export const IntegrationApplicationSchema = z
  .object({
    id: SnowflakeSchema,
    name: z.string(),
    icon: z.string().nullable(),
    description: z.string(),
    bot: UserSchema.optional(),
  })
  .strict();

export type IntegrationApplicationEntity = z.infer<
  typeof IntegrationApplicationSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#integration-account-object-integration-account-structure}
 */
export const IntegrationAccountSchema = z
  .object({
    id: z.string(),
    name: z.string(),
  })
  .strict();

export type IntegrationAccountEntity = z.infer<typeof IntegrationAccountSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#integration-object-integration-expire-behaviors}
 */
export const IntegrationExpirationBehavior = {
  removeRole: 0,
  kick: 1,
} as const;

export type IntegrationExpirationBehavior =
  (typeof IntegrationExpirationBehavior)[keyof typeof IntegrationExpirationBehavior];

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#integration-object-integration-structure}
 */
export const IntegrationSchema = z
  .object({
    id: SnowflakeSchema,
    name: z.string(),
    type: z.union([
      z.literal("twitch"),
      z.literal("youtube"),
      z.literal("discord"),
      z.literal("guild_subscription"),
    ]),
    enabled: z.boolean(),
    syncing: z.boolean().optional(),
    role_id: SnowflakeSchema.optional(),
    enable_emoticons: z.boolean().optional(),
    expire_behavior: z.nativeEnum(IntegrationExpirationBehavior).optional(),
    expire_grace_period: z.number().int().optional(),
    user: UserSchema.optional(),
    account: IntegrationAccountSchema,
    synced_at: z.string().datetime().optional(),
    subscriber_count: z.number().int().optional(),
    revoked: z.boolean().optional(),
    application: IntegrationApplicationSchema.optional(),
    scopes: z.nativeEnum(OAuth2Scope).optional(),
  })
  .strict();

export type IntegrationEntity = z.infer<typeof IntegrationSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-member-object-guild-member-flags}
 */
export const GuildMemberFlags = {
  didRejoin: 1 << 0,
  completedOnboarding: 1 << 1,
  bypassesVerification: 1 << 2,
  startedOnboarding: 1 << 3,
  isGuest: 1 << 4,
  startedHomeActions: 1 << 5,
  completedHomeActions: 1 << 6,
  autoModQuarantinedUsername: 1 << 7,
  dmSettingsUpsellAcknowledged: 1 << 9,
} as const;

export type GuildMemberFlags =
  (typeof GuildMemberFlags)[keyof typeof GuildMemberFlags];

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-member-object-guild-member-structure}
 */
export const GuildMemberSchema = z
  .object({
    user: UserSchema,
    nick: z.string().nullish(),
    avatar: z.string().nullish(),
    banner: z.string().nullish(),
    roles: z.array(SnowflakeSchema),
    joined_at: z.string().datetime(),
    premium_since: z.string().datetime().nullish(),
    deaf: z.boolean(),
    mute: z.boolean(),
    flags: z.nativeEnum(GuildMemberFlags),
    pending: z.boolean().optional(),
    permissions: z.string().optional(),
    communication_disabled_until: z.string().datetime().nullish(),
    avatar_decoration_data: AvatarDecorationDataSchema.nullish(),
  })
  .strict();

export type GuildMemberEntity = z.infer<typeof GuildMemberSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-widget-settings-object-guild-widget-settings-structure}
 */
export const GuildWidgetSettingsSchema = z
  .object({
    enabled: z.boolean(),
    channel_id: SnowflakeSchema.nullable(),
  })
  .strict();

export type GuildWidgetSettingsEntity = z.infer<
  typeof GuildWidgetSettingsSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-widget-object-guild-widget-structure}
 */
export const GuildWidgetSchema = z
  .object({
    id: SnowflakeSchema,
    name: z.string(),
    instant_invite: z.string().nullable(),
    channels: z.array(
      z.union([
        z.lazy(() => GuildVoiceChannelSchema.partial()),
        z.lazy(() => GuildStageVoiceChannelSchema.partial()),
      ]),
    ),
    members: z.array(UserSchema),
    presence_count: z.number().int(),
  })
  .strict();

export type GuildWidgetEntity = z.infer<typeof GuildWidgetSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-guild-features}
 */
export const GuildFeature = {
  animatedBanner: "ANIMATED_BANNER",
  animatedIcon: "ANIMATED_ICON",
  applicationCommandPermissionsV2: "APPLICATION_COMMAND_PERMISSIONS_V2",
  autoModeration: "AUTO_MODERATION",
  banner: "BANNER",
  community: "COMMUNITY",
  creatorMonetizableProvisional: "CREATOR_MONETIZABLE_PROVISIONAL",
  creatorStorePage: "CREATOR_STORE_PAGE",
  developerSupportServer: "DEVELOPER_SUPPORT_SERVER",
  discoverable: "DISCOVERABLE",
  featurable: "FEATURABLE",
  invitesDisabled: "INVITES_DISABLED",
  inviteSplash: "INVITE_SPLASH",
  memberVerificationGateEnabled: "MEMBER_VERIFICATION_GATE_ENABLED",
  moreSoundboard: "MORE_SOUNDBOARD",
  moreStickers: "MORE_STICKERS",
  news: "NEWS",
  partnered: "PARTNERED",
  previewEnabled: "PREVIEW_ENABLED",
  raidAlertsDisabled: "RAID_ALERTS_DISABLED",
  roleIcons: "ROLE_ICONS",
  roleSubscriptionsAvailableForPurchase:
    "ROLE_SUBSCRIPTIONS_AVAILABLE_FOR_PURCHASE",
  roleSubscriptionsEnabled: "ROLE_SUBSCRIPTIONS_ENABLED",
  soundboard: "SOUNDBOARD",
  ticketedEventsEnabled: "TICKETED_EVENTS_ENABLED",
  vanityUrl: "VANITY_URL",
  verified: "VERIFIED",
  vipRegions: "VIP_REGIONS",
  welcomeScreenEnabled: "WELCOME_SCREEN_ENABLED",
} as const;

export type GuildFeature = (typeof GuildFeature)[keyof typeof GuildFeature];

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-preview-object-guild-preview-structure}
 */
export const GuildPreviewSchema = z
  .object({
    id: SnowflakeSchema,
    name: z.string(),
    icon: z.string().nullable(),
    splash: z.string().nullable(),
    discovery_splash: z.string().nullable(),
    emojis: z.array(EmojiSchema),
    features: z.array(z.nativeEnum(GuildFeature)),
    approximate_member_count: z.number().int(),
    approximate_presence_count: z.number().int(),
    description: z.string().nullable(),
    stickers: z.array(StickerSchema),
  })
  .strict();

export type GuildPreviewEntity = z.infer<typeof GuildPreviewSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#unavailable-guild-object}
 */
export const UnavailableGuildSchema = z
  .object({
    id: SnowflakeSchema,
    unavailable: z.literal(true),
  })
  .strict();

export type UnavailableGuildEntity = z.infer<typeof UnavailableGuildSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-system-channel-flags}
 */
export const SystemChannelFlags = {
  suppressJoinNotifications: 1 << 0,
  suppressPremiumSubscriptions: 1 << 1,
  suppressGuildReminderNotifications: 1 << 2,
  suppressJoinNotificationReplies: 1 << 3,
  suppressRoleSubscriptionPurchaseNotifications: 1 << 4,
  suppressRoleSubscriptionPurchaseNotificationReplies: 1 << 5,
} as const;

export type SystemChannelFlags =
  (typeof SystemChannelFlags)[keyof typeof SystemChannelFlags];

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-premium-tier}
 */
export const PremiumTier = {
  none: 0,
  tier1: 1,
  tier2: 2,
  tier3: 3,
} as const;

export type PremiumTier = (typeof PremiumTier)[keyof typeof PremiumTier];

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-guild-nsfw-level}
 */
export const NsfwLevel = {
  default: 0,
  explicit: 1,
  safe: 2,
  ageRestricted: 3,
} as const;

export type NsfwLevel = (typeof NsfwLevel)[keyof typeof NsfwLevel];

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-verification-level}
 */
export const VerificationLevel = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
  veryHigh: 4,
} as const;

export type VerificationLevel =
  (typeof VerificationLevel)[keyof typeof VerificationLevel];

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-mfa-level}
 */
export const MfaLevel = {
  none: 0,
  elevated: 1,
} as const;

export type MfaLevel = (typeof MfaLevel)[keyof typeof MfaLevel];

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-explicit-content-filter-level}
 */
export const ExplicitContentFilterLevel = {
  disabled: 0,
  membersWithoutRoles: 1,
  allMembers: 2,
} as const;

export type ExplicitContentFilterLevel =
  (typeof ExplicitContentFilterLevel)[keyof typeof ExplicitContentFilterLevel];

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-default-message-notification-level}
 */
export const DefaultMessageNotificationLevel = {
  allMessages: 0,
  onlyMentions: 1,
} as const;

export type DefaultMessageNotificationLevel =
  (typeof DefaultMessageNotificationLevel)[keyof typeof DefaultMessageNotificationLevel];

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-guild-structure}
 */
export const GuildSchema = z
  .object({
    id: SnowflakeSchema,
    name: z.string(),
    icon: z.string().nullable(),
    icon_hash: z.string().nullish(),
    splash: z.string().nullable(),
    discovery_splash: z.string().nullable(),
    owner: z.boolean().optional(),
    owner_id: SnowflakeSchema,
    permissions: z.string().optional(),
    /** @deprecated Voice region id for the guild (deprecated) */
    region: z.string().nullish(),
    afk_channel_id: SnowflakeSchema.nullable(),
    afk_timeout: z.number().int(),
    widget_enabled: z.boolean().optional(),
    widget_channel_id: z.string().nullish(),
    verification_level: z.nativeEnum(VerificationLevel),
    default_message_notifications: z.nativeEnum(
      DefaultMessageNotificationLevel,
    ),
    explicit_content_filter: z.nativeEnum(ExplicitContentFilterLevel),
    roles: z.array(RoleSchema),
    emojis: z.array(EmojiSchema),
    features: z.array(z.nativeEnum(GuildFeature)),
    mfa_level: z.nativeEnum(MfaLevel),
    application_id: SnowflakeSchema.optional(),
    system_channel_id: SnowflakeSchema.nullable(),
    system_channel_flags: z.nativeEnum(SystemChannelFlags),
    rules_channel_id: SnowflakeSchema.nullable(),
    max_presences: z.number().int().nullish(),
    max_members: z.number().int(),
    vanity_url_code: z.string().nullable(),
    description: z.string().nullable(),
    banner: z.string().nullable(),
    premium_tier: z.nativeEnum(PremiumTier),
    premium_subscription_count: z.number().int().optional(),
    preferred_locale: LocaleKeySchema,
    public_updates_channel_id: SnowflakeSchema.nullable(),
    max_video_channel_users: z.number().int().optional(),
    max_stage_video_channel_users: z.number().int().optional(),
    approximate_member_count: z.number().int().optional(),
    approximate_presence_count: z.number().int().optional(),
    welcome_screen: WelcomeScreenSchema.optional(),
    nsfw_level: z.nativeEnum(NsfwLevel),
    stickers: z.array(StickerSchema).optional(),
    premium_progress_bar_enabled: z.boolean(),
    safety_alerts_channel_id: SnowflakeSchema.nullable(),
  })
  .strict();

export type GuildEntity = z.infer<typeof GuildSchema>;
