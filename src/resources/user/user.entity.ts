import type { LocaleValues } from "../../enum/index.js";
import type { GuildMemberEntity, IntegrationEntity } from "../guild/index.js";

/**
 * @description Visibility levels for Discord user connections to third-party services.
 * @see {@link https://discord.com/developers/docs/resources/user#connection-object-visibility-types}
 */
export enum ConnectionVisibility {
  /** Connection is not visible to anyone */
  None = 0,
  /** Connection is visible to everyone */
  Everyone = 1,
}

/**
 * @description Third-party services that can be connected to Discord user profiles.
 * @see {@link https://discord.com/developers/docs/resources/user#connection-object-services}
 */
export enum ConnectionService {
  /** Amazon Music */
  AmazonMusic = "amazon-music",
  /** Battle.net */
  Battlenet = "battlenet",
  /** Bungie */
  Bungiev = "bungie",
  /** Domain verification */
  Domain = "domain",
  /** eBay */
  Ebay = "ebay",
  /** Epic Games */
  EpicGames = "epicgames",
  /** Facebook */
  Facebook = "facebook",
  /** GitHub */
  GitHub = "github",
  /** Instagram */
  Instagram = "instagram",
  /** League of Legends */
  LeagueOfLegends = "leagueoflegends",
  /** PayPal */
  PayPal = "paypal",
  /** PlayStation Network */
  PlayStation = "playstation",
  /** Reddit */
  Reddit = "reddit",
  /** Riot Games */
  RiotGames = "riotgames",
  /** Roblox */
  Roblox = "roblox",
  /** Spotify */
  Spotify = "spotify",
  /** Skype */
  Skype = "skype",
  /** Steam */
  Steam = "steam",
  /** TikTok */
  TikTok = "tiktok",
  /** Twitch */
  Twitch = "twitch",
  /** Twitter/X */
  Twitter = "twitter",
  /** Xbox Live */
  Xbox = "xbox",
  /** YouTube */
  YouTube = "youtube",
  /** Bluesky */
  Bluesky = "bluesky",
  /** Crunchyroll */
  Crunchyroll = "crunchyroll",
  /** Mastodon */
  Mastodon = "mastodon",
}

/**
 * @description Color palettes available for Discord user nameplates.
 * @see {@link https://discord.com/developers/docs/resources/user#nameplate-object}
 */
export enum NameplatePalette {
  /** Crimson red */
  Crimson = "crimson",
  /** Berry purple */
  Berry = "berry",
  /** Sky blue */
  Sky = "sky",
  /** Teal green */
  Teal = "teal",
  /** Forest green */
  Forest = "forest",
  /** Bubble gum pink */
  BubbleGum = "bubble_gum",
  /** Violet purple */
  Violet = "violet",
  /** Cobalt blue */
  Cobalt = "cobalt",
  /** Clover green */
  Clover = "clover",
  /** Lemon yellow */
  Lemon = "lemon",
  /** White */
  White = "white",
}

/**
 * @description Discord Nitro subscription levels for premium users.
 * @see {@link https://discord.com/developers/docs/resources/user#user-object-premium-types}
 */
export enum PremiumType {
  /** No premium subscription */
  None = 0,
  /** Nitro Classic subscription */
  NitroClassic = 1,
  /** Full Nitro subscription */
  Nitro = 2,
  /** Nitro Basic subscription */
  NitroBasic = 3,
}

/**
 * @description Bitwise flags representing Discord user badges and special statuses.
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
  /** Bot uses only HTTP interactions */
  BotHttpInteractions = 1 << 19,
  /** Active Developer */
  ActiveDeveloper = 1 << 22,
}

/**
 * @description Bitwise flags for Discord user activities and Rich Presence.
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#activity-object-activity-flags}
 */
export enum ActivityFlags {
  /** Activity is an instanced game session */
  Instance = 1 << 0,
  /** Activity can be joined */
  Join = 1 << 1,
  /** Activity can be spectated */
  Spectate = 1 << 2,
  /** Activity has join requests */
  JoinRequest = 1 << 3,
  /** Activity can be synced */
  Sync = 1 << 4,
  /** Activity can be played */
  Play = 1 << 5,
  /** Party privacy set to friends only */
  PartyPrivacyFriends = 1 << 6,
  /** Party privacy set to voice channel only */
  PartyPrivacyVoiceChannel = 1 << 7,
  /** Activity is embedded */
  Embedded = 1 << 8,
}

/**
 * @description Types of Discord user activities for Rich Presence display.
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#activity-object-activity-types}
 */
export enum ActivityType {
  /** Playing a game */
  Game = 0,
  /** Streaming on Twitch/YouTube */
  Streaming = 1,
  /** Listening to music */
  Listening = 2,
  /** Watching something */
  Watching = 3,
  /** Custom status message */
  Custom = 4,
  /** Competing in an event */
  Competing = 5,
}

/**
 * @description Represents a Discord user's role connection to an external application.
 * @see {@link https://discord.com/developers/docs/resources/user#application-role-connection-object}
 */
