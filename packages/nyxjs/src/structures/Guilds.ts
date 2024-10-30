import type {
    AvatarDecorationDataStructure,
    BanStructure,
    BitfieldResolvable,
    ChannelStructure,
    EmojiStructure,
    GuildDefaultMessageNotificationLevel,
    GuildExplicitContentFilterLevel,
    GuildFeatures,
    GuildMemberFlags,
    GuildMemberStructure,
    GuildMfaLevel,
    GuildNsfwLevel,
    GuildOnboardingModes,
    GuildOnboardingPromptOptionStructure,
    GuildOnboardingPromptStructure,
    GuildOnboardingPromptTypes,
    GuildOnboardingStructure,
    GuildPreviewStructure,
    GuildStructure,
    GuildVerificationLevel,
    GuildWidgetSettingsStructure,
    GuildWidgetStructure,
    Integer,
    IntegrationAccountStructure,
    IntegrationApplicationStructure,
    IntegrationExpireBehaviors,
    IntegrationStructure,
    IntegrationTypes,
    Iso8601Timestamp,
    LocaleKeys,
    OAuth2Scopes,
    PremiumTier,
    RoleStructure,
    Snowflake,
    StickerStructure,
    SystemChannelFlags,
    UnavailableGuildStructure,
    UserStructure,
    WelcomeScreenChannelStructure,
    WelcomeScreenStructure,
} from "@nyxjs/core";
import type { PickWithMethods } from "../types/index.js";
import { Emoji } from "./Emojis.js";
import { Role } from "./Roles.js";
import { Sticker } from "./Stickers.js";
import { AvatarDecorationData, User } from "./Users.js";

export class GuildOnboardingPromptOption {
    #channelIds: Snowflake[] = [];
    #description: string | null = null;
    #emojiAnimated = false;
    #emojiId: Snowflake | null = null;
    #emojiName: string | null = null;
    #id: Snowflake | null = null;
    #roleIds: Snowflake[] = [];
    #title: string | null = null;

    constructor(data: Partial<GuildOnboardingPromptOptionStructure>) {
        this.patch(data);
    }

