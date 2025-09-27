import type { FileInput, SetNonNullable } from "../utils/index.js";
import type { ActivityData } from "./activity.js";
import type { Locale } from "./constants.js";
import type { GuildMemberEntity, IntegrationEntity } from "./guild.js";

/**
 * Connection visibility levels that determine who can see a user's connected accounts.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#connection-object-visibility-types} for visibility types specification
 */
export enum ConnectionVisibilityTypes {
  /** Connection is invisible to everyone except the user themselves */
  None = 0,
  /** Connection is visible to everyone */
  Everyone = 1,
}

/**
 * External service platforms that can be connected to Discord accounts.
 * These represent third-party services users can link to their Discord profile.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#connection-object-services} for complete services list
 */
export enum Services {
  AmazonMusic = "amazon-music",
  BattleNet = "battlenet",
  Bluesky = "bluesky",
  Bungie = "bungie",
  Crunchyroll = "crunchyroll",
  Domain = "domain",
  Ebay = "ebay",
  EpicGames = "epicgames",
  Facebook = "facebook",
  GitHub = "github",
  Instagram = "instagram",
  LeagueOfLegends = "leagueoflegends",
  Mastodon = "mastodon",
  PayPal = "paypal",
  PlayStation = "playstation",
  Reddit = "reddit",
  RiotGames = "riotgames",
  Roblox = "roblox",
  Skype = "skype",
  Spotify = "spotify",
  Steam = "steam",
  TikTok = "tiktok",
  Twitch = "twitch",
  Twitter = "twitter",
  Xbox = "xbox",
  YouTube = "youtube",
}

/**
 * Available color palettes for user nameplates.
 * These define the background color schemes users can select for their nameplate decorations.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#nameplate-nameplate-structure} for nameplate documentation
 */
export enum NameplatePalettes {
  Berry = "berry",
  BubbleGum = "bubble_gum",
  Clover = "clover",
  Cobalt = "cobalt",
  Crimson = "crimson",
  Forest = "forest",
  Lemon = "lemon",
  Sky = "sky",
  Teal = "teal",
  Violet = "violet",
  White = "white",
}

/**
 * Discord Nitro subscription tiers that provide various premium features.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#user-object-premium-types} for premium types specification
 */
export enum PremiumTypes {
  /** No premium subscription */
  None = 0,
  /** Legacy Nitro Classic subscription */
  NitroClassic = 1,
  /** Full Nitro subscription with all features */
  Nitro = 2,
  /** Basic Nitro subscription with limited features */
  NitroBasic = 3,
}

/**
 * Bitfield flags representing various Discord user account badges and privileges.
 * These flags indicate special status, achievements, or roles within the Discord ecosystem.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#user-object-user-flags} for complete flags documentation
 */
export enum UserFlags {
  /** Discord Employee badge */
  Staff = 1 << 0,
  /** Partnered Server Owner badge */
  Partner = 1 << 1,
  /** HypeSquad Events Member badge */
  Hypesquad = 1 << 2,
  /** Bug Hunter Level 1 badge */
  BugHunterLevel1 = 1 << 3,
  /** House Bravery Member badge */
  HypesquadOnlineHouse1 = 1 << 6,
  /** House Brilliance Member badge */
  HypesquadOnlineHouse2 = 1 << 7,
  /** House Balance Member badge */
  HypesquadOnlineHouse3 = 1 << 8,
  /** Early Nitro Supporter badge */
  PremiumEarlySupporter = 1 << 9,
  /** User represents a Discord team account */
  TeamPseudoUser = 1 << 10,
  /** Bug Hunter Level 2 badge */
  BugHunterLevel2 = 1 << 14,
  /** Verified Bot badge */
  VerifiedBot = 1 << 16,
  /** Early Verified Bot Developer badge */
  VerifiedDeveloper = 1 << 17,
  /** Moderator Programs Alumni badge */
  CertifiedModerator = 1 << 18,
  /** Bot uses only HTTP interactions and appears in online member list */
  BotHttpInteractions = 1 << 19,
  /** Active Developer badge */
  ActiveDeveloper = 1 << 22,
}

/**
 * Data structure for user avatar decorations containing asset information and SKU identifier.
 * Avatar decorations are cosmetic overlays that appear on user avatars.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#avatar-decoration-data-object} for avatar decoration specification
 */
export interface AvatarDecorationDataObject {
  /** Avatar decoration asset hash for image formatting */
  readonly asset: string;
  /** Unique identifier for the avatar decoration's SKU */
  readonly sku_id: string;
}

