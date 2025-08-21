import type { Snowflake } from "../common/index.js";
import type { BitwisePermissionFlags } from "../constants/index.js";
import type { AnyChannelObject } from "./channel.js";
import type { EmojiObject } from "./emoji.js";
import type { StickerObject } from "./sticker.js";
import type { AvatarDecorationData, UserObject } from "./user.js";

export enum DefaultMessageNotificationLevel {
  AllMessages = 0,
  OnlyMentions = 1,
}

export enum ExplicitContentFilterLevel {
  Disabled = 0,
  MembersWithoutRoles = 1,
  AllMembers = 2,
}

export enum MfaLevel {
  None = 0,
  Elevated = 1,
}

export enum VerificationLevel {
  None = 0,
  Low = 1,
  Medium = 2,
  High = 3,
  VeryHigh = 4,
}

export enum GuildNSFWLevel {
  Default = 0,
  Explicit = 1,
  Safe = 2,
  AgeRestricted = 3,
}

export enum PremiumTier {
  None = 0,
  Tier1 = 1,
  Tier2 = 2,
  Tier3 = 3,
}

export enum SystemChannelFlags {
  SuppressJoinNotifications = 1 << 0,
  SuppressPremiumSubscriptions = 1 << 1,
  SuppressGuildReminderNotifications = 1 << 2,
  SuppressJoinNotificationReplies = 1 << 3,
  SuppressRoleSubscriptionPurchaseNotifications = 1 << 4,
  SuppressRoleSubscriptionPurchaseNotificationReplies = 1 << 5,
}

export enum IntegrationExpireBehavior {
  RemoveRole = 0,
  Kick = 1,
}

export enum MembershipScreeningFieldType {
  TermsAndConditions = "TERMS",
}

export enum PresenceStatus {
  Online = "online",
  DND = "dnd",
  Idle = "idle",
  Invisible = "invisible",
  Offline = "offline",
}

export enum ActivityType {
  Playing = 0,
  Streaming = 1,
  Listening = 2,
  Watching = 3,
  Custom = 4,
  Competing = 5,
}

export enum ActivityFlags {
  Instance = 1 << 0,
  Join = 1 << 1,
  Spectate = 1 << 2,
  JoinRequest = 1 << 3,
  Sync = 1 << 4,
  Play = 1 << 5,
  PartyPrivacyFriends = 1 << 6,
  PartyPrivacyVoiceChannel = 1 << 7,
  Embedded = 1 << 8,
}

export enum GuildMemberFlags {
  DidRejoin = 1 << 0,
  CompletedOnboarding = 1 << 1,
  BypassesVerification = 1 << 2,
  StartedOnboarding = 1 << 3,
  IsGuest = 1 << 4,
  StartedHomeActions = 1 << 5,
  CompletedHomeActions = 1 << 6,
  AutomodQuarantinedUsername = 1 << 7,
  DmSettingsUpsellAcknowledged = 1 << 9,
  AutomodQuarantinedGuildTag = 1 << 10,
}

export enum OnboardingMode {
  OnboardingDefault = 0,
  OnboardingAdvanced = 1,
}

export enum PromptType {
  MultipleChoice = 0,
  Dropdown = 1,
}

export interface GuildObject {
  id: Snowflake;
  name: string;
  icon: string | null;
  icon_hash?: string | null;
  splash: string | null;
  discovery_splash: string | null;
  owner?: boolean;
  owner_id: Snowflake;
  permissions?: string;
  region?: string | null;
  afk_channel_id: Snowflake | null;
  afk_timeout: number;
  widget_enabled?: boolean;
  widget_channel_id?: Snowflake | null;
  verification_level: VerificationLevel;
  default_message_notifications: DefaultMessageNotificationLevel;
  explicit_content_filter: ExplicitContentFilterLevel;
  roles: RoleObject[];
  emojis: EmojiObject[];
  features: string[];
  mfa_level: MfaLevel;
  application_id: Snowflake | null;
  system_channel_id: Snowflake | null;
  system_channel_flags: SystemChannelFlags;
  rules_channel_id: Snowflake | null;
  max_presences?: number | null;
  max_members?: number;
  vanity_url_code: string | null;
  description: string | null;
  banner: string | null;
  premium_tier: PremiumTier;
  premium_subscription_count?: number;
  preferred_locale: string;
  public_updates_channel_id: Snowflake | null;
  max_video_channel_users?: number;
  max_stage_video_channel_users?: number;
  approximate_member_count?: number;
  approximate_presence_count?: number;
  welcome_screen?: WelcomeScreenObject;
  nsfw_level: GuildNSFWLevel;
  stickers?: StickerObject[];
  premium_progress_bar_enabled: boolean;
  safety_alerts_channel_id: Snowflake | null;
  incidents_data: IncidentsDataObject | null;
}

export interface UnavailableGuildObject {
  id: Snowflake;
  unavailable: boolean;
}

export interface GuildPreviewObject {
  id: Snowflake;
  name: string;
  icon: string | null;
  splash: string | null;
  discovery_splash: string | null;
  emojis: EmojiObject[];
  features: string[];
  approximate_member_count: number;
  approximate_presence_count: number;
  description: string | null;
  stickers: StickerObject[];
}

