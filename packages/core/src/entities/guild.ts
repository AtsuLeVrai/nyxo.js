import type { LocaleKey, OAuth2Scope } from "../enums/index.js";
import type { Integer, Iso8601 } from "../formatting/index.js";
import type { BitFieldResolvable, Snowflake } from "../utils/index.js";
import type { ChannelEntity } from "./channel.js";
import type { EmojiEntity } from "./emoji.js";
import type { RoleEntity } from "./role.js";
import type { StickerEntity } from "./sticker.js";
import type { AvatarDecorationDataEntity, UserEntity } from "./user.js";

/**
 * Represents the type of prompt used in guild onboarding.
 *
 * @remarks
 * Defines the available prompt types that can be shown during the onboarding process.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-prompt-types}
 */
export enum GuildOnboardingPromptType {
  /** Multiple choice prompt type */
  MultipleChoice = 0,
  /** Dropdown prompt type */
  Dropdown = 1,
}

/**
 * Represents the onboarding mode configuration for a guild.
 *
 * @remarks
 * Defines how onboarding constraints are evaluated for enabling features.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-onboarding-mode}
 */
export enum GuildOnboardingMode {
  /** Counts only Default Channels towards constraints */
  Default = 0,
  /** Counts Default Channels and Questions towards constraints */
  Advanced = 1,
}

/**
 * Represents an option in a guild onboarding prompt.
 *
 * @remarks
 * Contains information about a single option that users can select during onboarding,
 * including associated channels, roles, and emoji.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-prompt-option-structure}
 */
export interface GuildOnboardingPromptOptionEntity {
  /** Unique identifier of the prompt option */
  id: Snowflake;
  /** IDs of channels linked to this option */
  channel_ids: Snowflake[];
  /** IDs of roles granted by this option */
  role_ids: Snowflake[];
  /** Optional emoji object for the option */
  emoji?: EmojiEntity;
  /** Optional emoji ID for the option */
  emoji_id?: Snowflake;
  /** Optional emoji name for the option */
  emoji_name?: string;
  /** Whether the emoji is animated */
  emoji_animated?: boolean;
  /** Title of the prompt option */
  title: string;
  /** Description of the prompt option */
  description: string | null;
}

/**
 * Represents a prompt in guild onboarding.
 *
 * @remarks
 * Defines a question or prompt shown to users during the guild onboarding process.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-onboarding-prompt-structure}
 */
export interface GuildOnboardingPromptEntity {
  /** Unique identifier of the prompt */
  id: Snowflake;
  /** Type of prompt */
  type: GuildOnboardingPromptType;
  /** Available options for this prompt */
  options: GuildOnboardingPromptOptionEntity[];
  /** Title of the prompt */
  title: string;
  /** Whether users can only select one option */
  single_select: boolean;
  /** Whether the prompt is required to complete onboarding */
  required: boolean;
  /** Whether the prompt is shown in onboarding */
  in_onboarding: boolean;
}

/**
 * Represents the onboarding configuration for a guild.
 *
 * @remarks
 * Contains all settings related to the guild's onboarding process including
 * prompts, default channels, and mode.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-guild-onboarding-structure}
 */
export interface GuildOnboardingEntity {
  /** ID of the guild this onboarding is for */
  guild_id: Snowflake;
  /** Array of onboarding prompts */
  prompts: GuildOnboardingPromptEntity[];
  /** Default channel IDs that new members are added to */
  default_channel_ids: Snowflake[];
  /** Whether guild onboarding is enabled */
  enabled: boolean;
  /** Current onboarding mode */
  mode: GuildOnboardingMode;
}

/**
 * Represents a channel in the guild's welcome screen.
 *
 * @remarks
 * Contains information about a channel displayed in the guild's welcome screen.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#welcome-screen-object-welcome-screen-channel-structure}
 */
export interface WelcomeScreenChannelEntity {
  /** ID of the channel */
  channel_id: Snowflake;
  /** Description shown for the channel */
  description: string;
  /** ID of the emoji if custom */
  emoji_id: Snowflake | null;
  /** Name of the emoji if custom, the unicode character if standard, or null */
  emoji_name: string | null;
}

