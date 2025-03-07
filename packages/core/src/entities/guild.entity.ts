import { z } from "zod";
import type { Locale, OAuth2Scope } from "../enums/index.js";
import { Snowflake } from "../managers/index.js";
import type {
  GuildStageVoiceChannelEntity,
  GuildVoiceChannelEntity,
} from "./channel.entity.js";
import type { EmojiEntity } from "./emoji.entity.js";
import type { RoleEntity } from "./role.entity.js";
import type { StickerEntity } from "./sticker.entity.js";
import type { AvatarDecorationDataEntity, UserEntity } from "./user.entity.js";

/**
 * Types of prompts that can be used in guild onboarding
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-prompt-types}
 */
export enum GuildOnboardingPromptType {
  /** Multiple choice prompt type */
  MultipleChoice = 0,

  /** Dropdown prompt type */
  Dropdown = 1,
}

/**
 * Modes for guild onboarding which define criteria for enabling onboarding
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-onboarding-mode}
 */
export enum GuildOnboardingMode {
  /** Counts only Default Channels towards constraints */
  Default = 0,

  /** Counts Default Channels and Questions towards constraints */
  Advanced = 1,
}

/**
 * Behaviors for handling expired integrations
 * @see {@link https://discord.com/developers/docs/resources/guild#integration-object-integration-expire-behaviors}
 */
export enum IntegrationExpirationBehavior {
  /** Remove role from member when integration expires */
  RemoveRole = 0,

  /** Kick member when integration expires */
  Kick = 1,
}

/**
 * Flags for guild members
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-member-object-guild-member-flags}
 */
export enum GuildMemberFlags {
  /** Member has left and rejoined the guild */
  DidRejoin = 1 << 0,

  /** Member has completed onboarding */
  CompletedOnboarding = 1 << 1,

  /** Member is exempt from guild verification requirements */
  BypassesVerification = 1 << 2,

  /** Member has started onboarding */
  StartedOnboarding = 1 << 3,

  /** Member is a guest and can only access the voice channel they were invited to */
  IsGuest = 1 << 4,

  /** Member has started Server Guide new member actions */
  StartedHomeActions = 1 << 5,

  /** Member has completed Server Guide new member actions */
  CompletedHomeActions = 1 << 6,

  /** Member's username, display name, or nickname is blocked by AutoMod */
  AutoModQuarantinedUsername = 1 << 7,

  /** Member has dismissed the DM settings upsell */
  DmSettingsUpsellAcknowledged = 1 << 9,
}

/**
 * Features that can be enabled on guilds
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-guild-features}
 */
export enum GuildFeature {
  /** Guild has access to set an animated guild banner image */
  AnimatedBanner = "ANIMATED_BANNER",

  /** Guild has access to set an animated guild icon */
  AnimatedIcon = "ANIMATED_ICON",

  /** Guild is using the old permissions configuration behavior */
  ApplicationCommandPermissionsV2 = "APPLICATION_COMMAND_PERMISSIONS_V2",

  /** Guild has set up auto moderation rules */
  AutoModeration = "AUTO_MODERATION",

  /** Guild has access to set a guild banner image */
  Banner = "BANNER",

  /** Guild can enable welcome screen, Membership Screening, stage channels and discovery, and receives community updates */
  Community = "COMMUNITY",

  /** Guild has enabled monetization */
  CreatorMonetizableProvisional = "CREATOR_MONETIZABLE_PROVISIONAL",

  /** Guild has enabled the role subscription promo page */
  CreatorStorePage = "CREATOR_STORE_PAGE",

  /** Guild has been set as a support server on the App Directory */
  DeveloperSupportServer = "DEVELOPER_SUPPORT_SERVER",

  /** Guild is able to be discovered in the directory */
  Discoverable = "DISCOVERABLE",

  /** Guild is able to be featured in the directory */
  Featurable = "FEATURABLE",

  /** Guild has paused invites, preventing new users from joining */
  InvitesDisabled = "INVITES_DISABLED",

  /** Guild has access to set an invite splash background */
  InviteSplash = "INVITE_SPLASH",

  /** Guild has enabled Membership Screening */
  MemberVerificationGateEnabled = "MEMBER_VERIFICATION_GATE_ENABLED",

  /** Guild has increased custom soundboard sound slots */
  MoreSoundboard = "MORE_SOUNDBOARD",

