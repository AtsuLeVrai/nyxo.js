import type { SetNonNullable } from "type-fest";
import type { FileInput } from "../core/index.js";
import type { ActivityData } from "./activity.js";
import type { Locale } from "./constants.js";
import type { GuildMemberEntity, IntegrationEntity } from "./guild.js";

export enum ConnectionVisibilityTypes {
  None = 0,
  Everyone = 1,
}

export enum Services {
  AmazonMusic = "amazon-music",
  BattleNet = "battlenet",
  Bluesky = "bluesky",
  Bungie = "bungie",
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
  Skype = "skype",
  Spotify = "spotify",
  Steam = "steam",
  TikTok = "tiktok",
  Twitch = "twitch",
  Twitter = "twitter",
  Xbox = "xbox",
  YouTube = "youtube",
}

export enum NameplatePalettes {
  Berry = "berry",
  BubbleGum = "bubble_gum",
  Clover = "clover",
  Cobalt = "cobalt",
  Crimson = "crimson",
  Forest = "forest",
  Lemon = "lemon",
  Sky = "sky",
  Teal = "teal",
  Violet = "violet",
  White = "white",
}

export enum PremiumTypes {
  None = 0,
  NitroClassic = 1,
  Nitro = 2,
  NitroBasic = 3,
}

export enum UserFlags {
  Staff = 1 << 0,
  Partner = 1 << 1,
  Hypesquad = 1 << 2,
  BugHunterLevel1 = 1 << 3,
  HypesquadOnlineHouse1 = 1 << 6,
  HypesquadOnlineHouse2 = 1 << 7,
  HypesquadOnlineHouse3 = 1 << 8,
  PremiumEarlySupporter = 1 << 9,
  TeamPseudoUser = 1 << 10,
  BugHunterLevel2 = 1 << 14,
  VerifiedBot = 1 << 16,
  VerifiedDeveloper = 1 << 17,
  CertifiedModerator = 1 << 18,
  BotHttpInteractions = 1 << 19,
  ActiveDeveloper = 1 << 22,
}

export interface AvatarDecorationDataObject {
  asset: string;
  sku_id: string;
}

export interface NameplateObject {
  asset: string;
  label: string;
  palette: NameplatePalettes;
  sku_id: string;
}

export interface CollectiblesObject {
  nameplate?: NameplateObject;
}

export interface UserPrimaryGuildEntity {
  badge?: string | null;
  identity_enabled?: boolean | null;
  identity_guild_id?: string | null;
  tag?: string | null;
}

export interface UserObject {
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
  locale?: Locale;
  verified?: boolean;
  email?: string | null;
  flags?: UserFlags;
  premium_type?: PremiumTypes;
  public_flags?: UserFlags;
  avatar_decoration_data?: AvatarDecorationDataObject | null;
  collectibles?: CollectiblesObject | null;
  primary_guild?: UserPrimaryGuildEntity | null;
}

export interface ConnectionObject {
  id: string;
  name: string;
  type: Services;
  revoked?: boolean;
  integrations?: Partial<IntegrationEntity>[];
  verified: boolean;
  friend_sync: boolean;
  show_activity: boolean;
  two_way_link: boolean;
  visibility: ConnectionVisibilityTypes;
}

export interface ApplicationRoleConnectionObject {
  platform_name: string | null;
  platform_username: string | null;
  metadata: Record<string, string>;
}

export interface TypingStartObject {
  channel_id: string;
  guild_id?: string;
  user_id: string;
  timestamp: number;
  member?: GuildMemberEntity;
}

export interface ClientStatusObject {
  desktop?: Omit<UpdatePresenceStatusType, "invisible" | "offline">;
  mobile?: Omit<UpdatePresenceStatusType, "invisible" | "offline">;
  web?: Omit<UpdatePresenceStatusType, "invisible" | "offline">;
}

export interface PresenceUpdateObject {
  user: UserObject;
  guild_id: string;
  status: Omit<UpdatePresenceStatusType, "invisible">;
  activities: ActivityData[];
  client_status: ClientStatusObject;
}

export interface ModifyCurrentUserJSONParams extends Partial<Pick<UserObject, "username">> {
  avatar?: FileInput | null;
  banner?: FileInput | null;
}

export interface GetCurrentUserGuildsQueryStringParams {
  before?: string;
  after?: string;
  limit?: number;
  with_counts?: boolean;
}

export interface CreateDMJSONParams {
  recipient_id: string;
}

export interface CreateGroupDMJSONParams {
  access_tokens: string[];
  nicks: Record<string, string>;
}

export type UpdateCurrentUserApplicationRoleConnectionJSONParams = Partial<
  SetNonNullable<ApplicationRoleConnectionObject>
>;

export type UpdatePresenceStatusType = "online" | "dnd" | "idle" | "invisible" | "offline";

/**
 * Validates a Discord username according to Discord's rules
 * @param username The username to validate
 * @returns true if the username is valid, false otherwise
 */
export function isValidUsername(username: string): boolean {
  if (!username || username.length < 2 || username.length > 32) {
    return false;
  }

  const forbiddenSubstrings = ["@", "#", ":", "```", "discord"];
  const forbiddenNames = ["everyone", "here"];

  for (const substring of forbiddenSubstrings) {
    if (username.includes(substring)) {
      return false;
    }
  }

  return !forbiddenNames.includes(username.toLowerCase());
}

/**
 * Checks if a user has a specific flag
 * @param userFlags The user's flags value
 * @param flag The flag to check for
 * @returns true if the user has the flag
 */
export function hasUserFlag(userFlags: number, flag: UserFlags): boolean {
  return (userFlags & flag) === flag;
}

/**
 * Gets all flags that a user has
 * @param userFlags The user's flags value
 * @returns Array of UserFlags that the user has
 */
export function getUserFlags(userFlags: number): UserFlags[] {
  const flags: UserFlags[] = [];

  for (const flag of Object.values(UserFlags)) {
    if (typeof flag === "number" && hasUserFlag(userFlags, flag)) {
      flags.push(flag);
    }
  }

  return flags;
}