/**
 * Represents a guild's welcome screen configuration.
 *
 * @remarks
 * Contains settings for the guild's welcome screen, including description
 * and featured channels.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#welcome-screen-object-welcome-screen-structure}
 */
export interface WelcomeScreenEntity {
  /** Server description shown in the welcome screen */
  description: string | null;
  /** Channels shown in the welcome screen */
  welcome_channels: WelcomeScreenChannelEntity[];
}

/**
 * Represents a ban entry in a guild.
 *
 * @remarks
 * Contains information about a banned user and the reason for their ban.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#ban-object-ban-structure}
 */
export interface BanEntity {
  /** Reason for the ban */
  reason: string | null;
  /** User who was banned */
  user: UserEntity;
}

/**
 * Represents an application linked to an integration.
 *
 * @remarks
 * Contains information about the application associated with an integration.
 *
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
 * Represents an integration account.
 *
 * @remarks
 * Contains basic information about an external account linked to a guild integration.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#integration-account-object-integration-account-structure}
 */
export interface IntegrationAccountEntity {
  /** ID of the account */
  id: string;
  /** Name of the account */
  name: string;
}

/**
 * Represents what happens when an integration subscription expires.
 *
 * @remarks
 * Defines the possible behaviors when an integration's subscription expires.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#integration-object-integration-expire-behaviors}
 */
export enum IntegrationExpirationBehavior {
  /** Remove role from member */
  RemoveRole = 0,
  /** Kick the member from the guild */
  Kick = 1,
}

/**
 * Represents a guild integration.
 *
 * @remarks
 * Contains information about an integration (Twitch, YouTube, etc.) with a guild.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#integration-object-integration-structure}
 */
export interface IntegrationEntity {
  /** Integration ID */
  id: Snowflake;
  /** Integration name */
  name: string;
  /** Integration type (twitch, youtube, discord, guild_subscription) */
  type: "twitch" | "youtube" | "discord" | "guild_subscription";
  /** Whether this integration is enabled */
  enabled: boolean;
  /** Whether this integration is syncing */
  syncing?: boolean;
  /** ID that this integration uses for "subscribers" */
  role_id?: Snowflake;
  /** Whether emoticons should be synced for this integration */
  enable_emoticons?: boolean;
  /** The behavior of expiring subscribers */
  expire_behavior?: IntegrationExpirationBehavior;
  /** Grace period (in days) before expiring subscribers */
  expire_grace_period?: Integer;
  /** User for this integration */
  user?: UserEntity;
  /** Integration account information */
  account: IntegrationAccountEntity;
  /** When this integration was last synced */
  synced_at?: Iso8601;
  /** How many subscribers this integration has */
  subscriber_count?: Integer;
  /** Whether this integration has been revoked */
  revoked?: boolean;
  /** The bot/OAuth2 application for discord integrations */
  application?: IntegrationApplicationEntity;
  /** Scopes the application has been authorized for */
  scopes?: OAuth2Scope[];
}

/**
 * Represents special flags that can be applied to guild members.
 *
 * @remarks
 * Defines various states and permissions that can be applied to guild members.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-member-object-guild-member-flags}
 */
export enum GuildMemberFlags {
  /** Member has left and rejoined the guild */
  DidRejoin = 1 << 0,
  /** Member has completed onboarding */
  CompletedOnboarding = 1 << 1,
  /** Member bypasses guild verification requirements */
  BypassesVerification = 1 << 2,
  /** Member has started onboarding */
  StartedOnboarding = 1 << 3,
  /** Member is a guest */
  IsGuest = 1 << 4,
  /** Member has started Server Guide new member actions */
  StartedHomeActions = 1 << 5,
  /** Member has completed Server Guide new member actions */
  CompletedHomeActions = 1 << 6,
  /** Member's username/display name/nickname is blocked by AutoMod */
  AutoModQuarantinedUsername = 1 << 7,
  /** Member has dismissed the DM settings upsell */
  DmSettingsUpsellAcknowledged = 1 << 9,
}

