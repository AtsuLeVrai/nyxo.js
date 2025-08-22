import type { Snowflake } from "../common/index.js";
import type { DataUri } from "../core/index.js";
import type { EndpointFactory } from "../utils/index.js";
import type {
  AnyChannelObject,
  DefaultReactionObject,
  ForumTagObject,
  OverwriteObject,
  ThreadMemberObject,
} from "./channel.js";
import type { EmojiObject } from "./emoji.js";
import type { AnyInviteObject } from "./invite.js";
import type { RoleColorsObject, RoleObject } from "./role.js";
import type { StickerObject } from "./sticker.js";
import type { AvatarDecorationData, UserObject } from "./user.js";
import type { VoiceRegionObject } from "./voice.js";

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

// Request interfaces for Guild operations
export interface GetGuildQuery {
  with_counts?: boolean;
}

export interface ModifyGuildRequest {
  name?: string;
  region?: string | null;
  verification_level?: VerificationLevel;
  default_message_notifications?: DefaultMessageNotificationLevel;
  explicit_content_filter?: ExplicitContentFilterLevel;
  afk_channel_id?: Snowflake | null;
  afk_timeout?: number;
  icon?: DataUri | null;
  splash?: DataUri | null;
  discovery_splash?: DataUri | null;
  banner?: DataUri | null;
  system_channel_id?: Snowflake | null;
  system_channel_flags?: SystemChannelFlags;
  rules_channel_id?: Snowflake | null;
  public_updates_channel_id?: Snowflake | null;
  preferred_locale?: string;
  features?: string[];
  description?: string | null;
  premium_progress_bar_enabled?: boolean;
  safety_alerts_channel_id?: Snowflake | null;
}

export interface CreateGuildChannelRequest {
  name: string;
  type?: number;
  topic?: string;
  bitrate?: number;
  user_limit?: number;
  rate_limit_per_user?: number;
  position?: number;
  permission_overwrites?: Partial<OverwriteObject>[];
  parent_id?: Snowflake;
  nsfw?: boolean;
  rtc_region?: string;
  video_quality_mode?: number;
  default_auto_archive_duration?: number;
  default_reaction_emoji?: DefaultReactionObject;
  available_tags?: ForumTagObject[];
  default_sort_order?: number;
  default_forum_layout?: number;
  default_thread_rate_limit_per_user?: number;
}

export interface ModifyGuildChannelPositionsRequest {
  id: Snowflake;
  position?: number | null;
  lock_permissions?: boolean | null;
  parent_id?: Snowflake | null;
}

export interface ListGuildMembersQuery {
  limit?: number;
  after?: Snowflake;
}

export interface SearchGuildMembersQuery {
  query: string;
  limit?: number;
}

export interface AddGuildMemberRequest {
  access_token: string;
  nick?: string;
  roles?: Snowflake[];
  mute?: boolean;
  deaf?: boolean;
}

export interface ModifyGuildMemberRequest {
  nick?: string | null;
  roles?: Snowflake[];
  mute?: boolean;
  deaf?: boolean;
  channel_id?: Snowflake | null;
  communication_disabled_until?: string | null;
  flags?: GuildMemberFlags;
}

export interface ModifyCurrentMemberRequest {
  nick?: string | null;
}

export interface GetGuildBansQuery {
  limit?: number;
  before?: Snowflake;
  after?: Snowflake;
}

export interface CreateGuildBanRequest {
  delete_message_days?: number;
  delete_message_seconds?: number;
}

export interface BulkGuildBanRequest {
  user_ids: Snowflake[];
  delete_message_seconds?: number;
}

export interface BulkGuildBanResponse {
  banned_users: Snowflake[];
  failed_users: Snowflake[];
}

export interface CreateGuildRoleRequest {
  name?: string;
  permissions?: string;
  color?: number;
  colors?: RoleColorsObject;
  hoist?: boolean;
  icon?: DataUri | null;
  unicode_emoji?: string | null;
  mentionable?: boolean;
}

