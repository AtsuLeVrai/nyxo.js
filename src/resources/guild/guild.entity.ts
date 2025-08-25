import type { LocaleValues, OAuth2Scope } from "../../enum/index.js";
import type {
  AnyChannelEntity,
  AnyThreadBasedChannelEntity,
  GuildStageVoiceChannelEntity,
  GuildVoiceChannelEntity,
} from "../channel/index.js";
import type { EmojiEntity } from "../emoji/index.js";
import type { RoleEntity } from "../role/index.js";
import type { GuildScheduledEventEntity } from "../scheduled-event/index.js";
import type { SoundboardSoundEntity } from "../soundboard/index.js";
import type { StageInstanceEntity } from "../stage-instance/index.js";
import type { StickerEntity } from "../sticker/index.js";
import type { AvatarDecorationDataEntity, PresenceEntity, UserEntity } from "../user/index.js";
import type { VoiceStateEntity } from "../voice/index.js";

export enum GuildOnboardingPromptType {
  MultipleChoice = 0,
  Dropdown = 1,
}

export enum GuildOnboardingMode {
  Default = 0,
  Advanced = 1,
}

export enum IntegrationExpirationBehavior {
  RemoveRole = 0,
  Kick = 1,
}

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
  EnhancedRoleColors = "ENHANCED_ROLE_COLORS",
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

export enum SystemChannelFlags {
  SuppressJoinNotifications = 1 << 0,
  SuppressPremiumSubscriptions = 1 << 1,
  SuppressGuildReminderNotifications = 1 << 2,
  SuppressJoinNotificationReplies = 1 << 3,
  SuppressRoleSubscriptionPurchaseNotifications = 1 << 4,
  SuppressRoleSubscriptionPurchaseNotificationReplies = 1 << 5,
}

export enum PremiumTier {
  None = 0,
  Tier1 = 1,
  Tier2 = 2,
  Tier3 = 3,
}

export enum NsfwLevel {
  Default = 0,
  Explicit = 1,
  Safe = 2,
  AgeRestricted = 3,
}

export enum VerificationLevel {
  None = 0,
  Low = 1,
  Medium = 2,
  High = 3,
  VeryHigh = 4,
}

export enum MfaLevel {
  None = 0,
  Elevated = 1,
}

export enum ExplicitContentFilterLevel {
  Disabled = 0,
  MembersWithoutRoles = 1,
  AllMembers = 2,
}

export enum DefaultMessageNotificationLevel {
  AllMessages = 0,
  OnlyMentions = 1,
}

export interface GuildOnboardingPromptOptionEntity {
  id: string;
  channel_ids: string[];
  role_ids: string[];
  emoji?: EmojiEntity;
  emoji_id?: string;
  emoji_name?: string;
  emoji_animated?: boolean;
  title: string;
  description: string | null;
}

export interface GuildOnboardingPromptEntity {
  id: string;
  type: GuildOnboardingPromptType;
  options: GuildOnboardingPromptOptionEntity[];
  title: string;
  single_select: boolean;
  required: boolean;
  in_onboarding: boolean;
}

export interface GuildOnboardingEntity {
  guild_id: string;
  prompts: GuildOnboardingPromptEntity[];
  default_channel_ids: string[];
  enabled: boolean;
  mode: GuildOnboardingMode;
}

export interface WelcomeScreenChannelEntity {
  channel_id: string;
  description: string;
  emoji_id: string | null;
  emoji_name: string | null;
}

export interface WelcomeScreenEntity {
  description: string | null;
  welcome_channels: WelcomeScreenChannelEntity[];
}

export interface BanEntity {
  reason: string | null;
  user: UserEntity;
}

export interface IntegrationApplicationEntity {
  id: string;
  name: string;
  icon: string | null;
  description: string;
  bot?: UserEntity;
}

export interface IntegrationAccountEntity {
  id: string;
  name: string;
}

export type IntegrationType = "twitch" | "youtube" | "discord" | "guild_subscription";

export interface IntegrationEntity {
  id: string;
  name: string;
  type: IntegrationType;
  enabled: boolean;
  syncing?: boolean;
  role_id?: string;
  enable_emoticons?: boolean;
  expire_behavior?: IntegrationExpirationBehavior;
  expire_grace_period?: number;
  user?: UserEntity;
  account: IntegrationAccountEntity;
  synced_at?: string;
  subscriber_count?: number;
  revoked?: boolean;
  application?: IntegrationApplicationEntity;
  scopes?: OAuth2Scope[];
}

export interface GuildMemberEntity {
  user: UserEntity;
  nick?: string | null;
  avatar?: string | null;
  banner?: string | null;
  roles: string[];
  joined_at: string;
  premium_since?: string | null;
  deaf: boolean;
  mute: boolean;
  flags: GuildMemberFlags;
  pending?: boolean;
  permissions?: string;
  communication_disabled_until?: string | null;
  avatar_decoration_data?: AvatarDecorationDataEntity | null;
}

