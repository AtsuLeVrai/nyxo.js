import { z } from "zod";
import { LocaleKey } from "../enums/index.js";
import { BitFieldManager, Snowflake } from "../managers/index.js";
import { IntegrationEntity } from "./guild.entity.js";

/**
 * Represents the visibility options for a user's connection.
 * @see {@link https://discord.com/developers/docs/resources/user#connection-object-visibility-types}
 */
export enum ConnectionVisibility {
  /** Invisible to everyone except the user themselves */
  None = 0,

  /** Visible to everyone */
  Everyone = 1,
}

/**
 * Represents the supported external service types for user connections.
 * @see {@link https://discord.com/developers/docs/resources/user#connection-object-services}
 */
export enum ConnectionService {
  /** Amazon Music connection */
  AmazonMusic = "amazon-music",

  /** Battle.net connection */
  Battlenet = "battlenet",

  /** Bungie.net connection */
  Bungiev = "bungie",

  /** Domain connection */
  Domain = "domain",

  /** eBay connection */
  Ebay = "ebay",

  /** Epic Games connection */
  EpicGames = "epicgames",

  /** Facebook connection */
  Facebook = "facebook",

  /** GitHub connection */
  GitHub = "github",

  /** Instagram connection (can no longer be added by users) */
  Instagram = "instagram",

  /** League of Legends connection */
  LeagueOfLegends = "leagueoflegends",

  /** PayPal connection */
  PayPal = "paypal",

  /** PlayStation Network connection */
  PlayStation = "playstation",

  /** Reddit connection */
  Reddit = "reddit",

  /** Riot Games connection */
  RiotGames = "riotgames",

  /** Roblox connection */
  Roblox = "roblox",

  /** Spotify connection */
  Spotify = "spotify",

  /** Skype connection (can no longer be added by users) */
  Skype = "skype",

  /** Steam connection */
  Steam = "steam",

  /** TikTok connection */
  TikTok = "tiktok",

  /** Twitch connection */
  Twitch = "twitch",

  /** X (Twitter) connection */
  Twitter = "twitter",

  /** Xbox connection */
  Xbox = "xbox",

  /** YouTube connection */
  YouTube = "youtube",

  /** Bluesky connection */
  Bluesky = "bluesky",

  /** Crunchyroll connection */
  Crunchyroll = "crunchyroll",

  /** Mastodon connection */
  Mastodon = "mastodon",
}

/**
 * Represents the premium subscription levels a user can have.
 * @see {@link https://discord.com/developers/docs/resources/user#user-object-premium-types}
 */
export enum PremiumType {
  /** User has no Nitro subscription */
  None = 0,

  /** User has a Nitro Classic subscription */
  NitroClassic = 1,

  /** User has a Nitro subscription */
  Nitro = 2,

  /** User has a Nitro Basic subscription */
  NitroBasic = 3,
}

/**
 * Represents the badges/flags that can be applied to a user account.
 * @see {@link https://discord.com/developers/docs/resources/user#user-object-user-flags}
 */
export enum UserFlags {
  /** Discord Employee */
  Staff = 1 << 0,

  /** Partnered Server Owner */
  Partner = 1 << 1,

  /** HypeSquad Events Member */
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

  /** User is a team */
  TeamPseudoUser = 1 << 10,

  /** Bug Hunter Level 2 */
  BugHunterLevel2 = 1 << 14,

  /** Verified Bot */
  VerifiedBot = 1 << 16,

  /** Early Verified Bot Developer */
  VerifiedDeveloper = 1 << 17,

  /** Moderator Programs Alumni */
  CertifiedModerator = 1 << 18,

  /** Bot uses only HTTP interactions and is shown in the online member list */
  BotHttpInteractions = 1 << 19,

  /** User is an Active Developer */
  ActiveDeveloper = 1 << 22,
}

/**
 * Represents the role connection object that an application has attached to a user.
 * @see {@link https://discord.com/developers/docs/resources/user#application-role-connection-object}
 */
export const ApplicationRoleConnectionEntity = z.object({
  /** The vanity name of the platform a bot has connected (max 50 characters) */
  platform_name: z.string().max(50).nullable(),

  /** The username on the platform a bot has connected (max 100 characters) */
  platform_username: z.string().max(100).nullable(),

  /** Object mapping application role connection metadata keys to their string value (max 100 characters) */
  metadata: z.record(z.string().max(100)),
});