/**
 * Configuration data for user nameplate decorations including visual and metadata properties.
 * Nameplates provide customizable background styling for user profiles.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#nameplate-nameplate-structure} for nameplate specification
 */
export interface NameplateObject {
  /** Path to the nameplate asset for image formatting */
  readonly asset: string;
  /** Display label for the nameplate (currently unused) */
  readonly label: string;
  /** Background color palette identifier */
  readonly palette: NameplatePalettes;
  /** Unique identifier for the nameplate's SKU */
  readonly sku_id: string;
}

/**
 * Container for user collectible items excluding Avatar Decorations and Profile Effects.
 * Represents cosmetic items and decorations that users can collect and display.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#collectibles} for collectibles specification
 */
export interface CollectiblesObject {
  /** User's nameplate decoration data */
  readonly nameplate?: NameplateObject;
}

/**
 * Information about a user's primary guild identity and server tag configuration.
 * Primary guild allows users to display a server tag from one of their guilds.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#user-object-user-primary-guild} for primary guild specification
 */
export interface UserPrimaryGuildEntity {
  /** Server tag badge hash for image formatting */
  readonly badge?: string | null;
  /** Whether the user is displaying their primary guild's server tag */
  readonly identity_enabled?: boolean | null;
  /** Unique identifier of the user's primary guild */
  readonly identity_guild_id?: string | null;
  /** Display text of the user's server tag (max 4 characters) */
  readonly tag?: string | null;
}

/**
 * Core Discord user entity containing profile information, preferences, and metadata.
 * Represents both regular users and bot accounts with their associated properties.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#user-object} for complete user object specification
 */
export interface UserObject {
  /** Unique Discord user identifier */
  readonly id: string;
  /** User's chosen username (not unique across platform) */
  readonly username: string;
  /** Legacy Discord discriminator tag */
  readonly discriminator: string;
  /** User's display name if set, or application name for bots */
  readonly global_name: string | null;
  /** User's avatar hash for image formatting */
  readonly avatar: string | null;
  /** Whether the account belongs to an OAuth2 application */
  readonly bot?: boolean;
  /** Whether the account is an Official Discord System user */
  readonly system?: boolean;
  /** Whether two-factor authentication is enabled */
  readonly mfa_enabled?: boolean;
  /** User's banner hash for image formatting */
  readonly banner?: string | null;
  /** User's banner color as integer representation of hexadecimal */
  readonly accent_color?: number | null;
  /** User's chosen language locale */
  readonly locale?: Locale;
  /** Whether the user's email address has been verified */
  readonly verified?: boolean;
  /** User's email address (requires email OAuth2 scope) */
  readonly email?: string | null;
  /** Bitfield of user account flags and badges */
  readonly flags?: UserFlags;
  /** Type of Nitro subscription active on the account */
  readonly premium_type?: PremiumTypes;
  /** Publicly visible user account flags */
  readonly public_flags?: UserFlags;
  /** Data for the user's avatar decoration if equipped */
  readonly avatar_decoration_data?: AvatarDecorationDataObject | null;
  /** User's collectible items and decorations */
  readonly collectibles?: CollectiblesObject | null;
  /** User's primary guild identity configuration */
  readonly primary_guild?: UserPrimaryGuildEntity | null;
}

/**
 * External service connection linked to a Discord user account.
 * Represents integrations with third-party platforms and their visibility settings.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#connection-object} for connection object specification
 */
export interface ConnectionObject {
  /** Unique identifier of the connected account */
  readonly id: string;
  /** Username on the connected platform */
  readonly name: string;
  /** Service type of this connection */
  readonly type: Services;
  /** Whether the connection authorization has been revoked */
  readonly revoked?: boolean;
  /** Array of partial server integrations using this connection */
  readonly integrations?: Partial<IntegrationEntity>[];
  /** Whether the connection has been verified by the service */
  readonly verified: boolean;
  /** Whether friend sync is enabled for this connection */
  readonly friend_sync: boolean;
  /** Whether activities from this service appear in presence updates */
  readonly show_activity: boolean;
  /** Whether this connection has a corresponding OAuth2 token */
  readonly two_way_link: boolean;
  /** Visibility level determining who can see this connection */
  readonly visibility: ConnectionVisibilityTypes;
}

/**
 * Role connection metadata that applications can attach to users.
 * Used for server verification and role assignment based on external platform data.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#application-role-connection-object} for role connection specification
 */
