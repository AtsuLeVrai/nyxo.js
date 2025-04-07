import type { Locale, OAuth2Scope } from "../enums/index.js";
import type { Snowflake } from "../managers/index.js";
import type {
  GuildStageVoiceChannelEntity,
  GuildVoiceChannelEntity,
} from "./channel.entity.js";
import type { EmojiEntity } from "./emoji.entity.js";
import type { RoleEntity } from "./role.entity.js";
import type { StickerEntity } from "./sticker.entity.js";
import type { AvatarDecorationDataEntity, UserEntity } from "./user.entity.js";

/**
 * Types of prompts that can be used in guild onboarding.
 * These determine how users interact with onboarding options.
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-prompt-types}
 */
export enum GuildOnboardingPromptType {
  /**
   * Multiple choice prompt type allowing users to select one or more options
   * from a set of choices presented during onboarding.
   */
  MultipleChoice = 0,

  /**
   * Dropdown prompt type allowing users to select options from a dropdown menu
   * during the onboarding process.
   */
  Dropdown = 1,
}

/**
 * Modes for guild onboarding which define criteria for enabling onboarding.
 * These determine what counts toward the minimum requirements for enabling onboarding.
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-onboarding-mode}
 */
export enum GuildOnboardingMode {
  /**
   * Default mode - Counts only Default Channels towards constraints.
   * Requires at least 7 default channels with 5 allowing @everyone to send messages.
   */
  Default = 0,

  /**
   * Advanced mode - Counts both Default Channels and Questions towards constraints.
   * Allows more flexibility in meeting the minimum requirements.
   */
  Advanced = 1,
}

/**
 * Behaviors for handling expired integrations.
 * Defines what happens to members when their integration subscription expires.
 * @see {@link https://discord.com/developers/docs/resources/guild#integration-object-integration-expire-behaviors}
 */
export enum IntegrationExpirationBehavior {
  /**
   * Remove role from member when integration expires.
   * The member will lose access to any permissions granted by the role.
   */
  RemoveRole = 0,

  /**
   * Kick member from the guild when integration expires.
   * The member will be removed from the server entirely.
   */
  Kick = 1,
}

/**
 * Flags for guild members represented as a bit set.
 * These flags indicate various states and permissions for guild members.
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-member-object-guild-member-flags}
 */
export enum GuildMemberFlags {
  /**
   * Member has left and rejoined the guild.
   * @value 1 << 0 (1)
   */
  DidRejoin = 1 << 0,

  /**
   * Member has completed onboarding.
   * Member has finished the server's onboarding process.
   * @value 1 << 1 (2)
   */
  CompletedOnboarding = 1 << 1,

  /**
   * Member is exempt from guild verification requirements.
   * Allows a member who does not meet verification requirements to participate in a server.
   * @value 1 << 2 (4)
   */
  BypassesVerification = 1 << 2,

  /**
   * Member has started onboarding.
   * Member has begun but not completed the server's onboarding process.
   * @value 1 << 3 (8)
   */
  StartedOnboarding = 1 << 3,

  /**
   * Member is a guest and can only access the voice channel they were invited to.
   * Restricts member access to a specific voice channel only.
   * @value 1 << 4 (16)
   */
  IsGuest = 1 << 4,

  /**
   * Member has started Server Guide new member actions.
   * Has begun interacting with the server's welcome/guide features.
   * @value 1 << 5 (32)
   */
  StartedHomeActions = 1 << 5,

  /**
   * Member has completed Server Guide new member actions.
   * Has finished all welcome/guide activities for new members.
   * @value 1 << 6 (64)
   */
  CompletedHomeActions = 1 << 6,

  /**
   * Member's username, display name, or nickname is blocked by AutoMod.
   * The member's name violates server AutoMod rules.
   * @value 1 << 7 (128)
   */
  AutoModQuarantinedUsername = 1 << 7,

  /**
   * Member has dismissed the DM settings upsell.
   * User has acknowledged the prompt for DM notification settings.
   * @value 1 << 9 (512)
   */
  DmSettingsUpsellAcknowledged = 1 << 9,
}

/**
 * Features that can be enabled on guilds.
 * These special capabilities can be unlocked for servers based on various criteria.
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-guild-features}
 */
export enum GuildFeature {
  /**
   * Guild has access to set an animated guild banner image.
   * Allows the server to use animated images for their banner.
   */
  AnimatedBanner = "ANIMATED_BANNER",

  /**
   * Guild has access to set an animated guild icon.
   * Allows the server to use animated images for their server icon.
   */
  AnimatedIcon = "ANIMATED_ICON",