  /** Guild has increased custom sticker slots */
  MoreStickers = "MORE_STICKERS",

  /** Guild has access to create announcement channels */
  News = "NEWS",

  /** Guild is partnered */
  Partnered = "PARTNERED",

  /** Guild can be previewed before joining via Membership Screening or the directory */
  PreviewEnabled = "PREVIEW_ENABLED",

  /** Guild has disabled alerts for join raids in the configured safety alerts channel */
  RaidAlertsDisabled = "RAID_ALERTS_DISABLED",

  /** Guild is able to set role icons */
  RoleIcons = "ROLE_ICONS",

  /** Guild has role subscriptions that can be purchased */
  RoleSubscriptionsAvailableForPurchase = "ROLE_SUBSCRIPTIONS_AVAILABLE_FOR_PURCHASE",

  /** Guild has enabled role subscriptions */
  RoleSubscriptionsEnabled = "ROLE_SUBSCRIPTIONS_ENABLED",

  /** Guild has created soundboard sounds */
  Soundboard = "SOUNDBOARD",

  /** Guild has enabled ticketed events */
  TicketedEventsEnabled = "TICKETED_EVENTS_ENABLED",

  /** Guild has access to set a vanity URL */
  VanityUrl = "VANITY_URL",

  /** Guild is verified */
  Verified = "VERIFIED",

  /** Guild has access to set 384kbps bitrate in voice */
  VipRegions = "VIP_REGIONS",

  /** Guild has enabled the welcome screen */
  WelcomeScreenEnabled = "WELCOME_SCREEN_ENABLED",
}

/**
 * Flags for controlling the system channel behavior
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-system-channel-flags}
 */
export enum SystemChannelFlags {
  /** Suppress member join notifications */
  SuppressJoinNotifications = 1 << 0,

  /** Suppress server boost notifications */
  SuppressPremiumSubscriptions = 1 << 1,

  /** Suppress server setup tips */
  SuppressGuildReminderNotifications = 1 << 2,

  /** Hide member join sticker reply buttons */
  SuppressJoinNotificationReplies = 1 << 3,

  /** Suppress role subscription purchase and renewal notifications */
  SuppressRoleSubscriptionPurchaseNotifications = 1 << 4,

  /** Hide role subscription sticker reply buttons */
  SuppressRoleSubscriptionPurchaseNotificationReplies = 1 << 5,
}

/**
 * Guild premium tier (Server Boost level)
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-premium-tier}
 */
export enum PremiumTier {
  /** Guild has not unlocked any Server Boost perks */
  None = 0,

  /** Guild has unlocked Server Boost level 1 perks */
  Tier1 = 1,

  /** Guild has unlocked Server Boost level 2 perks */
  Tier2 = 2,

  /** Guild has unlocked Server Boost level 3 perks */
  Tier3 = 3,
}

/**
 * NSFW level of a guild
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-guild-nsfw-level}
 */
export enum NsfwLevel {
  /** Default NSFW level */
  Default = 0,

  /** Explicit NSFW level */
  Explicit = 1,

  /** Safe NSFW level */
  Safe = 2,

  /** Age restricted NSFW level */
  AgeRestricted = 3,
}

/**
 * Verification level required for a guild
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-verification-level}
 */
export enum VerificationLevel {
  /** Unrestricted verification level */
  None = 0,

  /** Must have verified email on account */
  Low = 1,

  /** Must be registered on Discord for longer than 5 minutes */
  Medium = 2,

  /** Must be a member of the server for longer than 10 minutes */
  High = 3,

  /** Must have a verified phone number */
  VeryHigh = 4,
}

/**
 * MFA level required for administrative actions in a guild
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-mfa-level}
 */
export enum MfaLevel {
  /** Guild has no MFA/2FA requirement for moderation actions */
  None = 0,

  /** Guild has a 2FA requirement for moderation actions */
  Elevated = 1,
}

/**
 * Explicit content filter level for a guild
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-explicit-content-filter-level}
 */
export enum ExplicitContentFilterLevel {
  /** Media content will not be scanned */
  Disabled = 0,

  /** Media content sent by members without roles will be scanned */
  MembersWithoutRoles = 1,

  /** Media content sent by all members will be scanned */
  AllMembers = 2,
}

/**
 * Default message notification level for a guild
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-default-message-notification-level}
 */
export enum DefaultMessageNotificationLevel {
  /** Members will receive notifications for all messages by default */
  AllMessages = 0,

