import type { Snowflake } from "../markdown/index.js";
import type { GuildMemberEntity } from "./guild.entity.js";
import type { UserEntity } from "./user.entity.js";

/**
 * Type of channel permission overwrite.
 * Used to define whether a permission overwrite applies to a role or a member.
 * @see {@link https://discord.com/developers/docs/resources/channel#overwrite-object}
 */
export enum OverwriteType {
  /**
   * Role permission overwrite.
   * Applies permissions to all members with a specific role.
   */
  Role = 0,

  /**
   * Member permission overwrite.
   * Applies permissions to a specific guild member.
   */
  Member = 1,
}

/**
 * Layout types for forum channels.
 * Determines how posts are displayed in a forum channel.
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-forum-layout-types}
 */
export enum ForumLayoutType {
  /**
   * No default has been set for forum channel.
   */
  NotSet = 0,

  /**
   * Display posts as a list.
   * Shows forum posts in a traditional list view.
   */
  ListView = 1,

  /**
   * Display posts as a collection of tiles.
   * Shows forum posts as visual tiles similar to a gallery view.
   */
  GalleryView = 2,
}

/**
 * Sort order types for forum/media channels.
 * Determines how posts are sorted in forum and media channels.
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-sort-order-types}
 */
export enum SortOrderType {
  /**
   * Sort forum posts by activity.
   * Most recently active posts appear first.
   */
  LatestActivity = 0,

  /**
   * Sort forum posts by creation time (from most recent to oldest).
   * Most recently created posts appear first.
   */
  CreationDate = 1,
}

/**
 * Channel flags as a bitfield.
 * These flags provide additional configuration options for channels.
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-flags}
 */
export enum ChannelFlags {
  /**
   * Thread is pinned to the top of its parent forum/media channel.
   * Pinned threads appear above other threads regardless of sort order.
   */
  Pinned = 1 << 1,

  /**
   * Thread requires a tag to be specified when creating.
   * Forces users to select at least one tag when creating a thread in the channel.
   */
  RequireTag = 1 << 4,

  /**
   * When set hides the embedded media download options (media channels only).
   * Prevents users from downloading media directly from embeds.
   */
  HideMediaDownloadOptions = 1 << 15,
}

/**
 * Video quality modes for voice channels.
 * Determines the video quality settings for voice channels with video support.
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-video-quality-modes}
 */
export enum VideoQualityMode {
  /**
   * Discord chooses the quality for optimal performance.
   * Quality is adjusted dynamically based on network conditions.
   */
  Auto = 1,

  /**
   * 720p video quality.
   * Higher quality video but requires more bandwidth.
   */
  Full = 2,
}

/**
 * Channel types enumeration.
 * Defines all possible types of channels that can exist in Discord.
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export enum ChannelType {
  /**
   * A text channel within a server.
   * Standard text-based communication channel in a guild.
   */
  GuildText = 0,

  /**
   * A direct message between users.
   * Private one-to-one conversation between two users.
   */
  Dm = 1,

  /**
   * A voice channel within a server.
   * Channel for voice communication in a guild.
   */
  GuildVoice = 2,

  /**
   * A direct message between multiple users.
   * Private conversation between more than two users.
   */
  GroupDm = 3,

  /**
   * An organizational category that contains channels.
   * Container for organizing other channels, can hold up to 50 channels.
   */
  GuildCategory = 4,

  /**
   * A channel that users can follow and crosspost into their own server.
   * Formerly known as news channels, used for announcements that can be published to other servers.
   */
  GuildAnnouncement = 5,

  /**
   * A temporary sub-channel within a GUILD_ANNOUNCEMENT channel.
   * Thread attached to a message in an announcement channel.
   */
  AnnouncementThread = 10,

  /**
   * A temporary sub-channel within a GUILD_TEXT or GUILD_FORUM channel.
   * Public thread that anyone can see and join.
   */
  PublicThread = 11,

  /**
   * A temporary sub-channel within a GUILD_TEXT channel with limited access.
   * Private thread with restricted visibility and access.
   */
  PrivateThread = 12,

  /**
   * A voice channel for hosting events with an audience.
   * Special voice channel type for hosting presentations or events.
   */
  GuildStageVoice = 13,

  /**
   * The channel in a hub containing the listed servers.
   * Used for Discord Student Hubs to list associated servers.
   */
  GuildDirectory = 14,

  /**
   * Channel that can only contain threads.
   * Forum-style channel where each post is a thread.
   */
  GuildForum = 15,

  /**
   * Channel that can only contain threads, similar to GUILD_FORUM.
   * Media-focused version of the forum channel type.
   */
  GuildMedia = 16,
}

