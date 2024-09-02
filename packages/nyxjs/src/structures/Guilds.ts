import type {
	Integer,
	IsoO8601Timestamp,
	Locales,
	Oauth2Scopes,
	Snowflake,
} from "@nyxjs/core";
import type {
	AvatarDecorationDataStructure,
	BanStructure,
	DefaultMessageNotificationLevels,
	ExplicitContentFilterLevels,
	GuildFeatures,
	GuildMemberFlags,
	GuildMemberStructure,
	GuildOnboardingStructure,
	GuildPreviewStructure,
	GuildScheduledEventEntityMetadataStructure,
	GuildScheduledEventEntityTypes,
	GuildScheduledEventPrivacyLevels,
	GuildScheduledEventStatus,
	GuildScheduledEventStructure,
	GuildScheduledEventUserStructure,
	GuildStructure,
	GuildTemplateStructure,
	GuildWidgetSettingsStructure,
	GuildWidgetStructure,
	IntegrationAccountStructure,
	IntegrationApplicationStructure,
	IntegrationExpireBehaviors,
	IntegrationPlatformTypes,
	IntegrationStructure,
	MfaLevels,
	NsfwLevels,
	OnboardingMode,
	OnboardingPromptStructure,
	PremiumTiers,
	PromptOptionStructure,
	PromptTypes,
	RecurrenceRuleFrequencies,
	RecurrenceRuleMonths,
	RecurrenceRuleNweekdayStructure,
	RecurrenceRuleStructure,
	RecurrenceRuleWeekdays,
	SystemChannelFlags,
	UnavailableGuildStructure,
	VerificationLevels,
	WelcomeScreenChannelStructure,
	WelcomeScreenStructure,
} from "@nyxjs/rest";
import { Base } from "./Base";
import { Emoji } from "./Emojis";
import { Role } from "./Roles";
import { Sticker } from "./Stickers";
import { User } from "./Users";

export class PromptOption extends Base<PromptOptionStructure> {
	public channelIds!: Snowflake[];

	public description!: string | null;

	public emoji?: Pick<Emoji, "id" | "animated" | "name" | "toJSON">;

	public id!: Snowflake;

	public roleIds!: Snowflake[];

	public title!: string;

	public constructor(data: Partial<PromptOptionStructure>) {
		super(data);
	}

	public toJSON(): PromptOptionStructure {
		return {
			channel_ids: this.channelIds,
			description: this.description,
			emoji: this.emoji?.toJSON(),
			id: this.id,
			role_ids: this.roleIds,
			title: this.title,
		};
	}

	protected patch(data: Partial<PromptOptionStructure>): void {
		if (data.channel_ids !== undefined) {
			this.channelIds = data.channel_ids;
		}

		if (data.description !== undefined) {
			this.description = data.description;
		}

		if (data.emoji !== undefined) {
			this.emoji = Emoji.from(data.emoji);
		}

		if (data.id !== undefined) {
			this.id = data.id;
		}

		if (data.role_ids !== undefined) {
			this.roleIds = data.role_ids;
		}

		if (data.title !== undefined) {
			this.title = data.title;
		}
	}
}

export class OnboardingPrompt extends Base<OnboardingPromptStructure> {
	public id!: Snowflake;

	public inOnboarding!: boolean;

	public options!: PromptOption[];

	public required!: boolean;

	public singleSelect!: boolean;

	public title!: string;

	public type!: PromptTypes;

	public constructor(data: Partial<OnboardingPromptStructure>) {
		super(data);
	}

	public toJSON(): OnboardingPromptStructure {
		return {
			id: this.id,
			in_onboarding: this.inOnboarding,
			options: this.options.map((option) => option.toJSON()),
			required: this.required,
			single_select: this.singleSelect,
			title: this.title,
			type: this.type,
		};
	}

	protected patch(data: Partial<OnboardingPromptStructure>): void {
		if (data.id !== undefined) {
			this.id = data.id;
		}

		if (data.in_onboarding !== undefined) {
			this.inOnboarding = data.in_onboarding;
		}

		if (data.options !== undefined) {
			this.options = data.options.map((option) => new PromptOption(option));
		}

		if (data.required !== undefined) {
			this.required = data.required;
		}

		if (data.single_select !== undefined) {
			this.singleSelect = data.single_select;
		}

		if (data.title !== undefined) {
			this.title = data.title;
		}

		if (data.type !== undefined) {
			this.type = data.type;
		}
	}
}

export class GuildOnboarding extends Base<GuildOnboardingStructure> {
	public defaultChannelIds!: Snowflake[];

	public enabled!: boolean;

	public guildId!: Snowflake;

	public mode!: OnboardingMode;

	public prompts!: OnboardingPrompt[];

