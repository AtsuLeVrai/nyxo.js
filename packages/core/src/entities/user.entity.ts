import type { Locale } from "../enums/index.js";
import type { Snowflake } from "../markdown/index.js";
import type { IntegrationEntity } from "./guild.entity.js";

/**
 * Represents the visibility options for a user's connection.
 * Determines who can see a user's connected third-party accounts.
 * @see {@link https://discord.com/developers/docs/resources/user#connection-object-visibility-types}
 */
export enum ConnectionVisibility {
  /**
   * Invisible to everyone except the user themselves (0)
   * The connection is private and only visible to the user who owns it
   */
  None = 0,

  /**
   * Visible to everyone (1)
   * The connection is public and can be seen by anyone who can view the user's profile
   */
  Everyone = 1,
}

/**
 * Represents the supported external service types for user connections.
 * Users can connect these third-party accounts to their Discord profile.
 * @see {@link https://discord.com/developers/docs/resources/user#connection-object-services}
 */
export enum ConnectionService {
  /** Amazon Music connection - Music streaming service */
  AmazonMusic = "amazon-music",

  /** Battle.net connection - Blizzard gaming platform */
  Battlenet = "battlenet",

  /** Bungie.net connection - Destiny game platform */
  Bungiev = "bungie",

  /** Domain connection - Personal website */
  Domain = "domain",

  /** eBay connection - Online marketplace */
  Ebay = "ebay",

  /** Epic Games connection - Game development company and digital storefront */
  EpicGames = "epicgames",

  /** Facebook connection - Social media platform */
  Facebook = "facebook",

  /** GitHub connection - Software development platform */
  GitHub = "github",

  /**
   * Instagram connection - Social media platform
   * Note: This connection type can no longer be added by users
   */
  Instagram = "instagram",

  /** League of Legends connection - Multiplayer online battle arena game */
  LeagueOfLegends = "leagueoflegends",

  /** PayPal connection - Online payment system */
  PayPal = "paypal",

  /** PlayStation Network connection - Sony's gaming network */
  PlayStation = "playstation",

  /** Reddit connection - Social news aggregation website */
  Reddit = "reddit",

  /** Riot Games connection - Game development company */
  RiotGames = "riotgames",

  /** Roblox connection - Online game platform */
  Roblox = "roblox",

  /** Spotify connection - Music streaming service */
  Spotify = "spotify",

  /**
   * Skype connection - Video chat and voice call service
   * Note: This connection type can no longer be added by users
   */
  Skype = "skype",

  /** Steam connection - Video game digital distribution service */
  Steam = "steam",

  /** TikTok connection - Short-form video hosting service */
  TikTok = "tiktok",

  /** Twitch connection - Live streaming platform */
  Twitch = "twitch",

  /** X (Twitter) connection - Social media platform */
  Twitter = "twitter",

  /** Xbox connection - Microsoft's gaming platform */
  Xbox = "xbox",

  /** YouTube connection - Video sharing platform */
  YouTube = "youtube",

  /** Bluesky connection - Decentralized social network */
  Bluesky = "bluesky",

  /** Crunchyroll connection - Anime streaming service */
  Crunchyroll = "crunchyroll",

  /** Mastodon connection - Decentralized social network */
  Mastodon = "mastodon",
}

/**
 * Represents the premium subscription levels a user can have.
 * Different Nitro tiers provide different benefits to users.
 * @see {@link https://discord.com/developers/docs/resources/user#user-object-premium-types}
 */
export enum PremiumType {
  /**
   * User has no Nitro subscription (0)
   * No premium benefits
   */
  None = 0,

  /**
   * User has a Nitro Classic subscription (1)
   * Includes animated avatars, custom tag, global custom emoji, etc.
   */
  NitroClassic = 1,

  /**
   * User has a Nitro subscription (2)
   * Includes benefits of Nitro Classic, plus server boosts, higher upload limits, etc.
   */
  Nitro = 2,

  /**
   * User has a Nitro Basic subscription (3)
   * Entry-level tier with a subset of Nitro benefits
   */
  NitroBasic = 3,
}

/**
 * Represents the badges/flags that can be applied to a user account.
 * These flags indicate certain attributes or achievements for a user.
 * @see {@link https://discord.com/developers/docs/resources/user#user-object-user-flags}
 */
export enum UserFlags {
  /**
   * Discord Employee (1 << 0 = 1)
   * User works for Discord
   */
  Staff = 1 << 0,

  /**
   * Partnered Server Owner (1 << 1 = 2)
   * User owns a server that has been partnered by Discord
   */
  Partner = 1 << 1,

