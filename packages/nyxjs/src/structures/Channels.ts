import type { Integer, IsoO8601Timestamp, Snowflake } from "@nyxjs/core";
import type {
    ChannelFlags,
    ChannelStructure,
    ChannelTypes,
    DefaultReactionStructure,
    FollowedChannelStructure,
    ForumLayoutTypes,
    ForumTagStructure,
    OverwriteStructure,
    OverwriteTypes,
    SortOrderTypes,
    ThreadMemberStructure,
    ThreadMetadataStructure,
    VideoQualityModes,
} from "@nyxjs/rest";
import { Base } from "./Base";
import { GuildMember } from "./Guilds";
import { User } from "./Users";

export class ForumTag extends Base<ForumTagStructure> {
    public emojiId!: Snowflake | null;

    public emojiName!: string | null;

    public id!: Snowflake;

    public moderated!: boolean;

    public name!: string;

    public constructor(data: Partial<ForumTagStructure>) {
        super(data);
    }

    protected patch(data: Partial<ForumTagStructure>) {
        this.emojiId = data.emoji_id ?? this.emojiId;
        this.emojiName = data.emoji_name ?? this.emojiName;
        this.id = data.id ?? this.id;
        this.moderated = data.moderated ?? this.moderated;
        this.name = data.name ?? this.name;
    }
}

export class DefaultReaction extends Base<DefaultReactionStructure> {
    public emojiId!: Snowflake | null;

    public emojiName!: string | null;

    public constructor(data: Partial<DefaultReactionStructure>) {
        super(data);
    }

    protected patch(data: Partial<DefaultReactionStructure>): void {
        this.emojiId = data.emoji_id ?? this.emojiId;
        this.emojiName = data.emoji_name ?? this.emojiName;
    }
}

export class ThreadMember extends Base<ThreadMemberStructure> {
    public flags!: Integer;

    public id?: Snowflake;

    public joinTimestamp!: IsoO8601Timestamp;

    public member!: GuildMember;

    public userId?: Snowflake;

    public constructor(data: Partial<ThreadMemberStructure>) {
        super(data);
    }

