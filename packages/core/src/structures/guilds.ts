import type { LocaleKeys } from "../enums/locales";
import type { OAuth2Scopes } from "../enums/oauth2";
import type { BitwisePermissions } from "../enums/permissions";
import type { BitfieldResolvable } from "../libs/bitfield";
import type { Integer, Iso8601Timestamp, Snowflake } from "../types";
import type { ChannelStructure } from "./channels";
import type { EmojiStructure } from "./emojis";
import type { RoleStructure } from "./roles";
import type { StickerStructure } from "./stickers";
import type { AvatarDecorationDataStructure, UserStructure } from "./users";

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-prompt-types|Guild Onboarding Prompt Types}
 */
export enum GuildOnboardingPromptTypes {
    MultipleChoice = 0,
    Dropdown = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-onboarding-mode|Guild Onboarding Modes}
 */
export enum GuildOnboardingModes {
    /**
     * Counts only Default Channels towards constraints
     */
    Default = 0,
    /**
     * Counts Default Channels and Questions towards constraints
     */
    Advanced = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-prompt-option-structure|Guild Onboarding Prompt Option Structure}
 */
export type GuildOnboardingPromptOptionStructure = {
    /**
     * IDs for channels a member is added to when the option is selected
     */
    channel_ids: Snowflake[];
    /**
     * Description of the option
     */
    description: string | null;
    /**
     * Whether the emoji is animated (see below)
     */
    emoji_animated?: boolean;
    /**
     * Emoji ID of the option (see below)
     */
    emoji_id?: Snowflake;
    /**
     * Emoji name of the option (see below)
     */
    emoji_name?: string;
    /**
     * ID of the prompt option
     */
    id: Snowflake;
    /**
     * IDs for roles assigned to a member when the option is selected
     */
    role_ids: Snowflake[];
    /**
     * Title of the option
     */
    title: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-onboarding-prompt-structure|Guild Onboarding Prompt Structure}
 */
export type GuildOnboardingPromptStructure = {
    /**
     * ID of the prompt
     */
    id: Snowflake;
    /**
     * Indicates whether the prompt is present in the onboarding flow. If false, the prompt will only appear in the Channels & Roles tab
     */
    in_onboarding: boolean;
    /**
     * Options available within the prompt
     */
    options: GuildOnboardingPromptOptionStructure[];
    /**
     * Indicates whether the prompt is required before a user completes the onboarding flow
     */
    required: boolean;
    /**
     * Indicates whether users are limited to selecting one option for the prompt
     */
    single_select: boolean;
    /**
     * Title of the prompt
     */
    title: string;
    /**
     * Type of prompt
     */
    type: GuildOnboardingPromptTypes;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-guild-onboarding-structure|Guild Onboarding Structure}
 */
export type GuildOnboardingStructure = {
    /**
     * Channel IDs that members get opted into automatically
     */
    default_channel_ids: Snowflake[];
    /**
     * Whether onboarding is enabled in the guild
     */
    enabled: boolean;
    /**
     * ID of the guild this onboarding is part of
     */
    guild_id: Snowflake;
    /**
     * Current mode of onboarding
     */
    mode: GuildOnboardingModes;
    /**
     * Prompts shown during onboarding and in customize community
     */
    prompts: GuildOnboardingPromptStructure[];
};

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#welcome-screen-object-welcome-screen-channel-structure|Welcome Screen Channel Structure}
 */