	public constructor(data: Partial<GuildOnboardingStructure>) {
		super(data);
	}

	public toJSON(): GuildOnboardingStructure {
		return {
			default_channel_ids: this.defaultChannelIds,
			enabled: this.enabled,
			guild_id: this.guildId,
			mode: this.mode,
			prompts: this.prompts.map((prompt) => prompt.toJSON()),
		};
	}

	protected patch(data: Partial<GuildOnboardingStructure>): void {
		if (data.default_channel_ids !== undefined) {
			this.defaultChannelIds = data.default_channel_ids;
		}

		if (data.enabled !== undefined) {
			this.enabled = data.enabled;
		}

		if (data.guild_id !== undefined) {
			this.guildId = data.guild_id;
		}

		if (data.mode !== undefined) {
			this.mode = data.mode;
		}

		if (data.prompts !== undefined) {
			this.prompts = data.prompts.map((prompt) => new OnboardingPrompt(prompt));
		}
	}
}

export class WelcomeScreenChannel extends Base<WelcomeScreenChannelStructure> {
	public channelId!: Snowflake;

	public description!: string;

	public emojiId!: Snowflake | null;

	public emojiName!: string | null;

	public constructor(data: Partial<WelcomeScreenChannelStructure>) {
		super(data);
	}

	public toJSON(): WelcomeScreenChannelStructure {
		return {
			channel_id: this.channelId,
			description: this.description,
			emoji_id: this.emojiId,
			emoji_name: this.emojiName,
		};
	}

	protected patch(data: Partial<WelcomeScreenChannelStructure>): void {
		if (data.channel_id !== undefined) {
			this.channelId = data.channel_id;
		}

		if (data.description !== undefined) {
			this.description = data.description;
		}

		if (data.emoji_id !== undefined) {
			this.emojiId = data.emoji_id;
		}

		if (data.emoji_name !== undefined) {
			this.emojiName = data.emoji_name;
		}
	}
}

export class WelcomeScreen extends Base<WelcomeScreenStructure> {
	public description!: string | null;

	public welcomeChannels!: WelcomeScreenChannel[];

	public constructor(data: Partial<WelcomeScreenStructure>) {
		super(data);
	}

	public toJSON(): WelcomeScreenStructure {
		return {
			description: this.description,
			welcome_channels: this.welcomeChannels.map((channel) => channel.toJSON()),
		};
	}

	protected patch(data: Partial<WelcomeScreenStructure>): void {
		if (data.description !== undefined) {
			this.description = data.description;
		}

		if (data.welcome_channels !== undefined) {
			this.welcomeChannels = data.welcome_channels.map((channel) =>
				WelcomeScreenChannel.from(channel),
			);
		}
	}
}

export class Ban extends Base<BanStructure> {
	public reason!: string | null;

	public user!: User;

	public constructor(data: Partial<BanStructure>) {
		super(data);
	}

	public toJSON(): BanStructure {
		return {
			reason: this.reason,
			user: this.user.toJSON(),
		};
	}

	protected patch(data: Partial<BanStructure>): void {
		if (data.reason !== undefined) {
			this.reason = data.reason;
		}

		if (data.user !== undefined) {
			this.user = User.from(data.user);
		}
	}
}

export class IntegrationApplication extends Base<IntegrationApplicationStructure> {
	public bot?: User;

	public description!: string;

	public icon!: string | null;

	public id!: Snowflake;

	public name!: string;

	public constructor(data: Partial<IntegrationApplicationStructure>) {
		super(data);
	}

	public toJSON(): IntegrationApplicationStructure {
		return {
			bot: this.bot?.toJSON(),
			description: this.description,
			icon: this.icon,
			id: this.id,
			name: this.name,
		};
	}

	protected patch(data: Partial<IntegrationApplicationStructure>): void {
		if (data.bot !== undefined) {
			this.bot = User.from(data.bot);
		}

		if (data.description !== undefined) {
			this.description = data.description;
		}

		if (data.icon !== undefined) {
			this.icon = data.icon;
		}

		if (data.id !== undefined) {
			this.id = data.id;
		}

		if (data.name !== undefined) {
			this.name = data.name;
		}
	}
}

export class IntegrationAccount extends Base<IntegrationAccountStructure> {
	public id!: string;

	public name!: string;

	public constructor(data: Partial<IntegrationAccountStructure>) {
		super(data);
	}

	public toJSON(): IntegrationAccountStructure {
		return {
			id: this.id,
			name: this.name,
		};
	}

	protected patch(data: Partial<IntegrationAccountStructure>): void {
		if (data.id !== undefined) {
			this.id = data.id;
		}

		if (data.name !== undefined) {
			this.name = data.name;
		}
	}
}

