import type {
    ChannelFlags,
    ChannelStructure,
    ChannelTypes,
    DefaultReactionStructure,
    FollowedChannelStructure,
    ForumLayoutTypes,
    ForumTagStructure,
    Integer,
    IsoO8601Timestamp,
    OverwriteStructure,
    OverwriteTypes,
    Snowflake,
    SortOrderTypes,
    ThreadMemberStructure,
    ThreadMetadataStructure,
    VideoQualityModes,
} from "@nyxjs/core";
import { Base } from "./Base";
import { GuildMember } from "./Guilds";
import { User } from "./Users";

export class ForumTag extends Base<ForumTagStructure> {
    public emojiId!: Snowflake | null;

    public emojiName!: string | null;

    public id!: Snowflake;

    public moderated!: boolean;

    public name!: string;

    public constructor(data: Readonly<Partial<ForumTagStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<ForumTagStructure>>): void {
        if (data.emoji_id !== undefined) {
            this.emojiId = data.emoji_id;
        }

        if (data.emoji_name !== undefined) {
            this.emojiName = data.emoji_name;
        }

        if (data.id !== undefined) {
            this.id = data.id;
        }

        if (data.moderated !== undefined) {
            this.moderated = data.moderated;
        }

        if (data.name !== undefined) {
            this.name = data.name;
        }
    }
}

export class DefaultReaction extends Base<DefaultReactionStructure> {
    public emojiId!: Snowflake | null;

    public emojiName!: string | null;

    public constructor(data: Readonly<Partial<DefaultReactionStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<DefaultReactionStructure>>): void {
        if (data.emoji_id !== undefined) {
            this.emojiId = data.emoji_id;
        }

        if (data.emoji_name !== undefined) {
            this.emojiName = data.emoji_name;
        }
    }
}

export class ThreadMember extends Base<ThreadMemberStructure> {
    public flags!: Integer;

    public id?: Snowflake;

    public joinTimestamp!: IsoO8601Timestamp;

    public member!: GuildMember;

    public userId?: Snowflake;

    public constructor(data: Readonly<Partial<ThreadMemberStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<ThreadMemberStructure>>): void {
        if (data.flags !== undefined) {
            this.flags = data.flags;
        }

        if ("id" in data) {
            if (data.id === null) {
                this.id = undefined;
            } else if (data.id !== undefined) {
                this.id = data.id;
            }
        }

        if (data.join_timestamp !== undefined) {
            this.joinTimestamp = data.join_timestamp;
        }

        if (data.member !== undefined) {
            this.member = GuildMember.from(data.member);
        }

        if ("user_id" in data) {
            if (data.user_id === null) {
                this.userId = undefined;
            } else if (data.user_id !== undefined) {
                this.userId = data.user_id;
            }
        }
    }
}

export class ThreadMetadata extends Base<ThreadMetadataStructure> {
    public archiveTimestamp!: IsoO8601Timestamp;

    public archived!: boolean;

    public autoArchiveDuration!: Integer;

    public createTimestamp?: IsoO8601Timestamp | null;

    public invitable?: boolean;

    public locked!: boolean;

    public constructor(data: Readonly<Partial<ThreadMetadataStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<ThreadMetadataStructure>>): void {
        if (data.archive_timestamp !== undefined) {
            this.archiveTimestamp = data.archive_timestamp;
        }

        if (data.archived !== undefined) {
            this.archived = data.archived;
        }

        if (data.auto_archive_duration !== undefined) {
            this.autoArchiveDuration = data.auto_archive_duration;
        }

        if ("create_timestamp" in data) {
            if (data.create_timestamp === null) {
                this.createTimestamp = undefined;
            } else if (data.create_timestamp !== undefined) {
                this.createTimestamp = data.create_timestamp;
            }
        }

        if ("invitable" in data) {
            if (data.invitable === null) {
                this.invitable = undefined;
            } else if (data.invitable !== undefined) {
                this.invitable = data.invitable;
            }
        }

        if (data.locked !== undefined) {
            this.locked = data.locked;
        }
    }
}

export class ChannelOverwrite extends Base<OverwriteStructure> {
    public allow!: string;

    public deny!: string;

    public id!: Snowflake;

    public type!: OverwriteTypes;

