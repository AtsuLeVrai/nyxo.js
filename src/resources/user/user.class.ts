import { BaseClass } from "../../bases/index.js";
import { BitField, type CamelCaseKeys } from "../../utils/index.js";
import type { ConnectionEntity, UserEntity } from "./user.entity.js";

export class Connection
  extends BaseClass<ConnectionEntity>
  implements CamelCaseKeys<ConnectionEntity>
{
  readonly id = this.rawData.id;
  readonly name = this.rawData.name;
  readonly type = this.rawData.type;
  readonly revoked = Boolean(this.rawData.revoked);
  readonly integrations = this.rawData.integrations;
  readonly verified = this.rawData.verified;
  readonly friendSync = this.rawData.friend_sync;
  readonly showActivity = this.rawData.show_activity;
  readonly twoWayLink = this.rawData.two_way_link;
  readonly visibility = this.rawData.visibility;
}

export class User extends BaseClass<UserEntity> implements CamelCaseKeys<UserEntity> {
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
  readonly flags = new BitField(this.rawData.flags);
  readonly premiumType = this.rawData.premium_type;
  readonly publicFlags = new BitField(this.rawData.public_flags);
  readonly avatarDecorationData = this.rawData.avatar_decoration_data;
  readonly primaryGuild = this.rawData.primary_guild;
  readonly collectibles = this.rawData.collectibles;
}
