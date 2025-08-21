import type { Snowflake } from "../common/index.js";
import type { Locale } from "../constants/index.js";

export enum UserFlags {
  Staff = 1 << 0,
  Partner = 1 << 1,
  HypeSquad = 1 << 2,
  BugHunterLevel1 = 1 << 3,
  HypeSquadOnlineHouse1 = 1 << 6,
  HypeSquadOnlineHouse2 = 1 << 7,
  HypeSquadOnlineHouse3 = 1 << 8,
  PremiumEarlySupporter = 1 << 9,
  TeamPseudoUser = 1 << 10,
  BugHunterLevel2 = 1 << 14,
  VerifiedBot = 1 << 16,
  VerifiedDeveloper = 1 << 17,
  CertifiedModerator = 1 << 18,
  BotHttpInteractions = 1 << 19,
  ActiveDeveloper = 1 << 22,
}

export enum PremiumType {
  None = 0,
  NitroClassic = 1,
  Nitro = 2,
  NitroBasic = 3,
}

export enum VisibilityType {
  None = 0,
  Everyone = 1,
}

export enum Services {
  AmazonMusic = "AmazonMusic",
  Battlenet = "Battlenet",
  Bungie = "Bungie",
  Bluesky = "Bluesky",
  Crunchyroll = "Crunchyroll",
  Domain = "Domain",
  Ebay = "Ebay",
  EpicGames = "EpicGames",
  Facebook = "Facebook",
  Github = "Github",
  Instagram = "Instagram",
  // biome-ignore lint/nursery/noSecrets: This is a public enum, not a secret
  LeagueOfLegends = "LeagueOfLegends",
  Mastodon = "Mastodon",
  Paypal = "Paypal",
  Playstation = "Playstation",
  Reddit = "Reddit",
  RiotGames = "RiotGames",
  Roblox = "Roblox",
  Spotify = "Spotify",
  Skype = "Skype",
  Steam = "Steam",
  Tiktok = "Tiktok",
  Twitch = "Twitch",
  Twitter = "Twitter",
  Xbox = "Xbox",
  Youtube = "Youtube",
}

export enum NameplatePalette {
  Crimson = "Crimson",
  Berry = "Berry",
  Sky = "Sky",
  Teal = "Teal",
  Forest = "Forest",
  BubbleGum = "BubbleGum",
  Violet = "Violet",
  Cobalt = "Cobalt",
  Clover = "Clover",
  Lemon = "Lemon",
  White = "White",
}

export interface UserObject {
  id: Snowflake;
  username: string;
  discriminator: string;
  global_name: string | null;
  avatar: string | null;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  banner?: string | null;
  accent_color?: number | null;
  locale?: Locale;
  verified?: boolean;
  email?: string | null;
  flags?: number | UserFlags;
  premium_type?: PremiumType;
  public_flags?: number | UserFlags;
  avatar_decoration_data?: AvatarDecorationData | null;
  collectibles?: CollectiblesObject | null;
  primary_guild?: UserPrimaryGuildObject | null;
}

export interface UserPrimaryGuildObject {
  identity_guild_id: Snowflake | null;
  identity_enabled: boolean | null;
  tag: string | null;
  badge: string | null;
}

export interface AvatarDecorationData {
  asset: string;
  sku_id: Snowflake;
}

export interface CollectiblesObject {
  nameplate?: NameplateObject;
}

export interface NameplateObject {
  sku_id: Snowflake;
  asset: string;
  label: string;
  palette: NameplatePalette;
}

export interface ConnectionObject {
  id: string;
  name: string;
  type: Services;
  revoked?: boolean;
  integrations?: unknown[];
  verified: boolean;
  friend_sync: boolean;
  show_activity: boolean;
  two_way_link: boolean;
  visibility: VisibilityType;
}

export interface ApplicationRoleConnectionObject {
  platform_name: string | null;
  platform_username: string | null;
  metadata: Record<string, string>;
}

/*
type CamelCase<S extends string> = S extends `${infer P}_${infer Q}`
  ? `${P}${Capitalize<CamelCase<Q>>}`
  : S;

type Capitalize<S extends string> = S extends `${infer P}${infer Q}` ? `${Uppercase<P>}${Q}` : S;

export type PropsToCamel<T> = T extends Array<infer U>
  ? PropsToCamel<U>[]
  : T extends object
    ? {
        [K in keyof T as CamelCase<K & string>]: PropsToCamel<T[K]>;
      }
    : T;

export type Enforce<T extends object, PreserveValueTypes extends boolean = false> = {
  [K in keyof T]-?: PreserveValueTypes extends true
    ? T[K] extends null | undefined
      ? NonNullable<T[K]>
      : T[K]
    : // biome-ignore lint/suspicious/noExplicitAny: This is a utility type, so we allow any type here.
      any;
};

export class User implements Enforce<PropsToCamel<UserObject>> {
  readonly #data: UserObject;
  readonly id = this.#data.id;
  readonly username = this.#data.username;
  readonly discriminator = this.#data.discriminator;
  readonly globalName = this.#data.global_name;
  readonly avatar = this.#data.avatar;
  readonly bot = this.#data.bot;
  readonly system = this.#data.system;
  readonly mfaEnabled = this.#data.mfa_enabled;
  readonly banner = this.#data.banner;
  readonly accentColor = this.#data.accent_color;
  readonly locale = this.#data.locale;
  readonly verified = this.#data.verified;
  readonly email = this.#data.email;
  readonly flags = this.#data.flags;
  readonly premiumType = this.#data.premium_type;
  readonly publicFlags = this.#data.public_flags;
  readonly avatarDecorationData = this.#data.avatar_decoration_data;
  readonly collectibles = this.#data.collectibles;
  readonly primaryGuild = this.#data.primary_guild;

  constructor(data: UserObject) {
    this.#data = data;
  }
}
*/
