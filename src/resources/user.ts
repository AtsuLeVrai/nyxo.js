import type { EndpointFactory, Snowflake } from "../common/index.js";
import type { Locale } from "../constants/index.js";
import type { Client, DataUri } from "../core/index.js";
import type { Enforce, PropsToCamel } from "../utils/index.js";
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

export interface GetCurrentUserGuildsQuery {
  before?: Snowflake;
  after?: Snowflake;
  limit?: number;
  with_counts?: boolean;
}

export const UserRoutes = {
  currentUser: (() => "/users/@me") as EndpointFactory<
    "/users/@me",
    ["GET", "PATCH"],
    UserObject,
    false,
    false,
    ModifyCurrentUserRequest
  >,
  user: ((userId: Snowflake) => `/users/${userId}`) as EndpointFactory<
    `/users/${string}`,
    ["GET"],
    UserObject
  >,
  currentUserGuilds: (() => "/users/@me/guilds") as EndpointFactory<
    "/users/@me/guilds",
    ["GET"],
    Partial<GuildObject>[],
    false,
    false,
    undefined,
    GetCurrentUserGuildsQuery
  >,
  currentUserGuildMember: ((guildId: Snowflake) =>
    `/users/@me/guilds/${guildId}/member`) as EndpointFactory<
    `/users/@me/guilds/${string}/member`,
    ["GET"],
    GuildMemberObject
  >,
  leaveGuild: ((guildId: Snowflake) => `/users/@me/guilds/${guildId}`) as EndpointFactory<
    `/users/@me/guilds/${string}`,
    ["DELETE"],
    void
  >,
  createDM: (() => "/users/@me/channels") as EndpointFactory<
    "/users/@me/channels",
    ["POST"],
    ChannelObject,
    false,
    false,
    CreateDMRequest
  >,
  createGroupDM: (() => "/users/@me/channels") as EndpointFactory<
    "/users/@me/channels",
    ["POST"],
    ChannelObject,
    false,
    false,
    CreateGroupDMRequest
  >,
  currentUserConnections: (() => "/users/@me/connections") as EndpointFactory<
    "/users/@me/connections",
    ["GET"],
    ConnectionObject[]
  >,
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

export abstract class BaseClass<T extends object> {
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

export class User extends BaseClass<UserObject> implements Enforce<PropsToCamel<UserObject>> {
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