export class Integration extends Base<IntegrationStructure> {
	public account!: IntegrationAccount;

	public application?: IntegrationApplication;

	public enableEmoticons?: boolean;

	public enabled!: boolean;

	public expireBehavior?: IntegrationExpireBehaviors;

	public expireGracePeriod?: Integer;

	public id!: Snowflake;

	public name!: string;

	public revoked?: boolean;

	public roleId?: Snowflake;

	public scopes?: Oauth2Scopes[];

	public subscriberCount?: Integer;

	public syncedAt?: IsoO8601Timestamp;

	public syncing?: boolean;

	public type!: IntegrationPlatformTypes;

	public user?: User;

	public constructor(data: Partial<IntegrationStructure>) {
		super(data);
	}

	public toJSON(): IntegrationStructure {
		return {
			account: this.account.toJSON(),
			application: this.application?.toJSON(),
			enable_emoticons: this.enableEmoticons,
			enabled: this.enabled,
			expire_behavior: this.expireBehavior,
			expire_grace_period: this.expireGracePeriod,
			id: this.id,
			name: this.name,
			revoked: this.revoked,
			role_id: this.roleId,
			scopes: this.scopes,
			subscriber_count: this.subscriberCount,
			synced_at: this.syncedAt,
			syncing: this.syncing,
			type: this.type,
			user: this.user?.toJSON(),
		};
	}

	protected patch(data: Partial<IntegrationStructure>): void {
		if (data.account !== undefined) {
			this.account = IntegrationAccount.from(data.account);
		}

		if (data.application !== undefined) {
			this.application = IntegrationApplication.from(data.application);
		}

		if (data.enable_emoticons !== undefined) {
			this.enableEmoticons = data.enable_emoticons;
		}

		if (data.enabled !== undefined) {
			this.enabled = data.enabled;
		}

		if (data.expire_behavior !== undefined) {
			this.expireBehavior = data.expire_behavior;
		}

		if (data.expire_grace_period !== undefined) {
			this.expireGracePeriod = data.expire_grace_period;
		}

		if (data.id !== undefined) {
			this.id = data.id;
		}

		if (data.name !== undefined) {
			this.name = data.name;
		}

		if (data.revoked !== undefined) {
			this.revoked = data.revoked;
		}

		if (data.role_id !== undefined) {
			this.roleId = data.role_id;
		}

		if (data.scopes !== undefined) {
			this.scopes = data.scopes;
		}

		if (data.subscriber_count !== undefined) {
			this.subscriberCount = data.subscriber_count;
		}

		if (data.synced_at !== undefined) {
			this.syncedAt = data.synced_at;
		}

		if (data.syncing !== undefined) {
			this.syncing = data.syncing;
		}

		if (data.type !== undefined) {
			this.type = data.type;
		}

		if (data.user !== undefined) {
			this.user = User.from(data.user);
		}
	}
}

export class GuildMember extends Base<GuildMemberStructure> {
	public avatar?: string | null;

	public avatarDecorationData?: AvatarDecorationDataStructure;

	public communicationDisabledUntil?: IsoO8601Timestamp | null;

	public deaf!: boolean;

	public flags!: GuildMemberFlags;

	public joinedAt!: IsoO8601Timestamp;

	public mute!: boolean;

	public nick?: string | null;

	public pending?: boolean;

	public permissions?: string;

	public premium_since?: IsoO8601Timestamp | null;

	public roles!: Snowflake[];

	public user?: User;

	public constructor(data: Partial<GuildMemberStructure>) {
		super(data);
	}

	public toJSON(): GuildMemberStructure {
		return {
			avatar: this.avatar,
			avatar_decoration_data: this.avatarDecorationData,
			communication_disabled_until: this.communicationDisabledUntil,
			deaf: this.deaf,
			flags: this.flags,
			joined_at: this.joinedAt,
			mute: this.mute,
			nick: this.nick,
			pending: this.pending,
			permissions: this.permissions,
			premium_since: this.premium_since,
			roles: this.roles,
			user: this.user?.toJSON(),
		};
	}

	protected patch(data: Partial<GuildMemberStructure>): void {
		if (data.avatar !== undefined) {
			this.avatar = data.avatar;
		}

		if (data.avatar_decoration_data !== undefined) {
			this.avatarDecorationData = data.avatar_decoration_data;
		}

		if (data.communication_disabled_until !== undefined) {
			this.communicationDisabledUntil = data.communication_disabled_until;
		}

		if (data.deaf !== undefined) {
			this.deaf = data.deaf;
		}

		if (data.flags !== undefined) {
			this.flags = data.flags;
		}

		if (data.joined_at !== undefined) {
			this.joinedAt = data.joined_at;
		}

		if (data.mute !== undefined) {
			this.mute = data.mute;
		}

		if (data.nick !== undefined) {
			this.nick = data.nick;
		}

		if (data.pending !== undefined) {
			this.pending = data.pending;
		}

		if (data.permissions !== undefined) {
			this.permissions = data.permissions;
		}

		if (data.premium_since !== undefined) {
			this.premium_since = data.premium_since;
		}

		if (data.roles !== undefined) {
			this.roles = data.roles;
		}

		if (data.user !== undefined) {
			this.user = User.from(data.user);
		}
	}
}