export interface GuildWidgetSettingsObject {
  enabled: boolean;
  channel_id: Snowflake | null;
}

export interface GuildWidgetObject {
  id: Snowflake;
  name: string;
  instant_invite: string | null;
  channels: Partial<AnyChannelObject>[];
  members: Partial<UserObject>[];
  presence_count: number;
}

export interface GuildMemberObject {
  user?: UserObject;
  nick?: string | null;
  avatar?: string | null;
  banner?: string | null;
  roles: Snowflake[];
  joined_at: string | null;
  premium_since?: string | null;
  deaf: boolean;
  mute: boolean;
  flags: GuildMemberFlags;
  pending?: boolean;
  permissions?: string;
  communication_disabled_until?: string | null;
  avatar_decoration_data?: AvatarDecorationData | null;
}

export interface IntegrationObject {
  id: Snowflake;
  name: string;
  type: string;
  enabled: boolean;
  syncing?: boolean;
  role_id?: Snowflake;
  enable_emoticons?: boolean;
  expire_behavior?: IntegrationExpireBehavior;
  expire_grace_period?: number;
  user?: UserObject;
  account: IntegrationAccountObject;
  synced_at?: string;
  subscriber_count?: number;
  revoked?: boolean;
  application?: IntegrationApplicationObject;
  scopes?: string[];
}

export interface IntegrationAccountObject {
  id: string;
  name: string;
}

export interface IntegrationApplicationObject {
  id: Snowflake;
  name: string;
  icon: string | null;
  description: string;
  bot?: UserObject;
}

export interface BanObject {
  reason: string | null;
  user: UserObject;
}

export interface WelcomeScreenObject {
  description: string | null;
  welcome_channels: WelcomeScreenChannelObject[];
}

export interface WelcomeScreenChannelObject {
  channel_id: Snowflake;
  description: string;
  emoji_id: Snowflake | null;
  emoji_name: string | null;
}

export interface MembershipScreeningObject {
  version: string;
  form_fields: MembershipScreeningFieldObject[];
  description: string | null;
}

export interface MembershipScreeningFieldObject {
  field_type: MembershipScreeningFieldType;
  label: string;
  values?: string[];
  required: boolean;
}

export interface PresenceUpdateObject {
  user: UserObject;
  guild_id: Snowflake;
  status: PresenceStatus;
  activities: ActivityObject[];
  client_status: ClientStatusObject;
}

export interface ClientStatusObject {
  desktop?: PresenceStatus;
  mobile?: PresenceStatus;
  web?: PresenceStatus;
}

export interface ActivityObject {
  name: string;
  type: ActivityType;
  url?: string | null;
  created_at: number;
  timestamps?: ActivityTimestampsObject;
  application_id?: Snowflake;
  details?: string | null;
  state?: string | null;
  emoji?: ActivityEmojiObject | null;
  party?: ActivityPartyObject;
  assets?: ActivityAssetsObject;
  secrets?: ActivitySecretsObject;
  instance?: boolean;
  flags?: ActivityFlags;
  buttons?: ActivityButtonObject[];
}

export interface ActivityTimestampsObject {
  start?: number;
  end?: number;
}

export interface ActivityEmojiObject {
  name: string;
  id?: Snowflake;
  animated?: boolean;
}

export interface ActivityPartyObject {
  id?: string;
  size?: [number, number];
}

export interface ActivityAssetsObject {
  large_image?: string;
  large_text?: string;
  small_image?: string;
  small_text?: string;
}

export interface ActivitySecretsObject {
  join?: string;
  spectate?: string;
  match?: string;
}

export interface ActivityButtonObject {
  label: string;
  url: string;
}

export interface RoleObject {
  id: Snowflake;
  name: string;
  color: number;
  hoist: boolean;
  icon?: string | null;
  unicode_emoji?: string | null;
  position: number;
  permissions: string;
  managed: boolean;
  mentionable: boolean;
  tags?: RoleTagsObject;
  flags: BitwisePermissionFlags;
}

export interface RoleTagsObject {
  bot_id?: Snowflake;
  integration_id?: Snowflake;
  premium_subscriber?: null;
  subscription_listing_id?: Snowflake;
  available_for_purchase?: null;
  guild_connections?: null;
}

export interface IncidentsDataObject {
  invites_disabled_until: string | null;
  dms_disabled_until: string | null;
  dm_spam_detected_at?: string | null;
  raid_detected_at?: string | null;
}

export interface GuildOnboardingObject {
  guild_id: Snowflake;
  prompts: OnboardingPromptObject[];
  default_channel_ids: Snowflake[];
  enabled: boolean;
  mode: OnboardingMode;
}

export interface OnboardingPromptObject {
  id: Snowflake;
  type: PromptType;
  options: PromptOptionObject[];
  title: string;
  single_select: boolean;
  required: boolean;
  in_onboarding: boolean;
}

export interface PromptOptionObject {
  id: Snowflake;
  channel_ids: Snowflake[];
  role_ids: Snowflake[];
  emoji?: EmojiObject;
  emoji_id?: Snowflake;
  emoji_name?: string;
  emoji_animated?: boolean;
  title: string;
  description: string | null;
}