    public constructor(data: Readonly<Partial<OverwriteStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<OverwriteStructure>>): void {
        if (data.allow !== undefined) {
            this.allow = data.allow;
        }

        if (data.deny !== undefined) {
            this.deny = data.deny;
        }

        if (data.id !== undefined) {
            this.id = data.id;
        }

        if (data.type !== undefined) {
            this.type = data.type;
        }
    }
}

export class FollowedChannel extends Base<FollowedChannelStructure> {
    public channelId!: Snowflake;

    public webhookId!: Snowflake;

    public constructor(data: Readonly<Partial<FollowedChannelStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<FollowedChannelStructure>>): void {
        if (data.channel_id !== undefined) {
            this.channelId = data.channel_id;
        }

        if (data.webhook_id !== undefined) {
            this.webhookId = data.webhook_id;
        }
    }
}

export class BaseChannel extends Base<ChannelStructure> {
    public flags?: ChannelFlags;

    public guildId?: Snowflake;

    public id!: Snowflake;

    public lastMessageId?: Snowflake | null;

    public lastPinTimestamp?: IsoO8601Timestamp | null;

    public name?: string | null;

    public nsfw!: boolean;

    public parentId?: Snowflake | null;

    public permissionOverwrites?: ChannelOverwrite[];

    public permissions?: string;

    public position?: Integer;

    public rateLimitPerUser?: Integer;

    public topic?: string | null;

    public type!: ChannelTypes;

    public constructor(data: Readonly<Partial<ChannelStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<ChannelStructure>>): void {
        if ("flags" in data) {
            if (data.flags === null) {
                this.flags = undefined;
            } else if (data.flags !== undefined) {
                this.flags = data.flags;
            }
        }

        if ("guild_id" in data) {
            if (data.guild_id === null) {
                this.guildId = undefined;
            } else if (data.guild_id !== undefined) {
                this.guildId = data.guild_id;
            }
        }

        if (data.id !== undefined) {
            this.id = data.id;
        }

        if ("last_message_id" in data) {
            if (data.last_message_id === null) {
                this.lastMessageId = undefined;
            } else if (data.last_message_id !== undefined) {
                this.lastMessageId = data.last_message_id;
            }
        }

        if ("last_pin_timestamp" in data) {
            if (data.last_pin_timestamp === null) {
                this.lastPinTimestamp = undefined;
            } else if (data.last_pin_timestamp !== undefined) {
                this.lastPinTimestamp = data.last_pin_timestamp;
            }
        }

        if ("name" in data) {
            if (data.name === null) {
                this.name = undefined;
            } else if (data.name !== undefined) {
                this.name = data.name;
            }
        }

        if (data.nsfw !== undefined) {
            this.nsfw = data.nsfw;
        }

        if ("parent_id" in data) {
            if (data.parent_id === null) {
                this.parentId = undefined;
            } else if (data.parent_id !== undefined) {
                this.parentId = data.parent_id;
            }
        }

        if ("permission_overwrites" in data) {
            if (data.permission_overwrites === null) {
                this.permissionOverwrites = undefined;
            } else if (data.permission_overwrites !== undefined) {
                this.permissionOverwrites = data.permission_overwrites.map((overwrite) =>
                    ChannelOverwrite.from(overwrite)
                );
            }
        }

        if ("permissions" in data) {
            if (data.permissions === null) {
                this.permissions = undefined;
            } else if (data.permissions !== undefined) {
                this.permissions = data.permissions;
            }
        }

        if ("position" in data) {
            if (data.position === null) {
                this.position = undefined;
            } else if (data.position !== undefined) {
                this.position = data.position;
            }
        }

        if ("rate_limit_per_user" in data) {
            if (data.rate_limit_per_user === null) {
                this.rateLimitPerUser = undefined;
            } else if (data.rate_limit_per_user !== undefined) {
                this.rateLimitPerUser = data.rate_limit_per_user;
            }
        }

        if ("topic" in data) {
            if (data.topic === null) {
                this.topic = undefined;
            } else if (data.topic !== undefined) {
                this.topic = data.topic;
            }
        }

        if (data.type !== undefined) {
            this.type = data.type;
        }
    }
}

export class TextChannel extends BaseChannel {}

