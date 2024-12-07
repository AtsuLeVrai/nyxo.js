import type { LocaleKey } from "../enums/index.js";
import type { Integer } from "../formatting/index.js";
import type { Snowflake } from "../utils/index.js";
import type { IntegrationEntity } from "./guild.js";

/**
 * Represents a role connection for an application.
 *
 * @remarks
 * Contains platform-specific information and metadata for a user's connected role.
 *
 * @example
 * ```typescript
 * const roleConnection: ApplicationRoleConnectionEntity = {
 *   platform_name: "Steam",
 *   platform_username: "johndoe",
 *   metadata: { level: "42" }
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/user#application-role-connection-object-application-role-connection-structure}
 */
export interface ApplicationRoleConnectionEntity {
  /** Vanity name of the platform (max 50 characters) */
  platform_name: string | null;
  /** Username on the platform (max 100 characters) */
  platform_username: string | null;
  /** Metadata key-value pairs for the connection (max 100 characters per value) */
  metadata: Record<string, string>;
}

/**
 * Represents the visibility settings for a connection.
 *
 * @remarks
 * Determines who can see a user's connection.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#connection-object-visibility-types}
 */
export enum ConnectionVisibility {
  /** Invisible to everyone except the user */
  None = 0,
  /** Visible to everyone */
  Everyone = 1,
}

/**
 * Represents the various services that can be connected to a Discord account.
 *
 * @remarks
 * Some services can no longer be added by users (marked with *).
 *
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
  /** Cannot be added by users anymore */
  Instagram = "instagram",
  LeagueOfLegends = "leagueoflegends",
  PayPal = "paypal",
  PlayStation = "playstation",
  Reddit = "reddit",
  RiotGames = "riotgames",
  Roblox = "roblox",
  Spotify = "spotify",
  /** Cannot be added by users anymore */
  Skype = "skype",
  Steam = "steam",
  TikTok = "tiktok",
  Twitch = "twitch",
  Twitter = "twitter",
  Xbox = "xbox",
  YouTube = "youtube",
}

/**
 * Represents a connection that a user has attached to their Discord account.
 *
 * @remarks
 * Connections allow users to link their accounts from other services to Discord.
 *
 * @example
 * ```typescript
 * const connection: ConnectionEntity = {
 *   id: "123456789",
 *   name: "johndoe",
 *   type: ConnectionService.GitHub,
 *   verified: true,
 *   friend_sync: false,
 *   show_activity: true,
 *   two_way_link: false,
 *   visibility: ConnectionVisibility.Everyone
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/user#connection-object-connection-structure}
 */
export interface ConnectionEntity {
  /** ID of the connection account */
  id: string;
  /** Username on connected account */
  name: string;
  /** Service type of the connection */
  type: ConnectionService;
  /** Whether the connection is revoked */
  revoked?: boolean;
  /** Array of partial server integrations */
  integrations?: Partial<IntegrationEntity>[];
  /** Whether the connection is verified */
  verified: boolean;
  /** Whether friend sync is enabled */
  friend_sync: boolean;
  /** Whether activities related to this connection will be shown in presence updates */
  show_activity: boolean;
  /** Whether this connection has a corresponding third party OAuth2 token */
  two_way_link: boolean;
  /** Visibility of this connection */
  visibility: ConnectionVisibility;
}

/**
 * Represents avatar decoration data for a user.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#avatar-decoration-data-object-avatar-decoration-data-structure}
 */
export interface AvatarDecorationDataEntity {
  /** Hash of the avatar decoration */
  asset: string;
  /** ID of the avatar decoration's SKU */
  sku_id: Snowflake;
}

/**
 * Represents a user's subscription level.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#user-object-premium-types}
 */
export enum PremiumType {
  /** No subscription */
  None = 0,
  /** Nitro Classic subscription */
  NitroClassic = 1,
  /** Nitro subscription */
  Nitro = 2,
  /** Nitro Basic subscription */
  NitroBasic = 3,
}

/**
 * Represents the flags that can be applied to a user account.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#user-object-user-flags}
 */
export enum UserFlags {
  /** Discord Employee */
  Staff = 1 << 0,
  /** Partnered Server Owner */
  Partner = 1 << 1,
  /** HypeSquad Events Coordinator */
  HypeSquad = 1 << 2,
  /** Bug Hunter Level 1 */
  BugHunterLevel1 = 1 << 3,
  /** House Bravery Member */
  HypeSquadOnlineHouse1 = 1 << 6,
  /** House Brilliance Member */
  HypeSquadOnlineHouse2 = 1 << 7,
  /** House Balance Member */
  HypeSquadOnlineHouse3 = 1 << 8,
  /** Early Nitro Supporter */
  PremiumEarlySupporter = 1 << 9,
  /** User is part of a team */
  TeamPseudoUser = 1 << 10,
  /** Bug Hunter Level 2 */
  BugHunterLevel2 = 1 << 14,
  /** Verified Bot */
  VerifiedBot = 1 << 16,
  /** Early Verified Bot Developer */
  VerifiedDeveloper = 1 << 17,
  /** Moderator Programs Alumni */
  CertifiedModerator = 1 << 18,
  /** Bot uses only HTTP interactions */
  BotHttpInteractions = 1 << 19,
  /** User is an Active Developer */
  ActiveDeveloper = 1 << 22,
}

/**
 * Represents a Discord user.
 *
 * @remarks
 * Users are Discord's base entity type. Users can spawn across the platform,
 * be members of guilds, participate in text and voice chat, and much more.
 * Users are separated between "bot" vs "normal" users.
 * Bot users are automated users that are "owned" by another user.
 *
 * @example
 * ```typescript
 * const user: UserEntity = {
 *   id: "80351110224678912",
 *   username: "Nelly",
 *   discriminator: "1337",
 *   global_name: "NellyTheGreat",
 *   avatar: "8342729096ea3675442027381ff50dfe",
 *   verified: true,
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/user#user-object-user-structure}
 */
export interface UserEntity {
  /** The user's unique ID */
  id: Snowflake;
  /** The user's username (2-32 characters) */
  username: string;
  /** The user's Discord tag */
  discriminator: string;
  /** The user's display name, if set. For bots, this is the application name */
  global_name: string | null;
  /** The user's avatar hash */
  avatar: string | null;
  /** Whether the user belongs to an OAuth2 application */
  bot?: boolean;
  /** Whether the user is an Official Discord System user */
  system?: boolean;
  /** Whether the user has two-factor authentication enabled */
  mfa_enabled?: boolean;
  /** The user's banner hash */
  banner?: string | null;
  /** The user's banner color encoded as an integer representation of hexadecimal color code */
  accent_color?: Integer;
  /** The user's chosen language option */
  locale?: LocaleKey;
  /** Whether the user's email is verified */
  verified?: boolean;
  /** The user's email */
  email?: string | null;
  /** The flags on the user's account */
  flags?: UserFlags;
  /** The type of Nitro subscription on the user's account */
  premium_type?: PremiumType;
  /** The public flags on the user's account */
  public_flags?: UserFlags;
  /** The data for the user's avatar decoration */
  avatar_decoration_data?: AvatarDecorationDataEntity | null;
}
