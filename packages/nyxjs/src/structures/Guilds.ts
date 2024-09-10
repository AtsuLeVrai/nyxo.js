import type {
    BanStructure,
    DefaultMessageNotificationLevels,
    ExplicitContentFilterLevels,
    GuildFeatures,
    GuildMemberFlags,
    GuildMemberStructure,
    GuildPreviewStructure,
    GuildStructure,
    Integer,
    IsoO8601Timestamp,
    Locales,
    MfaLevels,
    NsfwLevels,
    PremiumTiers,
    Snowflake,
    SystemChannelFlags,
    UnavailableGuildStructure,
    VerificationLevels,
} from "@nyxjs/core";
import { Base } from "./Base";
import { Emoji } from "./Emojis";
import { Role } from "./Roles";
import { Sticker } from "./Stickers";
import { AvatarDecorationData, User } from "./Users";
import { WelcomeScreen } from "./WelcomeScreen";

export class Ban extends Base<BanStructure> {
    public reason!: string | null;

    public user!: User;

    public constructor(data: Readonly<Partial<BanStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<BanStructure>>): void {
        if (data.reason !== undefined) {
            this.reason = data.reason;
        }

        if (data.user !== undefined) {
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

    public constructor(data: Readonly<Partial<GuildMemberStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<GuildMemberStructure>>): void {
        if ("avatar" in data) {
            if (data.avatar === null) {
                this.avatar = undefined;
            } else if (data.avatar !== undefined) {
                this.avatar = data.avatar;
            }
        }

        if ("avatar_decoration_data" in data) {
            if (data.avatar_decoration_data === null) {
                this.avatarDecorationData = undefined;
            } else if (data.avatar_decoration_data !== undefined) {
                this.avatarDecorationData = AvatarDecorationData.from(data.avatar_decoration_data);
            }
        }

        if ("communication_disabled_until" in data) {
            if (data.communication_disabled_until === null) {
                this.communicationDisabledUntil = undefined;
            } else if (data.communication_disabled_until !== undefined) {
                this.communicationDisabledUntil = data.communication_disabled_until;
            }
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

        if ("nick" in data) {
            if (data.nick === null) {
                this.nick = undefined;
            } else if (data.nick !== undefined) {
                this.nick = data.nick;
            }
        }

        if ("pending" in data) {
            if (data.pending === null) {
                this.pending = undefined;
            } else if (data.pending !== undefined) {
                this.pending = data.pending;
            }
        }

        if ("permissions" in data) {
            if (data.permissions === null) {
                this.permissions = undefined;
            } else if (data.permissions !== undefined) {
                this.permissions = data.permissions;
            }
        }

        if ("premium_since" in data) {
            if (data.premium_since === null) {
                this.premiumSince = undefined;
            } else if (data.premium_since !== undefined) {
                this.premiumSince = data.premium_since;
            }
        }

        if (data.roles !== undefined) {
            this.roles = data.roles;
        }

        if ("user" in data) {
            if (data.user === null) {
                this.user = undefined;
            } else if (data.user !== undefined) {
                this.user = User.from(data.user);
            }
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

    public constructor(data: Readonly<Partial<GuildPreviewStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<GuildPreviewStructure>>): void {
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

    public constructor(data: Readonly<Partial<UnavailableGuildStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<UnavailableGuildStructure>>): void {
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

    public constructor(data: Readonly<Partial<GuildStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<GuildStructure>>): void {
        if (data.afk_channel_id !== undefined) {
            this.afkChannelId = data.afk_channel_id;
        }

        if (data.afk_timeout !== undefined) {
            this.afkTimeout = data.afk_timeout;
        }

        if ("application_id" in data) {
            if (data.application_id === null) {
                this.applicationId = undefined;
            } else if (data.application_id !== undefined) {
                this.applicationId = data.application_id;
            }
        }

        if ("approximate_member_count" in data) {
            if (data.approximate_member_count === null) {
                this.approximateMemberCount = undefined;
            } else if (data.approximate_member_count !== undefined) {
                this.approximateMemberCount = data.approximate_member_count;
            }
        }

        if ("approximate_presence_count" in data) {
            if (data.approximate_presence_count === null) {
                this.approximatePresenceCount = undefined;
            } else if (data.approximate_presence_count !== undefined) {
                this.approximatePresenceCount = data.approximate_presence_count;
            }
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

        if ("icon_hash" in data) {
            if (data.icon_hash === null) {
                this.iconHash = undefined;
            } else if (data.icon_hash !== undefined) {
                this.iconHash = data.icon_hash;
            }
        }

        if (data.id !== undefined) {
            this.id = data.id;
        }

        if (data.max_members !== undefined) {
            this.maxMembers = data.max_members;
        }

        if ("max_presences" in data) {
            if (data.max_presences === null) {
                this.maxPresences = undefined;
            } else if (data.max_presences !== undefined) {
                this.maxPresences = data.max_presences;
            }
        }

        if ("max_stage_video_channel_users" in data) {
            if (data.max_stage_video_channel_users === null) {
                this.maxStageVideoChannelUsers = undefined;
            } else if (data.max_stage_video_channel_users !== undefined) {
                this.maxStageVideoChannelUsers = data.max_stage_video_channel_users;
            }
        }

        if ("max_video_channel_users" in data) {
            if (data.max_video_channel_users === null) {
                this.maxVideoChannelUsers = undefined;
            } else if (data.max_video_channel_users !== undefined) {
                this.maxVideoChannelUsers = data.max_video_channel_users;
            }
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

        if ("owner" in data) {
            if (data.owner === null) {
                this.owner = undefined;
            } else if (data.owner !== undefined) {
                this.owner = data.owner;
            }
        }

        if (data.owner_id !== undefined) {
            this.ownerId = data.owner_id;
        }

        if ("permissions" in data) {
            if (data.permissions === null) {
                this.permissions = undefined;
            } else if (data.permissions !== undefined) {
                this.permissions = data.permissions;
            }
        }

        if (data.preferred_locale !== undefined) {
            this.preferredLocale = data.preferred_locale;
        }

        if (data.premium_progress_bar_enabled !== undefined) {
            this.premiumProgressBarEnabled = data.premium_progress_bar_enabled;
        }

        if ("premium_subscription_count" in data) {
            if (data.premium_subscription_count === null) {
                this.premiumSubscriptionCount = undefined;
            } else if (data.premium_subscription_count !== undefined) {
                this.premiumSubscriptionCount = data.premium_subscription_count;
            }
        }

        if (data.premium_tier !== undefined) {
            this.premiumTier = data.premium_tier;
        }

        if (data.public_updates_channel_id !== undefined) {
            this.publicUpdatesChannelId = data.public_updates_channel_id;
        }

        if ("region" in data) {
            if (data.region === null) {
                this.region = undefined;
            } else if (data.region !== undefined) {
                this.region = data.region;
            }
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

        if ("stickers" in data) {
            if (data.stickers === null) {
                this.stickers = undefined;
            } else if (data.stickers !== undefined) {
                this.stickers = data.stickers.map((sticker) => Sticker.from(sticker));
            }
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

        if ("welcome_screen" in data) {
            if (data.welcome_screen === null) {
                this.welcomeScreen = undefined;
            } else if (data.welcome_screen !== undefined) {
                this.welcomeScreen = WelcomeScreen.from(data.welcome_screen);
            }
        }

        if (data.widget_channel_id !== undefined) {
            this.widgetChannelId = data.widget_channel_id;
        }

        if (data.widget_enabled !== undefined) {
            this.widgetEnabled = data.widget_enabled;
        }
    }
}

export {
    DefaultMessageNotificationLevels,
    ExplicitContentFilterLevels,
    GuildFeatures,
    GuildMemberFlags,
    MfaLevels,
    NsfwLevels,
    PremiumTiers,
    SystemChannelFlags,
    VerificationLevels,
} from "@nyxjs/core";
