import type {
  BanEntity,
  ChannelEntity,
  GuildEntity,
  GuildMemberEntity,
  GuildOnboardingEntity,
  GuildWidgetEntity,
  GuildWidgetSettingsEntity,
  IntegrationEntity,
  InviteEntity,
  InviteMetadataEntity,
  MfaLevel,
  RoleEntity,
  Snowflake,
  VoiceRegionEntity,
  WelcomeScreenEntity,
} from "@nyxjs/core";
import { BaseRouter } from "../base/index.js";
import {
  type AddGuildMemberEntity,
  AddGuildMemberSchema,
  type BeginGuildPruneEntity,
  BeginGuildPruneSchema,
  type BulkGuildBanEntity,
  type BulkGuildBanResponseEntity,
  type CreateGuildBanEntity,
  CreateGuildBanSchema,
  type CreateGuildChannelEntity,
  CreateGuildChannelSchema,
  type CreateGuildEntity,
  type CreateGuildRoleEntity,
  CreateGuildRoleSchema,
  CreateGuildSchema,
  type GetGuildBansQueryEntity,
  GetGuildBansQuerySchema,
  type GetGuildPruneCountQueryEntity,
  GetGuildPruneCountQuerySchema,
  type ListActiveGuildThreadsEntity,
  type ListGuildMembersQueryEntity,
  ListGuildMembersQuerySchema,
  type ModifyGuildChannelPositionsEntity,
  ModifyGuildChannelPositionsSchema,
  type ModifyGuildEntity,
  type ModifyGuildMemberEntity,
  ModifyGuildMemberSchema,
  type ModifyGuildOnboardingEntity,
  ModifyGuildOnboardingSchema,
  type ModifyGuildRoleEntity,
  type ModifyGuildRolePositionsEntity,
  ModifyGuildRolePositionsSchema,
  ModifyGuildRoleSchema,
  ModifyGuildSchema,
  type ModifyGuildWelcomeScreenEntity,
  ModifyGuildWelcomeScreenSchema,
  type ModifyGuildWidgetSettingsEntity,
  ModifyGuildWidgetSettingsSchema,
  type SearchGuildMembersQueryEntity,
  SearchGuildMembersQuerySchema,
  WidgetStyleOptions,
} from "../schemas/guild.schema.js";

