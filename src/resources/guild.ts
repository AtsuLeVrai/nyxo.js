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

export interface GuildCreateOptions {
  name: string;
  region?: string | null;
  icon?: FileInput;
  verification_level?: VerificationLevel;
  default_message_notifications?: DefaultMessageNotificationLevel;
  explicit_content_filter?: ExplicitContentFilterLevel;
  roles?: RoleEntity[];
  channels?: AnyChannelEntity[];
  afk_channel_id?: string;
  afk_timeout?: number;
  system_channel_id?: string;
  system_channel_flags?: SystemChannelFlags;
}

export interface GuildUpdateOptions {
  name?: string;
  region?: string | null;
  verification_level?: VerificationLevel | null;
  default_message_notifications?: DefaultMessageNotificationLevel | null;
  explicit_content_filter?: ExplicitContentFilterLevel | null;
  afk_channel_id?: string | null;
  afk_timeout?: number;
  icon?: FileInput | null;
  owner_id?: string;
  splash?: FileInput | null;
  discovery_splash?: FileInput | null;
  banner?: FileInput | null;
  system_channel_id?: string | null;
  system_channel_flags?: SystemChannelFlags;
  rules_channel_id?: string | null;
  public_updates_channel_id?: string | null;
  preferred_locale?: string;
  features?: GuildFeature[];
  description?: string | null;
  premium_progress_bar_enabled?: boolean;
  safety_alerts_channel_id?: string | null;
}

export interface ChannelPositionUpdateOptions {
  id: string;
  position?: number | null;
  lock_permissions?: boolean;
  parent_id?: string | null;
}

export type ChannelPositionsUpdateOptions = ChannelPositionUpdateOptions[];

export interface ActiveThreadsResponse {
  threads: AnyThreadBasedChannelEntity[];
  members: ThreadMemberEntity[];
}

export interface GuildMembersFetchParams {
  limit?: number;
  after?: string;
}

export interface GuildMembersSearchParams {
  query: string;
  limit: number;
}

export interface GuildMemberAddOptions {
  access_token: string;
  nick?: string;
  roles?: string[];
  mute?: boolean;
  deaf?: boolean;
}

export interface GuildMemberUpdateOptions {
  nick?: string | null;
  roles?: string[];
  mute?: boolean;
  deaf?: boolean;
  channel_id?: string | null;
  communication_disabled_until?: string;
  flags?: GuildMemberFlags;
}

export interface GuildBansFetchParams {
  limit?: number;
  before?: string;
  after?: string;
}

export interface GuildBanCreateOptions {
  delete_message_days?: number;
  delete_message_seconds?: number;
}

export interface GuildBansBulkOptions {
  user_ids: string[];
  delete_message_seconds: number;
}

export interface GuildBansBulkResponse {
  banned_users: string[];
  failed_users: string[];
}

export interface GuildRoleCreateOptions {
  name: string;
  permissions: string;
  color: number;
  hoist: boolean;
  icon: FileInput | null;
  unicode_emoji?: string;
  mentionable: boolean;
}

export interface RolePositionUpdateOptions {
  id: string;
  position?: number | null;
}

export type RolePositionsUpdateOptions = RolePositionUpdateOptions[];

export type GuildRoleUpdateOptions = Partial<GuildRoleCreateOptions> | null;

export interface GetGuildPruneCountQuerySchema {
  days?: number;
  include_roles?: string;
}

export interface GuildPruneOptions {
  days: number;
  compute_prune_count: boolean;
  include_roles: string[];
  reason?: string;
}

export type WidgetStyle = "shield" | "banner1" | "banner2" | "banner3" | "banner4";

export interface GuildWidgetUpdateOptions {
  enabled: boolean;
  channel_id: string | null;
}

export interface GuildWelcomeScreenUpdateOptions {
  enabled?: boolean | null;
  welcome_channels?: WelcomeScreenChannelEntity[] | null;
  description?: string | null;
}

