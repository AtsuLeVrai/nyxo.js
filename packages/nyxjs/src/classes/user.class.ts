import {
  ApplicationRoleConnectionEntity,
  AvatarDecorationDataEntity,
  BitFieldManager,
  type ChannelEntity,
  ConnectionEntity,
  type ConnectionService,
  type FormattedUser,
  type GuildMemberEntity,
  type IntegrationEntity,
  type LocaleKey,
  type PremiumType,
  SnowflakeManager,
  UserEntity,
  UserFlags,
  formatUser,
} from "@nyxjs/core";
import {
  type BaseImageOptionsEntity,
  Cdn,
  type ModifyCurrentUserEntity,
  type Rest,
} from "@nyxjs/rest";
import type { z } from "zod";
import { fromError } from "zod-validation-error";

export class ApplicationRoleConnection {
  readonly #data: ApplicationRoleConnectionEntity;

  constructor(
    data: Partial<z.input<typeof ApplicationRoleConnectionEntity>> = {},
  ) {
    try {
      this.#data = ApplicationRoleConnectionEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get platformName(): string | null {
    return this.#data.platform_name;
  }

  get platformUsername(): string | null {
    return this.#data.platform_username;
  }

  get metadata(): Record<string, string> {
    return this.#data.metadata;
  }

  static from(
    data: Partial<z.input<typeof ApplicationRoleConnectionEntity>>,
  ): ApplicationRoleConnection {
    return new ApplicationRoleConnection(data);
  }

  toJson(): ApplicationRoleConnectionEntity {
    try {
      return ApplicationRoleConnectionEntity.parse(this.#data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }
}

export class Connection {
  readonly #data: ConnectionEntity;

  constructor(data: Partial<z.input<typeof ConnectionEntity>> = {}) {
    try {
      this.#data = ConnectionEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get id(): string {
    return this.#data.id;
  }

  get name(): string {
    return this.#data.name;
  }

  get type(): ConnectionService {
    return this.#data.type;
  }

  get revoked(): boolean {
    return Boolean(this.#data.revoked);
  }

  get integrations(): Partial<IntegrationEntity>[] | null {
    return this.#data.integrations ?? null;
  }

  get verified(): boolean {
    return Boolean(this.#data.verified);
  }

  get friendSync(): boolean {
    return Boolean(this.#data.friend_sync);
  }

  get showActivity(): boolean {
    return Boolean(this.#data.show_activity);
  }

  get twoWayLink(): boolean {
    return Boolean(this.#data.two_way_link);
  }

  get visibility(): number {
    return this.#data.visibility;
  }

  static from(data: Partial<z.input<typeof ConnectionEntity>>): Connection {
    return new Connection(data);
  }

  toJson(): ConnectionEntity {
    try {
      return ConnectionEntity.parse(this.#data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }
}

export class AvatarDecorationData {
  readonly #data: AvatarDecorationDataEntity;

  constructor(data: Partial<z.input<typeof AvatarDecorationDataEntity>> = {}) {
    try {
      this.#data = AvatarDecorationDataEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get asset(): string {
    return this.#data.asset;
  }

  get skuId(): string {
    return this.#data.sku_id;
  }

  static from(
    data: Partial<z.input<typeof AvatarDecorationDataEntity>>,
  ): AvatarDecorationData {
    return new AvatarDecorationData(data);
  }

  toJson(): AvatarDecorationDataEntity {
    try {
      return AvatarDecorationDataEntity.parse(this.#data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }
}

export class User {
  readonly #rest: Rest;
  readonly #data: UserEntity;
  readonly #flags: BitFieldManager<UserFlags>;
  readonly #publicFlags: BitFieldManager<UserFlags>;

  constructor(rest: Rest, data: Partial<z.input<typeof UserEntity>> = {}) {
    this.#rest = rest;

    try {
      this.#data = UserEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.#flags = new BitFieldManager<UserFlags>(this.#data.flags);
    this.#publicFlags = new BitFieldManager<UserFlags>(this.#data.public_flags);
  }

  get id(): string {
    return this.#data.id;
  }

  get username(): string {
    return this.#data.username;
  }

  get discriminator(): string {
    return this.#data.discriminator;
  }

  get globalName(): string | null {
    return this.#data.global_name;
  }

  get avatar(): string | null {
    return this.#data.avatar ?? null;
  }

  get bot(): boolean {
    return Boolean(this.#data.bot);
  }

  get system(): boolean {
    return Boolean(this.#data.system);
  }

  get mfaEnabled(): boolean {
    return Boolean(this.#data.mfa_enabled);
  }

  get locale(): LocaleKey | null {
    return this.#data.locale ?? null;
  }

  get verified(): boolean {
    return Boolean(this.#data.verified);
  }

  get email(): string | null {
    return this.#data.email ?? null;
  }

  get flags(): BitFieldManager<UserFlags> {
    return this.#flags.clone();
  }

  get premiumType(): PremiumType | null {
    return this.#data.premium_type ?? null;
  }

  get publicFlags(): BitFieldManager<UserFlags> {
    return this.#publicFlags.clone();
  }

  get avatarDecorationData(): AvatarDecorationData | null {
    return this.#data.avatar_decoration_data
      ? new AvatarDecorationData(this.#data.avatar_decoration_data)
      : null;
  }

  get createdTimestamp(): number {
    return SnowflakeManager.from(this.id).getTimestamp();
  }

  get createdAt(): Date {
    return new Date(this.createdTimestamp);
  }

  static from(rest: Rest, data: Partial<z.input<typeof UserEntity>>): User {
    return new User(rest, data);
  }

  hasAvatar(): boolean {
    return this.avatar !== null;
  }

  hasBanner(): boolean {
    return this.#data.banner !== null;
  }

  isVerified(): boolean {
    return this.verified;
  }

  hasMfa(): boolean {
    return this.mfaEnabled;
  }

  avatarUrl(options?: BaseImageOptionsEntity): string {
    if (!this.avatar) {
      return Cdn.defaultUserAvatar(this.discriminator);
    }

    return Cdn.userAvatar(this.id, this.avatar, options);
  }

  bannerUrl(options?: BaseImageOptionsEntity): string | null {
    if (!this.#data.banner) {
      return null;
    }

    return Cdn.userBanner(this.id, this.#data.banner, options);
  }

  defaultAvatarUrl(): string {
    return Cdn.defaultUserAvatar(this.discriminator);
  }

  async createDmChannel(): Promise<ChannelEntity> {
    const response = await this.#rest.users.createDm(this.id);
    return response.data;
  }

  async fetchGuildMember(guildId: string): Promise<GuildMemberEntity> {
    const response = await this.#rest.guilds.getGuildMember(guildId, this.id);
    return response.data;
  }

  async ban(
    guildId: string,
    deleteMessageSeconds?: number,
    reason?: string,
  ): Promise<void> {
    await this.#rest.guilds.createGuildBan(
      guildId,
      this.id,
      {
        delete_message_seconds: deleteMessageSeconds,
      },
      reason,
    );
  }

  async unban(guildId: string, reason?: string): Promise<void> {
    await this.#rest.guilds.removeGuildBan(guildId, this.id, reason);
  }

  async kick(guildId: string, reason?: string): Promise<void> {
    await this.#rest.guilds.removeGuildMember(guildId, this.id, reason);
  }

  async fetchConnections(): Promise<Connection[]> {
    if (!(await this.isSelf())) {
      return [];
    }

    const response = await this.#rest.users.getCurrentUserConnections();
    return response.data.map((connection) => new Connection(connection));
  }

  isBot(): boolean {
    return Boolean(this.#data.bot);
  }

  isSystem(): boolean {
    return Boolean(this.#data.system);
  }

  async isSelf(): Promise<boolean> {
    const response = await this.#rest.users.getCurrentUser();
    return response.data.id === this.id;
  }

  isPremium(): boolean {
    return this.#data.premium_type !== null && this.#data.premium_type !== 0;
  }

  hasFlag(flag: UserFlags): boolean {
    return this.#flags.has(flag);
  }

  hasFlags(flags: UserFlags[]): boolean {
    return flags.every((flag) => this.hasFlag(flag));
  }

  getFlagNames(): string[] {
    return Object.entries(UserFlags)
      .filter(([_, flag]) => typeof flag === "number" && this.hasFlag(flag))
      .map(([name]) => name);
  }

  async edit(options: ModifyCurrentUserEntity): Promise<User> {
    if (!(await this.isSelf())) {
      throw new Error("You can only edit your own user");
    }

    const response = await this.#rest.users.modifyCurrentUser(options);
    return new User(this.#rest, response.data);
  }

  toString(): FormattedUser {
    return formatUser(this.id);
  }

  equals(other: User): boolean {
    return this.id === other.id;
  }

  toJson(): UserEntity {
    try {
      return UserEntity.parse(this.#data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }
}
