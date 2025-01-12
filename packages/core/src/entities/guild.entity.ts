import { z } from "zod";
import { LocaleKey, OAuth2Scope } from "../enums/index.js";
import { Snowflake } from "../managers/index.js";
import {
  GuildStageVoiceChannelEntity,
  GuildVoiceChannelEntity,
} from "./channel.entity.js";
import { EmojiEntity } from "./emoji.entity.js";
import { RoleEntity } from "./role.entity.js";
import { StickerEntity } from "./sticker.entity.js";
import { AvatarDecorationDataEntity, UserEntity } from "./user.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-prompt-types}
 */
export enum GuildOnboardingPromptType {
  MultipleChoice = 0,
  Dropdown = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-onboarding-mode}
 */
export enum GuildOnboardingMode {
  Default = 0,
  Advanced = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-prompt-option-structure}
 */
export const GuildOnboardingPromptOptionEntity = z.object({
  id: Snowflake,
  channel_ids: z.array(Snowflake),
  role_ids: z.array(Snowflake),
  emoji: z.lazy(() => EmojiEntity).optional(),
  emoji_id: Snowflake.optional(),
  emoji_name: z.string().optional(),
  emoji_animated: z.boolean().optional(),
  title: z.string(),
  description: z.string().nullable(),
});

export type GuildOnboardingPromptOptionEntity = z.infer<
  typeof GuildOnboardingPromptOptionEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-onboarding-prompt-structure}
 */
export const GuildOnboardingPromptEntity = z.object({
  id: Snowflake,
  type: z.nativeEnum(GuildOnboardingPromptType),
  options: z.array(GuildOnboardingPromptOptionEntity),
  title: z.string(),
  single_select: z.boolean(),
  required: z.boolean(),
  in_onboarding: z.boolean(),
});

export type GuildOnboardingPromptEntity = z.infer<
  typeof GuildOnboardingPromptEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-guild-onboarding-structure}
 */
export const GuildOnboardingEntity = z.object({
  guild_id: Snowflake,
  prompts: z.array(GuildOnboardingPromptEntity),
  default_channel_ids: z.array(Snowflake),
  enabled: z.boolean(),
  mode: z.nativeEnum(GuildOnboardingMode),
});

export type GuildOnboardingEntity = z.infer<typeof GuildOnboardingEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#welcome-screen-object-welcome-screen-channel-structure}
 */
export const WelcomeScreenChannelEntity = z.object({
  channel_id: Snowflake,
  description: z.string(),
  emoji_id: Snowflake.nullable(),
  emoji_name: z.string().nullable(),
});

export type WelcomeScreenChannelEntity = z.infer<
  typeof WelcomeScreenChannelEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#welcome-screen-object-welcome-screen-structure}
 */
export const WelcomeScreenEntity = z.object({
  description: z.string().nullable(),
  welcome_channels: z.array(WelcomeScreenChannelEntity),
});

export type WelcomeScreenEntity = z.infer<typeof WelcomeScreenEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#ban-object-ban-structure}
 */
export const BanEntity = z.object({
  reason: z.string().nullable(),
  user: z.lazy(() => UserEntity),
});

export type BanEntity = z.infer<typeof BanEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#integration-application-object-integration-application-structure}
 */
export const IntegrationApplicationEntity = z.object({
  id: Snowflake,
  name: z.string(),
  icon: z.string().nullable(),
  description: z.string(),
  bot: z.lazy(() => UserEntity).optional(),
});

export type IntegrationApplicationEntity = z.infer<
  typeof IntegrationApplicationEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#integration-account-object-integration-account-structure}
 */
export const IntegrationAccountEntity = z.object({
  id: z.string(),
  name: z.string(),
});

export type IntegrationAccountEntity = z.infer<typeof IntegrationAccountEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#integration-object-integration-expire-behaviors}
 */
export enum IntegrationExpirationBehavior {
  RemoveRole = 0,
  Kick = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#integration-object-integration-structure}
 */
export const IntegrationEntity = z.object({
  id: Snowflake,
  name: z.string(),
  type: z.union([
    z.literal("twitch"),
    z.literal("youtube"),
    z.literal("discord"),
    z.literal("guild_subscription"),
  ]),
  enabled: z.boolean(),
  syncing: z.boolean().optional(),
  role_id: Snowflake.optional(),
  enable_emoticons: z.boolean().optional(),
  expire_behavior: z.nativeEnum(IntegrationExpirationBehavior).optional(),
  expire_grace_period: z.number().int().optional(),
  user: z.lazy(() => UserEntity).optional(),
  account: IntegrationAccountEntity,
  synced_at: z.string().datetime().optional(),
  subscriber_count: z.number().int().optional(),
  revoked: z.boolean().optional(),
  application: IntegrationApplicationEntity.optional(),
  scopes: z.nativeEnum(OAuth2Scope).optional(),
});

export type IntegrationEntity = z.infer<typeof IntegrationEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-member-object-guild-member-flags}
 */