// TODO: Add missing properties
// @ts-ignore
export class GuildWidget extends Base<GuildWidgetStructure> {}

export class GuildWidgetSettings extends Base<GuildWidgetSettingsStructure> {
	public channelId!: Snowflake | null;

	public enabled!: boolean;

	public constructor(data: Partial<GuildWidgetSettingsStructure>) {
		super(data);
	}

	public toJSON(): GuildWidgetSettingsStructure {
		return {
			channel_id: this.channelId,
			enabled: this.enabled,
		};
	}

	protected patch(data: Partial<GuildWidgetSettingsStructure>): void {
		if (data.channel_id !== undefined) {
			this.channelId = data.channel_id;
		}

		if (data.enabled !== undefined) {
			this.enabled = data.enabled;
		}
	}
}

export class GuildPreview extends Base<GuildPreviewStructure> {
	public approximateMemberCount!: Integer;

	public approximatePresenceCount!: Integer;

	public description!: string | null;

	public discoverySplash!: string | null;

	public emojis!: Emoji[];

	public features!: string[];

	public icon!: string | null;

	public id!: Snowflake;

	public name!: string;

	public splash!: string | null;

	public stickers!: Sticker[];

	public constructor(data: Partial<GuildPreviewStructure>) {
		super(data);
	}

	public toJSON(): GuildPreviewStructure {
		return {
			approximate_member_count: this.approximateMemberCount,
			approximate_presence_count: this.approximatePresenceCount,
			description: this.description,
			discovery_splash: this.discoverySplash,
			emojis: this.emojis.map((emoji) => emoji.toJSON()),
			features: this.features,
			icon: this.icon,
			id: this.id,
			name: this.name,
			splash: this.splash,
			stickers: this.stickers.map((sticker) => sticker.toJSON()),
		};
	}

	protected patch(data: Partial<GuildPreviewStructure>): void {
		if (data.approximate_member_count !== undefined) {
			this.approximateMemberCount = data.approximate_member_count;
		}

		if (data.approximate_presence_count !== undefined) {
			this.approximatePresenceCount = data.approximate_presence_count;
		}

		if (data.description !== undefined) {
			this.description = data.description;
		}

		if (data.discovery_splash !== undefined) {
			this.discoverySplash = data.discovery_splash;
		}

		if (data.emojis !== undefined) {
			this.emojis = data.emojis.map((emoji) => Emoji.from(emoji));
		}

		if (data.features !== undefined) {
			this.features = data.features;
		}

		if (data.icon !== undefined) {
			this.icon = data.icon;
		}

		if (data.id !== undefined) {
			this.id = data.id;
		}

		if (data.name !== undefined) {
			this.name = data.name;
		}

		if (data.splash !== undefined) {
			this.splash = data.splash;
		}

		if (data.stickers !== undefined) {
			this.stickers = data.stickers.map((sticker) => Sticker.from(sticker));
		}
	}
}

export class UnavailableGuild extends Base<UnavailableGuildStructure> {
	public id!: Snowflake;

	public unavailable!: boolean;

	public constructor(data: Partial<UnavailableGuildStructure>) {
		super(data);
	}

	public toJSON(): UnavailableGuildStructure {
		return {
			id: this.id,
			unavailable: this.unavailable,
		};
	}

	protected patch(data: Partial<UnavailableGuildStructure>): void {
		if (data.id !== undefined) {
			this.id = data.id;
		}

		if (data.unavailable !== undefined) {
			this.unavailable = data.unavailable;
		}
	}
}

export class Guild extends Base<GuildStructure> {
	public afkChannelId!: Snowflake | null;

	public afkTimeout!: Integer;

	public applicationId?: Snowflake;

	public approximateMemberCount?: Integer;

	public approximatePresenceCount?: Integer;

	public banner!: string | null;

	public defaultMessageNotifications!: DefaultMessageNotificationLevels;

	public description!: string | null;

	public discoverySplash!: string | null;

	public emojis!: Emoji[];

	public explicitContentFilter!: ExplicitContentFilterLevels;

	public features!: GuildFeatures[];

	public icon!: string | null;

	public iconHash?: string | null;