  /** Members will receive notifications only for messages that @mention them by default */
  OnlyMentions = 1,
}

/**
 * Option structure for onboarding prompts
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-prompt-option-structure}
 */
export interface GuildOnboardingPromptOptionEntity {
  /** ID of the prompt option */
  id: Snowflake;

  /** Channel IDs that will be pre-selected for users who select this option */
  channel_ids: Snowflake[];

  /** Role IDs that will be assigned to users who select this option */
  role_ids: Snowflake[];

  /** Emoji object for the option */
  emoji?: EmojiEntity;

  /** Emoji ID of the option (used when creating/updating) */
  emoji_id?: Snowflake;

  /** Emoji name of the option (used when creating/updating) */
  emoji_name?: string;

  /** Whether the emoji is animated (used when creating/updating) */
  emoji_animated?: boolean;

  /** Title of the option */
  title: string;

  /** Description of the option */
  description: string | null;
}

/**
 * Structure for onboarding prompts
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-onboarding-prompt-structure}
 */
export interface GuildOnboardingPromptEntity {
  /** ID of the prompt */
  id: Snowflake;

  /** Type of prompt */
  type: GuildOnboardingPromptType;

  /** Options available within the prompt */
  options: GuildOnboardingPromptOptionEntity[];

  /** Title of the prompt */
  title: string;

  /** Whether users can only select one option for the prompt */
  single_select: boolean;

  /** Whether the prompt is required before a user completes onboarding */
  required: boolean;

  /** Whether the prompt is present in the onboarding flow */
  in_onboarding: boolean;
}

/**
 * Structure for guild onboarding
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-guild-onboarding-structure}
 */
export interface GuildOnboardingEntity {
  /** ID of the guild this onboarding is part of */
  guild_id: Snowflake;

  /** Prompts shown during onboarding and in customize community */
  prompts: GuildOnboardingPromptEntity[];

  /** Channel IDs that members get opted into automatically */
  default_channel_ids: Snowflake[];

  /** Whether onboarding is enabled in the guild */
  enabled: boolean;

  /** Current mode of onboarding */
  mode: GuildOnboardingMode;
}

/**
 * Structure for welcome screen channels
 * @see {@link https://discord.com/developers/docs/resources/guild#welcome-screen-object-welcome-screen-channel-structure}
 */
export const WelcomeScreenChannelEntity = z.object({
  /** ID of the channel */
  channel_id: Snowflake,

  /** Description of the channel shown in the welcome screen */
  description: z.string(),

  /** ID of the emoji if custom, null otherwise */
  emoji_id: Snowflake.nullable(),

  /** Name of the emoji if standard, the unicode character if standard, or null if no emoji is set */
  emoji_name: z.string().nullable(),
});

export type WelcomeScreenChannelEntity = z.infer<
  typeof WelcomeScreenChannelEntity
>;

/**
 * Structure for guild welcome screen
 * @see {@link https://discord.com/developers/docs/resources/guild#welcome-screen-object-welcome-screen-structure}
 */
export interface WelcomeScreenEntity {
  /** Guild description shown in the welcome screen */
  description: string | null;

  /** Channels shown in the welcome screen, up to 5 */
  welcome_channels: WelcomeScreenChannelEntity[];
}

/**
 * Structure for guild bans
 * @see {@link https://discord.com/developers/docs/resources/guild#ban-object-ban-structure}
 */
export interface BanEntity {
  /** Reason for the ban */
  reason: string | null;

  /** Banned user */
  user: UserEntity;
}

/**
 * Structure for integration applications
 * @see {@link https://discord.com/developers/docs/resources/guild#integration-application-object-integration-application-structure}
 */
export interface IntegrationApplicationEntity {
  /** ID of the app */
  id: Snowflake;

  /** Name of the app */
  name: string;

  /** Icon hash of the app */
  icon: string | null;

  /** Description of the app */
  description: string;

  /** Bot associated with this application */
  bot?: UserEntity;
}

/**
 * Structure for integration accounts
 * @see {@link https://discord.com/developers/docs/resources/guild#integration-account-object-integration-account-structure}
 */
export interface IntegrationAccountEntity {
  /** ID of the account */
  id: string;

  /** Name of the account */
  name: string;
}

/**
 * Structure for guild integrations
 * @see {@link https://discord.com/developers/docs/resources/guild#integration-object-integration-structure}
 */