  /**
   * Guild is using the old permissions configuration behavior.
   * Using legacy application command permissions system.
   */
  ApplicationCommandPermissionsV2 = "APPLICATION_COMMAND_PERMISSIONS_V2",

  /**
   * Guild has set up auto moderation rules.
   * Server has configured automatic content filtering and moderation.
   */
  AutoModeration = "AUTO_MODERATION",

  /**
   * Guild has access to set a guild banner image.
   * Allows the server to set a banner image at the top of server channels list.
   */
  Banner = "BANNER",

  /**
   * Guild can enable welcome screen, Membership Screening, stage channels and discovery,
   * and receives community updates.
   * Indicates a server with Community features enabled.
   */
  Community = "COMMUNITY",

  /**
   * Guild has enabled monetization.
   * Server has access to monetization features for creators.
   */
  CreatorMonetizableProvisional = "CREATOR_MONETIZABLE_PROVISIONAL",

  /**
   * Guild has enabled the role subscription promo page.
   * Server can offer premium role subscriptions to members.
   */
  CreatorStorePage = "CREATOR_STORE_PAGE",

  /**
   * Guild has been set as a support server on the App Directory.
   * Official support server for a Discord application.
   */
  DeveloperSupportServer = "DEVELOPER_SUPPORT_SERVER",

  /**
   * Guild is able to be discovered in the directory.
   * Server can be found in Discord's server discovery.
   */
  Discoverable = "DISCOVERABLE",

  /**
   * Guild is able to be featured in the directory.
   * Server can be highlighted in Discord's server discovery.
   */
  Featurable = "FEATURABLE",

  /**
   * Guild has paused invites, preventing new users from joining.
   * No new members can join via invites while this is active.
   */
  InvitesDisabled = "INVITES_DISABLED",

  /**
   * Guild has access to set an invite splash background.
   * Server can set a custom background for the invite page.
   */
  InviteSplash = "INVITE_SPLASH",

  /**
   * Guild has enabled Membership Screening.
   * Server requires new members to complete a screening process before participating.
   */
  MemberVerificationGateEnabled = "MEMBER_VERIFICATION_GATE_ENABLED",

  /**
   * Guild has increased custom soundboard sound slots.
   * Server has access to more soundboard sounds than standard servers.
   */
  MoreSoundboard = "MORE_SOUNDBOARD",

  /**
   * Guild has increased custom sticker slots.
   * Server has access to more custom stickers than standard servers.
   */
  MoreStickers = "MORE_STICKERS",

  /**
   * Guild has access to create announcement channels.
   * Server can have announcement channels that allow publishing messages to following channels.
   */
  News = "NEWS",

  /**
   * Guild is partnered.
   * Server has been officially partnered with Discord.
   */
  Partnered = "PARTNERED",

  /**
   * Guild can be previewed before joining via Membership Screening or the directory.
   * Allows potential members to see the server before joining.
   */
  PreviewEnabled = "PREVIEW_ENABLED",

  /**
   * Guild has disabled alerts for join raids in the configured safety alerts channel.
   * Server will not send notifications when potential raid activity is detected.
   */
  RaidAlertsDisabled = "RAID_ALERTS_DISABLED",

  /**
   * Guild is able to set role icons.
   * Server can assign custom icons to roles.
   */
  RoleIcons = "ROLE_ICONS",

  /**
   * Guild has role subscriptions that can be purchased.
   * Members can purchase premium roles in this server.
   */
  RoleSubscriptionsAvailableForPurchase = "ROLE_SUBSCRIPTIONS_AVAILABLE_FOR_PURCHASE",

  /**
   * Guild has enabled role subscriptions.
   * Server has enabled the premium role subscription feature.
   */
  RoleSubscriptionsEnabled = "ROLE_SUBSCRIPTIONS_ENABLED",

  /**
   * Guild has created soundboard sounds.
   * Server has custom sound effects for the soundboard feature.
   */
  Soundboard = "SOUNDBOARD",

  /**
   * Guild has enabled ticketed events.
   * Server can host events that require tickets for entry.
   */
  TicketedEventsEnabled = "TICKETED_EVENTS_ENABLED",

  /**
   * Guild has access to set a vanity URL.
   * Server can create a custom discord.gg invite link.
   */
  VanityUrl = "VANITY_URL",

  /**
   * Guild is verified.
   * Server has been officially verified by Discord.
   */
  Verified = "VERIFIED",

  /**
   * Guild has access to set 384kbps bitrate in voice.
   * Server has access to higher audio quality in voice channels.
   */
  VipRegions = "VIP_REGIONS",

