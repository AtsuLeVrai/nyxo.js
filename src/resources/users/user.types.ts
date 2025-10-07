import type { Locale } from "../constants.js";
import type { IntegrationEntity } from "../guild.js";
import type {
  ConnectionVisibilityTypes,
  NameplatePalettes,
  PremiumTypes,
  Services,
  UserFlags,
} from "./user.enums.js";

export interface AvatarDecorationDataObject {
  readonly asset: string;

  readonly sku_id: string;
}

export interface NameplateObject {
  readonly asset: string;

  readonly label: string;

  readonly palette: NameplatePalettes;

  readonly sku_id: string;
}

export interface CollectiblesObject {
  readonly nameplate?: NameplateObject;
}

export interface UserPrimaryGuildEntity {
  readonly badge?: string | null;

  readonly identity_enabled?: boolean | null;

  readonly identity_guild_id?: string | null;

  readonly tag?: string | null;
}

export interface UserObject {
  readonly id: string;

  readonly username: string;

  readonly discriminator: string;

  readonly global_name: string | null;

  readonly avatar: string | null;

  readonly bot?: boolean;

  readonly system?: boolean;

  readonly mfa_enabled?: boolean;

  readonly banner?: string | null;

  readonly accent_color?: number | null;

  readonly locale?: Locale;

  readonly verified?: boolean;

  readonly email?: string | null;

  readonly flags?: UserFlags;

  readonly premium_type?: PremiumTypes;

  readonly public_flags?: UserFlags;

  readonly avatar_decoration_data?: AvatarDecorationDataObject | null;

  readonly collectibles?: CollectiblesObject | null;

  readonly primary_guild?: UserPrimaryGuildEntity | null;
}

export interface ConnectionObject {
  readonly id: string;

  readonly name: string;

  readonly type: Services;

  readonly revoked?: boolean;

  readonly integrations?: Partial<IntegrationEntity>[];

  readonly verified: boolean;

  readonly friend_sync: boolean;

  readonly show_activity: boolean;

  readonly two_way_link: boolean;

  readonly visibility: ConnectionVisibilityTypes;
}

export interface ApplicationRoleConnectionObject {
  readonly platform_name: string | null;

  readonly platform_username: string | null;

  readonly metadata: Record<string, string>;
}