export type WelcomeScreenChannelStructure = {
    /**
     * The channel's id
     */
    channel_id: Snowflake;
    /**
     * The description shown for the channel
     */
    description: string;
    /**
     * The emoji id, if the emoji is custom
     */
    emoji_id: Snowflake | null;
    /**
     * The emoji name if custom, the unicode character if standard, or null if no emoji is set
     */
    emoji_name: string | null;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#welcome-screen-object-welcome-screen-structure|Welcome Screen Structure}
 */
export type WelcomeScreenStructure = {
    /**
     * The server description shown in the welcome screen
     */
    description: string | null;
    /**
     * The channels shown in the welcome screen, up to 5
     */
    welcome_channels: WelcomeScreenChannelStructure[];
};

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#ban-object-ban-structure|Ban Structure}
 */
export type BanStructure = {
    /**
     * The reason for the ban
     */
    reason: string | null;
    /**
     * The banned user
     */
    user: UserStructure;
};
/**
 * @see {@link https://discord.com/developers/docs/resources/guild#integration-application-object-integration-application-structure|Integration Application Structure}
 */
export type IntegrationApplicationStructure = {
    /**
     * The bot associated with this application
     */
    bot?: UserStructure;
    /**
     * The description of the app
     */
    description: string;
    /**
     * The icon hash of the app
     */
    icon: string | null;
    /**
     * The id of the app
     */
    id: Snowflake;
    /**
     * The name of the app
     */
    name: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#integration-account-object-integration-account-structure|Integration Account Structure}
 */
export type IntegrationAccountStructure = {
    /**
     * id of the account
     */
    id: string;
    /**
     * name of the account
     */
    name: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#integration-object-integration-expire-behaviors|Integration Expire Behaviors}
 */
export enum IntegrationExpireBehaviors {
    RemoveRole = 0,
    Kick = 1,
}

export enum IntegrationTypes {
    Discord = "discord",
    GuildSubscription = "guild_subscription",
    Twitch = "twitch",
    Youtube = "youtube",
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#integration-object-integration-structure|Integration Structure}
 */
export type IntegrationStructure = {
    /**
     * The account for this integration
     */
    account: IntegrationAccountStructure;
    /**
     * The bot/OAuth2 application for Discord integrations
     */
    application?: IntegrationApplicationStructure;
    /**
     * Whether emoticons should be synced for this integration (twitch only currently)
     */
    enable_emoticons?: boolean;
    /**
     * Whether the integration is enabled
     */
    enabled: boolean;
    /**
     * The behavior of expiring subscribers
     */
    expire_behavior?: IntegrationExpireBehaviors;
    /**
     * The grace period (in days) before expiring subscribers
     */
    expire_grace_period?: Integer;
    /**
     * The id of the integration
     */
    id: Snowflake;
    /**
     * The name of the integration
     */
    name: string;
    /**
     * Whether this integration has been revoked
     */
    revoked?: boolean;
    /**
     * The id of the role that the integration uses for subscribers
     */
    role_id?: Snowflake;
    /**
     * The scopes the application has been authorized for
     */
    scopes?: OAuth2Scopes[];
    /**
     * How many subscribers this integration has
     */
    subscriber_count?: Integer;
    /**
     * When this integration was last synced
     */
    synced_at?: Iso8601Timestamp;
    /**
     * Whether the integration is syncing
     */
    syncing?: boolean;
    /**
     * The type of the integration
     */
    type: IntegrationTypes;
    /**
     * The user for this integration
     */
    user?: UserStructure;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-member-object-guild-member-flags|Guild Member Flags}
 */
export enum GuildMemberFlags {
    /**
     * Member has left and rejoined the guild
     */
    DidRejoin = 1,
    /**
     * Member has completed onboarding
     */
    CompletedOnboarding = 2,
    /**
     * Member is exempt from guild verification requirements
     */
    BypassesVerification = 4,
    /**
     * Member has started onboarding
     */
    StartedOnboarding = 8,
    /**
     * Member is a guest and can only access the voice channel they were invited to
     */
    IsGuest = 16,
    /**
     * Member has started Server Guide new member actions
     */
    StartedHomeActions = 32,
    /**
     * Member has completed Server Guide new member actions
     */
    CompletedHomeActions = 64,
    /**
     * Member's username, display name, or nickname is blocked by AutoMod
     */
    AutomodQuarantinedUsername = 128,
    /**
     * Member has dismissed the DM settings upsell
     */
    DmSettingsUpsellAcknowledged = 512,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-member-object-guild-member-structure|Guild Member Structure}
 */
export type GuildMemberStructure = {
    /**
     * The member's guild avatar hash
     */
    avatar?: string | null;
    /**
     * Data for the member's guild avatar decoration
     */
    avatar_decoration_data?: AvatarDecorationDataStructure | null;
    /**
     * When the user's timeout will expire and the user will be able to communicate in the guild again, null or a time in the past if the user is not timed out
     */
    communication_disabled_until?: Iso8601Timestamp | null;
    /**
     * Whether the user is deafened in voice channels
     */
    deaf: boolean;
    /**
     * Guild member flags represented as a bit set, defaults to 0
     */
    flags: BitfieldResolvable<GuildMemberFlags>;
    /**
     * When the user joined the guild
     */
    joined_at: Iso8601Timestamp;
    /**
     * Whether the user is muted in voice channels
     */
    mute: boolean;
    /**
     * This user's guild nickname
     */
    nick?: string | null;
    /**
     * Whether the user has not yet passed the guild's Membership Screening requirements
     */
    pending?: boolean;
    /**
     * Total permissions of the member in the channel, including overwrites, returned when in the interaction object
     */
    permissions?: string;
    /**
     * When the user started boosting the guild
     */
    premium_since?: Iso8601Timestamp | null;
    /**
     * Array of role object ids
     */
    roles: Snowflake[];
    /**
     * The user this guild member represents
     */
    user?: UserStructure;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-widget-object-guild-widget-structure|Guild Widget Structure}
 */
export type GuildWidgetStructure = {
    /**
     * Voice and stage channels which are accessible by everyone
     */
    channels: Pick<ChannelStructure, "id" | "name" | "position">[];
    /**
     * The guild id
     */
    id: Snowflake;
    /**
     * The instant invite for the guild's widget invite channel
     */
    instant_invite: string | null;
    /**
     * Special widget user objects that includes users presence (Limit 100)
     */
    members: Pick<UserStructure, "discriminator" | "id" | "username">[];
    /**
     * The guild name
     */
    name: string;
    /**
     * The number of online members in this guild
     */
    presence_count: Integer;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-widget-settings-object-guild-widget-settings-structure|Guild Widget Settings Structure}
 */
export type GuildWidgetSettingsStructure = {
    /**
     * The widget channel id
     */
    channel_id: Snowflake | null;
    /**
     * Whether the widget is enabled
     */
    enabled: boolean;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-guild-features|Guild Features}
 */
export enum GuildFeatures {
    /**
     * Guild has access to set an animated guild banner image
     */
    AnimatedBanner = "ANIMATED_BANNER",
    /**
     * Guild has access to set an animated guild icon
     */
    AnimatedIcon = "ANIMATED_ICON",
    /**
     * Guild is using the old permissions configuration behavior
     */
    ApplicationCommandPermissionsV2 = "APPLICATION_COMMAND_PERMISSIONS_V2",
    /**
     * Guild has set up auto moderation rules
     */
    AutoModeration = "AUTO_MODERATION",
    /**
     * Guild has access to set a guild banner image
     */
    Banner = "BANNER",
    /**
     * Guild can enable welcome screen, Membership Screening, stage channels and discovery, and receives community updates
     */
    Community = "COMMUNITY",
    /**
     * Guild has enabled monetization
     */
    CreatorMonetizableProvisional = "CREATOR_MONETIZABLE_PROVISIONAL",
    /**
     * Guild has enabled the role subscription promo page
     */
    CreatorStorePage = "CREATOR_STORE_PAGE",
    /**
     * Guild has been set as a support server on the App Directory
     */
    DeveloperSupportServer = "DEVELOPER_SUPPORT_SERVER",
    /**
     * Guild is able to be discovered in the directory
     */
    Discoverable = "DISCOVERABLE",
    /**
     * Guild is able to be featured in the directory
     */
    Featurable = "FEATURABLE",
    /**
     * Guild has access to set an invite splash background
     */
    InviteSplash = "INVITE_SPLASH",
    /**
     * Guild has paused invites, preventing new users from joining
     */
    InvitesDisabled = "INVITES_DISABLED",
    /**
     * Guild has enabled Membership Screening
     */
    MemberVerificationGateEnabled = "MEMBER_VERIFICATION_GATE_ENABLED",
    /**
     * Guild has increased custom sticker slots
     */
    MoreStickers = "MORE_STICKERS",
    /**
     * Guild has access to create announcement channels
     */
    News = "NEWS",
    /**
     * Guild is partnered
     */
    Partnered = "PARTNERED",
    /**
     * Guild can be previewed before joining via Membership Screening or the directory
     */
    PreviewEnabled = "PREVIEW_ENABLED",
    /**
     * Guild has disabled alerts for join raids in the configured safety alerts channel
     */
    RaidAlertsDisabled = "RAID_ALERTS_DISABLED",
    /**
     * Guild is able to set role icons
     */
    RoleIcons = "ROLE_ICONS",
    /**
     * Guild has role subscriptions that can be purchased
     */
    RoleSubscriptionsAvailableForPurchase = "ROLE_SUBSCRIPTIONS_AVAILABLE_FOR_PURCHASE",
    /**
     * Guild has enabled role subscriptions
     */
    RoleSubscriptionsEnabled = "ROLE_SUBSCRIPTIONS_ENABLED",
    /**
     * Guild has enabled ticketed events
     */
    TicketedEventsEnabled = "TICKETED_EVENTS_ENABLED",
    /**
     * Guild has access to set a vanity URL
     */
    VanityUrl = "VANITY_URL",
    /**
     * Guild is verified
     */
    Verified = "VERIFIED",
    /**
     * Guild has access to set 384kbps bitrate in voice (previously VIP voice servers)
     */
    VipRegions = "VIP_REGIONS",
    /**
     * Guild has enabled the welcome screen
     */
    WelcomeScreenEnabled = "WELCOME_SCREEN_ENABLED",
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-preview-object-guild-preview-structure|Guild Preview Structure}
 */
export type GuildPreviewStructure = {
    /**
     * Approximate number of members in this guild
     */
    approximate_member_count: Integer;
    /**
     * Approximate number of online members in this guild
     */
    approximate_presence_count: Integer;
    /**
     * The description for the guild
     */
    description: string | null;
    /**
     * Discovery splash hash
     */
    discovery_splash: string | null;
    /**
     * Custom guild emojis
     */
    emojis: EmojiStructure[];
    /**
     * Enabled guild features
     */
    features: GuildFeatures[];
    /**
     * Icon hash
     */
    icon: string | null;
    /**
     * Guild id
     */
    id: Snowflake;
    /**
     * Guild name (2-100 characters)
     */
    name: string;
    /**
     * Splash hash
     */
    splash: string | null;
    /**
     * Custom guild stickers
     */
    stickers: StickerStructure[];
};

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#unavailable-guild-object-example-unavailable-guild|Unavailable Guild Object}
 */
export type UnavailableGuildObject = {
    /**
     * The id of the guild
     */
    id: Snowflake;
    /**
     * Whether the guild is unavailable
     */
    unavailable: boolean;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-mutable-guild-features|Mutable Guild Features}
 */
export type MutableGuildFeatures = {
    [GuildFeatures.Community]: BitwisePermissions.Administrator;
    [GuildFeatures.Discoverable]: BitwisePermissions.Administrator;
    [GuildFeatures.InvitesDisabled]: BitwisePermissions.ManageGuild;
    [GuildFeatures.RaidAlertsDisabled]: BitwisePermissions.ManageGuild;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-system-channel-flags|System Channel Flags}
 */
export enum SystemChannelFlags {
    /**
     * Suppress member join notifications
     */
    SuppressJoinNotifications = 1,
    /**
     * Suppress server boost notifications
     */
    SuppressPremiumSubscriptions = 2,
    /**
     * Suppress server setup tips
     */
    SuppressGuildReminderNotifications = 4,
    /**
     * Hide member join sticker reply buttons
     */
    SuppressJoinNotificationReplies = 8,
    /**
     * Suppress role subscription purchase and renewal notifications
     */
    SuppressRoleSubscriptionPurchaseNotifications = 16,
    /**
     * Hide role subscription sticker reply buttons
     */
    SuppressRoleSubscriptionPurchaseNotificationReplies = 32,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-premium-tier|Premium Tier}
 */
export enum PremiumTier {
    /**
     * Guild has not unlocked any Server Boost perks
     */
    None = 0,
    /**
     * Guild has unlocked Server Boost level 1 perks
     */
    Tier1 = 1,
    /**
     * Guild has unlocked Server Boost level 2 perks
     */
    Tier2 = 2,
    /**
     * Guild has unlocked Server Boost level 3 perks
     */
    Tier3 = 3,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-guild-nsfw-level|Guild NSFW Level}
 */
export enum GuildNsfwLevel {
    Default = 0,
    Explicit = 1,
    Safe = 2,
    AgeRestricted = 3,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-verification-level|Guild Verification Level}
 */
export enum GuildVerificationLevel {
    /**
     * Unrestricted
     */
    None = 0,
    /**
     * Must have verified email on account
     */
    Low = 1,
    /**
     * Must be registered on Discord for longer than 5 minutes
     */
    Medium = 2,
    /**
     * Must be a member of the server for longer than 10 minutes
     */
    High = 3,
    /**
     * Must have a verified phone number
     */
    VeryHigh = 4,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-mfa-level|Guild MFA Level}
 */
export enum GuildMfaLevel {
    /**
     * Guild has no MFA/2FA requirement for moderation actions
     */
    None = 0,
    /**
     * Guild has a 2FA requirement for moderation actions
     */
    Elevated = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-explicit-content-filter-level|Guild Explicit Content Filter Level}
 */
export enum GuildExplicitContentFilterLevel {
    /**
     * Media content will not be scanned
     */
    Disabled = 0,
    /**
     * Media content sent by members without roles will be scanned
     */
    MembersWithoutRoles = 1,
    /**
     * Media content sent by all members will be scanned
     */
    AllMembers = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-default-message-notification-level|Guild Default Message Notification Level}
 */
export enum GuildDefaultMessageNotificationLevel {
    /**
     * Members will receive notifications for all messages by default
     */
    AllMessages = 0,
    /**
     * Members will receive notifications only for messages that @mention them by default
     */
    OnlyMentions = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-guild-structure|Guild Structure}
 */
export type GuildStructure = {
    /**
     * The id of the afk channel
     */
    afk_channel_id: Snowflake | null;
    /**
     * The afk timeout in seconds
     */
    afk_timeout: Integer;
    /**
     * Application id of the guild creator if it is bot-created
     */
    application_id: Snowflake | null;
    /**
     * Approximate number of members in this guild, returned from the GET /guilds/<id> and /users/@me/guilds endpoints when with_counts is true
     */
    approximate_member_count?: Integer;
    /**
     * Approximate number of non-offline members in this guild, returned from the GET /guilds/<id> and /users/@me/guilds endpoints when with_counts is true
     */
    approximate_presence_count?: Integer;
    /**
     * Banner hash
     */
    banner: string | null;
    /**
     * Default message notifications level
     */
    default_message_notifications: GuildDefaultMessageNotificationLevel;
    /**
     * The description of a guild
     */
    description: string | null;
    /**
     * The hash of the guild discovery splash; only present for guilds with the "DISCOVERABLE" feature
     */
    discovery_splash: string | null;
    /**
     * Custom guild emojis
     */
    emojis: EmojiStructure[];
    /**
     * Explicit content filter level
     */
    explicit_content_filter: GuildExplicitContentFilterLevel;
    /**
     * Enabled guild features
     */
    features: GuildFeatures[];
    /**
     * The hash of the guild icon
     */
    icon: string | null;
    /**
     * The hash of the guild icon, returned when in the template object
     */
    icon_hash?: string | null;
    /**
     * The guild's id
     */
    id: Snowflake;
    /**
     * The maximum number of members for the guild
     */
    max_members: Integer;
    /**
     * The maximum number of presences for the guild (null is always returned, apart from the largest of guilds)
     */
    max_presences?: Integer | null;
    /**
     * The maximum amount of users in a stage video channel
     */
    max_stage_video_channel_users?: Integer;
    /**
     * The maximum amount of users in a video channel
     */
    max_video_channel_users?: Integer;
    /**
     * Required MFA level for the guild
     */
    mfa_level: GuildMfaLevel;
    /**
     * The guild's name
     */
    name: string;
    /**
     * Guild NSFW level
     */
    nsfw_level: GuildNsfwLevel;
    /**
     * Whether the user is the owner of the guild
     */
    owner?: boolean;
    /**
     * The id of the owner
     */
    owner_id: Snowflake;
    /**
     * Total permissions for the user in the guild (excludes overwrites and implicit permissions)
     */
    permissions?: string;
    /**
     * The preferred locale of a Community guild; used in server discovery and notices from Discord, and sent in interactions; defaults to "en-US"
     */
    preferred_locale: LocaleKeys;
    /**
     * Whether the guild has the boost progress bar enabled
     */
    premium_progress_bar_enabled: boolean;
    /**
     * The number of boosts this guild currently has
     */
    premium_subscription_count?: Integer;
    /**
     * Premium tier (Server Boost level)
     */
    premium_tier: PremiumTier;
    /**
     * The id of the channel where admins and moderators of Community guilds receive notices from Discord
     */
    public_updates_channel_id: Snowflake | null;
    /**
     * Voice region id for the guild (deprecated)
     *
     * @deprecated This field is deprecated and will be removed in a future API version
     */
    region?: string;
    /**
     * Roles in the guild
     */
    roles: RoleStructure[];
    /**
     * The id of the channel where Community guilds can display rules and/or guidelines
     */
    rules_channel_id: Snowflake | null;
    /**
     * The id of the channel where admins and moderators of Community guilds receive safety alerts from Discord
     */
    safety_alerts_channel_id: Snowflake | null;
    /**
     * The hash of the guild splash
     */
    splash: string | null;
    /**
     * Custom guild stickers
     */
    stickers?: StickerStructure[];
    /**
     * System channel flags
     */
    system_channel_flags: SystemChannelFlags;
    /**
     * The id of the channel where guild notices such as welcome messages and boost events are posted
     */
    system_channel_id: Snowflake | null;
    /**
     * The vanity url code for the guild
     */
    vanity_url_code: string | null;
    /**
     * Verification level required for the guild
     */
    verification_level: GuildVerificationLevel;
    /**
     * The welcome screen of a Community guild, shown to new members, returned in an Invite's guild object
     */
    welcome_screen?: WelcomeScreenStructure;
    /**
     * The channel id that the widget will generate an invite to, or null if set to no invite
     */
    widget_channel_id?: Snowflake | null;
    /**
     * Whether the server widget is enabled
     */
    widget_enabled?: boolean;
};