  /**
   * Guild has enabled the welcome screen.
   * Server displays a customizable welcome screen for new members.
   */
  WelcomeScreenEnabled = "WELCOME_SCREEN_ENABLED",
}

/**
 * Flags for controlling the system channel behavior.
 * These determine what types of system messages are shown in the designated system channel.
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-system-channel-flags}
 */
export enum SystemChannelFlags {
  /**
   * Suppress member join notifications.
   * Prevents "X joined the server" messages.
   * @value 1 << 0 (1)
   */
  SuppressJoinNotifications = 1 << 0,

  /**
   * Suppress server boost notifications.
   * Prevents server boost messages from appearing.
   * @value 1 << 1 (2)
   */
  SuppressPremiumSubscriptions = 1 << 1,

  /**
   * Suppress server setup tips.
   * Prevents Discord's server setup tip messages.
   * @value 1 << 2 (4)
   */
  SuppressGuildReminderNotifications = 1 << 2,

  /**
   * Hide member join sticker reply buttons.
   * Removes the option to reply with stickers to join messages.
   * @value 1 << 3 (8)
   */
  SuppressJoinNotificationReplies = 1 << 3,

  /**
   * Suppress role subscription purchase and renewal notifications.
   * Prevents messages about premium role subscriptions.
   * @value 1 << 4 (16)
   */
  SuppressRoleSubscriptionPurchaseNotifications = 1 << 4,

  /**
   * Hide role subscription sticker reply buttons.
   * Removes the option to reply with stickers to role subscription messages.
   * @value 1 << 5 (32)
   */
  SuppressRoleSubscriptionPurchaseNotificationReplies = 1 << 5,
}

/**
 * Guild premium tier (Server Boost level).
 * Represents the boost level a server has achieved and the perks available.
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-premium-tier}
 */
export enum PremiumTier {
  /**
   * Guild has not unlocked any Server Boost perks.
   * No server boost benefits available.
   */
  None = 0,

  /**
   * Guild has unlocked Server Boost level 1 perks.
   * Includes perks like 128 Kbps audio, custom server emoji slots, and more.
   */
  Tier1 = 1,

  /**
   * Guild has unlocked Server Boost level 2 perks.
   * Includes level 1 perks plus 256 Kbps audio, server banner, and more.
   */
  Tier2 = 2,

  /**
   * Guild has unlocked Server Boost level 3 perks.
   * Includes level 2 perks plus 384 Kbps audio, vanity URL, and more.
   */
  Tier3 = 3,
}

/**
 * NSFW level of a guild.
 * Determines the age restriction and content filtering level of a server.
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-guild-nsfw-level}
 */
export enum NsfwLevel {
  /**
   * Default NSFW level.
   * Standard content filtering settings.
   */
  Default = 0,

  /**
   * Explicit NSFW level.
   * Server contains explicit content and is marked as such.
   */
  Explicit = 1,

  /**
   * Safe NSFW level.
   * Server is designated as safe for all audiences.
   */
  Safe = 2,

  /**
   * Age restricted NSFW level.
   * Server content is age-gated and requires age verification.
   */
  AgeRestricted = 3,
}

/**
 * Verification level required for a guild.
 * Determines the requirements members must meet before they can send messages.
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-verification-level}
 */
export enum VerificationLevel {
  /**
   * Unrestricted verification level.
   * No verification requirements for members.
   */
  None = 0,

  /**
   * Must have verified email on account.
   * Basic verification requiring email verification.
   */
  Low = 1,

  /**
   * Must be registered on Discord for longer than 5 minutes.
   * Requires account to be at least 5 minutes old.
   */
  Medium = 2,

  /**
   * Must be a member of the server for longer than 10 minutes.
   * Requires 10 minutes of server membership before sending messages.
   */
  High = 3,

  /**
   * Must have a verified phone number.
   * Highest verification requiring phone verification.
   */
  VeryHigh = 4,
}

/**
 * MFA level required for administrative actions in a guild.
 * Determines whether two-factor authentication is required for moderation actions.
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-mfa-level}
 */
export enum MfaLevel {
  /**
   * Guild has no MFA/2FA requirement for moderation actions.
   * Moderators can perform actions without 2FA.
   */
  None = 0,

  /**
   * Guild has a 2FA requirement for moderation actions.
   * Moderators must have 2FA enabled to perform sensitive actions.
   */
  Elevated = 1,
}

/**
 * Explicit content filter level for a guild.
 * Controls whether Discord scans and filters media content in messages.
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-explicit-content-filter-level}
 */
