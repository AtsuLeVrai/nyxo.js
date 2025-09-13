import type { CamelCasedProperties } from "type-fest";
import { BaseClass, BaseRouter } from "../bases/index.js";
import type { FileInput, RouteBuilder } from "../core/index.js";
import { BitField } from "../utils/index.js";
import type { DMChannelEntity, GroupDMChannelEntity } from "./channel.js";
import type { Locale } from "./constants.js";
import type { GuildEntity, GuildMemberEntity, IntegrationEntity } from "./guild.js";

export enum ConnectionVisibility {
  None = 0,
  Everyone = 1,
}

export enum ConnectionService {
  AmazonMusic = "amazon-music",
  BattleNet = "battlenet",
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
  HypesquadEvents = 1 << 2,
  BugHunter1 = 1 << 3,
  HouseBravery = 1 << 6,
  HouseBrilliance = 1 << 7,
  HouseBalance = 1 << 8,
  EarlySupporter = 1 << 9,
  TeamPseudoUser = 1 << 10,
  BugHunter2 = 1 << 14,
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

export interface ApplicationRoleConnectionData {
  platform_name: string | null;
  platform_username: string | null;
  metadata: Record<string, string>;
}

export interface ConnectionData {
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

export interface AvatarDecorationDataData {
  asset: string;
  sku_id: string;
}

export interface UserPrimaryGuildData {
  identity_guild_id?: string | null;
  identity_enabled?: boolean | null;
  tag?: string | null;
  badge?: string | null;
}

export interface NameplateData {
  sku_id: string;
  asset: string;
  label: string;
  palette: NameplatePalette;
}

export interface CollectiblesData {
  nameplate?: NameplateData;
}

export interface UserData {
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
  premium_type?: PremiumType;
  public_flags?: UserFlags;
  avatar_decoration_data?: AvatarDecorationDataData | null;
  primary_guild?: UserPrimaryGuildData | null;
  collectibles?: CollectiblesData | null;
}

export interface GatewayTypingStartData {
  channel_id: string;
  guild_id?: string;
  user_id: string;
  timestamp: number;
  member?: GuildMemberEntity;
}

export interface ActivityButtonData {
  label: string;
  url: string;
}

export interface ActivitySecretsData {
  join?: string;
  spectate?: string;
  match?: string;
}

export interface ActivityAssetImageData {
  large_text?: string;
  large_image?: string;
  small_text?: string;
  small_image?: string;
}

export interface ActivityPartyData {
  id?: string;
  size?: [number, number];
}

export interface ActivityEmojiData {
  name: string;
  id?: string;
  animated?: boolean;
}

export interface ActivityTimestampsData {
  start?: number;
  end?: number;
}

export interface ActivityData {
  name: string;
  type: ActivityType;
  url?: string | null;
  created_at: number;
  timestamps?: ActivityTimestampsData;
  application_id?: string;
  details?: string | null;
  state?: string | null;
  emoji?: ActivityEmojiData | null;
  party?: ActivityPartyData;
  assets?: ActivityAssetImageData;
  secrets?: ActivitySecretsData;
  instance?: boolean;
  flags?: ActivityFlags;
  buttons?: ActivityButtonData[];
}

export type UpdatePresenceStatusType = "online" | "dnd" | "idle" | "invisible" | "offline";

export interface ClientStatusData {
  desktop?: Omit<UpdatePresenceStatusType, "invisible" | "offline">;
  mobile?: Omit<UpdatePresenceStatusType, "invisible" | "offline">;
  web?: Omit<UpdatePresenceStatusType, "invisible" | "offline">;
}

export interface GatewayPresenceUpdateData {
  user: UserData;
  guild_id: string;
  status: Omit<UpdatePresenceStatusType, "invisible">;
  activities: ActivityData[];
  client_status: ClientStatusData;
}

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

export interface ModifyCurrentUserParams extends Partial<Pick<UserData, "username">> {
  avatar?: FileInput | null;
  banner?: FileInput | null;
}

export interface GetCurrentUserGuildsQuery {
  before?: string;
  after?: string;
  limit?: number;
  with_counts?: boolean;
}

export interface CreateGroupDMParams {
  access_tokens: string[];
  nicks: Record<string, string>;
}

export const UserRoutes = {
  currentUser: () => "/users/@me",
  user: (userId: string) => `/users/${userId}` as const,
  currentUserGuilds: () => "/users/@me/guilds",
  currentUserGuildMember: (guildId: string) => `/users/@me/guilds/${guildId}/member` as const,
  leaveGuild: (guildId: string) => `/users/@me/guilds/${guildId}` as const,
  createDM: () => "/users/@me/channels",
  currentUserConnections: () => "/users/@me/connections",
  currentUserApplicationRoleConnection: (applicationId: string) =>
    `/users/@me/applications/${applicationId}/role-connection` as const,
} as const satisfies RouteBuilder;

export class UserRouter extends BaseRouter {
  getCurrentUser(): Promise<UserData> {
    return this.rest.get(UserRoutes.currentUser());
  }