export interface GuildWidgetSettingsEntity {
  enabled: boolean;
  channel_id: string | null;
}

export interface GuildWidgetEntity {
  id: string;
  name: string;
  instant_invite: string | null;
  channels: (GuildVoiceChannelEntity | GuildStageVoiceChannelEntity)[];
  members: UserEntity[];
  presence_count: number;
}

export interface GuildPreviewEntity {
  id: string;
  name: string;
  icon: string | null;
  splash: string | null;
  discovery_splash: string | null;
  emojis: EmojiEntity[];
  features: GuildFeature[];
  approximate_member_count: number;
  approximate_presence_count: number;
  description: string | null;
  stickers: StickerEntity[];
}

export interface UnavailableGuildEntity {
  id: string;
  unavailable: true;
}

export interface IncidentsDataEntity {
  invites_disabled_until: string | null;
  dms_disabled_until: string | null;
  dm_spam_detected_at?: string | null;
  raid_detected_at?: string | null;
}

export interface GuildEntity {
  id: string;
  name: string;
  icon: string | null;
  icon_hash?: string | null;
  splash: string | null;
  discovery_splash: string | null;
  owner?: boolean;
  owner_id: string;
  permissions?: string;
  region?: string | null;
  afk_channel_id: string | null;
  afk_timeout: 60 | 300 | 900 | 1800 | 3600;
  widget_enabled?: boolean;
  widget_channel_id?: string | null;
  verification_level: VerificationLevel;
  default_message_notifications: DefaultMessageNotificationLevel;
  explicit_content_filter: ExplicitContentFilterLevel;
  roles: RoleEntity[];
  emojis: EmojiEntity[];
  features: GuildFeature[];
  mfa_level: MfaLevel;
  application_id: string | null;
  system_channel_id: string | null;
  system_channel_flags: SystemChannelFlags;
  rules_channel_id: string | null;
  max_presences?: number | null;
  max_members: number;
  vanity_url_code: string | null;
  description: string | null;
  banner: string | null;
  premium_tier: PremiumTier;
  premium_subscription_count?: number;
  preferred_locale: LocaleValues;
  public_updates_channel_id: string | null;
  max_video_channel_users?: number;
  max_stage_video_channel_users?: number;
  approximate_member_count?: number;
  approximate_presence_count?: number;
  welcome_screen?: WelcomeScreenEntity;
  nsfw_level: NsfwLevel;
  stickers?: StickerEntity[];
  premium_progress_bar_enabled: boolean;
  safety_alerts_channel_id: string | null;
  incidents_data?: IncidentsDataEntity | null;
}

export interface GuildCreateEntity extends GuildEntity {
  joined_at: string;
  large: boolean;
  unavailable?: boolean;
  member_count: number;
  voice_states: Partial<VoiceStateEntity>[];
  members: GuildMemberEntity[];
  channels: AnyChannelEntity[];
  threads: AnyThreadBasedChannelEntity[];
  presences: Partial<PresenceEntity>[];
  stage_instances: StageInstanceEntity[];
  guild_scheduled_events: GuildScheduledEventEntity[];
  soundboard_sounds: SoundboardSoundEntity[];
}

export interface GuildBanEntity {
  guild_id: string;
  user: UserEntity;
}

export interface GuildEmojisUpdateEntity {
  guild_id: string;
  emojis: EmojiEntity[];
}

export interface GuildStickersUpdateEntity {
  guild_id: string;
  stickers: StickerEntity[];
}

export interface GuildIntegrationsUpdateEntity {
  guild_id: string;
}

export interface GuildMemberAddEntity extends GuildMemberEntity {
  guild_id: string;
}

export interface GuildMemberRemoveEntity {
  guild_id: string;
  user: UserEntity;
}

export interface GuildMemberUpdateEntity {
  guild_id: string;
  roles: string[];
  user: UserEntity;
  nick?: string | null;
  avatar: string | null;
  banner: string | null;
  joined_at: string | null;
  premium_since?: string | null;
  deaf?: boolean;
  mute?: boolean;
  pending?: boolean;
  communication_disabled_until?: string | null;
  flags?: number;
  avatar_decoration_data?: AvatarDecorationDataEntity | null;
}

export interface GuildMembersChunkEntity {
  guild_id: string;
  members: GuildMemberEntity[];
  chunk_index: number;
  chunk_count: number;
  not_found?: string[];
  presences?: PresenceEntity[];
  nonce?: string;
}

export interface GuildRoleUpdateEntity {
  guild_id: string;
  role: RoleEntity;
}

export interface GuildRoleDeleteEntity {
  role_id: string;
  guild_id: string;
}

export interface IntegrationDeleteEntity {
  id: string;
  guild_id: string;
  application_id?: string;
}

export interface IntegrationUpdateEntity extends Omit<IntegrationEntity, "user"> {
  guild_id: string;
}