export enum GuildMemberFlags {
  DidRejoin = 1 << 0,
  CompletedOnboarding = 1 << 1,
  BypassesVerification = 1 << 2,
  StartedOnboarding = 1 << 3,
  IsGuest = 1 << 4,
  StartedHomeActions = 1 << 5,
  CompletedHomeActions = 1 << 6,
  AutoModQuarantinedUsername = 1 << 7,
  DmSettingsUpsellAcknowledged = 1 << 9,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-member-object-guild-member-structure}
 */
export const GuildMemberEntity = z.object({
  user: z.lazy(() => UserEntity),
  nick: z.string().nullish(),
  avatar: z.string().nullish(),
  banner: z.string().nullish(),
  roles: z.array(Snowflake),
  joined_at: z.string().datetime(),
  premium_since: z.string().datetime().nullish(),
  deaf: z.boolean(),
  mute: z.boolean(),
  flags: z.nativeEnum(GuildMemberFlags),
  pending: z.boolean().optional(),
  permissions: z.string().optional(),
  communication_disabled_until: z.string().datetime().nullish(),
  avatar_decoration_data: z.lazy(() => AvatarDecorationDataEntity).nullish(),
});

export type GuildMemberEntity = z.infer<typeof GuildMemberEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-widget-settings-object-guild-widget-settings-structure}
 */
export const GuildWidgetSettingsEntity = z.object({
  enabled: z.boolean(),
  channel_id: Snowflake.nullable(),
});

export type GuildWidgetSettingsEntity = z.infer<
  typeof GuildWidgetSettingsEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-widget-object-guild-widget-structure}
 */
export const GuildWidgetEntity = z.object({
  id: Snowflake,
  name: z.string(),
  instant_invite: z.string().nullable(),
  channels: z.array(
    z.union([
      z.lazy(() => GuildVoiceChannelEntity.partial()),
      z.lazy(() => GuildStageVoiceChannelEntity.partial()),
    ]),
  ),
  members: z.array(z.lazy(() => UserEntity)),
  presence_count: z.number().int(),
});

export type GuildWidgetEntity = z.infer<typeof GuildWidgetEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-guild-features}
 */
export enum GuildFeature {
  AnimatedBanner = "ANIMATED_BANNER",
  AnimatedIcon = "ANIMATED_ICON",
  ApplicationCommandPermissionsV2 = "APPLICATION_COMMAND_PERMISSIONS_V2",
  AutoModeration = "AUTO_MODERATION",
  Banner = "BANNER",
  Community = "COMMUNITY",
  CreatorMonetizableProvisional = "CREATOR_MONETIZABLE_PROVISIONAL",
  CreatorStorePage = "CREATOR_STORE_PAGE",
  DeveloperSupportServer = "DEVELOPER_SUPPORT_SERVER",
  Discoverable = "DISCOVERABLE",
  Featurable = "FEATURABLE",
  InvitesDisabled = "INVITES_DISABLED",
  InviteSplash = "INVITE_SPLASH",
  MemberVerificationGateEnabled = "MEMBER_VERIFICATION_GATE_ENABLED",
  MoreSoundboard = "MORE_SOUNDBOARD",
  MoreStickers = "MORE_STICKERS",
  News = "NEWS",
  Partnered = "PARTNERED",
  PreviewEnabled = "PREVIEW_ENABLED",
  RaidAlertsDisabled = "RAID_ALERTS_DISABLED",
  RoleIcons = "ROLE_ICONS",
  RoleSubscriptionsAvailableForPurchase = "ROLE_SUBSCRIPTIONS_AVAILABLE_FOR_PURCHASE",
  RoleSubscriptionsEnabled = "ROLE_SUBSCRIPTIONS_ENABLED",
  Soundboard = "SOUNDBOARD",
  TicketedEventsEnabled = "TICKETED_EVENTS_ENABLED",
  VanityUrl = "VANITY_URL",
  Verified = "VERIFIED",
  VipRegions = "VIP_REGIONS",
  WelcomeScreenEnabled = "WELCOME_SCREEN_ENABLED",
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-preview-object-guild-preview-structure}
 */