	public id!: Snowflake;

	public maxMembers!: Integer;

	public maxPresences?: Integer;

	public maxStageVideoChannelUsers?: Integer;

	public maxVideoChannelUsers?: Integer;

	public mfaLevel!: MfaLevels;

	public name!: string;

	public nsfwLevel!: NsfwLevels;

	public owner?: boolean;

	public ownerId!: Snowflake;

	public permissions?: string;

	public preferredLocale!: Locales;

	public premiumProgressBarEnabled!: boolean;

	public premiumSubscriptionCount?: Integer;

	public premiumTier!: PremiumTiers;

	public publicUpdatesChannelId!: Snowflake | null;

	/**
	 * @deprecated Voice region id for the guild (deprecated)
	 */
	public region?: string;

	public roles!: Role[];

	public rulesChannelId!: Snowflake | null;

	public safetyAlertsChannelId!: Snowflake | null;

	public splash!: string | null;

	public stickers?: Sticker[];

	public systemChannelFlags!: SystemChannelFlags;

	public systemChannelId!: Snowflake | null;

	public vanityUrlCode!: string | null;

	public verificationLevel!: VerificationLevels;

	public welcomeScreen?: WelcomeScreen;

	public widgetChannelId?: Snowflake;

	public widgetEnabled?: boolean;

	public constructor(data: Partial<GuildStructure>) {
		super(data);
	}

	public toJSON(): GuildStructure {
		return {
			afk_channel_id: this.afkChannelId,
			afk_timeout: this.afkTimeout,
			application_id: this.applicationId,
			approximate_member_count: this.approximateMemberCount,
			approximate_presence_count: this.approximatePresenceCount,
			banner: this.banner,
			default_message_notifications: this.defaultMessageNotifications,
			description: this.description,
			discovery_splash: this.discoverySplash,
			emojis: this.emojis.map((emoji) => emoji.toJSON()),
			explicit_content_filter: this.explicitContentFilter,
			features: this.features,
			icon: this.icon,
			icon_hash: this.iconHash,
			id: this.id,
			max_members: this.maxMembers,
			max_presences: this.maxPresences,
			max_stage_video_channel_users: this.maxStageVideoChannelUsers,
			max_video_channel_users: this.maxVideoChannelUsers,
			mfa_level: this.mfaLevel,
			name: this.name,
			nsfw_level: this.nsfwLevel,
			owner: this.owner,
			owner_id: this.ownerId,
			permissions: this.permissions,
			preferred_locale: this.preferredLocale,
			premium_progress_bar_enabled: this.premiumProgressBarEnabled,
			premium_subscription_count: this.premiumSubscriptionCount,
			premium_tier: this.premiumTier,
			public_updates_channel_id: this.publicUpdatesChannelId,
			region: this.region,
			roles: this.roles.map((role) => role.toJSON()),
			rules_channel_id: this.rulesChannelId,
			safety_alerts_channel_id: this.safetyAlertsChannelId,
			splash: this.splash,
			stickers: this.stickers?.map((sticker) => sticker.toJSON()),
			system_channel_flags: this.systemChannelFlags,
			system_channel_id: this.systemChannelId,
			vanity_url_code: this.vanityUrlCode,
			verification_level: this.verificationLevel,
			welcome_screen: this.welcomeScreen?.toJSON(),
			widget_channel_id: this.widgetChannelId,
			widget_enabled: this.widgetEnabled,
		};
	}

