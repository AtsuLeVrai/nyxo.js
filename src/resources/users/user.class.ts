import type { Client } from "../../core/index.js";
import type { UserEntity } from "./user.entity.js";

export type TransformToCamelCase<T> = {
  [K in keyof T as K extends string
    ? K extends `${infer P}_${infer Q}`
      ? `${P}${Capitalize<
          Q extends `${infer R}_${infer S}`
            ? `${R}${Capitalize<S extends `${infer T}_${infer U}` ? `${T}${Capitalize<U>}` : S>}`
            : Q
        >}`
      : K
    : // biome-ignore lint/suspicious/noExplicitAny: Need to work with any
      never]-?: any;
};

export class BaseClass<T extends object> {
  protected readonly client: Client;
  protected readonly rawData: T;

  constructor(client: Client, data: T) {
    this.client = client;
    this.rawData = data;
  }

  toJson(): Readonly<T> {
    return Object.freeze({ ...this.rawData });
  }
}

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
  readonly flags = this.rawData.flags;
  readonly premiumType = this.rawData.premium_type;
  readonly publicFlags = this.rawData.public_flags;
  readonly avatarDecorationData = this.rawData.avatar_decoration_data;
  readonly collectibles = this.rawData.collectibles;
  readonly primaryGuild = this.rawData.primary_guild;
}