export enum ExplicitContentFilterLevel {
  /**
   * Media content will not be scanned.
   * No automatic filtering of content.
   */
  Disabled = 0,

  /**
   * Media content sent by members without roles will be scanned.
   * Filters content only for members without roles.
   */
  MembersWithoutRoles = 1,

  /**
   * Media content sent by all members will be scanned.
   * Filters content for all members regardless of roles.
   */
  AllMembers = 2,
}

/**
 * Default message notification level for a guild.
 * Controls which messages trigger notifications by default for members.
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-default-message-notification-level}
 */
export enum DefaultMessageNotificationLevel {
  /**
   * Members will receive notifications for all messages by default.
   * All messages trigger notifications unless individually muted.
   */
  AllMessages = 0,

  /**
   * Members will receive notifications only for messages that @mention them by default.
   * Only @mentions trigger notifications unless settings are changed.
   */
  OnlyMentions = 1,
}

/**
 * Guild Onboarding Prompt Option structure.
 * Represents an individual option that users can select during the onboarding process.
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-prompt-option-structure}
 */
export interface GuildOnboardingPromptOptionEntity {
  /**
   * ID of the prompt option.
   * Unique identifier for this specific onboarding option.
   */
  id: Snowflake;

  /**
   * Channel IDs that will be pre-selected for users who select this option.
   * The user will automatically be opted into these channels.
   */
  channel_ids: Snowflake[];

  /**
   * Role IDs that will be assigned to users who select this option.
   * The user will automatically receive these roles.
   */
  role_ids: Snowflake[];

  /**
   * Emoji object for the option.
   * The emoji displayed alongside this option in the UI.
   */
  emoji?: EmojiEntity;

  /**
   * Emoji ID of the option (used when creating/updating).
   * ID of a custom emoji to use for this option.
   */
  emoji_id?: Snowflake;

  /**
   * Emoji name of the option (used when creating/updating).
   * Name of the emoji to use for this option.
   */
  emoji_name?: string;

  /**
   * Whether the emoji is animated (used when creating/updating).
   * Indicates if the custom emoji is animated.
   */
  emoji_animated?: boolean;

  /**
   * Title of the option.
   * The display name shown to users in the onboarding UI.
   */
  title: string;

  /**
   * Description of the option.
   * Additional details shown to users about this option.
   */
  description: string | null;
}

/**
 * Guild Onboarding Prompt structure.
 * Represents a question or prompt shown to users during the onboarding process.
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-onboarding-prompt-structure}
 */
export interface GuildOnboardingPromptEntity {
  /**
   * ID of the prompt.
   * Unique identifier for this onboarding question.
   */
  id: Snowflake;

  /**
   * Type of prompt.
   * Determines how users can interact with the options (multiple choice, dropdown, etc.).
   */
  type: GuildOnboardingPromptType;

  /**
   * Options available within the prompt.
   * The choices that users can select for this prompt.
   */
  options: GuildOnboardingPromptOptionEntity[];

  /**
   * Title of the prompt.
   * The question or heading displayed to users.
   */
  title: string;

  /**
   * Whether users can only select one option for the prompt.
   * If true, users can select just one option; if false, multiple selections are allowed.
   */
  single_select: boolean;

  /**
   * Whether the prompt is required before a user completes the onboarding flow.
   * If true, users must answer this prompt to complete onboarding.
   */
  required: boolean;

  /**
   * Whether the prompt is present in the onboarding flow.
   * If false, the prompt will only appear in the Channels & Roles tab.
   */
  in_onboarding: boolean;
}

/**
 * Guild Onboarding structure.
 * Contains all configuration for a guild's onboarding process.
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-guild-onboarding-structure}
 */
export interface GuildOnboardingEntity {
  /**
   * ID of the guild this onboarding is part of.
   * The server that this onboarding configuration belongs to.
   */
  guild_id: Snowflake;

  /**
   * Prompts shown during onboarding and in customize community.
   * The questions/selections presented to new members.
   */
  prompts: GuildOnboardingPromptEntity[];

  /**
   * Channel IDs that members get opted into automatically.
   * Default channels that all new members will be able to access.
   */
  default_channel_ids: Snowflake[];

  /**
   * Whether onboarding is enabled in the guild.
   * If true, new members will go through the onboarding process.
   */
  enabled: boolean;

  /**
   * Current mode of onboarding.
   * Determines what counts toward onboarding requirements.
   */
  mode: GuildOnboardingMode;
}

/**
 * Welcome Screen Channel structure.
 * Represents a channel displayed in the server's welcome screen.
 * @see {@link https://discord.com/developers/docs/resources/guild#welcome-screen-object-welcome-screen-channel-structure}
 */