    protected patch(data: Partial<ThreadMemberStructure>): void {
        this.flags = data.flags ?? this.flags;
        if ("id" in data) {
            this.id = data.id;
        }

        this.joinTimestamp = data.join_timestamp ?? this.joinTimestamp;
        this.member = data.member ? GuildMember.from(data.member) : this.member;
        if ("user_id" in data) {
            this.userId = data.user_id;
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

    public constructor(data: Partial<ThreadMetadataStructure>) {
        super(data);
    }

    protected patch(data: Partial<ThreadMetadataStructure>): void {
        this.archiveTimestamp = data.archive_timestamp ?? this.archiveTimestamp;
        this.archived = data.archived ?? this.archived;
        this.autoArchiveDuration = data.auto_archive_duration ?? this.autoArchiveDuration;
        if ("create_timestamp" in data) {
            this.createTimestamp = data.create_timestamp;
        }

        if ("invitable" in data) {
            this.invitable = data.invitable;
        }

        this.locked = data.locked ?? this.locked;
    }
}

export class Overwrite extends Base<OverwriteStructure> {
    public allow!: string;

    public deny!: string;

    public id!: Snowflake;

    public type!: OverwriteTypes;

    public constructor(data: Partial<OverwriteStructure>) {
        super(data);
    }

    protected patch(data: Partial<OverwriteStructure>): void {
        this.allow = data.allow ?? this.allow;
        this.deny = data.deny ?? this.deny;
        this.id = data.id ?? this.id;
        this.type = data.type ?? this.type;
    }
}

export class FollowedChannel extends Base<FollowedChannelStructure> {
    public channelId!: Snowflake;

    public webhookId!: Snowflake;

    public constructor(data: Partial<FollowedChannelStructure>) {
        super(data);
    }

    protected patch(data: Partial<FollowedChannelStructure>): void {
        this.channelId = data.channel_id ?? this.channelId;
        this.webhookId = data.webhook_id ?? this.webhookId;
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

    public permissionOverwrites?: Overwrite[];

    public permissions?: string;

    public position?: Integer;

    public rateLimitPerUser?: Integer;

    public topic?: string | null;

    public type!: ChannelTypes;

    public constructor(data: Partial<ChannelStructure>) {
        super(data);
    }

    protected patch(data: Partial<ChannelStructure>): void {
        if ("flags" in data) {
            this.flags = data.flags;
        }

        if ("guild_id" in data) {
            this.guildId = data.guild_id;
        }

        this.id = data.id ?? this.id;
        if ("last_message_id" in data) {
            this.lastMessageId = data.last_message_id;
        }

        if ("last_pin_timestamp" in data) {
            this.lastPinTimestamp = data.last_pin_timestamp;
        }

        if ("name" in data) {
            this.name = data.name;
        }

        this.nsfw = data.nsfw ?? this.nsfw;
        if ("parent_id" in data) {
            this.parentId = data.parent_id;
        }

        if ("permission_overwrites" in data && data.permission_overwrites) {
            this.permissionOverwrites = data.permission_overwrites.map((overwrite) => Overwrite.from(overwrite));
        }

        if ("permissions" in data) {
            this.permissions = data.permissions;
        }

        if ("position" in data) {
            this.position = data.position;
        }

        if ("rate_limit_per_user" in data) {
            this.rateLimitPerUser = data.rate_limit_per_user;
        }

        if ("topic" in data) {
            this.topic = data.topic;
        }

        this.type = data.type ?? this.type;
    }
}

export class TextChannel extends BaseChannel {}

export class DMChannel extends BaseChannel {
    public applicationId?: Snowflake;

    public icon?: string | null;

    public managed?: boolean;

    public ownerId?: Snowflake;

    public recipients?: User[];

    public constructor(data: Partial<ChannelStructure>) {
        super(data);
    }

    protected patch(data: Partial<ChannelStructure>): void {
        if ("application_id" in data) {
            this.applicationId = data.application_id;
        }

        if ("icon" in data) {
            this.icon = data.icon;
        }

        if ("managed" in data) {
            this.managed = data.managed;
        }

        if ("owner_id" in data) {
            this.ownerId = data.owner_id;
        }

        if ("recipients" in data && data.recipients) {
            this.recipients = data.recipients.map((recipient) => User.from(recipient));
        }
    }
}

export class VoiceChannel extends BaseChannel {
    public bitrate?: Integer;

    public rtcRegion?: string | null;

    public userLimit?: Integer;

    public videoQualityMode?: VideoQualityModes;

    public constructor(data: Partial<ChannelStructure>) {
        super(data);
    }

    protected patch(data: Partial<ChannelStructure>): void {
        if ("bitrate" in data) {
            this.bitrate = data.bitrate;
        }

        if ("rtc_region" in data) {
            this.rtcRegion = data.rtc_region;
        }

        if ("user_limit" in data) {
            this.userLimit = data.user_limit;
        }

        if ("video_quality_mode" in data) {
            this.videoQualityMode = data.video_quality_mode;
        }
    }
}

export class CategoryChannel extends BaseChannel {
    public constructor(data: Partial<ChannelStructure>) {
        super(data);
    }
}

export class AnnouncementChannel extends BaseChannel {
    public constructor(data: Partial<ChannelStructure>) {
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

    public threadMetadata?: ThreadMetadataStructure;

    public totalMessageSent?: Integer;

    public constructor(data: Partial<ChannelStructure>) {
        super(data);
    }

    protected patch(data: Partial<ChannelStructure>): void {
        if ("default_auto_archive_duration" in data) {
            this.defaultAutoArchiveDuration = data.default_auto_archive_duration;
        }

        if ("default_thread_rate_limit_per_user" in data) {
            this.defaultThreadRateLimitPerUser = data.default_thread_rate_limit_per_user;
        }

        if ("member" in data && data.member) {
            this.member = ThreadMember.from(data.member);
        }

        if ("member_count" in data) {
            this.memberCount = data.member_count;
        }

        if ("message_count" in data) {
            this.messageCount = data.message_count;
        }

        if ("owner_id" in data) {
            this.ownerId = data.owner_id;
        }

        if ("thread_metadata" in data) {
            this.threadMetadata = data.thread_metadata;
        }

        if ("total_message_sent" in data) {
            this.totalMessageSent = data.total_message_sent;
        }
    }
}

export class StageVoiceChannel extends BaseChannel {
    public constructor(data: Partial<ChannelStructure>) {
        super(data);
    }
}

export class DirectoryChannel extends BaseChannel {
    public constructor(data: Partial<ChannelStructure>) {
        super(data);
    }
}

export class ForumChannel extends BaseChannel {
    public appliedTags?: Snowflake[];

    public availableTags?: ForumTagStructure[];

    public defaultForumLayout?: ForumLayoutTypes;

    public defaultReactionEmoji?: DefaultReaction | null;

    public defaultSortOrder!: SortOrderTypes | null;

    public constructor(data: Partial<ChannelStructure>) {
        super(data);
    }

    protected patch(data: Partial<ChannelStructure>): void {
        if ("applied_tags" in data) {
            this.appliedTags = data.applied_tags;
        }

        if ("available_tags" in data) {
            this.availableTags = data.available_tags;
        }

        if ("default_forum_layout" in data) {
            this.defaultForumLayout = data.default_forum_layout;
        }

        if ("default_reaction_emoji" in data && data.default_reaction_emoji) {
            this.defaultReactionEmoji = DefaultReaction.from(data.default_reaction_emoji);
        }

        this.defaultSortOrder = data.default_sort_order ?? this.defaultSortOrder;
    }
}

export class MediaChannel extends BaseChannel {
    public appliedTags?: Snowflake[];

    public availableTags?: ForumTagStructure[];

    public defaultReactionEmoji?: DefaultReaction | null;

    public defaultSortOrder!: SortOrderTypes | null;

    public constructor(data: Partial<ChannelStructure>) {
        super(data);
    }

    protected patch(data: Partial<ChannelStructure>): void {
        if ("applied_tags" in data) {
            this.appliedTags = data.applied_tags;
        }

        if ("available_tags" in data) {
            this.availableTags = data.available_tags;
        }

        if ("default_reaction_emoji" in data && data.default_reaction_emoji) {
            this.defaultReactionEmoji = DefaultReaction.from(data.default_reaction_emoji);
        }

        this.defaultSortOrder = data.default_sort_order ?? this.defaultSortOrder;
    }
}
