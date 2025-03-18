import { z } from "zod";
import { Locale, OAuth2Scope } from "../enums/index.js";
import { Snowflake } from "../managers/index.js";
import {
  GuildStageVoiceChannelEntity,
  GuildVoiceChannelEntity,
} from "./channel.entity.js";
import { EmojiEntity } from "./emoji.entity.js";
import { RoleEntity } from "./role.entity.js";
import { StickerEntity } from "./sticker.entity.js";
import { AvatarDecorationDataEntity, UserEntity } from "./user.entity.js";

/**
 * Types of prompts that can be used in guild onboarding
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/guild.md#onboarding-prompt-types}
 */
export enum GuildOnboardingPromptType {
  /** Multiple choice prompt type */
  MultipleChoice = 0,

  /** Dropdown prompt type */
  Dropdown = 1,
}

/**
 * Modes for guild onboarding which define criteria for enabling onboarding
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/guild.md#onboarding-mode}
 */
export enum GuildOnboardingMode {
  /** Counts only Default Channels towards constraints */
  Default = 0,

  /** Counts Default Channels and Questions towards constraints */
  Advanced = 1,
}

/**
 * Behaviors for handling expired integrations
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/guild.md#integration-expire-behaviors}
 */
export enum IntegrationExpirationBehavior {
  /** Remove role from member when integration expires */
  RemoveRole = 0,

  /** Kick member when integration expires */
  Kick = 1,
}

/**
 * Flags for guild members
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/guild.md#guild-member-flags}
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
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/guild.md#guild-features}
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
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/guild.md#system-channel-flags}
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
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/guild.md#premium-tier}
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
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/guild.md#guild-nsfw-level}
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
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/guild.md#verification-level}
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
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/guild.md#mfa-level}
 */
export enum MfaLevel {
  /** Guild has no MFA/2FA requirement for moderation actions */
  None = 0,

  /** Guild has a 2FA requirement for moderation actions */
  Elevated = 1,
}

/**
 * Explicit content filter level for a guild
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/guild.md#explicit-content-filter-level}
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
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/guild.md#default-message-notification-level}
 */
export enum DefaultMessageNotificationLevel {
  /** Members will receive notifications for all messages by default */
  AllMessages = 0,

  /** Members will receive notifications only for messages that @mention them by default */
  OnlyMentions = 1,
}

/**
 * Zod schema for Guild Onboarding Prompt Option
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/guild.md#prompt-option-structure}
 */
export const GuildOnboardingPromptOptionEntity = z.object({
  /** ID of the prompt option */
  id: Snowflake,

  /** Channel IDs that will be pre-selected for users who select this option */
  channel_ids: Snowflake.array(),

  /** Role IDs that will be assigned to users who select this option */
  role_ids: Snowflake.array(),

  /** Emoji object for the option */
  emoji: z.lazy(() => EmojiEntity).optional(),

  /** Emoji ID of the option (used when creating/updating) */
  emoji_id: Snowflake.optional(),

  /** Emoji name of the option (used when creating/updating) */
  emoji_name: z.string().optional(),

  /** Whether the emoji is animated (used when creating/updating) */
  emoji_animated: z.boolean().optional(),

  /** Title of the option */
  title: z.string(),

  /** Description of the option */
  description: z.string().nullable(),
});

export type GuildOnboardingPromptOptionEntity = z.infer<
  typeof GuildOnboardingPromptOptionEntity
>;

/**
 * Zod schema for Guild Onboarding Prompt
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/guild.md#onboarding-prompt-structure}
 */
export const GuildOnboardingPromptEntity = z.object({
  /** ID of the prompt */
  id: Snowflake,

  /** Type of prompt */
  type: z.nativeEnum(GuildOnboardingPromptType),

  /** Options available within the prompt */
  options: GuildOnboardingPromptOptionEntity.array(),

  /** Title of the prompt */
  title: z.string(),

  /** Whether users can only select one option for the prompt */
  single_select: z.boolean(),

  /** Whether the prompt is required before a user completes the onboarding flow */
  required: z.boolean(),

  /** Whether the prompt is present in the onboarding flow */
  in_onboarding: z.boolean(),
});

export type GuildOnboardingPromptEntity = z.infer<
  typeof GuildOnboardingPromptEntity
>;

/**
 * Zod schema for Guild Onboarding
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/guild.md#guild-onboarding-structure}
 */
