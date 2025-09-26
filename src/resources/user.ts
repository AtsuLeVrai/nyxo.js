import type { FileInput } from "../core/index.js";
import type { SetNonNullable } from "../utils/index.js";
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

export interface TypingStartObject {
  readonly channel_id: string;
  readonly guild_id?: string;
  readonly user_id: string;
  readonly timestamp: number;
  readonly member?: GuildMemberEntity;
}

export interface ClientStatusObject {
  readonly desktop?: Omit<UpdatePresenceStatusType, "invisible" | "offline">;
  readonly mobile?: Omit<UpdatePresenceStatusType, "invisible" | "offline">;
  readonly web?: Omit<UpdatePresenceStatusType, "invisible" | "offline">;
}

export interface PresenceUpdateObject {
  readonly user: UserObject;
  readonly guild_id: string;
  readonly status: Omit<UpdatePresenceStatusType, "invisible">;
  readonly activities: ActivityData[];
  readonly client_status: ClientStatusObject;
}

export interface ModifyCurrentUserJSONParams extends Partial<Pick<UserObject, "username">> {
  readonly avatar?: FileInput | null;
  readonly banner?: FileInput | null;
}

export interface GetCurrentUserGuildsQueryStringParams {
  readonly before?: string;
  readonly after?: string;
  readonly limit?: number;
  readonly with_counts?: boolean;
}

export interface CreateDMJSONParams {
  readonly recipient_id: string;
}

export interface CreateGroupDMJSONParams {
  readonly access_tokens: string[];
  readonly nicks: Record<string, string>;
}

export type UpdateCurrentUserApplicationRoleConnectionJSONParams = Partial<
  SetNonNullable<ApplicationRoleConnectionObject>
>;

export type UpdatePresenceStatusType = "online" | "dnd" | "idle" | "invisible" | "offline";
