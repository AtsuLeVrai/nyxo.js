import type { Integer, Locales, Snowflake } from "@nyxjs/core";
import type { IntegrationStructure } from "./guilds";

/**
 * @see {@link https://discord.com/developers/docs/resources/user#application-role-connection-object-application-role-connection-structure}
 */
export type ApplicationRoleConnectionStructure = {
	/**
	 * Object mapping application role connection metadata keys to their string-ified value (max 100 characters) for the user on the platform a bot has connected
	 */
	metadata: Record<string, string>;
	/**
	 * The vanity name of the platform a bot has connected (max 50 characters)
	 */
	platform_name: string | null;
	/**
	 * The username on the platform a bot has connected (max 100 characters)
	 */
	platform_username: string | null;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/user#connection-object-visibility-types}
 */
export enum ConnectionVisibilityTypes {
	None = 0,
	Everyone = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#connection-object-services}
 */
export enum ConnectionServices {
	Battlenet = "battlenet",
	Bungie = "bungie",
	Domain = "domain",
	Ebay = "ebay",
	Epicgames = "epicgames",
	Facebook = "facebook",
	Github = "github",
	Instagram = "instagram",
	Leagueoflegends = "leagueoflegends",
	Paypal = "paypal",
	Playstation = "playstation",
	Reddit = "reddit",
	Riotgames = "riotgames",
	Roblox = "roblox",
	Skype = "skype",
	Spotify = "spotify",
	Steam = "steam",
	Tiktok = "tiktok",
	Twitch = "twitch",
	Twitter = "twitter",
	Xbox = "xbox",
	Youtube = "youtube",
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#connection-object-connection-structure}
 */
export type ConnectionStructure = {
	/**
	 * Whether friend sync is enabled for this connection
	 */
	friend_sync: boolean;
	/**
	 * ID of the connection account
	 */
	id: string;
	/**
	 * An array of partial server integrations
	 */
	integrations?: Partial<IntegrationStructure>[];
	/**
	 * The username of the connection account
	 */
	name: string;
	/**
	 * Whether the connection is revoked
	 */
	revoked?: boolean;
	/**
	 * Whether activities related to this connection will be shown in presence updates
	 */
	show_activity: boolean;
	/**
	 * Whether this connection has a corresponding third party OAuth2 token
	 */
	two_way_link: boolean;
	/**
	 * The service of this connection
	 */
	type: ConnectionServices;
	/**
	 * Whether the connection is verified
	 */
	verified: boolean;
	/**
	 * Visibility of this connection
	 */
	visibility: ConnectionVisibilityTypes;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/user#avatar-decoration-data-object-avatar-decoration-data-structure}
 */
export type AvatarDecorationDataStructure = {
	/**
	 * The avatar decoration hash
	 */
	asset: string;
	/**
	 * ID of the avatar decoration's SKU
	 */
	sku_id: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/user#user-object-premium-types}
 */
export enum PremiumTypes {
	None = 0,
	NitroClassic = 1,
	Nitro = 2,
	NitroBasic = 3,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#user-object-user-flags}
 */
export enum UserFlags {
	Staff = 1,
	Partner = 2,
	HypesquadEvents = 4,
	BugHunterLevel1 = 8,
	HouseBravery = 64,
	HouseBrilliance = 128,
	HouseBalance = 256,
	EarlySupporter = 512,
	TeamUser = 1_024,
	System = 4_096,
	BugHunterLevel2 = 16_384,
	VerifiedBot = 65_536,
	VerifiedBotDeveloper = 131_072,
	CertifiedModerator = 262_144,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/user#user-object-user-structure}
 */
export type UserStructure = {
	/**
	 * The user's banner color encoded as an integer representation of hexadecimal color code
	 */
	accent_color?: Integer;
	/**
	 * The user's avatar hash
	 */
	avatar: string | null;
	/**
	 * Data for the user's avatar decoration
	 */
	avatar_decoration_data?: AvatarDecorationDataStructure | null;
	/**
	 * The user's banner hash
	 */
	banner?: string | null;
	/**
	 * Whether the user belongs to an OAuth2 application
	 */
	bot?: boolean;
	/**
	 * The user's Discord-tag
	 */
	discriminator: string;
	/**
	 * The user's email
	 */
	email?: string | null;
	/**
	 * The flags on a user's account
	 */
	flags?: UserFlags;
	/**
	 * The user's display name, if it is set. For bots, this is the application name
	 */
	global_name: string | null;
	/**
	 * The user's id
	 */
	id: Snowflake;
	/**
	 * The user's chosen language option
	 */
	locale?: keyof Locales;
	/**
	 * Whether the user has two factor enabled on their account
	 */
	mfa_enabled?: boolean;
	/**
	 * The type of Nitro subscription on a user's account
	 */
	premium_type?: PremiumTypes;
	/**
	 * The public flags on a user's account
	 */
	public_flags?: UserFlags;
	/**
	 * Whether the user is an Official Discord System user (part of the urgent message system)
	 */
	system?: boolean;
	/**
	 * The user's username, not unique across the platform
	 */
	username: string;
	/**
	 * Whether the email on this account has been verified
	 */
	verified?: boolean;
};