export interface ModifyGuildRolePositionsRequest {
  id: Snowflake;
  position?: number | null;
}

export interface ModifyGuildRoleRequest {
  name?: string;
  permissions?: string;
  color?: number;
  colors?: RoleColorsObject;
  hoist?: boolean;
  icon?: DataUri | null;
  unicode_emoji?: string | null;
  mentionable?: boolean;
}

export interface GetGuildPruneCountQuery {
  days?: number;
  include_roles?: string; // comma-delimited
}

export interface BeginGuildPruneRequest {
  days?: number;
  compute_prune_count?: boolean;
  include_roles?: Snowflake[];
  reason?: string;
}

export interface ModifyGuildWelcomeScreenRequest {
  enabled?: boolean;
  welcome_channels?: WelcomeScreenChannelObject[];
  description?: string;
}

export interface ModifyGuildOnboardingRequest {
  prompts?: OnboardingPromptObject[];
  default_channel_ids?: Snowflake[];
  enabled?: boolean;
  mode?: OnboardingMode;
}

export interface ModifyGuildIncidentActionsRequest {
  invites_disabled_until?: string | null;
  dms_disabled_until?: string | null;
}

export interface GetGuildWidgetImageQuery {
  style?: "shield" | "banner1" | "banner2" | "banner3" | "banner4";
}

export interface ListActiveGuildThreadsResponse {
  threads: AnyChannelObject[];
  members: ThreadMemberObject[];
}

export interface PartialInviteObject {
  code: string;
  uses: number;
}