/**
 * Represents a member of a guild.
 *
 * @remarks
 * Contains information about a user's membership in a specific guild,
 * including roles, nickname, and other guild-specific properties.
 *
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
  joined_at: Iso8601;
  /** When the user started boosting the guild */
  premium_since?: Iso8601 | null;
  /** Whether the user is deafened in voice channels */
  deaf: boolean;
  /** Whether the user is muted in voice channels */
  mute: boolean;
  /** Guild member flags represented as a bit set */
  flags: BitFieldResolvable<GuildMemberFlags>;
  /** Whether the user has not yet passed the guild's Membership Screening requirements */
  pending?: boolean;
  /** Total permissions of the member in the channel */
  permissions?: string;
  /** When the user's timeout will expire */
  communication_disabled_until?: Iso8601 | null;
  /** Data for the member's guild avatar decoration */
  avatar_decoration_data?: AvatarDecorationDataEntity | null;
}

/**
 * Represents a guild's widget settings.
 *
 * @remarks
 * Contains configuration for the guild's widget feature.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-widget-settings-object-guild-widget-settings-structure}
 */
export interface GuildWidgetSettingsEntity {
  /** Whether the widget is enabled */
  enabled: boolean;
  /** The widget channel ID */
  channel_id: Snowflake | null;
}

/**
 * Represents a guild's widget data.
 *
 * @remarks
 * Contains information shown in the guild's widget.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-widget-object-guild-widget-structure}
 */
export interface GuildWidgetEntity {
  /** Guild ID */
  id: Snowflake;
  /** Guild name */
  name: string;
  /** Instant invite for the guild's specified widget invite channel */
  instant_invite: string | null;
  /** Array of partial channel objects */
  channels: Partial<ChannelEntity>[];
  /** Array of partial user objects */
  members: Partial<UserEntity>[];
  /** Number of online members */
  presence_count: Integer;
}

/**
 * Represents preview information for a guild.
 *
 * @remarks
 * Contains public information about a guild that is shown before joining.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-preview-object-guild-preview-structure}
 */
export interface GuildPreviewEntity {
  /** Guild ID */
  id: Snowflake;
  /** Guild name */
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
  /** Approximate member count */
  approximate_member_count: Integer;
  /** Approximate online member count */
  approximate_presence_count: Integer;
  /** Guild description */
  description: string | null;
  /** Custom guild stickers */
  stickers: StickerEntity[];
}

/**
 * Represents special features enabled for a guild.
 *
 * @remarks
 * Defines various features and capabilities that can be enabled for a guild.
 * Features may require specific requirements or boost levels to be enabled.
 *
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
  /** Guild can enable welcome screen, Membership Screening, and discovery */
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
  /** Guild can be previewed before joining */
  PreviewEnabled = "PREVIEW_ENABLED",
  /** Guild has disabled alerts for join raids */
  RaidAlertsDisabled = "RAID_ALERTS_DISABLED",
  /** Guild is able to set role icons */
  RoleIcons = "ROLE_ICONS",
  /** Guild has role subscriptions that can be purchased */
  RoleSubscriptionsAvailableForPurchase = "ROLE_SUBSCRIPTIONS_AVAILABLE_FOR_PURCHASE",
  /** Guild has enabled role subscriptions */
  RoleSubscriptionsEnabled = "ROLE_SUBSCRIPTIONS_ENABLED",
  /** Guild has enabled soundboard */
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
 * Represents flags that control system channel behavior.
 *
 * @remarks
 * Defines which system messages are enabled or suppressed in the system channel.
 *
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
 * Represents a guild's premium tier (server boost level).
 *
 * @remarks
 * Defines the different boost levels and their associated perks.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-premium-tier}
 */
export enum PremiumTier {
  /** No Server Boost level */
  None = 0,
  /** Server Boost level 1 */
  Tier1 = 1,
  /** Server Boost level 2 */
  Tier2 = 2,
  /** Server Boost level 3 */
  Tier3 = 3,
}

/**
 * Represents a guild's NSFW level.
 *
 * @remarks
 * Defines the age-restriction level of the guild.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-guild-nsfw-level}
 */
export enum NsfwLevel {
  /** Default NSFW level */
  Default = 0,
  /** Explicit content */
  Explicit = 1,
  /** Safe for work content */
  Safe = 2,
  /** Age-restricted content */
  AgeRestricted = 3,
}

