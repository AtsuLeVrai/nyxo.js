import type { FileInput, Rest } from "../../core/index.js";
import type {
  AnyChannelEntity,
  AnyThreadBasedChannelEntity,
  ThreadMemberEntity,
} from "../channel/index.js";
import type { InviteWithMetadataEntity } from "../invite/index.js";
import type { RoleEntity } from "../role/index.js";
import type { VoiceRegionEntity } from "../voice/index.js";
import type {
  BanEntity,
  DefaultMessageNotificationLevel,
  ExplicitContentFilterLevel,
  GuildEntity,
  GuildFeature,
  GuildMemberEntity,
  GuildMemberFlags,
  GuildOnboardingEntity,
  GuildOnboardingMode,
  GuildOnboardingPromptEntity,
  GuildWidgetEntity,
  GuildWidgetSettingsEntity,
  IntegrationEntity,
  MfaLevel,
  SystemChannelFlags,
  VerificationLevel,
  WelcomeScreenChannelEntity,
  WelcomeScreenEntity,
} from "./guild.entity.js";

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