export const GuildRoutes = {
  // GET /guilds/{guild.id} - Get Guild
  getGuild: ((guildId: Snowflake) => `/guilds/${guildId}`) as EndpointFactory<
    `/guilds/${string}`,
    ["GET", "PATCH"],
    GuildObject,
    true, // reason support for PATCH
    false,
    ModifyGuildRequest,
    GetGuildQuery
  >,

  // GET /guilds/{guild.id}/preview - Get Guild Preview
  getGuildPreview: ((guildId: Snowflake) => `/guilds/${guildId}/preview`) as EndpointFactory<
    `/guilds/${string}/preview`,
    ["GET"],
    GuildPreviewObject
  >,

  // GET /guilds/{guild.id}/channels - Get Guild Channels
  getGuildChannels: ((guildId: Snowflake) => `/guilds/${guildId}/channels`) as EndpointFactory<
    `/guilds/${string}/channels`,
    ["GET", "POST", "PATCH"],
    AnyChannelObject[],
    true, // reason support for POST
    false,
    CreateGuildChannelRequest | ModifyGuildChannelPositionsRequest[]
  >,

  // GET /guilds/{guild.id}/threads/active - List Active Guild Threads
  listActiveGuildThreads: ((guildId: Snowflake) =>
    `/guilds/${guildId}/threads/active`) as EndpointFactory<
    `/guilds/${string}/threads/active`,
    ["GET"],
    ListActiveGuildThreadsResponse
  >,

  // GET /guilds/{guild.id}/members/{user.id} - Get Guild Member
  getGuildMember: ((guildId: Snowflake, userId: Snowflake) =>
    `/guilds/${guildId}/members/${userId}`) as EndpointFactory<
    `/guilds/${string}/members/${string}`,
    ["GET", "PATCH", "DELETE"],
    GuildMemberObject,
    true, // reason support for PATCH/DELETE
    false,
    ModifyGuildMemberRequest
  >,

  // GET /guilds/{guild.id}/members - List Guild Members
  listGuildMembers: ((guildId: Snowflake) => `/guilds/${guildId}/members`) as EndpointFactory<
    `/guilds/${string}/members`,
    ["GET"],
    GuildMemberObject[],
    false,
    false,
    undefined,
    ListGuildMembersQuery
  >,

  // GET /guilds/{guild.id}/members/search - Search Guild Members
  searchGuildMembers: ((guildId: Snowflake) =>
    `/guilds/${guildId}/members/search`) as EndpointFactory<
    `/guilds/${string}/members/search`,
    ["GET"],
    GuildMemberObject[],
    false,
    false,
    undefined,
    SearchGuildMembersQuery
  >,

  // PUT /guilds/{guild.id}/members/{user.id} - Add Guild Member
  addGuildMember: ((guildId: Snowflake, userId: Snowflake) =>
    `/guilds/${guildId}/members/${userId}`) as EndpointFactory<
    `/guilds/${string}/members/${string}`,
    ["PUT"],
    GuildMemberObject,
    false,
    false,
    AddGuildMemberRequest
  >,

  // PATCH /guilds/{guild.id}/members/@me - Modify Current Member
  modifyCurrentMember: ((guildId: Snowflake) =>
    `/guilds/${guildId}/members/@me`) as EndpointFactory<
    `/guilds/${string}/members/@me`,
    ["PATCH"],
    GuildMemberObject,
    true, // reason support
    false,
    ModifyCurrentMemberRequest
  >,

  // PUT /guilds/{guild.id}/members/{user.id}/roles/{role.id} - Add Guild Member Role
  addGuildMemberRole: ((guildId: Snowflake, userId: Snowflake, roleId: Snowflake) =>
    `/guilds/${guildId}/members/${userId}/roles/${roleId}`) as EndpointFactory<
    `/guilds/${string}/members/${string}/roles/${string}`,
    ["PUT", "DELETE"],
    void,
    true // reason support
  >,

  // GET /guilds/{guild.id}/bans - Get Guild Bans
  getGuildBans: ((guildId: Snowflake) => `/guilds/${guildId}/bans`) as EndpointFactory<
    `/guilds/${string}/bans`,
    ["GET"],
    BanObject[],
    false,
    false,
    undefined,
    GetGuildBansQuery
  >,

  // GET /guilds/{guild.id}/bans/{user.id} - Get Guild Ban
  getGuildBan: ((guildId: Snowflake, userId: Snowflake) =>
    `/guilds/${guildId}/bans/${userId}`) as EndpointFactory<
    `/guilds/${string}/bans/${string}`,
    ["GET", "PUT", "DELETE"],
    BanObject,
    true, // reason support for PUT/DELETE
    false,
    CreateGuildBanRequest
  >,

  // POST /guilds/{guild.id}/bulk-ban - Bulk Guild Ban
  bulkGuildBan: ((guildId: Snowflake) => `/guilds/${guildId}/bulk-ban`) as EndpointFactory<
    `/guilds/${string}/bulk-ban`,
    ["POST"],
    BulkGuildBanResponse,
    true, // reason support
    false,
    BulkGuildBanRequest
  >,

  // GET /guilds/{guild.id}/roles - Get Guild Roles
  getGuildRoles: ((guildId: Snowflake) => `/guilds/${guildId}/roles`) as EndpointFactory<
    `/guilds/${string}/roles`,
    ["GET", "POST", "PATCH"],
    RoleObject[],
    true, // reason support for POST/PATCH
    false,
    CreateGuildRoleRequest | ModifyGuildRolePositionsRequest[]
  >,

  // GET /guilds/{guild.id}/roles/{role.id} - Get Guild Role
  getGuildRole: ((guildId: Snowflake, roleId: Snowflake) =>
    `/guilds/${guildId}/roles/${roleId}`) as EndpointFactory<
    `/guilds/${string}/roles/${string}`,
    ["GET", "PATCH", "DELETE"],
    RoleObject,
    true, // reason support for PATCH/DELETE
    false,
    ModifyGuildRoleRequest
  >,

  // GET /guilds/{guild.id}/prune - Get Guild Prune Count
  getGuildPruneCount: ((guildId: Snowflake) => `/guilds/${guildId}/prune`) as EndpointFactory<
    `/guilds/${string}/prune`,
    ["GET", "POST"],
    { pruned: number },
    true, // reason support for POST
    false,
    BeginGuildPruneRequest,
    GetGuildPruneCountQuery
  >,

  // GET /guilds/{guild.id}/regions - Get Guild Voice Regions
  getGuildVoiceRegions: ((guildId: Snowflake) => `/guilds/${guildId}/regions`) as EndpointFactory<
    `/guilds/${string}/regions`,
    ["GET"],
    VoiceRegionObject[]
  >,

  // GET /guilds/{guild.id}/invites - Get Guild Invites
  getGuildInvites: ((guildId: Snowflake) => `/guilds/${guildId}/invites`) as EndpointFactory<
    `/guilds/${string}/invites`,
    ["GET"],
    AnyInviteObject[]
  >,

  // GET /guilds/{guild.id}/integrations - Get Guild Integrations
  getGuildIntegrations: ((guildId: Snowflake) =>
    `/guilds/${guildId}/integrations`) as EndpointFactory<
    `/guilds/${string}/integrations`,
    ["GET"],
    IntegrationObject[]
  >,

  // DELETE /guilds/{guild.id}/integrations/{integration.id} - Delete Guild Integration
  deleteGuildIntegration: ((guildId: Snowflake, integrationId: Snowflake) =>
    `/guilds/${guildId}/integrations/${integrationId}`) as EndpointFactory<
    `/guilds/${string}/integrations/${string}`,
    ["DELETE"],
    void,
    true // reason support
  >,

  // GET /guilds/{guild.id}/widget - Get Guild Widget Settings
  getGuildWidgetSettings: ((guildId: Snowflake) => `/guilds/${guildId}/widget`) as EndpointFactory<
    `/guilds/${string}/widget`,
    ["GET", "PATCH"],
    GuildWidgetSettingsObject,
    true, // reason support for PATCH
    false,
    GuildWidgetSettingsObject
  >,

  // GET /guilds/{guild.id}/widget.json - Get Guild Widget
  getGuildWidget: ((guildId: Snowflake) => `/guilds/${guildId}/widget.json`) as EndpointFactory<
    `/guilds/${string}/widget.json`,
    ["GET"],
    GuildWidgetObject
  >,

  // GET /guilds/{guild.id}/vanity-url - Get Guild Vanity URL
  getGuildVanityUrl: ((guildId: Snowflake) => `/guilds/${guildId}/vanity-url`) as EndpointFactory<
    `/guilds/${string}/vanity-url`,
    ["GET"],
    PartialInviteObject
  >,

  // GET /guilds/{guild.id}/widget.png - Get Guild Widget Image
  getGuildWidgetImage: ((guildId: Snowflake) => `/guilds/${guildId}/widget.png`) as EndpointFactory<
    `/guilds/${string}/widget.png`,
    ["GET"],
    Blob, // PNG image
    false,
    false,
    undefined,
    GetGuildWidgetImageQuery
  >,

  // GET /guilds/{guild.id}/welcome-screen - Get Guild Welcome Screen
  getGuildWelcomeScreen: ((guildId: Snowflake) =>
    `/guilds/${guildId}/welcome-screen`) as EndpointFactory<
    `/guilds/${string}/welcome-screen`,
    ["GET", "PATCH"],
    WelcomeScreenObject,
    true, // reason support for PATCH
    false,
    ModifyGuildWelcomeScreenRequest
  >,

  // GET /guilds/{guild.id}/onboarding - Get Guild Onboarding
  getGuildOnboarding: ((guildId: Snowflake) => `/guilds/${guildId}/onboarding`) as EndpointFactory<
    `/guilds/${string}/onboarding`,
    ["GET", "PUT"],
    GuildOnboardingObject,
    true, // reason support for PUT
    false,
    ModifyGuildOnboardingRequest
  >,

  // PUT /guilds/{guild.id}/incident-actions - Modify Guild Incident Actions
  modifyGuildIncidentActions: ((guildId: Snowflake) =>
    `/guilds/${guildId}/incident-actions`) as EndpointFactory<
    `/guilds/${string}/incident-actions`,
    ["PUT"],
    IncidentsDataObject,
    false,
    false,
    ModifyGuildIncidentActionsRequest
  >,
} as const satisfies Record<string, EndpointFactory<any, any, any, any, any, any, any, any>>;