export const GuildOnboardingEntity = z.object({
  /** ID of the guild this onboarding is part of */
  guild_id: Snowflake,

  /** Prompts shown during onboarding and in customize community */
  prompts: GuildOnboardingPromptEntity.array(),

  /** Channel IDs that members get opted into automatically */
  default_channel_ids: Snowflake.array(),

  /** Whether onboarding is enabled in the guild */
  enabled: z.boolean(),

  /** Current mode of onboarding */
  mode: z.nativeEnum(GuildOnboardingMode),
});

export type GuildOnboardingEntity = z.infer<typeof GuildOnboardingEntity>;

/**
 * Zod schema for Welcome Screen Channel
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/guild.md#welcome-screen-channel-structure}
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
 * Zod schema for Guild Welcome Screen
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/guild.md#welcome-screen-structure}
 */
export const WelcomeScreenEntity = z.object({
  /** Guild description shown in the welcome screen */
  description: z.string().nullable(),

  /** Channels shown in the welcome screen, up to 5 */
  welcome_channels: WelcomeScreenChannelEntity.array().max(5),
});

export type WelcomeScreenEntity = z.infer<typeof WelcomeScreenEntity>;

/**
 * Zod schema for Guild Ban
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/guild.md#ban-structure}
 */
export const BanEntity = z.object({
  /** Reason for the ban */
  reason: z.string().nullable(),

  /** Banned user */
  user: z.lazy(() => UserEntity),
});

export type BanEntity = z.infer<typeof BanEntity>;

/**
 * Zod schema for Integration Application
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/guild.md#integration-application-structure}
 */
export const IntegrationApplicationEntity = z.object({
  /** ID of the app */
  id: Snowflake,

  /** Name of the app */
  name: z.string(),

  /** Icon hash of the app */
  icon: z.string().nullable(),

  /** Description of the app */
  description: z.string(),

  /** Bot associated with this application */
  bot: z.lazy(() => UserEntity).optional(),
});

export type IntegrationApplicationEntity = z.infer<
  typeof IntegrationApplicationEntity
>;

/**
 * Zod schema for Integration Account
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/guild.md#integration-account-structure}
 */
export const IntegrationAccountEntity = z.object({
  /** ID of the account */
  id: z.string(),

  /** Name of the account */
  name: z.string(),
});

export type IntegrationAccountEntity = z.infer<typeof IntegrationAccountEntity>;

/**
 * Zod schema for Guild Integration
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/guild.md#integration-structure}
 */
export const IntegrationEntity = z.object({
  /** Integration ID */
  id: Snowflake,

  /** Integration name */
  name: z.string(),

  /** Integration type (twitch, youtube, discord, guild_subscription) */
  type: z.enum(["twitch", "youtube", "discord", "guild_subscription"]),

  /** Is this integration enabled */
  enabled: z.boolean(),

  /** Is this integration syncing */
  syncing: z.boolean().optional(),

  /** ID that this integration uses for "subscribers" */
  role_id: Snowflake.optional(),

  /** Whether emoticons should be synced for this integration (twitch only currently) */
  enable_emoticons: z.boolean().optional(),

  /** The behavior of expiring subscribers */
  expire_behavior: z.nativeEnum(IntegrationExpirationBehavior).optional(),

  /** The grace period (in days) before expiring subscribers */
  expire_grace_period: z.number().int().optional(),

  /** User for this integration */
  user: z.lazy(() => UserEntity).optional(),

  /** Integration account information */
  account: IntegrationAccountEntity,

  /** When this integration was last synced */
  synced_at: z.string().optional(),

  /** How many subscribers this integration has */
  subscriber_count: z.number().int().optional(),

  /** Has this integration been revoked */
  revoked: z.boolean().optional(),

  /** The bot/OAuth2 application for discord integrations */
  application: IntegrationApplicationEntity.optional(),

  /** The scopes the application has been authorized for */
  scopes: z.nativeEnum(OAuth2Scope).array().optional(),
});

export type IntegrationEntity = z.infer<typeof IntegrationEntity>;

/**
 * Zod schema for Guild Member
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/guild.md#guild-member-object}
 */
