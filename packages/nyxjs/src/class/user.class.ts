import {
  type AvatarDecorationDataEntity,
  BitFieldManager,
  type FormattedUser,
  type Locale,
  PremiumType,
  type Snowflake,
  SnowflakeManager,
  UserEntity,
  UserFlags,
  formatUser,
} from "@nyxjs/core";
import {
  type AnimatedImageOptions,
  Cdn,
  type CreateGroupDmSchema,
} from "@nyxjs/rest";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { Channel } from "./channel.class.js";
import { GuildMember } from "./guild-member.class.js";

export class User extends BaseClass<UserEntity> {
  readonly #flags: BitFieldManager<UserFlags>;
  readonly #publicFlags: BitFieldManager<UserFlags>;

  constructor(
    client: Client,
    entity: Partial<z.input<typeof UserEntity>> = {},
  ) {
    super(client, UserEntity, entity);
    this.#flags = new BitFieldManager(this.entity.flags);
    this.#publicFlags = new BitFieldManager(this.entity.public_flags);
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get username(): string {
    return this.entity.username;
  }

  get discriminator(): string {
    return this.entity.discriminator;
  }

  get globalName(): string | null {
    return this.entity.global_name ?? null;
  }

  get avatar(): string | null {
    return this.entity.avatar ?? null;
  }

  get bot(): boolean {
    return Boolean(this.entity.bot);
  }

  get system(): boolean {
    return Boolean(this.entity.system);
  }

  get mfaEnabled(): boolean {
    return Boolean(this.entity.mfa_enabled);
  }

  get banner(): string | null {
    return this.entity.banner ?? null;
  }

  get accentColor(): number | null {
    return this.entity.accent_color ?? null;
  }

  get locale(): Locale | null {
    return this.entity.locale ?? null;
  }

  get verified(): boolean {
    return Boolean(this.entity.verified);
  }

  get email(): string | null {
    return this.entity.email ?? null;
  }

  get flags(): BitFieldManager<UserFlags> {
    return this.#flags;
  }

  get premiumType(): PremiumType | null {
    return this.entity.premium_type ?? null;
  }

  get publicFlags(): BitFieldManager<UserFlags> {
    return this.#publicFlags;
  }

  get avatarDecorationData(): AvatarDecorationDataEntity | null {
    return this.entity.avatar_decoration_data
      ? { ...this.entity.avatar_decoration_data }
      : null;
  }

  get createdTimestamp(): number {
    const snowflake = new SnowflakeManager(this.id);
    return snowflake.getTimestamp();
  }

  get createdAt(): Date {
    return new Date(this.createdTimestamp);
  }

  get accountAge(): number {
    return Math.floor(
      (Date.now() - this.createdTimestamp) / (24 * 60 * 60 * 1000),
    );
  }

  get accentColorRbg(): { r: number; g: number; b: number } | null {
    if (this.accentColor === null) {
      return null;
    }
    return {
      r: (this.accentColor >> 16) & 255,
      g: (this.accentColor >> 8) & 255,
      b: this.accentColor & 255,
    };
  }

  getAvatarUrl(options?: AnimatedImageOptions): string {
    if (this.avatar) {
      return Cdn.userAvatar(this.id, this.avatar, options);
    }

    if (this.discriminator === "0") {
      return Cdn.defaultUserAvatarSystem(this.id);
    }

    return Cdn.defaultUserAvatar(this.discriminator);
  }

  getBannerUrl(options?: AnimatedImageOptions): string | null {
    return this.banner ? Cdn.userBanner(this.id, this.banner, options) : null;
  }

  getAvatarDecorationUrl(): string | null {
    return this.avatarDecorationData?.asset
      ? Cdn.avatarDecoration(this.avatarDecorationData.asset)
      : null;
  }

  hasAnimatedAvatar(): boolean {
    return this.avatar?.startsWith("a_") ?? false;
  }

  hasAnimatedBanner(): boolean {
    return this.banner?.startsWith("a_") ?? false;
  }

  getDisplayName(): string {
    return this.globalName ?? this.username;
  }

  getTag(): string {
    return `${this.username}#${this.discriminator}`;
  }

  isSystemBot(): boolean {
    return this.bot && this.system;
  }

  isWebhook(): boolean {
    return this.bot && this.discriminator === "0000";
  }

  isDiscordOfficial(): boolean {
    return this.flags.has(UserFlags.Staff);
  }

  isVerifiedDeveloper(): boolean {
    return this.flags.has(UserFlags.VerifiedDeveloper);
  }

  isProgramModerator(): boolean {
    return this.flags.has(UserFlags.CertifiedModerator);
  }

  isPartner(): boolean {
    return this.flags.has(UserFlags.Partner);
  }

  isEarlySupporter(): boolean {
    return this.flags.has(UserFlags.PremiumEarlySupporter);
  }

  hasNitro(): boolean {
    return this.premiumType !== null;
  }

  hasNitroBasic(): boolean {
    return this.premiumType === PremiumType.NitroBasic;
  }

  hasNitroClassic(): boolean {
    return this.premiumType === PremiumType.NitroClassic;
  }

  hasNitroFull(): boolean {
    return this.premiumType === PremiumType.Nitro;
  }

  getAccentColorHex(): string | null {
    return this.accentColor !== null
      ? `#${this.accentColor.toString(16).padStart(6, "0")}`
      : null;
  }

  getMention(): FormattedUser {
    return formatUser(this.id);
  }

  async fetch(): Promise<User> {
    const data = await this.client.rest.users.getUser(this.id);
    return new User(this.client, data);
  }

  async createDm(): Promise<Channel> {
    const data = await this.client.rest.users.createDm(this.id);
    return new Channel(this.client, data);
  }

  async createGroupDm(options: CreateGroupDmSchema): Promise<Channel> {
    const data = await this.client.rest.users.createGroupDm(options);
    return new Channel(this.client, data);
  }

  async getGuildMember(guildId: Snowflake): Promise<GuildMember> {
    const data = await this.client.rest.guilds.getGuildMember(guildId, this.id);
    return new GuildMember(this.client, data);
  }

  addToThread(channelId: Snowflake): Promise<void> {
    return this.client.rest.channels.addThreadMember(channelId, this.id);
  }

  removeFromThread(channelId: Snowflake): Promise<void> {
    return this.client.rest.channels.removeThreadMember(channelId, this.id);
  }

  isOlderThan(days: number): boolean {
    const now = Date.now();
    const accountAge = now - this.createdTimestamp;
    return accountAge > days * 24 * 60 * 60 * 1000;
  }

  hasBadge(badge: UserFlags): boolean {
    return this.flags.has(badge);
  }

  hasCustomizedProfile(): boolean {
    return Boolean(
      this.banner ||
        this.accentColor ||
        this.avatarDecorationData ||
        this.globalName,
    );
  }

  isSuspiciousAccount(): boolean {
    const isNewAccount = this.accountAge < 7;
    return isNewAccount && !this.verified;
  }

  hasMfa(): boolean {
    return this.mfaEnabled;
  }

  usernameSimilarityWith(user: User): number {
    const str1 = this.username.toLowerCase();
    const str2 = user.username.toLowerCase();

    if (str1 === str2) {
      return 1;
    }

    let matches = 0;
    const maxLength = Math.max(str1.length, str2.length);

    for (let i = 0; i < Math.min(str1.length, str2.length); i++) {
      if (str1[i] === str2[i]) {
        matches++;
      }
    }

    return matches / maxLength;
  }

  async canReceiveDm(): Promise<boolean> {
    try {
      await this.createDm();
      return true;
    } catch {
      return false;
    }
  }

  toJson(): UserEntity {
    return { ...this.entity };
  }
}

export const UserSchema = z.instanceof(User);
