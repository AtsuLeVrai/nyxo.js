import { BaseClass } from "../../bases/index.js";
import {
  type AnimatedFormat,
  type AvatarDecorationUrl,
  BitField,
  Cdn,
  type CdnOptions,
  type DefaultUserAvatarUrl,
  type FormattedUser,
  formatUser,
  SnowflakeUtil,
  type TransformToCamelCase,
  type UserAvatarUrl,
  type UserBannerUrl,
} from "../../utils/index.js";
import {
  type ApplicationRoleConnectionEntity,
  type ConnectionEntity,
  type ConnectionService,
  isValidUsername,
  PremiumType,
  type UserEntity,
  type UserFlags,
} from "./user.entity.js";
import type {
  GroupDmCreateOptions,
  UserGuildsFetchParams,
  UserRoleConnectionUpdateOptions,
  UserUpdateOptions,
} from "./user.router.js";

export class User extends BaseClass<UserEntity> implements TransformToCamelCase<UserEntity> {
  readonly id = this.rawData.id;
  readonly username = this.rawData.username;
  readonly discriminator = this.rawData.discriminator;
  readonly globalName = this.rawData.global_name;
  readonly avatar = this.rawData.avatar;
  readonly bot = Boolean(this.rawData.bot);
  readonly system = Boolean(this.rawData.system);
  readonly mfaEnabled = Boolean(this.rawData.mfa_enabled);
  readonly banner = this.rawData.banner;
  readonly accentColor = this.rawData.accent_color;
  readonly locale = this.rawData.locale;
  readonly verified = Boolean(this.rawData.verified);
  readonly email = this.rawData.email;
  readonly flags = new BitField<UserFlags>(this.rawData.flags ?? 0n);
  readonly premiumType = this.rawData.premium_type;
  readonly publicFlags = new BitField<UserFlags>(this.rawData.public_flags ?? 0n);
  readonly avatarDecorationData = this.rawData.avatar_decoration_data;
  readonly primaryGuild = this.rawData.primary_guild;
  readonly collectibles = this.rawData.collectibles;

  get tag(): string {
    return this.discriminator === "0" ? this.username : `${this.username}#${this.discriminator}`;
  }

  get displayName(): string {
    return this.globalName ?? this.username;
  }

  get createdAt(): Date {
    return SnowflakeUtil.getDate(this.id);
  }

  get createdTimestamp(): number {
    return this.createdAt.getTime();
  }

  get avatarDecorationUrl(): AvatarDecorationUrl | null {
    const asset = this.avatarDecorationData?.asset;
    return asset ? Cdn.avatarDecoration(asset) : null;
  }

  get isPremium(): boolean {
    return (this.premiumType ?? PremiumType.None) !== PremiumType.None;
  }

  get isSelf(): boolean {
    return this.id === this.client.user.id;
  }

  get accountAge(): number {
    return Math.floor((Date.now() - this.createdTimestamp) / (1000 * 60 * 60 * 24));
  }

  getAvatarUrl(options?: CdnOptions<AnimatedFormat>): UserAvatarUrl | null {
    return this.avatar ? Cdn.userAvatar(this.id, this.avatar, options) : null;
  }

  getDefaultAvatarUrl(): DefaultUserAvatarUrl {
    if (this.discriminator === "0") {
      return Cdn.defaultUserAvatarSystem(this.id);
    }

    return Cdn.defaultUserAvatar(this.discriminator);
  }

  getDisplayAvatarUrl(options?: CdnOptions<AnimatedFormat>): UserAvatarUrl | DefaultUserAvatarUrl {
    return this.getAvatarUrl(options) ?? this.getDefaultAvatarUrl();
  }

  getBannerUrl(options?: CdnOptions<AnimatedFormat>): UserBannerUrl | null {
    return this.banner ? Cdn.userBanner(this.id, this.banner, options) : null;
  }

  getAccentColorHex(withHash = true): string | null {
    if (!this.accentColor) {
      return null;
    }

    const hex = this.accentColor.toString(16).padStart(6, "0");
    return withHash ? `#${hex}` : hex;
  }

  async fetchUser(userId: string): Promise<User> {
    const user = await this.client.rest.user.fetchUser(userId);
    return new User(this.client, user);
  }

  fetchConnections(): Promise<ConnectionEntity[]> {
    if (!this.isSelf) {
      throw new Error("You can only fetch connections for yourself");
    }

    return this.client.rest.user.fetchCurrentConnections();
  }

