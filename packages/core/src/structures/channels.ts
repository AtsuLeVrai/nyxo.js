import type { BitwisePermissions } from "../enums/permissions";
import type { BitfieldResolvable } from "../libs/bitfield";
import type { Integer, Iso8601Timestamp, Snowflake } from "../libs/types";
import type { GuildMemberStructure } from "./guilds";
import type { UserStructure } from "./users";

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#forum-tag-object-forum-tag-structure|Forum Tag Structure}
 */
export type ForumTagStructure = {
    /**
     * The id of a guild's custom emoji
     */
    emoji_id: Snowflake | null;
    /**
     * The unicode character of the emoji
     */
    emoji_name: string | null;
    /**
     * The id of the tag
     */
    id: Snowflake;
    /**
     * Whether this tag can only be added to or removed from threads by a member with the MANAGE_THREADS permission
     */
    moderated: boolean;
    /**
     * The name of the tag (0-20 characters)
     */
    name: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#default-reaction-object-default-reaction-structure|Default Reaction Structure}
 */
export type DefaultReactionStructure = {
    /**
     * The id of a guild's custom emoji
     */
    emoji_id: Snowflake | null;
    /**
     * The unicode character of the emoji
     */
    emoji_name: string | null;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#thread-member-object-thread-member-structure|Thread Member Structure}
 */
export type ThreadMemberStructure = {
    /**
     * Any user-thread settings, currently only used for notifications
     */
    flags: Integer;
    /**
     * ID of the thread
     */
    id?: Snowflake;
    /**
     * Time the user last joined the thread
     */
    join_timestamp: Iso8601Timestamp;
    /**
     * Additional information about the user
     */
    member?: GuildMemberStructure;
    /**
     * ID of the user
     */
    user_id?: Snowflake;
};

/**
 * Enumeration of overwrite types in Discord.
 */
export enum OverwriteTypes {
    Role = 0,
    Member = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#overwrite-object-overwrite-structure|Overwrite Structure}
 */
export type OverwriteStructure = {
    /**
     * Permission bit set
     */
    allow: BitfieldResolvable<BitwisePermissions>;
    /**
     * Permission bit set
     */
    deny: BitfieldResolvable<BitwisePermissions>;
    /**
     * Role or user id
     */
    id: Snowflake;
    /**
     * Either 0 (role) or 1 (member)
     */
    type: OverwriteTypes;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#followed-channel-object-followed-channel-structure|Followed Channel Structure}
 */
export type FollowedChannelStructure = {
    /**
     * Source channel id
     */
    channel_id: Snowflake;
    /**
     * Created target webhook id
     */
    webhook_id: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-forum-layout-types|Forum Layout Types}
 */
export enum ForumLayoutTypes {
    /**
     * No default has been set for forum channel
     */
    NotSet = 0,
    /**
     * Display posts as a list
     */
    ListView = 1,
    /**
     * Display posts as a collection of tiles
     */
    GalleryView = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-sort-order-types|Sort Order Types}
 */
export enum SortOrderTypes {
    /**
     * Sort forum posts by activity
     */
    LatestActivity = 0,
    /**
     * Sort forum posts by creation time (from most recent to oldest)
     */
    CreationDate = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-flags|Channel Flags}
 */
export enum ChannelFlags {
    /**
     * This thread is pinned to the top of its parent GUILD_FORUM or GUILD_MEDIA channel
     */
    Pinned = 2,
    /**
     * Whether a tag is required to be specified when creating a thread in a GUILD_FORUM or a GUILD_MEDIA channel. Tags are specified in the applied_tags field.
     */
    RequireTag = 16,
    /**
     * When set hides the embedded media download options. Available only for media channels
     */
    HideMediaDownloadOptions = 32_768,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-video-quality-modes|Video Quality Modes}
 */
export enum VideoQualityModes {
    /**
     * Discord chooses the quality for optimal performance
     */
    Auto = 1,
    /**
     * 720p
     */
    Full = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types|Channel Types}
 */
export enum ChannelTypes {
    /**
     * A text channel within a server
     */
    GuildText = 0,
    /**
     * A direct message between users
     */
    DM = 1,
    /**
     * A voice channel within a server
     */
    GuildVoice = 2,
    /**
     * A direct message between multiple users
     */
    GroupDM = 3,
    /**
     * An organizational category that contains up to 50 channels
     */
    GuildCategory = 4,
    /**
     * A channel that users can follow and crosspost into their own server
     */
    GuildAnnouncement = 5,
    /**
     * A temporary sub-channel within a GUILD_ANNOUNCEMENT channel
     */
    AnnouncementThread = 10,
    /**
     * A temporary sub-channel within a GUILD_TEXT or GUILD_FORUM channel
     */
    PublicThread = 11,
    /**
     * A temporary sub-channel within a GUILD_TEXT channel that is only viewable by those invited and those with the MANAGE_THREADS permission
     */
    PrivateThread = 12,
    /**
     * A voice channel for hosting events with an audience
     */
    GuildStageVoice = 13,
    /**
     * The channel in a hub containing the listed servers
     */
    GuildDirectory = 14,
    /**
     * Channel that can only contain threads
     */
    GuildForum = 15,
    /**
     * Channel that can only contain threads, similar to GUILD_FORUM channels
     */
    GuildMedia = 16,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-structure|Channel Structure}
 */
export type ChannelStructure = {
    /**
     * Application id of the group DM creator if it is bot-created
     */
    application_id?: Snowflake;
    /**
     * The IDs of the set of tags that have been applied to a thread in a GUILD_FORUM or a GUILD_MEDIA channel
     */
    applied_tags?: Snowflake[];
    /**
     * The set of tags that can be used in a GUILD_FORUM or a GUILD_MEDIA channel
     */
    available_tags?: ForumTagStructure[];
    /**
     * The bitrate (in bits) of the voice channel
     */
    bitrate?: Integer;
    /**
     * Default duration, copied onto newly created threads, in minutes, threads will stop showing in the channel list after the specified period of inactivity, can be set to: 60, 1440, 4320, 10080
     */
    default_auto_archive_duration?: Integer;
    /**
     * The default forum layout view used to display posts in GUILD_FORUM channels. Defaults to 0, which indicates a layout view has not been set by a channel admin
     */
    default_forum_layout?: ForumLayoutTypes;
    /**
     * The emoji to show in the add reaction button on a thread in a GUILD_FORUM or a GUILD_MEDIA channel
     */
    default_reaction_emoji?: DefaultReactionStructure | null;
    /**
     * The default sort order type used to order posts in GUILD_FORUM and GUILD_MEDIA channels. Defaults to null, which indicates a preferred sort order hasn't been set by a channel admin
     */
    default_sort_order?: SortOrderTypes | null;
    /**
     * The initial rate_limit_per_user to set on newly created threads in a channel. this field is copied to the thread at creation time and does not live update.
     */
    default_thread_rate_limit_per_user?: Integer;
    /**
     * Channel flags combined as a bitfield
     */
    flags?: BitfieldResolvable<ChannelFlags>;
    /**
     * The id of the guild (may be missing for some channel objects received over gateway guild dispatches)
     */
    guild_id?: Snowflake;
    /**
     * Icon hash of the group DM
     */
    icon?: string | null;
    /**
     * The id of this channel
     */
    id: Snowflake;
    /**
     * The id of the last message sent in this channel (or thread for GUILD_FORUM or GUILD_MEDIA channels) (may not point to an existing or valid message or thread)
     */
    last_message_id?: Snowflake | null;
    /**
     * When the last pinned message was pinned. This may be null in events such as GUILD_CREATE when a message is not pinned.
     */
    last_pin_timestamp?: Iso8601Timestamp | null;
    /**
     * For group DM channels: whether the channel is managed by an application via the gdm.join OAuth2 scope
     */
    managed?: boolean;
    /**
     * Thread member object for the current user, if they have joined the thread, only included on certain API endpoints
     */
    member?: ThreadMemberStructure;
    /**
     * An approximate count of users in a thread, stops counting at 50
     */
    member_count?: Integer;
    /**
     * Number of messages (not including the initial message or deleted messages) in a thread.
     */
    message_count?: Integer;
    /**
     * The name of the channel (1-100 characters)
     */
    name?: string | null;
    /**
     * Whether the channel is nsfw
     */
    nsfw?: boolean;
    /**
     * ID of the creator of the group DM or thread
     */
    owner_id?: Snowflake;
    /**
     * For guild channels: id of the parent category for a channel (each parent category can contain up to 50 channels), for threads: id of the text channel this thread was created
     */
    parent_id?: Snowflake | null;
    /**
     * Explicit permission overwrites for members and roles
     */
    permission_overwrites?: OverwriteStructure[];
    /**
     * Computed permissions for the invoking user in the channel, including overwrites, only included when part of the resolved data received on a slash command interaction. This does not include implicit permissions, which may need to be checked separately
     *
     * @todo I don't know this must be a string or a BitfieldResolvable<BitwisePermissions>
     */
    permissions?: string;
    /**
     * Sorting position of the channel (channels with the same position are sorted by id)
     */
    position?: Integer;
    /**
     * Amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the permission manage_messages or manage_channel, are unaffected
     */
    rate_limit_per_user?: Integer;
    /**
     * The recipients of the DM
     */
    recipients?: UserStructure[];
    /**
     * Voice region id for the voice channel, automatic when set to null
     */
    rtc_region?: string | null;
    /**
     * @todo Thread-specific fields not needed by other channels
     */
    thread_metadata?: any;
    /**
     * The channel topic (0-4096 characters for GUILD_FORUM and GUILD_MEDIA channels, 0-1024 characters for all others)
     */
    topic?: string | null;
    /**
     * Number of messages ever sent in a thread, it's similar to message_count on message creation, but will not decrement the number when a message is deleted
     */
    total_message_sent?: Integer;
    /**
     * The type of channel
     */
    type: ChannelTypes;
    /**
     * The user limit of the voice channel
     */
    user_limit?: Integer;
    /**
     * The camera video quality mode of the voice channel, 1 when not present
     */
    video_quality_mode?: VideoQualityModes;
};