export const GuildMemberEntity = z.object({
  /** The user this guild member represents */
  user: z.lazy(() => UserEntity),

  /** This user's guild nickname */
  nick: z.string().nullish(),

  /** The member's guild avatar hash */
  avatar: z.string().nullish(),

  /** The member's guild banner hash */
  banner: z.string().nullish(),

  /** Array of role IDs */
  roles: Snowflake.array(),

  /** When the user joined the guild */
  joined_at: z.string(),

  /** When the user started boosting the guild */
  premium_since: z.string().nullish(),

  /** Whether the user is deafened in voice channels */
  deaf: z.boolean(),

  /** Whether the user is muted in voice channels */
  mute: z.boolean(),

  /** Guild member flags */
  flags: z.nativeEnum(GuildMemberFlags),

  /** Whether the user has not yet passed the guild's Membership Screening requirements */
  pending: z.boolean().optional(),

  /** Total permissions of the member in the channel, including overwrites */
  permissions: z.string().optional(),

  /** When the user's timeout will expire and the user will be able to communicate in the guild again */
  communication_disabled_until: z.string().nullish(),

  /** Data for the member's guild avatar decoration */
  avatar_decoration_data: z.lazy(() => AvatarDecorationDataEntity).nullish(),
});

export type GuildMemberEntity = z.infer<typeof GuildMemberEntity>;

/**
 * Zod schema for Guild Widget Settings
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/guild.md#guild-widget-settings-structure}
 */
export const GuildWidgetSettingsEntity = z.object({
  /** Whether the widget is enabled */
  enabled: z.boolean(),

  /** The widget channel ID */
  channel_id: Snowflake.nullable(),
});

export type GuildWidgetSettingsEntity = z.infer<
  typeof GuildWidgetSettingsEntity
>;

/**
 * Zod schema for Guild Widget
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/guild.md#guild-widget-structure}
 */
export const GuildWidgetEntity = z.object({
  /** Guild ID */
  id: Snowflake,

  /** Guild name */
  name: z.string(),

  /** Instant invite for the guilds specified widget invite channel */
  instant_invite: z.string().nullable(),

  /** Voice and stage channels which are accessible by @everyone */
  channels: z
    .union([
      z.lazy(() => GuildVoiceChannelEntity.partial()),
      z.lazy(() => GuildStageVoiceChannelEntity.partial()),
    ])
    .array(),

  /** Special widget user objects that includes users presence (Limit 100) */
  members: z
    .lazy(() => UserEntity)
    .array()
    .max(100),

  /** Number of online members in this guild */
  presence_count: z.number().int(),
});

export type GuildWidgetEntity = z.infer<typeof GuildWidgetEntity>;

/**
 * Zod schema for Guild Preview
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/guild.md#guild-preview-structure}
 */
export const GuildPreviewEntity = z.object({
  /** Guild ID */
  id: Snowflake,

  /** Guild name (2-100 characters) */
  name: z.string().min(2).max(100),

  /** Icon hash */
  icon: z.string().nullable(),

  /** Splash hash */
  splash: z.string().nullable(),

  /** Discovery splash hash */
  discovery_splash: z.string().nullable(),

  /** Custom guild emojis */
  emojis: z.lazy(() => EmojiEntity).array(),

  /** Enabled guild features */
  features: z.nativeEnum(GuildFeature).array(),

  /** Approximate number of members in this guild */
  approximate_member_count: z.number().int(),

  /** Approximate number of online members in this guild */
  approximate_presence_count: z.number().int(),

  /** The description of the guild */
  description: z.string().nullable(),

  /** Custom guild stickers */
  stickers: z.lazy(() => StickerEntity).array(),
});

export type GuildPreviewEntity = z.infer<typeof GuildPreviewEntity>;

/**
 * Zod schema for Unavailable Guild
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/guild.md#unavailable-guild-object}
 */
export const UnavailableGuildEntity = z.object({
  /** Guild ID */
  id: Snowflake,

  /** Indicates if the guild is unavailable due to an outage */
  unavailable: z.literal(true),
});

export type UnavailableGuildEntity = z.infer<typeof UnavailableGuildEntity>;

/**
 * Zod schema for Incidents Data
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/guild.md#incidents-data-structure}
 */
export const IncidentsDataEntity = z.object({
  /** When invites get enabled again */
  invites_disabled_until: z.string().nullable(),

  /** When direct messages get enabled again */
  dms_disabled_until: z.string().nullable(),

  /** When the dm spam was detected */
  dm_spam_detected_at: z.string().nullish(),

  /** When the raid was detected */
  raid_detected_at: z.string().nullish(),
});

export type IncidentsDataEntity = z.infer<typeof IncidentsDataEntity>;

/**
 * Zod schema for Guild
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/guild.md#guild-structure}
 */