export interface IntegrationEntity {
  /** Integration ID */
  id: Snowflake;

  /** Integration name */
  name: string;

  /** Integration type (twitch, youtube, discord, guild_subscription) */
  type: "twitch" | "youtube" | "discord" | "guild_subscription";

  /** Is this integration enabled */
  enabled: boolean;

  /** Is this integration syncing */
  syncing?: boolean;

  /** ID that this integration uses for "subscribers" */
  role_id?: Snowflake;

  /** Whether emoticons should be synced for this integration (twitch only currently) */
  enable_emoticons?: boolean;

  /** The behavior of expiring subscribers */
  expire_behavior?: IntegrationExpirationBehavior;

  /** The grace period (in days) before expiring subscribers */
  expire_grace_period?: number;

  /** User for this integration */
  user?: UserEntity;

  /** Integration account information */
  account: IntegrationAccountEntity;

  /** When this integration was last synced */
  synced_at?: string;

  /** How many subscribers this integration has */
  subscriber_count?: number;

  /** Has this integration been revoked */
  revoked?: boolean;

  /** The bot/OAuth2 application for discord integrations */
  application?: IntegrationApplicationEntity;

  /** The scopes the application has been authorized for */
  scopes?: OAuth2Scope[];
}

/**
 * Structure for guild members
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-member-object-guild-member-structure}
 */
export interface GuildMemberEntity {
  /** The user this guild member represents */
  user: UserEntity;

  /** This user's guild nickname */
  nick?: string | null;

  /** The member's guild avatar hash */
  avatar?: string | null;

  /** The member's guild banner hash */
  banner?: string | null;

  /** Array of role IDs */
  roles: Snowflake[];

  /** When the user joined the guild */
  joined_at: string;

  /** When the user started boosting the guild */
  premium_since?: string | null;

  /** Whether the user is deafened in voice channels */
  deaf: boolean;

  /** Whether the user is muted in voice channels */
  mute: boolean;

  /** Guild member flags */
  flags: GuildMemberFlags;

  /** Whether the user has not yet passed the guild's Membership Screening requirements */
  pending?: boolean;

  /** Total permissions of the member in the channel, including overwrites */
  permissions?: string;

  /** When the user's timeout will expire and the user will be able to communicate in the guild again */
  communication_disabled_until?: string | null;

  /** Data for the member's guild avatar decoration */
  avatar_decoration_data?: AvatarDecorationDataEntity | null;
}

/**
 * Structure for guild widget settings
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-widget-settings-object-guild-widget-settings-structure}
 */
export interface GuildWidgetSettingsEntity {
  /** Whether the widget is enabled */
  enabled: boolean;

  /** The widget channel ID */
  channel_id: Snowflake | null;
}

/**
 * Structure for guild widgets
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-widget-object-guild-widget-structure}
 */
export interface GuildWidgetEntity {
  /** Guild ID */
  id: Snowflake;

  /** Guild name */
  name: string;

  /** Instant invite for the guilds specified widget invite channel */
  instant_invite: string | null;

  /** Voice and stage channels which are accessible by @everyone */
  channels: Partial<GuildVoiceChannelEntity | GuildStageVoiceChannelEntity>[];

  /** Special widget user objects that includes users presence (Limit 100) */
  members: UserEntity[];

  /** Number of online members in this guild */
  presence_count: number;
}

/**
 * Structure for guild previews
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-preview-object-guild-preview-structure}
 */
export interface GuildPreviewEntity {
  /** Guild ID */
  id: Snowflake;

  /** Guild name (2-100 characters) */
  name: string;

  /** Icon hash */
  icon: string | null;

  /** Splash hash */
  splash: string | null;

  /** Discovery splash hash */
  discovery_splash: string | null;

  /** Custom guild emojis */
  emojis: EmojiEntity[];

  /** Enabled guild features */
  features: GuildFeature[];

  /** Approximate number of members in this guild */
  approximate_member_count: number;

  /** Approximate number of online members in this guild */
  approximate_presence_count: number;

  /** The description of the guild */
  description: string | null;

  /** Custom guild stickers */
  stickers: StickerEntity[];
}

/**
 * Structure for unavailable guilds
 * @see {@link https://discord.com/developers/docs/resources/guild#unavailable-guild-object}
 */
export interface UnavailableGuildEntity {
  /** Guild ID */
  id: Snowflake;