/**
 * Forum tag object structure.
 * Tags that can be applied to threads in forum and media channels.
 * @see {@link https://discord.com/developers/docs/resources/channel#forum-tag-object}
 */
export interface ForumTagEntity {
  /**
   * ID of the tag.
   * Unique identifier for the forum tag.
   */
  id: Snowflake;

  /**
   * Name of the tag (0-20 characters).
   * The display name shown to users.
   */
  name: string;

  /**
   * Whether this tag can only be added/removed by members with MANAGE_THREADS permission.
   * When true, only moderators can use this tag.
   */
  moderated: boolean;

  /**
   * ID of a guild's custom emoji, null if no emoji.
   * Custom emoji used as visual representation of the tag.
   */
  emoji_id: Snowflake | null;

  /**
   * Unicode character of the emoji, null if no emoji or if custom emoji is used.
   * Standard emoji used as visual representation of the tag.
   */
  emoji_name: string | null;
}

/**
 * Default reaction object for forum posts.
 * Specifies the emoji shown in the add reaction button on threads.
 * @see {@link https://discord.com/developers/docs/resources/channel#default-reaction-object}
 */
export interface DefaultReactionEntity {
  /**
   * ID of a guild's custom emoji, null if standard emoji.
   * Custom emoji ID to use as the default reaction.
   */
  emoji_id: Snowflake | null;

  /**
   * Unicode character of the emoji, null if custom emoji is used.
   * Standard emoji character to use as the default reaction.
   */
  emoji_name: string | null;
}

/**
 * Auto-archive duration options.
 * Valid durations in minutes for thread auto-archiving after inactivity.
 */
export type AutoArchiveDuration = 60 | 1440 | 4320 | 10080;

/**
 * Thread-specific metadata.
 * Additional information about a thread's status and configuration.
 * @see {@link https://discord.com/developers/docs/resources/channel#thread-metadata-object}
 */
export interface ThreadMetadataEntity {
  /**
   * Whether the thread is archived.
   * Archived threads are hidden from the active thread list.
   */
  archived: boolean;

  /**
   * Duration in minutes to automatically archive the thread after inactivity.
   * Thread will auto-archive after this many minutes without activity.
   */
  auto_archive_duration: AutoArchiveDuration;

  /**
   * Timestamp when the thread's archive status was last changed.
   * ISO8601 timestamp used for calculating recent activity.
   */
  archive_timestamp: string;

  /**
   * Whether the thread is locked.
   * When locked, only users with MANAGE_THREADS permission can unarchive it.
   */
  locked: boolean;

  /**
   * Whether non-moderators can add other non-moderators to a thread.
   * Only available on private threads.
   */
  invitable?: boolean;

  /**
   * Timestamp when the thread was created.
   * Only populated for threads created after January 9, 2022.
   */
  create_timestamp?: string | null;
}

/**
 * Represents a user's membership in a thread.
 * Tracks a user's participation and settings for a thread.
 * @see {@link https://discord.com/developers/docs/resources/channel#thread-member-object}
 */
export interface ThreadMemberEntity {
  /**
   * ID of the thread.
   * May be omitted in certain contexts.
   */
  id?: Snowflake;

  /**
   * ID of the user.
   * May be omitted in certain contexts.
   */
  user_id?: Snowflake;

  /**
   * Time the user last joined the thread.
   * ISO8601 timestamp of when they joined or were added.
   */
  join_timestamp: string;

  /**
   * User-thread settings, currently only used for notifications.
   * Bit flags for thread-specific user settings.
   */
  flags: number;

  /**
   * Additional information about the user.
   * Only included when specifically requested with with_member parameter.
   */
  member?: GuildMemberEntity;
}

/**
 * Channel permission overwrite object.
 * Defines custom permissions for roles or members in a channel.
 * @see {@link https://discord.com/developers/docs/resources/channel#overwrite-object}
 */
export interface OverwriteEntity {
  /**
   * Role or user ID.
   * The ID of the role or user this overwrite applies to.
   */
  id: Snowflake;

  /**
   * Type of overwrite: 0 for role or 1 for member.
   * Indicates whether this overwrite applies to a role or a specific member.
   */
  type: OverwriteType;

