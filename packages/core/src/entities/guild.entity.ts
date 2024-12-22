import type { LocaleKey, OAuth2Scope } from "../enums/index.js";
import type { Integer, Iso8601 } from "../formatting/index.js";
import type { Snowflake } from "../managers/index.js";
import type { ChannelEntity } from "./channel.entity.js";
import type { EmojiEntity } from "./emoji.entity.js";
import type { RoleEntity } from "./role.entity.js";
import type { StickerEntity } from "./sticker.entity.js";
import type { AvatarDecorationDataEntity, UserEntity } from "./user.entity.js";

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
export interface GuildOnboardingPromptOptionEntity {
  id: Snowflake;
  channel_ids: Snowflake[];
  role_ids: Snowflake[];
  emoji?: EmojiEntity;
  emoji_id?: Snowflake;
  emoji_name?: string;
  emoji_animated?: boolean;
  title: string;
  description: string | null;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-onboarding-prompt-structure}
 */
export interface GuildOnboardingPromptEntity {
  id: Snowflake;
  type: GuildOnboardingPromptType;
  options: GuildOnboardingPromptOptionEntity[];
  title: string;
  single_select: boolean;
  required: boolean;
  in_onboarding: boolean;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-guild-onboarding-structure}
 */
export interface GuildOnboardingEntity {
  guild_id: Snowflake;
  prompts: GuildOnboardingPromptEntity[];
  default_channel_ids: Snowflake[];
  enabled: boolean;
  mode: GuildOnboardingMode;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#welcome-screen-object-welcome-screen-channel-structure}
 */
export interface WelcomeScreenChannelEntity {
  channel_id: Snowflake;
  description: string;
  emoji_id: Snowflake | null;
  emoji_name: string | null;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#welcome-screen-object-welcome-screen-structure}
 */
export interface WelcomeScreenEntity {
  description: string | null;
  welcome_channels: WelcomeScreenChannelEntity[];
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#ban-object-ban-structure}
 */
export interface BanEntity {
  reason: string | null;
  user: UserEntity;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#integration-application-object-integration-application-structure}
 */
export interface IntegrationApplicationEntity {
  id: Snowflake;
  name: string;
  icon: string | null;
  description: string;
  bot?: UserEntity;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#integration-account-object-integration-account-structure}
 */
export interface IntegrationAccountEntity {
  id: string;
  name: string;
}

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
export interface IntegrationEntity {
  id: Snowflake;
  name: string;
  type: "twitch" | "youtube" | "discord" | "guild_subscription";
  enabled: boolean;
  syncing?: boolean;
  role_id?: Snowflake;
  enable_emoticons?: boolean;
  expire_behavior?: IntegrationExpirationBehavior;
  expire_grace_period?: Integer;
  user?: UserEntity;
  account: IntegrationAccountEntity;
  synced_at?: Iso8601;
  subscriber_count?: Integer;
  revoked?: boolean;
  application?: IntegrationApplicationEntity;
  scopes?: OAuth2Scope[];
}

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
export interface GuildMemberEntity {
  user: UserEntity;
  nick?: string | null;
  avatar?: string | null;
  banner?: string | null;
  roles: Snowflake[];
  joined_at: Iso8601;
  premium_since?: Iso8601 | null;
  deaf: boolean;
  mute: boolean;
  flags: GuildMemberFlags;
  pending?: boolean;
  permissions?: string;
  communication_disabled_until?: Iso8601 | null;
  avatar_decoration_data?: AvatarDecorationDataEntity | null;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-widget-settings-object-guild-widget-settings-structure}
 */
export interface GuildWidgetSettingsEntity {
  enabled: boolean;
  channel_id: Snowflake | null;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-widget-object-guild-widget-structure}
 */
export interface GuildWidgetEntity {
  id: Snowflake;
  name: string;
  instant_invite: string | null;
  channels: Partial<ChannelEntity>[];
  members: Partial<UserEntity>[];
  presence_count: Integer;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-preview-object-guild-preview-structure}
 */
export interface GuildPreviewEntity {
  id: Snowflake;
  name: string;
  icon: string | null;
  splash: string | null;
  discovery_splash: string | null;
  emojis: EmojiEntity[];
  features: GuildFeature[];
  approximate_member_count: Integer;
  approximate_presence_count: Integer;
  description: string | null;
  stickers: StickerEntity[];
}

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
export interface GuildEntity {
  id: Snowflake;
  name: string;
  icon: string | null;
  icon_hash?: string | null;
  splash: string | null;
  discovery_splash: string | null;
  owner?: boolean;
  owner_id: Snowflake;
  permissions?: string;
  /** @deprecated Voice region id for the guild (deprecated) */
  region?: string | null;
  afk_channel_id: Snowflake | null;
  afk_timeout: Integer;
  widget_enabled?: boolean;
  widget_channel_id?: Snowflake | null;
  verification_level: VerificationLevel;
  default_message_notifications: DefaultMessageNotificationLevel;
  explicit_content_filter: ExplicitContentFilterLevel;
  roles: RoleEntity[];
  emojis: EmojiEntity[];
  features: GuildFeature[];
  mfa_level: MfaLevel;
  application_id?: Snowflake;
  system_channel_id: Snowflake | null;
  system_channel_flags: SystemChannelFlags;
  rules_channel_id: Snowflake | null;
  max_presences?: Integer | null;
  max_members: Integer;
  vanity_url_code: string | null;
  description: string | null;
  banner: string | null;
  premium_tier: PremiumTier;
  premium_subscription_count?: Integer;
  preferred_locale: LocaleKey;
  public_updates_channel_id: Snowflake | null;
  max_video_channel_users?: Integer;
  max_stage_video_channel_users?: Integer;
  approximate_member_count?: Integer;
  approximate_presence_count?: Integer;
  welcome_screen?: WelcomeScreenEntity;
  nsfw_level: NsfwLevel;
  stickers?: StickerEntity[];
  premium_progress_bar_enabled: boolean;
  safety_alerts_channel_id: Snowflake | null;
}