export interface ApplicationRoleConnectionEntity {
  /** Name of the external platform */
  platform_name: string | null;
  /** Username on the external platform */
  platform_username: string | null;
  /** Metadata fields and values set by the application */
  metadata: Record<string, string>;
}

/**
 * @description Represents a Discord user's connection to a third-party service.
 * @see {@link https://discord.com/developers/docs/resources/user#connection-object}
 */
export interface ConnectionEntity {
  /** ID of the connected account */
  id: string;
  /** Username of the connected account */
  name: string;
  /** Service type of this connection */
  type: ConnectionService;
  /** Whether the connection is revoked */
  revoked?: boolean;
  /** Array of guild integrations for this connection */
  integrations?: Partial<IntegrationEntity>[];
  /** Whether the connection is verified */
  verified: boolean;
  /** Whether friend sync is enabled for this connection */
  friend_sync: boolean;
  /** Whether activities from this connection are shown */
  show_activity: boolean;
  /** Whether this connection supports two-way linking */
  two_way_link: boolean;
  /** Visibility level of this connection */
  visibility: ConnectionVisibility;
}

/**
 * @description Data for a Discord user's avatar decoration.
 * @see {@link https://discord.com/developers/docs/resources/user#avatar-decoration-data-object}
 */
export interface AvatarDecorationDataEntity {
  /** Avatar decoration hash for image formatting */
  asset: string;
  /** Snowflake ID of the avatar decoration's SKU */
  sku_id: string;
}

/**
 * @description Represents a Discord user's primary guild identity settings.
 * @see {@link https://discord.com/developers/docs/resources/user#user-object-user-primary-guild}
 */
export interface UserPrimaryGuildEntity {
  /** Snowflake ID of the user's primary guild */
  identity_guild_id?: string | null;
  /** Whether the user is displaying the primary guild's server tag */
  identity_enabled?: boolean | null;
  /** Text of the user's server tag (max 4 characters) */
  tag?: string | null;
  /** Server tag badge hash for image formatting */
  badge?: string | null;
}

/**
 * @description Represents a Discord user's nameplate collectible.
 * @see {@link https://discord.com/developers/docs/resources/user#nameplate-object}
 */
export interface NameplateEntity {
  /** Snowflake ID of the nameplate's SKU */
  sku_id: string;
  /** Asset path for the nameplate */
  asset: string;
  /** Display label for the nameplate */
  label: string;
  /** Color palette used by the nameplate */
  palette: NameplatePalette;
}

/**
 * @description Represents a Discord user's collectible items excluding avatar decorations.
 * @see {@link https://discord.com/developers/docs/resources/user#collectibles-object}
 */
export interface CollectiblesEntity {
  /** User's nameplate collectible */
  nameplate?: NameplateEntity;
}

/**
 * @description Represents a Discord user account with profile information and settings.
 * @see {@link https://discord.com/developers/docs/resources/user#user-object}
 */
export interface UserEntity {
  /** Unique snowflake identifier for the user */
  id: string;
  /** Username (not unique across platform) */
  username: string;
  /** User's Discord tag (legacy system) */
  discriminator: string;
  /** User's display name (null if not set) */
  global_name: string | null;
  /** User's avatar hash (null for default avatar) */
  avatar: string | null;
  /** Whether user is a bot application */
  bot?: boolean;
  /** Whether user is an Official Discord System user */
  system?: boolean;
  /** Whether user has 2FA enabled */
  mfa_enabled?: boolean;
  /** User's banner hash (null if no banner) */
  banner?: string | null;
  /** User's banner color as integer representation of hex */
  accent_color?: number | null;
  /** User's chosen language */
  locale?: LocaleValues;
  /** Whether user's email is verified */
  verified?: boolean;
  /** User's email address */
  email?: string | null;
  /** Bitwise flags representing user badges */
  flags?: UserFlags;
  /** Type of Nitro subscription */
  premium_type?: PremiumType;
  /** Public bitwise flags for user badges */
  public_flags?: UserFlags;
  /** Data for user's avatar decoration */
  avatar_decoration_data?: AvatarDecorationDataEntity | null;
  /** User's primary guild identity settings */
  primary_guild?: UserPrimaryGuildEntity | null;
  /** User's collectible items */
  collectibles?: CollectiblesEntity | null;
}

/**
 * @description Represents a user starting to type in a channel via gateway event.
 * @see {@link https://discord.com/developers/docs/events/gateway-events#typing-start}
 */
export interface GatewayTypingStartEntity {
  /** Channel ID where typing is occurring */
  channel_id: string;
  /** Guild ID where typing is occurring (if in guild channel) */
  guild_id?: string;
  /** User ID who started typing */
  user_id: string;
  /** Unix timestamp when typing started */
  timestamp: number;
  /** Guild member object (if typing in guild channel) */
  member?: GuildMemberEntity;
}

/**
 * @description Represents a clickable button in a Discord Rich Presence activity.
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#activity-object-activity-buttons}
 */
