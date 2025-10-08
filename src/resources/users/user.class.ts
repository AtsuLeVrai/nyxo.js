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
import type { DMChannelEntity } from "../channel.js";
import type { GuildEntity, GuildMemberEntity } from "../guild.js";
import type {
  CreateDMParams,
  CreateGroupDMParams,
  GetCurrentUserGuildsQuery,
  ModifyCurrentUserParams,
  UpdateCurrentUserApplicationRoleConnectionParams,
  UserAPI,
} from "./user.api.js";
import type { UserFlags } from "./user.enums.js";
import type {
  ApplicationRoleConnectionObject,
  ConnectionObject,
  UserObject,
} from "./user.types.js";

export class User
  extends BaseClass<UserObject>
  implements
    OverrideProperties<
      CamelCasedProperties<UserObject> & UserAPI,
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

  getUser(_userId: string): Promise<UserObject> {
    throw new Error("Method not implemented.");
  }

  getCurrentUser(): Promise<UserObject> {
    throw new Error("Method not implemented.");
  }

  modifyCurrentUser(_params: ModifyCurrentUserParams): Promise<UserObject> {
    throw new Error("Method not implemented.");
  }

  getCurrentUserGuilds(_query?: GetCurrentUserGuildsQuery): Promise<Partial<GuildEntity>[]> {
    throw new Error("Method not implemented.");
  }

  getCurrentUserGuildMember(_guildId: string): Promise<GuildMemberEntity> {
    throw new Error("Method not implemented.");
  }

  leaveGuild(_guildId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  createDM(_params: CreateDMParams): Promise<DMChannelEntity> {
    throw new Error("Method not implemented.");
  }

  createGroupDM(_params: CreateGroupDMParams): Promise<DMChannelEntity> {
    throw new Error("Method not implemented.");
  }

  getCurrentUserConnections(): Promise<ConnectionObject[]> {
    throw new Error("Method not implemented.");
  }

  getCurrentUserApplicationRoleConnection(
    _applicationId: string,
  ): Promise<ApplicationRoleConnectionObject> {
    throw new Error("Method not implemented.");
  }

  updateCurrentUserApplicationRoleConnection(
    _applicationId: string,
    _paramss: UpdateCurrentUserApplicationRoleConnectionParams,
  ): Promise<ApplicationRoleConnectionObject> {
    throw new Error("Method not implemented.");
  }

  override toString(): FormattedUser<string> {
    return formatUser(this.id);
  }
}