  async createDmChannel(): Promise<DmChannel> {
    const channel = await this.client.rest.user.createDmChannel(this.id);
    return new DmChannel(this.client, channel);
  }

  async send(content: string): Promise<Message> {
    const channel = await this.createDmChannel();
    return channel.send(content);
  }

  async createGroupDmChannel(options: GroupDmCreateOptions): Promise<DmChannel> {
    if (!this.isSelf) {
      throw new Error("You can only create group DMs as yourself");
    }

    const channel = await this.client.rest.user.createGroupDmChannel(options);
    return new DmChannel(this.client, channel);
  }

  async fetchGuilds(query?: UserGuildsFetchParams): Promise<Guild[]> {
    if (!this.isSelf) {
      throw new Error("You can only fetch guilds for yourself");
    }

    const guilds = await this.client.rest.user.fetchCurrentGuilds(query);
    return guilds.map((guild) => new Guild(this.client, guild));
  }

  async fetchGuildMember(guildId: string): Promise<GuildMember> {
    if (this.isSelf) {
      const member = await this.client.rest.user.fetchCurrentUserGuildMember(guildId);
      return new GuildMember(this.client, { ...member, guild_id: guildId });
    }

    const member = await this.client.rest.guild.fetchGuildMember(guildId, this.id);
    return new GuildMember(this.client, { ...member, guild_id: guildId });
  }

  fetchApplicationRoleConnection(applicationId: string): Promise<ApplicationRoleConnectionEntity> {
    if (!this.isSelf) {
      throw new Error("You can only fetch application role connections for yourself");
    }

    return this.client.rest.user.fetchApplicationRoleConnection(applicationId);
  }

  updateApplicationRoleConnection(
    applicationId: string,
    connection: UserRoleConnectionUpdateOptions,
  ): Promise<ApplicationRoleConnectionEntity> {
    if (!this.isSelf) {
      throw new Error("You can only update application role connections for yourself");
    }

    return this.client.rest.user.updateApplicationRoleConnection(applicationId, connection);
  }

  async leaveGuild(guildId: string): Promise<boolean> {
    if (!this.isSelf) {
      throw new Error("You can only leave guilds for yourself");
    }

    try {
      await this.client.rest.user.leaveGuild(guildId);
      return true;
    } catch {
      return false;
    }
  }

  async updateProfile(options: UserUpdateOptions): Promise<User> {
    if (!this.isSelf) {
      throw new Error("You can only update your own profile");
    }

    const updatedUserData = await this.client.rest.user.updateCurrentUser(options);
    return new User(this.client, updatedUserData);
  }

  override toString(): FormattedUser {
    return formatUser(this.id);
  }

  hasFlag(flag: UserFlags): boolean {
    return this.flags.has(flag);
  }

  hasPublicFlag(flag: UserFlags): boolean {
    return this.publicFlags.has(flag);
  }

  hasBanner(): boolean {
    return this.banner !== null;
  }

  hasAvatarDecoration(): boolean {
    return this.avatarDecorationData !== null;
  }

  hasGuildTag(): boolean {
    return this.primaryGuild !== null && this.primaryGuild !== undefined;
  }

  isGuildTagDisplayed(): boolean {
    return this.hasGuildTag() && this.primaryGuild?.identity_enabled === true;
  }

  getGuildTagText(): string | null {
    return this.primaryGuild?.tag ?? null;
  }

  getGuildTagBadgeUrl(): string | null {
    return this.primaryGuild?.badge && this.primaryGuild.identity_guild_id
      ? Cdn.guildIcon(this.primaryGuild.identity_guild_id, this.primaryGuild.badge)
      : null;
  }

  getGuildTagGuildId(): string | null {
    return this.primaryGuild?.identity_guild_id ?? null;
  }

  hasValidUsername(): boolean {
    return isValidUsername(this.username);
  }

  async refresh(): Promise<User> {
    const userData = await this.client.rest.user.fetchUser(this.id);
    return new User(this.client, userData);
  }

  async isMemberOf(guildId: string): Promise<boolean> {
    try {
      await this.fetchGuildMember(guildId);
      return true;
    } catch {
      return false;
    }
  }

  async getServiceConnections(type?: ConnectionService): Promise<ConnectionEntity[]> {
    const connections = await this.fetchConnections();

    if (type) {
      return connections.filter((conn) => conn.type === type);
    }

    return connections;
  }
}
