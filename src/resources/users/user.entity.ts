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

export enum NameplatePalette {
  Crimson = "crimson",
  Berry = "berry",
  Sky = "sky",
  Teal = "teal",
  Forest = "forest",
  BubbleGum = "bubble_gum",
  Violet = "violet",
  Cobalt = "cobalt",
  Clover = "clover",
  Lemon = "lemon",
  White = "white",
}

export enum ConnectionService {
  AmazonMusic = "amazon-music",
  BattleNet = "battlenet",
  Bungie = "bungie",
  Bluesky = "bluesky",
  Crunchyroll = "crunchyroll",
  Domain = "domain",
  Ebay = "ebay",
  EpicGames = "epicgames",
  Facebook = "facebook",
  GitHub = "github",
  Instagram = "instagram",
  LeagueOfLegends = "leagueoflegends",
  Mastodon = "mastodon",
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

export enum ConnectionVisibility {
  None = 0,
  Everyone = 1,
}

export interface UserEntity {
  id: string;
  username: string;
  discriminator: string;
  global_name: string | null;
  avatar: string | null;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  banner?: string | null;
  accent_color?: number | null;
  locale?: string;
  verified?: boolean;
  email?: string | null;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
  avatar_decoration_data?: AvatarDecorationDataEntity | null;
  collectibles?: CollectibleEntity | null;
  primary_guild?: UserPrimaryGuildEntity | null;
}

export interface UserPrimaryGuildEntity {
  identity_guild_id: string | null;
  identity_enabled: boolean | null;
  tag: string | null;
  badge: string | null;
}

export interface AvatarDecorationDataEntity {
  asset: string;
  sku_id: string;
}

export interface CollectibleEntity {
  nameplate?: NameplateEntity;
}

export interface NameplateEntity {
  sku_id: string;
  asset: string;
  label: string;
  palette: NameplatePalette;
}

export interface ConnectionEntity {
  id: string;
  name: string;
  type: ConnectionService;
  revoked?: boolean;
  integrations?: Partial<object>[]; // TODO: IntegrationEntity
  verified: boolean;
  friend_sync: boolean;
  show_activity: boolean;
  two_way_link: boolean;
  visibility: ConnectionVisibility;
}

export interface ApplicationRoleConnectionEntity {
  platform_name: string | null;
  platform_username: string | null;
  metadata: Record<string, string>;
}