	protected patch(data: Partial<GuildStructure>): void {
		if (data.afk_channel_id !== undefined) {
			this.afkChannelId = data.afk_channel_id;
		}

		if (data.afk_timeout !== undefined) {
			this.afkTimeout = data.afk_timeout;
		}

		if (data.application_id !== undefined) {
			this.applicationId = data.application_id;
		}

		if (data.approximate_member_count !== undefined) {
			this.approximateMemberCount = data.approximate_member_count;
		}

		if (data.approximate_presence_count !== undefined) {
			this.approximatePresenceCount = data.approximate_presence_count;
		}

		if (data.banner !== undefined) {
			this.banner = data.banner;
		}

		if (data.default_message_notifications !== undefined) {
			this.defaultMessageNotifications = data.default_message_notifications;
		}

		if (data.description !== undefined) {
			this.description = data.description;
		}

		if (data.discovery_splash !== undefined) {
			this.discoverySplash = data.discovery_splash;
		}

		if (data.emojis !== undefined) {
			this.emojis = data.emojis.map((emoji) => Emoji.from(emoji));
		}

		if (data.explicit_content_filter !== undefined) {
			this.explicitContentFilter = data.explicit_content_filter;
		}

		if (data.features !== undefined) {
			this.features = data.features;
		}

		if (data.icon !== undefined) {
			this.icon = data.icon;
		}

		if (data.icon_hash !== undefined) {
			this.iconHash = data.icon_hash;
		}

		if (data.id !== undefined) {
			this.id = data.id;
		}

		if (data.max_members !== undefined) {
			this.maxMembers = data.max_members;
		}

		if (data.max_presences !== undefined) {
			this.maxPresences = data.max_presences;
		}

		if (data.max_stage_video_channel_users !== undefined) {
			this.maxStageVideoChannelUsers = data.max_stage_video_channel_users;
		}

		if (data.max_video_channel_users !== undefined) {
			this.maxVideoChannelUsers = data.max_video_channel_users;
		}

		if (data.mfa_level !== undefined) {
			this.mfaLevel = data.mfa_level;
		}

		if (data.name !== undefined) {
			this.name = data.name;
		}

		if (data.nsfw_level !== undefined) {
			this.nsfwLevel = data.nsfw_level;
		}

		if (data.owner !== undefined) {
			this.owner = data.owner;
		}

		if (data.owner_id !== undefined) {
			this.ownerId = data.owner_id;
		}

		if (data.permissions !== undefined) {
			this.permissions = data.permissions;
		}

		if (data.preferred_locale !== undefined) {
			this.preferredLocale = data.preferred_locale;
		}

		if (data.premium_progress_bar_enabled !== undefined) {
			this.premiumProgressBarEnabled = data.premium_progress_bar_enabled;
		}

		if (data.premium_subscription_count !== undefined) {
			this.premiumSubscriptionCount = data.premium_subscription_count;
		}

		if (data.premium_tier !== undefined) {
			this.premiumTier = data.premium_tier;
		}

		if (data.public_updates_channel_id !== undefined) {
			this.publicUpdatesChannelId = data.public_updates_channel_id;
		}

		if (data.region !== undefined) {
			this.region = data.region;
		}

		if (data.roles !== undefined) {
			this.roles = data.roles.map((role) => Role.from(role));
		}

		if (data.rules_channel_id !== undefined) {
			this.rulesChannelId = data.rules_channel_id;
		}

		if (data.safety_alerts_channel_id !== undefined) {
			this.safetyAlertsChannelId = data.safety_alerts_channel_id;
		}

		if (data.splash !== undefined) {
			this.splash = data.splash;
		}

		if (data.stickers !== undefined) {
			this.stickers = data.stickers.map((sticker) => Sticker.from(sticker));
		}

		if (data.system_channel_flags !== undefined) {
			this.systemChannelFlags = data.system_channel_flags;
		}

		if (data.system_channel_id !== undefined) {
			this.systemChannelId = data.system_channel_id;
		}

		if (data.vanity_url_code !== undefined) {
			this.vanityUrlCode = data.vanity_url_code;
		}

		if (data.verification_level !== undefined) {
			this.verificationLevel = data.verification_level;
		}

		if (data.welcome_screen !== undefined) {
			this.welcomeScreen = WelcomeScreen.from(data.welcome_screen);
		}

		if (data.widget_channel_id !== undefined) {
			this.widgetChannelId = data.widget_channel_id;
		}

		if (data.widget_enabled !== undefined) {
			this.widgetEnabled = data.widget_enabled;
		}
	}
}

export class RecurrenceRuleNweekday extends Base<RecurrenceRuleNweekdayStructure> {
	public day!: RecurrenceRuleWeekdays;

	public n!: Integer;

	public constructor(data: Partial<RecurrenceRuleNweekdayStructure>) {
		super(data);
	}

	public toJSON(): RecurrenceRuleNweekdayStructure {
		return {
			day: this.day,
			n: this.n,
		};
	}

	protected patch(data: Partial<RecurrenceRuleNweekdayStructure>): void {
		if (data.day !== undefined) {
			this.day = data.day;
		}

		if (data.n !== undefined) {
			this.n = data.n;
		}
	}
}

export class RecurrenceRule extends Base<RecurrenceRuleStructure> {
	public byMonth!: RecurrenceRuleMonths[] | null;

	public byMonthDay!: Integer[] | null;

	public byNWeekday!: RecurrenceRuleNweekday[] | null;

	public byWeekday!: RecurrenceRuleWeekdays[] | null;

	public byYearDay!: Integer[] | null;

	public count!: Integer | null;

	public end?: IsoO8601Timestamp;

	public frequency!: RecurrenceRuleFrequencies;

	public interval!: Integer;

	public start!: IsoO8601Timestamp;

	public constructor(data: Partial<RecurrenceRuleStructure>) {
		super(data);
	}

