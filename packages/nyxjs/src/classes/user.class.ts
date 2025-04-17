import {
  type AvatarDecorationDataEntity,
  BitField,
  type Locale,
  type PremiumType,
  type Snowflake,
  type UserEntity,
  type UserFlags,
} from "@nyxjs/core";
import { BaseClass, Cacheable } from "../bases/index.js";
import type { EnforceCamelCase } from "../types/index.js";

@Cacheable("users")
export class User
  extends BaseClass<UserEntity>
  implements EnforceCamelCase<UserEntity>
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

  get banner(): string | null | undefined {
    return this.data.banner;
  }

  get accentColor(): number | null | undefined {
    return this.data.accent_color;
  }

  get locale(): Locale | undefined {
    return this.data.locale;
  }

  get verified(): boolean {
    return Boolean(this.data.verified);
  }

  get email(): string | null | undefined {
    return this.data.email;
  }

  get flags(): BitField<UserFlags> {
    return new BitField<UserFlags>(this.data.flags ?? 0n);
  }

  get premiumType(): PremiumType | undefined {
    return this.data.premium_type;
  }

  get publicFlags(): BitField<UserFlags> {
    return new BitField<UserFlags>(this.data.public_flags ?? 0n);
  }

  get avatarDecorationData(): AvatarDecorationDataEntity | null | undefined {
    return this.data.avatar_decoration_data;
  }
}