  /**
   * Permission bit set for allowed permissions.
   * Bitwise value of all permissions explicitly allowed.
   */
  allow: string;

  /**
   * Permission bit set for denied permissions.
   * Bitwise value of all permissions explicitly denied.
   */
  deny: string;
}

/**
 * Represents an announcement channel that has been followed.
 * Created when a user follows an announcement channel to send messages to a target channel.
 * @see {@link https://discord.com/developers/docs/resources/channel#followed-channel-object}
 */
export interface FollowedChannelEntity {
  /**
   * Source channel ID.
   * The original announcement channel that is being followed.
   */
  channel_id: Snowflake;

  /**
   * Created target webhook ID.
   * Webhook used to forward messages to the target channel.
   */
  webhook_id: Snowflake;
}

/**
 * Base channel structure for all channel types.
 * Contains fields that may be present in any kind of channel.
 * Many fields are optional as they only apply to specific channel types.
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-structure}
 */
export interface ChannelEntity {
  /**
   * The ID of this channel.
   * Unique snowflake identifier for the channel.
   */
  id: Snowflake;

  /**
   * The type of channel.
   * Determines the channel's functionality and available fields.
   */
  type: ChannelType;

  /**
   * The ID of the guild (may be missing for some channel objects).
   * The guild this channel belongs to, if applicable.
   */
  guild_id?: Snowflake;

  /**
   * Sorting position of the channel.
   * Determines the order in the channel list (lower appears first).
   */
  position?: number;

  /**
   * Explicit permission overwrites for members and roles.
   * Custom permissions that override guild-level permissions.
   */
  permission_overwrites?: OverwriteEntity[];

  /**
   * The name of the channel (1-100 characters).
   * Display name of the channel.
   */
  name?: string | null;

  /**
   * The channel topic (0-4096 characters for forums, 0-1024 for others).
   * Description or subject of the channel.
   */
  topic?: string;

  /**
   * Whether the channel is NSFW.
   * When true, content is age-restricted.
   */
  nsfw?: boolean;

  /**
   * ID of the last message sent in this channel.
   * May not point to an existing or valid message.
   */
  last_message_id?: Snowflake | null;

  /**
   * Bitrate (in bits) of the voice channel.
   * Audio quality setting for voice channels.
   */
  bitrate?: number;

  /**
   * User limit of the voice channel.
   * Maximum number of users allowed in the voice channel.
   */
  user_limit?: number;

  /**
   * Slowmode rate limit per user in seconds.
   * Time users must wait between sending messages (0-21600 seconds).
   */
  rate_limit_per_user?: number;

  /**
   * Recipients of the DM.
   * Users in a direct message or group.
   */
  recipients?: UserEntity[];

  /**
   * Icon hash of the group DM.
   * Custom image for group direct messages.
   */
  icon?: string | null;

  /**
   * ID of the creator of the group DM or thread.
   * User who created the channel.
   */
  owner_id?: Snowflake;

  /**
   * Application ID of the group DM creator if bot-created.
   * Present if a bot created the group DM.
   */
  application_id?: Snowflake;

  /**
   * Whether the channel is managed by an application.
   * True for channels created and managed by bots/apps.
   */
  managed?: boolean;

  /**
   * ID of the parent category or text channel for threads.
   * Category containing this channel or parent of a thread.
   */
  parent_id?: Snowflake | null;

  /**
   * When the last pinned message was pinned.
   * ISO8601 timestamp of the most recent pin action.
   */
  last_pin_timestamp?: string | null;

  /**
   * Voice region ID for the voice channel.
   * Server region for voice channels, null for automatic selection.
   */
  rtc_region?: string | null;

  /**
   * Camera video quality mode of the voice channel.
   * Video quality setting, defaulting to 1 (Auto) if not present.
   */
  video_quality_mode?: VideoQualityMode;

  /**
   * Number of messages in a thread (excluding the initial message).
   * Count of messages currently in the thread.
   */
  message_count?: number;

  /**
   * Approximate count of users in a thread (stops at 50).
   * Estimate of how many members are in the thread.
   */
  member_count?: number;

  /**
   * Thread-specific fields not needed by other channels.
   * Additional metadata specific to threads.
   */
  thread_metadata?: ThreadMetadataEntity;

  /**
   * Thread member object for the current user if joined.
   * Present if the current user is a member of the thread.
   */
  member?: ThreadMemberEntity;

  /**
   * Default auto archive duration for newly created threads.
   * How long until new threads auto-archive by default.
   */
  default_auto_archive_duration?: AutoArchiveDuration;