  /** Indicates if the guild is unavailable due to an outage */
  unavailable: true;
}

/**
 * Structure for incidents data
 * @see {@link https://discord.com/developers/docs/resources/guild#incidents-data-object}
 */
export interface IncidentsDataEntity {
  /** When invites get enabled again */
  invites_disabled_until: string | null;

  /** When direct messages get enabled again */
  dms_disabled_until: string | null;

  /** When the dm spam was detected */
  dm_spam_detected_at?: string | null;

  /** When the raid was detected */
  raid_detected_at?: string | null;
}

/**
 * Structure for guilds
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-guild-structure}
 */
export interface GuildEntity {
  /** Guild ID */
  id: Snowflake;

  /** Guild name (2-100 characters, excluding trailing and leading whitespace) */
  name: string;

  /** Icon hash */
  icon: string | null;

  /** Icon hash, returned when in the template object */
  icon_hash?: string | null;

  /** Splash hash */
  splash: string | null;

  /** Discovery splash hash */
  discovery_splash: string | null;

  /** True if the user is the owner of the guild */
  owner?: boolean;

  /** ID of owner */
  owner_id: Snowflake;

  /** Total permissions for the user in the guild (excludes overwrites) */
  permissions?: string;

  /** Voice region id for the guild (deprecated) */
  region?: string | null;

  /** ID of AFK channel */
  afk_channel_id: Snowflake | null;

  /** AFK timeout in seconds */
  afk_timeout: number;

  /** True if the server widget is enabled */
  widget_enabled?: boolean;

  /** The channel id that the widget will generate an invite to, or null if set to no invite */
  widget_channel_id?: string | null;

  /** Verification level required for the guild */
  verification_level: VerificationLevel;

  /** Default message notifications level */
  default_message_notifications: DefaultMessageNotificationLevel;

  /** Explicit content filter level */
  explicit_content_filter: ExplicitContentFilterLevel;

  /** Roles in the guild */
  roles: RoleEntity[];

  /** Custom guild emojis */
  emojis: EmojiEntity[];

  /** Enabled guild features */
  features: GuildFeature[];

  /** Required MFA level for the guild */
  mfa_level: MfaLevel;

  /** Application ID of the guild creator if it is bot-created */
  application_id: Snowflake | null;

  /** The ID of the channel where guild notices such as welcome messages and boost events are posted */
  system_channel_id: Snowflake | null;

  /** System channel flags */
  system_channel_flags: SystemChannelFlags;

  /** The ID of the channel where Community guilds can display rules and/or guidelines */
  rules_channel_id: Snowflake | null;

  /** The maximum number of presences for the guild (null is always returned, apart from the largest of guilds) */
  max_presences?: number | null;

  /** The maximum number of members for the guild */
  max_members: number;

  /** The vanity url code for the guild */
  vanity_url_code: string | null;

  /** The description of a guild */
  description: string | null;

  /** Banner hash */
  banner: string | null;

  /** Premium tier (Server Boost level) */
  premium_tier: PremiumTier;

  /** The number of boosts this guild currently has */
  premium_subscription_count?: number;

  /** The preferred locale of a Community guild; used in server discovery and notices from Discord, and sent in interactions */
  preferred_locale: Locale;

  /** The ID of the channel where admins and moderators of Community guilds receive notices from Discord */
  public_updates_channel_id: Snowflake | null;

  /** The maximum amount of users in a video channel */
  max_video_channel_users?: number;

  /** The maximum amount of users in a stage video channel */
  max_stage_video_channel_users?: number;

  /** Approximate number of members in this guild, returned from the GET /guilds/<id> endpoint when with_counts is true */
  approximate_member_count?: number;

  /** Approximate number of non-offline members in this guild, returned from the GET /guilds/<id> endpoint when with_counts is true */
  approximate_presence_count?: number;

  /** The welcome screen of a Community guild, shown to new members */
  welcome_screen?: WelcomeScreenEntity;

  /** Guild NSFW level */
  nsfw_level: NsfwLevel;

  /** Custom guild stickers */
  stickers?: StickerEntity[];

  /** Whether the guild has the boost progress bar enabled */
  premium_progress_bar_enabled: boolean;

  /** The ID of the channel where admins and moderators of Community guilds receive safety alerts from Discord */
  safety_alerts_channel_id: Snowflake | null;

  /** The incidents data for this guild */
  incidents_data?: IncidentsDataEntity | null;
}
