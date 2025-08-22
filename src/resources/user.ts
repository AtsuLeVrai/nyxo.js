import type { Snowflake } from "../common/index.js";
import type { Locale } from "../constants/index.js";
import type { DataUri } from "../core/index.js";
import type { EndpointFactory } from "../utils/index.js";
import type { ChannelObject } from "./channel.js";
import type { GuildMemberObject, GuildObject, IntegrationObject } from "./guild.js";

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
  AmazonMusic = "amazon-music",
  Battlenet = "battlenet",
  Bungie = "bungie",
  Bluesky = "bluesky",
  Crunchyroll = "crunchyroll",
  Domain = "domain",
  Ebay = "ebay",
  EpicGames = "epicgames",
  Facebook = "facebook",
  Github = "github",
  Instagram = "instagram",
  LeagueOfLegends = "leagueoflegends",
  Mastodon = "mastodon",
  Paypal = "paypal",
  Playstation = "playstation",
  Reddit = "reddit",
  RiotGames = "riotgames",
  Roblox = "roblox",
  Spotify = "spotify",
  Skype = "skype",
  Steam = "steam",
  Tiktok = "tiktok",
  Twitch = "twitch",
  Twitter = "twitter",
  Xbox = "xbox",
  Youtube = "youtube",
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
  flags?: UserFlags;
  premium_type?: PremiumType;
  public_flags?: UserFlags;
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
  integrations?: Partial<IntegrationObject>[];
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

// Request/Response interfaces
export interface ModifyCurrentUserRequest {
  username?: string;
  avatar?: DataUri | null;
  banner?: DataUri | null;
}

export interface CreateDMRequest {
  recipient_id: Snowflake;
}

export interface CreateGroupDMRequest {
  access_tokens: string[];
  nicks: Record<Snowflake, string>;
}

export interface UpdateApplicationRoleConnectionRequest {
  platform_name?: string;
  platform_username?: string;
  metadata?: Record<string, string>;
}

// Query parameters interfaces
export interface GetCurrentUserGuildsQuery {
  before?: Snowflake;
  after?: Snowflake;
  limit?: number;
  with_counts?: boolean;
}

export const UserRoutes = {
  // GET /users/@me - Get Current User
  currentUser: (() => "/users/@me") as EndpointFactory<
    "/users/@me",
    ["GET", "PATCH"],
    UserObject,
    false,
    false,
    ModifyCurrentUserRequest
  >,

  // GET /users/{user.id} - Get User
  user: ((userId: Snowflake) => `/users/${userId}`) as EndpointFactory<
    `/users/${string}`,
    ["GET"],
    UserObject
  >,

  // GET /users/@me/guilds - Get Current User Guilds
  currentUserGuilds: (() => "/users/@me/guilds") as EndpointFactory<
    "/users/@me/guilds",
    ["GET"],
    Partial<GuildObject>[],
    false,
    false,
    undefined,
    GetCurrentUserGuildsQuery
  >,

  // GET /users/@me/guilds/{guild.id}/member - Get Current User Guild Member
  currentUserGuildMember: ((guildId: Snowflake) =>
    `/users/@me/guilds/${guildId}/member`) as EndpointFactory<
    `/users/@me/guilds/${string}/member`,
    ["GET"],
    GuildMemberObject
  >,

  // DELETE /users/@me/guilds/{guild.id} - Leave Guild
  leaveGuild: ((guildId: Snowflake) => `/users/@me/guilds/${guildId}`) as EndpointFactory<
    `/users/@me/guilds/${string}`,
    ["DELETE"],
    void
  >,

  // POST /users/@me/channels - Create DM
  createDM: (() => "/users/@me/channels") as EndpointFactory<
    "/users/@me/channels",
    ["POST"],
    ChannelObject,
    false,
    false,
    CreateDMRequest
  >,

  // POST /users/@me/channels - Create Group DM
  createGroupDM: (() => "/users/@me/channels") as EndpointFactory<
    "/users/@me/channels",
    ["POST"],
    ChannelObject,
    false,
    false,
    CreateGroupDMRequest
  >,

  // GET /users/@me/connections - Get Current User Connections
  currentUserConnections: (() => "/users/@me/connections") as EndpointFactory<
    "/users/@me/connections",
    ["GET"],
    ConnectionObject[]
  >,

  // GET /users/@me/applications/{application.id}/role-connection - Get Current User Application Role Connection
  currentUserApplicationRoleConnection: ((applicationId: Snowflake) =>
    `/users/@me/applications/${applicationId}/role-connection`) as EndpointFactory<
    `/users/@me/applications/${string}/role-connection`,
    ["GET", "PUT"],
    ApplicationRoleConnectionObject,
    false,
    false,
    UpdateApplicationRoleConnectionRequest
  >,
} as const satisfies Record<string, EndpointFactory<any, any, any, any, any, any, any, any>>;
