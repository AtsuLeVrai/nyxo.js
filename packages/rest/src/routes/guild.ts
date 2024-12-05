import type {
  BanEntity,
  ChannelEntity,
  GuildEntity,
  GuildMemberEntity,
  GuildOnboardingEntity,
  IntegrationEntity,
  InviteEntity,
  RoleEntity,
  Snowflake,
  VoiceRegionEntity,
  WelcomeScreenEntity,
} from "@nyxjs/core";
import type {
  AddMemberEntity,
  BanCreateEntity,
  BeginPruneEntity,
  CreateGuildEntity,
  CreateRoleEntity,
  GetGuildQueryEntity,
  GetMembersQueryEntity,
  GetPruneQueryEntity,
  ModifyCurrentMemberEntity,
  ModifyGuildEntity,
  ModifyMemberEntity,
  ModifyRolePositionsEntity,
  SearchMembersQueryEntity,
} from "../types/index.js";
import { BaseRouter } from "./base.js";

export class GuildRouter extends BaseRouter {
  static routes = {
    guilds: "/guilds",
    guild: (guildId: Snowflake): `/guilds/${Snowflake}` => {
      return `/guilds/${guildId}` as const;
    },
    guildPreview: (guildId: Snowflake): `/guilds/${Snowflake}/preview` => {
      return `/guilds/${guildId}/preview` as const;
    },
    guildChannels: (guildId: Snowflake): `/guilds/${Snowflake}/channels` => {
      return `/guilds/${guildId}/channels` as const;
    },
    guildMembers: (guildId: Snowflake): `/guilds/${Snowflake}/members` => {
      return `/guilds/${guildId}/members` as const;
    },
    guildMember: (
      guildId: Snowflake,
      userId: Snowflake,
    ): `/guilds/${Snowflake}/members/${Snowflake}` => {
      return `/guilds/${guildId}/members/${userId}` as const;
    },
    guildCurrentMember: (
      guildId: Snowflake,
    ): `/guilds/${Snowflake}/members/@me` => {
      return `/guilds/${guildId}/members/@me` as const;
    },
    guildMemberRole: (
      guildId: Snowflake,
      userId: Snowflake,
      roleId: Snowflake,
    ): `/guilds/${Snowflake}/members/${Snowflake}/roles/${Snowflake}` => {
      return `/guilds/${guildId}/members/${userId}/roles/${roleId}` as const;
    },
    guildBans: (guildId: Snowflake): `/guilds/${Snowflake}/bans` => {
      return `/guilds/${guildId}/bans` as const;
    },
    guildBan: (
      guildId: Snowflake,
      userId: Snowflake,
    ): `/guilds/${Snowflake}/bans/${Snowflake}` => {
      return `/guilds/${guildId}/bans/${userId}` as const;
    },
    guildRoles: (guildId: Snowflake): `/guilds/${Snowflake}/roles` => {
      return `/guilds/${guildId}/roles` as const;
    },
    guildRole: (
      guildId: Snowflake,
      roleId: Snowflake,
    ): `/guilds/${Snowflake}/roles/${Snowflake}` => {
      return `/guilds/${guildId}/roles/${roleId}` as const;
    },
    guildMfa: (guildId: Snowflake): `/guilds/${Snowflake}/mfa` => {
      return `/guilds/${guildId}/mfa` as const;
    },
    guildPrune: (guildId: Snowflake): `/guilds/${Snowflake}/prune` => {
      return `/guilds/${guildId}/prune` as const;
    },
    guildRegions: (guildId: Snowflake): `/guilds/${Snowflake}/regions` => {
      return `/guilds/${guildId}/regions` as const;
    },
    guildInvites: (guildId: Snowflake): `/guilds/${Snowflake}/invites` => {
      return `/guilds/${guildId}/invites` as const;
    },
    guildIntegrations: (
      guildId: Snowflake,
    ): `/guilds/${Snowflake}/integrations` => {
      return `/guilds/${guildId}/integrations` as const;
    },
    guildIntegration: (
      guildId: Snowflake,
      integrationId: Snowflake,
    ): `/guilds/${Snowflake}/integrations/${Snowflake}` => {
      return `/guilds/${guildId}/integrations/${integrationId}` as const;
    },
    guildWidgetSettings: (
      guildId: Snowflake,
    ): `/guilds/${Snowflake}/widget` => {
      return `/guilds/${guildId}/widget` as const;
    },
    guildWidget: (guildId: Snowflake): `/guilds/${Snowflake}/widget.json` => {
      return `/guilds/${guildId}/widget.json` as const;
    },
    guildVanityUrl: (guildId: Snowflake): `/guilds/${Snowflake}/vanity-url` => {
      return `/guilds/${guildId}/vanity-url` as const;
    },
    guildWidgetImage: (
      guildId: Snowflake,
    ): `/guilds/${Snowflake}/widget.png` => {
      return `/guilds/${guildId}/widget.png` as const;
    },
    guildWelcomeScreen: (
      guildId: Snowflake,
    ): `/guilds/${Snowflake}/welcome-screen` => {
      return `/guilds/${guildId}/welcome-screen` as const;
    },
    guildOnboarding: (
      guildId: Snowflake,
    ): `/guilds/${Snowflake}/onboarding` => {
      return `/guilds/${guildId}/onboarding` as const;
    },
  } as const;

