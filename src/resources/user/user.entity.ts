import type { LocaleValues } from "../../enum/index.js";
import type { GuildMemberEntity, IntegrationEntity } from "../guild/index.js";

export enum ConnectionVisibility {
  None = 0,
  Everyone = 1,
}

export enum ConnectionService {
  AmazonMusic = "amazon-music",
  Battlenet = "battlenet",
  Bungiev = "bungie",
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
  Bluesky = "bluesky",
  Crunchyroll = "crunchyroll",
  Mastodon = "mastodon",
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

export enum PremiumType {
  None = 0,
  NitroClassic = 1,
  Nitro = 2,
  NitroBasic = 3,
}

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

export enum ActivityFlags {
  Instance = 1 << 0,
  Join = 1 << 1,
  Spectate = 1 << 2,
  JoinRequest = 1 << 3,
  Sync = 1 << 4,
  Play = 1 << 5,
  PartyPrivacyFriends = 1 << 6,
  PartyPrivacyVoiceChannel = 1 << 7,
  Embedded = 1 << 8,
}

export enum ActivityType {
  Game = 0,
  Streaming = 1,
  Listening = 2,
  Watching = 3,
  Custom = 4,
  Competing = 5,
}

export interface ApplicationRoleConnectionEntity {
  platform_name: string | null;
  platform_username: string | null;
  metadata: Record<string, string>;
}

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

export interface AvatarDecorationDataEntity {
  asset: string;
  sku_id: string;
}

export interface UserPrimaryGuildEntity {
  identity_guild_id?: string | null;
  identity_enabled?: boolean | null;
  tag?: string | null;
  badge?: string | null;
}

export interface NameplateEntity {
  sku_id: string;
  asset: string;
  label: string;
  palette: NameplatePalette;
}

export interface CollectiblesEntity {
  nameplate?: NameplateEntity;
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
  locale?: LocaleValues;
  verified?: boolean;
  email?: string | null;
  flags?: UserFlags;
  premium_type?: PremiumType;
  public_flags?: UserFlags;
  avatar_decoration_data?: AvatarDecorationDataEntity | null;
  primary_guild?: UserPrimaryGuildEntity | null;
  collectibles?: CollectiblesEntity | null;
}

export interface TypingStartEntity {
  channel_id: string;
  guild_id?: string;
  user_id: string;
  timestamp: number;
  member?: GuildMemberEntity;
}

export interface ActivityButtonEntity {
  label: string;
  url: string;
}

export interface ActivitySecretsEntity {
  join?: string;
  spectate?: string;
  match?: string;
}

export interface ActivityAssetImageEntity {
  large_text?: string;
  large_image?: string;
  small_text?: string;
  small_image?: string;
}

export interface ActivityPartyEntity {
  id?: string;
  size?: [number, number];
}

export interface ActivityEmojiEntity {
  name: string;
  id?: string;
  animated?: boolean;
}

export interface ActivityTimestampsEntity {
  start?: number;
  end?: number;
}

export interface ActivityEntity {
  name: string;
  type: ActivityType;
  url?: string | null;
  created_at: number;
  timestamps?: ActivityTimestampsEntity;
  application_id?: string;
  details?: string | null;
  state?: string | null;
  emoji?: ActivityEmojiEntity | null;
  party?: ActivityPartyEntity;
  assets?: ActivityAssetImageEntity;
  secrets?: ActivitySecretsEntity;
  instance?: boolean;
  flags?: ActivityFlags;
  buttons?: ActivityButtonEntity[];
}

export type UpdatePresenceStatusType = "online" | "dnd" | "idle" | "invisible";

export interface ClientStatusEntity {
  desktop?: Omit<UpdatePresenceStatusType, "invisible">;
  mobile?: Omit<UpdatePresenceStatusType, "invisible">;
  web?: Omit<UpdatePresenceStatusType, "invisible">;
}

export interface PresenceEntity {
  user: UserEntity;
  guild_id: string;
  status: Omit<UpdatePresenceStatusType, "invisible">;
  activities: ActivityEntity[];
  client_status: ClientStatusEntity;
}

export function isValidUsername(username: string): boolean {
  const forbiddenSubstrings = ["@", "#", ":", "```", "discord"];
  const forbiddenNames = ["everyone", "here"];
  for (const substring of forbiddenSubstrings) {
    if (username.includes(substring)) {
      return false;
    }
  }
  return !forbiddenNames.includes(username);
}