export interface WelcomeScreenChannelEntity {
  /**
   * ID of the channel.
   * The channel that is being featured in the welcome screen.
   */
  channel_id: Snowflake;

  /**
   * Description of the channel shown in the welcome screen.
   * Text explaining what the channel is for to new members.
   */
  description: string;

  /**
   * ID of the emoji if custom, null otherwise.
   * Custom emoji ID used as the channel's icon in the welcome screen.
   */
  emoji_id: Snowflake | null;

  /**
   * Name of the emoji if standard, the unicode character if standard, or null if no emoji is set.
   * The emoji displayed next to the channel in the welcome screen.
   */
  emoji_name: string | null;
}

/**
 * Guild Welcome Screen structure.
 * Represents the welcome screen shown to new members when they join a community server.
 * @see {@link https://discord.com/developers/docs/resources/guild#welcome-screen-object-welcome-screen-structure}
 */
export interface WelcomeScreenEntity {
  /**
   * Guild description shown in the welcome screen.
   * Text introducing the server to new members.
   */
  description: string | null;

  /**
   * Channels shown in the welcome screen, up to 5.
   * Featured channels that new members are encouraged to check out.
   * @maxItems 5
   */
  welcome_channels: WelcomeScreenChannelEntity[];
}

/**
 * Guild Ban structure.
 * Contains information about a banned user and the reason for their ban.
 * @see {@link https://discord.com/developers/docs/resources/guild#ban-object-ban-structure}
 */
export interface BanEntity {
  /**
   * Reason for the ban.
   * Explanation of why the user was banned from the server.
   */
  reason: string | null;

  /**
   * Banned user.
   * Information about the user who was banned.
   */
  user: UserEntity;
}

/**
 * Integration Application structure.
 * Represents an application tied to a guild integration.
 * @see {@link https://discord.com/developers/docs/resources/guild#integration-object-integration-application-structure}
 */
export interface IntegrationApplicationEntity {
  /**
   * ID of the app.
   * Unique identifier for the integrated application.
   */
  id: Snowflake;

  /**
   * Name of the app.
   * Display name of the integration application.
   */
  name: string;

  /**
   * Icon hash of the app.
   * Hash for the application's icon image.
   */
  icon: string | null;

  /**
   * Description of the app.
   * Text describing what the application does.
   */
  description: string;

  /**
   * Bot associated with this application.
   * If the integration has a bot, this contains the bot user information.
   */
  bot?: UserEntity;
}

/**
 * Integration Account structure.
 * Represents an external account linked to a Discord integration.
 * @see {@link https://discord.com/developers/docs/resources/guild#integration-object-integration-account-structure}
 */
export interface IntegrationAccountEntity {
  /**
   * ID of the account.
   * External account identifier (from Twitch, YouTube, etc.).
   */
  id: string;

  /**
   * Name of the account.
   * Username or name of the external account.
   */
  name: string;
}

/**
 * Guild Integration structure.
 * Represents a connection between a guild and an external service.
 * @see {@link https://discord.com/developers/docs/resources/guild#integration-object-integration-structure}
 */
export interface IntegrationEntity {
  /**
   * Integration ID.
   * Unique identifier for this integration.
   */
  id: Snowflake;

  /**
   * Integration name.
   * Display name of the integration.
   */
  name: string;

  /**
   * Integration type (twitch, youtube, discord, guild_subscription).
   * The external service this integration connects to.
   */
  type: "twitch" | "youtube" | "discord" | "guild_subscription";

  /**
   * Is this integration enabled.
   * Whether the integration is currently active.
   */
  enabled: boolean;

  /**
   * Is this integration syncing.
   * Whether the integration is currently synchronizing with its external service.
   */
  syncing?: boolean;

  /**
   * ID that this integration uses for "subscribers".
   * Role given to users subscribed to this integration.
   */
  role_id?: Snowflake;

  /**
   * Whether emoticons should be synced for this integration (twitch only currently).
   * Controls if emotes from the service are available in the guild.
   */
  enable_emoticons?: boolean;

  /**
   * The behavior of expiring subscribers.
   * What happens when a user's subscription expires.
   */
  expire_behavior?: IntegrationExpirationBehavior;

  /**
   * The grace period (in days) before expiring subscribers.
   * How long after expiration until the expire_behavior is enacted.
   */
  expire_grace_period?: number;

  /**
   * User for this integration.
   * The Discord user who added this integration.
   */
  user?: UserEntity;

  /**
   * Integration account information.
   * Information about the connected external account.
   */
  account: IntegrationAccountEntity;