  /**
   * Computed permissions for the invoking user in the channel.
   * Permission bit set for the current user in this channel.
   */
  permissions?: string;

  /**
   * Channel flags combined as a bitfield.
   * Features and settings configured for this channel.
   */
  flags: ChannelFlags;

  /**
   * Total number of messages ever sent in a thread.
   * Unlike message_count, this doesn't decrease when messages are deleted.
   */
  total_message_sent?: number;

  /**
   * Set of tags that can be used in a forum or media channel.
   * Available tags for organizing threads in forum/media channels.
   */
  available_tags?: ForumTagEntity[];

  /**
   * IDs of tags applied to a thread in a forum or media channel.
   * Tags currently applied to this thread.
   */
  applied_tags?: Snowflake[];

  /**
   * Default emoji for the add reaction button on threads.
   * Emoji shown in the reaction button for new forum posts.
   */
  default_reaction_emoji?: DefaultReactionEntity | null;

  /**
   * Initial rate_limit_per_user to set on newly created threads.
   * Default slowmode setting for new threads in this channel.
   */
  default_thread_rate_limit_per_user?: number;

  /**
   * Default sort order for forum posts.
   * How threads are sorted in forum channels by default.
   */
  default_sort_order?: SortOrderType | null;

  /**
   * Default forum layout view.
   * How forum posts are displayed by default (list or gallery view).
   */
  default_forum_layout?: ForumLayoutType;
}

/**
 * Guild Text Channel - A text channel within a server.
 * Standard text-based communication channel in a guild.
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export interface GuildTextChannelEntity
  extends Omit<
    ChannelEntity,
    | "bitrate"
    | "user_limit"
    | "recipients"
    | "icon"
    | "owner_id"
    | "application_id"
    | "managed"
    | "thread_metadata"
    | "member"
    | "available_tags"
  > {
  /**
   * The type of channel - always GuildText (0).
   */
  type: ChannelType.GuildText;

  /**
   * The ID of the guild containing this channel.
   */
  guild_id: Snowflake;
}

/**
 * DM Channel - A direct message between users.
 * Private one-to-one conversation between two users.
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export interface DmChannelEntity
  extends Omit<
    ChannelEntity,
    | "guild_id"
    | "position"
    | "permission_overwrites"
    | "name"
    | "topic"
    | "nsfw"
    | "bitrate"
    | "user_limit"
    | "parent_id"
    | "rtc_region"
    | "video_quality_mode"
    | "thread_metadata"
    | "default_auto_archive_duration"
    | "available_tags"
  > {
  /**
   * The type of channel - always Dm (1).
   */
  type: ChannelType.Dm;

  /**
   * The users involved in this DM.
   * Usually contains exactly one recipient (the other user).
   */
  recipients: UserEntity[];
}

/**
 * Guild Voice Channel - A voice channel within a server.
 * Channel for voice communication in a guild.
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export interface GuildVoiceChannelEntity
  extends Omit<
    ChannelEntity,
    | "recipients"
    | "icon"
    | "owner_id"
    | "application_id"
    | "managed"
    | "thread_metadata"
    | "member"
    | "message_count"
    | "available_tags"
    | "applied_tags"
    | "default_reaction_emoji"
    | "default_thread_rate_limit_per_user"
    | "default_sort_order"
    | "default_forum_layout"
  > {
  /**
   * The type of channel - always GuildVoice (2).
   */
  type: ChannelType.GuildVoice;

  /**
   * The ID of the guild containing this channel.
   */
  guild_id: Snowflake;

  /**
   * Bitrate (in bits) of the voice channel.
   * Higher bitrates provide better audio quality but require more bandwidth.
   */
  bitrate: number;

  /**
   * User limit of the voice channel.
   * Maximum number of users allowed (0 means unlimited).
   */
  user_limit: number;
}

/**
 * Group DM Channel - A direct message between multiple users.
 * Private conversation between more than two users.
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export interface GroupDmChannelEntity
  extends Omit<
    ChannelEntity,
    | "guild_id"
    | "position"
    | "permission_overwrites"
    | "nsfw"
    | "bitrate"
    | "user_limit"
    | "parent_id"
    | "rate_limit_per_user"
    | "rtc_region"
    | "video_quality_mode"
    | "thread_metadata"
    | "default_auto_archive_duration"
    | "available_tags"
  > {
  /**
   * The type of channel - always GroupDm (3).
   */
  type: ChannelType.GroupDm;

  /**
   * The users involved in this group DM.
   * Contains all users in the group conversation.
   */
  recipients: UserEntity[];

  /**
   * ID of the creator of the group DM.
   * The user who created the group message.
   */
  owner_id: Snowflake;
}