	public toJSON(): RecurrenceRuleStructure {
		return {
			by_month: this.byMonth,
			by_month_day: this.byMonthDay,
			// TODO: Fix this
			by_n_weekday: this.byNWeekday!.map((nweekday) => nweekday.toJSON()),
			by_weekday: this.byWeekday,
			by_year_day: this.byYearDay,
			count: this.count,
			end: this.end,
			frequency: this.frequency,
			interval: this.interval,
			start: this.start,
		};
	}

	protected patch(data: Partial<RecurrenceRuleStructure>): void {
		if (data.by_month !== undefined) {
			this.byMonth = data.by_month;
		}

		if (data.by_month_day !== undefined) {
			this.byMonthDay = data.by_month_day;
		}

		if (data.by_n_weekday !== undefined) {
			// TODO: Fix this
			this.byNWeekday = data.by_n_weekday!.map((nweekday) =>
				RecurrenceRuleNweekday.from(nweekday),
			);
		}

		if (data.by_weekday !== undefined) {
			this.byWeekday = data.by_weekday;
		}

		if (data.by_year_day !== undefined) {
			this.byYearDay = data.by_year_day;
		}

		if (data.count !== undefined) {
			this.count = data.count;
		}

		if (data.end !== undefined) {
			this.end = data.end;
		}

		if (data.frequency !== undefined) {
			this.frequency = data.frequency;
		}

		if (data.interval !== undefined) {
			this.interval = data.interval;
		}

		if (data.start !== undefined) {
			this.start = data.start;
		}
	}
}

export class GuildScheduledEventUser extends Base<GuildScheduledEventUserStructure> {
	public guildScheduledEventId!: Snowflake;

	public member?: GuildMemberStructure;

	public user!: User;

	public constructor(data: Partial<GuildScheduledEventUserStructure>) {
		super(data);
	}

	public toJSON(): GuildScheduledEventUserStructure {
		return {
			guild_scheduled_event_id: this.guildScheduledEventId,
			member: this.member,
			user: this.user.toJSON(),
		};
	}

	protected patch(data: Partial<GuildScheduledEventUserStructure>): void {
		if (data.guild_scheduled_event_id !== undefined) {
			this.guildScheduledEventId = data.guild_scheduled_event_id;
		}

		if (data.member !== undefined) {
			this.member = data.member;
		}

		if (data.user !== undefined) {
			this.user = User.from(data.user);
		}
	}
}

export class GuildScheduledEventEntityMetadata extends Base<GuildScheduledEventEntityMetadataStructure> {
	public location?: string;

	public constructor(
		data: Partial<GuildScheduledEventEntityMetadataStructure>,
	) {
		super(data);
	}

	public toJSON(): GuildScheduledEventEntityMetadataStructure {
		return {
			location: this.location,
		};
	}

	protected patch(
		data: Partial<GuildScheduledEventEntityMetadataStructure>,
	): void {
		if (data.location !== undefined) {
			this.location = data.location;
		}
	}
}

export class GuildScheduledEvent extends Base<GuildScheduledEventStructure> {
	public channelId!: Snowflake | null;

	public creator?: User;

	public creatorId?: Snowflake;

	public description?: string | null;

	public entityId!: Snowflake | null;

	public entityMetadata?: GuildScheduledEventEntityMetadata;

	public entityType!: GuildScheduledEventEntityTypes;

	public guildId!: Snowflake;

	public id!: Snowflake;

	public image?: string | null;

	public name!: string;

	public privacyLevel!: GuildScheduledEventPrivacyLevels;

	public recurrenceRule!: RecurrenceRule | null;

	public scheduledEndTime!: IsoO8601Timestamp | null;

	public scheduledStartTime!: IsoO8601Timestamp;

	public status!: GuildScheduledEventStatus;

	public userCount?: Integer;

	public constructor(data: Partial<GuildScheduledEventStructure>) {
		super(data);
	}

	public toJSON(): GuildScheduledEventStructure {
		return {
			channel_id: this.channelId,
			creator: this.creator?.toJSON(),
			creator_id: this.creatorId,
			description: this.description,
			entity_id: this.entityId,
			entity_metadata: this.entityMetadata?.toJSON(),
			entity_type: this.entityType,
			guild_id: this.guildId,
			id: this.id,
			image: this.image,
			name: this.name,
			privacy_level: this.privacyLevel,
			// TODO: Fix this
			recurrence_rule: this.recurrenceRule!.toJSON(),
			scheduled_end_time: this.scheduledEndTime,
			scheduled_start_time: this.scheduledStartTime,
			status: this.status,
			user_count: this.userCount,
		};
	}

