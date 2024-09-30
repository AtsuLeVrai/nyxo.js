import type { LocaleKeys } from "../enums/locales";
import type { Integer, Snowflake } from "../markdown/formats";
import type { ApplicationRoleConnectionMetadataStructure } from "./applications";
import type { IntegrationStructure } from "./guilds";

/**
 * @see {@link https://discord.com/developers/docs/resources/user#application-role-connection-object-application-role-connection-structure|Application Role Connection Structure}
 */
export type ApplicationRoleConnectionStructure = {
    /**
     * Object mapping application role connection metadata keys to their string-ified value (max 100 characters) for the user on the platform a bot has connected.
     */
    metadata: Record<string, ApplicationRoleConnectionMetadataStructure>;
    /**
     * The vanity name of the platform a bot has connected (max 50 characters).
     */
    platform_name: string | null;
    /**
     * The username on the platform a bot has connected (max 100 characters).
     */
    platform_username: string | null;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/user#connection-object-visibility-types|Connection Visibility Types}
 */
export enum ConnectionVisibilityTypes {
    /**
     * Invisible to everyone except the user themselves.
     */
    None = 0,
    /**
     * Visible to everyone.
     */
    Everyone = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#connection-object-services|Connection Services}
 */
export type ConnectionServices =
    | "amazon-music"
    | "battlenet"
    | "bungie"
    | "domain"
    | "ebay"
    | "epicgames"
    | "facebook"
    | "github"
    | "instagram"
    | "leagueoflegends"
    | "paypal"
    | "playstation"
    | "reddit"
    | "riotgames"
    | "roblox"
    | "skype"
    | "spotify"
    | "steam"
    | "tiktok"
    | "twitch"
    | "twitter"
    | "xbox"
    | "youtube";

/**
 * @see {@link https://discord.com/developers/docs/resources/user#connection-object-connection-structure|Connection Structure}
 */
export type ConnectionStructure = {
    /**
     * Whether friend sync is enabled for this connection.
     */
    friend_sync: boolean;
    /**
     * The id of the connection account.
     */
    id: string;
    /**
     * An array of partial server integrations.
     *
     * @todo No information available in the Discord API documentation
     */
    integrations?: Partial<IntegrationStructure>[];
    /**
     * The username of the connection account.
     */
    name: string;
    /**
     * Whether the connection is revoked.
     */
    revoked?: boolean;
    /**
     * Whether activities related to this connection will be shown in presence updates.
     */
    show_activity: boolean;
    /**
     * Whether this connection has a corresponding third party OAuth2 token.
     */
    two_way_link: boolean;
    /**
     * The service of this connection.
     */
    type: ConnectionServices;
    /**
     * Whether the connection is verified.
     */
    verified: boolean;
    /**
     * Visibility of this connection.
     */
    visibility: ConnectionVisibilityTypes;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/user#avatar-decoration-data-object-avatar-decoration-data-structure|Avatar Decoration Data Structure}
 */
export type AvatarDecorationDataStructure = {
    /**
     * The avatar decoration hash.
     */
    asset: string;
    /**
     * Id of the avatar decoration's SKU.
     */
    sku_id: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/user#user-object-premium-types|Premium Types}
 */
export enum PremiumTypes {
    None = 0,
    NitroClassic = 1,
    Nitro = 2,
    NitroBasic = 3,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#user-object-user-flags|User Flags}
 */
export enum UserFlags {
    /**
     * Discord Employee
     */
    Staff = 1,
    /**
     * Partnered Server Owner
     */
    Partner = 2,
    /**
     * HypeSquad Events Member
     */
    HypeSquad = 4,
    /**
     * Bug Hunter Level 1
     */
    BugHunterLevel1 = 8,
    /**
     * House Bravery Member
     */
    HypeSquadOnlineHouse1 = 64,
    /**
     * House Brilliance Member
     */
    HypeSquadOnlineHouse2 = 128,
    /**
     * House Balance Member
     */
    HypeSquadOnlineHouse3 = 256,
    /**
     * Early Nitro Supporter
     */
    PremiumEarlySupporter = 512,
    /**
     * User is a team
     */
    TeamPseudoUser = 1_024,
    /**
     * Bug Hunter Level 2
     */
    BugHunterLevel2 = 16_384,
    /**
     * Verified Bot
     */
    VerifiedBot = 65_536,
    /**
     * Early Verified Bot Developer
     */
    VerifiedDeveloper = 131_072,
    /**
     * Moderator Programs Alumni
     */
    CertifiedModerator = 262_144,
    /**
     * Bot uses only HTTP interactions and is shown in the online member list
     */
    BotHttpInteractions = 524_288,
    /**
     * User is an Active Developer
     */
    ActiveDeveloper = 4_194_304,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#user-object-user-structure|User Structure}
 */
export type UserStructure = {
    /**
     * The user's banner color encoded as an integer representation of hexadecimal color code.
     */
    accent_color?: Integer | null;
    /**
     * The user's avatar hash.
     */
    avatar: string | null;
    /**
     * Data for the user's avatar decoration.
     */
    avatar_decoration_data?: AvatarDecorationDataStructure | null;
    /**
     * The user's banner hash.
     */
    banner?: string | null;
    /**
     * Whether the user belongs to an OAuth2 application.
     */
    bot?: boolean;
    /**
     * The user's Discord-tag.
     */
    discriminator: string;
    /**
     * The user's email.
     */
    email?: string | null;
    /**
     * The flags on a user's account.
     */
    flags?: UserFlags;
    /**
     * The user's display name, if it is set. For bots, this is the application name.
     */
    global_name: string | null;
    /**
     * The user's id.
     */
    id: Snowflake;
    /**
     * The user's chosen language option.
     */
    locale?: LocaleKeys;
    /**
     * Whether the user has two factor enabled on their account.
     */
    mfa_enabled?: boolean;
    /**
     * The type of Nitro subscription on a user's account.
     */
    premium_type?: PremiumTypes;
    /**
     * The public flags on a user's account.
     */
    public_flags?: UserFlags;
    /**
     * Whether the user is an Official Discord System user (part of the urgent message system).
     */
    system?: boolean;
    /**
     * The user's username, not unique across the platform.
     */
    username: string;
    /**
     * Whether the email on this account has been verified.
     */
    verified?: boolean;
};
