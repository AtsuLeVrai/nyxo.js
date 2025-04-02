import {
  type AvatarDecorationDataEntity,
  BitFieldManager,
  type Locale,
  type PremiumType,
  type Snowflake,
  type UserEntity,
  type UserFlags,
} from "@nyxjs/core";
import { BaseModal } from "../bases/index.js";

export class User extends BaseModal<UserEntity> {
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

  get flags(): BitFieldManager<UserFlags> {
    return new BitFieldManager<UserFlags>(this.data.flags ?? 0n);
  }

  get premiumType(): PremiumType | null {
    return this.data.premium_type ?? null;
  }

  get publicFlags(): BitFieldManager<UserFlags> {
    return new BitFieldManager<UserFlags>(this.data.public_flags ?? 0n);
  }

  get avatarDecorationData(): AvatarDecorationDataEntity | null {
    return this.data.avatar_decoration_data ?? null;
  }
}