export const GuildEntity = z.object({
  /** Guild ID */
  id: Snowflake,

  /** Guild name (2-100 characters, excluding trailing and leading whitespace) */
  name: z
    .string()
    .min(2)
    .max(100)
    .refine((val) => val.trim().length >= 2, {
      message: "Guild name must not consist only of whitespace",
    }),

  /** Icon hash */
  icon: z.string().nullable(),

  /** Icon hash, returned when in the template object */
  icon_hash: z.string().nullish(),

  /** Splash hash */
  splash: z.string().nullable(),

  /** Discovery splash hash */
  discovery_splash: z.string().nullable(),

  /** True if the user is the owner of the guild */
  owner: z.boolean().optional(),

  /** ID of owner */
  owner_id: Snowflake,

  /** Total permissions for the user in the guild (excludes overwrites) */
  permissions: z.string().optional(),

  /** Voice region id for the guild (deprecated) */
  region: z.string().nullish(),

  /** ID of AFK channel */
  afk_channel_id: Snowflake.nullable(),

  /** AFK timeout in seconds */
  afk_timeout: z.union([
    z.literal(60),
    z.literal(300),
    z.literal(900),
    z.literal(1800),
    z.literal(3600),
  ]),

  /** True if the server widget is enabled */
  widget_enabled: z.boolean().optional(),

  /** The channel id that the widget will generate an invite to, or null if set to no invite */
  widget_channel_id: Snowflake.nullish(),

  /** Verification level required for the guild */
  verification_level: z.nativeEnum(VerificationLevel),

  /** Default message notifications level */
  default_message_notifications: z.nativeEnum(DefaultMessageNotificationLevel),

  /** Explicit content filter level */
  explicit_content_filter: z.nativeEnum(ExplicitContentFilterLevel),

  /** Roles in the guild */
  roles: z.lazy(() => RoleEntity).array(),

  /** Custom guild emojis */
  emojis: z.lazy(() => EmojiEntity).array(),

  /** Enabled guild features */
  features: z.nativeEnum(GuildFeature).array(),

  /** Required MFA level for the guild */
  mfa_level: z.nativeEnum(MfaLevel),

  /** Application ID of the guild creator if it is bot-created */
  application_id: Snowflake.nullable(),

  /** The ID of the channel where guild notices such as welcome messages and boost events are posted */
  system_channel_id: Snowflake.nullable(),

  /** System channel flags */
  system_channel_flags: z.nativeEnum(SystemChannelFlags),

  /** The ID of the channel where Community guilds can display rules and/or guidelines */
  rules_channel_id: Snowflake.nullable(),

  /** The maximum number of presences for the guild (null is always returned, apart from the largest of guilds) */
  max_presences: z.number().int().nullish(),

  /** The maximum number of members for the guild */
  max_members: z.number().int(),

  /** The vanity url code for the guild */
  vanity_url_code: z.string().nullable(),

  /** The description of a guild */
  description: z.string().nullable(),

  /** Banner hash */
  banner: z.string().nullable(),

  /** Premium tier (Server Boost level) */
  premium_tier: z.nativeEnum(PremiumTier),

  /** The number of boosts this guild currently has */
  premium_subscription_count: z.number().int().optional(),

  /** The preferred locale of a Community guild; used in server discovery and notices from Discord, and sent in interactions */
  preferred_locale: z.nativeEnum(Locale),

  /** The ID of the channel where admins and moderators of Community guilds receive notices from Discord */
  public_updates_channel_id: Snowflake.nullable(),

  /** The maximum amount of users in a video channel */
  max_video_channel_users: z.number().int().optional(),

  /** The maximum amount of users in a stage video channel */
  max_stage_video_channel_users: z.number().int().optional(),

  /** Approximate number of members in this guild, returned from the GET /guilds/<id> endpoint when with_counts is true */
  approximate_member_count: z.number().int().optional(),

  /** Approximate number of non-offline members in this guild, returned from the GET /guilds/<id> endpoint when with_counts is true */
  approximate_presence_count: z.number().int().optional(),

  /** The welcome screen of a Community guild, shown to new members */
  welcome_screen: WelcomeScreenEntity.optional(),

  /** Guild NSFW level */
  nsfw_level: z.nativeEnum(NsfwLevel),

  /** Custom guild stickers */
  stickers: z
    .lazy(() => StickerEntity)
    .array()
    .optional(),

  /** Whether the guild has the boost progress bar enabled */
  premium_progress_bar_enabled: z.boolean(),

  /** The ID of the channel where admins and moderators of Community guilds receive safety alerts from Discord */
  safety_alerts_channel_id: Snowflake.nullable(),

  /** The incidents data for this guild */
  incidents_data: IncidentsDataEntity.nullish(),
});

export type GuildEntity = z.infer<typeof GuildEntity>;