export class DMChannel extends BaseChannel {
    public applicationId?: Snowflake;

    public icon?: string | null;

    public managed?: boolean;

    public ownerId?: Snowflake;

    public recipients?: User[];

    public constructor(data: Readonly<Partial<ChannelStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<ChannelStructure>>): void {
        if ("application_id" in data) {
            if (data.application_id === null) {
                this.applicationId = undefined;
            } else if (data.application_id !== undefined) {
                this.applicationId = data.application_id;
            }
        }

        if ("icon" in data) {
            if (data.icon === null) {
                this.icon = undefined;
            } else if (data.icon !== undefined) {
                this.icon = data.icon;
            }
        }

        if ("managed" in data) {
            if (data.managed === null) {
                this.managed = undefined;
            } else if (data.managed !== undefined) {
                this.managed = data.managed;
            }
        }

        if ("owner_id" in data) {
            if (data.owner_id === null) {
                this.ownerId = undefined;
            } else if (data.owner_id !== undefined) {
                this.ownerId = data.owner_id;
            }
        }

        if ("recipients" in data) {
            if (data.recipients === null) {
                this.recipients = undefined;
            } else if (data.recipients !== undefined) {
                this.recipients = data.recipients.map((recipient) => User.from(recipient));
            }
        }
    }
}

export class VoiceChannel extends BaseChannel {
    public bitrate?: Integer;

    public rtcRegion?: string | null;

    public userLimit?: Integer;

    public videoQualityMode?: VideoQualityModes;

    public constructor(data: Readonly<Partial<ChannelStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<ChannelStructure>>): void {
        if ("bitrate" in data) {
            if (data.bitrate === null) {
                this.bitrate = undefined;
            } else if (data.bitrate !== undefined) {
                this.bitrate = data.bitrate;
            }
        }

        if ("rtc_region" in data) {
            if (data.rtc_region === null) {
                this.rtcRegion = undefined;
            } else if (data.rtc_region !== undefined) {
                this.rtcRegion = data.rtc_region;
            }
        }

        if ("user_limit" in data) {
            if (data.user_limit === null) {
                this.userLimit = undefined;
            } else if (data.user_limit !== undefined) {
                this.userLimit = data.user_limit;
            }
        }

        if ("video_quality_mode" in data) {
            if (data.video_quality_mode === null) {
                this.videoQualityMode = undefined;
            } else if (data.video_quality_mode !== undefined) {
                this.videoQualityMode = data.video_quality_mode;
            }
        }
    }
}

export class CategoryChannel extends BaseChannel {
    public constructor(data: Readonly<Partial<ChannelStructure>> = {}) {
        super(data);
    }
}

export class AnnouncementChannel extends BaseChannel {
    public constructor(data: Readonly<Partial<ChannelStructure>> = {}) {
        super(data);
    }
}

export class ThreadChannel extends BaseChannel {
    public defaultAutoArchiveDuration?: Integer;

    public defaultThreadRateLimitPerUser?: Integer;

    public member?: ThreadMember;

    public memberCount?: Integer;

    public messageCount?: Integer;

    public ownerId?: Snowflake;

    public threadMetadata?: ThreadMetadata;

    public totalMessageSent?: Integer;

