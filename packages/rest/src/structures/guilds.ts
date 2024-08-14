import type { Integer, IsoO8601Timestamp, Locales, Oauth2Scopes, Snowflake } from "@nyxjs/core";
import type { ChannelStructure } from "./channels";
import type { EmojiStructure } from "./emojis";
import type { RoleStructure } from "./roles";
import type { StickerStructure } from "./stickers";
import type { AvatarDecorationDataStructure, UserStructure } from "./users";

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-prompt-types}
 */
export enum PromptTypes {
	MultipleChoice = 0,
	Dropdown = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-onboarding-mode}
 */
export enum OnboardingMode {
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
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-prompt-option-structure}
 */
export type PromptOptionStructure = {
	/**
	 * IDs for channels a member is added to when the option is selected
	 */
	channel_ids: Snowflake[];
	/**
	 * Description of the option
	 */
	description: string | null;
	/**
	 * Emoji of the option
	 *
	 * @deprecated When creating or updating a prompt option, the emoji_id, emoji_name, and emoji_animated fields must be used instead of the emoji object.
	 */
	emoji?: EmojiStructure;
	/**
	 * Whether the emoji is animated
	 */
	emoji_animated?: boolean;
	/**
	 * Emoji ID of the option
	 */
	emoji_id?: Snowflake;
	/**
	 * Emoji name of the option
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
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-onboarding-prompt-structure}
 */
export type OnboardingPromptStructure = {
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
	options: PromptOptionStructure[];
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
	type: PromptTypes;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-onboarding-object-guild-onboarding-structure}
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
	mode: OnboardingMode;
	/**
	 * Prompts shown during onboarding and in customize community
	 */
	prompts: OnboardingPromptStructure[];
};

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#welcome-screen-object-welcome-screen-channel-structure}
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
 * @see {@link https://discord.com/developers/docs/resources/guild#welcome-screen-object-welcome-screen-structure}
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
 * @see {@link https://discord.com/developers/docs/resources/guild#ban-object-ban-structure}
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
 * @see {@link https://discord.com/developers/docs/resources/guild#integration-application-object-integration-application-structure}
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
 * @see {@link https://discord.com/developers/docs/resources/guild#integration-account-object-integration-account-structure}
 */
export type IntegrationAccountStructure = {
	/**
	 * ID of the account
	 */
	id: string;
	/**
	 * Name of the account
	 */
	name: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#integration-object-integration-expire-behaviors}
 */
export enum IntegrationExpireBehaviors {
	RemoveRole = 0,
	Kick = 1,
}

type IntegrationTypes = "discord" | "guild_subscription" | "twitch" | "youtube";

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#integration-object-integration-structure}
 */
export type IntegrationStructure = {
	/**
	 * Integration account information
	 */
	account: IntegrationAccountStructure;
	/**
	 * The bot/OAuth2 application for discord integrations
	 */
	application?: IntegrationApplicationStructure;
	/**
	 * Whether emoticons should be synced for this integration (twitch only currently)
	 */
	enable_emoticons?: boolean;
	/**
	 * Is this integration enabled
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
	 * Integration ID
	 */
	id: Snowflake;
	/**
	 * Integration name
	 */
	name: string;
	/**
	 * Has this integration been revoked
	 */
	revoked?: boolean;
	/**
	 * ID that this integration uses for "subscribers"
	 */
	role_id?: Snowflake;
	/**
	 * The scopes the application has been authorized for
	 */
	scopes?: Oauth2Scopes[];
	/**
	 * How many subscribers this integration has
	 */
	subscriber_count?: Integer;
	/**
	 * When this integration was last synced
	 */
	synced_at?: IsoO8601Timestamp;
	/**
	 * Is this integration syncing
	 */
	syncing?: boolean;
	/**
	 * Integration type
	 */
	type: IntegrationTypes;
	/**
	 * User for this integration
	 */
	user?: UserStructure;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-member-object-guild-member-flags}
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
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-member-object-guild-member-structure}
 */
export type GuildMemberStructure = {
	/**
	 * The member's guild avatar hash
	 */
	avatar?: string | null;
	/**
	 * Data for the member's guild avatar decoration
	 */
	avatar_decoration_data?: AvatarDecorationDataStructure;
	/**
	 * When the user's timeout will expire and the user will be able to communicate in the guild again, null or a time in the past if the user is not timed out
	 */
	communication_disabled_until?: IsoO8601Timestamp | null;
	/**
	 * Whether the user is deafened in voice channels
	 */
	deaf: boolean;
	/**
	 * Guild member flags represented as a bit set, defaults to 0
	 */
	flags: GuildMemberFlags;
	/**
	 * When the user joined the guild
	 */
	joined_at: IsoO8601Timestamp;
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
	premium_since?: IsoO8601Timestamp | null;
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
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-widget-object-guild-widget-structure}
 */
export type GuildWidgetStructure = {
	/**
	 * Voice and stage channels which are accessible by @everyone
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
	members: Pick<UserStructure & {
		avatar_url: string;
		status: string;
	}, "avatar_url" | "avatar" | "discriminator" | "id" | "status" | "username">[];
	/**
	 * The guild name
	 */
	name: string;
	/**
	 * Number of online members in this guild
	 */
	presence_count: Integer;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-widget-settings-object-guild-widget-settings-structure}
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
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-preview-object-guild-preview-structure}
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
	features: string[];
	/**
	 * Icon hash
	 */
	icon: string | null;
	/**
	 * Guild ID
	 */
	id: Snowflake;
	/**
	 * Guild name
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
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-guild-features}
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
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-system-channel-flags}
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
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-premium-tier}
 */
export enum PremiumTiers {
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
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-guild-nsfw-level}
 */
export enum NsfwLevels {
	Default = 0,
	Explicit = 1,
	Safe = 2,
	AgeRestricted = 3,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-verification-level}
 */
export enum VerificationLevels {
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
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-mfa-level}
 */
export enum MfaLevels {
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
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-explicit-content-filter-level}
 */
export enum ExplicitContentFilterLevels {
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
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-default-message-notification-level}
 */
export enum DefaultMessageNotificationLevels {
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
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object-guild-structure}
 */
export type GuildStructure = {
	/**
	 * Id of afk channel
	 */
	afk_channel_id: Snowflake | null;
	/**
	 * Afk timeout in seconds
	 */
	afk_timeout: Integer;
	/**
	 * Application id of the guild creator if it is bot-created
	 */
	application_id?: Snowflake;
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
	default_message_notifications: DefaultMessageNotificationLevels;
	/**
	 * The description of a guild
	 */
	description: string | null;
	/**
	 * Discovery splash hash; only present for guilds with the "DISCOVERABLE" feature
	 */
	discovery_splash: string | null;
	/**
	 * Custom guild emojis
	 */
	emojis: EmojiStructure[];
	/**
	 * Explicit content filter level
	 */
	explicit_content_filter: ExplicitContentFilterLevels;
	/**
	 * Enabled guild features
	 */
	features: GuildFeatures[];
	/**
	 * Icon hash
	 */
	icon: string | null;
	/**
	 * Icon hash, returned when in the template object
	 */
	icon_hash?: string | null;
	/**
	 * Guild id
	 */
	id: Snowflake;
	/**
	 * The maximum number of members for the guild
	 */
	max_members: Integer;
	/**
	 * The maximum number of presences for the guild (null is always returned, apart from the largest of guilds)
	 */
	max_presences?: Integer;
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
	mfa_level: MfaLevels;
	/**
	 * Guild name
	 */
	name: string;
	/**
	 * Guild NSFW level
	 */
	nsfw_level: NsfwLevels;
	/**
	 * True if the user is the owner of the guild
	 */
	owner?: boolean;
	/**
	 * Id of owner
	 */
	owner_id: Snowflake;
	/**
	 * Total permissions for the user in the guild (excludes overwrites and implicit permissions)
	 */
	permissions?: string;
	/**
	 * The preferred locale of a Community guild; used in server discovery and notices from Discord, and sent in interactions; defaults to "en-US"
	 */
	preferred_locale: Locales;
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
	premium_tier: PremiumTiers;
	/**
	 * The id of the channel where admins and moderators of Community guilds receive notices from Discord
	 */
	public_updates_channel_id: Snowflake | null;
	/**
	 * Voice region id for the guild (deprecated)
	 *
	 * @deprecated Voice region id for the guild (deprecated)
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
	 * Splash hash
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
	verification_level: VerificationLevels;
	/**
	 * The welcome screen of a Community guild, shown to new members, returned in an Invite's guild object
	 */
	welcome_screen?: WelcomeScreenStructure;
	/**
	 * The channel id that the widget will generate an invite to, or null if set to no invite
	 */
	widget_channel_id?: Snowflake;
	/**
	 * True if the server widget is enabled
	 */
	widget_enabled?: boolean;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-month}
 */
export enum RecurrenceRuleMonths {
	January = 1,
	February = 2,
	March = 3,
	April = 4,
	May = 5,
	June = 6,
	July = 7,
	August = 8,
	September = 9,
	October = 10,
	November = 11,
	December = 12,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-weekday}
 */
export enum RecurrenceRuleWeekdays {
	Monday = 0,
	Tuesday = 1,
	Wednesday = 2,
	Thursday = 3,
	Friday = 4,
	Saturday = 5,
	Sunday = 6,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-nweekday-structure}
 */
export type RecurrenceRuleNweekdayStructure = {
	/**
	 * The day within the week to reoccur on
	 */
	day: RecurrenceRuleWeekdays;
	/**
	 * The week to reoccur on. 1 - 5
	 */
	n: Integer;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-frequency}
 */
export enum RecurrenceRuleFrequencies {
	Yearly = 0,
	Monthly = 1,
	Weekly = 2,
	Daily = 3,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-recurrence-rule-object-guild-scheduled-event-recurrence-rule-structure}
 */
export type RecurrenceRuleStructure = {
	/**
	 * Set of specific months to recur on
	 */
	by_month: RecurrenceRuleMonths[] | null;
	/**
	 * Set of specific dates within a month to recur on
	 */
	by_month_day: Integer[] | null;
	/**
	 * List of specific days within a specific week (1-5) to recur on
	 */
	by_n_weekday: RecurrenceRuleNweekdayStructure[] | null;
	/**
	 * Set of specific days within a week for the event to recur on
	 */
	by_weekday: RecurrenceRuleWeekdays[] | null;
	/**
	 * Set of days within a year to recur on (1-364)
	 */
	by_year_day: Integer[] | null;
	/**
	 * The total amount of times that the event is allowed to recur before stopping
	 */
	count: Integer | null;
	/**
	 * Ending time of the recurrence interval
	 */
	end?: IsoO8601Timestamp;
	/**
	 * How often the event occurs
	 */
	frequency: RecurrenceRuleFrequencies;
	/**
	 * The spacing between the events, defined by frequency. For example, frecency of WEEKLY and an interval of 2 would be "every-other week"
	 */
	interval: Integer;
	/**
	 * Starting time of the recurrence interval
	 */
	start: IsoO8601Timestamp;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-user-object-guild-scheduled-event-user-structure}
 */
export type GuildScheduledEventUserStructure = {
	/**
	 * The scheduled event id which the user subscribed to
	 */
	guild_scheduled_event_id: Snowflake;
	/**
	 * Guild member data for this user for the guild which this event belongs to, if any
	 */
	member?: GuildMemberStructure;
	/**
	 * User which subscribed to an event
	 */
	user: UserStructure;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-entity-metadata}
 */
export type GuildScheduledEventEntityMetadata = {
	/**
	 * Location of the event (1-100 characters)
	 */
	location?: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-status}
 */
export enum GuildScheduledEventStatus {
	Scheduled = 1,
	Active = 2,
	Completed = 3,
	Canceled = 4,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-entity-types}
 */
export enum GuildScheduledEventEntityTypes {
	StageInstance = 1,
	Voice = 2,
	External = 3,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-privacy-level}
 */
export enum GuildScheduledEventPrivacyLevels {
	/**
	 * The scheduled event is visible publicly
	 */
	GuildOnly = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-structure}
 */
export type GuildScheduledEventStructure = {
	/**
	 * The channel id in which the scheduled event will be hosted, or null if scheduled entity type is EXTERNAL
	 */
	channel_id: Snowflake | null;
	/**
	 * The user that created the scheduled event
	 */
	creator?: UserStructure;
	/**
	 * The id of the user that created the scheduled event
	 */
	creator_id?: Snowflake;
	/**
	 * The description of the scheduled event (1-1000 characters)
	 */
	description?: string | null;
	/**
	 * The id of an entity associated with a guild scheduled event
	 */
	entity_id: Snowflake | null;
	/**
	 * Additional metadata for the guild scheduled event
	 */
	entity_metadata?: GuildScheduledEventEntityMetadata;
	/**
	 * The type of the scheduled event
	 */
	entity_type: GuildScheduledEventEntityTypes;
	/**
	 * The guild id which the scheduled event belongs to
	 */
	guild_id: Snowflake;
	/**
	 * The id of the scheduled event
	 */
	id: Snowflake;
	/**
	 * The cover image hash of the scheduled event
	 */
	image?: string | null;
	/**
	 * The name of the scheduled event (1-100 characters)
	 */
	name: string;
	/**
	 * The privacy level of the scheduled event
	 */
	privacy_level: GuildScheduledEventPrivacyLevels;
	/**
	 * The definition for how often this event should recur
	 */
	recurrence_rule: RecurrenceRuleStructure | null;
	/**
	 * The time the scheduled event will end, required if entity_type is EXTERNAL
	 */
	scheduled_end_time: IsoO8601Timestamp | null;
	/**
	 * The time the scheduled event will start
	 */
	scheduled_start_time: IsoO8601Timestamp;
	/**
	 * The status of the scheduled event
	 */
	status: GuildScheduledEventStatus;
	/**
	 * The number of users subscribed to the scheduled event
	 */
	user_count?: Integer;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-template#guild-template-object-guild-template-structure}
 */
export type GuildTemplateStructure = {
	/**
	 * The template code (unique ID)
	 */
	code: string;
	/**
	 * When this template was created
	 */
	created_at: IsoO8601Timestamp;
	/**
	 * The user who created the template
	 */
	creator: UserStructure;
	/**
	 * The ID of the user who created the template
	 */
	creator_id: Snowflake;
	/**
	 * The description for the template
	 */
	description: string | null;
	/**
	 * Whether the template has unsynced changes
	 */
	is_dirty: boolean | null;
	/**
	 * Template name
	 */
	name: string;
	/**
	 * The guild snapshot this template contains
	 */
	serialized_source_guild: Pick<GuildStructure, "afk_channel_id" | "afk_timeout" | "default_message_notifications" | "description" | "explicit_content_filter" | "icon_hash" | "name" | "preferred_locale" | "region" | "roles" | "system_channel_flags" | "system_channel_id" | "verification_level">;
	/**
	 * The ID of the guild this template is based on
	 */
	source_guild_id: Snowflake;
	/**
	 * When this template was last synced to the source guild
	 */
	updated_at: IsoO8601Timestamp;
	/**
	 * Number of times this template has been used
	 */
	usage_count: Integer;
};