export interface ApplicationRoleConnectionObject {
  /** Vanity name of the connected platform (max 50 characters) */
  readonly platform_name: string | null;
  /** Username on the connected platform (max 100 characters) */
  readonly platform_username: string | null;
  /** Mapping of metadata keys to their string values (max 100 characters each) */
  readonly metadata: Record<string, string>;
}

/**
 * Event data sent when a user begins typing in a text channel.
 * Used to display typing indicators to other users in the same channel.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#typing-start} for typing start event specification
 */
export interface TypingStartObject {
  /** Channel where the user started typing */
  readonly channel_id: string;
  /** Guild containing the channel (if applicable) */
  readonly guild_id?: string;
  /** User who started typing */
  readonly user_id: string;
  /** Unix timestamp when typing started */
  readonly timestamp: number;
  /** Guild member object if typing occurred in a guild */
  readonly member?: GuildMemberEntity;
}

/**
 * Platform-specific online status information for a user across different Discord clients.
 * Shows user's presence state on desktop, mobile, and web platforms independently.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#client-status-object} for client status specification
 */
export interface ClientStatusObject {
  /** Status on desktop clients (Windows, Linux, Mac) */
  readonly desktop?: Omit<UpdatePresenceStatusType, "invisible" | "offline">;
  /** Status on mobile clients (iOS, Android) */
  readonly mobile?: Omit<UpdatePresenceStatusType, "invisible" | "offline">;
  /** Status on web clients (browser, bot users) */
  readonly web?: Omit<UpdatePresenceStatusType, "invisible" | "offline">;
}

/**
 * Complete user presence information including status, activities, and platform details.
 * Represents a user's current state within a specific guild context.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#presence-update} for presence update specification
 */
export interface PresenceUpdateObject {
  /** User whose presence is being updated */
  readonly user: UserObject;
  /** Guild where the presence update occurred */
  readonly guild_id: string;
  /** User's overall online status */
  readonly status: Omit<UpdatePresenceStatusType, "invisible">;
  /** List of user's current activities */
  readonly activities: ActivityData[];
  /** Platform-specific status information */
  readonly client_status: ClientStatusObject;
}

/**
 * Request parameters for modifying the current user's account settings.
 * Supports updating username and avatar/banner images with file uploads.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#modify-current-user} for modify user endpoint
 */
export interface ModifyCurrentUserJSONParams extends Partial<Pick<UserObject, "username">> {
  /** New avatar image data (null to remove) */
  readonly avatar?: FileInput | null;
  /** New banner image data (null to remove) */
  readonly banner?: FileInput | null;
}

/**
 * Query parameters for paginating through the current user's guild list.
 * Controls result ordering, limits, and inclusion of member counts.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guilds} for get guilds endpoint
 */
export interface GetCurrentUserGuildsQueryStringParams {
  /** Get guilds before this guild ID (for pagination) */
  readonly before?: string;
  /** Get guilds after this guild ID (for pagination) */
  readonly after?: string;
  /** Maximum number of guilds to return (1-200, default 200) */
  readonly limit?: number;
  /** Include approximate member and presence counts in response */
  readonly with_counts?: boolean;
}

/**
 * Request parameters for creating a direct message channel with another user.
 * Opens a private conversation channel between the current user and the specified recipient.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#create-dm} for create DM endpoint
 */
export interface CreateDMJSONParams {
  /** User ID to open a DM channel with */
  readonly recipient_id: string;
}

/**
 * Request parameters for creating a group DM channel with multiple users.
 * Requires OAuth2 access tokens with gdm.join scope for each participant.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#create-group-dm} for create group DM endpoint
 */
export interface CreateGroupDMJSONParams {
  /** OAuth2 access tokens for users with gdm.join scope */
  readonly access_tokens: string[];
  /** Mapping of user IDs to their nicknames in the group */
  readonly nicks: Record<string, string>;
}

/**
 * Request parameters for updating application role connection metadata.
 * Allows partial updates to platform information and metadata values.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#update-current-user-application-role-connection} for role connection endpoint
 */
export type UpdateCurrentUserApplicationRoleConnectionJSONParams = Partial<
  SetNonNullable<ApplicationRoleConnectionObject>
>;

/**
 * Available presence status types that users can set for their Discord activity.
 * Controls how the user appears to others and affects notification behavior.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#update-presence-status-types} for status types specification
 */
export type UpdatePresenceStatusType = "online" | "dnd" | "idle" | "invisible" | "offline";