  /**
   * When this integration was last synced.
   * ISO8601 timestamp of the last synchronization.
   */
  synced_at?: string;

  /**
   * How many subscribers this integration has.
   * Count of users subscribed to this integration.
   */
  subscriber_count?: number;

  /**
   * Has this integration been revoked.
   * Whether the connection to the external service has been revoked.
   */
  revoked?: boolean;

  /**
   * The bot/OAuth2 application for discord integrations.
   * Application information for Discord-based integrations.
   */
  application?: IntegrationApplicationEntity;

  /**
   * The scopes the application has been authorized for.
   * OAuth2 scopes that the application has been granted.
   */
  scopes?: OAuth2Scope[];
}

/**
 * Guild Member structure.
 * Represents a member of a guild, combining a user with guild-specific attributes.
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-member-object}
 */
export interface GuildMemberEntity {
  /**
   * The user this guild member represents.
   * Basic user information like username, ID, avatar, etc.
   */
  user: UserEntity;

  /**
   * This user's guild nickname.
   * Custom name for this user in this specific guild.
   */
  nick?: string | null;

  /**
   * The member's guild avatar hash.
   * Custom avatar just for this guild, separate from the global user avatar.
   */
  avatar?: string | null;

  /**
   * The member's guild banner hash.
   * Custom banner for this member in this guild.
   */
  banner?: string | null;

  /**
   * Array of role IDs.
   * All roles that this member has in the guild.
   */
  roles: Snowflake[];

  /**
   * When the user joined the guild.
   * ISO8601 timestamp of when this member joined the server.
   */
  joined_at: string;

  /**
   * When the user started boosting the guild.
   * ISO8601 timestamp of when this member began server boosting.
   */
  premium_since?: string | null;

  /**
   * Whether the user is deafened in voice channels.
   * If true, the member cannot hear anyone in voice channels.
   */
  deaf: boolean;

  /**
   * Whether the user is muted in voice channels.
   * If true, the member cannot speak in voice channels.
   */
  mute: boolean;

  /**
   * Guild member flags.
   * Bitwise value of various member states and settings.
   */
  flags: GuildMemberFlags;

  /**
   * Whether the user has not yet passed the guild's Membership Screening requirements.
   * If true, the member is still in the screening process.
   */
  pending?: boolean;

  /**
   * Total permissions of the member in the channel, including overwrites.
   * String representation of the member's permission bits.
   */
  permissions?: string;

  /**
   * When the user's timeout will expire and the user will be able to communicate in the guild again.
   * ISO8601 timestamp of when a timed-out member can participate again.
   */
  communication_disabled_until?: string | null;

  /**
   * Data for the member's guild avatar decoration.
   * Special visual effects for the member's avatar in this guild.
   */
  avatar_decoration_data?: AvatarDecorationDataEntity | null;
}

/**
 * Guild Widget Settings structure.
 * Contains configuration for the guild's widget feature.
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-widget-settings-object-guild-widget-settings-structure}
 */
export interface GuildWidgetSettingsEntity {
  /**
   * Whether the widget is enabled.
   * If true, the guild widget is active and accessible.
   */
  enabled: boolean;

  /**
   * The widget channel ID.
   * Channel where the widget will generate an invite to.
   */
  channel_id: Snowflake | null;
}

/**
 * Guild Widget structure.
 * Represents the public-facing widget for a guild.
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-widget-object-guild-widget-structure}
 */
export interface GuildWidgetEntity {
  /**
   * Guild ID.
   * Unique identifier for the guild this widget represents.
   */
  id: Snowflake;

  /**
   * Guild name.
   * Display name of the server shown in the widget.
   */
  name: string;

  /**
   * Instant invite for the guilds specified widget invite channel.
   * Invite link that the widget will generate for visitors.
   */
  instant_invite: string | null;

  /**
   * Voice and stage channels which are accessible by @everyone.
   * Public voice channels shown in the widget.
   */
  channels: (GuildVoiceChannelEntity | GuildStageVoiceChannelEntity)[];

  /**
   * Special widget user objects that includes users presence (Limit 100).
   * Online members that will be displayed in the widget.
   * @maxItems 100
   */
  members: UserEntity[];

  /**
   * Number of online members in this guild.
   * Count of currently active users shown in the widget.
   */
  presence_count: number;
}

/**
 * Guild Preview structure.
 * Contains information about a guild available before joining.
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-preview-object-guild-preview-structure}
 */
export interface GuildPreviewEntity {
  /**
   * Guild ID.
   * Unique identifier for the guild.
   */
  id: Snowflake;