    public constructor(data: Readonly<Partial<ChannelStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<ChannelStructure>>): void {
        if ("default_auto_archive_duration" in data) {
            if (data.default_auto_archive_duration === null) {
                this.defaultAutoArchiveDuration = undefined;
            } else if (data.default_auto_archive_duration !== undefined) {
                this.defaultAutoArchiveDuration = data.default_auto_archive_duration;
            }
        }

        if ("default_thread_rate_limit_per_user" in data) {
            if (data.default_thread_rate_limit_per_user === null) {
                this.defaultThreadRateLimitPerUser = undefined;
            } else if (data.default_thread_rate_limit_per_user !== undefined) {
                this.defaultThreadRateLimitPerUser = data.default_thread_rate_limit_per_user;
            }
        }

        if ("member" in data) {
            if (data.member === null) {
                this.member = undefined;
            } else if (data.member !== undefined) {
                this.member = ThreadMember.from(data.member);
            }
        }

        if ("member_count" in data) {
            if (data.member_count === null) {
                this.memberCount = undefined;
            } else if (data.member_count !== undefined) {
                this.memberCount = data.member_count;
            }
        }

        if ("message_count" in data) {
            if (data.message_count === null) {
                this.messageCount = undefined;
            } else if (data.message_count !== undefined) {
                this.messageCount = data.message_count;
            }
        }

        if ("owner_id" in data) {
            if (data.owner_id === null) {
                this.ownerId = undefined;
            } else if (data.owner_id !== undefined) {
                this.ownerId = data.owner_id;
            }
        }

        if ("thread_metadata" in data) {
            if (data.thread_metadata === null) {
                this.threadMetadata = undefined;
            } else if (data.thread_metadata !== undefined) {
                this.threadMetadata = ThreadMetadata.from(data.thread_metadata);
            }
        }

        if ("total_message_sent" in data) {
            if (data.total_message_sent === null) {
                this.totalMessageSent = undefined;
            } else if (data.total_message_sent !== undefined) {
                this.totalMessageSent = data.total_message_sent;
            }
        }
    }
}

export class StageVoiceChannel extends BaseChannel {
    public constructor(data: Readonly<Partial<ChannelStructure>> = {}) {
        super(data);
    }
}

export class DirectoryChannel extends BaseChannel {
    public constructor(data: Readonly<Partial<ChannelStructure>> = {}) {
        super(data);
    }
}

export class ForumChannel extends BaseChannel {
    public appliedTags?: Snowflake[];

    public availableTags?: ForumTag[];

    public defaultForumLayout?: ForumLayoutTypes;

    public defaultReactionEmoji?: DefaultReaction | null;

    public defaultSortOrder!: SortOrderTypes | null;

    public constructor(data: Readonly<Partial<ChannelStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<ChannelStructure>>): void {
        if ("applied_tags" in data) {
            if (data.applied_tags === null) {
                this.appliedTags = undefined;
            } else if (data.applied_tags !== undefined) {
                this.appliedTags = data.applied_tags;
            }
        }

        if ("available_tags" in data) {
            if (data.available_tags === null) {
                this.availableTags = undefined;
            } else if (data.available_tags !== undefined) {
                this.availableTags = data.available_tags.map((tag) => ForumTag.from(tag));
            }
        }

        if ("default_forum_layout" in data) {
            if (data.default_forum_layout === null) {
                this.defaultForumLayout = undefined;
            } else if (data.default_forum_layout !== undefined) {
                this.defaultForumLayout = data.default_forum_layout;
            }
        }

        if ("default_reaction_emoji" in data) {
            if (data.default_reaction_emoji === null) {
                this.defaultReactionEmoji = undefined;
            } else if (data.default_reaction_emoji !== undefined) {
                this.defaultReactionEmoji = DefaultReaction.from(data.default_reaction_emoji);
            }
        }

        if (data.default_sort_order !== undefined) {
            this.defaultSortOrder = data.default_sort_order;
        }
    }
}

export class MediaChannel extends BaseChannel {
    public appliedTags?: Snowflake[];

    public availableTags?: ForumTag[];

    public defaultReactionEmoji?: DefaultReaction | null;

    public defaultSortOrder!: SortOrderTypes | null;

    public constructor(data: Readonly<Partial<ChannelStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<ChannelStructure>>): void {
        if ("applied_tags" in data) {
            if (data.applied_tags === null) {
                this.appliedTags = undefined;
            } else if (data.applied_tags !== undefined) {
                this.appliedTags = data.applied_tags;
            }
        }

        if ("available_tags" in data) {
            if (data.available_tags === null) {
                this.availableTags = undefined;
            } else if (data.available_tags !== undefined) {
                this.availableTags = data.available_tags.map((tag) => ForumTag.from(tag));
            }
        }

        if ("default_reaction_emoji" in data) {
            if (data.default_reaction_emoji === null) {
                this.defaultReactionEmoji = undefined;
            } else if (data.default_reaction_emoji !== undefined) {
                this.defaultReactionEmoji = DefaultReaction.from(data.default_reaction_emoji);
            }
        }

        if (data.default_sort_order !== undefined) {
            this.defaultSortOrder = data.default_sort_order;
        }
    }
}