  create(guild: CreateGuildEntity): Promise<GuildEntity> {
    return this.post(GuildRouter.routes.guilds, {
      body: JSON.stringify(guild),
    });
  }

  getGuild(
    guildId: Snowflake,
    query?: GetGuildQueryEntity,
  ): Promise<GuildEntity> {
    return this.get(GuildRouter.routes.guild(guildId), { query });
  }

  getPreview(guildId: Snowflake): Promise<GuildEntity> {
    return this.get(GuildRouter.routes.guildPreview(guildId));
  }

  modify(
    guildId: Snowflake,
    guild: ModifyGuildEntity,
    reason?: string,
  ): Promise<GuildEntity> {
    return this.patch(GuildRouter.routes.guild(guildId), {
      body: JSON.stringify(guild),
      reason,
    });
  }

  deleteGuild(guildId: Snowflake): Promise<void> {
    return this.delete(GuildRouter.routes.guild(guildId));
  }

  getChannels(guildId: Snowflake): Promise<ChannelEntity[]> {
    return this.get(GuildRouter.routes.guildChannels(guildId));
  }

  createChannel(
    guildId: Snowflake,
    channel: Partial<ChannelEntity>,
    reason?: string,
  ): Promise<ChannelEntity> {
    return this.post(GuildRouter.routes.guildChannels(guildId), {
      body: JSON.stringify(channel),
      reason,
    });
  }

  modifyChannelPositions(
    guildId: Snowflake,
    channels: { id: Snowflake; position?: number | null }[],
  ): Promise<void> {
    return this.patch(GuildRouter.routes.guildChannels(guildId), {
      body: JSON.stringify(channels),
    });
  }

  getMember(guildId: Snowflake, userId: Snowflake): Promise<GuildMemberEntity> {
    return this.get(GuildRouter.routes.guildMember(guildId, userId));
  }

  listMembers(
    guildId: Snowflake,
    query?: GetMembersQueryEntity,
  ): Promise<GuildMemberEntity[]> {
    return this.get(GuildRouter.routes.guildMembers(guildId), { query });
  }

  searchMembers(
    guildId: Snowflake,
    query: SearchMembersQueryEntity,
  ): Promise<GuildMemberEntity[]> {
    return this.get(`${GuildRouter.routes.guildMembers(guildId)}/search`, {
      query,
    });
  }

  addMember(
    guildId: Snowflake,
    userId: Snowflake,
    member: AddMemberEntity,
  ): Promise<GuildMemberEntity> {
    return this.put(GuildRouter.routes.guildMember(guildId, userId), {
      body: JSON.stringify(member),
    });
  }

  modifyMember(
    guildId: Snowflake,
    userId: Snowflake,
    member: ModifyMemberEntity,
    reason?: string,
  ): Promise<GuildMemberEntity> {
    return this.patch(GuildRouter.routes.guildMember(guildId, userId), {
      body: JSON.stringify(member),
      reason,
    });
  }

  modifyCurrentMember(
    guildId: Snowflake,
    member: ModifyCurrentMemberEntity,
    reason?: string,
  ): Promise<GuildMemberEntity> {
    return this.patch(GuildRouter.routes.guildCurrentMember(guildId), {
      body: JSON.stringify(member),
      reason,
    });
  }

  addMemberRole(
    guildId: Snowflake,
    userId: Snowflake,
    roleId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.put(
      GuildRouter.routes.guildMemberRole(guildId, userId, roleId),
      { reason },
    );
  }

  removeMemberRole(
    guildId: Snowflake,
    userId: Snowflake,
    roleId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.delete(
      GuildRouter.routes.guildMemberRole(guildId, userId, roleId),
      { reason },
    );
  }

  removeMember(
    guildId: Snowflake,
    userId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.delete(GuildRouter.routes.guildMember(guildId, userId), {
      reason,
    });
  }

  getBans(guildId: Snowflake): Promise<BanEntity[]> {
    return this.get(GuildRouter.routes.guildBans(guildId));
  }

  getBan(guildId: Snowflake, userId: Snowflake): Promise<BanEntity> {
    return this.get(GuildRouter.routes.guildBan(guildId, userId));
  }

  createBan(
    guildId: Snowflake,
    userId: Snowflake,
    ban: BanCreateEntity,
    reason?: string,
  ): Promise<void> {
    return this.put(GuildRouter.routes.guildBan(guildId, userId), {
      body: JSON.stringify(ban),
      reason,
    });
  }

  removeBan(
    guildId: Snowflake,
    userId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.delete(GuildRouter.routes.guildBan(guildId, userId), {
      reason,
    });
  }

  getRoles(guildId: Snowflake): Promise<RoleEntity[]> {
    return this.get(GuildRouter.routes.guildRoles(guildId));
  }

  getRole(guildId: Snowflake, roleId: Snowflake): Promise<RoleEntity> {
    return this.get(GuildRouter.routes.guildRole(guildId, roleId));
  }