  getUser(userId: string): Promise<UserData> {
    return this.rest.get(UserRoutes.user(userId));
  }

  async modifyCurrentUser(options: ModifyCurrentUserParams): Promise<UserData> {
    if (options.username && !isValidUsername(options.username)) {
      throw new TypeError("Invalid username format");
    }

    const processedOptions = await this.processFileOptions(options, ["avatar", "banner"]);
    return this.rest.patch(UserRoutes.currentUser(), {
      body: JSON.stringify(processedOptions),
    });
  }

  getCurrentUserGuilds(query?: GetCurrentUserGuildsQuery): Promise<Partial<GuildEntity>[]> {
    return this.rest.get(UserRoutes.currentUserGuilds(), { query });
  }

  getCurrentUserGuildMember(guildId: string): Promise<GuildMemberEntity> {
    return this.rest.get(UserRoutes.currentUserGuildMember(guildId));
  }

  leaveGuild(guildId: string): Promise<void> {
    return this.rest.delete(UserRoutes.leaveGuild(guildId));
  }

  createDM(recipientId: string): Promise<DMChannelEntity> {
    return this.rest.post(UserRoutes.createDM(), {
      body: JSON.stringify({ recipient_id: recipientId }),
    });
  }

  createGroupDM(options: CreateGroupDMParams): Promise<GroupDMChannelEntity> {
    if (!options.access_tokens?.length) {
      throw new TypeError("At least one access token is required");
    }

    return this.rest.post(UserRoutes.createDM(), {
      body: JSON.stringify(options),
    });
  }

  getCurrentUserConnections(): Promise<ConnectionData[]> {
    return this.rest.get(UserRoutes.currentUserConnections());
  }

  getCurrentUserApplicationRoleConnection(
    applicationId: string,
  ): Promise<ApplicationRoleConnectionData> {
    return this.rest.get(UserRoutes.currentUserApplicationRoleConnection(applicationId));
  }

  updateCurrentUserApplicationRoleConnection(
    applicationId: string,
    connection: Partial<ApplicationRoleConnectionData>,
  ): Promise<ApplicationRoleConnectionData> {
    return this.rest.put(UserRoutes.currentUserApplicationRoleConnection(applicationId), {
      body: JSON.stringify(connection),
    });
  }
}

export class Connection
  extends BaseClass<ConnectionData>
  implements CamelCasedProperties<ConnectionData>
{
  readonly id = this.rawData.id;
  readonly name = this.rawData.name;
  readonly type = this.rawData.type;
  readonly revoked = this.rawData.revoked ?? false;
  readonly integrations = this.rawData.integrations;
  readonly verified = this.rawData.verified;
  readonly friendSync = this.rawData.friend_sync;
  readonly showActivity = this.rawData.show_activity;
  readonly twoWayLink = this.rawData.two_way_link;
  readonly visibility = this.rawData.visibility;
}

export class User extends BaseClass<UserData> implements CamelCasedProperties<UserData> {
  readonly id = this.rawData.id;
  readonly username = this.rawData.username;
  readonly discriminator = this.rawData.discriminator;
  readonly globalName = this.rawData.global_name;
  readonly avatar = this.rawData.avatar;
  readonly bot = this.rawData.bot ?? false;
  readonly system = this.rawData.system ?? false;
  readonly mfaEnabled = this.rawData.mfa_enabled ?? false;
  readonly banner = this.rawData.banner;
  readonly accentColor = this.rawData.accent_color;
  readonly locale = this.rawData.locale;
  readonly verified = this.rawData.verified ?? false;
  readonly email = this.rawData.email;
  // @ts-expect-error - BitField is correctly typed
  readonly flags = new BitField(this.rawData.flags);
  readonly premiumType = this.rawData.premium_type;
  // @ts-expect-error - BitField is correctly typed
  readonly publicFlags = new BitField(this.rawData.public_flags);
  readonly avatarDecorationData = this.rawData.avatar_decoration_data;
  readonly primaryGuild = this.rawData.primary_guild;
  readonly collectibles = this.rawData.collectibles;
}
