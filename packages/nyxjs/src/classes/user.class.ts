import {
  type AvatarDecorationDataEntity,
  BitFieldManager,
  type ChannelEntity,
  type FormattedUser,
  type GuildMemberEntity,
  type LocaleKey,
  PremiumType,
  type Snowflake,
  UserEntity,
  UserFlags,
  formatUser,
} from "@nyxjs/core";
import { type AnimatedImageOptionsEntity, Cdn } from "@nyxjs/rest";
import { fromError } from "zod-validation-error";
import type { Client } from "../core/index.js";

export class User {
  readonly #client: Client;
  readonly #data: UserEntity;
  readonly #flagsBitField: BitFieldManager<UserFlags>;
  readonly #publicFlagsBitField: BitFieldManager<UserFlags>;

  constructor(client: Client, data: UserEntity) {
    this.#client = client;

    try {
      this.#data = UserEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.#flagsBitField = new BitFieldManager<UserFlags>(this.#data.flags ?? 0);
    this.#publicFlagsBitField = new BitFieldManager<UserFlags>(
      this.#data.public_flags ?? 0,
    );
  }

  get id(): Snowflake {
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
    return this.#data.avatar;
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

  get banner(): string | null {
    return this.#data.banner ?? null;
  }

  get accentColor(): number | null {
    return this.#data.accent_color ?? null;
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
    return this.#flagsBitField;
  }

  get premiumType(): PremiumType {
    return this.#data.premium_type ?? PremiumType.None;
  }

  get publicFlags(): BitFieldManager<UserFlags> {
    return this.#publicFlagsBitField;
  }

  get avatarDecorationData(): AvatarDecorationDataEntity | null {
    return this.#data.avatar_decoration_data ?? null;
  }

  get tag(): string {
    return `${this.username}#${this.discriminator}`;
  }

  toString(): FormattedUser {
    return formatUser(this.id);
  }

  getAvatarUrl(options?: AnimatedImageOptionsEntity): string | null {
    if (!this.avatar) {
      return null;
    }

    return Cdn.userAvatar(this.id, this.avatar, options);
  }

  getDefaultAvatarUrl(): string {
    return Cdn.defaultUserAvatar(this.discriminator);
  }

  getBannerUrl(options?: AnimatedImageOptionsEntity): string | null {
    if (!this.banner) {
      return null;
    }

    return Cdn.userBanner(this.id, this.banner, options);
  }

  createDm(): Promise<ChannelEntity> {
    return this.#client.rest.users.createDm(this.id);
  }

  equals(user: User | Snowflake): boolean {
    return user instanceof User ? user.id === this.id : user === this.id;
  }

  getGuildMember(guildId: Snowflake): Promise<GuildMemberEntity> {
    return this.#client.rest.guilds.getGuildMember(guildId, this.id);
  }

  isVerifiedBot(): boolean {
    return this.bot && this.publicFlags.has(UserFlags.VerifiedBot);
  }

  isSystemUser(): boolean {
    return this.system;
  }

  isStaff(): boolean {
    return this.flags.has(UserFlags.Staff);
  }

  isPartner(): boolean {
    return this.flags.has(UserFlags.Partner);
  }

  isHypesquad(): boolean {
    return this.flags.has(UserFlags.HypeSquad);
  }

  isBugHunterLevel1(): boolean {
    return this.flags.has(UserFlags.BugHunterLevel1);
  }

  isBugHunterLevel2(): boolean {
    return this.flags.has(UserFlags.BugHunterLevel2);
  }

  isVerifiedDeveloper(): boolean {
    return this.flags.has(UserFlags.VerifiedDeveloper);
  }

  isActiveDeveloper(): boolean {
    return this.flags.has(UserFlags.ActiveDeveloper);
  }

  isCertifiedModerator(): boolean {
    return this.flags.has(UserFlags.CertifiedModerator);
  }
}