  createRole(
    guildId: Snowflake,
    role: CreateRoleEntity,
    reason?: string,
  ): Promise<RoleEntity> {
    return this.post(GuildRouter.routes.guildRoles(guildId), {
      body: JSON.stringify(role),
      reason,
    });
  }

  modifyRolePositions(
    guildId: Snowflake,
    roles: ModifyRolePositionsEntity[],
  ): Promise<RoleEntity[]> {
    return this.patch(GuildRouter.routes.guildRoles(guildId), {
      body: JSON.stringify(roles),
    });
  }

  modifyRole(
    guildId: Snowflake,
    roleId: Snowflake,
    role: Partial<CreateRoleEntity>,
    reason?: string,
  ): Promise<RoleEntity> {
    return this.patch(GuildRouter.routes.guildRole(guildId, roleId), {
      body: JSON.stringify(role),
      reason,
    });
  }

  deleteRole(
    guildId: Snowflake,
    roleId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.delete(GuildRouter.routes.guildRole(guildId, roleId), {
      reason,
    });
  }

  getPruneCount(
    guildId: Snowflake,
    query?: GetPruneQueryEntity,
  ): Promise<{ pruned: number }> {
    return this.get(GuildRouter.routes.guildPrune(guildId), { query });
  }

  beginPrune(
    guildId: Snowflake,
    prune: BeginPruneEntity,
    reason?: string,
  ): Promise<{ pruned: number | null }> {
    return this.post(GuildRouter.routes.guildPrune(guildId), {
      body: JSON.stringify(prune),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-voice-regions}
   */
  getVoiceRegions(guildId: Snowflake): Promise<VoiceRegionEntity[]> {
    return this.get(GuildRouter.routes.guildRegions(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-invites}
   */
  getInvites(guildId: Snowflake): Promise<InviteEntity[]> {
    return this.get(GuildRouter.routes.guildInvites(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-integrations}
   */
  getIntegrations(guildId: Snowflake): Promise<IntegrationEntity[]> {
    return this.get(GuildRouter.routes.guildIntegrations(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#delete-guild-integration}
   */
  deleteIntegration(
    guildId: Snowflake,
    integrationId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.delete(
      GuildRouter.routes.guildIntegration(guildId, integrationId),
      { reason },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-widget-settings}
   */
  getWidgetSettings(
    guildId: Snowflake,
  ): Promise<{ enabled: boolean; channel_id: Snowflake | null }> {
    return this.get(GuildRouter.routes.guildWidgetSettings(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-widget}
   */
  modifyWidget(
    guildId: Snowflake,
    widget: { enabled: boolean; channel_id: Snowflake | null },
    reason?: string,
  ): Promise<{ enabled: boolean; channel_id: Snowflake | null }> {
    return this.patch(GuildRouter.routes.guildWidgetSettings(guildId), {
      body: JSON.stringify(widget),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-widget}
   */
  getWidget(guildId: Snowflake): Promise<{
    id: Snowflake;
    name: string;
    instant_invite: string | null;
    channels: Partial<ChannelEntity>[];
    members: Partial<GuildMemberEntity>[];
    presence_count: number;
  }> {
    return this.get(GuildRouter.routes.guildWidget(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-vanity-url}
   */
  getVanityUrl(
    guildId: Snowflake,
  ): Promise<{ code: string | null; uses: number }> {
    return this.get(GuildRouter.routes.guildVanityUrl(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-widget-image}
   */
  getWidgetImage(
    guildId: Snowflake,
    style?: "shield" | "banner1" | "banner2" | "banner3" | "banner4",
  ): Promise<Buffer> {
    return this.get(GuildRouter.routes.guildWidgetImage(guildId), {
      query: { style },
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-welcome-screen}
   */
  getWelcomeScreen(guildId: Snowflake): Promise<WelcomeScreenEntity> {
    return this.get(GuildRouter.routes.guildWelcomeScreen(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-welcome-screen}
   */
  modifyWelcomeScreen(
    guildId: Snowflake,
    welcomeScreen: Partial<WelcomeScreenEntity>,
    reason?: string,
  ): Promise<WelcomeScreenEntity> {
    return this.patch(GuildRouter.routes.guildWelcomeScreen(guildId), {
      body: JSON.stringify(welcomeScreen),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-onboarding}
   */
  getOnboarding(guildId: Snowflake): Promise<GuildOnboardingEntity> {
    return this.get(GuildRouter.routes.guildOnboarding(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-onboarding}
   */
  modifyOnboarding(
    guildId: Snowflake,
    onboarding: GuildOnboardingEntity,
    reason?: string,
  ): Promise<GuildOnboardingEntity> {
    return this.put(GuildRouter.routes.guildOnboarding(guildId), {
      body: JSON.stringify(onboarding),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/guild#modify-guild-mfa-level}
   */
  modifyMfaLevel(
    guildId: Snowflake,
    level: number,
    reason?: string,
  ): Promise<number> {
    return this.post(GuildRouter.routes.guildMfa(guildId), {
      body: JSON.stringify({ level }),
      reason,
    });
  }
}