  /**
   * Guild name (2-100 characters).
   * The display name of the server.
   * @minLength 2
   * @maxLength 100
   */
  name: string;

  /**
   * Icon hash.
   * Hash for the guild's icon image.
   */
  icon: string | null;

  /**
   * Splash hash.
   * Hash for the guild's invite splash image.
   */
  splash: string | null;

  /**
   * Discovery splash hash.
   * Hash for the guild's discovery splash image.
   */
  discovery_splash: string | null;

  /**
   * Custom guild emojis.
   * All custom emoji available in this guild.
   */
  emojis: EmojiEntity[];

  /**
   * Enabled guild features.
   * Special features enabled for this guild.
   */
  features: GuildFeature[];

  /**
   * Approximate number of members in this guild.
   * Estimated total member count.
   */
  approximate_member_count: number;

  /**
   * Approximate number of online members in this guild.
   * Estimated count of currently active members.
   */
  approximate_presence_count: number;

  /**
   * The description of the guild.
   * Text describing what the server is about.
   */
  description: string | null;

  /**
   * Custom guild stickers.
   * All custom stickers available in this guild.
   */
  stickers: StickerEntity[];
}

/**
 * Unavailable Guild structure.
 * Represents a guild that is currently unavailable to the client.
 * @see {@link https://discord.com/developers/docs/resources/guild#unavailable-guild-object}
 */
export interface UnavailableGuildEntity {
  /**
   * Guild ID.
   * Unique identifier for the unavailable guild.
   */
  id: Snowflake;

  /**
   * Indicates if the guild is unavailable due to an outage.
   * Always true for unavailable guild objects.
   */
  unavailable: true;
}

/**
 * Incidents Data structure.
 * Contains information about guild-related safety incidents.
 * @see {@link https://discord.com/developers/docs/resources/guild#incidents-data-object-incidents-data-structure}
 */
export interface IncidentsDataEntity {
  /**
   * When invites get enabled again.
   * ISO8601 timestamp when server invites will be automatically re-enabled.
   */
  invites_disabled_until: string | null;

  /**
   * When direct messages get enabled again.
   * ISO8601 timestamp when DMs will be automatically re-enabled.
   */
  dms_disabled_until: string | null;

  /**
   * When the dm spam was detected.
   * ISO8601 timestamp when Discord detected DM spam activity.
   */
  dm_spam_detected_at?: string | null;

  /**
   * When the raid was detected.
   * ISO8601 timestamp when Discord detected raid activity.
   */
  raid_detected_at?: string | null;
}

/**
 * Guild structure.
 * Represents a Discord server with all its channels, members, and settings.
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-guild-structure}
 */
export interface GuildEntity {
  /**
   * Guild ID.
   * Unique identifier for this guild/server.
   */
  id: Snowflake;

  /**
   * Guild name (2-100 characters, excluding trailing and leading whitespace).
   * The display name of the server shown in the UI.
   * @minLength 2
   * @maxLength 100
   * @validate Guild name must not consist only of whitespace
   */
  name: string;

  /**
   * Icon hash.
   * Hash for the guild's icon image, used to construct URLs.
   */
  icon: string | null;

  /**
   * Icon hash, returned when in the template object.
   * Alternative icon hash used in certain contexts.
   */
  icon_hash?: string | null;

  /**
   * Splash hash.
   * Hash for the guild's invite splash background image.
   */
  splash: string | null;

  /**
   * Discovery splash hash.
   * Hash for the guild's discovery splash image.
   */
  discovery_splash: string | null;

  /**
   * True if the user is the owner of the guild.
   * Indicates if the current user owns this server.
   */
  owner?: boolean;

  /**
   * ID of owner.
   * Unique identifier for the user who owns this guild.
   */
  owner_id: Snowflake;

  /**
   * Total permissions for the user in the guild (excludes overwrites).
   * String representation of the current user's permissions.
   */
  permissions?: string;

  /**
   * Voice region id for the guild (deprecated).
   * Legacy voice region identifier, now replaced by channel-specific regions.
   */
  region?: string | null;

  /**
   * ID of AFK channel.
   * Channel where inactive users are moved after the AFK timeout.
   */
  afk_channel_id: Snowflake | null;

  /**
   * AFK timeout in seconds.
   * Time in seconds before inactive users are moved to the AFK channel.
   */
  afk_timeout: 60 | 300 | 900 | 1800 | 3600;

  /**
   * True if the server widget is enabled.
   * Whether the guild's widget feature is active.
   */
  widget_enabled?: boolean;