/**
 * Guild Category Channel - An organizational category that contains channels.
 * Container for grouping and organizing other channels.
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export interface GuildCategoryChannelEntity
  extends Omit<
    ChannelEntity,
    | "topic"
    | "last_message_id"
    | "bitrate"
    | "user_limit"
    | "rate_limit_per_user"
    | "recipients"
    | "icon"
    | "owner_id"
    | "application_id"
    | "managed"
    | "parent_id"
    | "last_pin_timestamp"
    | "rtc_region"
    | "video_quality_mode"
    | "message_count"
    | "member_count"
    | "thread_metadata"
    | "member"
    | "default_auto_archive_duration"
    | "available_tags"
  > {
  /**
   * The type of channel - always GuildCategory (4).
   */
  type: ChannelType.GuildCategory;

  /**
   * The ID of the guild containing this category.
   */
  guild_id: Snowflake;
}

/**
 * Guild Announcement Channel - A channel that users can follow and crosspost into their own server.
 * Used for important announcements that can be published to other servers.
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export interface GuildAnnouncementChannelEntity
  extends Omit<
    ChannelEntity,
    | "bitrate"
    | "user_limit"
    | "rate_limit_per_user"
    | "recipients"
    | "icon"
    | "owner_id"
    | "application_id"
    | "managed"
    | "rtc_region"
    | "video_quality_mode"
    | "message_count"
    | "member_count"
    | "thread_metadata"
    | "member"
    | "available_tags"
    | "applied_tags"
    | "default_reaction_emoji"
    | "default_thread_rate_limit_per_user"
    | "default_sort_order"
    | "default_forum_layout"
  > {
  /**
   * The type of channel - always GuildAnnouncement (5).
   */
  type: ChannelType.GuildAnnouncement;

  /**
   * The ID of the guild containing this announcement channel.
   */
  guild_id: Snowflake;
}

/**
 * Public Thread Channel - A temporary sub-channel within a GUILD_TEXT or GUILD_FORUM channel.
 * Public thread that anyone can see and join.
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export interface PublicThreadChannelEntity
  extends Omit<
    ChannelEntity,
    | "permission_overwrites"
    | "topic"
    | "bitrate"
    | "user_limit"
    | "recipients"
    | "icon"
    | "application_id"
    | "managed"
    | "rtc_region"
    | "video_quality_mode"
    | "default_auto_archive_duration"
    | "default_forum_layout"
  > {
  /**
   * The type of channel - always PublicThread (11).
   */
  type: ChannelType.PublicThread;

  /**
   * The ID of the guild containing this thread.
   */
  guild_id: Snowflake;

  /**
   * Thread-specific metadata like archive status.
   */
  thread_metadata: ThreadMetadataEntity;

  /**
   * ID of the parent text channel or forum channel.
   */
  parent_id: Snowflake;
}

/**
 * Private Thread Channel - A temporary sub-channel within a GUILD_TEXT channel with limited access.
 * Thread with restricted visibility that requires an invite to join.
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export interface PrivateThreadChannelEntity
  extends Omit<
    ChannelEntity,
    | "permission_overwrites"
    | "topic"
    | "bitrate"
    | "user_limit"
    | "recipients"
    | "icon"
    | "application_id"
    | "managed"
    | "rtc_region"
    | "video_quality_mode"
    | "default_auto_archive_duration"
    | "default_forum_layout"
  > {
  /**
   * The type of channel - always PrivateThread (12).
   */
  type: ChannelType.PrivateThread;

  /**
   * The ID of the guild containing this thread.
   */
  guild_id: Snowflake;

  /**
   * Thread-specific metadata like archive status.
   */
  thread_metadata: ThreadMetadataEntity;

  /**
   * ID of the parent text channel.
   */
  parent_id: Snowflake;

  /**
   * Whether non-moderators can add other non-moderators to the thread.
   * Controls who can invite others to private threads.
   */
  invitable?: boolean;
}