    get channelIds() {
        return [...this.#channelIds];
    }

    get description() {
        return this.#description;
    }

    get emojiAnimated() {
        return this.#emojiAnimated;
    }

    get emojiId() {
        return this.#emojiId;
    }

    get emojiName() {
        return this.#emojiName;
    }

    get id() {
        return this.#id;
    }

    get roleIds() {
        return [...this.#roleIds];
    }

    get title() {
        return this.#title;
    }

    patch(data: Partial<GuildOnboardingPromptOptionStructure>) {
        if (Array.isArray(data.channel_ids)) {
            this.#channelIds = data.channel_ids ?? this.#channelIds;
        }

        this.#description = data.description ?? null;
        this.#emojiAnimated = data.emoji_animated ?? false;
        this.#emojiId = data.emoji_id ?? null;
        this.#emojiName = data.emoji_name ?? null;
        this.#id = data.id ?? null;

        if (Array.isArray(data.role_ids)) {
            this.#roleIds = data.role_ids ?? this.#roleIds;
        }

        this.#title = data.title ?? null;
    }

    toJSON(): Partial<GuildOnboardingPromptOptionStructure> {
        return {
            channel_ids: this.#channelIds,
            description: this.#description,
            emoji_animated: this.#emojiAnimated,
            emoji_id: this.#emojiId ?? undefined,
            emoji_name: this.#emojiName ?? undefined,
            id: this.#id ?? undefined,
            role_ids: this.#roleIds,
            title: this.#title ?? undefined,
        };
    }
}

export class GuildOnboardingPrompt {
    #id: Snowflake | null = null;
    #inOnboarding = false;
    #options: GuildOnboardingPromptOption[] = [];
    #required = false;
    #singleSelect = false;
    #title: string | null = null;
    #type: GuildOnboardingPromptTypes | null = null;

    constructor(data: Partial<GuildOnboardingPromptStructure>) {
        this.patch(data);
    }

    get id() {
        return this.#id;
    }

    get inOnboarding() {
        return this.#inOnboarding;
    }

    get options() {
        return [...this.#options];
    }

    get required() {
        return this.#required;
    }

    get singleSelect() {
        return this.#singleSelect;
    }

    get title() {
        return this.#title;
    }

    get type() {
        return this.#type;
    }

    patch(data: Partial<GuildOnboardingPromptStructure>) {
        this.#id = data.id ?? this.#id;
        this.#inOnboarding = data.in_onboarding ?? this.#inOnboarding;

        if (Array.isArray(data.options)) {
            this.#options = data.options.map((option) => new GuildOnboardingPromptOption(option));
        }

        this.#required = data.required ?? this.#required;
        this.#singleSelect = data.single_select ?? this.#singleSelect;
        this.#title = data.title ?? this.#title;
        this.#type = data.type ?? this.#type;
    }

    toJSON(): Partial<GuildOnboardingPromptStructure> {
        return {
            id: this.#id ?? undefined,
            in_onboarding: this.#inOnboarding,
            options: this.#options.map((option) => option.toJSON()) as GuildOnboardingPromptOptionStructure[],
            required: this.#required,
            single_select: this.#singleSelect,
            title: this.#title ?? undefined,
            type: this.#type ?? undefined,
        };
    }
}

export class GuildOnboarding {
    #defaultChannelIds: Snowflake[] = [];
    #enabled = false;
    #guildId: Snowflake | null = null;
    #mode: GuildOnboardingModes | null = null;
    #prompts: GuildOnboardingPrompt[] = [];

    constructor(data: Partial<GuildOnboardingStructure>) {
        this.patch(data);
    }

    get defaultChannelIds() {
        return [...this.#defaultChannelIds];
    }

    get enabled() {
        return this.#enabled;
    }

    get guildId() {
        return this.#guildId;
    }

    get mode() {
        return this.#mode;
    }

    get prompts() {
        return [...this.#prompts];
    }

    patch(data: Partial<GuildOnboardingStructure>) {
        if (Array.isArray(data.default_channel_ids)) {
            this.#defaultChannelIds = data.default_channel_ids ?? this.#defaultChannelIds;
        }

        this.#enabled = data.enabled ?? this.#enabled;
        this.#guildId = data.guild_id ?? this.#guildId;
        this.#mode = data.mode ?? this.#mode;

        if (Array.isArray(data.prompts)) {
            this.#prompts = data.prompts.map((prompt) => new GuildOnboardingPrompt(prompt));
        }
    }

    toJSON(): Partial<GuildOnboardingStructure> {
        return {
            default_channel_ids: this.#defaultChannelIds,
            enabled: this.#enabled,
            guild_id: this.#guildId ?? undefined,
            mode: this.#mode ?? undefined,
            prompts: this.#prompts.map((prompt) => prompt.toJSON()) as GuildOnboardingPromptStructure[],
        };
    }
}

export class WelcomeScreenChannel {
    #channelId: Snowflake | null = null;
    #description: string | null = null;
    #emojiId: Snowflake | null = null;
    #emojiName: string | null = null;

    constructor(data: Partial<WelcomeScreenChannelStructure>) {
        this.patch(data);
    }

    get channelId() {
        return this.#channelId;
    }

    get description() {
        return this.#description;
    }

    get emojiId() {
        return this.#emojiId;
    }

    get emojiName() {
        return this.#emojiName;
    }

    patch(data: Partial<WelcomeScreenChannelStructure>) {
        this.#channelId = data.channel_id ?? this.#channelId;
        this.#description = data.description ?? this.#description;
        this.#emojiId = data.emoji_id ?? this.#emojiId;
        this.#emojiName = data.emoji_name ?? this.#emojiName;
    }

    toJSON(): Partial<WelcomeScreenChannelStructure> {
        return {
            channel_id: this.#channelId ?? undefined,
            description: this.#description ?? undefined,
            emoji_id: this.#emojiId,
            emoji_name: this.#emojiName,
        };
    }
}

export class WelcomeScreen {
    #description: string | null = null;
    #welcomeChannels: WelcomeScreenChannel[] = [];

    constructor(data: Partial<WelcomeScreenStructure>) {
        this.patch(data);
    }

    get description() {
        return this.#description;
    }

    get welcomeChannels() {
        return [...this.#welcomeChannels];
    }

    patch(data: Partial<WelcomeScreenStructure>) {
        this.#description = data.description ?? this.#description;

        if (Array.isArray(data.welcome_channels)) {
            this.#welcomeChannels = data.welcome_channels.map((channel) => new WelcomeScreenChannel(channel));
        }
    }

    toJSON(): Partial<WelcomeScreenStructure> {
        return {
            description: this.#description,
            welcome_channels: this.#welcomeChannels.map((channel) =>
                channel.toJSON()
            ) as WelcomeScreenChannelStructure[],
        };
    }
}

export class Ban {
    #reason: string | null = null;
    #user: User | null = null;

    constructor(data: Partial<BanStructure>) {
        this.patch(data);
    }

    get reason() {
        return this.#reason;
    }

    get user() {
        return this.#user;
    }

    patch(data: Partial<BanStructure>) {
        this.#reason = data.reason ?? this.#reason;

        if (data.user) {
            this.#user = new User(data.user);
        }
    }

    toJSON(): Partial<BanStructure> {
        return {
            reason: this.#reason,
            user: this.#user?.toJSON() as UserStructure,
        };
    }
}

export class IntegrationApplication {
    #bot: User | null = null;
    #description: string | null = null;
    #icon: string | null = null;
    #id: Snowflake | null = null;
    #name: string | null = null;

    constructor(data: Partial<IntegrationApplicationStructure>) {
        this.patch(data);
    }

    get bot() {
        return this.#bot;
    }

    get description() {
        return this.#description;
    }

    get icon() {
        return this.#icon;
    }

    get id() {
        return this.#id;
    }

    get name() {
        return this.#name;
    }

    patch(data: Partial<IntegrationApplicationStructure>) {
        if (data.bot) {
            this.#bot = new User(data.bot);
        }

        this.#description = data.description ?? this.#description;
        this.#icon = data.icon ?? this.#icon;
        this.#id = data.id ?? this.#id;
        this.#name = data.name ?? this.#name;
    }

    toJSON(): Partial<IntegrationApplicationStructure> {
        return {
            bot: this.#bot?.toJSON() as UserStructure,
            description: this.#description ?? undefined,
            icon: this.#icon,
            id: this.#id ?? undefined,
            name: this.#name ?? undefined,
        };
    }
}

export class IntegrationAccount {
    #id: string | null = null;
    #name: string | null = null;

    constructor(data: Partial<IntegrationAccountStructure>) {
        this.patch(data);
    }

    get id() {
        return this.#id;
    }

    get name() {
        return this.#name;
    }

    patch(data: Partial<IntegrationAccountStructure>) {
        this.#id = data.id ?? this.#id;
        this.#name = data.name ?? this.#name;
    }

    toJSON(): Partial<IntegrationAccountStructure> {
        return {
            id: this.#id ?? undefined,
            name: this.#name ?? undefined,
        };
    }
}

export class Integration {
    #account: IntegrationAccount | null = null;
    #application: IntegrationApplication | null = null;
    #enableEmoticons = false;
    #enabled = false;
    #expireBehavior: IntegrationExpireBehaviors | null = null;
    #expireGracePeriod: Integer | null = null;
    #id: Snowflake | null = null;
    #name: string | null = null;
    #revoked = false;
    #roleId: Snowflake | null = null;
    #scopes: OAuth2Scopes[] = [];
    #subscriberCount: Integer | null = null;
    #syncedAt: Iso8601Timestamp | null = null;
    #syncing = false;
    #type: IntegrationTypes | null = null;
    #user: User | null = null;

    constructor(data: Partial<IntegrationStructure>) {
        this.patch(data);
    }

    get account() {
        return this.#account;
    }

    get application() {
        return this.#application;
    }

    get enableEmoticons() {
        return this.#enableEmoticons;
    }

    get enabled() {
        return this.#enabled;
    }

    get expireBehavior() {
        return this.#expireBehavior;
    }

    get expireGracePeriod() {
        return this.#expireGracePeriod;
    }

    get id() {
        return this.#id;
    }

    get name() {
        return this.#name;
    }

    get revoked() {
        return this.#revoked;
    }

    get roleId() {
        return this.#roleId;
    }

    get scopes() {
        return [...this.#scopes];
    }

    get subscriberCount() {
        return this.#subscriberCount;
    }

    get syncedAt() {
        return this.#syncedAt;
    }

    get syncing() {
        return this.#syncing;
    }

    get type() {
        return this.#type;
    }

    get user() {
        return this.#user;
    }

    patch(data: Partial<IntegrationStructure>) {
        if (data.account) {
            this.#account = new IntegrationAccount(data.account);
        }

        if (data.application) {
            this.#application = new IntegrationApplication(data.application);
        }

        this.#enableEmoticons = data.enable_emoticons ?? this.#enableEmoticons;
        this.#enabled = data.enabled ?? this.#enabled;
        this.#expireBehavior = data.expire_behavior ?? this.#expireBehavior;
        this.#expireGracePeriod = data.expire_grace_period ?? this.#expireGracePeriod;
        this.#id = data.id ?? this.#id;
        this.#name = data.name ?? this.#name;
        this.#revoked = data.revoked ?? this.#revoked;
        this.#roleId = data.role_id ?? this.#roleId;

        if (Array.isArray(data.scopes)) {
            this.#scopes = data.scopes ?? this.#scopes;
        }

        this.#subscriberCount = data.subscriber_count ?? this.#subscriberCount;
        this.#syncedAt = data.synced_at ?? this.#syncedAt;
        this.#syncing = data.syncing ?? this.#syncing;
        this.#type = data.type ?? this.#type;

        if (data.user) {
            this.#user = new User(data.user);
        }
    }

    toJSON(): Partial<IntegrationStructure> {
        return {
            account: this.#account?.toJSON() as IntegrationAccountStructure,
            application: this.#application?.toJSON() as IntegrationApplicationStructure,
            enable_emoticons: this.#enableEmoticons,
            enabled: this.#enabled,
            expire_behavior: this.#expireBehavior ?? undefined,
            expire_grace_period: this.#expireGracePeriod ?? undefined,
            id: this.#id ?? undefined,
            name: this.#name ?? undefined,
            revoked: this.#revoked,
            role_id: this.#roleId ?? undefined,
            scopes: this.#scopes,
            subscriber_count: this.#subscriberCount ?? undefined,
            synced_at: this.#syncedAt ?? undefined,
            syncing: this.#syncing,
            type: this.#type ?? undefined,
            user: this.#user?.toJSON() as UserStructure,
        };
    }
}

export class GuildMember {
    #avatar: string | null = null;
    #avatarDecorationData: AvatarDecorationData | null = null;
    #communicationDisabledUntil: Iso8601Timestamp | null = null;
    #deaf = false;
    #flags: BitfieldResolvable<GuildMemberFlags> = 0n;
    #joinedAt: Iso8601Timestamp | null = null;
    #mute = false;
    #nick: string | null = null;
    #pending = false;
    #permissions: string | null = null;
    #premiumSince: Iso8601Timestamp | null = null;
    #roles: Snowflake[] = [];
    #user: User | null = null;

    constructor(data: Partial<GuildMemberStructure>) {
        this.patch(data);
    }

    get avatar() {
        return this.#avatar;
    }

    get avatarDecorationData() {
        return this.#avatarDecorationData;
    }

    get communicationDisabledUntil() {
        return this.#communicationDisabledUntil;
    }

    get deaf() {
        return this.#deaf;
    }

    get flags() {
        return this.#flags;
    }

    get joinedAt() {
        return this.#joinedAt;
    }

    get mute() {
        return this.#mute;
    }

    get nick() {
        return this.#nick;
    }

    get pending() {
        return this.#pending;
    }

    get permissions() {
        return this.#permissions;
    }

    get premiumSince() {
        return this.#premiumSince;
    }

    get roles() {
        return [...this.#roles];
    }

    get user() {
        return this.#user;
    }

    patch(data: Partial<GuildMemberStructure>) {
        this.#avatar = data.avatar ?? this.#avatar;

        if (data.avatar_decoration_data) {
            this.#avatarDecorationData = new AvatarDecorationData(data.avatar_decoration_data);
        }

        this.#communicationDisabledUntil = data.communication_disabled_until ?? this.#communicationDisabledUntil;
        this.#deaf = data.deaf ?? this.#deaf;
        this.#flags = data.flags ?? this.#flags;
        this.#joinedAt = data.joined_at ?? this.#joinedAt;
        this.#mute = data.mute ?? this.#mute;
        this.#nick = data.nick ?? this.#nick;
        this.#pending = data.pending ?? this.#pending;
        this.#permissions = data.permissions ?? this.#permissions;
        this.#premiumSince = data.premium_since ?? this.#premiumSince;

        if (Array.isArray(data.roles)) {
            this.#roles = data.roles ?? this.#roles;
        }

        if (data.user) {
            this.#user = new User(data.user);
        }
    }

    toJSON(): Partial<GuildMemberStructure> {
        return {
            avatar: this.#avatar,
            avatar_decoration_data: this.#avatarDecorationData?.toJSON() as AvatarDecorationDataStructure,
            communication_disabled_until: this.#communicationDisabledUntil,
            deaf: this.#deaf,
            flags: this.#flags,
            joined_at: this.#joinedAt ?? undefined,
            mute: this.#mute,
            nick: this.#nick,
            pending: this.#pending,
            permissions: this.#permissions ?? undefined,
            premium_since: this.#premiumSince,
            roles: this.#roles,
            user: this.#user?.toJSON() as UserStructure,
        };
    }
}

export class GuildWidget {
    /**
     * @todo Implement Channel Class
     */
    #channels: Pick<ChannelStructure, "id" | "name" | "position">[] = [];
    #id: Snowflake | null = null;
    #instantInvite: string | null = null;
    #members: PickWithMethods<User, "discriminator" | "id" | "username">[] = [];
    #name: string | null = null;
    #presenceCount: Integer | null = null;

    constructor(data: Partial<GuildWidgetStructure>) {
        this.patch(data);
    }

    get channels() {
        return [...this.#channels];
    }

    get id() {
        return this.#id;
    }

    get instantInvite() {
        return this.#instantInvite;
    }

    get members() {
        return [...this.#members];
    }

    get name() {
        return this.#name;
    }

    get presenceCount() {
        return this.#presenceCount;
    }

    patch(data: Partial<GuildWidgetStructure>) {
        if (Array.isArray(data.channels)) {
            this.#channels = data.channels ?? this.#channels;
        }

        this.#id = data.id ?? this.#id;
        this.#instantInvite = data.instant_invite ?? this.#instantInvite;

        if (Array.isArray(data.members)) {
            this.#members = data.members.map((member) => new User(member));
        }

        this.#name = data.name ?? this.#name;
        this.#presenceCount = data.presence_count ?? this.#presenceCount;
    }

    toJSON(): Partial<GuildWidgetStructure> {
        return {
            channels: this.#channels,
            id: this.#id ?? undefined,
            instant_invite: this.#instantInvite,
            members: this.#members.map((member) => member.toJSON()) as UserStructure[],
            name: this.#name ?? undefined,
            presence_count: this.#presenceCount ?? undefined,
        };
    }
}

export class GuildWidgetSettings {
    #channelId: Snowflake | null = null;
    #enabled = false;

    constructor(data: Partial<GuildWidgetSettingsStructure>) {
        this.patch(data);
    }

    get channelId() {
        return this.#channelId;
    }

    get enabled() {
        return this.#enabled;
    }

    patch(data: Partial<GuildWidgetSettingsStructure>) {
        this.#channelId = data.channel_id ?? this.#channelId;
        this.#enabled = data.enabled ?? this.#enabled;
    }

    toJSON(): Partial<GuildWidgetSettingsStructure> {
        return {
            channel_id: this.#channelId,
            enabled: this.#enabled,
        };
    }
}

export class GuildPreview {
    #approximateMemberCount: Integer | null = null;
    #approximatePresenceCount: Integer | null = null;
    #description: string | null = null;
    #discoverySplash: string | null = null;
    #emojis: Emoji[] = [];
    #features: GuildFeatures[] = [];
    #icon: string | null = null;
    #id: Snowflake | null = null;
    #name: string | null = null;
    #splash: string | null = null;
    #stickers: Sticker[] = [];

    constructor(data: Partial<GuildPreviewStructure>) {
        this.patch(data);
    }

    get approximateMemberCount() {
        return this.#approximateMemberCount;
    }

    get approximatePresenceCount() {
        return this.#approximatePresenceCount;
    }

    get description() {
        return this.#description;
    }

    get discoverySplash() {
        return this.#discoverySplash;
    }

    get emojis() {
        return [...this.#emojis];
    }

    get features() {
        return [...this.#features];
    }

    get icon() {
        return this.#icon;
    }

    get id() {
        return this.#id;
    }

    get name() {
        return this.#name;
    }

    get splash() {
        return this.#splash;
    }

    get stickers() {
        return [...this.#stickers];
    }

    patch(data: Partial<GuildPreviewStructure>) {
        this.#approximateMemberCount = data.approximate_member_count ?? this.#approximateMemberCount;
        this.#approximatePresenceCount = data.approximate_presence_count ?? this.#approximatePresenceCount;
        this.#description = data.description ?? this.#description;
        this.#discoverySplash = data.discovery_splash ?? this.#discoverySplash;

        if (Array.isArray(data.emojis)) {
            this.#emojis = data.emojis.map((emoji) => new Emoji(emoji));
        }

        if (Array.isArray(data.features)) {
            this.#features = data.features ?? this.#features;
        }

        this.#icon = data.icon ?? this.#icon;
        this.#id = data.id ?? this.#id;
        this.#name = data.name ?? this.#name;
        this.#splash = data.splash ?? this.#splash;

        if (Array.isArray(data.stickers)) {
            this.#stickers = data.stickers.map((sticker) => new Sticker(sticker));
        }
    }

    toJSON(): Partial<GuildPreviewStructure> {
        return {
            approximate_member_count: this.#approximateMemberCount ?? undefined,
            approximate_presence_count: this.#approximatePresenceCount ?? undefined,
            description: this.#description,
            discovery_splash: this.#discoverySplash,
            emojis: this.#emojis.map((emoji) => emoji.toJSON()) as EmojiStructure[],
            features: this.#features,
            icon: this.#icon,
            id: this.#id ?? undefined,
            name: this.#name ?? undefined,
            splash: this.#splash,
            stickers: this.#stickers.map((sticker) => sticker.toJSON()) as StickerStructure[],
        };
    }
}

export class UnavailableGuild {
    #id: Snowflake | null = null;
    #unavailable = false;

    constructor(data: Partial<UnavailableGuildStructure>) {
        this.patch(data);
    }

    get id() {
        return this.#id;
    }

    get unavailable() {
        return this.#unavailable;
    }

    patch(data: Partial<UnavailableGuildStructure>) {
        this.#id = data.id ?? this.#id;
        this.#unavailable = data.unavailable ?? this.#unavailable;
    }

    toJSON(): Partial<UnavailableGuildStructure> {
        return {
            id: this.#id ?? undefined,
            unavailable: this.#unavailable,
        };
    }
}

export class Guild {
    #afkChannelId: Snowflake | null = null;
    #afkTimeout: Integer | null = null;
    #applicationId: Snowflake | null = null;
    #approximateMemberCount: Integer | null = null;
    #approximatePresenceCount: Integer | null = null;
    #banner: string | null = null;
    #defaultMessageNotifications: GuildDefaultMessageNotificationLevel | null = null;
    #description: string | null = null;
    #discoverySplash: string | null = null;
    #emojis: Emoji[] = [];
    #explicitContentFilter: GuildExplicitContentFilterLevel | null = null;
    #features: GuildFeatures[] = [];
    #icon: string | null = null;
    #iconHash: string | null = null;
    #id: Snowflake | null = null;
    #maxMembers: Integer | null = null;
    #maxPresences?: Integer | null = null;
    #maxStageVideoChannelUsers: Integer | null = null;
    #maxVideoChannelUsers: Integer | null = null;
    #mfaLevel: GuildMfaLevel | null = null;
    #name: string | null = null;
    #nsfwLevel: GuildNsfwLevel | null = null;
    #owner = false;
    #ownerId: Snowflake | null = null;
    #permissions: string | null = null;
    #preferredLocale: LocaleKeys | null = null;
    #premiumProgressBarEnabled = false;
    #premiumSubscriptionCount: Integer | null = null;
    #premiumTier: PremiumTier | null = null;
    #publicUpdatesChannelId: Snowflake | null = null;
    /**
     * @deprecated This field is deprecated and will be removed in a future API version
     */
    #region?: string | null = null;
    #roles: Role[] = [];
    #rulesChannelId: Snowflake | null = null;
    #safetyAlertsChannelId: Snowflake | null = null;
    #splash: string | null = null;
    #stickers: Sticker[] = [];
    #systemChannelFlags: SystemChannelFlags | null = null;
    #systemChannelId: Snowflake | null = null;
    #vanityUrlCode: string | null = null;
    #verificationLevel: GuildVerificationLevel | null = null;
    #welcomeScreen: WelcomeScreen | null = null;
    #widgetChannelId: Snowflake | null = null;
    #widgetEnabled = false;

    constructor(data: Partial<GuildStructure>) {
        this.patch(data);
    }

    get afkChannelId() {
        return this.#afkChannelId;
    }

    get afkTimeout() {
        return this.#afkTimeout;
    }

    get applicationId() {
        return this.#applicationId;
    }

    get approximateMemberCount() {
        return this.#approximateMemberCount;
    }

    get approximatePresenceCount() {
        return this.#approximatePresenceCount;
    }

    get banner() {
        return this.#banner;
    }

    get defaultMessageNotifications() {
        return this.#defaultMessageNotifications;
    }

    get description() {
        return this.#description;
    }

    get discoverySplash() {
        return this.#discoverySplash;
    }

    get emojis() {
        return [...this.#emojis];
    }

    get explicitContentFilter() {
        return this.#explicitContentFilter;
    }

    get features() {
        return [...this.#features];
    }

    get icon() {
        return this.#icon;
    }

    get iconHash() {
        return this.#iconHash;
    }

    get id() {
        return this.#id;
    }

    get maxMembers() {
        return this.#maxMembers;
    }

    get maxPresences() {
        return this.#maxPresences;
    }

    get maxStageVideoChannelUsers() {
        return this.#maxStageVideoChannelUsers;
    }

    get maxVideoChannelUsers() {
        return this.#maxVideoChannelUsers;
    }

    get mfaLevel() {
        return this.#mfaLevel;
    }

    get name() {
        return this.#name;
    }

    get nsfwLevel() {
        return this.#nsfwLevel;
    }

    get owner() {
        return this.#owner;
    }

    get ownerId() {
        return this.#ownerId;
    }

    get permissions() {
        return this.#permissions;
    }

    get preferredLocale() {
        return this.#preferredLocale;
    }

    get premiumProgressBarEnabled() {
        return this.#premiumProgressBarEnabled;
    }

    get premiumSubscriptionCount() {
        return this.#premiumSubscriptionCount;
    }

    get premiumTier() {
        return this.#premiumTier;
    }

    get publicUpdatesChannelId() {
        return this.#publicUpdatesChannelId;
    }

    get region() {
        return this.#region;
    }

    get roles() {
        return [...this.#roles];
    }

    get rulesChannelId() {
        return this.#rulesChannelId;
    }

    get safetyAlertsChannelId() {
        return this.#safetyAlertsChannelId;
    }

    get splash() {
        return this.#splash;
    }

    get stickers() {
        return [...this.#stickers];
    }

    get systemChannelFlags() {
        return this.#systemChannelFlags;
    }

    get systemChannelId() {
        return this.#systemChannelId;
    }

    get vanityUrlCode() {
        return this.#vanityUrlCode;
    }

    get verificationLevel() {
        return this.#verificationLevel;
    }

    get welcomeScreen() {
        return this.#welcomeScreen;
    }

    get widgetChannelId() {
        return this.#widgetChannelId;
    }

    get widgetEnabled() {
        return this.#widgetEnabled;
    }

    patch(data: Partial<GuildStructure>) {
        this.#afkChannelId = data.afk_channel_id ?? this.#afkChannelId;
        this.#afkTimeout = data.afk_timeout ?? this.#afkTimeout;
        this.#applicationId = data.application_id ?? this.#applicationId;
        this.#approximateMemberCount = data.approximate_member_count ?? this.#approximateMemberCount;
        this.#approximatePresenceCount = data.approximate_presence_count ?? this.#approximatePresenceCount;
        this.#banner = data.banner ?? this.#banner;
        this.#defaultMessageNotifications = data.default_message_notifications ?? this.#defaultMessageNotifications;
        this.#description = data.description ?? this.#description;
        this.#discoverySplash = data.discovery_splash ?? this.#discoverySplash;

        if (Array.isArray(data.emojis)) {
            this.#emojis = data.emojis.map((emoji) => new Emoji(emoji));
        }

        this.#explicitContentFilter = data.explicit_content_filter ?? this.#explicitContentFilter;

        if (Array.isArray(data.features)) {
            this.#features = data.features ?? this.#features;
        }

        this.#icon = data.icon ?? this.#icon;
        this.#iconHash = data.icon_hash ?? this.#iconHash;
        this.#id = data.id ?? this.#id;
        this.#maxMembers = data.max_members ?? this.#maxMembers;
        this.#maxPresences = data.max_presences ?? this.#maxPresences;
        this.#maxStageVideoChannelUsers = data.max_stage_video_channel_users ?? this.#maxStageVideoChannelUsers;
        this.#maxVideoChannelUsers = data.max_video_channel_users ?? this.#maxVideoChannelUsers;
        this.#mfaLevel = data.mfa_level ?? this.#mfaLevel;
        this.#name = data.name ?? this.#name;
        this.#nsfwLevel = data.nsfw_level ?? this.#nsfwLevel;
        this.#owner = data.owner ?? this.#owner;
        this.#ownerId = data.owner_id ?? this.#ownerId;
        this.#permissions = data.permissions ?? this.#permissions;
        this.#preferredLocale = data.preferred_locale ?? this.#preferredLocale;
        this.#premiumProgressBarEnabled = data.premium_progress_bar_enabled ?? this.#premiumProgressBarEnabled;
        this.#premiumSubscriptionCount = data.premium_subscription_count ?? this.#premiumSubscriptionCount;
        this.#premiumTier = data.premium_tier ?? this.#premiumTier;
        this.#publicUpdatesChannelId = data.public_updates_channel_id ?? this.#publicUpdatesChannelId;
        this.#region = data.region ?? this.#region;

        if (Array.isArray(data.roles)) {
            this.#roles = data.roles.map((role) => new Role(role));
        }

        this.#rulesChannelId = data.rules_channel_id ?? this.#rulesChannelId;
        this.#safetyAlertsChannelId = data.safety_alerts_channel_id ?? this.#safetyAlertsChannelId;
        this.#splash = data.splash ?? this.#splash;

        if (Array.isArray(data.stickers)) {
            this.#stickers = data.stickers.map((sticker) => new Sticker(sticker));
        }

        this.#systemChannelFlags = data.system_channel_flags ?? this.#systemChannelFlags;
        this.#systemChannelId = data.system_channel_id ?? this.#systemChannelId;
        this.#vanityUrlCode = data.vanity_url_code ?? this.#vanityUrlCode;
        this.#verificationLevel = data.verification_level ?? this.#verificationLevel;

        if (data.welcome_screen) {
            this.#welcomeScreen = new WelcomeScreen(data.welcome_screen);
        }

        this.#widgetChannelId = data.widget_channel_id ?? this.#widgetChannelId;
        this.#widgetEnabled = data.widget_enabled ?? this.#widgetEnabled;
    }

    toJSON(): Partial<GuildStructure> {
        return {
            afk_channel_id: this.#afkChannelId,
            afk_timeout: this.#afkTimeout ?? undefined,
            application_id: this.#applicationId,
            approximate_member_count: this.#approximateMemberCount ?? undefined,
            approximate_presence_count: this.#approximatePresenceCount ?? undefined,
            banner: this.#banner,
            default_message_notifications: this.#defaultMessageNotifications ?? undefined,
            description: this.#description,
            discovery_splash: this.#discoverySplash,
            emojis: this.#emojis.map((emoji) => emoji.toJSON()) as EmojiStructure[],
            explicit_content_filter: this.#explicitContentFilter ?? undefined,
            features: this.#features,
            icon: this.#icon,
            icon_hash: this.#iconHash,
            id: this.#id ?? undefined,
            max_members: this.#maxMembers ?? undefined,
            max_presences: this.#maxPresences,
            max_stage_video_channel_users: this.#maxStageVideoChannelUsers ?? undefined,
            max_video_channel_users: this.#maxVideoChannelUsers ?? undefined,
            mfa_level: this.#mfaLevel ?? undefined,
            name: this.#name ?? undefined,
            nsfw_level: this.#nsfwLevel ?? undefined,
            owner: this.#owner,
            owner_id: this.#ownerId ?? undefined,
            permissions: this.#permissions ?? undefined,
            preferred_locale: this.#preferredLocale ?? undefined,
            premium_progress_bar_enabled: this.#premiumProgressBarEnabled,
            premium_subscription_count: this.#premiumSubscriptionCount ?? undefined,
            premium_tier: this.#premiumTier ?? undefined,
            public_updates_channel_id: this.#publicUpdatesChannelId,
            region: this.#region ?? undefined,
            roles: this.#roles.map((role) => role.toJSON()) as RoleStructure[],
            rules_channel_id: this.#rulesChannelId,
            safety_alerts_channel_id: this.#safetyAlertsChannelId,
            splash: this.#splash,
            stickers: this.#stickers.map((sticker) => sticker.toJSON()) as StickerStructure[],
            system_channel_flags: this.#systemChannelFlags ?? undefined,
            system_channel_id: this.#systemChannelId,
            vanity_url_code: this.#vanityUrlCode,
            verification_level: this.#verificationLevel ?? undefined,
            welcome_screen: this.#welcomeScreen?.toJSON() as WelcomeScreenStructure,
            widget_channel_id: this.#widgetChannelId,
            widget_enabled: this.#widgetEnabled,
        };
    }
}
