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
import type { z } from "zod";
import { fromZodError } from "zod-validation-error";
import type { Rest } from "../rest.js";
import {
  AddGuildMemberEntity,
  BeginGuildPruneEntity,
  BulkGuildBanEntity,
  type BulkGuildBanResponseEntity,
  CreateGuildBanEntity,
  CreateGuildChannelEntity,
  CreateGuildEntity,
  CreateGuildRoleEntity,
  GetGuildBansQueryEntity,
  GetGuildPruneCountQueryEntity,
  type ListActiveGuildThreadsEntity,
  ListGuildMembersQueryEntity,
  ModifyGuildChannelPositionsEntity,
  ModifyGuildEntity,
  ModifyGuildMemberEntity,
  ModifyGuildOnboardingEntity,
  ModifyGuildRoleEntity,
  ModifyGuildRolePositionsEntity,
  ModifyGuildWelcomeScreenEntity,
  ModifyGuildWidgetSettingsEntity,
  SearchGuildMembersQueryEntity,
  type WidgetStyleOptions,
} from "../schemas/guild.schema.js";
import type { HttpResponse } from "../types/index.js";

export class GuildRouter {
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

  #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#create-guild}
   */
  createGuild(options: CreateGuildEntity): Promise<HttpResponse<GuildEntity>> {
    const result = CreateGuildEntity.safeParse(options);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      throw new Error(validationError.message);
    }