  /**
   * The channel id that the widget will generate an invite to, or null if set to no invite.
   * Channel used for widget-generated invites.
   */
  widget_channel_id?: Snowflake | null;

  /**
   * Verification level required for the guild.
   * Security level required for members to participate.
   */
  verification_level: VerificationLevel;

  /**
   * Default message notifications level.
   * Controls which messages trigger notifications by default.
   */
  default_message_notifications: DefaultMessageNotificationLevel;

  /**
   * Explicit content filter level.
   * Level of automatic scanning for inappropriate content.
   */
  explicit_content_filter: ExplicitContentFilterLevel;

  /**
   * Roles in the guild.
   * All roles defined in this server.
   */
  roles: RoleEntity[];

  /**
   * Custom guild emojis.
   * All custom emoji available in this guild.
   */
  emojis: EmojiEntity[];

  /**
   * Enabled guild features.
   * Special features enabled for this guild.
   */
  features: GuildFeature[];

  /**
   * Required MFA level for the guild.
   * Level of two-factor authentication required for moderation actions.
   */
  mfa_level: MfaLevel;

  /**
   * Application ID of the guild creator if it is bot-created.
   * If the server was created by a bot, this is the application's ID.
   */
  application_id: Snowflake | null;

  /**
   * The ID of the channel where guild notices such as welcome messages and boost events are posted.
   * Channel where system messages are sent.
   */
  system_channel_id: Snowflake | null;

  /**
   * System channel flags.
   * Controls which system messages are sent to the system channel.
   */
  system_channel_flags: SystemChannelFlags;

  /**
   * The ID of the channel where Community guilds can display rules and/or guidelines.
   * Channel shown in the community overview for server rules.
   */
  rules_channel_id: Snowflake | null;

  /**
   * The maximum number of presences for the guild (null is always returned, apart from the largest of guilds).
   * Upper limit on concurrent presence data.
   */
  max_presences?: number | null;

  /**
   * The maximum number of members for the guild.
   * Upper limit on how many members can join this server.
   */
  max_members: number;

  /**
   * The vanity url code for the guild.
   * Custom invite URL for the server (discord.gg/vanity-url).
   */
  vanity_url_code: string | null;

  /**
   * The description of a guild.
   * Text describing what the server is about.
   */
  description: string | null;

  /**
   * Banner hash.
   * Hash for the guild's banner image.
   */
  banner: string | null;

  /**
   * Premium tier (Server Boost level).
   * Current boost level and associated perks.
   */
  premium_tier: PremiumTier;

  /**
   * The number of boosts this guild currently has.
   * Count of server boosts from members.
   */
  premium_subscription_count?: number;

  /**
   * The preferred locale of a Community guild; used in server discovery and notices from Discord, and sent in interactions.
   * Language code for server-wide communications from Discord.
   */
  preferred_locale: Locale;

  /**
   * The ID of the channel where admins and moderators of Community guilds receive notices from Discord.
   * Channel for important Discord system notifications.
   */
  public_updates_channel_id: Snowflake | null;

  /**
   * The maximum amount of users in a video channel.
   * Upper limit on concurrent video participants.
   */
  max_video_channel_users?: number;

  /**
   * The maximum amount of users in a stage video channel.
   * Upper limit on concurrent stage video participants.
   */
  max_stage_video_channel_users?: number;

  /**
   * Approximate number of members in this guild, returned from the GET /guilds/<id> endpoint when with_counts is true.
   * Estimated total member count.
   */
  approximate_member_count?: number;

  /**
   * Approximate number of non-offline members in this guild, returned from the GET /guilds/<id> endpoint when with_counts is true.
   * Estimated count of currently active members.
   */
  approximate_presence_count?: number;

  /**
   * The welcome screen of a Community guild, shown to new members.
   * Customizable first-time member experience screen.
   */
  welcome_screen?: WelcomeScreenEntity;

  /**
   * Guild NSFW level.
   * Age restriction and content filtering level.
   */
  nsfw_level: NsfwLevel;

  /**
   * Custom guild stickers.
   * All custom stickers available in this guild.
   */
  stickers?: StickerEntity[];

  /**
   * Whether the guild has the boost progress bar enabled.
   * Shows visual progress toward next server boost level.
   */
  premium_progress_bar_enabled: boolean;

  /**
   * The ID of the channel where admins and moderators of Community guilds receive safety alerts from Discord.
   * Channel for security and safety notifications from Discord.
   */
  safety_alerts_channel_id: Snowflake | null;

  /**
   * The incidents data for this guild.
   * Information about safety incidents like raids or spam.
   */
  incidents_data?: IncidentsDataEntity | null;
}