/**
 * Represents a guild's verification level.
 *
 * @remarks
 * Defines requirements for members to participate in the guild.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-verification-level}
 */
export enum VerificationLevel {
  /** Unrestricted */
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
 * Represents a guild's MFA level.
 *
 * @remarks
 * Defines whether members with moderation permissions require 2FA.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-mfa-level}
 */
export enum MfaLevel {
  /** Guild has no MFA/2FA requirement for moderation actions */
  None = 0,
  /** Guild has a 2FA requirement for moderation actions */
  Elevated = 1,
}

/**
 * Represents the explicit content filter level for a guild.
 *
 * @remarks
 * Defines how the guild filters explicit media content.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-explicit-content-filter-level}
 */
export enum ExplicitContentFilterLevel {
  /** Media content will not be scanned */
  Disabled = 0,
  /** Media content from members without roles will be scanned */
  MembersWithoutRoles = 1,
  /** Media content from all members will be scanned */
  AllMembers = 2,
}

/**
 * Represents the default message notification level for a guild.
 *
 * @remarks
 * Defines when members will be notified about messages.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-default-message-notification-level}
 */
export enum DefaultMessageNotificationLevel {
  /** Members will receive notifications for all messages by default */
  AllMessages = 0,
  /** Members will receive notifications only for messages that @mention them by default */
  OnlyMentions = 1,
}

/**
 * Represents a guild.
 *
 * @remarks
 * Contains all information about a Discord guild/server including its
 * properties, features, and settings.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-guild-structure}
 */
export interface GuildEntity {
  /** Guild id */
  id: Snowflake;
  /** Guild name (2-100 characters) */
  name: string;
  /** Icon hash */
  icon: string | null;
  /** Icon hash in template */
  icon_hash?: string | null;
  /** Splash hash */
  splash: string | null;
  /** Discovery splash hash */
  discovery_splash: string | null;
  /** Whether the current user is the owner */
  owner?: boolean;
  /** ID of guild owner */
  owner_id: Snowflake;
  /** Total permissions for the user in the guild (excludes overwrites) */
  permissions?: string;
  /** @deprecated Voice region id for the guild (deprecated) */
  region?: string | null;
  /** ID of AFK channel */
  afk_channel_id: Snowflake | null;
  /** AFK timeout in seconds */
  afk_timeout: Integer;
  /** Whether the server widget is enabled */
  widget_enabled?: boolean;
  /** Channel id for the server widget */
  widget_channel_id?: Snowflake | null;
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
  /** Application id of the guild creator if it is bot-created */
  application_id?: Snowflake;
  /** System channel id */
  system_channel_id: Snowflake | null;
  /** System channel flags */
  system_channel_flags: BitFieldResolvable<SystemChannelFlags>;
  /** Rules channel id */
  rules_channel_id: Snowflake | null;
  /** Maximum presences for the guild (null is always returned, apart from the largest of guilds) */
  max_presences?: Integer | null;
  /** Maximum members for the guild */
  max_members: Integer;
  /** Vanity URL code for the guild */
  vanity_url_code: string | null;
  /** Guild description */
  description: string | null;
  /** Banner hash */
  banner: string | null;
  /** Premium tier (Server Boost level) */
  premium_tier: PremiumTier;
  /** Number of boosts this guild currently has */
  premium_subscription_count?: Integer;
  /** Preferred locale for guild public updates */
  preferred_locale: LocaleKey;
  /** Public updates channel id */
  public_updates_channel_id: Snowflake | null;
  /** Maximum amount of users in a video channel */
  max_video_channel_users?: Integer;
  /** Maximum amount of users in a stage video channel */
  max_stage_video_channel_users?: Integer;
  /** Approximate member count */
  approximate_member_count?: Integer;
  /** Approximate presence count */
  approximate_presence_count?: Integer;
  /** Welcome screen configuration */
  welcome_screen?: WelcomeScreenEntity;
  /** Guild NSFW level */
  nsfw_level: NsfwLevel;
  /** Custom guild stickers */
  stickers?: StickerEntity[];
  /** Whether the guild has the boost progress bar enabled */
  premium_progress_bar_enabled: boolean;
  /** Safety alerts channel id */
  safety_alerts_channel_id: Snowflake | null;
}