export interface ActivityButtonEntity {
  /** Text shown on the button */
  label: string;
  /** URL opened when button is clicked */
  url: string;
}

/**
 * @description Secrets for Rich Presence activity join and spectate functionality.
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#activity-object-activity-secrets}
 */
export interface ActivitySecretsEntity {
  /** Secret for joining a party */
  join?: string;
  /** Secret for spectating a game */
  spectate?: string;
  /** Secret for a specific instanced match */
  match?: string;
}

/**
 * @description Asset images displayed in Discord Rich Presence activity.
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#activity-object-activity-assets}
 */
export interface ActivityAssetImageEntity {
  /** Text displayed when hovering over large image */
  large_text?: string;
  /** ID of uploaded image for large asset */
  large_image?: string;
  /** Text displayed when hovering over small image */
  small_text?: string;
  /** ID of uploaded image for small asset */
  small_image?: string;
}

/**
 * @description Party information for Discord Rich Presence activity.
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#activity-object-activity-party}
 */
export interface ActivityPartyEntity {
  /** ID of the party */
  id?: string;
  /** Current and maximum party size [current_size, max_size] */
  size?: [number, number];
}

/**
 * @description Emoji used in Discord custom status activities.
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#activity-object-activity-emoji}
 */
export interface ActivityEmojiEntity {
  /** Name of the emoji */
  name: string;
  /** ID of the emoji (if custom emoji) */
  id?: string;
  /** Whether the emoji is animated */
  animated?: boolean;
}

/**
 * @description Unix timestamps for Discord Rich Presence activity duration.
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#activity-object-activity-timestamps}
 */
export interface ActivityTimestampsEntity {
  /** Unix timestamp when activity started */
  start?: number;
  /** Unix timestamp when activity will end */
  end?: number;
}

/**
 * @description Represents a Discord user's Rich Presence activity or custom status.
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#activity-object}
 */
export interface ActivityEntity {
  /** Activity name */
  name: string;
  /** Activity type (Game, Streaming, Listening, etc.) */
  type: ActivityType;
  /** Stream URL (only for Streaming type) */
  url?: string | null;
  /** Unix timestamp when activity was created */
  created_at: number;
  /** Unix timestamps for activity start and end times */
  timestamps?: ActivityTimestampsEntity;
  /** Application ID for the activity */
  application_id?: string;
  /** What the player is currently doing */
  details?: string | null;
  /** Current party status */
  state?: string | null;
  /** Emoji used in custom status */
  emoji?: ActivityEmojiEntity | null;
  /** Information about party for this activity */
  party?: ActivityPartyEntity;
  /** Images for the presence and hover texts */
  assets?: ActivityAssetImageEntity;
  /** Secrets for Rich Presence joining and spectating */
  secrets?: ActivitySecretsEntity;
  /** Whether activity is an instanced game session */
  instance?: boolean;
  /** Activity flags describing what action buttons show */
  flags?: ActivityFlags;
  /** Custom buttons shown in Rich Presence */
  buttons?: ActivityButtonEntity[];
}

/**
 * @description Status types for Discord user presence updates.
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#update-presence}
 */
export type UpdatePresenceStatusType = "online" | "dnd" | "idle" | "invisible" | "offline";

/**
 * @description Platform-specific status information for Discord user presence.
 * @see {@link https://discord.com/developers/docs/events/gateway-events#presence-update-presence-update-event-fields}
 */
export interface ClientStatusEntity {
  /** User's status on desktop client */
  desktop?: Omit<UpdatePresenceStatusType, "invisible" | "offline">;
  /** User's status on mobile client */
  mobile?: Omit<UpdatePresenceStatusType, "invisible" | "offline">;
  /** User's status on web client */
  web?: Omit<UpdatePresenceStatusType, "invisible" | "offline">;
}

/**
 * @description Represents a Discord user's presence information in a guild via gateway event.
 * @see {@link https://discord.com/developers/docs/events/gateway-events#presence-update}
 */
export interface GatewayPresenceUpdateEntity {
  /** User this presence belongs to */
  user: UserEntity;
  /** Guild ID where this presence applies */
  guild_id: string;
  /** User's overall status */
  status: Omit<UpdatePresenceStatusType, "invisible">;
  /** User's current activities */
  activities: ActivityEntity[];
  /** User's status on different platforms */
  client_status: ClientStatusEntity;
}

/**
 * @description Validates a Discord username according to platform restrictions.
 * @see {@link https://discord.com/developers/docs/resources/user#usernames-and-nicknames}
 *
 * @param username - Username string to validate
 * @returns True if username is valid according to Discord rules
 */
export function isValidUsername(username: string): boolean {
  const forbiddenSubstrings = ["@", "#", ":", "```", "discord"];
  const forbiddenNames = ["everyone", "here"];
  for (const substring of forbiddenSubstrings) {
    if (username.includes(substring)) {
      return false;
    }
  }
  return !forbiddenNames.includes(username);
}