  /**
   * HypeSquad Events Member (1 << 2 = 4)
   * User is a member of Discord's HypeSquad Events team
   */
  HypeSquad = 1 << 2,

  /**
   * Bug Hunter Level 1 (1 << 3 = 8)
   * User has found and reported bugs on Discord
   */
  BugHunterLevel1 = 1 << 3,

  /**
   * House Bravery Member (1 << 6 = 64)
   * User is a member of HypeSquad House Bravery
   */
  HypeSquadOnlineHouse1 = 1 << 6,

  /**
   * House Brilliance Member (1 << 7 = 128)
   * User is a member of HypeSquad House Brilliance
   */
  HypeSquadOnlineHouse2 = 1 << 7,

  /**
   * House Balance Member (1 << 8 = 256)
   * User is a member of HypeSquad House Balance
   */
  HypeSquadOnlineHouse3 = 1 << 8,

  /**
   * Early Nitro Supporter (1 << 9 = 512)
   * User subscribed to Nitro before October 10, 2018
   */
  PremiumEarlySupporter = 1 << 9,

  /**
   * User is a team (1 << 10 = 1024)
   * Account is a team pseudo-user
   */
  TeamPseudoUser = 1 << 10,

  /**
   * Bug Hunter Level 2 (1 << 14 = 16384)
   * User has found and reported many bugs on Discord
   */
  BugHunterLevel2 = 1 << 14,

  /**
   * Verified Bot (1 << 16 = 65536)
   * Account is a verified bot
   */
  VerifiedBot = 1 << 16,

  /**
   * Early Verified Bot Developer (1 << 17 = 131072)
   * User was an early verified bot developer
   */
  VerifiedDeveloper = 1 << 17,

  /**
   * Moderator Programs Alumni (1 << 18 = 262144)
   * User was part of Discord's moderator programs
   */
  CertifiedModerator = 1 << 18,

  /**
   * Bot uses only HTTP interactions (1 << 19 = 524288)
   * Bot uses only HTTP interactions and is shown in the online member list
   */
  BotHttpInteractions = 1 << 19,

  /**
   * User is an Active Developer (1 << 22 = 4194304)
   * User has an active developer account
   */
  ActiveDeveloper = 1 << 22,
}

/**
 * Validates a username name according to Discord's requirements.
 * Discord enforces specific restrictions for usernames to prevent abuse.
 *
 * Rules:
 * - Names can contain most valid unicode characters
 * - Usernames must be between 2 and 32 characters long
 * - Cannot contain certain substrings: @, #, :, ```, discord
 * - Cannot be: everyone, here
 * - Names are sanitized and trimmed of whitespace
 *
 * @param username The username to validate
 * @returns Whether the name is valid
 */
export function isValidUsername(username: string): boolean {
  // Username cannot contain certain substrings
  const forbiddenSubstrings = ["@", "#", ":", "```", "discord"];
  const forbiddenNames = ["everyone", "here"];

  // Check for forbidden substrings
  for (const substring of forbiddenSubstrings) {
    if (username.includes(substring)) {
      return false;
    }
  }

  // Check if username is a forbidden name
  return !forbiddenNames.includes(username);
}

/**
 * Represents a role connection object that an application has attached to a user.
 * Used for linking third-party accounts with Discord's role connections feature.
 * @see {@link https://discord.com/developers/docs/resources/user#application-role-connection-object}
 */
export interface ApplicationRoleConnectionEntity {
  /**
   * The vanity name of the platform a bot has connected
   * Custom display name for the linked platform
   */
  platform_name: string | null;

  /**
   * The username on the platform a bot has connected
   * The user's name/identifier on the linked platform
   */
  platform_username: string | null;

  /**
   * Object mapping application role connection metadata keys to their string value
   * Contains the metadata used for role requirements checking
   */
  metadata: Record<string, string>;
}

/**
 * Represents a connection that the user has attached to their Discord account.
 * These are third-party service accounts that the user has linked to their Discord profile.
 * @see {@link https://discord.com/developers/docs/resources/user#connection-object}
 */
export interface ConnectionEntity {
  /**
   * ID of the connection account
   * Unique identifier of the connected account on the third-party service
   */
  id: string;

  /**
   * The username of the connection account
   * Display name or identifier on the third-party service
   */
  name: string;

  /**
   * The service of this connection
   * Identifies which third-party service this connection is for
   */
  type: ConnectionService;

  /**
   * Whether the connection is revoked
   * If true, the connection is no longer valid
   */
  revoked?: boolean;

