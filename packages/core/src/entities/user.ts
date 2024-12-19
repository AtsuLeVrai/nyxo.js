import type { LocaleKey } from "../enums/index.js";
import type { Integer } from "../formatting/index.js";
import type { Snowflake } from "../managers/index.js";
import type { IntegrationEntity } from "./guild.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/user#application-role-connection-object-application-role-connection-structure}
 */
export interface ApplicationRoleConnectionEntity {
  platform_name: string | null;
  platform_username: string | null;
  metadata: Record<string, string>;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#connection-object-visibility-types}
 */
export enum ConnectionVisibility {
  None = 0,
  Everyone = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#connection-object-services}
 */
export enum ConnectionService {
  AmazonMusic = "amazon-music",
  Battlenet = "battlenet",
  Bungie = "bungie",
  Domain = "domain",
  Ebay = "ebay",
  EpicGames = "epicgames",
  Facebook = "facebook",
  GitHub = "github",
  Instagram = "instagram",
  LeagueOfLegends = "leagueoflegends",
  PayPal = "paypal",
  PlayStation = "playstation",
  Reddit = "reddit",
  RiotGames = "riotgames",
  Roblox = "roblox",
  Spotify = "spotify",
  Skype = "skype",
  Steam = "steam",
  TikTok = "tiktok",
  Twitch = "twitch",
  Twitter = "twitter",
  Xbox = "xbox",
  YouTube = "youtube",
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#connection-object-connection-structure}
 */
export interface ConnectionEntity {
  id: string;
  name: string;
  type: ConnectionService;
  revoked?: boolean;
  integrations?: Partial<IntegrationEntity>[];
  verified: boolean;
  friend_sync: boolean;
  show_activity: boolean;
  two_way_link: boolean;
  visibility: ConnectionVisibility;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#avatar-decoration-data-object-avatar-decoration-data-structure}
 */
export interface AvatarDecorationDataEntity {
  asset: string;
  sku_id: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#user-object-premium-types}
 */
export enum PremiumType {
  None = 0,
  NitroClassic = 1,
  Nitro = 2,
  NitroBasic = 3,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#user-object-user-flags}
 */
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

/**
 * @see {@link https://discord.com/developers/docs/resources/user#user-object-user-structure}
 */
export interface UserEntity {
  id: Snowflake;
  username: string;
  discriminator: string;
  global_name: string | null;
  avatar: string | null;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  banner?: string | null;
  accent_color?: Integer;
  locale?: LocaleKey;
  verified?: boolean;
  email?: string | null;
  flags?: UserFlags;
  premium_type?: PremiumType;
  public_flags?: UserFlags;
  avatar_decoration_data?: AvatarDecorationDataEntity | null;
}