export const GuildPreviewEntity = z.object({
  id: Snowflake,
  name: z.string(),
  icon: z.string().nullable(),
  splash: z.string().nullable(),
  discovery_splash: z.string().nullable(),
  emojis: z.array(z.lazy(() => EmojiEntity)),
  features: z.array(z.nativeEnum(GuildFeature)),
  approximate_member_count: z.number().int(),
  approximate_presence_count: z.number().int(),
  description: z.string().nullable(),
  stickers: z.array(z.lazy(() => StickerEntity)),
});

export type GuildPreviewEntity = z.infer<typeof GuildPreviewEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#unavailable-guild-object}
 */
export const UnavailableGuildEntity = z.object({
  id: Snowflake,
  unavailable: z.literal(true),
});

export type UnavailableGuildEntity = z.infer<typeof UnavailableGuildEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-system-channel-flags}
 */
export enum SystemChannelFlags {
  SuppressJoinNotifications = 1 << 0,
  SuppressPremiumSubscriptions = 1 << 1,
  SuppressGuildReminderNotifications = 1 << 2,
  SuppressJoinNotificationReplies = 1 << 3,
  SuppressRoleSubscriptionPurchaseNotifications = 1 << 4,
  SuppressRoleSubscriptionPurchaseNotificationReplies = 1 << 5,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-premium-tier}
 */
export enum PremiumTier {
  None = 0,
  Tier1 = 1,
  Tier2 = 2,
  Tier3 = 3,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-guild-nsfw-level}
 */
export enum NsfwLevel {
  Default = 0,
  Explicit = 1,
  Safe = 2,
  AgeRestricted = 3,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-verification-level}
 */
export enum VerificationLevel {
  None = 0,
  Low = 1,
  Medium = 2,
  High = 3,
  VeryHigh = 4,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-mfa-level}
 */
export enum MfaLevel {
  None = 0,
  Elevated = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-explicit-content-filter-level}
 */
export enum ExplicitContentFilterLevel {
  Disabled = 0,
  MembersWithoutRoles = 1,
  AllMembers = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-default-message-notification-level}
 */
export enum DefaultMessageNotificationLevel {
  AllMessages = 0,
  OnlyMentions = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-guild-structure}
 */
export const GuildEntity = z.object({
  id: Snowflake,
  name: z.string(),
  icon: z.string().nullable(),
  icon_hash: z.string().nullish(),
  splash: z.string().nullable(),
  discovery_splash: z.string().nullable(),
  owner: z.boolean().optional(),
  owner_id: Snowflake,
  permissions: z.string().optional(),
  /** @deprecated Voice region id for the guild (deprecated) */
  region: z.string().nullish(),
  afk_channel_id: Snowflake.nullable(),
  afk_timeout: z.number().int(),
  widget_enabled: z.boolean().optional(),
  widget_channel_id: z.string().nullish(),
  verification_level: z.nativeEnum(VerificationLevel),
  default_message_notifications: z.nativeEnum(DefaultMessageNotificationLevel),
  explicit_content_filter: z.nativeEnum(ExplicitContentFilterLevel),
  roles: z.array(RoleEntity),
  emojis: z.array(z.lazy(() => EmojiEntity)),
  features: z.array(z.nativeEnum(GuildFeature)),
  mfa_level: z.nativeEnum(MfaLevel),
  application_id: Snowflake.optional(),
  system_channel_id: Snowflake.nullable(),
  system_channel_flags: z.nativeEnum(SystemChannelFlags),
  rules_channel_id: Snowflake.nullable(),
  max_presences: z.number().int().nullish(),
  max_members: z.number().int(),
  vanity_url_code: z.string().nullable(),
  description: z.string().nullable(),
  banner: z.string().nullable(),
  premium_tier: z.nativeEnum(PremiumTier),
  premium_subscription_count: z.number().int().optional(),
  preferred_locale: LocaleKey,
  public_updates_channel_id: Snowflake.nullable(),
  max_video_channel_users: z.number().int().optional(),
  max_stage_video_channel_users: z.number().int().optional(),
  approximate_member_count: z.number().int().optional(),
  approximate_presence_count: z.number().int().optional(),
  welcome_screen: WelcomeScreenEntity.optional(),
  nsfw_level: z.nativeEnum(NsfwLevel),
  stickers: z.array(z.lazy(() => StickerEntity)).optional(),
  premium_progress_bar_enabled: z.boolean(),
  safety_alerts_channel_id: Snowflake.nullable(),
});

export type GuildEntity = z.infer<typeof GuildEntity>;