  /**
   * An array of partial server integrations
   * If applicable, contains integrations this connection has with Discord servers
   */
  integrations?: Partial<IntegrationEntity>[];

  /**
   * Whether the connection is verified
   * Indicates if the connection has been verified by the third-party service
   */
  verified: boolean;

  /**
   * Whether friend sync is enabled for this connection
   * If true, friends on the connected service can be added as Discord friends
   */
  friend_sync: boolean;

  /**
   * Whether activities related to this connection will be shown in presence updates
   * Controls if activities from this service appear in Discord status
   */
  show_activity: boolean;

  /**
   * Whether this connection has a corresponding third party OAuth2 token
   * Indicates if there's a valid OAuth2 connection between Discord and the service
   */
  two_way_link: boolean;

  /**
   * Visibility of this connection
   * Controls who can see that this account is connected
   */
  visibility: ConnectionVisibility;
}

/**
 * Represents the data for a user's avatar decoration.
 * Avatar decorations are special frames that can appear around a user's avatar.
 * @see {@link https://discord.com/developers/docs/resources/user#avatar-decoration-data-object}
 */
export interface AvatarDecorationDataEntity {
  /**
   * The avatar decoration hash
   * Used to construct the URL for the decoration image
   */
  asset: string;

  /**
   * ID of the avatar decoration's SKU
   * Identifies which product/item the decoration is from
   */
  sku_id: Snowflake;
}

/**
 * Represents a Discord user account.
 * Users are the base entity in Discord and can exist in multiple guilds,
 * participate in text and voice chat, and more.
 *
 * @remarks
 * - Users are divided into "bot" vs "normal" users
 * - Bot users are automated users owned by another user
 * - Bot users do not have a limitation on the number of guilds they can be in
 * - Usernames must be between 2 and 32 characters long
 * - There are various restrictions on valid usernames (see isValidUsername function)
 *
 * @see {@link https://discord.com/developers/docs/resources/user#user-object}
 */
export interface UserEntity {
  /**
   * The user's ID
   * Unique identifier for the user
   */
  id: Snowflake;

  /**
   * The user's username, not unique across the platform
   * The name used to identify the user, excluding discriminator
   */
  username: string;

  /**
   * The user's Discord-tag (4-digit discriminator)
   * A four-digit code (e.g., "1234") that allows users with the same username to be differentiated
   */
  discriminator: string;

  /**
   * The user's display name, if it is set. For bots, this is the application name
   * A custom name that is shown instead of the username in some places
   */
  global_name: string | null;

  /**
   * The user's avatar hash
   * Used to construct the URL for the user's avatar image
   * Will be null if the user has not set a custom avatar
   */
  avatar: string | null;

  /**
   * Whether the user belongs to an OAuth2 application
   * If true, this user is a bot account
   */
  bot?: boolean;

  /**
   * Whether the user is an Official Discord System user
   * System users are special accounts used for Discord system messages
   */
  system?: boolean;

  /**
   * Whether the user has two-factor authentication enabled
   * Indicates if the user has enhanced account security
   */
  mfa_enabled?: boolean;

  /**
   * The user's banner hash
   * Used to construct the URL for the user's profile banner
   * Available only for users with Nitro
   */
  banner?: string | null;

  /**
   * The user's banner color encoded as an integer representation of hexadecimal color code
   * A custom color shown on the user's profile if they have no banner set
   * Available only for users with Nitro
   */
  accent_color?: number | null;

  /**
   * The user's chosen language option
   * Controls the language of Discord's user interface for this user
   */
  locale?: Locale;

  /**
   * Whether the email on this account has been verified
   * Indicates if the user has confirmed their email address
   * Requires the 'email' OAuth2 scope
   */
  verified?: boolean;

  /**
   * The user's email
   * The email address associated with the user's account
   * Requires the 'email' OAuth2 scope
   */
  email?: string | null;

  /**
   * The flags on a user's account
   * Bitfield of user flags, representing badges and other account features
   * Requires the 'identify' OAuth2 scope
   */
  flags?: UserFlags;

  /**
   * The type of Nitro subscription on a user's account
   * Indicates which level of premium subscription, if any, the user has
   * Requires the 'identify' OAuth2 scope
   */
  premium_type?: PremiumType;

  /**
   * The public flags on a user's account
   * Bitfield of public user flags, viewable by other users
   * Requires the 'identify' OAuth2 scope
   */
  public_flags?: UserFlags;

  /**
   * Data for the user's avatar decoration
   * Contains information about special frames around a user's avatar
   * Requires the 'identify' OAuth2 scope
   */
  avatar_decoration_data?: AvatarDecorationDataEntity | null;
}
