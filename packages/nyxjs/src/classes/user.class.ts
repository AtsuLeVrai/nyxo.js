import {
  type ApplicationRoleConnectionEntity,
  type AvatarDecorationDataEntity,
  BitField,
  type ConnectionEntity,
  type FormattedUser,
  type GuildMemberEntity,
  type Locale,
  type PremiumType,
  type Snowflake,
  type UserEntity,
  type UserFlags,
  formatUser,
} from "@nyxojs/core";
import type { GuildCreateEntity } from "@nyxojs/gateway";
import {
  type AnimatedImageOptions,
  Cdn,
  type CreateGroupDmSchema,
  type GetCurrentUserGuildsQuerySchema,
  type UpdateCurrentUserApplicationRoleConnectionSchema,
} from "@nyxojs/rest";
import type { CamelCasedProperties, CamelCasedPropertiesDeep } from "type-fest";
import { BaseClass, Cacheable } from "../bases/index.js";
import type { Enforce, GuildBased } from "../types/index.js";
import {
  toCamelCasedProperties,
  toCamelCasedPropertiesDeep,
} from "../utils/index.js";
import { DmChannel } from "./channel.class.js";
import { Guild, GuildMember } from "./guild.class.js";

@Cacheable("users")
export class User
  extends BaseClass<UserEntity>
  implements Enforce<CamelCasedProperties<UserEntity>>
{
  get id(): Snowflake {
    return this.data.id;
  }

  get username(): string {
    return this.data.username;
  }

  get discriminator(): string {
    return this.data.discriminator;
  }

  get globalName(): string | null {
    return this.data.global_name;
  }

  get avatar(): string | null {
    return this.data.avatar;
  }

  get bot(): boolean {
    return Boolean(this.data.bot);
  }

  get system(): boolean {
    return Boolean(this.data.system);
  }

  get mfaEnabled(): boolean {
    return Boolean(this.data.mfa_enabled);
  }

  get banner(): string | null {
    return this.data.banner ?? null;
  }

  get accentColor(): number | null {
    return this.data.accent_color ?? null;
  }

  get locale(): Locale | null {
    return this.data.locale ?? null;
  }

  get verified(): boolean {
    return Boolean(this.data.verified);
  }

  get email(): string | null {
    return this.data.email ?? null;
  }

  get flags(): BitField<UserFlags> {
    return new BitField<UserFlags>(this.data.flags ?? 0n);
  }

  get premiumType(): PremiumType | null {
    return this.data.premium_type ?? null;
  }

  get publicFlags(): BitField<UserFlags> {
    return new BitField<UserFlags>(this.data.public_flags ?? 0n);
  }

  get avatarDecorationData(): CamelCasedProperties<AvatarDecorationDataEntity> | null {
    if (!this.data.avatar_decoration_data) {
      return null;
    }

    return toCamelCasedProperties(this.data.avatar_decoration_data);
  }

  get tag(): string {
    return `${this.username}#${this.discriminator}`;
  }

  get displayName(): string {
    return this.globalName ?? this.username;
  }

  get createdAt(): Date {
    return new Date(Number(BigInt(this.id) >> 22n) + 1420070400000);
  }

  get createdTimestamp(): number {
    return this.createdAt.getTime();
  }

  get avatarDecorationUrl(): string | null {
    if (!this.avatarDecorationData) {
      return null;
    }
    return Cdn.avatarDecoration(this.avatarDecorationData.asset);
  }

  get isBot(): boolean {
    return this.bot;
  }

  get isSystem(): boolean {
    return this.system;
  }

  get isVerified(): boolean {
    return this.verified;
  }

  get isPremium(): boolean {
    return this.premiumType !== null && this.premiumType !== 0;
  }

  getAvatarUrl(options: Partial<AnimatedImageOptions> = {}): string | null {
    if (!this.avatar) {
      return this.getDefaultAvatarUrl();
    }
    return Cdn.userAvatar(this.id, this.avatar, options);
  }

  getDefaultAvatarUrl(): string {
    if (this.discriminator === "0") {
      return Cdn.defaultUserAvatarSystem(this.id);
    }
    return Cdn.defaultUserAvatar(this.discriminator);
  }

  getDisplayAvatarUrl(options: Partial<AnimatedImageOptions> = {}): string {
    return this.getAvatarUrl(options) ?? this.getDefaultAvatarUrl();
  }

  getBannerUrl(options: Partial<AnimatedImageOptions> = {}): string | null {
    if (!this.banner) {
      return null;
    }
    return Cdn.userBanner(this.id, this.banner, options);
  }

  async fetchUser(userId: Snowflake): Promise<User> {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const user = await this.client.rest.users.fetchUser(userId);
    return new User(this.client, user);
  }

  async fetchConnections(): Promise<
    CamelCasedPropertiesDeep<ConnectionEntity>[]
  > {
    if (this.id !== this.client.user.id) {
      throw new Error("You can only fetch connections for yourself");
    }

    const connections =
      await this.client.rest.users.fetchCurrentUserConnections();
    return connections.map((connection) => {
      return toCamelCasedPropertiesDeep(connection);
    });
  }

  async createDmChannel(): Promise<DmChannel> {
    const channel = await this.client.rest.users.createDmChannel(this.id);
    return new DmChannel(this.client, channel);
  }

  // async send(
  //   channelId: Snowflake,
  //   message: string,
  // ): Promise<DmChannel> {
  //   const channel = await this.createDmChannel()
  //   return channel.send(message);
  // }

  async createGroupDmChannel(options: CreateGroupDmSchema): Promise<DmChannel> {
    if (this.id !== this.client.user.id) {
      throw new Error("You can only create group DMs as yourself");
    }

    const channel = await this.client.rest.users.createGroupDmChannel(options);
    return new DmChannel(this.client, channel);
  }

  async fetchGuilds(query?: GetCurrentUserGuildsQuerySchema): Promise<Guild[]> {
    if (this.id !== this.client.user.id) {
      throw new Error("You can only fetch guilds for yourself");
    }

    const guilds = await this.client.rest.users.fetchCurrentUserGuilds(query);
    return guilds.map(
      (guild) => new Guild(this.client, guild as GuildCreateEntity),
    );
  }

  async fetchGuildMember(guildId: Snowflake): Promise<GuildMember> {
    if (this.id === this.client.user.id) {
      const member =
        await this.client.rest.users.fetchCurrentUserGuildMember(guildId);
      return new GuildMember(
        this.client,
        member as GuildBased<GuildMemberEntity>,
      );
    }

    const member = await this.client.rest.guilds.fetchGuildMember(
      guildId,
      this.id,
    );
    return new GuildMember(
      this.client,
      member as GuildBased<GuildMemberEntity>,
    );
  }

  fetchApplicationRoleConnection(
    applicationId: Snowflake,
  ): Promise<ApplicationRoleConnectionEntity> {
    if (this.id !== this.client.user.id) {
      throw new Error(
        "You can only fetch application role connections for yourself",
      );
    }

    return this.client.rest.users.fetchApplicationRoleConnection(applicationId);
  }

  updateApplicationRoleConnection(
    applicationId: Snowflake,
    connection: UpdateCurrentUserApplicationRoleConnectionSchema,
  ): Promise<ApplicationRoleConnectionEntity> {
    if (this.id !== this.client.user.id) {
      throw new Error(
        "You can only update application role connections for yourself",
      );
    }

    return this.client.rest.users.updateApplicationRoleConnection(
      applicationId,
      connection,
    );
  }

  async leaveGuild(guildId: Snowflake): Promise<boolean> {
    if (this.id !== this.client.user.id) {
      throw new Error("You can only leave guilds for yourself");
    }

    try {
      await this.client.rest.users.leaveGuild(guildId);
      return true;
    } catch {
      return false;
    }
  }

  override toString(): FormattedUser {
    return formatUser(this.id);
  }

  hasMfaEnabled(): boolean {
    return this.mfaEnabled;
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
}