	protected patch(data: Partial<GuildScheduledEventStructure>): void {
		if (data.channel_id !== undefined) {
			this.channelId = data.channel_id;
		}

		if (data.creator !== undefined) {
			this.creator = User.from(data.creator);
		}

		if (data.creator_id !== undefined) {
			this.creatorId = data.creator_id;
		}

		if (data.description !== undefined) {
			this.description = data.description;
		}

		if (data.entity_id !== undefined) {
			this.entityId = data.entity_id;
		}

		if (data.entity_metadata !== undefined) {
			this.entityMetadata = new GuildScheduledEventEntityMetadata(
				data.entity_metadata,
			);
		}

		if (data.entity_type !== undefined) {
			this.entityType = data.entity_type;
		}

		if (data.guild_id !== undefined) {
			this.guildId = data.guild_id;
		}

		if (data.id !== undefined) {
			this.id = data.id;
		}

		if (data.image !== undefined) {
			this.image = data.image;
		}

		if (data.name !== undefined) {
			this.name = data.name;
		}

		if (data.privacy_level !== undefined) {
			this.privacyLevel = data.privacy_level;
		}

		if (data.recurrence_rule !== undefined) {
			// TODO: Fix this
			this.recurrenceRule = RecurrenceRule.from(data.recurrence_rule!);
		}

		if (data.scheduled_end_time !== undefined) {
			this.scheduledEndTime = data.scheduled_end_time;
		}

		if (data.scheduled_start_time !== undefined) {
			this.scheduledStartTime = data.scheduled_start_time;
		}

		if (data.status !== undefined) {
			this.status = data.status;
		}

		if (data.user_count !== undefined) {
			this.userCount = data.user_count;
		}
	}
}

export class GuildTemplate extends Base<GuildTemplateStructure> {
	public code!: string;

	public createdAt!: IsoO8601Timestamp;

	public creator!: User;

	public creatorId!: Snowflake;

	public description!: string | null;

	public isDirty!: boolean | null;

	public name!: string;

	public serializedSourceGuild!: Pick<
		Guild,
		| "afkChannelId"
		| "afkTimeout"
		| "defaultMessageNotifications"
		| "description"
		| "explicitContentFilter"
		| "iconHash"
		| "name"
		| "preferredLocale"
		| "region"
		| "roles"
		| "systemChannelFlags"
		| "systemChannelId"
		| "verificationLevel"
		| "toJSON"
	>;

	public sourceGuildId!: Snowflake;

	public updatedAt!: IsoO8601Timestamp;

	public usageCount!: Integer;

	public constructor(data: Partial<GuildTemplateStructure>) {
		super(data);
	}

	public toJSON(): GuildTemplateStructure {
		return {
			code: this.code,
			created_at: this.createdAt,
			creator: this.creator.toJSON(),
			creator_id: this.creatorId,
			description: this.description,
			is_dirty: this.isDirty,
			name: this.name,
			serialized_source_guild: this.serializedSourceGuild.toJSON(),
			source_guild_id: this.sourceGuildId,
			updated_at: this.updatedAt,
			usage_count: this.usageCount,
		};
	}

	protected patch(data: Partial<GuildTemplateStructure>): void {
		if (data.code !== undefined) {
			this.code = data.code;
		}

		if (data.created_at !== undefined) {
			this.createdAt = data.created_at;
		}

		if (data.creator !== undefined) {
			this.creator = User.from(data.creator);
		}

		if (data.creator_id !== undefined) {
			this.creatorId = data.creator_id;
		}

		if (data.description !== undefined) {
			this.description = data.description;
		}

		if (data.is_dirty !== undefined) {
			this.isDirty = data.is_dirty;
		}

		if (data.name !== undefined) {
			this.name = data.name;
		}

		if (data.serialized_source_guild !== undefined) {
			this.serializedSourceGuild = Guild.from(data.serialized_source_guild);
		}

		if (data.source_guild_id !== undefined) {
			this.sourceGuildId = data.source_guild_id;
		}

		if (data.updated_at !== undefined) {
			this.updatedAt = data.updated_at;
		}

		if (data.usage_count !== undefined) {
			this.usageCount = data.usage_count;
		}
	}
}

export {
	PromptTypes,
	OnboardingMode,
	IntegrationExpireBehaviors,
	IntegrationPlatformTypes,
	GuildMemberFlags,
	GuildFeatures,
	SystemChannelFlags,
	PremiumTiers,
	NsfwLevels,
	VerificationLevels,
	MfaLevels,
	ExplicitContentFilterLevels,
	DefaultMessageNotificationLevels,
	RecurrenceRuleMonths,
	RecurrenceRuleWeekdays,
	RecurrenceRuleFrequencies,
	GuildScheduledEventStatus,
	GuildScheduledEventEntityTypes,
	GuildScheduledEventPrivacyLevels,
} from "@nyxjs/rest";