export class GuildRouter extends BaseRouter {
  static ROUTES = {
    guilds: "/guilds" as const,
    guild: (guildId: Snowflake) => `/guilds/${guildId}` as const,
    guildPreview: (guildId: Snowflake) => `/guilds/${guildId}/preview` as const,
    guildChannels: (guildId: Snowflake) =>
      `/guilds/${guildId}/channels` as const,
    threadsActive: (guildId: Snowflake) =>
      `/guilds/${guildId}/threads/active` as const,
    guildMembers: (guildId: Snowflake) => `/guilds/${guildId}/members` as const,
    searchMembers: (guildId: Snowflake) =>
      `/guilds/${guildId}/members/search` as const,
    guildMember: (guildId: Snowflake, userId: Snowflake) =>
      `/guilds/${guildId}/members/${userId}` as const,
    guildCurrentMember: (guildId: Snowflake) =>
      `/guilds/${guildId}/members/@me` as const,
    /** @deprecated */
    guildCurrentMemberNick: (guildId: Snowflake) =>
      `/guilds/${guildId}/members/@me/nick` as const,
    guildMemberRole: (
      guildId: Snowflake,
      userId: Snowflake,
      roleId: Snowflake,
    ) => `/guilds/${guildId}/members/${userId}/roles/${roleId}` as const,
    guildBans: (guildId: Snowflake) => `/guilds/${guildId}/bans` as const,
    guildBan: (guildId: Snowflake, userId: Snowflake) =>
      `/guilds/${guildId}/bans/${userId}` as const,
    bulkBan: (guildId: Snowflake) => `/guilds/${guildId}/bulk-ban` as const,
    guildRoles: (guildId: Snowflake) => `/guilds/${guildId}/roles` as const,
    guildRole: (guildId: Snowflake, roleId: Snowflake) =>
      `/guilds/${guildId}/roles/${roleId}` as const,
    guildMfa: (guildId: Snowflake) => `/guilds/${guildId}/mfa` as const,
    guildPrune: (guildId: Snowflake) => `/guilds/${guildId}/prune` as const,
    guildRegions: (guildId: Snowflake) => `/guilds/${guildId}/regions` as const,
    guildInvites: (guildId: Snowflake) => `/guilds/${guildId}/invites` as const,
    guildIntegrations: (guildId: Snowflake) =>
      `/guilds/${guildId}/integrations` as const,
    guildIntegration: (guildId: Snowflake, integrationId: Snowflake) =>
      `/guilds/${guildId}/integrations/${integrationId}` as const,
    guildWidgetSettings: (guildId: Snowflake) =>
      `/guilds/${guildId}/widget` as const,
    guildWidget: (guildId: Snowflake) =>
      `/guilds/${guildId}/widget.json` as const,
    guildVanityUrl: (guildId: Snowflake) =>
      `/guilds/${guildId}/vanity-url` as const,
    guildWidgetImage: (guildId: Snowflake) =>
      `/guilds/${guildId}/widget.png` as const,
    guildWelcomeScreen: (guildId: Snowflake) =>
      `/guilds/${guildId}/welcome-screen` as const,
    guildOnboarding: (guildId: Snowflake) =>
      `/guilds/${guildId}/onboarding` as const,
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#create-guild}
   */
  createGuild(options: CreateGuildEntity): Promise<GuildEntity> {
    const result = CreateGuildSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.post(GuildRouter.ROUTES.guilds, {
      body: JSON.stringify(result.data),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild}
   */
  getGuild(guildId: Snowflake, withCounts = false): Promise<GuildEntity> {
    return this.get(GuildRouter.ROUTES.guild(guildId), {
      query: { with_counts: withCounts },
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-preview}
   */
  getPreview(guildId: Snowflake): Promise<GuildEntity> {
    return this.get(GuildRouter.ROUTES.guildPreview(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild}
   */
  modifyGuild(
    guildId: Snowflake,
    options: ModifyGuildEntity,
    reason?: string,
  ): Promise<GuildEntity> {
    const result = ModifyGuildSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.patch(GuildRouter.ROUTES.guild(guildId), {
      body: JSON.stringify(result.data),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#delete-guild}
   */
  deleteGuild(guildId: Snowflake): Promise<void> {
    return this.delete(GuildRouter.ROUTES.guild(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-channels}
   */
  getChannels(guildId: Snowflake): Promise<ChannelEntity[]> {
    return this.get(GuildRouter.ROUTES.guildChannels(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-channel}
   */
  createGuildChannel(
    guildId: Snowflake,
    options: CreateGuildChannelEntity,
    reason?: string,
  ): Promise<ChannelEntity> {
    const result = CreateGuildChannelSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.post(GuildRouter.ROUTES.guildChannels(guildId), {
      body: JSON.stringify(result.data),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-channel-positions}
   */
  modifyGuildChannelPositions(
    guildId: Snowflake,
    options: ModifyGuildChannelPositionsEntity,
  ): Promise<void> {
    const result = ModifyGuildChannelPositionsSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.patch(GuildRouter.ROUTES.guildChannels(guildId), {
      body: JSON.stringify(result.data),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#list-active-guild-threads}
   */
  listActiveGuildThreads(
    guildId: Snowflake,
  ): Promise<ListActiveGuildThreadsEntity[]> {
    return this.get(GuildRouter.ROUTES.threadsActive(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-member}
   */
  getGuildMember(
    guildId: Snowflake,
    userId: Snowflake,
  ): Promise<GuildMemberEntity> {
    return this.get(GuildRouter.ROUTES.guildMember(guildId, userId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#list-guild-members}
   */
  listGuildMembers(
    guildId: Snowflake,
    query: ListGuildMembersQueryEntity = {},
  ): Promise<GuildMemberEntity[]> {
    const result = ListGuildMembersQuerySchema.safeParse(query);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.get(GuildRouter.ROUTES.guildMembers(guildId), {
      query: result.data,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#search-guild-members}
   */
  searchGuildMembers(
    guildId: Snowflake,
    query: SearchGuildMembersQueryEntity,
  ): Promise<GuildMemberEntity[]> {
    const result = SearchGuildMembersQuerySchema.safeParse(query);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.get(GuildRouter.ROUTES.searchMembers(guildId), {
      query: result.data,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#add-guild-member}
   */
  addGuildMember(
    guildId: Snowflake,
    userId: Snowflake,
    options: AddGuildMemberEntity,
  ): Promise<GuildMemberEntity> {
    const result = AddGuildMemberSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.put(GuildRouter.ROUTES.guildMember(guildId, userId), {
      body: JSON.stringify(result.data),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-member}
   */
  modifyGuildMember(
    guildId: Snowflake,
    userId: Snowflake,
    options: ModifyGuildMemberEntity,
    reason?: string,
  ): Promise<GuildMemberEntity> {
    const result = ModifyGuildMemberSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.patch(GuildRouter.ROUTES.guildMember(guildId, userId), {
      body: JSON.stringify(result.data),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-current-member}
   */
  modifyCurrentMember(
    guildId: Snowflake,
    nickname?: string | null,
    reason?: string,
  ): Promise<GuildMemberEntity> {
    return this.patch(GuildRouter.ROUTES.guildCurrentMember(guildId), {
      body: JSON.stringify({ nick: nickname }),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-current-user-nick}
   * @deprecated Deprecated in favor of {@link GuildRouter.modifyCurrentMember}
   */
  modifyCurrentUserNick(
    guildId: Snowflake,
    nickname?: string | null,
    reason?: string,
  ): Promise<GuildMemberEntity> {
    return this.patch(GuildRouter.ROUTES.guildCurrentMemberNick(guildId), {
      body: JSON.stringify({ nick: nickname }),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#add-guild-member-role}
   */
  addGuildMemberRole(
    guildId: Snowflake,
    userId: Snowflake,
    roleId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.put(
      GuildRouter.ROUTES.guildMemberRole(guildId, userId, roleId),
      { reason },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#remove-guild-member-role}
   */
  removeGuildMemberRole(
    guildId: Snowflake,
    userId: Snowflake,
    roleId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.delete(
      GuildRouter.ROUTES.guildMemberRole(guildId, userId, roleId),
      { reason },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#remove-guild-member}
   */
  removeGuildMember(
    guildId: Snowflake,
    userId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.delete(GuildRouter.ROUTES.guildMember(guildId, userId), {
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-bans}
   */
  getGuildBans(
    guildId: Snowflake,
    query: GetGuildBansQueryEntity = {},
  ): Promise<BanEntity[]> {
    const result = GetGuildBansQuerySchema.safeParse(query);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.get(GuildRouter.ROUTES.guildBans(guildId), {
      query: result.data,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-ban}
   */
  getGuildBan(guildId: Snowflake, userId: Snowflake): Promise<BanEntity> {
    return this.get(GuildRouter.ROUTES.guildBan(guildId, userId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-ban}
   */
  createGuildBan(
    guildId: Snowflake,
    userId: Snowflake,
    options: CreateGuildBanEntity,
    reason?: string,
  ): Promise<void> {
    const result = CreateGuildBanSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.put(GuildRouter.ROUTES.guildBan(guildId, userId), {
      body: JSON.stringify(result.data),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#remove-guild-ban}
   */
  removeGuildBan(
    guildId: Snowflake,
    userId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.delete(GuildRouter.ROUTES.guildBan(guildId, userId), {
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#bulk-guild-ban}
   */
  bulkGuildBan(
    guildId: Snowflake,
    options: BulkGuildBanEntity,
    reason?: string,
  ): Promise<BulkGuildBanResponseEntity> {
    const result = CreateGuildBanSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.put(GuildRouter.ROUTES.bulkBan(guildId), {
      body: JSON.stringify(result.data),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-roles}
   */
  getGuildRoles(guildId: Snowflake): Promise<RoleEntity[]> {
    return this.get(GuildRouter.ROUTES.guildRoles(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-role}
   */
  getGuildRole(guildId: Snowflake, roleId: Snowflake): Promise<RoleEntity> {
    return this.get(GuildRouter.ROUTES.guildRole(guildId, roleId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-role}
   */
  createGuildRole(
    guildId: Snowflake,
    options: CreateGuildRoleEntity,
    reason?: string,
  ): Promise<RoleEntity> {
    const result = CreateGuildRoleSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.post(GuildRouter.ROUTES.guildRoles(guildId), {
      body: JSON.stringify(result.data),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role-positions}
   */
  modifyGuildRolePositions(
    guildId: Snowflake,
    options: ModifyGuildRolePositionsEntity,
  ): Promise<RoleEntity[]> {
    const result = ModifyGuildRolePositionsSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.patch(GuildRouter.ROUTES.guildRoles(guildId), {
      body: JSON.stringify(result.data),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-role}
   */
  modifyGuildRole(
    guildId: Snowflake,
    roleId: Snowflake,
    options: ModifyGuildRoleEntity,
    reason?: string,
  ): Promise<RoleEntity> {
    const result = ModifyGuildRoleSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.patch(GuildRouter.ROUTES.guildRole(guildId, roleId), {
      body: JSON.stringify(result.data),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-mfa-level}
   */
  modifyGuildMfaLevel(
    guildId: Snowflake,
    level: MfaLevel,
    reason?: string,
  ): Promise<number> {
    return this.post(GuildRouter.ROUTES.guildMfa(guildId), {
      body: JSON.stringify({ level }),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#delete-guild-role}
   */
  deleteGuildRole(
    guildId: Snowflake,
    roleId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.delete(GuildRouter.ROUTES.guildRole(guildId, roleId), {
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-prune-count}
   */
  getGuildPruneCount(
    guildId: Snowflake,
    query: GetGuildPruneCountQueryEntity = {},
  ): Promise<{ pruned: number }> {
    const result = GetGuildPruneCountQuerySchema.safeParse(query);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.get(GuildRouter.ROUTES.guildPrune(guildId), {
      query: result.data,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#begin-guild-prune}
   */
  beginGuildPrune(
    guildId: Snowflake,
    options: BeginGuildPruneEntity,
    reason?: string,
  ): Promise<{ pruned: number | null }> {
    const result = BeginGuildPruneSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.post(GuildRouter.ROUTES.guildPrune(guildId), {
      body: JSON.stringify(result.data),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-voice-regions}
   */
  getGuildVoiceRegions(guildId: Snowflake): Promise<VoiceRegionEntity[]> {
    return this.get(GuildRouter.ROUTES.guildRegions(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-invites}
   */
  getGuildInvites(
    guildId: Snowflake,
  ): Promise<(InviteEntity & InviteMetadataEntity)[]> {
    return this.get(GuildRouter.ROUTES.guildInvites(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-integrations}
   */
  getGuildIntegrations(guildId: Snowflake): Promise<IntegrationEntity[]> {
    return this.get(GuildRouter.ROUTES.guildIntegrations(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#delete-guild-integration}
   */
  deleteGuildIntegration(
    guildId: Snowflake,
    integrationId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.delete(
      GuildRouter.ROUTES.guildIntegration(guildId, integrationId),
      { reason },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-widget-settings}
   */
  getGuildWidgetSettings(
    guildId: Snowflake,
  ): Promise<GuildWidgetSettingsEntity> {
    return this.get(GuildRouter.ROUTES.guildWidgetSettings(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-widget}
   */
  modifyGuildWidget(
    guildId: Snowflake,
    options: ModifyGuildWidgetSettingsEntity,
    reason?: string,
  ): Promise<GuildWidgetSettingsEntity> {
    const result = ModifyGuildWidgetSettingsSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.patch(GuildRouter.ROUTES.guildWidgetSettings(guildId), {
      body: JSON.stringify(result.data),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-widget}
   */
  getGuildWidget(guildId: Snowflake): Promise<GuildWidgetEntity> {
    return this.get(GuildRouter.ROUTES.guildWidget(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-vanity-url}
   */
  getGuildVanityUrl(
    guildId: Snowflake,
  ): Promise<Pick<InviteEntity & InviteMetadataEntity, "code" | "uses">> {
    return this.get(GuildRouter.ROUTES.guildVanityUrl(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-widget-image}
   */
  getGuildWidgetImage(
    guildId: Snowflake,
    style: WidgetStyleOptions = WidgetStyleOptions.Shield,
  ): Promise<Buffer> {
    return this.get(GuildRouter.ROUTES.guildWidgetImage(guildId), {
      query: { style },
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-welcome-screen}
   */
  getGuildWelcomeScreen(guildId: Snowflake): Promise<WelcomeScreenEntity> {
    return this.get(GuildRouter.ROUTES.guildWelcomeScreen(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-welcome-screen}
   */
  modifyGuildWelcomeScreen(
    guildId: Snowflake,
    options: ModifyGuildWelcomeScreenEntity,
    reason?: string,
  ): Promise<WelcomeScreenEntity> {
    const result = ModifyGuildWelcomeScreenSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.patch(GuildRouter.ROUTES.guildWelcomeScreen(guildId), {
      body: JSON.stringify(result.data),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-onboarding}
   */
  getGuildOnboarding(guildId: Snowflake): Promise<GuildOnboardingEntity> {
    return this.get(GuildRouter.ROUTES.guildOnboarding(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-onboarding}
   */
  modifyGuildOnboarding(
    guildId: Snowflake,
    options: ModifyGuildOnboardingEntity,
    reason?: string,
  ): Promise<GuildOnboardingEntity> {
    const result = ModifyGuildOnboardingSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.put(GuildRouter.ROUTES.guildOnboarding(guildId), {
      body: JSON.stringify(result.data),
      reason,
    });
  }
}