export type ApplicationRoleConnectionEntity = z.infer<
  typeof ApplicationRoleConnectionEntity
>;

/**
 * Represents a connection that the user has attached to their Discord account.
 * @see {@link https://discord.com/developers/docs/resources/user#connection-object}
 */
export const ConnectionEntity = z.object({
  /** ID of the connection account */
  id: z.string(),

  /** The username of the connection account */
  name: z.string(),

  /** The service of this connection */
  type: z.nativeEnum(ConnectionService),

  /** Whether the connection is revoked */
  revoked: z.boolean().optional(),

  /** An array of partial server integrations */
  integrations: z.array(z.lazy(() => IntegrationEntity.partial())).optional(),

  /** Whether the connection is verified */
  verified: z.boolean(),

  /** Whether friend sync is enabled for this connection */
  friend_sync: z.boolean(),

  /** Whether activities related to this connection will be shown in presence updates */
  show_activity: z.boolean(),

  /** Whether this connection has a corresponding third party OAuth2 token */
  two_way_link: z.boolean(),

  /** Visibility of this connection */
  visibility: z.nativeEnum(ConnectionVisibility),
});

export type ConnectionEntity = z.infer<typeof ConnectionEntity>;

/**
 * Represents the data for a user's avatar decoration.
 * @see {@link https://discord.com/developers/docs/resources/user#avatar-decoration-data-object}
 */
export const AvatarDecorationDataEntity = z.object({
  /** The avatar decoration hash */
  asset: z.string(),

  /** ID of the avatar decoration's SKU */
  sku_id: Snowflake,
});

export type AvatarDecorationDataEntity = z.infer<
  typeof AvatarDecorationDataEntity
>;

/**
 * Validates if a username follows Discord's username requirements.
 * Discord enforces specific restrictions on usernames, including disallowed substrings and reserved names.
 * @param value The username to validate
 * @returns Whether the username is valid according to Discord's rules
 */
function isUsernameValid(value: string): value is string {
  const forbiddenSubstrings = ["@", "#", ":", "```", "discord"];
  const forbiddenNames = ["everyone", "here"];

  const hasDisallowedSubstring = forbiddenSubstrings.some((substr) =>
    value.toLowerCase().includes(substr),
  );

  const isDisallowedName = forbiddenNames.includes(value.toLowerCase());

  return !(hasDisallowedSubstring || isDisallowedName);
}

/**
 * Represents a Discord user account.
 * @see {@link https://discord.com/developers/docs/resources/user#user-object}
 */
export const UserEntity = z.object({
  /** The user's ID */
  id: Snowflake,

  /** The user's username, not unique across the platform */
  username: z.string().min(2).max(32).refine(isUsernameValid),

  /** The user's Discord-tag (4-digit discriminator) */
  discriminator: z.string(),

  /** The user's display name, if it is set. For bots, this is the application name */
  global_name: z.string().nullable(),

  /** The user's avatar hash */
  avatar: z.string().nullable(),

  /** Whether the user belongs to an OAuth2 application */
  bot: z.boolean().optional(),

  /** Whether the user is an Official Discord System user */
  system: z.boolean().optional(),

  /** Whether the user has two-factor authentication enabled */
  mfa_enabled: z.boolean().optional(),

  /** The user's banner hash */
  banner: z.string().nullish(),

  /** The user's banner color encoded as an integer representation of hexadecimal color code */
  accent_color: z.number().int().nullish(),

  /** The user's chosen language option */
  locale: LocaleKey.optional(),

  /** Whether the email on this account has been verified */
  verified: z.boolean().optional(),

  /** The user's email */
  email: z.string().email().nullish(),

  /** The flags on a user's account */
  flags: z.custom<UserFlags>(BitFieldManager.isValidBitField).optional(),

  /** The type of Nitro subscription on a user's account */
  premium_type: z.nativeEnum(PremiumType).optional(),

  /** The public flags on a user's account */
  public_flags: z.custom<UserFlags>(BitFieldManager.isValidBitField).optional(),

  /** Data for the user's avatar decoration */
  avatar_decoration_data: z.lazy(() => AvatarDecorationDataEntity).nullish(),
});

export type UserEntity = z.infer<typeof UserEntity>;
