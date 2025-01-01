import { z } from "zod";
import { SnowflakeSchema } from "../managers/index.js";
import { IntegrationSchema } from "./guild.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/user#application-role-connection-object-application-role-connection-structure}
 */
export const ApplicationRoleConnectionSchema = z
  .object({
    platform_name: z.string().max(50).nullable(),
    platform_username: z.string().max(100).nullable(),
    metadata: z.record(z.string().max(100)),
  })
  .strict();

export type ApplicationRoleConnectionEntity = z.infer<
  typeof ApplicationRoleConnectionSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/user#connection-object-visibility-types}
 */
export const ConnectionVisibility = {
  none: 0,
  everyone: 1,
} as const;

export type ConnectionVisibility =
  (typeof ConnectionVisibility)[keyof typeof ConnectionVisibility];

/**
 * @see {@link https://discord.com/developers/docs/resources/user#connection-object-services}
 */
export const ConnectionService = {
  amazonMusic: "amazon-music",
  battlenet: "battlenet",
  bungie: "bungie",
  domain: "domain",
  ebay: "ebay",
  epicGames: "epicgames",
  facebook: "facebook",
  gitHub: "github",
  instagram: "instagram",
  leagueOfLegends: "leagueoflegends",
  payPal: "paypal",
  playStation: "playstation",
  reddit: "reddit",
  riotGames: "riotgames",
  roblox: "roblox",
  spotify: "spotify",
  skype: "skype",
  steam: "steam",
  tikTok: "tiktok",
  twitch: "twitch",
  twitter: "twitter",
  xbox: "xbox",
  youTube: "youtube",
} as const;

export type ConnectionService =
  (typeof ConnectionService)[keyof typeof ConnectionService];

/**
 * @see {@link https://discord.com/developers/docs/resources/user#connection-object-connection-structure}
 */
export const ConnectionSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    type: z.nativeEnum(ConnectionService),
    revoked: z.boolean().optional(),
    integrations: z.array(z.lazy(() => IntegrationSchema.partial())).optional(),
    verified: z.boolean(),
    friend_sync: z.boolean(),
    show_activity: z.boolean(),
    two_way_link: z.boolean(),
    visibility: z.number().min(0).max(1),
  })
  .strict();

export type ConnectionEntity = z.infer<typeof ConnectionSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/user#avatar-decoration-data-object-avatar-decoration-data-structure}
 */
export const AvatarDecorationDataSchema = z
  .object({
    asset: z.string(),
    sku_id: SnowflakeSchema,
  })
  .strict();

export type AvatarDecorationDataEntity = z.infer<
  typeof AvatarDecorationDataSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/user#user-object-premium-types}
 */
export const PremiumType = {
  none: 0,
  nitroClassic: 1,
  nitro: 2,
  nitroBasic: 3,
} as const;

export type PremiumType = (typeof PremiumType)[keyof typeof PremiumType];

/**
 * @see {@link https://discord.com/developers/docs/resources/user#user-object-user-flags}
 */
export const UserFlags = {
  staff: 1 << 0,
  partner: 1 << 1,
  hypeSquad: 1 << 2,
  bugHunterLevel1: 1 << 3,
  hypeSquadOnlineHouse1: 1 << 6,
  hypeSquadOnlineHouse2: 1 << 7,
  hypeSquadOnlineHouse3: 1 << 8,
  premiumEarlySupporter: 1 << 9,
  teamPseudoUser: 1 << 10,
  bugHunterLevel2: 1 << 14,
  verifiedBot: 1 << 16,
  verifiedDeveloper: 1 << 17,
  certifiedModerator: 1 << 18,
  botHttpInteractions: 1 << 19,
  activeDeveloper: 1 << 22,
} as const;

export type UserFlags = (typeof UserFlags)[keyof typeof UserFlags];

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
export const UserSchema = z
  .object({
    id: SnowflakeSchema,
    username: z.string().min(2).max(32).refine(isUsernameValid),
    discriminator: z.string(),
    global_name: z.string().nullable(),
    avatar: z.string().nullable(),
    bot: z.boolean().optional(),
    system: z.boolean().optional(),
    mfa_enabled: z.boolean().optional(),
    banner: z.string().nullish(),
    accent_color: z.number().int().optional(),
    locale: z.string().optional(),
    verified: z.boolean().optional(),
    email: z.string().email().nullish(),
    flags: z.nativeEnum(UserFlags).optional(),
    premium_type: z.nativeEnum(PremiumType).optional(),
    public_flags: z.nativeEnum(UserFlags).optional(),
    avatar_decoration_data: AvatarDecorationDataSchema.nullish(),
  })
  .strict();

export type UserEntity = z.infer<typeof UserSchema>;