export interface GuildOnboardingUpdateOptions {
  prompts: GuildOnboardingPromptEntity[];
  default_channel_ids: string[];
  enabled: boolean;
  mode: GuildOnboardingMode;
}

export class GuildRouter {
  static readonly Routes = {
    guildsEndpoint: () => "/guilds",
    guildBaseEndpoint: (guildId: string) => `/guilds/${guildId}` as const,
    guildPreviewEndpoint: (guildId: string) => `/guilds/${guildId}/preview` as const,
    guildChannelsEndpoint: (guildId: string) => `/guilds/${guildId}/channels` as const,
    guildActiveThreadsEndpoint: (guildId: string) => `/guilds/${guildId}/threads/active` as const,
    guildMembersEndpoint: (guildId: string) => `/guilds/${guildId}/members` as const,
    guildMembersSearchEndpoint: (guildId: string) => `/guilds/${guildId}/members/search` as const,
    guildMemberEndpoint: (guildId: string, userId: string) =>
      `/guilds/${guildId}/members/${userId}` as const,
    guildCurrentMemberEndpoint: (guildId: string) => `/guilds/${guildId}/members/@me` as const,
    guildCurrentMemberNicknameEndpoint: (guildId: string) =>
      `/guilds/${guildId}/members/@me/nick` as const,
    guildMemberRoleEndpoint: (guildId: string, userId: string, roleId: string) =>
      `/guilds/${guildId}/members/${userId}/roles/${roleId}` as const,
    guildBansEndpoint: (guildId: string) => `/guilds/${guildId}/bans` as const,
    guildBanEndpoint: (guildId: string, userId: string) =>
      `/guilds/${guildId}/bans/${userId}` as const,
    guildBulkBanEndpoint: (guildId: string) => `/guilds/${guildId}/bulk-ban` as const,
    guildRolesEndpoint: (guildId: string) => `/guilds/${guildId}/roles` as const,
    guildRoleEndpoint: (guildId: string, roleId: string) =>
      `/guilds/${guildId}/roles/${roleId}` as const,
    guildMfaEndpoint: (guildId: string) => `/guilds/${guildId}/mfa` as const,
    guildPruneEndpoint: (guildId: string) => `/guilds/${guildId}/prune` as const,
    guildRegionsEndpoint: (guildId: string) => `/guilds/${guildId}/regions` as const,
    guildInvitesEndpoint: (guildId: string) => `/guilds/${guildId}/invites` as const,
    guildIntegrationsEndpoint: (guildId: string) => `/guilds/${guildId}/integrations` as const,
    guildIntegrationEndpoint: (guildId: string, integrationId: string) =>
      `/guilds/${guildId}/integrations/${integrationId}` as const,
    guildWidgetSettingsEndpoint: (guildId: string) => `/guilds/${guildId}/widget` as const,
    guildWidgetEndpoint: (guildId: string) => `/guilds/${guildId}/widget.json` as const,
    guildVanityUrlEndpoint: (guildId: string) => `/guilds/${guildId}/vanity-url` as const,
    guildWidgetImageEndpoint: (guildId: string) => `/guilds/${guildId}/widget.png` as const,
    guildWelcomeScreenEndpoint: (guildId: string) => `/guilds/${guildId}/welcome-screen` as const,
    guildOnboardingEndpoint: (guildId: string) => `/guilds/${guildId}/onboarding` as const,
  } as const satisfies Record<string, (...args: any[]) => string>;
  readonly #rest: Rest;
  constructor(rest: Rest) {
    this.#rest = rest;
  }
  async createGuild(options: GuildCreateOptions): Promise<GuildEntity> {
    const processedOptions = { ...options };
    if (processedOptions.icon) {
      processedOptions.icon = await this.#rest.toDataUri(processedOptions.icon);
    }
    return this.#rest.post(GuildRouter.Routes.guildsEndpoint(), {
      body: JSON.stringify(processedOptions),
    });
  }
  fetchGuild(guildId: string, withCounts = false): Promise<GuildEntity> {
    return this.#rest.get(GuildRouter.Routes.guildBaseEndpoint(guildId), {
      query: { with_counts: withCounts },
    });
  }
  fetchPreview(guildId: string): Promise<GuildEntity> {
    return this.#rest.get(GuildRouter.Routes.guildPreviewEndpoint(guildId));
  }
  async updateGuild(
    guildId: string,
    options: GuildUpdateOptions,
    reason?: string,
  ): Promise<GuildEntity> {
    const processedOptions = { ...options };
    if (processedOptions.icon) {
      processedOptions.icon = await this.#rest.toDataUri(processedOptions.icon);
    }
    if (processedOptions.splash) {
      processedOptions.splash = await this.#rest.toDataUri(processedOptions.splash);
    }
    if (processedOptions.discovery_splash) {
      processedOptions.discovery_splash = await this.#rest.toDataUri(
        processedOptions.discovery_splash,
      );
    }
    if (processedOptions.banner) {
      processedOptions.banner = await this.#rest.toDataUri(processedOptions.banner);
    }
    return this.#rest.patch(GuildRouter.Routes.guildBaseEndpoint(guildId), {
      body: JSON.stringify(processedOptions),
      reason,
    });
  }
  deleteGuild(guildId: string): Promise<void> {
    return this.#rest.delete(GuildRouter.Routes.guildBaseEndpoint(guildId));
  }
  fetchChannels(guildId: string): Promise<AnyChannelEntity[]> {
    return this.#rest.get(GuildRouter.Routes.guildChannelsEndpoint(guildId));
  }
  createGuildChannel(
    guildId: string,
    options: AnyChannelEntity,
    reason?: string,
  ): Promise<AnyChannelEntity> {
    return this.#rest.post(GuildRouter.Routes.guildChannelsEndpoint(guildId), {
      body: JSON.stringify(options),
      reason,
    });
  }
  updateGuildChannelPositions(
    guildId: string,
    options: ChannelPositionsUpdateOptions,
  ): Promise<void> {
    return this.#rest.patch(GuildRouter.Routes.guildChannelsEndpoint(guildId), {
      body: JSON.stringify(options),
    });
  }
  fetchActiveGuildThreads(guildId: string): Promise<ActiveThreadsResponse[]> {
    return this.#rest.get(GuildRouter.Routes.guildActiveThreadsEndpoint(guildId));
  }
  fetchGuildMember(guildId: string, userId: string): Promise<GuildMemberEntity> {
    return this.#rest.get(GuildRouter.Routes.guildMemberEndpoint(guildId, userId));
  }
  fetchGuildMembers(guildId: string, query: GuildMembersFetchParams): Promise<GuildMemberEntity[]> {
    return this.#rest.get(GuildRouter.Routes.guildMembersEndpoint(guildId), {
      query,
    });
  }
  searchGuildMembers(
    guildId: string,
    query: GuildMembersSearchParams,
  ): Promise<GuildMemberEntity[]> {
    return this.#rest.get(GuildRouter.Routes.guildMembersSearchEndpoint(guildId), { query });
  }
  addGuildMember(
    guildId: string,
    userId: string,
    options: GuildMemberAddOptions,
  ): Promise<GuildMemberEntity> {
    return this.#rest.put(GuildRouter.Routes.guildMemberEndpoint(guildId, userId), {
      body: JSON.stringify(options),
    });
  }
  updateGuildMember(
    guildId: string,
    userId: string,
    options: GuildMemberUpdateOptions,
    reason?: string,
  ): Promise<GuildMemberEntity> {
    return this.#rest.patch(GuildRouter.Routes.guildMemberEndpoint(guildId, userId), {
      body: JSON.stringify(options),
      reason,
    });
  }
  updateCurrentMember(
    guildId: string,
    nickname?: string | null,
    reason?: string,
  ): Promise<GuildMemberEntity> {
    return this.#rest.patch(GuildRouter.Routes.guildCurrentMemberEndpoint(guildId), {
      body: JSON.stringify({ nick: nickname }),
      reason,
    });
  }
  updateNickname(
    guildId: string,
    nickname?: string | null,
    reason?: string,
  ): Promise<GuildMemberEntity> {
    return this.#rest.patch(GuildRouter.Routes.guildCurrentMemberNicknameEndpoint(guildId), {
      body: JSON.stringify({ nick: nickname }),
      reason,
    });
  }
  addRoleToMember(guildId: string, userId: string, roleId: string, reason?: string): Promise<void> {
    return this.#rest.put(GuildRouter.Routes.guildMemberRoleEndpoint(guildId, userId, roleId), {
      reason,
    });
  }
  removeRoleFromMember(
    guildId: string,
    userId: string,
    roleId: string,
    reason?: string,
  ): Promise<void> {
    return this.#rest.delete(GuildRouter.Routes.guildMemberRoleEndpoint(guildId, userId, roleId), {
      reason,
    });
  }
  removeGuildMember(guildId: string, userId: string, reason?: string): Promise<void> {
    return this.#rest.delete(GuildRouter.Routes.guildMemberEndpoint(guildId, userId), {
      reason,
    });
  }
  fetchGuildBans(guildId: string, query?: GuildBansFetchParams): Promise<BanEntity[]> {
    return this.#rest.get(GuildRouter.Routes.guildBansEndpoint(guildId), {
      query,
    });
  }
  fetchGuildBan(guildId: string, userId: string): Promise<BanEntity> {
    return this.#rest.get(GuildRouter.Routes.guildBanEndpoint(guildId, userId));
  }
  createGuildBan(
    guildId: string,
    userId: string,
    options: GuildBanCreateOptions,
    reason?: string,
  ): Promise<void> {
    return this.#rest.put(GuildRouter.Routes.guildBanEndpoint(guildId, userId), {
      body: JSON.stringify(options),
      reason,
    });
  }
  removeGuildBan(guildId: string, userId: string, reason?: string): Promise<void> {
    return this.#rest.delete(GuildRouter.Routes.guildBanEndpoint(guildId, userId), {
      reason,
    });
  }
  banUsers(
    guildId: string,
    options: GuildBansBulkOptions,
    reason?: string,
  ): Promise<GuildBansBulkResponse> {
    return this.#rest.put(GuildRouter.Routes.guildBulkBanEndpoint(guildId), {
      body: JSON.stringify(options),
      reason,
    });
  }
  fetchGuildRoles(guildId: string): Promise<RoleEntity[]> {
    return this.#rest.get(GuildRouter.Routes.guildRolesEndpoint(guildId));
  }
  fetchGuildRole(guildId: string, roleId: string): Promise<RoleEntity> {
    return this.#rest.get(GuildRouter.Routes.guildRoleEndpoint(guildId, roleId));
  }
  async createGuildRole(
    guildId: string,
    options: GuildRoleCreateOptions,
    reason?: string,
  ): Promise<RoleEntity> {
    const processedOptions = { ...options };
    if (processedOptions.icon) {
      processedOptions.icon = await this.#rest.toDataUri(processedOptions.icon);
    }
    return this.#rest.post(GuildRouter.Routes.guildRolesEndpoint(guildId), {
      body: JSON.stringify(processedOptions),
      reason,
    });
  }
  updateGuildRolePositions(
    guildId: string,
    options: RolePositionsUpdateOptions,
  ): Promise<RoleEntity[]> {
    return this.#rest.patch(GuildRouter.Routes.guildRolesEndpoint(guildId), {
      body: JSON.stringify(options),
    });
  }
  updateGuildRole(
    guildId: string,
    roleId: string,
    options: GuildRoleUpdateOptions,
    reason?: string,
  ): Promise<RoleEntity> {
    return this.#rest.patch(GuildRouter.Routes.guildRoleEndpoint(guildId, roleId), {
      body: JSON.stringify(options),
      reason,
    });
  }
  updateGuildMfaLevel(guildId: string, level: MfaLevel, reason?: string): Promise<number> {
    return this.#rest.post(GuildRouter.Routes.guildMfaEndpoint(guildId), {
      body: JSON.stringify({ level }),
      reason,
    });
  }
  deleteGuildRole(guildId: string, roleId: string, reason?: string): Promise<void> {
    return this.#rest.delete(GuildRouter.Routes.guildRoleEndpoint(guildId, roleId), {
      reason,
    });
  }
  fetchGuildPruneCount(
    guildId: string,
    query?: GetGuildPruneCountQuerySchema,
  ): Promise<{ pruned: number }> {
    return this.#rest.get(GuildRouter.Routes.guildPruneEndpoint(guildId), {
      query,
    });
  }
  pruneGuildMembers(
    guildId: string,
    options: GuildPruneOptions,
    reason?: string,
  ): Promise<{ pruned: number | null }> {
    return this.#rest.post(GuildRouter.Routes.guildPruneEndpoint(guildId), {
      body: JSON.stringify(options),
      reason,
    });
  }
  fetchGuildVoiceRegions(guildId: string): Promise<VoiceRegionEntity[]> {
    return this.#rest.get(GuildRouter.Routes.guildRegionsEndpoint(guildId));
  }
  fetchGuildInvites(guildId: string): Promise<InviteWithMetadataEntity[]> {
    return this.#rest.get(GuildRouter.Routes.guildInvitesEndpoint(guildId));
  }
  fetchGuildIntegrations(guildId: string): Promise<IntegrationEntity[]> {
    return this.#rest.get(GuildRouter.Routes.guildIntegrationsEndpoint(guildId));
  }
  deleteGuildIntegration(guildId: string, integrationId: string, reason?: string): Promise<void> {
    return this.#rest.delete(GuildRouter.Routes.guildIntegrationEndpoint(guildId, integrationId), {
      reason,
    });
  }
  fetchGuildWidgetSettings(guildId: string): Promise<GuildWidgetSettingsEntity> {
    return this.#rest.get(GuildRouter.Routes.guildWidgetSettingsEndpoint(guildId));
  }
  updateGuildWidget(
    guildId: string,
    options: GuildWidgetUpdateOptions,
    reason?: string,
  ): Promise<GuildWidgetSettingsEntity> {
    return this.#rest.patch(GuildRouter.Routes.guildWidgetSettingsEndpoint(guildId), {
      body: JSON.stringify(options),
      reason,
    });
  }
  fetchGuildWidget(guildId: string): Promise<GuildWidgetEntity> {
    return this.#rest.get(GuildRouter.Routes.guildWidgetEndpoint(guildId));
  }
  fetchGuildVanityUrl(guildId: string): Promise<Pick<InviteWithMetadataEntity, "code" | "uses">> {
    return this.#rest.get(GuildRouter.Routes.guildVanityUrlEndpoint(guildId));
  }
  fetchGuildWidgetImage(guildId: string, style: WidgetStyle = "shield"): Promise<Buffer> {
    return this.#rest.get(GuildRouter.Routes.guildWidgetImageEndpoint(guildId), {
      query: { style },
    });
  }
  fetchGuildWelcomeScreen(guildId: string): Promise<WelcomeScreenEntity> {
    return this.#rest.get(GuildRouter.Routes.guildWelcomeScreenEndpoint(guildId));
  }
  updateGuildWelcomeScreen(
    guildId: string,
    options: GuildWelcomeScreenUpdateOptions,
    reason?: string,
  ): Promise<WelcomeScreenEntity> {
    return this.#rest.patch(GuildRouter.Routes.guildWelcomeScreenEndpoint(guildId), {
      body: JSON.stringify(options),
      reason,
    });
  }
  fetchGuildOnboarding(guildId: string): Promise<GuildOnboardingEntity> {
    return this.#rest.get(GuildRouter.Routes.guildOnboardingEndpoint(guildId));
  }
  updateGuildOnboarding(
    guildId: string,
    options: GuildOnboardingUpdateOptions,
    reason?: string,
  ): Promise<GuildOnboardingEntity> {
    return this.#rest.put(GuildRouter.Routes.guildOnboardingEndpoint(guildId), {
      body: JSON.stringify(options),
      reason,
    });
  }
}
