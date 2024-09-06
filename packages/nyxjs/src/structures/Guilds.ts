import type {
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
} from "@nyxjs/api-types";
import type { Integer, IsoO8601Timestamp, Locales, Oauth2Scopes, Snowflake } from "@nyxjs/core";
import { Base } from "./Base";
import { BaseChannel } from "./Channels";
import { Emoji } from "./Emojis";
import { Role } from "./Roles";
import { Sticker } from "./Stickers";
import { AvatarDecorationData, User } from "./Users";

export class PromptOption extends Base<PromptOptionStructure> {
    public channelIds!: Snowflake[];

    public description!: string | null;

    public emoji?: Pick<Emoji, "animated" | "id" | "name" | "toJSON">;

    public id!: Snowflake;

    public roleIds!: Snowflake[];

    public title!: string;

    public constructor(data: Partial<PromptOptionStructure>) {
        super(data);
    }

    protected patch(data: Partial<PromptOptionStructure>): void {
        this.channelIds = data.channel_ids ?? this.channelIds;
        this.description = data.description ?? this.description;
        if ("emoji" in data && data.emoji) {
            this.emoji = Emoji.from(data.emoji);
        }

        this.id = data.id ?? this.id;
        this.roleIds = data.role_ids ?? this.roleIds;
        this.title = data.title ?? this.title;
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

    protected patch(data: Partial<OnboardingPromptStructure>): void {
        this.id = data.id ?? this.id;
        this.inOnboarding = data.in_onboarding ?? this.inOnboarding;
        this.options = data.options ? data.options.map((option) => PromptOption.from(option)) : this.options;
        this.required = data.required ?? this.required;
        this.singleSelect = data.single_select ?? this.singleSelect;
        this.title = data.title ?? this.title;
        this.type = data.type ?? this.type;
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

    protected patch(data: Partial<GuildOnboardingStructure>): void {
        this.defaultChannelIds = data.default_channel_ids ?? this.defaultChannelIds;
        this.enabled = data.enabled ?? this.enabled;
        this.guildId = data.guild_id ?? this.guildId;
        this.mode = data.mode ?? this.mode;
        this.prompts = data.prompts ? data.prompts.map((prompt) => OnboardingPrompt.from(prompt)) : this.prompts;
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

    protected patch(data: Partial<WelcomeScreenChannelStructure>): void {
        this.channelId = data.channel_id ?? this.channelId;
        this.description = data.description ?? this.description;
        this.emojiId = data.emoji_id ?? this.emojiId;
        this.emojiName = data.emoji_name ?? this.emojiName;
    }
}

export class WelcomeScreen extends Base<WelcomeScreenStructure> {
    public description!: string | null;

    public welcomeChannels!: WelcomeScreenChannel[];

    public constructor(data: Partial<WelcomeScreenStructure>) {
        super(data);
    }

    protected patch(data: Partial<WelcomeScreenStructure>): void {
        this.description = data.description ?? this.description;
        this.welcomeChannels = data.welcome_channels
            ? data.welcome_channels.map((channel) => WelcomeScreenChannel.from(channel))
            : this.welcomeChannels;
    }
}

export class Ban extends Base<BanStructure> {
    public reason!: string | null;

    public user!: User;

    public constructor(data: Partial<BanStructure>) {
        super(data);
    }

    protected patch(data: Partial<BanStructure>): void {
        this.reason = data.reason ?? this.reason;
        this.user = data.user ? User.from(data.user) : this.user;
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

    protected patch(data: Partial<IntegrationApplicationStructure>): void {
        if ("bot" in data && data.bot) {
            this.bot = User.from(data.bot);
        }

        this.description = data.description ?? this.description;
        this.icon = data.icon ?? this.icon;
        this.id = data.id ?? this.id;
        this.name = data.name ?? this.name;
    }
}

export class IntegrationAccount extends Base<IntegrationAccountStructure> {
    public id!: string;

    public name!: string;

    public constructor(data: Partial<IntegrationAccountStructure>) {
        super(data);
    }

    protected patch(data: Partial<IntegrationAccountStructure>): void {
        this.id = data.id ?? this.id;
        this.name = data.name ?? this.name;
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

    protected patch(data: Partial<IntegrationStructure>): void {
        this.account = data.account ? IntegrationAccount.from(data.account) : this.account;
        if ("application" in data && data.application) {
            this.application = IntegrationApplication.from(data.application);
        }

        if ("enable_emoticons" in data) {
            this.enableEmoticons = data.enable_emoticons;
        }

        this.enabled = data.enabled ?? this.enabled;
        if ("expire_behavior" in data) {
            this.expireBehavior = data.expire_behavior;
        }

        if ("expire_grace_period" in data) {
            this.expireGracePeriod = data.expire_grace_period;
        }

        this.id = data.id ?? this.id;
        this.name = data.name ?? this.name;
        if ("revoked" in data) {
            this.revoked = data.revoked;
        }

        if ("role_id" in data) {
            this.roleId = data.role_id;
        }

        if ("scopes" in data) {
            this.scopes = data.scopes;
        }

        if ("subscriber_count" in data) {
            this.subscriberCount = data.subscriber_count;
        }

        if ("synced_at" in data) {
            this.syncedAt = data.synced_at;
        }

        if ("syncing" in data) {
            this.syncing = data.syncing;
        }

        this.type = data.type ?? this.type;
        if ("user" in data && data.user) {
            this.user = User.from(data.user);
        }
    }
}

export class GuildMember extends Base<GuildMemberStructure> {
    public avatar?: string | null;

    public avatarDecorationData?: AvatarDecorationData;

    public communicationDisabledUntil?: IsoO8601Timestamp | null;

    public deaf!: boolean;

    public flags!: GuildMemberFlags;

    public joinedAt!: IsoO8601Timestamp;

    public mute!: boolean;

    public nick?: string | null;

    public pending?: boolean;

    public permissions?: string;

    public premiumSince?: IsoO8601Timestamp | null;

    public roles!: Snowflake[];

    public user?: User;

    public constructor(data: Partial<GuildMemberStructure>) {
        super(data);
    }

    protected patch(data: Partial<GuildMemberStructure>): void {
        if ("avatar" in data) {
            this.avatar = data.avatar;
        }

        if ("avatar_decoration_data" in data && data.avatar_decoration_data) {
            this.avatarDecorationData = AvatarDecorationData.from(data.avatar_decoration_data);
        }

        if ("communication_disabled_until" in data) {
            this.communicationDisabledUntil = data.communication_disabled_until;
        }

        this.deaf = data.deaf ?? this.deaf;
        this.flags = data.flags ?? this.flags;
        this.joinedAt = data.joined_at ?? this.joinedAt;
        this.mute = data.mute ?? this.mute;
        if ("nick" in data) {
            this.nick = data.nick;
        }

        if ("pending" in data) {
            this.pending = data.pending;
        }

        if ("permissions" in data) {
            this.permissions = data.permissions;
        }

        if ("premium_since" in data) {
            this.premiumSince = data.premium_since;
        }

        this.roles = data.roles ?? this.roles;
        if ("user" in data && data.user) {
            this.user = User.from(data.user);
        }
    }
}

export class GuildWidget extends Base<GuildWidgetStructure> {
    public channels!: Pick<BaseChannel, "id" | "name" | "position">[];

    public id!: Snowflake;

    public instantInvite!: string | null;

    public members!: Pick<
        User & {
            avatarUrl: string;
            status: string;
        },
        "avatar" | "avatarUrl" | "discriminator" | "id" | "status" | "username"
    >[];

    public name!: string;

    public presenceCount!: Integer;

    public constructor(data: Partial<GuildWidgetStructure>) {
        super(data);
    }

    protected patch(data: Partial<GuildWidgetStructure>): void {
        this.channels = data.channels ? data.channels.map((channel) => BaseChannel.from(channel)) : this.channels;
        this.id = data.id ?? this.id;
        this.instantInvite = data.instant_invite ?? this.instantInvite;
        this.members = data.members
            ? data.members.map((member) => {
                  const user = User.from(member);
                  return {
                      avatarUrl: member.avatar_url,
                      status: member.status,
                      ...user,
                  };
              })
            : this.members;
        this.name = data.name ?? this.name;
        this.presenceCount = data.presence_count ?? this.presenceCount;
    }
}

export class GuildWidgetSettings extends Base<GuildWidgetSettingsStructure> {
    public channelId!: Snowflake | null;

    public enabled!: boolean;

    public constructor(data: Partial<GuildWidgetSettingsStructure>) {
        super(data);
    }

    protected patch(data: Partial<GuildWidgetSettingsStructure>): void {
        this.channelId = data.channel_id ?? this.channelId;
        this.enabled = data.enabled ?? this.enabled;
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

    protected patch(data: Partial<GuildPreviewStructure>): void {
        this.approximateMemberCount = data.approximate_member_count ?? this.approximateMemberCount;
        this.approximatePresenceCount = data.approximate_presence_count ?? this.approximatePresenceCount;
        this.description = data.description ?? this.description;
        this.discoverySplash = data.discovery_splash ?? this.discoverySplash;
        this.emojis = data.emojis ? data.emojis.map((emoji) => Emoji.from(emoji)) : this.emojis;
        this.features = data.features ?? this.features;
        this.icon = data.icon ?? this.icon;
        this.id = data.id ?? this.id;
        this.name = data.name ?? this.name;
        this.splash = data.splash ?? this.splash;
        this.stickers = data.stickers ? data.stickers.map((sticker) => Sticker.from(sticker)) : this.stickers;
    }
}

export class UnavailableGuild extends Base<UnavailableGuildStructure> {
    public id!: Snowflake;

    public unavailable!: boolean;

    public constructor(data: Partial<UnavailableGuildStructure>) {
        super(data);
    }

    protected patch(data: Partial<UnavailableGuildStructure>): void {
        this.id = data.id ?? this.id;
        this.unavailable = data.unavailable ?? this.unavailable;
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
     * @deprecated Voice region id for the guild (deprecated
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

    protected patch(data: Partial<GuildStructure>): void {
        this.afkChannelId = data.afk_channel_id ?? this.afkChannelId;
        this.afkTimeout = data.afk_timeout ?? this.afkTimeout;
        if ("application_id" in data) {
            this.applicationId = data.application_id;
        }

        if ("approximate_member_count" in data) {
            this.approximateMemberCount = data.approximate_member_count;
        }

        if ("approximate_presence_count" in data) {
            this.approximatePresenceCount = data.approximate_presence_count;
        }

        this.banner = data.banner ?? this.banner;
        this.defaultMessageNotifications = data.default_message_notifications ?? this.defaultMessageNotifications;
        this.description = data.description ?? this.description;
        this.discoverySplash = data.discovery_splash ?? this.discoverySplash;
        this.emojis = data.emojis ? data.emojis.map((emoji) => Emoji.from(emoji)) : this.emojis;
        this.explicitContentFilter = data.explicit_content_filter ?? this.explicitContentFilter;
        this.features = data.features ?? this.features;
        this.icon = data.icon ?? this.icon;
        if ("icon_hash" in data) {
            this.iconHash = data.icon_hash;
        }

        this.id = data.id ?? this.id;
        if ("max_members" in data && data.max_members) {
            this.maxMembers = data.max_members;
        }

        if ("max_presences" in data) {
            this.maxPresences = data.max_presences;
        }

        if ("max_stage_video_channel_users" in data) {
            this.maxStageVideoChannelUsers = data.max_stage_video_channel_users;
        }

        if ("max_video_channel_users" in data) {
            this.maxVideoChannelUsers = data.max_video_channel_users;
        }

        this.mfaLevel = data.mfa_level ?? this.mfaLevel;
        this.name = data.name ?? this.name;
        this.nsfwLevel = data.nsfw_level ?? this.nsfwLevel;
        if ("owner" in data) {
            this.owner = data.owner;
        }

        this.ownerId = data.owner_id ?? this.ownerId;
        if ("permissions" in data) {
            this.permissions = data.permissions;
        }

        this.preferredLocale = data.preferred_locale ?? this.preferredLocale;
        this.premiumProgressBarEnabled = data.premium_progress_bar_enabled ?? this.premiumProgressBarEnabled;
        if ("premium_subscription_count" in data) {
            this.premiumSubscriptionCount = data.premium_subscription_count;
        }

        this.premiumTier = data.premium_tier ?? this.premiumTier;
        this.publicUpdatesChannelId = data.public_updates_channel_id ?? this.publicUpdatesChannelId;
        if ("region" in data) {
            this.region = data.region;
        }

        this.roles = data.roles ? data.roles.map((role) => Role.from(role)) : this.roles;
        this.rulesChannelId = data.rules_channel_id ?? this.rulesChannelId;
        this.safetyAlertsChannelId = data.safety_alerts_channel_id ?? this.safetyAlertsChannelId;
        this.splash = data.splash ?? this.splash;
        if ("stickers" in data && data.stickers) {
            this.stickers = data.stickers.map((sticker) => Sticker.from(sticker));
        }

        this.systemChannelFlags = data.system_channel_flags ?? this.systemChannelFlags;
        this.systemChannelId = data.system_channel_id ?? this.systemChannelId;
        this.vanityUrlCode = data.vanity_url_code ?? this.vanityUrlCode;
        this.verificationLevel = data.verification_level ?? this.verificationLevel;
        if ("welcome_screen" in data && data.welcome_screen) {
            this.welcomeScreen = WelcomeScreen.from(data.welcome_screen);
        }

        if ("widget_channel_id" in data) {
            this.widgetChannelId = data.widget_channel_id;
        }

        if ("widget_enabled" in data) {
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

    protected patch(data: Partial<RecurrenceRuleNweekdayStructure>): void {
        this.day = data.day!;
        this.n = data.n!;
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

    protected patch(data: Partial<RecurrenceRuleStructure>): void {
        this.byMonth = data.by_month!;
        this.byMonthDay = data.by_month_day!;
        this.byNWeekday = this.byNWeekday!.map((nWeekday) => RecurrenceRuleNweekday.from(nWeekday));
        this.byWeekday = data.by_weekday!;
        this.byYearDay = data.by_year_day!;
        this.count = data.count!;

        if (data.end !== undefined) {
            this.end = data.end;
        }

        this.frequency = data.frequency!;
        this.interval = data.interval!;
        this.start = data.start!;
    }
}

export class GuildScheduledEventUser extends Base<GuildScheduledEventUserStructure> {
    public guildScheduledEventId!: Snowflake;

    public member?: GuildMember;

    public user!: User;

    public constructor(data: Partial<GuildScheduledEventUserStructure>) {
        super(data);
    }

    protected patch(data: Partial<GuildScheduledEventUserStructure>): void {
        this.guildScheduledEventId = data.guild_scheduled_event_id ?? this.guildScheduledEventId;
        if ("member" in data && data.member) {
            this.member = GuildMember.from(data.member);
        }

        this.user = data.user ? User.from(data.user) : this.user;
    }
}

export class GuildScheduledEventEntityMetadata extends Base<GuildScheduledEventEntityMetadataStructure> {
    public location?: string;

    public constructor(data: Partial<GuildScheduledEventEntityMetadataStructure>) {
        super(data);
    }

    protected patch(data: Partial<GuildScheduledEventEntityMetadataStructure>): void {
        if ("location" in data) {
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

    protected patch(data: Partial<GuildScheduledEventStructure>): void {
        this.channelId = data.channel_id ?? this.channelId;
        if ("creator" in data && data.creator) {
            this.creator = User.from(data.creator);
        }

        if ("creator_id" in data) {
            this.creatorId = data.creator_id;
        }

        if ("description" in data) {
            this.description = data.description;
        }

        this.entityId = data.entity_id ?? this.entityId;
        if ("entity_metadata" in data && data.entity_metadata) {
            this.entityMetadata = new GuildScheduledEventEntityMetadata(data.entity_metadata);
        }

        this.entityType = data.entity_type ?? this.entityType;
        this.guildId = data.guild_id ?? this.guildId;
        this.id = data.id ?? this.id;
        if ("image" in data) {
            this.image = data.image;
        }

        this.name = data.name ?? this.name;
        this.privacyLevel = data.privacy_level ?? this.privacyLevel;
        this.recurrenceRule = data.recurrence_rule ? RecurrenceRule.from(data.recurrence_rule) : null;
        this.scheduledEndTime = data.scheduled_end_time ?? this.scheduledEndTime;
        this.scheduledStartTime = data.scheduled_start_time ?? this.scheduledStartTime;
        this.status = data.status ?? this.status;
        if ("user_count" in data) {
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
        | "toJSON"
        | "verificationLevel"
    >;

    public sourceGuildId!: Snowflake;

    public updatedAt!: IsoO8601Timestamp;

    public usageCount!: Integer;

    public constructor(data: Partial<GuildTemplateStructure>) {
        super(data);
    }

    protected patch(data: Partial<GuildTemplateStructure>): void {
        this.code = data.code ?? this.code;
        this.createdAt = data.created_at ?? this.createdAt;
        this.creator = data.creator ? User.from(data.creator) : this.creator;
        this.creatorId = data.creator_id ?? this.creatorId;
        this.description = data.description ?? this.description;
        this.isDirty = data.is_dirty ?? this.isDirty;
        this.name = data.name ?? this.name;
        this.serializedSourceGuild = data.serialized_source_guild
            ? Guild.from(data.serialized_source_guild)
            : this.serializedSourceGuild;
        this.sourceGuildId = data.source_guild_id ?? this.sourceGuildId;
        this.updatedAt = data.updated_at ?? this.updatedAt;
        this.usageCount = data.usage_count ?? this.usageCount;
    }
}

export {
    DefaultMessageNotificationLevels,
    ExplicitContentFilterLevels,
    GuildFeatures,
    GuildMemberFlags,
    GuildScheduledEventEntityTypes,
    GuildScheduledEventPrivacyLevels,
    GuildScheduledEventStatus,
    IntegrationExpireBehaviors,
    IntegrationPlatformTypes,
    MfaLevels,
    NsfwLevels,
    OnboardingMode,
    PremiumTiers,
    PromptTypes,
    RecurrenceRuleFrequencies,
    RecurrenceRuleMonths,
    RecurrenceRuleWeekdays,
    SystemChannelFlags,
    VerificationLevels,
} from "@nyxjs/api-types";
