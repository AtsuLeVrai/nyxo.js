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
import type { Emoji } from "./Emojis";
import type { Role } from "./Roles";
import type { Sticker } from "./Stickers";
import type { User } from "./Users";

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
}

export class WelcomeScreenChannel extends Base<WelcomeScreenChannelStructure> {
	public channelId!: Snowflake;

	public description!: string;

	public emojiId!: Snowflake | null;

	public emojiName!: string | null;

	public constructor(data: Partial<WelcomeScreenChannelStructure>) {
		super(data);
	}
}

export class WelcomeScreen extends Base<WelcomeScreenStructure> {
	public description!: string | null;

	public welcomeChannels!: WelcomeScreenChannel[];

	public constructor(data: Partial<WelcomeScreenStructure>) {
		super(data);
	}
}

export class Ban extends Base<BanStructure> {
	public reason!: string | null;

	public user!: User;

	public constructor(data: Partial<BanStructure>) {
		super(data);
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
}

export class IntegrationAccount extends Base<IntegrationAccountStructure> {
	public id!: string;

	public name!: string;

	public constructor(data: Partial<IntegrationAccountStructure>) {
		super(data);
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
}

export class UnavailableGuild extends Base<UnavailableGuildStructure> {
	public id!: Snowflake;

	public unavailable!: boolean;

	public constructor(data: Partial<UnavailableGuildStructure>) {
		super(data);
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
}

export class RecurrenceRuleNweekday extends Base<RecurrenceRuleNweekdayStructure> {
	public day!: RecurrenceRuleWeekdays;

	public n!: Integer;

	public constructor(data: Partial<RecurrenceRuleNweekdayStructure>) {
		super(data);
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
}

export class GuildScheduledEventUser extends Base<GuildScheduledEventUserStructure> {
	public guildScheduledEventId!: Snowflake;

	public member?: GuildMemberStructure;

	public user!: User;

	public constructor(data: Partial<GuildScheduledEventUserStructure>) {
		super(data);
	}
}

export class GuildScheduledEventEntityMetadata extends Base<GuildScheduledEventEntityMetadataStructure> {
	public location?: string;

	public constructor(
		data: Partial<GuildScheduledEventEntityMetadataStructure>,
	) {
		super(data);
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
