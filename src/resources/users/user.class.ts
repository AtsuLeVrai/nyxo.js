import type { CamelCasedProperties, OverrideProperties } from "type-fest";
import { BaseClass } from "../../bases/index.js";
import {
  BitField,
  Cdn,
  type CdnOptions,
  type DefaultUserAvatarUrl,
  type DynamicImageFormat,
  type FormattedUser,
  formatUser,
  type UserAvatarUrl,
  type UserBannerUrl,
} from "../../utils/index.js";
import type { UserFlags } from "./user.enums.js";
import type { UserObject } from "./user.types.js";

export class User
  extends BaseClass<UserObject>
  implements
    OverrideProperties<
      CamelCasedProperties<UserObject>,
      {
        flags: BitField<UserFlags>;
        publicFlags: BitField<UserFlags>;
      }
    >
{
  readonly id = this.data.id;
  readonly username = this.data.username;
  readonly discriminator = this.data.discriminator;
  readonly globalName = this.data.global_name;
  readonly avatar = this.data.avatar;
  readonly bot = this.data.bot;
  readonly system = this.data.system;
  readonly mfaEnabled = this.data.mfa_enabled;
  readonly banner = this.data.banner;
  readonly accentColor = this.data.accent_color;
  readonly locale = this.data.locale;
  readonly verified = this.data.verified;
  readonly email = this.data.email;
  readonly premiumType = this.data.premium_type;
  readonly avatarDecorationData = this.data.avatar_decoration_data;
  readonly collectibles = this.data.collectibles;
  readonly primaryGuild = this.data.primary_guild;

  private _flags?: BitField<UserFlags>;

  get flags(): BitField<UserFlags> {
    if (!this._flags) {
      this._flags = new BitField(this.data.flags);
    }
    return this._flags;
  }

  private _publicFlags?: BitField<UserFlags>;

  get publicFlags(): BitField<UserFlags> {
    if (!this._publicFlags) {
      this._publicFlags = new BitField(this.data.public_flags);
    }
    return this._publicFlags;
  }

  get displayName(): string {
    return this.globalName ?? this.username;
  }

  get tag(): `${string}#${string}` {
    return `${this.username}#${this.discriminator}`;
  }

  get isBot(): boolean {
    return this.bot ?? false;
  }

  get isSystem(): boolean {
    return this.system ?? false;
  }

  getAvatarURL(options?: CdnOptions<DynamicImageFormat>): UserAvatarUrl | null {
    if (!this.avatar) {
      return null;
    }

    return Cdn.userAvatarUrl(this.id, this.avatar, options);
  }

  getDefaultAvatarURL(): DefaultUserAvatarUrl {
    return Cdn.defaultAvatarByUserId(this.id);
  }

  getBannerURL(options?: CdnOptions<DynamicImageFormat>): UserBannerUrl | null {
    if (!this.banner) {
      return null;
    }

    return Cdn.userBanner(this.id, this.banner, options);
  }

  override toString(): FormattedUser<string> {
    return formatUser(this.id);
  }
}