/**
 * Announcement Thread Channel - A temporary sub-channel within a GUILD_ANNOUNCEMENT channel.
 * Thread created from an announcement message.
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export interface AnnouncementThreadChannelEntity
  extends Omit<
    ChannelEntity,
    | "permission_overwrites"
    | "topic"
    | "bitrate"
    | "user_limit"
    | "recipients"
    | "icon"
    | "application_id"
    | "managed"
    | "rtc_region"
    | "video_quality_mode"
    | "default_auto_archive_duration"
    | "default_forum_layout"
  > {
  /**
   * The type of channel - always AnnouncementThread (10).
   */
  type: ChannelType.AnnouncementThread;

  /**
   * The ID of the guild containing this thread.
   */
  guild_id: Snowflake;

  /**
   * Thread-specific metadata like archive status.
   */
  thread_metadata: ThreadMetadataEntity;

  /**
   * ID of the parent announcement channel.
   */
  parent_id: Snowflake;
}

/**
 * Guild Stage Voice Channel - A voice channel for hosting events with an audience.
 * Special voice channel for presentations, talks, or performances.
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export interface GuildStageVoiceChannelEntity
  extends Omit<
    ChannelEntity,
    | "last_message_id"
    | "recipients"
    | "icon"
    | "owner_id"
    | "application_id"
    | "managed"
    | "thread_metadata"
    | "member"
    | "message_count"
    | "member_count"
    | "default_auto_archive_duration"
    | "available_tags"
    | "applied_tags"
    | "default_reaction_emoji"
    | "default_thread_rate_limit_per_user"
    | "default_sort_order"
    | "default_forum_layout"
  > {
  /**
   * The type of channel - always GuildStageVoice (13).
   */
  type: ChannelType.GuildStageVoice;

  /**
   * The ID of the guild containing this stage channel.
   */
  guild_id: Snowflake;

  /**
   * Bitrate (in bits) of the stage channel.
   * Audio quality setting.
   */
  bitrate: number;

  /**
   * User limit of the stage channel.
   * Maximum number of users allowed on stage.
   */
  user_limit: number;
}

/**
 * Guild Forum Channel - Channel that can only contain threads.
 * Forum-style channel where each post creates a new thread.
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export interface GuildForumChannelEntity
  extends Omit<
    ChannelEntity,
    | "bitrate"
    | "user_limit"
    | "recipients"
    | "icon"
    | "owner_id"
    | "application_id"
    | "managed"
    | "rtc_region"
    | "video_quality_mode"
    | "message_count"
    | "member_count"
    | "thread_metadata"
    | "member"
    | "last_message_id"
  > {
  /**
   * The type of channel - always GuildForum (15).
   */
  type: ChannelType.GuildForum;

  /**
   * The ID of the guild containing this forum channel.
   */
  guild_id: Snowflake;

  /**
   * Set of tags that can be used in this forum channel.
   * Tags available for organizing threads.
   */
  available_tags: ForumTagEntity[];
}

/**
 * Guild Media Channel - Channel that can only contain threads, similar to GUILD_FORUM.
 * Media-focused version of the forum channel.
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export interface GuildMediaChannelEntity
  extends Omit<
    ChannelEntity,
    | "bitrate"
    | "user_limit"
    | "recipients"
    | "icon"
    | "owner_id"
    | "application_id"
    | "managed"
    | "rtc_region"
    | "video_quality_mode"
    | "message_count"
    | "member_count"
    | "thread_metadata"
    | "member"
    | "last_message_id"
    | "default_forum_layout"
  > {
  /**
   * The type of channel - always GuildMedia (16).
   */
  type: ChannelType.GuildMedia;

  /**
   * The ID of the guild containing this media channel.
   */
  guild_id: Snowflake;

  /**
   * Set of tags that can be used in this media channel.
   * Tags available for organizing threads.
   */
  available_tags: ForumTagEntity[];
}

/**
 * Union type to represent any thread channel entity.
 */
export type AnyThreadChannelEntity =
  | PublicThreadChannelEntity
  | PrivateThreadChannelEntity
  | AnnouncementThreadChannelEntity;

/**
 * Union type of all channel types with discriminated union pattern.
 * Can be any of the supported Discord channel types.
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-structure}
 */
export type AnyChannelEntity =
  | GuildTextChannelEntity
  | DmChannelEntity
  | GuildVoiceChannelEntity
  | GroupDmChannelEntity
  | GuildCategoryChannelEntity
  | GuildAnnouncementChannelEntity
  | GuildStageVoiceChannelEntity
  | GuildForumChannelEntity
  | GuildMediaChannelEntity
  | AnyThreadChannelEntity;
