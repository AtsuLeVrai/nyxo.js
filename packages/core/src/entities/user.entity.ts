import { z } from "zod";
import { LocaleKey } from "../enums/index.js";
import { Snowflake } from "../managers/index.js";
import { parseBitField } from "../utils/index.js";
import { IntegrationEntity } from "./guild.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/user#connection-object-visibility-types}
 */
export enum ConnectionVisibility {
  None = 0,
  Everyone = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#connection-object-services}
 */
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
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#user-object-premium-types}
 */
export enum PremiumType {
  None = 0,
  NitroClassic = 1,
  Nitro = 2,
  NitroBasic = 3,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#user-object-user-flags}
 */
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

/**
 * @see {@link https://discord.com/developers/docs/resources/user#application-role-connection-object-application-role-connection-structure}
 */
export const ApplicationRoleConnectionEntity = z.object({
  platform_name: z.string().max(50).nullable(),
  platform_username: z.string().max(100).nullable(),
  metadata: z.record(z.string().max(100)),
});

export type ApplicationRoleConnectionEntity = z.infer<
  typeof ApplicationRoleConnectionEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/user#connection-object-connection-structure}
 */
export const ConnectionEntity = z.object({
  id: z.string(),
  name: z.string(),
  type: z.nativeEnum(ConnectionService),
  revoked: z.boolean().optional(),
  integrations: z.array(z.lazy(() => IntegrationEntity.partial())).optional(),
  verified: z.boolean(),
  friend_sync: z.boolean(),
  show_activity: z.boolean(),
  two_way_link: z.boolean(),
  visibility: z.number().min(0).max(1),
});

export type ConnectionEntity = z.infer<typeof ConnectionEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/user#avatar-decoration-data-object-avatar-decoration-data-structure}
 */
export const AvatarDecorationDataEntity = z.object({
  asset: z.string(),
  sku_id: Snowflake,
});

export type AvatarDecorationDataEntity = z.infer<
  typeof AvatarDecorationDataEntity
>;

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
 * @see {@link https://discord.com/developers/docs/resources/user#user-object-user-structure}
 */
export const UserEntity = z.object({
  id: Snowflake,
  username: z.string().min(2).max(32).refine(isUsernameValid),
  discriminator: z.string(),
  global_name: z.string().nullable(),
  avatar: z.string().nullable(),
  bot: z.boolean().optional(),
  system: z.boolean().optional(),
  mfa_enabled: z.boolean().optional(),
  banner: z.string().nullish(),
  accent_color: z.number().int().nullish(),
  locale: LocaleKey.optional(),
  verified: z.boolean().optional(),
  email: z.string().email().nullish(),
  flags: parseBitField<UserFlags>().optional(),
  premium_type: z.nativeEnum(PremiumType).optional(),
  public_flags: parseBitField<UserFlags>().optional(),
  avatar_decoration_data: AvatarDecorationDataEntity.nullish(),
});

export type UserEntity = z.infer<typeof UserEntity>;