    return this.#rest.post(GuildRouter.ROUTES.guilds, {
      body: JSON.stringify(result.data),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild}
   */
  getGuild(
    guildId: Snowflake,
    withCounts = false,
  ): Promise<HttpResponse<GuildEntity>> {
    return this.#rest.get(GuildRouter.ROUTES.guild(guildId), {
      query: { with_counts: withCounts },
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-preview}
   */
  getPreview(guildId: Snowflake): Promise<HttpResponse<GuildEntity>> {
    return this.#rest.get(GuildRouter.ROUTES.guildPreview(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild}
   */
  modifyGuild(
    guildId: Snowflake,
    options: ModifyGuildEntity,
    reason?: string,
  ): Promise<HttpResponse<GuildEntity>> {
    const result = ModifyGuildEntity.safeParse(options);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      throw new Error(validationError.message);
    }

    return this.#rest.patch(GuildRouter.ROUTES.guild(guildId), {
      body: JSON.stringify(result.data),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#delete-guild}
   */
  deleteGuild(guildId: Snowflake): Promise<HttpResponse<void>> {
    return this.#rest.delete(GuildRouter.ROUTES.guild(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-channels}
   */
  getChannels(guildId: Snowflake): Promise<HttpResponse<ChannelEntity[]>> {
    return this.#rest.get(GuildRouter.ROUTES.guildChannels(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-channel}
   */
  createGuildChannel(
    guildId: Snowflake,
    options: CreateGuildChannelEntity,
    reason?: string,
  ): Promise<HttpResponse<ChannelEntity>> {
    const result = CreateGuildChannelEntity.safeParse(options);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      throw new Error(validationError.message);
    }

    return this.#rest.post(GuildRouter.ROUTES.guildChannels(guildId), {
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
  ): Promise<HttpResponse<void>> {
    const result = ModifyGuildChannelPositionsEntity.safeParse(options);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      throw new Error(validationError.message);
    }

    return this.#rest.patch(GuildRouter.ROUTES.guildChannels(guildId), {
      body: JSON.stringify(result.data),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#list-active-guild-threads}
   */
  listActiveGuildThreads(
    guildId: Snowflake,
  ): Promise<HttpResponse<ListActiveGuildThreadsEntity[]>> {
    return this.#rest.get(GuildRouter.ROUTES.threadsActive(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-member}
   */
  getGuildMember(
    guildId: Snowflake,
    userId: Snowflake,
  ): Promise<HttpResponse<GuildMemberEntity>> {
    return this.#rest.get(GuildRouter.ROUTES.guildMember(guildId, userId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#list-guild-members}
   */
  listGuildMembers(
    guildId: Snowflake,
    query: z.input<typeof ListGuildMembersQueryEntity> = {},
  ): Promise<HttpResponse<GuildMemberEntity[]>> {
    const result = ListGuildMembersQueryEntity.safeParse(query);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      throw new Error(validationError.message);
    }

    return this.#rest.get(GuildRouter.ROUTES.guildMembers(guildId), {
      query: result.data,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#search-guild-members}
   */
  searchGuildMembers(
    guildId: Snowflake,
    query: SearchGuildMembersQueryEntity,
  ): Promise<HttpResponse<GuildMemberEntity[]>> {
    const result = SearchGuildMembersQueryEntity.safeParse(query);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      throw new Error(validationError.message);
    }

    return this.#rest.get(GuildRouter.ROUTES.searchMembers(guildId), {
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
  ): Promise<HttpResponse<GuildMemberEntity>> {
    const result = AddGuildMemberEntity.safeParse(options);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      throw new Error(validationError.message);
    }

    return this.#rest.put(GuildRouter.ROUTES.guildMember(guildId, userId), {
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
  ): Promise<HttpResponse<GuildMemberEntity>> {
    const result = ModifyGuildMemberEntity.safeParse(options);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      throw new Error(validationError.message);
    }

    return this.#rest.patch(GuildRouter.ROUTES.guildMember(guildId, userId), {
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
  ): Promise<HttpResponse<GuildMemberEntity>> {
    return this.#rest.patch(GuildRouter.ROUTES.guildCurrentMember(guildId), {
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
  ): Promise<HttpResponse<GuildMemberEntity>> {
    return this.#rest.patch(
      GuildRouter.ROUTES.guildCurrentMemberNick(guildId),
      {
        body: JSON.stringify({ nick: nickname }),
        reason,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#add-guild-member-role}
   */
  addGuildMemberRole(
    guildId: Snowflake,
    userId: Snowflake,
    roleId: Snowflake,
    reason?: string,
  ): Promise<HttpResponse<void>> {
    return this.#rest.put(
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
  ): Promise<HttpResponse<void>> {
    return this.#rest.delete(
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
  ): Promise<HttpResponse<void>> {
    return this.#rest.delete(GuildRouter.ROUTES.guildMember(guildId, userId), {
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-bans}
   */
  getGuildBans(
    guildId: Snowflake,
    query: z.input<typeof GetGuildBansQueryEntity> = {},
  ): Promise<HttpResponse<BanEntity[]>> {
    const result = GetGuildBansQueryEntity.safeParse(query);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      throw new Error(validationError.message);
    }

    return this.#rest.get(GuildRouter.ROUTES.guildBans(guildId), {
      query: result.data,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-ban}
   */
  getGuildBan(
    guildId: Snowflake,
    userId: Snowflake,
  ): Promise<HttpResponse<BanEntity>> {
    return this.#rest.get(GuildRouter.ROUTES.guildBan(guildId, userId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-ban}
   */
  createGuildBan(
    guildId: Snowflake,
    userId: Snowflake,
    options: CreateGuildBanEntity,
    reason?: string,
  ): Promise<HttpResponse<void>> {
    const result = CreateGuildBanEntity.safeParse(options);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      throw new Error(validationError.message);
    }

    return this.#rest.put(GuildRouter.ROUTES.guildBan(guildId, userId), {
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
  ): Promise<HttpResponse<void>> {
    return this.#rest.delete(GuildRouter.ROUTES.guildBan(guildId, userId), {
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
  ): Promise<HttpResponse<BulkGuildBanResponseEntity>> {
    const result = BulkGuildBanEntity.safeParse(options);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      throw new Error(validationError.message);
    }

    return this.#rest.put(GuildRouter.ROUTES.bulkBan(guildId), {
      body: JSON.stringify(result.data),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-roles}
   */
  getGuildRoles(guildId: Snowflake): Promise<HttpResponse<RoleEntity[]>> {
    return this.#rest.get(GuildRouter.ROUTES.guildRoles(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-role}
   */
  getGuildRole(
    guildId: Snowflake,
    roleId: Snowflake,
  ): Promise<HttpResponse<RoleEntity>> {
    return this.#rest.get(GuildRouter.ROUTES.guildRole(guildId, roleId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-role}
   */
  createGuildRole(
    guildId: Snowflake,
    options: CreateGuildRoleEntity,
    reason?: string,
  ): Promise<HttpResponse<RoleEntity>> {
    const result = CreateGuildRoleEntity.safeParse(options);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      throw new Error(validationError.message);
    }

    return this.#rest.post(GuildRouter.ROUTES.guildRoles(guildId), {
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
  ): Promise<HttpResponse<RoleEntity[]>> {
    const result = ModifyGuildRolePositionsEntity.safeParse(options);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      throw new Error(validationError.message);
    }

    return this.#rest.patch(GuildRouter.ROUTES.guildRoles(guildId), {
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
  ): Promise<HttpResponse<RoleEntity>> {
    const result = ModifyGuildRoleEntity.safeParse(options);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      throw new Error(validationError.message);
    }

    return this.#rest.patch(GuildRouter.ROUTES.guildRole(guildId, roleId), {
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
  ): Promise<HttpResponse<number>> {
    return this.#rest.post(GuildRouter.ROUTES.guildMfa(guildId), {
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
  ): Promise<HttpResponse<void>> {
    return this.#rest.delete(GuildRouter.ROUTES.guildRole(guildId, roleId), {
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-prune-count}
   */
  getGuildPruneCount(
    guildId: Snowflake,
    query: z.input<typeof GetGuildPruneCountQueryEntity> = {},
  ): Promise<HttpResponse<{ pruned: number }>> {
    const result = GetGuildPruneCountQueryEntity.safeParse(query);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      throw new Error(validationError.message);
    }

    return this.#rest.get(GuildRouter.ROUTES.guildPrune(guildId), {
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
  ): Promise<HttpResponse<{ pruned: number | null }>> {
    const result = BeginGuildPruneEntity.safeParse(options);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      throw new Error(validationError.message);
    }

    return this.#rest.post(GuildRouter.ROUTES.guildPrune(guildId), {
      body: JSON.stringify(result.data),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-voice-regions}
   */
  getGuildVoiceRegions(
    guildId: Snowflake,
  ): Promise<HttpResponse<VoiceRegionEntity[]>> {
    return this.#rest.get(GuildRouter.ROUTES.guildRegions(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-invites}
   */
  getGuildInvites(
    guildId: Snowflake,
  ): Promise<HttpResponse<(InviteEntity & InviteMetadataEntity)[]>> {
    return this.#rest.get(GuildRouter.ROUTES.guildInvites(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-integrations}
   */
  getGuildIntegrations(
    guildId: Snowflake,
  ): Promise<HttpResponse<IntegrationEntity[]>> {
    return this.#rest.get(GuildRouter.ROUTES.guildIntegrations(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#delete-guild-integration}
   */
  deleteGuildIntegration(
    guildId: Snowflake,
    integrationId: Snowflake,
    reason?: string,
  ): Promise<HttpResponse<void>> {
    return this.#rest.delete(
      GuildRouter.ROUTES.guildIntegration(guildId, integrationId),
      { reason },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-widget-settings}
   */
  getGuildWidgetSettings(
    guildId: Snowflake,
  ): Promise<HttpResponse<GuildWidgetSettingsEntity>> {
    return this.#rest.get(GuildRouter.ROUTES.guildWidgetSettings(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-widget}
   */
  modifyGuildWidget(
    guildId: Snowflake,
    options: ModifyGuildWidgetSettingsEntity,
    reason?: string,
  ): Promise<HttpResponse<GuildWidgetSettingsEntity>> {
    const result = ModifyGuildWidgetSettingsEntity.safeParse(options);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      throw new Error(validationError.message);
    }

    return this.#rest.patch(GuildRouter.ROUTES.guildWidgetSettings(guildId), {
      body: JSON.stringify(result.data),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-widget}
   */
  getGuildWidget(guildId: Snowflake): Promise<HttpResponse<GuildWidgetEntity>> {
    return this.#rest.get(GuildRouter.ROUTES.guildWidget(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-vanity-url}
   */
  getGuildVanityUrl(
    guildId: Snowflake,
  ): Promise<
    HttpResponse<Pick<InviteEntity & InviteMetadataEntity, "code" | "uses">>
  > {
    return this.#rest.get(GuildRouter.ROUTES.guildVanityUrl(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-widget-image}
   */
  getGuildWidgetImage(
    guildId: Snowflake,
    style: WidgetStyleOptions = "shield",
  ): Promise<HttpResponse<Buffer>> {
    return this.#rest.get(GuildRouter.ROUTES.guildWidgetImage(guildId), {
      query: { style },
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-welcome-screen}
   */
  getGuildWelcomeScreen(
    guildId: Snowflake,
  ): Promise<HttpResponse<WelcomeScreenEntity>> {
    return this.#rest.get(GuildRouter.ROUTES.guildWelcomeScreen(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-welcome-screen}
   */
  modifyGuildWelcomeScreen(
    guildId: Snowflake,
    options: ModifyGuildWelcomeScreenEntity,
    reason?: string,
  ): Promise<HttpResponse<WelcomeScreenEntity>> {
    const result = ModifyGuildWelcomeScreenEntity.safeParse(options);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      throw new Error(validationError.message);
    }

    return this.#rest.patch(GuildRouter.ROUTES.guildWelcomeScreen(guildId), {
      body: JSON.stringify(result.data),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-onboarding}
   */
  getGuildOnboarding(
    guildId: Snowflake,
  ): Promise<HttpResponse<GuildOnboardingEntity>> {
    return this.#rest.get(GuildRouter.ROUTES.guildOnboarding(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-onboarding}
   */
  modifyGuildOnboarding(
    guildId: Snowflake,
    options: ModifyGuildOnboardingEntity,
    reason?: string,
  ): Promise<HttpResponse<GuildOnboardingEntity>> {
    const result = ModifyGuildOnboardingEntity.safeParse(options);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      throw new Error(validationError.message);
    }

    return this.#rest.put(GuildRouter.ROUTES.guildOnboarding(guildId), {
      body: JSON.stringify(result.data),
      reason,
    });
  }
}
